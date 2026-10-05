"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import ui from "./guide-ui.module.css";

export default function CopyButton({ text, label = "Copy command", dark = false, static: isStatic = false }: {
  text: string; label?: string; dark?: boolean; static?: boolean;
}) {
  const [feedback, setFeedback] = useState<{ text: string; status: "idle" | "copied" | "failed" }>({ text, status: "idle" });
  const status = feedback.text === text ? feedback.status : "idle";
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, [text]);
  const copied = status === "copied";
  return <div>
    <button type="button" aria-label={label} onClick={async () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
      try {
        await navigator.clipboard.writeText(text);
        setFeedback({ text, status: "copied" });
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setFeedback({ text, status: "idle" }), 2000);
      }
      catch { setFeedback({ text, status: "failed" }); }
    }} className={`${ui.button} ${dark ? ui.dark : ""} ${isStatic ? ui.static : ""}`}>
      <span className={ui.icon} aria-hidden="true">
        <Copy size={16} strokeWidth={2} className={`${ui.iconLayer} ${copied ? ui.iconHidden : ui.iconVisible}`} />
        <Check size={16} strokeWidth={2} className={`${ui.iconLayer} ${copied ? ui.iconVisible : ui.iconHidden}`} />
      </span>
      <span className="grid">
        <span className={`col-start-1 row-start-1 ${ui.copyText} ${copied ? ui.textHidden : ui.textVisible}`}>{label}</span>
        <span aria-hidden="true" className={`col-start-1 row-start-1 ${ui.copyText} ${copied ? ui.textVisible : ui.textHidden}`}>Copied</span>
      </span>
    </button>
    <span role="status" aria-live="polite" className={status === "failed" ? "mt-2 block text-sm" : "sr-only"}>
      {copied ? "Copied to clipboard." : status === "failed" ? "Copy failed. Copy the text below manually." : ""}
    </span>
    {status === "failed" && <textarea readOnly aria-label={`Text for ${label.toLowerCase()}`} value={text} rows={4} className={`mt-3 block w-full min-w-0 rounded-lg border p-3 font-mono text-sm ${dark ? "border-white/30 bg-[#171717] text-white" : "border-black/20 bg-white text-black"}`} />}
  </div>;
}
