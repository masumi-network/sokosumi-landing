"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type {
  TransactionSummary,
  TransactionDetail,
  TransactionType,
  UTXOEntry,
  AmountEntry,
  Agent,
} from "@/lib/explorer-types";

const CONTRACT_ADDRESS = "addr1wx7j4kmg2cs7yf92uat3ed4a3u97kr7axxr4avaz0lhwdsq87ujx7";
const POLICY_ID = "ad6424e3ce9e47bbd8364984bd731b41de591f1d11f6d7d43d0da9b9";

type Tab = "transactions" | "agents";

// --- Helpers ---

function timeAgoFromUnix(ts: number): string {
  const seconds = Math.floor((Date.now() - ts * 1000) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

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

function truncateHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

function formatAda(lovelace: string | number): string {
  const n = typeof lovelace === "string" ? parseInt(lovelace, 10) : lovelace;
  return (n / 1_000_000).toFixed(2);
}

function formatUsdm(quantity: string | number): string {
  const n = typeof quantity === "string" ? parseInt(quantity, 10) : quantity;
  return (n / 1_000_000).toFixed(2);
}

// --- Type Badge ---

const TYPE_CONFIG: Record<TransactionType, { color: string; label: string }> = {
  SubmitResult: { color: "#FA008C", label: "Submit Result" },
  PaymentBatched: { color: "#FF6400", label: "Payment Batched" },
  CollectCompleted: { color: "#460A23", label: "Collect Completed" },
  CollectRefund: { color: "#D7BE8C", label: "Collect Refund" },
  RequestRefund: { color: "#FF6ED2", label: "Request Refund" },
  other: { color: "#999", label: "Other" },
};

function TypeBadge({ type }: { type: TransactionType }) {
  const { color, label } = TYPE_CONFIG[type];
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {label}
    </span>
  );
}

// --- Copy Button ---

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    },
    [value]
  );

  return (
    <button
      onClick={copy}
      className="font-mono text-[11px] text-[#666] hover:text-black transition-colors group inline-flex items-center gap-1"
      title={value}
    >
      <span>{label ?? value}</span>
      {copied ? (
        <span className="text-[#FA008C] text-[9px]">Copied</span>
      ) : (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}

// --- UTXO Card ---

function UTXOCard({ entry }: { entry: UTXOEntry }) {
  const ada = entry.amounts.find((a) => a.unit === "lovelace");
  const tokens = entry.amounts.filter((a) => a.unit !== "lovelace");

  return (
    <div
      className={`p-3 border transition-colors ${
        entry.is_escrow
          ? "border-[#FA008C]/20 bg-[#FA008C]/[0.03]"
          : "border-black/[0.04] bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <CopyButton value={entry.address} label={truncateAddress(entry.address)} />
        {entry.is_escrow && (
          <span className="text-[9px] font-medium text-[#FA008C] bg-[#FA008C]/10 px-1.5 py-0.5 rounded-full">
            Escrow
          </span>
        )}
      </div>
      {ada && (
        <div className="text-[12px] text-[#999]">
          {formatAda(ada.quantity)} ADA
        </div>
      )}
      {tokens.map((t: AmountEntry, i: number) => (
        <div
          key={i}
          className="text-[12px]"
          style={{ color: t.is_usdm ? "#FA008C" : "#999" }}
        >
          {t.is_usdm
            ? `${formatUsdm(t.quantity)} USD`
            : `${t.quantity} ${t.unit.slice(0, 8)}...`}
        </div>
      ))}
    </div>
  );
}

// --- UTXO Flow ---

function UTXOFlow({ detail }: { detail: TransactionDetail }) {
  if (!detail.inputs || !detail.outputs) return null;
  return (
    <div className="mt-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-medium text-[#999] mb-2">
            INPUTS ({detail.inputs.length})
          </div>
          <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto">
            {detail.inputs.map((inp, i) => (
              <UTXOCard key={i} entry={inp} />
            ))}
          </div>
          <div className="mt-2 px-3 py-2 bg-black/[0.02] text-[11px] text-[#999]">
            Total: {detail.input_total_ada.toFixed(2)} ADA
            {detail.input_total_usdm > 0 && (
              <span className="ml-2" style={{ color: "#FA008C" }}>
                {detail.input_total_usdm.toFixed(2)} USD
              </span>
            )}
          </div>
        </div>

        <div className="flex lg:flex-col items-center justify-center gap-2 py-2 lg:py-0 lg:px-2">
          <div className="hidden lg:block">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <div className="lg:hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
          <div className="text-[10px] text-[#bbb] whitespace-nowrap">
            Fee {formatAda(detail.fees)} ADA
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-medium text-[#999] mb-2">
            OUTPUTS ({detail.outputs.length})
          </div>
          <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto">
            {detail.outputs.map((out, i) => (
              <UTXOCard key={i} entry={out} />
            ))}
          </div>
          <div className="mt-2 px-3 py-2 bg-black/[0.02] text-[11px] text-[#999]">
            Total: {detail.output_total_ada.toFixed(2)} ADA
            {detail.output_total_usdm > 0 && (
              <span className="ml-2" style={{ color: "#FA008C" }}>
                {detail.output_total_usdm.toFixed(2)} USD
              </span>
            )}
          </div>
        </div>
      </div>

      {detail.metadata && (
        <div className="mt-4 p-3 bg-black/[0.02] border border-black/[0.04]">
          <div className="text-[11px] font-medium text-[#999] mb-2">Metadata</div>
          <pre className="text-[10px] text-[#666] font-mono overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(detail.metadata, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-[#bbb]">
        <span>Block {detail.block_height.toLocaleString()}</span>
        <span>Size: {detail.size.toLocaleString()} bytes</span>
        <a
          href={`https://cardanoscan.io/transaction/${detail.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#999] hover:text-black transition-colors flex items-center gap-1"
        >
          CardanoScan
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6.75v2.75a.5.5 0 01-.5.5h-6a.5.5 0 01-.5-.5v-6a.5.5 0 01.5-.5H5.25" />
            <path d="M7.5 2h2.5v2.5" />
            <path d="M5.5 6.5L10 2" />
          </svg>
        </a>
      </div>
    </div>
  );
}

// --- Chevron ---

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
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M2.5 3.75L5 6.25L7.5 3.75" />
    </svg>
  );
}

// --- Transaction Row ---

function TransactionRow({
  tx,
  expanded,
  onToggle,
  detail,
  loadingDetail,
  agentNames,
}: {
  tx: TransactionSummary;
  expanded: boolean;
  onToggle: () => void;
  detail: TransactionDetail | null;
  loadingDetail: boolean;
  agentNames: string[] | null;
}) {
  return (
    <div className="border border-black/[0.04] hover:border-black/[0.08] transition-colors">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 px-4 text-left bg-transparent border-0 cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-[12px] md:text-[13px] text-black shrink-0">
            {truncateHash(tx.hash)}
          </span>
          <TypeBadge type={tx.type} />
          {agentNames && agentNames.length > 0 && (
            <span className="text-[11px] text-[#666] bg-black/[0.03] px-2 py-0.5 rounded-full truncate max-w-[200px] hidden md:inline">
              {agentNames.join(", ")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {tx.usdm_amount > 0 && (
            <span className="text-[12px] font-medium" style={{ color: "#FA008C" }}>
              {tx.usdm_amount.toFixed(2)} USD
            </span>
          )}
          <span className="text-[12px] text-[#999] hidden md:inline">
            {timeAgoFromUnix(tx.block_time)}
          </span>
          <Chevron open={expanded} />
        </div>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            {loadingDetail && !detail ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-black/[0.02] rounded animate-pulse" />
                ))}
              </div>
            ) : detail ? (
              <UTXOFlow detail={detail} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Agent Card ---

function AgentCard({ agent }: { agent: Agent }) {
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
            {agent.walletAddress && (
              <div className="flex items-center gap-2">
                <span className="text-[#999]">Wallet:</span>
                <CopyButton value={agent.walletAddress} label={truncateAddress(agent.walletAddress)} />
                <a
                  href={`https://cardanoscan.io/address/${agent.walletAddress}`}
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

// --- Pagination ---

function Pagination({
  page,
  totalPages,
  loading,
  onPrev,
  onNext,
  hasMore,
}: {
  page: number;
  totalPages?: number;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
  hasMore?: boolean;
}) {
  const disableNext = hasMore !== undefined ? !hasMore : page >= (totalPages ?? page);
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        onClick={onPrev}
        disabled={page <= 1 || loading}
        className="text-[12px] text-[#999] hover:text-black disabled:opacity-30 disabled:cursor-default px-3 py-1 rounded-full border border-black/[0.06] hover:border-black/[0.12] transition-colors"
      >
        Prev
      </button>
      <span className="text-[12px] text-[#bbb]">
        Page {page}{totalPages ? ` of ${totalPages.toLocaleString()}` : ""}
      </span>
      <button
        onClick={onNext}
        disabled={disableNext || loading}
        className="text-[12px] text-[#999] hover:text-black disabled:opacity-30 disabled:cursor-default px-3 py-1 rounded-full border border-black/[0.06] hover:border-black/[0.12] transition-colors"
      >
        Next
      </button>
    </div>
  );
}

// --- Skeleton Rows ---

function SkeletonRows({ count, height }: { count: number; height: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-black/[0.02] rounded animate-pulse" style={{ height }} />
      ))}
    </div>
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

// --- Main Component ---

export default function ExplorerTransactions() {
  const [tab, setTab] = useState<Tab>("transactions");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Transactions state
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txTotalCount, setTxTotalCount] = useState(0);
  const [txLoading, setTxLoading] = useState(false);
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [expandedHash, setExpandedHash] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const detailCache = useRef<Map<string, TransactionDetail>>(new Map());

  // Agent address -> name(s) map
  const [agentMap, setAgentMap] = useState<Record<string, string[]>>({});

  // Agents state
  const [agentPage, setAgentPage] = useState(1);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const agentPageCache = useRef<Map<number, Agent[]>>(new Map());
  const [agentSearch, setAgentSearch] = useState("");
  const [agentHasMore, setAgentHasMore] = useState(true);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setTxPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch transactions (server-side search + pagination)
  const fetchTxPage = useCallback(async (p: number, searchQuery: string) => {
    setTxLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/explorer/transactions?${params}`);
      const data = await res.json();
      setTransactions(data.transactions);
      setTxPage(data.page);
      setTxTotalPages(data.totalPages ?? 1);
      setTxTotalCount(data.totalCount ?? 0);
    } catch {
      // keep current
    } finally {
      setTxLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(async (hash: string) => {
    if (detailCache.current.has(hash)) return;
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/explorer/tx-detail?hash=${hash}`);
      const data = await res.json();
      detailCache.current.set(hash, data);
    } catch {
      // keep current
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const toggleExpand = useCallback(
    (hash: string) => {
      setExpandedHash((prev) => {
        if (prev === hash) return null;
        if (!detailCache.current.has(hash)) fetchDetail(hash);
        return hash;
      });
    },
    [fetchDetail]
  );

  // Fetch agents
  const fetchAgentPage = useCallback(async (p: number) => {
    if (agentPageCache.current.has(p)) {
      setAgents(agentPageCache.current.get(p)!);
      setAgentPage(p);
      return;
    }
    setAgentLoading(true);
    try {
      const res = await fetch(`/api/masumi-agents?page=${p}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data.agents) ? data.agents : [];
      agentPageCache.current.set(p, list);
      setAgents(list);
      setAgentPage(p);
      setAgentHasMore(data.hasMore !== false);
    } catch {
      // keep current
    } finally {
      setAgentLoading(false);
    }
  }, []);

  // Fetch agent address map on mount
  useEffect(() => {
    fetch("/api/explorer/agent-map")
      .then((r) => (r.ok ? r.json() : {}))
      .then(setAgentMap)
      .catch(() => {});
  }, []);

  // Fetch txs when page or debounced search changes
  useEffect(() => {
    if (tab === "transactions") {
      fetchTxPage(txPage, debouncedSearch);
    }
  }, [txPage, debouncedSearch, tab, fetchTxPage]);

  useEffect(() => {
    if (tab === "agents" && agents.length === 0) fetchAgentPage(1);
  }, [tab, agents.length, fetchAgentPage]);

  // Agent client-side filter (agents are still paginated from Blockfrost)
  const agentSearchLower = agentSearch.toLowerCase();
  const filteredAgents = agentSearch
    ? agents.filter(
        (a) =>
          a.name.toLowerCase().includes(agentSearchLower) ||
          (a.description && a.description.toLowerCase().includes(agentSearchLower)) ||
          (a.author && a.author.toLowerCase().includes(agentSearchLower)) ||
          (a.organization && a.organization.toLowerCase().includes(agentSearchLower)) ||
          (a.capability && a.capability.toLowerCase().includes(agentSearchLower)) ||
          a.asset.toLowerCase().includes(agentSearchLower)
      )
    : agents;

  return (
    <div className="w-full">
      {/* Contract info */}
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-[#999] shrink-0">Smart Contract</span>
          <CopyButton value={CONTRACT_ADDRESS} label={truncateAddress(CONTRACT_ADDRESS)} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-[#999] shrink-0">Policy ID</span>
          <CopyButton value={POLICY_ID} label={truncateHash(POLICY_ID)} />
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex gap-1">
          <button
            onClick={() => setTab("transactions")}
            className={`text-[13px] px-3 py-1.5 rounded-full border transition-colors ${
              tab === "transactions"
                ? "border-black/[0.12] text-black bg-black/[0.03]"
                : "border-transparent text-[#999] hover:text-black"
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setTab("agents")}
            className={`text-[13px] px-3 py-1.5 rounded-full border transition-colors ${
              tab === "agents"
                ? "border-black/[0.12] text-black bg-black/[0.03]"
                : "border-transparent text-[#999] hover:text-black"
            }`}
          >
            Registered Agents
          </button>
        </div>
        <div className="flex-1 sm:max-w-[280px]">
          {tab === "transactions" ? (
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by hash or type..."
            />
          ) : (
            <SearchBar
              value={agentSearch}
              onChange={setAgentSearch}
              placeholder="Search agents..."
            />
          )}
        </div>
      </div>

      {/* Transactions Tab */}
      {tab === "transactions" && (
        <>
          {/* Result count for search */}
          {debouncedSearch && !txLoading && (
            <div className="text-[12px] text-[#999] mb-3">
              {txTotalCount.toLocaleString()} result{txTotalCount !== 1 ? "s" : ""} for &ldquo;{debouncedSearch}&rdquo;
            </div>
          )}

          {txLoading && transactions.length === 0 ? (
            <SkeletonRows count={5} height={56} />
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                {transactions.length === 0 ? (
                  <div className="py-8 text-center text-[13px] text-[#bbb]">
                    {debouncedSearch ? "No transactions match your search" : "No transactions found"}
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <TransactionRow
                      key={tx.hash}
                      tx={tx}
                      expanded={expandedHash === tx.hash}
                      onToggle={() => toggleExpand(tx.hash)}
                      detail={detailCache.current.get(tx.hash) ?? null}
                      loadingDetail={loadingDetail && expandedHash === tx.hash}
                      agentNames={tx.sender_address ? agentMap[tx.sender_address] ?? null : null}
                    />
                  ))
                )}
              </div>
              <Pagination
                page={txPage}
                totalPages={txTotalPages}
                loading={txLoading}
                onPrev={() => setTxPage((p) => Math.max(1, p - 1))}
                onNext={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}
              />
            </>
          )}
        </>
      )}

      {/* Agents Tab */}
      {tab === "agents" && (
        <>
          {agentLoading && agents.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-black/[0.02] animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredAgents.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-[13px] text-[#bbb]">
                    {agentSearch ? "No agents match your search" : "No agents found"}
                  </div>
                ) : (
                  filteredAgents.map((agent) => (
                    <AgentCard key={agent.asset} agent={agent} />
                  ))
                )}
              </div>
              {!agentSearch && (
                <Pagination
                  page={agentPage}
                  hasMore={agentHasMore}
                  loading={agentLoading}
                  onPrev={() => fetchAgentPage(agentPage - 1)}
                  onNext={() => fetchAgentPage(agentPage + 1)}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
