import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@summation/shared";
import LazyWorkflowGraph from "./LazyWorkflowGraph";

const coworkerAgents = [
  {
    name: "Hannah",
    role: "Research Lead",
    description: "Market research, competitive analysis, and data-driven strategy.",
    logo: { src: "/images/serviceplan-group.png", alt: "Serviceplan Group", width: 100, height: 20 },
  },
  {
    name: "John",
    role: "Project Manager",
    description: "Brief breakdowns, timeline planning, and team coordination.",
    logo: { src: "/images/nmkr-logo.svg", alt: "NMKR", width: 60, height: 20 },
  },
  {
    name: "SEO Agent",
    role: "SEO Specialist",
    description: "Keyword research, content outlines, and organic growth strategy.",
    logo: { src: "/images/serviceplan-group.png", alt: "Serviceplan Group", width: 100, height: 20 },
  },
  {
    name: "Copy Agent",
    role: "Copywriter",
    description: "Ad copy, blog posts, social content, and brand voice.",
    logo: { src: "/images/serviceplan-group.png", alt: "Serviceplan Group", width: 100, height: 20 },
  },
];

function AgentCoworkersMockup() {
  return (
    <div className="bg-[#f9f9f9] rounded-xl p-4 md:p-5 h-full flex flex-col">
      <div className="mb-4">
        <span className="text-[11px] font-medium text-[#666]">Team</span>
      </div>
      <div className="grid grid-cols-2 gap-3 flex-1">
        {coworkerAgents.map((agent) => (
          <div key={agent.name} className="bg-white rounded-lg p-4 border border-black/[0.03] flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image src="/images/hannah.png" alt={agent.name} width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-black leading-tight">{agent.name}</p>
                <p className="text-[11px] text-[#999]">{agent.role}</p>
              </div>
            </div>
            <p className="text-[11px] text-[#777] leading-[1.4] mb-3">{agent.description}</p>
            <div className="mt-auto pt-2 h-[20px] flex items-center">
              {agent.logo && (
                <Image src={agent.logo.src} alt={agent.logo.alt} width={agent.logo.width} height={agent.logo.height} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketplaceMockup() {
  const partners = [
    { name: "GWI Research", tag: "Audience", color: "#6400FF", rating: "4.9" },
    { name: "Statista", tag: "Data", color: "#00A4FA", rating: "4.8" },
    { name: "SEO Pro", tag: "SEO", color: "#0AFED3", rating: "4.7" },
    { name: "Ad Writer", tag: "Copy", color: "#FF6400", rating: "4.9" },
    { name: "Summarizer", tag: "Reports", color: "#C4FE0A", rating: "4.6" },
    { name: "Translator", tag: "i18n", color: "#FF51FF", rating: "4.8" },
  ];

  return (
    <div className="bg-[#f9f9f9] rounded-xl p-4 md:p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-medium text-[#666]">Marketplace</span>
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#aaa" strokeWidth="1.2"><circle cx="6" cy="6" r="5"/><path d="M6 3v3l2 1"/></svg>
          <span className="text-[10px] text-[#aaa]">{partners.length} available</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {partners.map((p) => (
          <div key={p.name} className="bg-white rounded-lg px-3 py-2.5 border border-black/[0.03] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: p.color }}>
                {p.name[0]}
              </div>
              <div>
                <p className="text-[11px] font-medium text-black">{p.name}</p>
                <span className="text-[9px] text-[#999]">{p.tag}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="#f59e0b"><path d="M5 0l1.5 3.1 3.5.5-2.5 2.4.6 3.5L5 7.8 1.9 9.5l.6-3.5L0 3.6l3.5-.5z"/></svg>
              <span className="text-[10px] text-[#999]">{p.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


const features = [
  {
    label: "Agentic Coworkers",
    title: "AI agents that own tasks",
    description:
      "Agents that behave like team members. They own tasks, follow responsibilities, and work together. Built with Serviceplan Group.",
    mockup: <AgentCoworkersMockup />,
    cta: { label: "Meet all coworkers", href: "/agentic-coworkers" },
  },
  {
    label: "Task-Focused Agents",
    title: "Specialist agents for every task",
    description:
      "GWI audience research, Statista data, ad copy, SEO outlines, campaign summaries. Fast, precise, built to work together.",
    mockup: <MarketplaceMockup />,
    cta: null,
  },
  {
    label: "Multi-Agent Workflows",
    title: "Agents that work as a team",
    description:
      "Agents delegate, collaborate, and bring in other agents. Structured workflows\u2014humans stay in control.",
    mockup: <LazyWorkflowGraph />,
    cta: null,
  },
];

export default function Platform() {
  return (
    <section className="pt-24 pb-0">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <FadeIn>
          <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.31] text-black text-center max-w-[800px] mx-auto mb-16">
            Agents That Do the Work
          </h2>
        </FadeIn>

        <div className="flex flex-col gap-5">
          {features.map((feature, i) => (
            <FadeIn key={feature.label} delay={i * 100}>
            <div className="bg-white p-[14px]">
              <div className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-0`}>
                <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                  <p className="text-[16px] text-[#979797] mb-3">{feature.label}</p>
                  <h3 className="text-[24px] md:text-[30px] font-normal tracking-[-0.3px] leading-[1.41] text-black">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-[18px] text-black leading-[1.31] max-w-[450px]">
                    {feature.description}
                  </p>
                  {feature.cta && (
                    <Link
                      href={feature.cta.href}
                      className="mt-6 self-start inline-flex items-center justify-center bg-black text-white text-[16px] font-normal px-6 py-[10px] rounded-full hover:bg-black/85 transition-colors"
                    >
                      {feature.cta.label}
                    </Link>
                  )}
                </div>
                <div className="flex-1 min-h-[300px] lg:min-h-[400px] p-2">
                  {feature.mockup}
                </div>
              </div>
            </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
