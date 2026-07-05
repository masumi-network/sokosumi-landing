"use client";

import dynamic from "next/dynamic";

const WorkflowGraph = dynamic(() => import("./WorkflowGraph"), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[300px] bg-[#f9f9f9] rounded-xl" />,
});

export default function LazyWorkflowGraph() {
  return <WorkflowGraph />;
}
