"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useNetwork } from "@/hooks/useNetwork";
import type { TransactionType } from "@/lib/explorer-types";

type ChartRange = "30" | "90" | "365" | "all";

const TYPE_CONFIG: Record<TransactionType, { color: string; label: string }> = {
  SubmitResult: { color: "#FA008C", label: "Submit Result" },
  PaymentBatched: { color: "#FF6400", label: "Payment Batched" },
  CollectCompleted: { color: "#460A23", label: "Collect Completed" },
  CollectRefund: { color: "#D7BE8C", label: "Collect Refund" },
  RequestRefund: { color: "#FF6ED2", label: "Request Refund" },
  other: { color: "#999", label: "Other" },
};

const RANGE_OPTIONS: { value: ChartRange; label: string }[] = [
  { value: "30", label: "30d" },
  { value: "90", label: "90d" },
  { value: "365", label: "1y" },
  { value: "all", label: "All" },
];

const RANGE_SUBTITLES: Record<ChartRange, string> = {
  "30": "Daily \u00b7 Last 30 days",
  "90": "Daily \u00b7 Last 90 days",
  "365": "Weekly \u00b7 Last year",
  all: "Monthly \u00b7 All time",
};

interface ChartData {
  periodCounts: {
    day: number; dayPrev: number;
    week: number; weekPrev: number;
    month: number; monthPrev: number;
    total: number;
  };
  volumeStats: {
    total: number;
    month: number;
    monthPrev: number;
  };
  totalFeesAda: number;
  bars: { date: string; count: number; byType: Record<string, number> }[];
  typeBreakdown: { type: TransactionType; count: number; percentage: number }[];
}

function growthPct(current: number, prev: number): number | null {
  if (prev === 0) return current > 0 ? 100 : null;
  return ((current - prev) / prev) * 100;
}

