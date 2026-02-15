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

interface AgentData {
  label: string;
  role: string;
  color: string;
  avatar?: string;
  isRoot?: boolean;
}

function AgentNode({ data }: NodeProps) {
  const d = data as unknown as AgentData;

  return (
    <div className={`relative group ${d.isRoot ? "scale-110" : ""}`}>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-3 !h-3" />
      <div
        className={`bg-white border px-4 py-3 min-w-[140px] shadow-sm cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${d.isRoot ? "max-w-[200px] border-black/20" : "max-w-[170px] border-black/[0.08]"}`}
      >
        <div className="flex items-center gap-2.5">
          {d.avatar ? (
            <img src={d.avatar} alt={d.label} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-medium flex-shrink-0"
              style={{ backgroundColor: d.color }}
            >
              {d.label[0]}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-black leading-tight truncate">{d.label}</p>
            <p className="text-[9px] text-[#999] truncate">{d.role}</p>
          </div>
          <svg className="w-3 h-3 text-black/0 group-hover:text-black/20 transition-colors flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="3.5" cy="2" r="1" />
            <circle cx="8.5" cy="2" r="1" />
            <circle cx="3.5" cy="6" r="1" />
            <circle cx="8.5" cy="6" r="1" />
            <circle cx="3.5" cy="10" r="1" />
            <circle cx="8.5" cy="10" r="1" />
          </svg>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-3 !h-3" />
    </div>
  );
}

const nodeTypes = { agent: AgentNode };

const initialNodes: Node[] = [
  {
    id: "hannah",
    type: "agent",
    position: { x: 280, y: 0 },
    data: {
      label: "Orchestrator Agent",
      role: "Coordinates Workflow",
      color: "#6400FF",
      avatar: "/images/hannah.png",
      isRoot: true,
    },
  },
  {
    id: "john",
    type: "agent",
    position: { x: 60, y: 150 },
    data: {
      label: "John",
      role: "Project Manager",
      color: "#00A4FA",
      avatar: "/images/hannah.png",
    },
  },
  {
    id: "seo",
    type: "agent",
    position: { x: 280, y: 150 },
    data: {
      label: "SEO Agent",
      role: "SEO Specialist",
      color: "#0AFED3",
      avatar: "/images/hannah.png",
    },
  },
  {
    id: "copy",
    type: "agent",
    position: { x: 500, y: 150 },
    data: {
      label: "Copy Agent",
      role: "Copywriter",
      color: "#FF6400",
      avatar: "/images/hannah.png",
    },
  },
  {
    id: "gwi",
    type: "agent",
    position: { x: 60, y: 300 },
    data: {
      label: "GWI Spark",
      role: "Audience Insights",
      color: "#460A23",
    },
  },
  {
    id: "semrush",
    type: "agent",
    position: { x: 280, y: 300 },
    data: {
      label: "Semrush",
      role: "SEO Data",
      color: "#FF6400",
    },
  },
  {
    id: "summarizer",
    type: "agent",
    position: { x: 500, y: 300 },
    data: {
      label: "Summarizer",
      role: "Reports",
      color: "#C4FE0A",
    },
  },
];

const primaryEdge = { stroke: "#000", strokeWidth: 1.5 };
const secondaryEdge = { stroke: "#ccc", strokeWidth: 1.2 };

const initialEdges: Edge[] = [
  { id: "e-h-john", source: "hannah", target: "john", style: primaryEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#000", width: 12, height: 12 } },
  { id: "e-h-seo", source: "hannah", target: "seo", style: primaryEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#000", width: 12, height: 12 } },
  { id: "e-h-copy", source: "hannah", target: "copy", style: primaryEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#000", width: 12, height: 12 } },
  { id: "e-john-gwi", source: "john", target: "gwi", style: secondaryEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#ccc", width: 10, height: 10 } },
  { id: "e-seo-semrush", source: "seo", target: "semrush", style: secondaryEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#ccc", width: 10, height: 10 } },
  { id: "e-copy-summarizer", source: "copy", target: "summarizer", style: secondaryEdge, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: "#ccc", width: 10, height: 10 } },
];

export default function WorkflowGraph() {
  const nodeTypesMemo = useMemo(() => nodeTypes, []);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <div className="relative w-full h-full min-h-[300px] bg-[#f9f9f9] rounded-xl overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          onNodesChange(changes);
          if (changes.some((c) => c.type === "position")) setHasInteracted(true);
        }}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypesMemo}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={true}
        nodesConnectable={false}
        panOnDrag={true}
        zoomOnScroll={false}
        zoomOnPinch={true}
        minZoom={0.4}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        className="!bg-[#f9f9f9]"
      >
        <Background color="#e5e5e5" gap={20} size={1} />
      </ReactFlow>
      {!hasInteracted && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[10px] text-black/30 pointer-events-none animate-pulse">
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 1v4M4 3l2 2 2-2M1 7.5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2" />
          </svg>
          Drag nodes to rearrange
        </div>
      )}
    </div>
  );
}
