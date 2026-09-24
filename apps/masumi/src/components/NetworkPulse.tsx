"use client";

import { useEffect, useRef, useState } from "react";
import { useNetwork } from "@/hooks/useNetwork";

interface Stats {
  totalTransactions: number;
  registeredAgents: number;
  lastTransactionTime: string | null;
  volumeUsdm: number | null;
}

function useCountUp(target: number | null, duration = 1400): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target === null) return;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);

  return value;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString();
}

export default function NetworkPulse() {
  const network = useNetwork();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/masumi-stats?network=${network}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active) setStats(d && !d.error ? d : null);
      })
      .catch(() => {
        if (active) setStats(null);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [network]);

  const agents = useCountUp(stats?.registeredAgents ?? null);
  const txns = useCountUp(stats?.totalTransactions ?? null);
  const volume = useCountUp(stats?.volumeUsdm ?? null);

  const tiles: {
    label: string;
    value: string;
    accent: string;
    live?: boolean;
  }[] = [
    {
      label: "Registered agents",
      value: stats ? agents.toLocaleString() : "—",
      accent: "#FF6ED2",
    },
    {
      label: "USDM settled",
      value: stats?.volumeUsdm != null ? `$${formatCompact(volume)}` : "—",
      accent: "#FA008C",
    },
    {
      label: "On-chain transactions",
      value: stats ? formatCompact(txns) : "—",
      accent: "#460A23",
    },
    {
      label: "Last activity",
      value: loaded ? timeAgo(stats?.lastTransactionTime ?? null) : "—",
      accent: "#FF6400",
      live: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-black/[0.06] border border-black/[0.06]">
      {tiles.map((tile) => (
        <div key={tile.label} className="bg-white px-5 py-5 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: tile.accent }}
            />
            <span className="text-[10px] font-medium uppercase tracking-[0.07em] text-[#999]">
              {tile.label}
            </span>
            {tile.live && stats?.lastTransactionTime && (
              <span className="relative flex h-1.5 w-1.5 ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6400] opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF6400]" />
              </span>
            )}
          </div>
          <span className="text-[26px] md:text-[32px] font-normal tracking-[-0.5px] text-black tabular-nums leading-none">
            {tile.value}
          </span>
        </div>
      ))}
    </div>
  );
}
