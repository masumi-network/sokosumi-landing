import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORG = "masumi-network";
// How many repos to pull in total. Org currently has ~40 public repos;
// 50 covers headroom. Archived/forked repos are filtered out by GraphQL.
const REPO_LIMIT = 50;
// Commits per repo to keep for the merged feed.
const COMMITS_PER_REPO = 5;
// Commits we actually return after merging + sorting all repos.
const FEED_LIMIT = 30;
// Most-active repos shown in the stats panel.
const TOP_ACTIVE_REPOS = 5;
// The "headline" window for total/avg/most-active stats.
const HEADLINE_DAYS = 28;
// Sparkline window — built from real per-week commit counts via GraphQL
// alias trick. Each week = one totalCount sub-query per repo.
const SPARKLINE_WEEKS = 12;
// Server-side cache TTL.
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

type RepoListing = Repo & {
  commits28d: number;
};

type FeedStats = {
  totalCommits: number;
  avgPerDay: number;
  headlineDays: number;
  sparklineWeeks: number;
  topRepos: RepoListing[];
  weeklyTotals: number[]; // org-wide, oldest first
};

type FeedResponse = {
  commits: Commit[];
  repos: Repo[];        // the repos that contributed to the feed (top by pushed)
  allRepos: RepoListing[]; // every active repo in the org with its 28d count
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

type WeekBucket = { totalCount: number };

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
    } | null;
  } | null;
};

function startOfWeekUtc(d: Date): Date {
  const out = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = out.getUTCDay(); // 0 = Sun
  out.setUTCDate(out.getUTCDate() - dow);
  return out;
}

// How many repos to fetch per-week commit counts for. Combining the full
// 50-repo listing with 12 week aliases each blows past GitHub's GraphQL
// complexity ceiling (~502 Bad Gateway), so the sparkline is sourced
// from just the most-active subset.
const SPARKLINE_REPO_LIMIT = 15;

async function ghGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<{ data: T; remaining: number | null }> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: ghHeaders(),
    cache: "no-store",
    body: JSON.stringify({ query, variables }),
  });
  const v = Number(res.headers.get("x-ratelimit-remaining"));
  const remaining = Number.isFinite(v) ? v : null;
  if (!res.ok) throw new Error(`GitHub GraphQL ${res.status} ${res.statusText}`);
  const body = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }
  if (!body.data) throw new Error("GraphQL response missing data");
  return { data: body.data, remaining };
}

async function buildFeed(): Promise<FeedResponse> {
  const now = new Date();
  // Anchor weeks to UTC Sunday boundaries so weeks line up cleanly.
  const thisWeekStart = startOfWeekUtc(now);
  const weekRanges: Array<{ since: string; until: string }> = [];
  for (let i = SPARKLINE_WEEKS - 1; i >= 0; i--) {
    const start = new Date(thisWeekStart.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    weekRanges.push({ since: start.toISOString(), until: end.toISOString() });
  }
  const since4w = new Date(now.getTime() - HEADLINE_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Query 1 — repo listing with 28-day count + 5 recent commits each.
  const listQuery = `
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

  let rateLimitRemaining: number | null = null;
  const listResult = await ghGraphQL<{
    organization: { repositories: { nodes: GraphQLRepoNode[] } };
  }>(listQuery, {
    org: ORG,
    repoLimit: REPO_LIMIT,
    commits: COMMITS_PER_REPO,
    since: since4w,
  });
  rateLimitRemaining = listResult.remaining;

  const repoNodes = listResult.data.organization.repositories.nodes;

  // Build the listings + collect commits.
  const allCommits: Commit[] = [];
  const allRepos: RepoListing[] = [];

  for (const node of repoNodes) {
    const repoMeta: Repo = {
      name: node.name,
      htmlUrl: node.url,
      description: node.description,
      language: node.primaryLanguage?.name ?? null,
      stars: node.stargazerCount,
      pushedAt: node.pushedAt,
    };

    const target = node.defaultBranchRef?.target;
    const commits28d = target?.recent?.totalCount ?? 0;

    allRepos.push({ ...repoMeta, commits28d });

    if (target) {
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
  }

  // Query 2 — per-week commit counts, only for the top SPARKLINE_REPO_LIMIT
  // most-active repos. Keeps the query small enough to dodge GraphQL's
  // complexity ceiling while still capturing all the real activity.
  const sparklineRepos = [...allRepos]
    .filter((r) => r.commits28d > 0)
    .sort((a, b) => b.commits28d - a.commits28d)
    .slice(0, SPARKLINE_REPO_LIMIT);

  const weeklyTotals = new Array(SPARKLINE_WEEKS).fill(0);

  if (sparklineRepos.length > 0) {
    const weekAliases = weekRanges
      .map(
        (_, i) => `w${i}: history(since: $w${i}s, until: $w${i}e) { totalCount }`,
      )
      .join("\n                  ");
    const weekVarDecls = weekRanges
      .map((_, i) => `$w${i}s: GitTimestamp!, $w${i}e: GitTimestamp!`)
      .join(", ");

    const repoAliasFields = sparklineRepos
      .map(
        (r, i) => `
      r${i}: repository(owner: "${ORG}", name: "${r.name.replace(/"/g, '\\"')}") {
        defaultBranchRef {
          target {
            ... on Commit {
              ${weekAliases}
            }
          }
        }
      }
    `,
      )
      .join("\n");

    const sparkQuery = `query Spark(${weekVarDecls}) { ${repoAliasFields} }`;
    const sparkVariables: Record<string, unknown> = {};
    for (let i = 0; i < weekRanges.length; i++) {
      sparkVariables[`w${i}s`] = weekRanges[i].since;
      sparkVariables[`w${i}e`] = weekRanges[i].until;
    }

    try {
      const sparkResult = await ghGraphQL<Record<string, {
        defaultBranchRef: {
          target: Record<`w${number}`, WeekBucket | null> | null;
        } | null;
      } | null>>(sparkQuery, sparkVariables);
      rateLimitRemaining = sparkResult.remaining ?? rateLimitRemaining;

      for (let i = 0; i < sparklineRepos.length; i++) {
        const repoData = sparkResult.data[`r${i}`];
        const target = repoData?.defaultBranchRef?.target;
        if (!target) continue;
        for (let w = 0; w < SPARKLINE_WEEKS; w++) {
          const bucket = target[`w${w}`];
          weeklyTotals[w] += bucket?.totalCount ?? 0;
        }
      }
    } catch (e) {
      // Sparkline is decorative — if the second query fails, log and ship
      // the rest of the response with zeros.
      console.error("[github-feed] sparkline query failed:", e);
    }
  }

  // Repos that contributed to the merged feed.
  const feedRepos = allRepos.slice(0, 12).map(({ commits28d: _ignored, ...meta }) => {
    void _ignored;
    return meta;
  });

  allCommits.sort((a, b) => (a.date < b.date ? 1 : -1));

  // Top active = highest commits28d, only counting repos with >0.
  const topRepos = [...allRepos]
    .filter((r) => r.commits28d > 0)
    .sort((a, b) => b.commits28d - a.commits28d)
    .slice(0, TOP_ACTIVE_REPOS);

  const totalCommits = allRepos.reduce((a, r) => a + r.commits28d, 0);
  const avgPerDay = Math.round((totalCommits / HEADLINE_DAYS) * 10) / 10;

  return {
    commits: allCommits.slice(0, FEED_LIMIT),
    repos: feedRepos,
    allRepos,
    stats: {
      totalCommits,
      avgPerDay,
      headlineDays: HEADLINE_DAYS,
      sparklineWeeks: SPARKLINE_WEEKS,
      topRepos,
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
