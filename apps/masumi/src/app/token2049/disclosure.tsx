import { ChevronDown } from "lucide-react";
import ui from "./guide-ui.module.css";

export default function Disclosure({ title, children }: { title: string; children: React.ReactNode }) {
  return <details className={ui.disclosure}>
    <summary className={ui.summary}>
      <span>{title}</span>
      <ChevronDown size={18} strokeWidth={2} aria-hidden="true" className={ui.chevron} />
    </summary>
    <div className={`${ui.disclosureBody} space-y-5`}>{children}</div>
  </details>;
}
