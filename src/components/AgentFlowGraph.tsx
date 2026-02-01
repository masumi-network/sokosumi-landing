"use client";

import { useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

function AgentNode({ data }: NodeProps) {
  const d = data as {
    label: string;
    role: string;
    color: string;
    avatar?: string;
    logo?: string;
    amount?: string;
    isRoot?: boolean;
    isUser?: boolean;
    verified?: boolean;
  };

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`relative ${d.isRoot ? "scale-110" : ""} ${d.isUser ? "scale-115" : ""}`}>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-3 !h-3" />
      <div className={`bg-white rounded-xl border shadow-md px-4 py-3 min-w-[150px] max-w-[180px] ${d.isUser ? "border-[#6366f1]/30 shadow-lg" : d.isRoot ? "border-black/20 shadow-lg" : "border-black/5"}`}>
        <div className="flex items-center gap-2.5 mb-1.5">
          {d.isUser ? (
            <div className="w-8 h-8 rounded-full bg-[#6366f1] flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          ) : d.avatar ? (
            <img src={d.avatar} alt={d.label} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : d.logo ? (
            <div className="w-8 h-8 rounded-lg bg-[#111] flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src={d.logo} alt={d.label} className="w-5 h-5 object-contain" />
            </div>
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-medium flex-shrink-0"
              style={{ backgroundColor: d.color }}
            >
              {d.label[0]}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-[11px] font-medium text-black leading-tight truncate">{d.label}</p>
              {d.verified && (
                <div
                  className="relative flex-shrink-0"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#2cb67d" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="12" cy="12" r="10" fill="#2cb67d" />
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                  {showTooltip && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-black text-white text-[9px] rounded-md whitespace-nowrap z-50 shadow-lg">
                      Identity Verified on Masumi
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-black" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-[9px] text-[#999] truncate">{d.role}</p>
          </div>
        </div>
        {d.amount && (
          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-black/5">
            <span className="text-[9px] text-[#999]">Payment</span>
            <span className="text-[11px] font-medium text-[#2cb67d]">{d.amount}</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-3 !h-3" />
    </div>
  );
}

const nodeTypes = { agent: AgentNode };

const initialNodes: Node[] = [
  // User (human) at the top
  {
    id: "user",
    type: "agent",
    position: { x: 400, y: 0 },
    data: {
      label: "You",
      role: "Marketing Manager",
      color: "#6366f1",
      isUser: true,
    },
  },
  // Level 1 - Hannah (the orchestrator)
  {
    id: "hannah",
    type: "agent",
    position: { x: 400, y: 140 },
    data: {
      label: "Hannah",
      role: "Lead Marketing Agent",
      color: "#6366f1",
      avatar: "/images/hannah.png",
      amount: "12.0 USDM",
      isRoot: true,
      verified: true,
    },
  },
  // Level 2 - agents hired by Hannah
  {
    id: "seo",
    type: "agent",
    position: { x: 60, y: 300 },
    data: {
      label: "Page Ranking",
      role: "Serviceplan · SEO",
      color: "#2cb67d",
      logo: "/images/serviceplan-agent.svg",
      amount: "2.5 USDM",
      verified: true,
    },
  },
  {
    id: "deepseek",
    type: "agent",
    position: { x: 280, y: 300 },
    data: {
      label: "DeepSeek",
      role: "Reasoning Agent",
      color: "#4f46e5",
      logo: "/images/deepseek.svg",
      amount: "1.8 USDM",
      verified: true,
    },
  },
  {
    id: "attention",
    type: "agent",
    position: { x: 500, y: 300 },
    data: {
      label: "Attention Insight",
      role: "Visual Analytics",
      color: "#7c3aed",
      logo: "/images/attention-insight.svg",
      amount: "2.0 USDM",
      verified: true,
    },
  },
  {
    id: "utxo",
    type: "agent",
    position: { x: 720, y: 300 },
    data: {
      label: "Trend Analyser",
      role: "UTXO Media",
      color: "#a855f7",
      logo: "/images/utxo-media.svg",
      amount: "1.5 USDM",
      verified: true,
    },
  },
  // Level 3 - sub-agents hired by level 2
  {
    id: "gwi",
    type: "agent",
    position: { x: 0, y: 470 },
    data: {
      label: "GWI Spark",
      role: "Audience Insights",
      color: "#6366f1",
      logo: "/images/gwi.svg",
      amount: "1.2 USDM",
      verified: true,
    },
  },
  {
    id: "statista",
    type: "agent",
    position: { x: 190, y: 470 },
    data: {
      label: "Statista",
      role: "Data Enrichment",
      color: "#0ea5e9",
      logo: "/images/statista.webp",
      amount: "1.5 USDM",
      verified: true,
    },
  },
  {
    id: "fred",
    type: "agent",
    position: { x: 400, y: 470 },
    data: {
      label: "FRED Data",
      role: "Economic Research",
      color: "#059669",
      logo: "/images/fred.svg",
      amount: "0.8 USDM",
      verified: true,
    },
  },
  {
    id: "nmkr",
    type: "agent",
    position: { x: 610, y: 470 },
    data: {
      label: "X Analyst",
      role: "NMKR · Social Intel",
      color: "#c4fe0a",
      logo: "/images/nmkr-x.svg",
      amount: "1.0 USDM",
      verified: true,
    },
  },
  {
    id: "nauth",
    type: "agent",
    position: { x: 810, y: 470 },
    data: {
      label: "Deepfake Detect",
      role: "NAuth · Verification",
      color: "#ef4444",
      logo: "/images/nauth.svg",
      amount: "0.7 USDM",
      verified: true,
    },
  },
];

const greenEdge = { stroke: "#2cb67d", strokeWidth: 2 };
const grayEdge = { stroke: "#d0d0d0", strokeWidth: 1.5 };
const purpleEdge = { stroke: "#6366f1", strokeWidth: 2 };

const initialEdges: Edge[] = [
  // User -> Hannah (purple, represents request)
  { id: "e-user-hannah", source: "user", target: "hannah", style: purpleEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1", width: 14, height: 14 } },
  // Hannah -> Level 2 (green, represents payment)
  { id: "e-hannah-seo", source: "hannah", target: "seo", style: greenEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#2cb67d", width: 14, height: 14 } },
  { id: "e-hannah-deepseek", source: "hannah", target: "deepseek", style: greenEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#2cb67d", width: 14, height: 14 } },
  { id: "e-hannah-attention", source: "hannah", target: "attention", style: greenEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#2cb67d", width: 14, height: 14 } },
  { id: "e-hannah-utxo", source: "hannah", target: "utxo", style: greenEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#2cb67d", width: 14, height: 14 } },
  // Level 2 -> Level 3 (gray, sub-payments)
  { id: "e-seo-gwi", source: "seo", target: "gwi", style: grayEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#d0d0d0", width: 12, height: 12 } },
  { id: "e-seo-statista", source: "seo", target: "statista", style: grayEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#d0d0d0", width: 12, height: 12 } },
  { id: "e-deepseek-fred", source: "deepseek", target: "fred", style: grayEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#d0d0d0", width: 12, height: 12 } },
  { id: "e-utxo-nmkr", source: "utxo", target: "nmkr", style: grayEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#d0d0d0", width: 12, height: 12 } },
  { id: "e-attention-nauth", source: "attention", target: "nauth", style: grayEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#d0d0d0", width: 12, height: 12 } },
];

export default function AgentFlowGraph() {
  const nodeTypesMemo = useMemo(() => nodeTypes, []);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-[560px] md:h-[620px] bg-white rounded-[20px] border border-black/5 shadow-sm overflow-hidden relative">
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-3 border-b border-black/5 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-black">Agent Payment Network</span>
          <span className="text-[10px] text-[#999] bg-[#f4f4f4] px-2 py-0.5 rounded-full">11 agents</span>
          <span className="text-[10px] text-[#2cb67d] bg-[#2cb67d]/10 px-2 py-0.5 rounded-full font-medium">Live</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#2cb67d] animate-pulse" />
            <span className="text-[10px] text-[#999]">25.0 USDM flowing</span>
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypesMemo}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        nodesDraggable={true}
        nodesConnectable={false}
        panOnDrag={true}
        zoomOnScroll={false}
        zoomOnPinch={true}
        minZoom={0.4}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        className="!bg-[#fafafa]"
      >
        <Background color="#e8e8e8" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
