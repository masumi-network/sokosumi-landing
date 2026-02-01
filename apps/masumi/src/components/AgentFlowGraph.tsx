"use client";

import { useMemo, useState, useCallback, createContext, useContext } from "react";
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

interface AgentData {
  label: string;
  role: string;
  color: string;
  avatar?: string;
  amount?: string;
  isRoot?: boolean;
  verified?: boolean;
  description?: string;
  capabilities?: string[];
}

const ModalContext = createContext<(agent: AgentData | null) => void>(() => {});

function AgentNode({ data }: NodeProps) {
  const d = data as unknown as AgentData;
  const openModal = useContext(ModalContext);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`relative ${d.isRoot ? "scale-110" : ""}`}>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-3 !h-3" />
      <div
        onClick={() => openModal(d)}
        className={`bg-[#1a1a1a] border px-4 py-3 min-w-[150px] max-w-[180px] cursor-pointer transition-all hover:border-white/60 ${d.isRoot ? "border-white/50" : "border-white/30"}`}
      >
        <div className="flex items-center gap-2.5 mb-1.5">
          {d.avatar ? (
            <img src={d.avatar} alt={d.label} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
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
              <p className="text-[11px] font-medium text-white leading-tight truncate">{d.label}</p>
              {d.verified && (
                <div
                  className="relative flex-shrink-0"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#FA008C" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="12" cy="12" r="10" fill="#FA008C" />
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                  {showTooltip && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-black text-white text-[9px] whitespace-nowrap z-50">
                      Identity Verified on Masumi
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-black" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-[9px] text-white/65 truncate">{d.role}</p>
          </div>
        </div>
        {d.amount && (
          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/25">
            <span className="text-[9px] text-white/55">Payment</span>
            <span className="text-[11px] font-medium text-[#FA008C]">{d.amount}</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-3 !h-3" />
    </div>
  );
}

function AgentModal({ agent, onClose }: { agent: AgentData; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4" onClick={onClose}>
      <div
        className="bg-[#1a1a1a] border border-white/30 w-full max-w-[340px] p-6 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {agent.avatar ? (
              <img src={agent.avatar} alt={agent.label} className="w-11 h-11 rounded-full object-cover" />
            ) : (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[15px] font-medium"
                style={{ backgroundColor: agent.color }}
              >
                {agent.label[0]}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[15px] font-medium text-white">{agent.label}</h3>
                {agent.verified && (
                  <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#FA008C" />
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                )}
              </div>
              <p className="text-[12px] text-white/65">{agent.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 -mr-1 -mt-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <p className="text-[13px] text-white/70 leading-[1.5] mb-4">
          {agent.description}
        </p>

        {agent.capabilities && agent.capabilities.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] text-white/55 uppercase tracking-wide mb-2">Capabilities</p>
            <div className="flex flex-wrap gap-1.5">
              {agent.capabilities.map((cap) => (
                <span key={cap} className="text-[11px] text-white/70 bg-white/[0.08] px-2.5 py-1 rounded-full">{cap}</span>
              ))}
            </div>
          </div>
        )}

        {agent.amount && (
          <div className="flex items-center justify-between py-3 border-t border-white/25 mb-4">
            <span className="text-[12px] text-white/55">Cost per task</span>
            <span className="text-[14px] font-medium text-[#FA008C]">{agent.amount}</span>
          </div>
        )}

        <a
          href="https://sokosumi.com"
          className="flex items-center justify-center gap-2 bg-white text-black text-[13px] font-medium rounded-full px-5 py-2.5 hover:bg-white/90 transition-colors w-full"
        >
          Hire Agent on Sokosumi
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6.75v2.75a.5.5 0 01-.5.5h-6a.5.5 0 01-.5-.5v-6a.5.5 0 01.5-.5H5.25" />
            <path d="M7.5 2h2.5v2.5" />
            <path d="M5.5 6.5L10 2" />
          </svg>
        </a>
      </div>
    </div>
  );
}

const nodeTypes = { agent: AgentNode };

const initialNodes: Node[] = [
  {
    id: "hannah",
    type: "agent",
    position: { x: 500, y: 0 },
    data: {
      label: "Hannah",
      role: "Lead Marketing Agent",
      color: "#460A23",
      avatar: "/images/hannah.png",
      amount: "12.0 USDM",
      isRoot: true,
      verified: true,
      description: "Hannah orchestrates entire marketing campaigns by coordinating specialist agents. She plans strategy, delegates tasks, and ensures all deliverables meet quality standards.",
      capabilities: ["Campaign Planning", "Agent Coordination", "Quality Assurance", "Budget Management"],
    },
  },
  {
    id: "lena",
    type: "agent",
    position: { x: 140, y: 160 },
    data: {
      label: "Lena",
      role: "Research Strategist",
      color: "#FF6ED2",
      avatar: "/images/hannah.png",
      amount: "3.2 USDM",
      verified: true,
      description: "Lena conducts deep audience research and competitive analysis. She synthesizes data from multiple sources into actionable strategic insights.",
      capabilities: ["Audience Analysis", "Competitive Intel", "Market Research", "Segmentation"],
    },
  },
  {
    id: "marcus",
    type: "agent",
    position: { x: 380, y: 160 },
    data: {
      label: "Marcus",
      role: "Data Scientist",
      color: "#460A23",
      avatar: "/images/hannah.png",
      amount: "2.6 USDM",
      verified: true,
      description: "Marcus transforms raw data into predictive models and visual reports. He identifies patterns and delivers data-driven recommendations.",
      capabilities: ["Predictive Modeling", "Data Visualization", "Statistical Analysis", "A/B Testing"],
    },
  },
  {
    id: "sofia",
    type: "agent",
    position: { x: 620, y: 160 },
    data: {
      label: "Sofia",
      role: "Creative Director",
      color: "#FF51FF",
      avatar: "/images/hannah.png",
      amount: "2.7 USDM",
      verified: true,
      description: "Sofia generates creative concepts, ad copy, and visual direction. She ensures brand consistency across all campaign assets.",
      capabilities: ["Ad Copy", "Creative Strategy", "Brand Guidelines", "Content Verification"],
    },
  },
  {
    id: "kai",
    type: "agent",
    position: { x: 860, y: 160 },
    data: {
      label: "Kai",
      role: "Media & Social Lead",
      color: "#FF6ED2",
      avatar: "/images/hannah.png",
      amount: "2.5 USDM",
      verified: true,
      description: "Kai manages social media strategy, monitors trends, and optimizes paid media placement across platforms.",
      capabilities: ["Social Strategy", "Trend Monitoring", "Paid Media", "Platform Analytics"],
    },
  },
  {
    id: "gwi",
    type: "agent",
    position: { x: 60, y: 340 },
    data: {
      label: "GWI Spark",
      role: "Audience Insights",
      color: "#460A23",
      amount: "1.2 USDM",
      verified: true,
      description: "Connects to GWI's global consumer dataset to deliver detailed audience profiling, demographics, and behavioral insights.",
      capabilities: ["Consumer Data", "Demographics", "Behavioral Insights"],
    },
  },
  {
    id: "statista",
    type: "agent",
    position: { x: 100, y: 340 },
    data: {
      label: "Statista",
      role: "Data Enrichment",
      color: "#FA008C",
      amount: "1.5 USDM",
      verified: true,
      description: "Pulls verified statistics and market data from Statista's database to enrich reports and validate strategic assumptions.",
      capabilities: ["Market Stats", "Industry Data", "Trend Reports"],
    },
  },
  {
    id: "attention",
    type: "agent",
    position: { x: 300, y: 340 },
    data: {
      label: "Attention Insight",
      role: "Visual Analytics",
      color: "#FF51FF",
      amount: "2.0 USDM",
      verified: true,
      description: "Uses AI-powered attention heatmaps to predict where users will look on ads and landing pages before they go live.",
      capabilities: ["Attention Heatmaps", "Design Optimization", "Pre-launch Testing"],
    },
  },
  {
    id: "nauth",
    type: "agent",
    position: { x: 540, y: 340 },
    data: {
      label: "Deepfake Detect",
      role: "Verification",
      color: "#460A23",
      amount: "0.7 USDM",
      verified: true,
      description: "Scans images and video for deepfake manipulation to ensure authenticity of creative assets before publishing.",
      capabilities: ["Deepfake Detection", "Image Verification", "Content Authenticity"],
    },
  },
  {
    id: "trend",
    type: "agent",
    position: { x: 780, y: 340 },
    data: {
      label: "Trend Analyser",
      role: "Media Trends",
      color: "#FF6ED2",
      amount: "1.5 USDM",
      verified: true,
      description: "Monitors media and cultural trends across platforms, identifying emerging topics and viral patterns relevant to campaigns.",
      capabilities: ["Trend Detection", "Cultural Analysis", "Viral Patterns"],
    },
  },
  {
    id: "nmkr",
    type: "agent",
    position: { x: 1020, y: 340 },
    data: {
      label: "X Analyst",
      role: "Social Intel",
      color: "#FF6400",
      amount: "1.0 USDM",
      verified: true,
      description: "Analyzes X (Twitter) conversations, sentiment, and engagement patterns to inform social media strategy and content planning.",
      capabilities: ["Sentiment Analysis", "Engagement Tracking", "Hashtag Analytics"],
    },
  },
];

const greenEdge = { stroke: "#FA008C", strokeWidth: 2 };
const grayEdge = { stroke: "#444", strokeWidth: 1.5 };

const initialEdges: Edge[] = [
  // Hannah -> Coworkers
  { id: "e-hannah-lena", source: "hannah", target: "lena", style: greenEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#FA008C", width: 14, height: 14 } },
  { id: "e-hannah-marcus", source: "hannah", target: "marcus", style: greenEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#FA008C", width: 14, height: 14 } },
  { id: "e-hannah-sofia", source: "hannah", target: "sofia", style: greenEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#FA008C", width: 14, height: 14 } },
  { id: "e-hannah-kai", source: "hannah", target: "kai", style: greenEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#FA008C", width: 14, height: 14 } },
  // Lena -> Research agents
  { id: "e-lena-gwi", source: "lena", target: "gwi", style: grayEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#444", width: 12, height: 12 } },
  { id: "e-lena-statista", source: "lena", target: "statista", style: grayEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#444", width: 12, height: 12 } },
  // Marcus -> Data agents
  { id: "e-marcus-attention", source: "marcus", target: "attention", style: grayEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#444", width: 12, height: 12 } },
  // Sofia -> Creative agents
  { id: "e-sofia-nauth", source: "sofia", target: "nauth", style: grayEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#444", width: 12, height: 12 } },
  // Kai -> Media agents
  { id: "e-kai-trend", source: "kai", target: "trend", style: grayEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#444", width: 12, height: 12 } },
  { id: "e-kai-nmkr", source: "kai", target: "nmkr", style: grayEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#444", width: 12, height: 12 } },
];

export default function AgentFlowGraph() {
  const nodeTypesMemo = useMemo(() => nodeTypes, []);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);

  const handleOpenModal = useCallback((agent: AgentData | null) => {
    setSelectedAgent(agent);
  }, []);

  return (
    <ModalContext.Provider value={handleOpenModal}>
      <div className="w-full h-[560px] md:h-[620px] bg-[#111] border border-white/[0.08] overflow-hidden relative">

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
          className="!bg-[#111]"
        >
          <Background color="#222" gap={20} size={1} />
        </ReactFlow>

        {selectedAgent && (
          <AgentModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
        )}
      </div>
    </ModalContext.Provider>
  );
}
