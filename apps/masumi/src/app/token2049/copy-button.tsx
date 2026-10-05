"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import ui from "./guide-ui.module.css";

export default function CopyButton({ text, label = "Copy command", dark = false, static: isStatic = false }: {
  text: string; label?: string; dark?: boolean; static?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const copied = status === "copied";
  return <div>
    <button type="button" aria-label={label} onClick={async () => {
      try { await navigator.clipboard.writeText(text); setStatus("copied"); }
      catch { setStatus("failed"); }
    }} className={`${ui.button} ${dark ? ui.dark : ""} ${isStatic ? ui.static : ""}`}>
      <span className={ui.icon} aria-hidden="true">
        <Copy size={16} strokeWidth={2} className={`${ui.iconLayer} ${copied ? ui.iconHidden : ui.iconVisible}`} />
        <Check size={16} strokeWidth={2} className={`${ui.iconLayer} ${copied ? ui.iconVisible : ui.iconHidden}`} />
      </span>
      <span className="grid">
        <span className={`col-start-1 row-start-1 ${copied ? "invisible" : ""}`}>{label}</span>
        <span aria-hidden="true" className={`col-start-1 row-start-1 ${copied ? "" : "invisible"}`}>Copied</span>
      </span>
    </button>
    <span role="status" aria-live="polite" className={status === "failed" ? "mt-2 block text-sm" : "sr-only"}>
      {copied ? `${label} copied.` : status === "failed" ? "Copy failed. Select the text and copy it manually." : ""}
    </span>
  </div>;
}
