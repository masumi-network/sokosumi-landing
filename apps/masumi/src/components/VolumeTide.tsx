"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface VolumePoint {
  date: string;
  volume: number;
  cumulative: number;
}

function formatUsdm(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}

function formatMonth(date: string): string {
  const [year, month] = date.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function smoothPath(coords: [number, number][]): string {
  if (coords.length < 2) return "";
  let d = `M ${coords[0][0]},${coords[0][1]}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpx = (prev[0] + curr[0]) / 2;
    d += ` C ${cpx},${prev[1]} ${cpx},${curr[1]} ${curr[0]},${curr[1]}`;
  }
  return d;
}

export default function VolumeTide({ dark = false }: { dark?: boolean }) {
  const [points, setPoints] = useState<VolumePoint[]>([]);
  const [hovered, setHovered] = useState<VolumePoint | null>(null);
  const [mouseX, setMouseX] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);

  useEffect(() => {
    fetch("/api/explorer/volume-series")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.points) return;
        let cum = 0;
        const pts: VolumePoint[] = data.points.map((p: { date: string; volume: number }) => {
          cum += p.volume;
          return { date: p.date, volume: p.volume, cumulative: cum };
        });
        setPoints(pts);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (pathRef.current) {
      setPathLen(pathRef.current.getTotalLength());
    }
  }, [points]);

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setDrawn(true); },
      { threshold: 0.2 }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [points.length]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!svgRef.current || points.length === 0) return;
      const rect = svgRef.current.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const pct = relX / rect.width;
      const idx = Math.max(0, Math.min(points.length - 1, Math.round(pct * (points.length - 1))));
      setHovered(points[idx]);
      setMouseX(relX);
    },
    [points]
  );

  if (points.length === 0) {
    return <div className="h-[220px] bg-black/[0.02] rounded animate-pulse" />;
  }

  const W = dark ? 800 : 1400;
  const H = dark ? 220 : 260;
  const PAD_LEFT = 30;
  const PAD_RIGHT = 30;
  const PAD_TOP = 20;
  const PAD_BOTTOM = 28;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;
  const maxVal = Math.max(...points.map((p) => p.cumulative), 1);

  const getX = (i: number) => PAD_LEFT + (i / Math.max(points.length - 1, 1)) * chartW;
  const getY = (val: number) => PAD_TOP + chartH - (val / maxVal) * chartH;

  const coords: [number, number][] = points.map((p, i) => [getX(i), getY(p.cumulative)]);
  const linePath = smoothPath(coords);
  const areaPath = `${linePath} L ${getX(points.length - 1)},${H - PAD_BOTTOM} L ${getX(0)},${H - PAD_BOTTOM} Z`;

  const total = points[points.length - 1].cumulative;
  const labelInterval = Math.max(1, Math.floor(points.length / 8));

  const hoveredIdx = hovered ? points.indexOf(hovered) : -1;

  return (
    <div ref={containerRef}>
      <div className="flex items-end justify-between mb-3">
        <div>
          <h3 className={`text-[14px] font-medium ${dark ? "text-white" : "text-black"}`}>Cumulative USD Volume</h3>
          <p className={`text-[12px] mt-0.5 ${dark ? "text-white/40" : "text-[#999]"}`}>Total value transacted on Masumi</p>
        </div>
        <div className="text-right">
          <span className={`text-[28px] md:text-[36px] font-normal tracking-[-1px] leading-none ${dark ? "text-white" : "text-black"}`}>
            {formatUsdm(total)}
          </span>
          <span className={`text-[14px] ml-1.5 ${dark ? "text-white/40" : "text-[#999]"}`}>USD</span>
        </div>
      </div>

      <div
        className="relative w-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full block"
          style={dark ? { height: "220px" } : undefined}
        >
          <defs>
            <linearGradient id="vol-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FA008C" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FA008C" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#vol-grad)"
            style={{
              opacity: drawn ? 1 : 0,
              transition: "opacity 1s ease 0.6s",
            }}
          />

          {/* Line — draw-in via dashoffset */}
          <path
            ref={pathRef}
            d={linePath}
            fill="none"
            stroke="#FA008C"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={
              pathLen > 0
                ? {
                    strokeDasharray: pathLen,
                    strokeDashoffset: drawn ? 0 : pathLen,
                    transition: "stroke-dashoffset 2s ease-out",
                  }
                : { opacity: drawn ? 1 : 0, transition: "opacity 0.5s ease" }
            }
          />

          {/* X-axis labels */}
          {points
            .filter((_, i) => i % labelInterval === 0)
            .map((p) => {
              const idx = points.indexOf(p);
              return (
                <text
                  key={p.date}
                  x={getX(idx)}
                  y={H - 6}
                  textAnchor="middle"
                  fill={dark ? "rgba(255,255,255,0.3)" : "#bbb"}
                  style={{ fontSize: "10px" }}
                >
                  {formatMonth(p.date)}
                </text>
              );
            })}

          {/* Hover crosshair */}
          {hovered && hoveredIdx >= 0 && (
            <>
              <line
                x1={getX(hoveredIdx)}
                y1={PAD_TOP}
                x2={getX(hoveredIdx)}
                y2={H - PAD_BOTTOM}
                stroke="#FA008C"
                strokeWidth="1"
                strokeDasharray="4 2"
                opacity="0.3"
              />
              <circle
                cx={getX(hoveredIdx)}
                cy={getY(hovered.cumulative)}
                r="4"
                fill="#FA008C"
                stroke="white"
                strokeWidth="2"
              />
            </>
          )}
        </svg>

        {/* Hover tooltip */}
        {hovered && (
          <div
            className="absolute top-0 bg-black text-white text-[11px] px-2.5 py-1.5 rounded pointer-events-none z-10 whitespace-nowrap"
            style={{
              left: Math.min(Math.max(mouseX, 0), (containerRef.current?.offsetWidth ?? 300) - 180),
              transform: "translateY(-4px)",
            }}
          >
            <span className="font-medium">{formatMonth(hovered.date)}</span>
            <span className="text-white/60 mx-1.5">|</span>
            <span>{formatUsdm(hovered.cumulative)} USD</span>
            <span className="text-white/40 ml-1.5">(+{formatUsdm(hovered.volume)})</span>
          </div>
        )}
      </div>
    </div>
  );
}
