"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function UserTypeToggle() {
  const [userType, setUserType] = useState<"human" | "agent">("human");
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const skillUrl = "curl -s https://masumi.network/skill.md";

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(skillUrl);
      if (!isMountedRef.current) return;
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 2000);
    } catch {
      if (isMountedRef.current) setCopied(false);
    }
  };

  return (
    <div className="user-type-card relative bg-white/80 backdrop-blur-sm border border-black/[0.06] p-4 max-w-[520px] mx-auto shadow-sm">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#FA008C]/10 rounded-full blur-3xl animate-drift1" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#460A23]/10 rounded-full blur-3xl animate-drift2" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Toggle */}
        <div className="flex gap-2 bg-[#F5F5F5] p-1.5 rounded-xl mb-6">
          <button
            onClick={() => setUserType("human")}
            className={`flex-1 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-300 ${
              userType === "human"
                ? "bg-white text-black shadow-sm"
                : "text-[#999] hover:text-black"
            }`}
          >
            I am a human
          </button>
          <button
            onClick={() => setUserType("agent")}
            className={`flex-1 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-300 ${
              userType === "agent"
                ? "bg-white text-black shadow-sm"
                : "text-[#999] hover:text-black"
            }`}
          >
            I am an agent
          </button>
        </div>

        {/* Content based on selection */}
        <div className="relative overflow-hidden transition-all duration-500 ease-in-out" style={{ minHeight: '100px' }}>
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
              userType === "human"
                ? "opacity-100 translate-x-0 pointer-events-auto"
                : "opacity-0 -translate-x-8 pointer-events-none"
            }`}
          >
            <div className="human-content text-center w-full px-4">
              <p className="text-[15px] text-[#5b5b5b] mb-4 leading-[1.5]">
                Learn how to build payment-enabled AI agents.
              </p>
              <Link
                href="https://docs.masumi.network"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-black text-white text-[14px] font-normal px-6 py-2.5 rounded-full hover:bg-black/85 transition-all duration-300 hover:scale-105"
              >
                Open Documentation
              </Link>
            </div>
          </div>

          <div
            className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
              userType === "agent"
                ? "opacity-100 translate-x-0 pointer-events-auto"
                : "opacity-0 translate-x-8 pointer-events-none"
            }`}
          >
            <div className="agent-content w-full px-4">
              <p className="text-[15px] text-[#5b5b5b] mb-4 text-center leading-[1.5]">
                Paste this command in your AI agent to access the Masumi skill:
              </p>
              <div className="relative group">
                <div className="bg-[#0a0a0a] border border-black/[0.06] rounded-xl p-4 font-mono text-[13px] overflow-x-auto">
                  <code className="text-white whitespace-nowrap">{skillUrl}</code>
                </div>
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-[12px] transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  {copied ? (
                    <span className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
