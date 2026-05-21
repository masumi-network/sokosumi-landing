import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORG = "masumi-network";
// How many of the most-recently-pushed repos to surface in the feed.
const REPO_LIMIT = 12;
// Commits per repo. Total commits before sorting: REPO_LIMIT * COMMITS_PER_REPO.
const COMMITS_PER_REPO = 5;
// Commits we actually return after merging + sorting all repos.
const FEED_LIMIT = 30;
// Server-side cache TTL. Unauthenticated GitHub gives 60 req/hr per IP, so
// with ~13 calls per refresh we want at least ~5 refreshes/hr → 12 min.
const CACHE_TTL_MS = 10 * 60 * 1000;

type Repo = {
  name: string;
  htmlUrl: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
};

type Commit = {
  sha: string;
  shortSha: string;
  message: string;
  url: string;
  date: string;
  author: {
    name: string;
    login: string | null;
    avatarUrl: string | null;
  };
  repo: Repo;
};

type FeedResponse = {
  commits: Commit[];
  repos: Repo[];
  updatedAt: string;
  rateLimitRemaining: number | null;
};

let cache: { data: FeedResponse; expiresAt: number } | null = null;
let inflight: Promise<FeedResponse> | null = null;

function ghHeaders(): HeadersInit {
  const h: HeadersInit = {
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    "user-agent": "masumi-landing-explorer",
  };
  if (process.env.GITHUB_TOKEN) {
    (h as Record<string, string>).authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

async function ghFetch<T>(url: string): Promise<{ data: T; remaining: number | null }> {
  const res = await fetch(url, { headers: ghHeaders(), cache: "no-store" });
  const remaining = Number(res.headers.get("x-ratelimit-remaining"));
  if (!res.ok) {
    throw new Error(`GitHub ${res.status} ${res.statusText} for ${url}`);
  }
  return { data: (await res.json()) as T, remaining: Number.isFinite(remaining) ? remaining : null };
}

async function buildFeed(): Promise<FeedResponse> {
  let rateLimitRemaining: number | null = null;

  // 1) Repos in the org, most-recently-pushed first.
  type RawRepo = {
    name: string;
    html_url: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    pushed_at: string;
    archived: boolean;
    fork: boolean;
  };
  const repos = await ghFetch<RawRepo[]>(
    `https://api.github.com/orgs/${ORG}/repos?per_page=100&sort=pushed&direction=desc`,
  );
  rateLimitRemaining = repos.remaining;

  const topRepos: Repo[] = repos.data
    .filter((r) => !r.archived && !r.fork)
    .slice(0, REPO_LIMIT)
    .map((r) => ({
      name: r.name,
      htmlUrl: r.html_url,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
    }));

  // 2) Commits per repo (in parallel).
  type RawCommit = {
    sha: string;
    html_url: string;
    commit: {
      message: string;
      author: { name: string; date: string };
    };
    author: { login: string; avatar_url: string } | null;
  };

  const commitResults = await Promise.allSettled(
    topRepos.map((r) =>
      ghFetch<RawCommit[]>(
        `https://api.github.com/repos/${ORG}/${r.name}/commits?per_page=${COMMITS_PER_REPO}`,
      ).then((res) => ({ repo: r, commits: res.data, remaining: res.remaining })),
    ),
  );

  const allCommits: Commit[] = [];
  for (const result of commitResults) {
    if (result.status !== "fulfilled") continue;
    const { repo, commits, remaining } = result.value;
    if (remaining != null) rateLimitRemaining = remaining;
    for (const c of commits) {
      allCommits.push({
        sha: c.sha,
        shortSha: c.sha.slice(0, 7),
        message: c.commit.message.split("\n")[0],
        url: c.html_url,
        date: c.commit.author.date,
        author: {
          name: c.commit.author.name,
          login: c.author?.login ?? null,
          avatarUrl: c.author?.avatar_url ?? null,
        },
        repo,
      });
    }
  }

  allCommits.sort((a, b) => (a.date < b.date ? 1 : -1));

  return {
    commits: allCommits.slice(0, FEED_LIMIT),
    repos: topRepos,
    updatedAt: new Date().toISOString(),
    rateLimitRemaining,
  };
}

export async function GET() {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return NextResponse.json(cache.data);
  }

  // De-dupe concurrent rebuilds — multiple page loads after expiry would
  // otherwise burn N parallel GitHub batches.
  if (!inflight) {
    inflight = buildFeed()
      .then((data) => {
        cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }

  try {
    const data = await inflight;
    return NextResponse.json(data);
  } catch (e) {
    // On error, prefer serving the last good cache over erroring.
    if (cache) return NextResponse.json(cache.data, { headers: { "x-cache-stale": "true" } });
    const message = e instanceof Error ? e.message : "Failed to fetch GitHub feed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
