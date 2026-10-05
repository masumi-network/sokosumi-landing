import { Bot, FileCheck2, Workflow } from "lucide-react";
import motion from "./token-motion.module.css";

export default function PaymentSculpture({ stage = "agent", compact = false }: {
  stage?: "agent" | "task" | "receipt"; compact?: boolean;
}) {
  return <div aria-hidden="true" className={`${motion.scene} ${compact ? motion.compact : ""}`}>
    <div className={motion.halo} />
    <div className={motion.coordinates}><span>TOKEN2049</span><span>PREPROD / 2026</span></div>
    <div className={motion.stack}>
      <div className={motion.foundation}><span>MASUMI</span><span>AGENTIC COMMERCE</span></div>
      <div className={`${motion.plate} ${motion.receipt}`} data-active={stage === "receipt"}>
        <FileCheck2 size={24} strokeWidth={1.5} /><span>Receipt</span><span className={motion.micro}>USDM</span>
      </div>
      <div className={`${motion.plate} ${motion.task}`} data-active={stage === "task"}>
        <Workflow size={24} strokeWidth={1.5} /><span>Task</span><span className={motion.micro}>CARDANO</span>
      </div>
      <div className={`${motion.plate} ${motion.agent}`} data-active={stage === "agent"}>
        <Bot size={24} strokeWidth={1.5} /><span>Agent</span><span className={motion.micro}>SOKOSUMI</span>
      </div>
      <div className={motion.connector} />
    </div>
    <div className={motion.caption}><span className={motion.dot} />From agent to seller receipt</div>
  </div>;
}
