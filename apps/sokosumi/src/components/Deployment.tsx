import { FadeIn } from "@summation/shared";

export default function Deployment() {
  const channels = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="4" y="4" width="20" height="16" rx="2" />
          <path d="M4 10H24" />
          <rect x="7" y="14" width="6" height="3" rx="0.5" />
          <rect x="15" y="14" width="6" height="3" rx="0.5" />
        </svg>
      ),
      title: "Task Board",
      description:
        "See what each agent is doing. Review and approve before anything ships.",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M6 8h16v12a2 2 0 01-2 2H8a2 2 0 01-2-2V8z" />
          <path d="M6 8l8 6 8-6" />
        </svg>
      ),
      title: "Chat, Email & Slack",
      description:
        "Assign work where your team already works.",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="5" y="4" width="18" height="20" rx="2" />
          <path d="M9 9h10M9 13h10M9 17h6" />
          <circle cx="20" cy="20" r="4" fill="white" />
          <path d="M18 20h4M20 18v4" strokeLinecap="round" />
        </svg>
      ),
      title: "Full Audit Trail",
      description:
        "Every action logged. Timestamps, agent names, full history.",
    },
  ];

  const integrationIcons = [
    { name: "Slack", icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4.5 12.5a2 2 0 11-2-2h2v2zM5.5 12.5a2 2 0 012-2v4a2 2 0 01-2-2zM7.5 4.5a2 2 0 112 2h-2v-2zM7.5 5.5a2 2 0 01-2 2h4a2 2 0 01-2-2z" fill="#999"/>
        <path d="M15.5 7.5a2 2 0 11-2 2h2v-2zM14.5 7.5a2 2 0 01-2 2v-4a2 2 0 012 2zM12.5 15.5a2 2 0 11-2-2h2v2zM12.5 14.5a2 2 0 012-2h-4a2 2 0 012 2z" fill="#999"/>
      </svg>
    )},
    { name: "Teams", icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="5" width="14" height="10" rx="1.5" fill="none" stroke="#999" strokeWidth="1.2"/>
        <circle cx="10" cy="8" r="2" fill="none" stroke="#999" strokeWidth="1"/>
        <path d="M7 14c0-1.7 1.3-3 3-3s3 1.3 3 3" fill="none" stroke="#999" strokeWidth="1"/>
        <circle cx="15" cy="7" r="1.5" fill="none" stroke="#999" strokeWidth="0.8"/>
      </svg>
    )},
    { name: "Email", icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#999" strokeWidth="1.2">
        <rect x="3" y="5" width="14" height="10" rx="1.5"/>
        <path d="M3 5l7 5 7-5"/>
      </svg>
    )},
    { name: "Chat", icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#999" strokeWidth="1.2">
        <path d="M4 4h12a1 1 0 011 1v8a1 1 0 01-1 1h-4l-3 3v-3H4a1 1 0 01-1-1V5a1 1 0 011-1z"/>
        <path d="M7 8h6M7 11h3"/>
      </svg>
    )},
    { name: "API", icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#999" strokeWidth="1.2">
        <path d="M6 7L3 10l3 3M14 7l3 3-3 3M11 4l-2 12"/>
      </svg>
    )},
  ];

  return (
    <section className="pt-16" aria-label="Deployment and integrations">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="bg-[#eaeaea] p-8 md:p-12 lg:p-16">
          <FadeIn>
            <h2 className="text-[28px] md:text-[36px] font-normal tracking-[-0.36px] leading-[1.31] text-black mb-2">
              Human-First by Design
            </h2>
            <h3 className="text-[22px] md:text-[28px] font-normal tracking-[-0.28px] leading-[1.31] text-black max-w-[520px]">
              Full control. No black box.
            </h3>
          </FadeIn>

          {/* Integration channel bar */}
          <FadeIn delay={100}>
            <div className="mt-12 mb-16 bg-[#ddd] rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-medium text-[#666]">Integration Channels</span>
                <span className="text-[10px] text-[#999]">Connect your team</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {integrationIcons.map((item) => (
                  <div key={item.name} className="bg-white rounded-lg px-4 py-2.5 flex items-center gap-2 border border-black/[0.03]">
                    {item.icon}
                    <span className="text-[12px] text-[#666]">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {channels.map((item, i) => (
              <FadeIn key={item.title} delay={200 + i * 100}>
                <div className="flex flex-col">
                  <div className="text-[#5b5b5b] mb-5">{item.icon}</div>
                  <h4 className="text-[20px] font-normal text-black leading-tight">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-[16px] text-[#5b5b5b] leading-[1.31]">
                    {item.description}
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
