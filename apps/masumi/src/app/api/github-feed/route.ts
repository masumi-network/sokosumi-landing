import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORG = "masumi-network";
// How many of the most-recently-pushed repos to surface in the feed + stats.
const REPO_LIMIT = 12;
// Commits per repo for the feed.
const COMMITS_PER_REPO = 5;
// Commits we actually return after merging + sorting all repos.
const FEED_LIMIT = 30;
// Most-active repos shown in the stats panel.
const TOP_ACTIVE_REPOS = 5;
// The "headline" window for total/avg/most-active stats.
const HEADLINE_DAYS = 28;
// Sparkline window — grouped weekly from the recent commits we already
// fetched. Limited by how far back the commit feed extends.
const SPARKLINE_WEEKS = 12;
// Server-side cache TTL. With GITHUB_TOKEN (5000/hr) we can refresh
// aggressively; without it we want at least ~5 refreshes/hr → 12 min.
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

type RepoActivity = {
  name: string;
  htmlUrl: string;
  language: string | null;
  commits: number;
};

type FeedStats = {
  totalCommits: number;
  avgPerDay: number;
  headlineDays: number;
  sparklineWeeks: number;
  topRepos: RepoActivity[];
  weeklyTotals: number[]; // org-wide, oldest first
};

type FeedResponse = {
  commits: Commit[];
  repos: Repo[];
  stats: FeedStats;
  updatedAt: string;
  rateLimitRemaining: number | null;
};

let cache: { data: FeedResponse; expiresAt: number } | null = null;
let inflight: Promise<FeedResponse> | null = null;

function ghHeaders(): HeadersInit {
  const h: Record<string, string> = {
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    "user-agent": "masumi-landing-explorer",
    "content-type": "application/json",
  };
  if (process.env.GITHUB_TOKEN) {
    h.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

type GraphQLRepoNode = {
  name: string;
  url: string;
  description: string | null;
  stargazerCount: number;
  pushedAt: string;
  primaryLanguage: { name: string } | null;
  defaultBranchRef: {
    target: {
      recent: { totalCount: number } | null;
      feed: {
        nodes: Array<{
          oid: string;
          message: string;
          url: string;
          committedDate: string;
          author: {
            name: string;
            user: { login: string; avatarUrl: string } | null;
          };
        }>;
      } | null;
    };
  } | null;
};

type GraphQLResponse = {
  data?: {
    organization: {
      repositories: {
        nodes: GraphQLRepoNode[];
      };
    };
  };
  errors?: Array<{ message: string }>;
};

async function buildFeed(): Promise<FeedResponse> {
  const since4w = new Date(Date.now() - HEADLINE_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // One GraphQL query: repos + per-repo 4-week commit count + recent commits.
  // Replaces the REST repos/commits/stats triple-round-trip and the
  // unreliable /stats/commit_activity endpoint (which 202s for minutes).
  const query = `
    query Feed($org: String!, $repoLimit: Int!, $commits: Int!, $since: GitTimestamp!) {
      organization(login: $org) {
        repositories(
          first: $repoLimit
          orderBy: {field: PUSHED_AT, direction: DESC}
          isArchived: false
          isFork: false
        ) {
          nodes {
            name
            url
            description
            stargazerCount
            pushedAt
            primaryLanguage { name }
            defaultBranchRef {
              target {
                ... on Commit {
                  recent: history(since: $since) { totalCount }
                  feed: history(first: $commits) {
                    nodes {
                      oid
                      message
                      url
                      committedDate
                      author {
                        name
                        user { login avatarUrl }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: ghHeaders(),
    cache: "no-store",
    body: JSON.stringify({
      query,
      variables: {
        org: ORG,
        repoLimit: REPO_LIMIT,
        commits: COMMITS_PER_REPO,
        since: since4w,
      },
    }),
  });

  const rateLimitRemaining = (() => {
    const v = Number(res.headers.get("x-ratelimit-remaining"));
    return Number.isFinite(v) ? v : null;
  })();

  if (!res.ok) {
    throw new Error(`GitHub GraphQL ${res.status} ${res.statusText}`);
  }

  const body = (await res.json()) as GraphQLResponse;
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }
  if (!body.data) {
    throw new Error("GraphQL response missing data");
  }

  const repoNodes = body.data.organization.repositories.nodes;

  const topRepos: Repo[] = repoNodes.map((r) => ({
    name: r.name,
    htmlUrl: r.url,
    description: r.description,
    language: r.primaryLanguage?.name ?? null,
    stars: r.stargazerCount,
    pushedAt: r.pushedAt,
  }));

  const allCommits: Commit[] = [];
  const activity: RepoActivity[] = [];

  for (let i = 0; i < repoNodes.length; i++) {
    const node = repoNodes[i];
    const repoMeta = topRepos[i];
    const target = node.defaultBranchRef?.target;
    if (!target) continue;

    const commitsCount = target.recent?.totalCount ?? 0;
    activity.push({
      name: repoMeta.name,
      htmlUrl: repoMeta.htmlUrl,
      language: repoMeta.language,
      commits: commitsCount,
    });

    for (const c of target.feed?.nodes ?? []) {
      allCommits.push({
        sha: c.oid,
        shortSha: c.oid.slice(0, 7),
        message: c.message.split("\n")[0],
        url: c.url,
        date: c.committedDate,
        author: {
          name: c.author.name,
          login: c.author.user?.login ?? null,
          avatarUrl: c.author.user?.avatarUrl ?? null,
        },
        repo: repoMeta,
      });
    }
  }

  allCommits.sort((a, b) => (a.date < b.date ? 1 : -1));
  activity.sort((a, b) => b.commits - a.commits);

  // Org-wide weekly totals — bucket the recent commits we already have.
  // This is approximate: a repo with >COMMITS_PER_REPO commits in a week
  // will be undercounted, so old weeks tend to look slimmer than recent
  // ones. Good enough for a visual.
  const weeklyTotals = new Array(SPARKLINE_WEEKS).fill(0);
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  for (const c of allCommits) {
    const age = now - new Date(c.date).getTime();
    const weeksAgo = Math.floor(age / weekMs);
    if (weeksAgo < 0 || weeksAgo >= SPARKLINE_WEEKS) continue;
    weeklyTotals[SPARKLINE_WEEKS - 1 - weeksAgo] += 1;
  }

  const totalCommits = activity.reduce((a, r) => a + r.commits, 0);
  const avgPerDay = Math.round((totalCommits / HEADLINE_DAYS) * 10) / 10;

  return {
    commits: allCommits.slice(0, FEED_LIMIT),
    repos: topRepos,
    stats: {
      totalCommits,
      avgPerDay,
      headlineDays: HEADLINE_DAYS,
      sparklineWeeks: SPARKLINE_WEEKS,
      topRepos: activity.slice(0, TOP_ACTIVE_REPOS),
      weeklyTotals,
    },
    updatedAt: new Date().toISOString(),
    rateLimitRemaining,
  };
}

export async function GET() {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return NextResponse.json(cache.data);
  }

  // De-dupe concurrent rebuilds.
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
    if (cache) return NextResponse.json(cache.data, { headers: { "x-cache-stale": "true" } });
    const message = e instanceof Error ? e.message : "Failed to fetch GitHub feed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
