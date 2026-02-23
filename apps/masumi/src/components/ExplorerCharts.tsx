"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { TransactionType } from "@/lib/explorer-types";

const TYPE_CONFIG: Record<TransactionType, { color: string; label: string }> = {
  SubmitResult: { color: "#FA008C", label: "Submit Result" },
  PaymentBatched: { color: "#FF6400", label: "Payment Batched" },
  CollectCompleted: { color: "#460A23", label: "Collect Completed" },
  CollectRefund: { color: "#D7BE8C", label: "Collect Refund" },
  RequestRefund: { color: "#FF6ED2", label: "Request Refund" },
  other: { color: "#999", label: "Other" },
};

interface ChartData {
  periodCounts: { day: number; week: number; month: number };
  daily: { date: string; count: number; byType: Record<string, number> }[];
  typeBreakdown: { type: TransactionType; count: number; percentage: number }[];
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

function BarChart({ daily }: { daily: ChartData["daily"] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...daily.map((d) => d.count), 1);

  return (
    <div>
      <div className="text-[11px] font-medium text-[#999] tracking-wide mb-3">
        DAILY ACTIVITY
      </div>
      <div className="relative h-[120px] flex items-end gap-[3px]">
        {daily.map((d, i) => {
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
                  {new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  : {d.count} txs
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        {daily
          .filter((_, i) => i % 7 === 0)
          .map((d) => (
            <span key={d.date} className="text-[9px] text-[#bbb]">
              {new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          ))}
      </div>
    </div>
  );
}

function TypeBreakdown({
  breakdown,
}: {
  breakdown: ChartData["typeBreakdown"];
}) {
  if (breakdown.length === 0) return null;

  return (
    <div>
      <div className="text-[11px] font-medium text-[#999] tracking-wide mb-3">
        TRANSACTION TYPES
        <span className="font-normal text-[#bbb] ml-1">(last 30 days)</span>
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
  const [data, setData] = useState<ChartData | null>(null);

  useEffect(() => {
    fetch("/api/explorer/chart-data")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        {/* Skeleton period stats */}
        <div className="flex items-center justify-center gap-8">
          {[0, 1, 2].map((i) => (
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
      <div className="flex items-center justify-center gap-8 md:gap-12">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[24px] md:text-[32px] font-normal tracking-[-0.5px] text-black leading-none">
            <AnimatedNumber value={data.periodCounts.day} duration={1500} />
          </span>
          <span className="text-[11px] text-[#bbb]">24h</span>
        </div>
        <div className="w-px h-8 bg-black/[0.06]" />
        <div className="flex flex-col items-center gap-1">
          <span className="text-[24px] md:text-[32px] font-normal tracking-[-0.5px] text-black leading-none">
            <AnimatedNumber value={data.periodCounts.week} duration={1800} />
          </span>
          <span className="text-[11px] text-[#bbb]">7 days</span>
        </div>
        <div className="w-px h-8 bg-black/[0.06]" />
        <div className="flex flex-col items-center gap-1">
          <span className="text-[24px] md:text-[32px] font-normal tracking-[-0.5px] text-black leading-none">
            <AnimatedNumber value={data.periodCounts.month} duration={2200} />
          </span>
          <span className="text-[11px] text-[#bbb]">30 days</span>
        </div>
      </div>

      <BarChart daily={data.daily} />
      <TypeBreakdown breakdown={data.typeBreakdown} />
    </div>
  );
}
