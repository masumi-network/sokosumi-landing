import { FadeIn } from "@summation/shared";

const items = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L4 6v5c0 5.1 3.4 9.8 8 11 4.6-1.2 8-5.9 8-11V6l-8-4z" />
        <path d="M8.5 12l2.5 2.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "GDPR Compliant",
    description: "Data stays in Europe. Full data processing agreements, right to deletion, and privacy by design.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M6 9h12M6 15h12" />
        <ellipse cx="12" cy="12" rx="4.5" ry="9" />
      </svg>
    ),
    title: "EU AI Act Aligned",
    description: "Transparent AI systems with human oversight. Risk classification and documentation built in.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M8.5 14l2 2 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Smart Contract Audited",
    description: "Agent payments verified on-chain. Audited smart contracts ensure transparent, trustless transactions.",
  },
];

export default function Security() {
  return (
    <section className="pt-24">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <FadeIn>
          <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.31] text-black text-center max-w-[700px] mx-auto mb-5">
            Built in Europe. Built for Trust.
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#999] text-center max-w-[500px] mx-auto mb-14">
            Enterprise-grade security and compliance, built in from day one.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-black/[0.06]">
          {items.map((item, i) => (
            <FadeIn key={item.title} delay={i * 80}>
              <div className={`p-8 md:p-10 flex flex-col h-full ${i < items.length - 1 ? "md:border-r border-b md:border-b-0 border-black/[0.06]" : ""}`}>
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white mb-6">
                  {item.icon}
                </div>
                <h3 className="text-[18px] md:text-[20px] font-medium text-black mb-3">
                  {item.title}
                </h3>
                <p className="text-[15px] text-[#777] leading-[1.5]">
                  {item.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
