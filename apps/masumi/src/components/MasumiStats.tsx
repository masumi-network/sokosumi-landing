"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface Stats {
  totalTransactions: number;
  registeredAgents: number;
  lastTransactionTime: string | null;
  volumeUsdm: number | null;
}

interface Transaction {
  tx_hash: string;
  block_height: number;
  block_time: number;
}

interface Agent {
  asset: string;
  name: string;
  description: string | null;
  author: string | null;
  organization: string | null;
  capability: string | null;
  version: string | null;
  pricingType: string | null;
  image: string | null;
  fingerprint: string | null;
  mintedAt: number | null;
}

type PanelType = "transactions" | "agents" | null;

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function timeAgoFromUnix(ts: number): string {
  const seconds = Math.floor((Date.now() - ts * 1000) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function AnimatedNumber({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) animate(); },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <span ref={ref} className="relative inline-grid tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
      <span className="invisible col-start-1 row-start-1">{value.toLocaleString()}</span>
      <span className="col-start-1 row-start-1 text-right">{display.toLocaleString()}</span>
    </span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    >
      <path d="M2.5 3.75L5 6.25L7.5 3.75" />
    </svg>
  );
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

// --- Transactions Panel ---

function TransactionsPanel({ open }: { open: boolean }) {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const cache = useRef<Map<number, Transaction[]>>(new Map());

  const fetchPage = useCallback(async (p: number) => {
    if (cache.current.has(p)) {
      setTxs(cache.current.get(p)!);
      setPage(p);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/masumi-transactions?page=${p}`);
      const data = await res.json();
      cache.current.set(p, data.transactions);
      setTxs(data.transactions);
      setPage(p);
    } catch {
      // keep current state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && txs.length === 0) fetchPage(1);
  }, [open, txs.length, fetchPage]);

  return (
    <div
      className="grid transition-[grid-template-rows] duration-300 ease-in-out"
      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">
        <div className="mt-6 max-w-2xl mx-auto w-full">
          {loading && txs.length === 0 ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-black/[0.02] rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                {txs.map((tx) => (
                  <div
                    key={tx.tx_hash}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-transparent hover:border-black/[0.08] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-[13px] text-black shrink-0">
                        {truncateHash(tx.tx_hash)}
                      </span>
                      <span className="text-[12px] text-[#bbb] shrink-0">
                        Block {tx.block_height.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[12px] text-[#999]">
                        {timeAgoFromUnix(tx.block_time)}
                      </span>
                      <a
                        href={`https://cardanoscan.io/transaction/${tx.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#999] hover:text-black transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 6.75v2.75a.5.5 0 01-.5.5h-6a.5.5 0 01-.5-.5v-6a.5.5 0 01.5-.5H5.25" />
                          <path d="M7.5 2h2.5v2.5" />
                          <path d="M5.5 6.5L10 2" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={() => fetchPage(page - 1)}
                  disabled={page <= 1 || loading}
                  className="text-[12px] text-[#999] hover:text-black disabled:opacity-30 disabled:cursor-default px-3 py-1 rounded-full border border-black/[0.06] hover:border-black/[0.12] transition-colors"
                >
                  Prev
                </button>
                <span className="text-[12px] text-[#bbb]">Page {page}</span>
                <button
                  onClick={() => fetchPage(page + 1)}
                  disabled={txs.length < 10 || loading}
                  className="text-[12px] text-[#999] hover:text-black disabled:opacity-30 disabled:cursor-default px-3 py-1 rounded-full border border-black/[0.06] hover:border-black/[0.12] transition-colors"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Agents Panel ---

function formatDate(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AgentCard({ agent }: { agent: Agent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="border border-black/[0.04] hover:border-black/[0.08] rounded-xl p-4 cursor-pointer transition-colors"
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
          <span className="text-[11px] text-[#bbb]">
            {formatDate(agent.mintedAt)}
          </span>
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
            {agent.fingerprint && (
              <div className="font-mono text-[10px] text-[#bbb]">
                {agent.fingerprint}
              </div>
            )}
            <div className="font-mono text-[10px] text-[#bbb] break-all">
              {agent.asset}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentsPanel({ open }: { open: boolean }) {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const cache = useRef<Map<number, Agent[]>>(new Map());

  const fetchPage = useCallback(async (p: number) => {
    if (cache.current.has(p)) {
      setAgents(cache.current.get(p)!);
      setPage(p);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/masumi-agents?page=${p}`);
      const data = await res.json();
      cache.current.set(p, data.agents);
      setAgents(data.agents);
      setPage(p);
    } catch {
      // keep current state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && agents.length === 0) fetchPage(1);
  }, [open, agents.length, fetchPage]);

  return (
    <div
      className="grid transition-[grid-template-rows] duration-300 ease-in-out"
      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">
        <div className="mt-6 max-w-3xl mx-auto w-full">
          {loading && agents.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-black/[0.02] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {agents.map((agent) => (
                  <AgentCard key={agent.asset} agent={agent} />
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={() => fetchPage(page - 1)}
                  disabled={page <= 1 || loading}
                  className="text-[12px] text-[#999] hover:text-black disabled:opacity-30 disabled:cursor-default px-3 py-1 rounded-full border border-black/[0.06] hover:border-black/[0.12] transition-colors"
                >
                  Prev
                </button>
                <span className="text-[12px] text-[#bbb]">Page {page}</span>
                <button
                  onClick={() => fetchPage(page + 1)}
                  disabled={agents.length < 10 || loading}
                  className="text-[12px] text-[#999] hover:text-black disabled:opacity-30 disabled:cursor-default px-3 py-1 rounded-full border border-black/[0.06] hover:border-black/[0.12] transition-colors"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

function ClickableStat({
  value,
  label,
  active,
  onClick,
}: {
  value: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 group cursor-pointer bg-transparent border-0 p-0"
    >
      <span className="text-[24px] md:text-[32px] font-normal tracking-[-0.5px] text-black leading-none">
        {value}
      </span>
      <span className="text-[11px] md:text-[12px] text-[#bbb] flex items-center gap-1">
        {label}
        <Chevron open={active} />
      </span>
    </button>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[24px] md:text-[32px] font-normal tracking-[-0.5px] text-black leading-none">
        {value}
      </span>
      <span className="text-[11px] md:text-[12px] text-[#bbb]">{label}</span>
    </div>
  );
}

function SkeletonStat() {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-[32px] w-16 bg-black/[0.03] rounded animate-pulse" />
      <div className="h-[12px] w-14 bg-black/[0.03] rounded animate-pulse mt-0.5" />
    </div>
  );
}

export default function MasumiStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelType>(null);

  useEffect(() => {
    fetch("/api/masumi-stats")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  if (error) return null;

  const toggle = (panel: PanelType) =>
    setActivePanel((prev) => (prev === panel ? null : panel));

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Live badge */}
      <div className="inline-flex items-center gap-2 bg-white border border-black/[0.06] rounded-full px-4 py-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FA008C] opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FA008C]" />
        </span>
        <span className="text-[12px] text-[#999]">Live on Mainnet</span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 md:gap-10">
        {stats ? (
          <>
            <ClickableStat
              value={<AnimatedNumber value={stats.totalTransactions} duration={2200} />}
              label="Transactions"
              active={activePanel === "transactions"}
              onClick={() => toggle("transactions")}
            />
            <div className="w-px h-10 bg-black/[0.06]" />
            <ClickableStat
              value={<AnimatedNumber value={stats.registeredAgents} duration={1800} />}
              label="Agents"
              active={activePanel === "agents"}
              onClick={() => toggle("agents")}
            />
            <div className="w-px h-10 bg-black/[0.06]" />
            <Stat
              value={
                stats.volumeUsdm != null ? (
                  <span className="flex items-baseline gap-1">
                    <AnimatedNumber value={Math.round(stats.volumeUsdm)} duration={2000} />
                    <span className="text-[14px] md:text-[16px] text-[#999] font-normal">USDM</span>
                  </span>
                ) : (
                  "\u2014"
                )
              }
              label="Volume"
            />
            <div className="w-px h-10 bg-black/[0.06]" />
            <Stat
              value={
                stats.lastTransactionTime
                  ? timeAgo(stats.lastTransactionTime)
                  : "\u2014"
              }
              label="Last Tx"
            />
          </>
        ) : (
          <>
            <SkeletonStat />
            <div className="w-px h-10 bg-black/[0.06]" />
            <SkeletonStat />
            <div className="w-px h-10 bg-black/[0.06]" />
            <SkeletonStat />
            <div className="w-px h-10 bg-black/[0.06]" />
            <SkeletonStat />
          </>
        )}
      </div>

      {/* Expand panels */}
      <div className="w-full px-4">
        <TransactionsPanel open={activePanel === "transactions"} />
        <AgentsPanel open={activePanel === "agents"} />
      </div>
    </div>
  );
}