function GrowthBadge({ current, prev }: { current: number; prev: number }) {
  const pct = growthPct(current, prev);
  if (pct === null) return null;
  const positive = pct >= 0;
  return (
    <span className={`text-[10px] font-medium ${positive ? "text-emerald-500" : "text-red-400"}`}>
      {positive ? "+" : ""}{pct.toFixed(0)}%
    </span>
  );
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
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

function formatBarLabel(date: string, range: ChartRange): string {
  if (range === "30" || range === "90") {
    return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
  if (range === "365") {
    // date is "YYYY-WW" — parse year and week to approximate date
    const [year, week] = date.split("-").map(Number);
    const jan1 = new Date(year, 0, 1);
    const dayOffset = week * 7;
    const approx = new Date(jan1.getTime() + dayOffset * 86400000);
    return approx.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  // "all" — date is "YYYY-MM"
  const [year, month] = date.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function labelInterval(range: ChartRange, total: number): number {
  if (range === "30") return 7;
  if (range === "90") return 14;
  if (range === "365") return 8;
  // "all" — show ~6 labels
  return Math.max(1, Math.floor(total / 6));
}

function BarChart({ bars, range }: { bars: ChartData["bars"]; range: ChartRange }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...bars.map((d) => d.count), 1);
  const interval = labelInterval(range, bars.length);

  return (
    <div>
      <div className="relative h-[120px] flex items-end gap-[3px]">
        {bars.map((d, i) => {
          const pct = (d.count / max) * 100;
          return (
            <div
              key={d.date}
              className="flex-1 relative group"
              style={{ height: "100%" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className="absolute bottom-0 w-full transition-all duration-200"
                style={{
                  height: `${Math.max(pct, d.count > 0 ? 2 : 0)}%`,
                  backgroundColor: hovered === i ? "#d4006f" : "#FA008C",
                  borderRadius: "1px 1px 0 0",
                }}
              />
              {hovered === i && (
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                  {formatBarLabel(d.date, range)}: {d.count} txs
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        {bars
          .filter((_, i) => i % interval === 0)
          .map((d) => (
            <span key={d.date} className="text-[9px] text-[#bbb]">
              {formatBarLabel(d.date, range)}
            </span>
          ))}
      </div>
    </div>
  );
}

function TypeBreakdown({
  breakdown,
  range,
}: {
  breakdown: ChartData["typeBreakdown"];
  range: ChartRange;
}) {
  if (breakdown.length === 0) return null;

  const scopeLabel = range === "all" ? "all time" : range === "365" ? "last year" : `last ${range} days`;

  return (
    <div>
      <div className="text-[11px] font-medium text-[#999] tracking-wide mb-3">
        TRANSACTION TYPES
        <span className="font-normal text-[#bbb] ml-1">({scopeLabel})</span>
      </div>
      {/* Stacked bar */}
      <div className="h-[6px] rounded-full overflow-hidden flex">
        {breakdown.map((item) => (
          <div
            key={item.type}
            style={{
              width: `${item.percentage}%`,
              backgroundColor: TYPE_CONFIG[item.type]?.color ?? "#999",
            }}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {breakdown.map((item) => {
          const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.other;
          return (
            <div key={item.type} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: cfg.color }}
              />
              <span className="text-[11px] text-[#666]">
                {cfg.label}
              </span>
              <span className="text-[11px] text-[#bbb]">
                {item.count.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ExplorerCharts() {
  const network = useNetwork();
  const [range, setRange] = useState<ChartRange>("30");
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetch(`/api/explorer/chart-data?range=${range}&network=${network}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [range, network]);

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        {/* Skeleton period stats */}
        <div className="flex items-center justify-center gap-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-[32px] w-14 bg-black/[0.03] rounded animate-pulse" />
              <div className="h-[12px] w-10 bg-black/[0.03] rounded animate-pulse" />
            </div>
          ))}
        </div>
        {/* Skeleton bar chart */}
        <div className="h-[120px] bg-black/[0.02] rounded animate-pulse" />
        {/* Skeleton type bar */}
        <div className="h-[6px] bg-black/[0.03] rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Period stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="flex flex-col gap-1 p-4 border border-black/[0.04]">
          <span className="text-[11px] text-[#bbb]">24h</span>
          <span className="text-[24px] md:text-[28px] font-normal tracking-[-0.5px] text-black leading-none">
            <AnimatedNumber value={data.periodCounts.day} duration={1500} />
          </span>
          <GrowthBadge current={data.periodCounts.day} prev={data.periodCounts.dayPrev} />
        </div>
        <div className="flex flex-col gap-1 p-4 border border-black/[0.04]">
          <span className="text-[11px] text-[#bbb]">7 days</span>
          <span className="text-[24px] md:text-[28px] font-normal tracking-[-0.5px] text-black leading-none">
            <AnimatedNumber value={data.periodCounts.week} duration={1800} />
          </span>
          <GrowthBadge current={data.periodCounts.week} prev={data.periodCounts.weekPrev} />
        </div>
        <div className="flex flex-col gap-1 p-4 border border-black/[0.04]">
          <span className="text-[11px] text-[#bbb]">30 days</span>
          <span className="text-[24px] md:text-[28px] font-normal tracking-[-0.5px] text-black leading-none">
            <AnimatedNumber value={data.periodCounts.month} duration={2200} />
          </span>
          <GrowthBadge current={data.periodCounts.month} prev={data.periodCounts.monthPrev} />
        </div>
        <div className="flex flex-col gap-1 p-4 border border-black/[0.04]">
          <span className="text-[11px] text-[#bbb]">All time</span>
          <span className="text-[24px] md:text-[28px] font-normal tracking-[-0.5px] text-black leading-none">
            <AnimatedNumber value={data.periodCounts.total} duration={2500} />
          </span>
          <span className="text-[10px] text-[#bbb]">transactions</span>
        </div>
        <div className="flex flex-col gap-1 p-4 border border-black/[0.04]">
          <span className="text-[11px] text-[#bbb]">Volume (30d)</span>
          <span className="text-[24px] md:text-[28px] font-normal tracking-[-0.5px] text-black leading-none">
            {formatUsd(data.volumeStats.month)}
          </span>
          <GrowthBadge current={data.volumeStats.month} prev={data.volumeStats.monthPrev} />
        </div>
        <div className="flex flex-col gap-1 p-4 border border-black/[0.04]">
          <span className="text-[11px] text-[#bbb]">Volume (all)</span>
          <span className="text-[24px] md:text-[28px] font-normal tracking-[-0.5px] text-black leading-none">
            {formatUsd(data.volumeStats.total)}
          </span>
          <span className="text-[10px] text-[#bbb]">USD</span>
        </div>
        <div className="flex flex-col gap-1 p-4 border border-black/[0.04]">
          <span className="text-[11px] text-[#bbb]">Fees paid to Cardano</span>
          <span className="text-[24px] md:text-[28px] font-normal tracking-[-0.5px] text-black leading-none">
            {data.totalFeesAda.toFixed(0)}
          </span>
          <span className="text-[10px] text-[#bbb]">ADA</span>
        </div>
      </div>

      {/* Range selector + chart */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-medium text-[#999] tracking-wide">
            {RANGE_SUBTITLES[range].toUpperCase()}
          </div>
          <div className="flex gap-1">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  range === opt.value
                    ? "border-black/[0.12] text-black bg-black/[0.04]"
                    : "border-transparent text-[#999] hover:text-black"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className={loading ? "opacity-50 transition-opacity" : "transition-opacity"}>
          <BarChart bars={data.bars} range={range} />
        </div>
      </div>

      <TypeBreakdown breakdown={data.typeBreakdown} range={range} />
    </div>
  );
}
