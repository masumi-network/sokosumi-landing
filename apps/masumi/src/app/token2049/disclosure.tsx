import { ChevronDown } from "lucide-react";
import ui from "./guide-ui.module.css";

export default function Disclosure({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <details className={ui.disclosure}>
    <summary className={ui.summary}>
      <span className="min-w-0"><span className="block">{title}</span>{description && <span className="mt-1.5 block text-sm font-normal leading-6 text-[#454545]">{description}</span>}</span>
      <ChevronDown size={18} strokeWidth={2} aria-hidden="true" className={ui.chevron} />
    </summary>
    <div className={`${ui.disclosureBody} space-y-5`}>{children}</div>
  </details>;
}
