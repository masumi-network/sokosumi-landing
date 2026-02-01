export default function ValueProps() {
  const problems = [
    {
      title: "Fragmented Workflows",
      description:
        "Work is split across tools, freelancers, agencies, and AI chats. Nothing connects.",
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Scattered tool icons */}
          <div className="absolute top-4 left-6 w-10 h-10 bg-white rounded-lg border border-black/5 flex items-center justify-center shadow-sm">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#bbb" strokeWidth="1.2"><rect x="2" y="2" width="14" height="14" rx="2"/><path d="M2 7h14"/></svg>
          </div>
          <div className="absolute top-8 right-8 w-10 h-10 bg-white rounded-lg border border-black/5 flex items-center justify-center shadow-sm">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#bbb" strokeWidth="1.2"><circle cx="9" cy="9" r="7"/><path d="M9 5v4l3 2"/></svg>
          </div>
          <div className="absolute bottom-8 left-10 w-10 h-10 bg-white rounded-lg border border-black/5 flex items-center justify-center shadow-sm">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#bbb" strokeWidth="1.2"><path d="M3 13l4-4 3 3 5-5"/></svg>
          </div>
          <div className="absolute bottom-4 right-6 w-10 h-10 bg-white rounded-lg border border-black/5 flex items-center justify-center shadow-sm">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#bbb" strokeWidth="1.2"><path d="M5 3h8v12H5z"/><path d="M8 7h2M8 10h2"/></svg>
          </div>
          {/* Broken connection lines */}
          <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="opacity-30">
            <path d="M10 20L55 40" stroke="#c0392b" strokeWidth="1" strokeDasharray="4 4"/>
            <path d="M110 20L65 40" stroke="#c0392b" strokeWidth="1" strokeDasharray="4 4"/>
            <path d="M30 70L55 45" stroke="#c0392b" strokeWidth="1" strokeDasharray="4 4"/>
            <path d="M95 70L65 45" stroke="#c0392b" strokeWidth="1" strokeDasharray="4 4"/>
            <circle cx="60" cy="40" r="3" fill="#c0392b" fillOpacity="0.4"/>
          </svg>
        </div>
      ),
    },
    {
      title: "AI Needs Babysitting",
      description:
        "Every prompt needs supervision. Quality is inconsistent. Managers coordinate instead of executing.",
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Chat bubbles showing constant back-and-forth */}
          <div className="flex flex-col gap-2 w-[180px]">
            <div className="self-end bg-black text-white text-[10px] px-3 py-1.5 rounded-xl rounded-br-sm max-w-[140px]">
              Write 3 ad variations for LinkedIn
            </div>
            <div className="self-start bg-white text-[10px] px-3 py-1.5 rounded-xl rounded-bl-sm border border-black/5 max-w-[140px] text-[#666]">
              Sure, here are some options...
            </div>
            <div className="self-end bg-black text-white text-[10px] px-3 py-1.5 rounded-xl rounded-br-sm max-w-[140px]">
              No, more professional tone
            </div>
            <div className="self-start bg-white text-[10px] px-3 py-1.5 rounded-xl rounded-bl-sm border border-black/5 max-w-[140px] text-[#666]">
              How about these revised...
            </div>
            <div className="self-end bg-[#c0392b]/10 text-[#c0392b] text-[10px] px-3 py-1.5 rounded-xl rounded-br-sm max-w-[140px] font-medium">
              Still not right. Try again.
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "More Complexity, Not Less",
      description:
        "AI was supposed to simplify things. Instead, it added another layer of tools to manage.",
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Stack of tool layers */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-[160px] h-7 bg-white rounded border border-black/5 flex items-center px-2.5 shadow-sm">
              <span className="text-[9px] text-[#999]">CRM Platform</span>
            </div>
            <div className="w-[160px] h-7 bg-white rounded border border-black/5 flex items-center px-2.5 shadow-sm">
              <span className="text-[9px] text-[#999]">Email Tool</span>
            </div>
            <div className="w-[160px] h-7 bg-white rounded border border-black/5 flex items-center px-2.5 shadow-sm">
              <span className="text-[9px] text-[#999]">Analytics Suite</span>
            </div>
            <div className="w-[160px] h-7 bg-white rounded border border-black/5 flex items-center px-2.5 shadow-sm">
              <span className="text-[9px] text-[#999]">Project Manager</span>
            </div>
            <div className="w-[160px] h-7 bg-[#c0392b]/5 rounded border border-[#c0392b]/15 flex items-center px-2.5">
              <span className="text-[9px] text-[#c0392b] font-medium">+ AI Chat Tool #1</span>
            </div>
            <div className="w-[160px] h-7 bg-[#c0392b]/5 rounded border border-[#c0392b]/15 flex items-center px-2.5">
              <span className="text-[9px] text-[#c0392b] font-medium">+ AI Chat Tool #2</span>
            </div>
            <div className="w-[160px] h-7 bg-[#c0392b]/5 rounded border border-[#c0392b]/15 flex items-center px-2.5">
              <span className="text-[9px] text-[#c0392b] font-medium">+ AI Image Generator</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="pt-24 pb-0">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="bg-white rounded-none p-8 md:p-12 lg:p-16">
          <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.31] text-black max-w-[500px]">
            The Problem Is Delivery, Not Ideas.
          </h2>
          <p className="mt-4 text-[17px] md:text-[21px] text-black leading-[1.41] max-w-[540px]">
            Marketing teams are expected to deliver more&mdash;without more
            people. AI was supposed to help. It hasn&rsquo;t.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-20">
            {problems.map((card) => (
              <div key={card.title} className="flex flex-col">
                <div className="h-[200px] bg-[#f9f9f9] rounded-lg mb-8 overflow-hidden">
                  {card.visual}
                </div>
                <h3 className="text-[20px] font-normal text-black leading-tight">
                  {card.title}
                </h3>
                <p className="mt-3 text-[16px] text-[#919191] leading-[1.31]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
