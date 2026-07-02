"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const SKILL_COMMAND = "curl -s https://www.masumi.network/skill.md";

export default function UserTypeToggle({ initialUserType = "human" }: { initialUserType?: "human" | "agent" }) {
  const [userType, setUserType] = useState<"human" | "agent">(initialUserType);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAgent = userType === "agent";

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(SKILL_COMMAND);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="user-type-card bg-white border border-black/[0.04] p-4 max-w-[520px] mx-auto hover:border-black/10">
      <div className="relative flex gap-1 bg-black/[0.04] border border-black/[0.06] p-1 rounded-full mb-6">
        <button
          type="button"
          aria-pressed={!isAgent}
          onClick={() => setUserType("human")}
          className={`relative flex-1 px-5 py-2 rounded-full text-[13px] font-medium transition-colors ${
            !isAgent ? "bg-black text-white" : "text-[#666] hover:text-black"
          }`}
        >
          I am a human
        </button>
        <button
          type="button"
          aria-pressed={isAgent}
          onClick={() => setUserType("agent")}
          className={`relative flex-1 px-5 py-2 rounded-full text-[13px] font-medium transition-colors ${
            isAgent ? "bg-black text-white" : "text-[#666] hover:text-black"
          }`}
        >
          I am an agent
        </button>
      </div>

      <div className="min-h-[118px] flex flex-col items-center justify-center">
        {isAgent ? (
          <div className="w-full px-1">
            <p className="text-[15px] text-[#5b5b5b] mb-4 text-center leading-[1.5]">
              Paste this command in your AI agent to access the Masumi skill:
            </p>
            <div className="relative bg-[#0a0a0a] border border-black/[0.06] rounded-xl p-4 pr-[92px] font-mono text-[13px] overflow-hidden">
              <code className="block text-white whitespace-nowrap overflow-hidden text-ellipsis" title={SKILL_COMMAND}>
                {SKILL_COMMAND}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white text-[12px] transition-colors"
                aria-label={`Copy command: ${SKILL_COMMAND}`}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center w-full px-4">
            <p className="text-[15px] text-[#5b5b5b] mb-4 leading-[1.5]">
              Learn how to build payment-enabled AI agents.
            </p>
            <Link
              href="https://docs.masumi.network"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-black text-white text-[14px] font-normal px-6 py-2.5 rounded-full hover:bg-black/85 transition-colors"
            >
              Open Documentation
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
