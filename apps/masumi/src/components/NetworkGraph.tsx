"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface GraphNode {
  id: string;
  label: string;
  txCount: number;
  volume: number;
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

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

export default function NetworkGraph() {
  const [data, setData] = useState<GraphData | null>(null);
  const [hovered, setHovered] = useState<GraphNode | null>(null);
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
  const agents = data.nodes.slice(1);
  const maxTx = Math.max(...agents.map((a) => a.txCount), 1);

  // Layout: escrow in center, agents in concentric rings
  const W = 900;
  const H = 500;
  const CX = W / 2;
  const CY = H / 2;

  // Sort agents by txCount descending for inner ring placement
  const sorted = [...agents].sort((a, b) => b.txCount - a.txCount);
  const innerRing = sorted.slice(0, 12);
  const outerRing = sorted.slice(12);

  const nodePositions = new Map<string, { x: number; y: number }>();
  nodePositions.set(escrow.id, { x: CX, y: CY });

  // Inner ring
  const R1 = 160;
  innerRing.forEach((node, i) => {
    const angle = (i / innerRing.length) * Math.PI * 2 - Math.PI / 2;
    nodePositions.set(node.id, {
      x: CX + Math.cos(angle) * R1,
      y: CY + Math.sin(angle) * R1,
    });
  });

  // Outer ring
  const R2 = 230;
  outerRing.forEach((node, i) => {
    const angle = (i / Math.max(outerRing.length, 1)) * Math.PI * 2 - Math.PI / 2 + 0.15;
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
            {agents.length} connected addresses - {formatNum(escrow.txCount)} total transactions
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden bg-[#FAFAFA] border border-black/[0.04] rounded-sm">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full block"
          style={{ minHeight: 360 }}
        >
          {/* Edges */}
          {data.edges.map((edge, i) => {
            const src = nodePositions.get(edge.source);
            const tgt = nodePositions.get(edge.target);
            if (!src || !tgt) return null;

            const intensity = edge.txCount / maxTx;
            const strokeW = 0.5 + intensity * 2.5;
            const opacity = drawn ? 0.06 + intensity * 0.2 : 0;
            const isHovered = hovered?.id === edge.source;

            return (
              <line
                key={i}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke={isHovered ? "#FA008C" : "#000"}
                strokeWidth={isHovered ? strokeW + 0.5 : strokeW}
                opacity={isHovered ? 0.5 : opacity}
                style={{ transition: "opacity 1.2s ease, stroke 0.2s ease" }}
              />
            );
          })}

          {/* Pulse rings on escrow */}
          {drawn && (
            <>
              <circle cx={CX} cy={CY} r="20" fill="none" stroke="#FA008C" strokeWidth="0.5" opacity="0.1">
                <animate attributeName="r" values="20;50" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.15;0" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={CX} cy={CY} r="20" fill="none" stroke="#FA008C" strokeWidth="0.5" opacity="0.1">
                <animate attributeName="r" values="20;50" dur="3s" begin="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.15;0" dur="3s" begin="1.5s" repeatCount="indefinite" />
              </circle>
            </>
          )}

          {/* Agent nodes */}
          {agents.map((node) => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;

            const intensity = node.txCount / maxTx;
            const r = 3 + intensity * 6;
            const isHovered = hovered?.id === node.id;

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHovered(node)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? r + 2 : r}
                  fill={isHovered ? "#FA008C" : "#000"}
                  opacity={drawn ? (isHovered ? 1 : 0.15 + intensity * 0.6) : 0}
                  style={{ transition: "opacity 1s ease, r 0.15s ease, fill 0.15s ease" }}
                />
                {/* Invisible hit area */}
                <circle cx={pos.x} cy={pos.y} r={12} fill="transparent" />
              </g>
            );
          })}

          {/* Center escrow node */}
          <circle
            cx={CX}
            cy={CY}
            r={16}
            fill="#FA008C"
            opacity={drawn ? 1 : 0}
            style={{ transition: "opacity 0.8s ease" }}
          />
          <text
            x={CX}
            y={CY + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            style={{ fontSize: "8px", fontWeight: 600, letterSpacing: "0.02em" }}
            opacity={drawn ? 1 : 0}
          >
            M
          </text>

          {/* Escrow label */}
          <text
            x={CX}
            y={CY + 30}
            textAnchor="middle"
            fill="#999"
            style={{ fontSize: "9px" }}
            opacity={drawn ? 1 : 0}
          >
            Escrow Contract
          </text>
        </svg>

        {/* Hover tooltip */}
        {hovered && hovered.id !== "escrow" && (
          <div
            className="absolute bg-black text-white text-[11px] px-3 py-2 rounded pointer-events-none z-10 whitespace-nowrap"
            style={{
              left: Math.min(Math.max(mousePos.x, 0), (containerRef.current?.offsetWidth ?? 400) - 200),
              top: Math.max(mousePos.y - 50, 0),
            }}
          >
            <p className="font-medium mb-0.5">{hovered.label}</p>
            <p className="text-white/60">
              {formatNum(hovered.txCount)} txs
              {hovered.volume > 0 ? ` - ${formatNum(hovered.volume)} USD` : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
