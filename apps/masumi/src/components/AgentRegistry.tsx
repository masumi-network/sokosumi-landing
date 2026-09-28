"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNetwork } from "@/hooks/useNetwork";
import { NETWORKS } from "@/lib/network-config";
import type { Agent } from "@/lib/explorer-types";

// --- Helpers ---

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncateAddress(addr: string): string {
  if (addr.length <= 20) return addr;
  return `${addr.slice(0, 12)}...${addr.slice(-8)}`;
}

// --- Copy Button ---

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      });
    },
    [value]
  );

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 font-mono text-[11px] text-[#999] hover:text-black transition-colors"
      title="Copy"
    >
      {label ?? value}
      {copied ? (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 6.5L5 9l4.5-5.5" />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
          <path d="M2.5 8V2.5a1 1 0 011-1H8" />
        </svg>
      )}
    </button>
  );
}

// --- Search Bar ---

function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#bbb"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 text-[13px] text-black placeholder-[#bbb] bg-white border border-black/[0.06] focus:border-black/[0.15] outline-none transition-colors"
      />
    </div>
  );
}

// --- Pagination ---

function Pagination({
  page,
  loading,
  hasMore,
  onPrev,
  onNext,
}: {
  page: number;
  loading: boolean;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        onClick={onPrev}
        disabled={page <= 1 || loading}
        className="text-[12px] text-[#999] hover:text-black disabled:opacity-30 disabled:cursor-default px-3 py-1 rounded-full border border-black/[0.06] hover:border-black/[0.12] transition-colors"
      >
        Prev
      </button>
      <span className="text-[12px] text-[#bbb]">Page {page}</span>
      <button
        onClick={onNext}
        disabled={!hasMore || loading}
        className="text-[12px] text-[#999] hover:text-black disabled:opacity-30 disabled:cursor-default px-3 py-1 rounded-full border border-black/[0.06] hover:border-black/[0.12] transition-colors"
      >
        Next
      </button>
    </div>
  );
}

// --- Agent Card ---

function AgentCard({ agent, cardanoscanBase }: { agent: Agent; cardanoscanBase: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="border border-black/[0.04] hover:border-black/[0.08] p-4 cursor-pointer transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[14px] font-medium text-black leading-tight truncate">
          {agent.name}
        </span>
        {agent.capability && (
          <span className="text-[10px] text-[#999] bg-black/[0.03] px-2 py-0.5 rounded-full shrink-0">
            {agent.capability}
          </span>
        )}
      </div>
      {agent.description && (
        <p className="text-[12px] text-[#999] leading-[1.4] mt-1 line-clamp-2">
          {agent.description}
        </p>
      )}
      <div className="flex items-center gap-2 mt-1.5">
        {(agent.author || agent.organization) && (
          <span className="text-[11px] text-[#bbb]">
            {[agent.author, agent.organization].filter(Boolean).join(" · ")}
          </span>
        )}
        {(agent.author || agent.organization) && agent.mintedAt && (
          <span className="text-[11px] text-[#bbb]">·</span>
        )}
        {agent.mintedAt && (
          <span className="text-[11px] text-[#bbb]">{formatDate(agent.mintedAt)}</span>
        )}
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="mt-3 pt-3 border-t border-black/[0.04] flex flex-col gap-1.5 text-[11px] text-[#999]">
            {agent.version && <div>Version: {agent.version}</div>}
            {agent.pricingType && <div>Pricing: {agent.pricingType}</div>}
            {agent.walletAddress && (
              <div className="flex items-center gap-2">
                <span className="text-[#999]">Wallet:</span>
                <CopyButton value={agent.walletAddress} label={truncateAddress(agent.walletAddress)} />
                <a
                  href={`${cardanoscanBase}/address/${agent.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[#999] hover:text-black transition-colors flex items-center gap-0.5"
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6.75v2.75a.5.5 0 01-.5.5h-6a.5.5 0 01-.5-.5v-6a.5.5 0 01.5-.5H5.25" />
                    <path d="M7.5 2h2.5v2.5" />
                    <path d="M5.5 6.5L10 2" />
                  </svg>
                </a>
              </div>
            )}
            {agent.fingerprint && (
              <div className="font-mono text-[10px] text-[#bbb]">{agent.fingerprint}</div>
            )}
            <div className="font-mono text-[10px] text-[#bbb] break-all">{agent.asset}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

export default function AgentRegistry() {
  const network = useNetwork();
  const config = NETWORKS[network];

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const pageCache = useRef<Map<number, Agent[]>>(new Map());

  const fetchPage = useCallback(
    async (p: number) => {
      if (pageCache.current.has(p)) {
        setAgents(pageCache.current.get(p)!);
        setPage(p);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/masumi-agents?page=${p}&network=${network}`);
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        const list: Agent[] = Array.isArray(data.agents) ? data.agents : [];
        pageCache.current.set(p, list);
        setAgents(list);
        setPage(p);
        setHasMore(data.hasMore !== false);
        if (typeof data.total === "number") setTotal(data.total);
      } catch {
        // keep current
      } finally {
        setLoading(false);
      }
    },
    [network]
  );

  // Reset and reload when the network changes
  useEffect(() => {
    pageCache.current.clear();
    setAgents([]);
    setPage(1);
    setHasMore(true);
    setTotal(null);
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  // Client-side filter within the current page (agents are paginated server-side)
  const searchLower = search.toLowerCase();
  const filtered = search
    ? agents.filter(
        (a) =>
          a.name.toLowerCase().includes(searchLower) ||
          (a.description && a.description.toLowerCase().includes(searchLower)) ||
          (a.author && a.author.toLowerCase().includes(searchLower)) ||
          (a.organization && a.organization.toLowerCase().includes(searchLower)) ||
          (a.capability && a.capability.toLowerCase().includes(searchLower)) ||
          a.asset.toLowerCase().includes(searchLower)
      )
    : agents;

  return (
    <div className="w-full">
      {/* Registry info */}
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-[#999] shrink-0">Policy ID</span>
          <CopyButton value={config.policyId} label={config.policyId} />
        </div>
        {total !== null && (
          <div className="text-[11px] text-[#999]">
            {total.toLocaleString()} registered agent{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex-1 sm:max-w-[280px]">
          <SearchBar value={search} onChange={setSearch} placeholder="Search agents..." />
        </div>
      </div>

      {loading && agents.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-black/[0.02] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.length === 0 ? (
              <div className="col-span-full py-8 text-center text-[13px] text-[#bbb]">
                {search ? "No agents match your search" : "No agents found"}
              </div>
            ) : (
              filtered.map((agent) => (
                <AgentCard key={agent.asset} agent={agent} cardanoscanBase={config.cardanoscanBase} />
              ))
            )}
          </div>
          {!search && (
            <Pagination
              page={page}
              loading={loading}
              hasMore={hasMore}
              onPrev={() => fetchPage(page - 1)}
              onNext={() => fetchPage(page + 1)}
            />
          )}
        </>
      )}
    </div>
  );
}
