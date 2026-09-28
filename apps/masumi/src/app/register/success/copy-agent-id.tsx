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
      <p className="text-xs font-medium text-masumi-muted">Network agent ID</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <div className="group relative min-w-0 flex-1">
          <p
            tabIndex={0}
            className="truncate font-mono text-sm text-masumi-ink outline-none focus-visible:ring-2 focus-visible:ring-masumi-pink/40 focus-visible:ring-offset-2 rounded-sm"
            aria-describedby="network-agent-id-tooltip"
          >
            {agentId}
          </p>
          <div
            id="network-agent-id-tooltip"
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden max-w-[min(100vw-3rem,28rem)] rounded-lg border border-masumi-border bg-white px-3 py-2 text-xs leading-relaxed font-mono text-masumi-ink shadow-md break-all group-hover:block group-focus-within:block"
          >
            {agentId}
          </div>
        </div>
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
