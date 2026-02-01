import { FadeIn } from "@summation/shared";

export default function ValueProps() {
  const problems = [
    {
      title: "Scattered Tools",
      description:
        "Work lives in 6 different places. Nothing connects.",
      visual: (
        <div className="relative w-full h-full flex items-center justify-center p-6">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-2 w-[72px] h-[52px] bg-white border border-black/10 rounded-lg flex flex-col items-center justify-center shadow-sm -rotate-3">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#999" strokeWidth="1.2"><rect x="2" y="2" width="14" height="14" rx="2"/><path d="M2 7h14"/></svg>
              <span className="text-[7px] text-[#999] mt-1">Calendar</span>
            </div>
            <div className="absolute top-1 right-4 w-[72px] h-[52px] bg-white border border-black/10 rounded-lg flex flex-col items-center justify-center shadow-sm rotate-2">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#999" strokeWidth="1.2"><circle cx="9" cy="9" r="7"/><path d="M9 5v4l3 2"/></svg>
              <span className="text-[7px] text-[#999] mt-1">Tracker</span>
            </div>
            <div className="absolute top-[55px] left-[38%] -translate-x-1/2 w-[72px] h-[52px] bg-white border border-black/10 rounded-lg flex flex-col items-center justify-center shadow-sm rotate-1">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#999" strokeWidth="1.2"><path d="M3 13l4-4 3 3 5-5"/></svg>
              <span className="text-[7px] text-[#999] mt-1">Analytics</span>
            </div>
            <div className="absolute top-[55px] right-[5%] w-[72px] h-[52px] bg-white border border-black/10 rounded-lg flex flex-col items-center justify-center shadow-sm -rotate-2">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#999" strokeWidth="1.2"><path d="M5 3h8v12H5z"/><path d="M8 7h2M8 10h2"/></svg>
              <span className="text-[7px] text-[#999] mt-1">Docs</span>
            </div>
            <div className="absolute bottom-[15px] left-3 w-[72px] h-[52px] bg-white border border-black/10 rounded-lg flex flex-col items-center justify-center shadow-sm rotate-3">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#999" strokeWidth="1.2"><path d="M3 5h12v8H3z"/><path d="M3 5l6 5 6-5"/></svg>
              <span className="text-[7px] text-[#999] mt-1">Email</span>
            </div>
            <div className="absolute bottom-[15px] right-2 w-[72px] h-[52px] bg-white border border-black/10 rounded-lg flex flex-col items-center justify-center shadow-sm -rotate-1">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#999" strokeWidth="1.2"><path d="M4 4h10a1 1 0 011 1v8a1 1 0 01-1 1h-3l-2 2v-2H4a1 1 0 01-1-1V5a1 1 0 011-1z"/></svg>
              <span className="text-[7px] text-[#999] mt-1">Chat</span>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FF2200]/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#FF2200" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8"/>
              </svg>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "AI Needs Babysitting",
      description:
        "Every prompt needs a human. You manage AI instead of doing work.",
      visual: (
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <div className="flex flex-col gap-1.5 w-[200px]">
            <div className="self-end bg-black text-white text-[10px] px-3 py-1.5 rounded-xl rounded-br-sm max-w-[150px]">
              Write 3 ad variations
            </div>
            <div className="self-start bg-white text-[10px] px-3 py-1.5 rounded-xl rounded-bl-sm border border-black/5 max-w-[150px] text-[#666]">
              Sure, here are some options...
            </div>
            <div className="self-end bg-black text-white text-[10px] px-3 py-1.5 rounded-xl rounded-br-sm max-w-[150px]">
              No, more professional
            </div>
            <div className="self-start bg-white text-[10px] px-3 py-1.5 rounded-xl rounded-bl-sm border border-black/5 max-w-[150px] text-[#666]">
              How about these revised...
            </div>
            <div className="self-end bg-black text-white text-[10px] px-3 py-1.5 rounded-xl rounded-br-sm max-w-[150px]">
              Still wrong. Again.
            </div>
            <div className="self-start bg-white text-[10px] px-3 py-1.5 rounded-xl rounded-bl-sm border border-black/5 max-w-[150px] text-[#666]">
              Let me try once more...
            </div>
            <div className="self-end flex items-center gap-1.5 mt-1">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-1 rounded-full bg-[#FF2200]" style={{ height: 4 + i * 2 }} />
                ))}
              </div>
              <span className="text-[9px] text-[#FF2200] font-medium">12 prompts later...</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "More Tools, Not Less",
      description:
        "AI added another layer to manage. Not less work\u2014more.",
      visual: (
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-1">
            {[
              { label: "CRM Platform", isAI: false },
              { label: "Email Tool", isAI: false },
              { label: "Analytics Suite", isAI: false },
              { label: "Project Manager", isAI: false },
              { label: "+ AI Chat Tool #1", isAI: true },
              { label: "+ AI Chat Tool #2", isAI: true },
              { label: "+ AI Image Gen", isAI: true },
            ].map((item) => (
              <div
                key={item.label}
                className={`w-[170px] h-[26px] rounded flex items-center px-2.5 text-[9px] font-medium ${
                  item.isAI
                    ? "bg-[#FF2200]/8 border border-[#FF2200]/20 text-[#FF2200]"
                    : "bg-white border border-black/8 text-[#777] shadow-sm"
                }`}
              >
                {item.label}
              </div>
            ))}
            <div className="mt-1 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#FF2200" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2v8M3 7l3 3 3-3"/>
              </svg>
              <span className="text-[9px] text-[#FF2200] font-medium">Stack keeps growing</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="pt-24 pb-0">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="bg-white p-8 md:p-12 lg:p-16 border-t-[4px] border-[#FF2200]">
          <FadeIn>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF2200]" />
              <span className="text-[14px] text-[#FF2200] font-medium tracking-wide uppercase">The Problem</span>
            </div>
            <h2 className="text-[28px] md:text-[40px] lg:text-[48px] font-normal tracking-[-0.5px] leading-[1.1] text-black">
              Ideas Aren&rsquo;t the Problem. Delivery Is.
            </h2>
            <p className="mt-4 text-[17px] md:text-[21px] text-[#777] leading-[1.41] max-w-[540px]">
              More work, same team, no help from AI. Yet.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {problems.map((card, i) => (
              <FadeIn key={card.title} delay={i * 100}>
                <div className="flex flex-col">
                  <div className="h-[220px] bg-[#FFF5F4] border border-[#FF2200]/10 rounded-lg mb-6 overflow-hidden">
                    {card.visual}
                  </div>
                  <h3 className="text-[20px] font-normal text-black leading-tight">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-[16px] text-[#777] leading-[1.4]">
                    {card.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
