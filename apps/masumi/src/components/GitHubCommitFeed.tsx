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

type FeedResponse = {
  commits: Commit[];
  repos: Repo[];
  updatedAt: string;
};

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
        <div className="text-[13px] text-black leading-snug mt-0.5 line-clamp-2 group-hover:text-black">
          {commit.message}
        </div>
        <div className="text-[11px] text-[#bbb] mt-0.5">
          {commit.author.login ?? commit.author.name} · {timeAgo(commit.date)}
        </div>
      </div>
    </a>
  );
}

function RepoChip({ repo }: { repo: Repo }) {
  return (
    <a
      href={repo.htmlUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-2.5 py-1 border border-black/[0.06] hover:border-black/[0.16] rounded-full text-[11px] text-[#666] hover:text-black transition-colors whitespace-nowrap"
      title={repo.description ?? undefined}
    >
      <span>{repo.name}</span>
      {repo.language && (
        <span className="text-[#bbb]">·</span>
      )}
      {repo.language && (
        <span className="text-[#999]">{repo.language}</span>
      )}
      {repo.stars > 0 && (
        <>
          <span className="text-[#bbb]">·</span>
          <span className="text-[#999] flex items-center gap-0.5">
            <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor" aria-hidden>
              <path d="M4.5.5l1.18 2.39 2.64.38-1.91 1.86.45 2.62L4.5 6.51 2.14 7.75l.45-2.62L.68 3.27l2.64-.38z" />
            </svg>
            {repo.stars}
          </span>
        </>
      )}
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

  return (
    <section className="w-full">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
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

      {/* Repo chips */}
      {data && data.repos.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {data.repos.map((repo) => (
            <RepoChip key={repo.name} repo={repo} />
          ))}
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
            data.commits.map((c) => <CommitRow key={`${c.repo.name}-${c.sha}`} commit={c} />)
          )
        ) : (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        )}
      </div>
    </section>
  );
}
