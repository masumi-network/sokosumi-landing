"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({ text, label = "Copy command", dark = false }: { text: string; label?: string; dark?: boolean }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  return <div>
    <button type="button" onClick={async () => {
      try { await navigator.clipboard.writeText(text); setStatus("copied"); }
      catch { setStatus("failed"); }
    }} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 ${dark ? "border-white/30 text-white hover:bg-white/10 focus-visible:outline-white" : "border-[#460A23]/20 bg-[#460A23] text-white hover:bg-[#671037] focus-visible:outline-[#460A23]"}`}>
      {status === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      {status === "copied" ? "Copied" : label}
    </button>
    <span role="status" aria-live="polite" className={status === "failed" ? "mt-2 block text-sm" : "sr-only"}>
      {status === "copied" ? `${label} copied.` : status === "failed" ? "Copy failed. Open the Markdown guide or select the command text to copy it manually." : ""}
    </span>
  </div>;
}
