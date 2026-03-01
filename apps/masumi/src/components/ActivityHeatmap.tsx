"use client";

import { useEffect, useState, useRef } from "react";
import { useNetwork } from "@/hooks/useNetwork";

interface DayData {
  date: string;
  count: number;
}

function computeThresholds(days: DayData[]): [number, number, number] {
  const counts = days.map((d) => d.count).filter((c) => c > 0).sort((a, b) => a - b);
  if (counts.length === 0) return [1, 5, 20];
  const p = (pct: number) => counts[Math.floor(pct * (counts.length - 1))];
  return [p(0.25), p(0.5), p(0.75)];
}

function getIntensity(count: number, thresholds: [number, number, number]): number {
  if (count === 0) return 0;
  if (count <= thresholds[0]) return 1;
  if (count <= thresholds[1]) return 2;
  if (count <= thresholds[2]) return 3;
  return 4;
}

const OPACITY_MAP = [0.04, 0.15, 0.35, 0.6, 1];

function utcToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildCalendar(days: DayData[]): (DayData | null)[][] {
  const map = new Map(days.map((d) => [d.date, d.count]));
  const endDay = utcToday();
  const startDay = new Date(endDay);
  startDay.setUTCDate(startDay.getUTCDate() - 364);
  const startDow = startDay.getUTCDay();

  const weeks: (DayData | null)[][] = [];
  let currentWeek: (DayData | null)[] = [];

  if (startDow > 0) {
    for (let i = 0; i < startDow; i++) currentWeek.push(null);
  }

  const cursor = new Date(startDay);
  while (cursor <= endDay) {
    const dateStr = toDateStr(cursor);
    currentWeek.push({ date: dateStr, count: map.get(dateStr) ?? 0 });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return weeks;
}

function formatTooltipDate(date: string): string {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ActivityHeatmap() {
  const network = useNetwork();
  const [days, setDays] = useState<DayData[]>([]);
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setDays([]);
    setVisible(false);
    fetch(`/api/explorer/heatmap-data?network=${network}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.days) setDays(data.days); })
      .catch(() => {});
  }, [network]);

  useEffect(() => {
    if (!containerRef.current || days.length === 0) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [days.length]);

  if (days.length === 0) {
    return (
      <div className="h-[140px] bg-black/[0.02] rounded animate-pulse" />
    );
  }

  const weeks = buildCalendar(days);
  const thresholds = computeThresholds(days);
  const totalTxs = days.reduce((s, d) => s + d.count, 0);

  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = "";
  weeks.forEach((week, wi) => {
    const firstDay = week.find((d) => d !== null);
    if (firstDay) {
      const month = firstDay.date.slice(0, 7);
      if (month !== lastMonth) {
        const d = new Date(firstDay.date + "T00:00:00");
        monthLabels.push({ label: d.toLocaleDateString("en-US", { month: "short" }), col: wi });
        lastMonth = month;
      }
    }
  });

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-medium text-black">Activity</h3>
          <p className="text-[12px] text-[#999] mt-0.5">
            {totalTxs.toLocaleString()} transactions in the last year
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#999]">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="w-[10px] h-[10px] rounded-[2px]"
              style={{ backgroundColor: `rgba(250, 0, 140, ${OPACITY_MAP[level]})` }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Month labels */}
      <div className="relative pb-1">
        <div className="flex gap-[2px] mb-1 ml-[28px]">
          {weeks.map((_, wi) => {
            const ml = monthLabels.find((m) => m.col === wi);
            return (
              <div key={wi} className="flex-1 min-w-0 text-[9px] text-[#bbb] leading-none truncate">
                {ml ? ml.label : ""}
              </div>
            );
          })}
        </div>

        <div className="flex gap-0">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-[2px] mr-1 shrink-0">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
              <div key={i} className="text-[9px] text-[#bbb] leading-none w-[24px] text-right pr-1 aspect-square flex items-center justify-end">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 flex gap-[2px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex-1 flex flex-col gap-[2px]">
                {week.map((day, di) => {
                  if (!day) return <div key={di} className="w-full aspect-square" />;
                  const intensity = getIntensity(day.count, thresholds);
                  return (
                    <div
                      key={di}
                      className="w-full aspect-square rounded-[2px] transition-all duration-300 cursor-crosshair"
                      style={{
                        backgroundColor: `rgba(250, 0, 140, ${OPACITY_MAP[intensity]})`,
                        opacity: visible ? 1 : 0,
                        transitionDelay: visible ? `${wi * 8}ms` : "0ms",
                      }}
                      onMouseEnter={(e) => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        const containerRect = containerRef.current?.getBoundingClientRect();
                        if (containerRect) {
                          setTooltip({
                            date: day.date,
                            count: day.count,
                            x: rect.left - containerRect.left + 6,
                            y: rect.top - containerRect.top - 32,
                          });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute bg-black text-white text-[10px] px-2.5 py-1.5 rounded whitespace-nowrap z-20 pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {formatTooltipDate(tooltip.date)}: {tooltip.count} transaction{tooltip.count !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
