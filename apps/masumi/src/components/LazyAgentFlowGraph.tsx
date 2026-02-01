"use client";

import dynamic from "next/dynamic";

const AgentFlowGraph = dynamic(() => import("@/components/AgentFlowGraph"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[560px] md:h-[620px] bg-[#111] border border-white/[0.08]" />
  ),
});

export default function LazyAgentFlowGraph() {
  return <AgentFlowGraph />;
}
