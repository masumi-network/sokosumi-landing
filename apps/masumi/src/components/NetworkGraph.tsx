"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface GraphNode {
  id: string;
  label: string;
  agents: string[];
  txCount: number;
  volume: number;
  types: Record<string, number>;
}

interface GraphEdge {
  source: string;
  target: string;
  txCount: number;
  volume: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const TYPE_COLORS: Record<string, string> = {
  SubmitResult: "#FA008C",
  PaymentBatched: "#A855F7",
  CollectCompleted: "#0AFA14",
  CollectRefund: "#FF6400",
  RequestRefund: "#FACC15",
  other: "#999",
};

const TYPE_LABELS: Record<string, string> = {
  SubmitResult: "Submit",
  PaymentBatched: "Batched",
  CollectCompleted: "Collected",
  CollectRefund: "Refund",
  RequestRefund: "Req. Refund",
  other: "Other",
};

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

function getDominantType(types: Record<string, number>): string {
  let max = 0;
  let dominant = "other";
  for (const [t, c] of Object.entries(types)) {
    if (c > max) { max = c; dominant = t; }
  }
  return dominant;
}

function typeArc(
  cx: number, cy: number, r: number,
  startAngle: number, endAngle: number,
): string {
  const start = {
    x: cx + r * Math.cos(startAngle),
    y: cy + r * Math.sin(startAngle),
  };
  const end = {
    x: cx + r * Math.cos(endAngle),
    y: cy + r * Math.sin(endAngle),
  };
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

export default function NetworkGraph() {
  const [data, setData] = useState<GraphData | null>(null);
  const [hovered, setHovered] = useState<GraphNode | null>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    fetch("/api/explorer/network-graph")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.nodes?.length > 0) setData(d);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!containerRef.current || !data) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setDrawn(true); },
      { threshold: 0.15 }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [data]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  if (!data) {
    return <div className="h-[400px] bg-black/[0.02] rounded animate-pulse" />;
  }

  const escrow = data.nodes[0];
  const addresses = data.nodes.slice(1);
  const maxTx = Math.max(...addresses.map((a) => a.txCount), 1);
  const active = hovered || selected;

  const W = 900;
  const H = 520;
  const CX = W / 2;
  const CY = H / 2;

  // Sort by txCount, place top nodes in inner ring
  const sorted = [...addresses].sort((a, b) => b.txCount - a.txCount);
  const innerRing = sorted.slice(0, 10);
  const outerRing = sorted.slice(10);

  const nodePositions = new Map<string, { x: number; y: number }>();
  nodePositions.set(escrow.id, { x: CX, y: CY });

  const R1 = 155;
  innerRing.forEach((node, i) => {
    const angle = (i / innerRing.length) * Math.PI * 2 - Math.PI / 2;
    nodePositions.set(node.id, {
      x: CX + Math.cos(angle) * R1,
      y: CY + Math.sin(angle) * R1,
    });
  });

  const R2 = 235;
  outerRing.forEach((node, i) => {
    const angle = (i / Math.max(outerRing.length, 1)) * Math.PI * 2 - Math.PI / 2 + 0.12;
    nodePositions.set(node.id, {
      x: CX + Math.cos(angle) * R2,
      y: CY + Math.sin(angle) * R2,
    });
  });

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove}>
      <div className="flex items-end justify-between mb-3">
        <div>
          <h3 className="text-[14px] font-medium text-black">Network Activity</h3>
          <p className="text-[12px] mt-0.5 text-[#999]">
            {addresses.length} connected addresses - {formatNum(escrow.txCount)} transactions
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {Object.entries(TYPE_COLORS).filter(([k]) => k !== "other").map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-[#999]">{TYPE_LABELS[type] || type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-0 border border-black/[0.04] rounded-sm overflow-hidden">
        {/* Graph */}
        <div
          className="relative flex-1 overflow-hidden bg-[#FAFAFA]"
          onClick={() => setSelected(null)}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full block"
            style={{ minHeight: 340 }}
          >
            {/* Edges */}
            {data.edges.map((edge, i) => {
              const src = nodePositions.get(edge.source);
              const tgt = nodePositions.get(edge.target);
              if (!src || !tgt) return null;

              const intensity = edge.txCount / maxTx;
              const strokeW = 0.5 + intensity * 2.5;
              const isActive = active?.id === edge.source;
              const isFaded = active && !isActive;

              return (
                <line
                  key={i}
                  x1={src.x} y1={src.y}
                  x2={tgt.x} y2={tgt.y}
                  stroke={isActive ? TYPE_COLORS[getDominantType(
                    data.nodes.find((n) => n.id === edge.source)?.types || {}
                  )] : "#000"}
                  strokeWidth={isActive ? strokeW + 0.5 : strokeW}
                  opacity={drawn ? (isActive ? 0.5 : isFaded ? 0.03 : 0.06 + intensity * 0.15) : 0}
                  style={{ transition: "opacity 0.6s ease, stroke 0.2s ease" }}
                />
              );
            })}

            {/* Pulse on escrow */}
            {drawn && (
              <>
                <circle cx={CX} cy={CY} r="20" fill="none" stroke="#FA008C" strokeWidth="0.5" opacity="0.1">
                  <animate attributeName="r" values="20;50" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.12;0" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx={CX} cy={CY} r="20" fill="none" stroke="#FA008C" strokeWidth="0.5" opacity="0.1">
                  <animate attributeName="r" values="20;50" dur="3s" begin="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.12;0" dur="3s" begin="1.5s" repeatCount="indefinite" />
                </circle>
              </>
            )}

            {/* Address nodes with type rings */}
            {addresses.map((node) => {
              const pos = nodePositions.get(node.id);
              if (!pos) return null;

              const intensity = node.txCount / maxTx;
              const r = 5 + intensity * 9;
              const isActive = active?.id === node.id;
              const isFaded = active && !isActive;
              const isInner = innerRing.includes(node);
              const dominantColor = TYPE_COLORS[getDominantType(node.types)] || "#999";

              // Build type breakdown arcs
              const total = Object.values(node.types).reduce((s, v) => s + v, 0);
              const arcs: { color: string; start: number; end: number }[] = [];
              let angle = -Math.PI / 2;
              for (const [type, count] of Object.entries(node.types).sort((a, b) => b[1] - a[1])) {
                const sweep = (count / total) * Math.PI * 2;
                if (sweep > 0.05) {
                  arcs.push({ color: TYPE_COLORS[type] || "#999", start: angle, end: angle + sweep });
                }
                angle += sweep;
              }

              return (
                <g
                  key={node.id}
                  onMouseEnter={() => setHovered(node)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={(e) => { e.stopPropagation(); setSelected(node); }}
                  style={{ cursor: "pointer" }}
                >
                  {/* Type breakdown ring */}
                  {isActive && arcs.map((arc, j) => (
                    <path
                      key={j}
                      d={typeArc(pos.x, pos.y, r + 4, arc.start, arc.end)}
                      fill="none"
                      stroke={arc.color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity={0.8}
                    />
                  ))}

                  {/* Node circle */}
                  <circle
                    cx={pos.x} cy={pos.y}
                    r={isActive ? r + 1 : r}
                    fill={dominantColor}
                    opacity={drawn ? (isFaded ? 0.08 : isActive ? 0.9 : 0.15 + intensity * 0.5) : 0}
                    style={{ transition: "opacity 0.4s ease" }}
                  />

                  {/* Label for inner ring nodes */}
                  {isInner && drawn && (
                    <text
                      x={pos.x}
                      y={pos.y + r + 12}
                      textAnchor="middle"
                      fill={isFaded ? "#ddd" : "#666"}
                      style={{ fontSize: "7px", transition: "fill 0.3s ease" }}
                    >
                      {node.agents.length > 0 ? node.agents[0].slice(0, 18) : node.label}
                    </text>
                  )}

                  {/* Hit area */}
                  <circle cx={pos.x} cy={pos.y} r={14} fill="transparent" />
                </g>
              );
            })}

            {/* Center escrow node */}
            <circle cx={CX} cy={CY} r={18} fill="#FA008C" opacity={drawn ? 1 : 0} style={{ transition: "opacity 0.8s ease" }} />
            <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="central" fill="white" style={{ fontSize: "8px", fontWeight: 600 }} opacity={drawn ? 1 : 0}>
              ESCROW
            </text>
            <text x={CX} y={CY + 32} textAnchor="middle" fill="#999" style={{ fontSize: "8px" }} opacity={drawn ? 1 : 0}>
              {formatNum(escrow.txCount)} txs
            </text>
          </svg>

          {/* Hover tooltip */}
          {hovered && hovered.id !== "escrow" && !selected && (
            <div
              className="absolute bg-black text-white text-[11px] px-3 py-2 rounded pointer-events-none z-10 whitespace-nowrap"
              style={{
                left: Math.min(Math.max(mousePos.x, 0), (containerRef.current?.offsetWidth ?? 400) - 220),
                top: Math.max(mousePos.y - 60, 0),
              }}
            >
              <p className="font-medium">{hovered.label}</p>
              {hovered.agents.length > 0 && (
                <p className="text-white/50 text-[10px]">{hovered.agents.join(", ")}</p>
              )}
              <p className="text-white/60 mt-0.5">
                {formatNum(hovered.txCount)} txs
                {hovered.volume > 0 ? ` - ${formatNum(hovered.volume)} USD` : ""}
              </p>
            </div>
          )}
        </div>

        {/* Detail sidebar */}
        {selected && (
          <div className="w-[240px] bg-white border-l border-black/[0.06] p-4 flex-shrink-0">
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-black truncate">{selected.label}</p>
                {selected.agents.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selected.agents.map((a) => (
                      <span key={a} className="text-[9px] bg-[#FA008C]/10 text-[#FA008C] px-1.5 py-0.5 rounded-full">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="text-[#999] hover:text-black text-[16px] leading-none ml-2 flex-shrink-0">
                x
              </button>
            </div>

            <div className="text-[10px] text-[#999] font-mono break-all mb-4">{selected.id}</div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-[10px] text-[#999]">Transactions</p>
                <p className="text-[18px] font-medium text-black">{formatNum(selected.txCount)}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#999]">Volume</p>
                <p className="text-[18px] font-medium text-black">
                  {selected.volume > 0 ? formatNum(selected.volume) : "-"}
                </p>
              </div>
            </div>

            <p className="text-[10px] text-[#999] mb-2">Transaction Types</p>
            <div className="flex flex-col gap-1.5">
              {Object.entries(selected.types)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => {
                  const pct = (count / selected.txCount) * 100;
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[type] || "#999" }} />
                          <span className="text-[10px] text-[#666]">{TYPE_LABELS[type] || type}</span>
                        </div>
                        <span className="text-[10px] text-[#999]">{count}</span>
                      </div>
                      <div className="h-[3px] bg-black/[0.04] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: TYPE_COLORS[type] || "#999" }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
