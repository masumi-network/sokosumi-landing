import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@summation/shared";

function AgentProfileMockup() {
  const agents = [
    { name: "Hannah", role: "Market Research", avatar: "/images/hannah.png", isImage: true, color: "", tasks: 12, done: 9 },
    { name: "John", role: "Campaign Planning", avatar: null, isImage: false, color: "#4a7cff", tasks: 8, done: 5 },
    { name: "SEO Agent", role: "Search Optimization", avatar: null, isImage: false, color: "#2cb67d", tasks: 6, done: 6 },
    { name: "Copy Agent", role: "Ad Copywriting", avatar: null, isImage: false, color: "#e87b35", tasks: 10, done: 7 },
  ];

  return (
    <div className="bg-[#f9f9f9] rounded-xl p-4 md:p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-medium text-[#666]">Team</span>
        <span className="text-[10px] text-[#aaa]">{agents.length} agents</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {agents.map((agent) => (
          <div key={agent.name} className="bg-white rounded-lg p-3 border border-black/[0.03] flex flex-col">
            <div className="flex items-center gap-2 mb-2.5">
              {agent.isImage ? (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image src={agent.avatar!} alt={agent.name} width={32} height={32} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[12px] font-medium" style={{ backgroundColor: agent.color }}>
                  {agent.name[0]}
                </div>
              )}
              <div>
                <p className="text-[11px] font-medium text-black leading-tight">{agent.name}</p>
                <p className="text-[9px] text-[#999]">{agent.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
                <div className="h-full bg-black/70 rounded-full" style={{ width: `${(agent.done / agent.tasks) * 100}%` }} />
              </div>
              <span className="text-[9px] text-[#aaa]">{agent.done}/{agent.tasks}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketplaceMockup() {
  const partners = [
    { name: "GWI Research", tag: "Audience", color: "#6366f1", rating: "4.9" },
    { name: "Statista", tag: "Data", color: "#0ea5e9", rating: "4.8" },
    { name: "SEO Pro", tag: "SEO", color: "#2cb67d", rating: "4.7" },
    { name: "Ad Writer", tag: "Copy", color: "#e87b35", rating: "4.9" },
    { name: "Summarizer", tag: "Reports", color: "#8b5cf6", rating: "4.6" },
    { name: "Translator", tag: "i18n", color: "#ec4899", rating: "4.8" },
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

function WorkflowMockup() {
  return (
    <div className="bg-[#f9f9f9] rounded-xl p-4 md:p-5 h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-0 w-full max-w-[280px]">
        <div className="bg-black text-white text-[11px] px-4 py-2 rounded-full font-medium">
          Campaign Brief
        </div>
        <div className="w-px h-6 bg-black/15" />

        <div className="flex items-start gap-4">
          {[
            { label: "Research", color: "#6366f1", letter: "H" },
            { label: "SEO", color: "#2cb67d", letter: "S" },
            { label: "Copy", color: "#e87b35", letter: "C" },
          ].map((node) => (
            <div key={node.label} className="flex flex-col items-center">
              <div className="w-px h-3 bg-black/15" />
              <div className="bg-white border border-black/10 rounded-lg px-3 py-2 text-center shadow-sm">
                <div className="w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-[9px] font-medium" style={{ backgroundColor: node.color }}>{node.letter}</div>
                <span className="text-[10px] text-black">{node.label}</span>
              </div>
              <div className="w-px h-3 bg-black/15" />
            </div>
          ))}
        </div>

        <div className="w-px h-6 bg-black/15" />
        <div className="bg-white border-2 border-black text-[11px] px-4 py-2 rounded-full flex items-center gap-1.5 font-medium">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6" cy="4" r="2.5" />
            <path d="M2 11c0-2.2 1.8-4 4-4s4 1.8 4 4" />
          </svg>
          Human Review
        </div>
        <div className="w-px h-6 bg-black/15" />
        <div className="bg-[#2cb67d] text-white text-[11px] px-4 py-2 rounded-full font-medium flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5l2.5 2.5 3.5-4"/></svg>
          Publish
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    label: "Agentic Coworkers",
    title: "AI agents that own marketing tasks",
    description:
      "Sokosumi introduces Agentic Coworkers\u2014specialized AI agents that behave like team members. They own specific tasks, follow clear responsibilities, and work together on projects. Developed with Serviceplan Group.",
    link: "/agents/coworkers",
    linkText: "Meet the Coworkers",
    mockup: <AgentProfileMockup />,
  },
  {
    label: "Task-Focused Agents",
    title: "Precise execution by high-quality partners",
    description:
      "Alongside coworkers, Sokosumi offers task-focused AI agents for GWI target audience research, Statista data enrichment, ad variations, SEO outlines, and campaign summaries. Fast. Precise. Built to work together.",
    link: "/agents/task-agents",
    linkText: "Explore Task Agents",
    mockup: <MarketplaceMockup />,
  },
  {
    label: "Multi-Agent Workflows",
    title: "AI agents that work as a team",
    description:
      "Agents can delegate tasks to other agents, collaborate across projects, and hire additional agents when needed. Structured agent-to-agent workflows\u2014with humans staying in control.",
    link: "/product#workflows",
    linkText: "See How It Works",
    mockup: <WorkflowMockup />,
  },
];

export default function Platform() {
  return (
    <section className="pt-24 pb-0">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <FadeIn>
          <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.31] text-black text-center max-w-[800px] mx-auto mb-16">
            The Solution: Agents That Actually Do the Work
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
                  <Link
                    href={feature.link}
                    className="mt-8 inline-flex items-center gap-2 text-[16px] text-[#7b7b7b] hover:text-black transition-colors"
                  >
                    {feature.linkText}
                    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 1L6 6L1 11" />
                    </svg>
                  </Link>
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
