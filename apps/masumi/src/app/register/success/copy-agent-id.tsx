"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export function CopyAgentId({
  agentId,
  className,
}: {
  agentId: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(agentId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-masumi-border bg-white px-5 py-4 text-left shadow-sm",
        className,
      )}
    >
      <p className="text-xs font-medium text-masumi-muted">Agent ID</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="min-w-0 break-all font-mono text-sm text-masumi-ink">
          {agentId}
        </p>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-masumi-border px-3 py-1.5 text-xs font-medium text-masumi-ink hover:bg-masumi-surface"
          aria-label={copied ? "Copied agent ID" : "Copy agent ID"}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
