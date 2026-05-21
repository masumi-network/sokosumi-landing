"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
  weeklyTotals: number[];
};

type FeedResponse = {
  commits: Commit[];
  repos: Repo[];
  stats: FeedStats;
  updatedAt: string;
};

const COLLAPSED_COMMITS = 8;

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Sparkline({
  data,
  width = 100,
  height = 24,
  color = "#000",
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length === 0) return null;
  const max = Math.max(1, ...data);
  const barWidth = width / data.length;
  return (
    <svg width={width} height={height} className="block shrink-0">
      {data.map((value, i) => {
        const h = Math.max(1, (value / max) * height);
        return (
          <rect
            key={i}
            x={i * barWidth + 0.5}
            y={height - h}
            width={Math.max(1, barWidth - 1)}
            height={h}
            fill={color}
            opacity={value === 0 ? 0.08 : 0.65}
          />
        );
      })}
    </svg>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[24px] md:text-[28px] font-normal tracking-[-0.4px] text-black leading-none tabular-nums">
        {value}
      </span>
      <span className="text-[11px] text-[#999] uppercase tracking-[0.04em]">
        {label}
      </span>
    </div>
  );
}

function CommitRow({ commit }: { commit: Commit }) {
  return (
    <a
      href={commit.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 py-2.5 px-3 border border-transparent hover:border-black/[0.08] hover:bg-black/[0.01] transition-colors group"
    >
      {commit.author.avatarUrl ? (
        <Image
          src={commit.author.avatarUrl}
          alt={commit.author.login ?? commit.author.name}
          width={20}
          height={20}
          className="rounded-full shrink-0 mt-0.5"
          unoptimized
        />
      ) : (
        <div className="w-5 h-5 rounded-full bg-black/[0.05] shrink-0 mt-0.5 flex items-center justify-center text-[9px] text-[#999]">
          {commit.author.name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] text-[#999] shrink-0">
            {commit.repo.name}
          </span>
          <span className="font-mono text-[11px] text-[#bbb] shrink-0">
            {commit.shortSha}
          </span>
        </div>
        <div className="text-[13px] text-black leading-snug mt-0.5 line-clamp-2">
          {commit.message}
        </div>
        <div className="text-[11px] text-[#bbb] mt-0.5">
          {commit.author.login ?? commit.author.name} · {timeAgo(commit.date)}
        </div>
      </div>
    </a>
  );
}

function RepoActivityRow({ repo, max }: { repo: RepoActivity; max: number }) {
  const widthPct = max > 0 ? Math.max(2, (repo.commits / max) * 100) : 0;
  return (
    <a
      href={repo.htmlUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 py-2 px-3 border border-transparent hover:border-black/[0.08] hover:bg-black/[0.01] transition-colors group"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-black truncate">{repo.name}</span>
          {repo.language && (
            <span className="text-[11px] text-[#bbb] shrink-0">{repo.language}</span>
          )}
        </div>
        <div className="mt-1 h-1 bg-black/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full bg-black/60 group-hover:bg-black transition-colors"
            style={{ width: `${widthPct}%` }}
          />
        </div>
      </div>
      <span className="text-[13px] text-black tabular-nums w-12 text-right shrink-0">
        {repo.commits}
      </span>
    </a>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 py-2.5 px-3">
      <div className="w-5 h-5 rounded-full bg-black/[0.04] shrink-0 mt-0.5 animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-32 bg-black/[0.04] rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-black/[0.03] rounded animate-pulse" />
        <div className="h-3 w-20 bg-black/[0.03] rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function GitHubCommitFeed() {
  const [data, setData] = useState<FeedResponse | null>(null);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/github-feed")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return null;

  const visibleCommits = data
    ? expanded
      ? data.commits
      : data.commits.slice(0, COLLAPSED_COMMITS)
    : [];
  const hiddenCount = data ? data.commits.length - COLLAPSED_COMMITS : 0;
  const topRepoMax = data?.stats.topRepos[0]?.commits ?? 0;

  return (
    <section className="w-full">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
        <div>
          <h2 className="text-[20px] md:text-[24px] font-normal tracking-[-0.3px] text-black">
            GitHub Activity
          </h2>
          <p className="text-[13px] text-[#919191] mt-1">
            Latest commits across the{" "}
            <a
              href="https://github.com/orgs/masumi-network/repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[#ddd] hover:decoration-black"
            >
              masumi-network
            </a>{" "}
            organisation.
          </p>
        </div>
        {data && (
          <span className="text-[11px] text-[#bbb]">
            Updated {timeAgo(data.updatedAt)}
          </span>
        )}
      </div>

      {/* Stats panel */}
      {data && (
        <div className="border border-black/[0.06] p-5 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Stat
              value={data.stats.totalCommits.toLocaleString()}
              label={`Commits · last ${data.stats.headlineDays}d`}
            />
            <Stat
              value={data.stats.avgPerDay.toLocaleString()}
              label="Avg per day"
            />
            <Stat
              value={data.stats.topRepos.length.toLocaleString()}
              label="Active repos"
            />
            <div className="flex flex-col gap-1">
              <Sparkline data={data.stats.weeklyTotals} width={140} height={32} />
              <span className="text-[11px] text-[#999] uppercase tracking-[0.04em]">
                Last {data.stats.sparklineWeeks} weeks
              </span>
            </div>
          </div>

          {/* Most active repos */}
          {data.stats.topRepos.length > 0 && (
            <div className="mt-6 pt-5 border-t border-black/[0.05]">
              <h3 className="text-[11px] text-[#999] uppercase tracking-[0.04em] mb-2">
                Most active repos · last {data.stats.headlineDays} days
              </h3>
              <div className="flex flex-col">
                {data.stats.topRepos.map((repo) => (
                  <RepoActivityRow key={repo.name} repo={repo} max={topRepoMax} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Commit list */}
      <div className="flex flex-col gap-1">
        {data ? (
          data.commits.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-[#bbb]">
              No commits found
            </div>
          ) : (
            visibleCommits.map((c) => (
              <CommitRow key={`${c.repo.name}-${c.sha}`} commit={c} />
            ))
          )
        ) : (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        )}
      </div>

      {/* Expand/collapse */}
      {data && hiddenCount > 0 && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[12px] text-[#999] hover:text-black transition-colors px-4 py-2 rounded-full border border-black/[0.06] hover:border-black/[0.16]"
          >
            {expanded
              ? "Show less"
              : `Show ${hiddenCount} more commit${hiddenCount === 1 ? "" : "s"}`}
          </button>
        </div>
      )}
    </section>
  );
}
