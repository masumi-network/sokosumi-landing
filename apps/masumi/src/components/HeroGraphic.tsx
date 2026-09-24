// Decorative hero illustration for the Agent Explorer.
// Conveys the page story: agents are listed in a trusted registry, then
// transact with escrow-backed payments settling on-chain.

const REGISTRY = [
  { name: "Research Assistant", color: "#460A23", txns: "1.2k" },
  { name: "Ad Visuals Generator", color: "#FA008C", txns: "892" },
  { name: "Website Audit", color: "#FF6400", txns: "567" },
];

export default function HeroGraphic() {
  return (
    <div className="relative w-full max-w-[460px] mx-auto lg:ml-auto">
      <style>{`
        @keyframes pulseFlow {
          0% { left: 4%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 92%; opacity: 0; }
        }
      `}</style>

      {/* soft brand backdrop */}
      <div className="absolute -inset-6 bg-gradient-to-br from-[#FA008C]/[0.10] via-[#FF6ED2]/[0.05] to-[#FF6400]/[0.06] blur-3xl rounded-full pointer-events-none" />

      <div className="relative bg-white border border-black/[0.08] rounded-2xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.30)] p-5 flex flex-col gap-4">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#FA008C] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 010 3h-3a1.5 1.5 0 000 3h4" />
              </svg>
            </div>
            <span className="text-[13px] font-medium text-black">Agent marketplace</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#999]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FA008C] opacity-70" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FA008C]" />
            </span>
            on-chain
          </span>
        </div>

        {/* escrow transaction flow: Buyer -> escrow -> Agent */}
        <div className="rounded-xl bg-[#FAFAFA] border border-black/[0.05] p-4">
          <div className="flex items-center justify-between">
            {/* Buyer */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-[#460A23] flex items-center justify-center text-white text-[13px] font-medium">A</div>
              <span className="text-[10px] text-[#999]">Buyer</span>
            </div>

            {/* connector with escrow lock + flowing dot */}
            <div className="flex-1 px-3">
              <div className="relative h-[2px] bg-black/[0.1] rounded-full">
                <span
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#FA008C]"
                  style={{ animation: "pulseFlow 2.4s ease-in-out infinite" }}
                />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-black/[0.1] flex items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FA008C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 018 0v3" />
                  </svg>
                </div>
              </div>
              <p className="text-center text-[9px] text-[#bbb] mt-2">escrow</p>
            </div>

            {/* Agent */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-[#FA008C] flex items-center justify-center text-white text-[13px] font-medium">B</div>
              <span className="text-[10px] text-[#999]">Agent</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between bg-[#FA008C]/[0.08] rounded-lg px-3 py-2">
            <span className="text-[11px] font-medium text-[#FA008C]">Payment released</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#FA008C]">
              +2.50 USDM
              <svg width="12" height="12" viewBox="0 0 12 12" fill="#FA008C">
                <circle cx="6" cy="6" r="6" />
                <path d="M3.5 6l1.5 1.5 3-3.5" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        {/* registry entries */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.07em] text-[#999]">Registry</span>
            <span className="text-[10px] text-[#bbb]">verified agents</span>
          </div>
          {REGISTRY.map((a) => (
            <div key={a.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-medium" style={{ backgroundColor: a.color }}>
                  {a.name[0]}
                </div>
                <span className="text-[12px] text-black">{a.name}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="#FA008C">
                  <circle cx="6" cy="6" r="6" />
                  <path d="M3.5 6l1.5 1.5 3-3.5" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[10px] text-[#bbb]">{a.txns} txns</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
