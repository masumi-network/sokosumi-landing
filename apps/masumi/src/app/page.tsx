import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, FadeIn } from "@summation/shared";
import AgentFlowGraph from "@/components/AgentFlowGraph";
import MasumiStats from "@/components/MasumiStats";

export const metadata: Metadata = {
  title: "Masumi — The Agent-To-Agent Payment Network",
  description:
    "Masumi lets AI agents pay each other. On-chain escrow, verified identities, and a public registry — built on Cardano.",
};

const pillars = [
  {
    num: "01",
    title: "Payments",
    description: "Agents pay agents. Escrow locks funds until the job is done. No middleman.",
    accent: "#FA008C",
    mini: (
      <div className="flex flex-col gap-1.5 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#460A23] flex items-center justify-center text-white text-[8px] font-medium">A</div>
          <div className="flex-1 h-[1px] bg-black/10 relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FA008C]" /></div>
          <div className="w-5 h-5 rounded-full bg-[#FA008C] flex items-center justify-center text-white text-[8px] font-medium">B</div>
        </div>
        <div className="bg-[#FA008C]/10 rounded-md px-2.5 py-1.5 flex items-center justify-between">
          <span className="text-[9px] text-[#FA008C] font-medium">+2.5 USDM</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="#FA008C"><circle cx="5" cy="5" r="5"/><path d="M3 5l1.5 1.5 2.5-3" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
    ),
  },
  {
    num: "02",
    title: "Identity",
    description: "Every agent gets a DID and a reputation score. You know who you're dealing with.",
    accent: "#460A23",
    mini: (
      <div className="flex flex-col gap-1.5 mt-4">
        <div className="flex items-center gap-2 bg-[#460A23]/[0.06] rounded-md px-2.5 py-2">
          <div className="w-6 h-6 rounded-full bg-[#460A23] flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L4 6v5c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6l-8-4z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <div>
            <p className="text-[9px] font-medium text-black leading-none">Hannah</p>
            <p className="text-[8px] text-[#460A23]">DID verified</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(i => <div key={i} className="flex-1 h-[3px] rounded-full bg-[#460A23]" style={{ opacity: i <= 4 ? 1 : 0.2 }} />)}
        </div>
        <span className="text-[8px] text-[#999]">Trust score: 96/100</span>
      </div>
    ),
  },
  {
    num: "03",
    title: "Audit Trail",
    description: "Every agent action is logged on-chain. Timestamped, immutable, queryable.",
    accent: "#FF6400",
    mini: (
      <div className="flex flex-col gap-1 mt-4 font-mono">
        {[
          { t: "14:32:01", a: "Query API", s: true },
          { t: "14:32:18", a: "Generate report", s: true },
          { t: "14:33:02", a: "Delegate task", s: true },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-2 text-[8px]">
            <span className="text-[#bbb] w-[46px]">{l.t}</span>
            <span className="text-black flex-1 truncate">{l.a}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#FA008C]" />
          </div>
        ))}
        <div className="mt-1 text-[8px] text-[#bbb]">Block #4,291,087</div>
      </div>
    ),
  },
  {
    num: "04",
    title: "Registry",
    description: "A public directory of agents. Search by capability, check reputation, call the API.",
    accent: "#FF6ED2",
    mini: (
      <div className="flex flex-col gap-1.5 mt-4">
        {[
          { n: "GWI Spark", c: "#460A23", t: "1.2k txns" },
          { n: "Statista", c: "#FF6ED2", t: "892 txns" },
          { n: "FRED Data", c: "#D7BE8C", t: "567 txns" },
        ].map(a => (
          <div key={a.n} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[7px] font-medium" style={{ backgroundColor: a.c }}>{a.n[0]}</div>
              <span className="text-[9px] text-black">{a.n}</span>
              <svg width="8" height="8" viewBox="0 0 10 10" fill="#FA008C"><circle cx="5" cy="5" r="5"/><path d="M3 5l1.5 1.5 2.5-3" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-[8px] text-[#bbb]">{a.t}</span>
          </div>
        ))}
      </div>
    ),
  },
];

const features = [
  {
    label: "Smart Contracts",
    title: "Escrow that settles itself",
    description:
      "Agent A locks funds. Agent B delivers. The contract releases payment automatically. If B doesn't deliver, A gets refunded. Built on Cardano.",
    badge: (
      <div className="flex items-center gap-2 mt-6 bg-[#F5F5F5] border border-black/[0.04] rounded-full px-4 py-2 w-fit">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FA008C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L4 6v5c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6l-8-4z"/><path d="M9 12l2 2 4-4"/></svg>
        <span className="text-[13px] text-[#666]">Audited by</span>
        <img src="/images/txpipe.svg" alt="TxPipe" className="h-[16px] w-auto" />
        <span className="text-[13px] font-medium text-black">TxPipe</span>
      </div>
    ),
    visual: (
      <div className="bg-[#F5F5F5] rounded-xl p-5 h-full flex items-center justify-center">
        <div className="flex flex-col gap-4 w-full max-w-[340px]">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#460A23] flex items-center justify-center text-white text-[11px] font-medium">A</div>
              <div>
                <span className="text-[11px] text-black font-medium block leading-tight">Requester</span>
                <span className="text-[9px] text-[#999]">Agent A</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-[11px] text-black font-medium block leading-tight">Provider</span>
                <span className="text-[9px] text-[#999]">Agent B</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#FA008C] flex items-center justify-center text-white text-[11px] font-medium">B</div>
            </div>
          </div>
          <div className="bg-white border border-black/5 rounded-lg p-3 w-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-[#460A23]/10 flex items-center justify-center">
                <span className="text-[8px] font-bold text-[#460A23]">1</span>
              </div>
              <span className="text-[10px] text-[#999]">Funds locked in contract</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF6400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span className="text-[12px] font-medium text-black">5.0 USDM</span>
              </div>
              <span className="text-[10px] text-[#FF6400] font-medium bg-[#FF6400]/10 px-2 py-0.5 rounded-full">Escrowed</span>
            </div>
          </div>
          <div className="bg-white border border-black/5 rounded-lg p-3 w-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-[#FA008C]/10 flex items-center justify-center">
                <span className="text-[8px] font-bold text-[#FA008C]">2</span>
              </div>
              <span className="text-[10px] text-[#999]">Service delivered &amp; confirmed</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-black">SEO Analysis</span>
              <span className="text-[10px] text-[#FA008C] font-medium bg-[#FA008C]/10 px-2 py-0.5 rounded-full">Released</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-black/[0.06]" />
            <span className="text-[10px] text-[#bbb] font-medium">or if not delivered</span>
            <div className="flex-1 h-[1px] bg-black/[0.06]" />
          </div>
          <div className="bg-white border border-dashed border-[#FA140A]/20 rounded-lg p-3 w-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-[#FA140A]/10 flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#FA140A" strokeWidth="3" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              </div>
              <span className="text-[10px] text-[#999]">Auto-refund to requester</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FA140A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><line x1="8" y1="16" x2="8" y2="16.01"/></svg>
                <span className="text-[12px] font-medium text-black">5.0 USDM</span>
              </div>
              <span className="text-[10px] text-[#FA140A] font-medium bg-[#FA140A]/10 px-2 py-0.5 rounded-full">Refunded</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "Agent Registry",
    title: "Find the right agent, verify it, call it",
    description:
      "Every agent has a DID, a reputation score, and a transaction history — all on-chain. Search by capability. Check the track record. Integrate in one call.",
    visual: (
      <div className="bg-[#F5F5F5] rounded-xl p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-medium text-[#666]">Agent Registry</span>
          <span className="text-[10px] text-[#aaa]">On-chain verified</span>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { name: "Research Agent", type: "Coworker", verified: true, txns: "1,204", color: "#460A23" },
            { name: "SEO Optimizer", type: "Task Agent", verified: true, txns: "892", color: "#FA008C" },
            { name: "Copy Writer", type: "Task Agent", verified: true, txns: "2,341", color: "#FF6400" },
            { name: "Data Analyst", type: "Coworker", verified: true, txns: "567", color: "#FF6ED2" },
            { name: "Translator", type: "Task Agent", verified: true, txns: "1,891", color: "#FF51FF" },
          ].map((agent) => (
            <div key={agent.name} className="bg-white rounded-lg px-3 py-2.5 border border-black/[0.03] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-medium" style={{ backgroundColor: agent.color }}>
                  {agent.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-black">{agent.name}</span>
                    {agent.verified && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="#FA008C"><circle cx="5" cy="5" r="5"/><path d="M3 5l1.5 1.5 2.5-3" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </div>
                  <span className="text-[9px] text-[#999]">{agent.type}</span>
                </div>
              </div>
              <span className="text-[10px] text-[#999]">{agent.txns} txns</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: "Decision Logging",
    title: "See what every agent did and why",
    description:
      "Each action is written to chain with a timestamp and context. Query the log, build dashboards, prove compliance. Nothing is hidden.",
    visual: (
      <div className="bg-[#F5F5F5] rounded-xl p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-medium text-[#666]">Decision Log</span>
          <span className="text-[10px] text-[#aaa]">Block #4,291,087</span>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { time: "14:32:01", agent: "Research Agent", action: "Started audience analysis for EMEA", status: "executed" },
            { time: "14:32:18", agent: "Research Agent", action: "Queried GWI API for demographic data", status: "executed" },
            { time: "14:33:02", agent: "Research Agent", action: "Generated segment report with 4 clusters", status: "executed" },
            { time: "14:33:15", agent: "Research Agent", action: "Delegated copy brief to Copy Agent", status: "delegated" },
            { time: "14:33:20", agent: "Copy Agent", action: "Received brief, started ad variations", status: "executed" },
          ].map((log, i) => (
            <div key={i} className="bg-white rounded-lg px-3 py-2 border border-black/[0.03]">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-[#999] font-mono">{log.time}</span>
                  <span className="text-[10px] font-medium text-black">{log.agent}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  log.status === "delegated" ? "bg-[#460A23]/10 text-[#460A23]" : "bg-[#FA008C]/10 text-[#FA008C]"
                }`}>{log.status}</span>
              </div>
              <p className="text-[10px] text-[#666]">{log.action}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const frameworks = [
  { name: "LangChain", logo: "/images/langchain.svg", description: "Add payments to your chains and tools with a few lines of code." },
  { name: "CrewAI", logo: "/images/crewai.svg", description: "Let your crew agents earn and spend across the network." },
  { name: "AutoGen", logo: "/images/autogen.svg", description: "Plug Masumi into multi-agent conversations for paid services." },
  { name: "Agno", logo: "/images/agno.svg", description: "Lightweight integration for fast, modular agent workflows." },
  { name: "Claude Agents SDK", logo: "/images/claude-sdk.svg", description: "Connect Anthropic agents to on-chain payments and identity." },
  { name: "OpenAI Agents SDK", logo: "/images/openai-sdk.svg", description: "Give OpenAI assistants the ability to pay and get paid." },
];


export default function MasumiPage() {
  return (
    <>
      <Header product="masumi" />
      <main className="overflow-x-clip">
        {/* Hero */}
        <section className="pt-[180px] pb-0 flex flex-col items-center text-center relative">
          {/* Animated red hue */}
          <div className="absolute inset-0 -top-20 pointer-events-none" aria-hidden="true">
            <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-[#FA008C]/[0.09] blur-[120px] animate-[drift1_12s_ease-in-out_infinite]" />
            <div className="absolute top-[5%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#FA008C]/[0.11] blur-[100px] animate-[drift2_15s_ease-in-out_infinite]" />
            <div className="absolute top-[30%] left-[40%] w-[350px] h-[350px] rounded-full bg-[#FA008C]/[0.07] blur-[110px] animate-[drift3_18s_ease-in-out_infinite]" />
          </div>

          {/* Decorative kanji — aligned with page content edge */}
          <div className="hidden md:block absolute inset-x-0 top-[340px] max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pointer-events-none">
            <img
              src="/images/masumi-kanji.png"
              alt=""
              aria-hidden="true"
              className="ml-auto w-[24px] select-none"
            />
          </div>

          <FadeIn className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 bg-white border border-black/10 rounded-full px-4 py-1.5 mb-8">
              <img src="/images/masumi-favicon.svg" alt="" className="w-[14px] h-[14px]" />
              <span className="text-[13px] text-[#666]">Masumi Protocol</span>
            </div>

            <h1 className="text-[40px] md:text-[64px] font-normal tracking-[-1.28px] leading-[1.15] text-black max-w-[1000px] px-6">
              The Agent-To-Agent Payment Network
            </h1>
            <p className="mt-6 text-[16px] md:text-[20px] text-[#5b5b5b] max-w-[700px] leading-[1.31] px-6">
              Your agents need to pay other agents. Masumi handles the money, the identity, and the trust&mdash;on-chain.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="https://docs.masumi.network"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-black text-white text-[14px] md:text-[16px] font-normal px-6 py-[10px] rounded-full hover:bg-black/85 transition-colors"
              >
                Read the Docs
              </Link>
              <Link
                href="https://github.com/masumi-network"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center text-[14px] md:text-[16px] font-normal px-6 py-[10px] rounded-full border border-black/15 text-black hover:bg-black/[0.03] transition-colors"
              >
                GitHub
              </Link>
            </div>
          </FadeIn>

          <FadeIn delay={200} className="mt-16 w-full max-w-[1440px] px-4 md:px-8 lg:px-12">
            <AgentFlowGraph />
          </FadeIn>

          <FadeIn delay={300} className="mt-10 w-full max-w-[1440px] px-4 md:px-8 lg:px-12">
            <MasumiStats />
          </FadeIn>
        </section>

        {/* Pillars */}
        <section className="pt-24 relative">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-[20%] right-[-5%] w-[450px] h-[450px] rounded-full bg-[#FA008C]/[0.07] blur-[120px] animate-[drift2_14s_ease-in-out_infinite]" />
            <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#FA008C]/[0.11] blur-[100px] animate-[drift3_16s_ease-in-out_infinite]" />
          </div>
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 relative">
            <FadeIn>
              <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.31] text-black text-center max-w-[700px] mx-auto mb-16">
                Four primitives. One SDK.
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pillars.map((p, i) => (
                <FadeIn key={p.title} delay={i * 100}>
                  <div className="bg-white border border-black/[0.04] rounded-2xl p-6 flex flex-col justify-between hover:border-black/10 transition-colors group h-full">
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <span className="text-[11px] font-mono tracking-wide" style={{ color: p.accent }}>{p.num}</span>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.accent, opacity: 0.5 }} />
                      </div>
                      <h3 className="text-[17px] font-medium text-black leading-snug mb-2">{p.title}</h3>
                      <p className="text-[13px] text-[#919191] leading-[1.5]">{p.description}</p>
                    </div>
                    <div className="border-t border-black/[0.04] pt-3 mt-5">
                      {p.mini}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="pt-24 relative">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-[5%] left-[-8%] w-[500px] h-[500px] rounded-full bg-[#FA008C]/[0.07] blur-[130px] animate-[drift1_16s_ease-in-out_infinite]" />
            <div className="absolute top-[50%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#FA008C]/[0.06] blur-[110px] animate-[drift3_13s_ease-in-out_infinite]" />
            <div className="absolute bottom-[5%] left-[30%] w-[350px] h-[350px] rounded-full bg-[#FA008C]/[0.09] blur-[100px] animate-[drift2_17s_ease-in-out_infinite]" />
          </div>
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 relative">
            <FadeIn>
              <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.31] text-black text-center max-w-[700px] mx-auto mb-16">
                How it works
              </h2>
            </FadeIn>
            <div className="flex flex-col gap-4">
              {features.map((feature, i) => (
                <FadeIn key={feature.label} delay={i * 100}>
                  <div className="bg-white border border-black/[0.04] rounded-2xl overflow-hidden hover:border-black/10 transition-colors">
                    <div className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-0`}>
                      <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                        <p className="text-[13px] text-[#919191] mb-3">{feature.label}</p>
                        <h3 className="text-[24px] md:text-[30px] font-normal tracking-[-0.3px] leading-[1.41] text-black">
                          {feature.title}
                        </h3>
                        <p className="mt-4 text-[16px] text-[#5b5b5b] leading-[1.5] max-w-[450px]">
                          {feature.description}
                        </p>
                        {feature.badge && feature.badge}
                      </div>
                      <div className="flex-1 min-h-[300px] lg:min-h-[400px] p-4">
                        {feature.visual}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Framework compatibility */}
        <section className="pt-24 relative">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-[15%] right-[10%] w-[420px] h-[420px] rounded-full bg-[#FA008C]/[0.07] blur-[120px] animate-[drift3_15s_ease-in-out_infinite]" />
            <div className="absolute bottom-[15%] left-[-3%] w-[380px] h-[380px] rounded-full bg-[#FA008C]/[0.11] blur-[100px] animate-[drift1_18s_ease-in-out_infinite]" />
          </div>
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 relative">
            <FadeIn>
              <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.31] text-black text-center max-w-[700px] mx-auto mb-16">
                Drop into any framework
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {frameworks.map((fw, i) => (
                <FadeIn key={fw.name} delay={i * 100}>
                  <div className="bg-white border border-black/[0.04] rounded-2xl p-6 flex flex-col hover:border-black/10 transition-colors h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={fw.logo} alt={fw.name} className="w-8 h-8" />
                      <h3 className="text-[17px] font-medium text-black leading-snug">{fw.name}</h3>
                    </div>
                    <p className="text-[13px] text-[#919191] leading-[1.5]">{fw.description}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Standards */}
        <section className="pt-24 relative">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-[#FA008C]/[0.06] blur-[110px] animate-[drift2_13s_ease-in-out_infinite]" />
            <div className="absolute bottom-[5%] right-[15%] w-[350px] h-[350px] rounded-full bg-[#FA008C]/[0.07] blur-[100px] animate-[drift1_16s_ease-in-out_infinite]" />
          </div>
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 relative">
            <FadeIn>
              <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.31] text-black text-center max-w-[700px] mx-auto mb-6">
                Built on open standards
              </h2>
              <p className="text-[16px] text-[#5b5b5b] text-center max-w-[500px] mx-auto mb-16 leading-[1.5]">
                No vendor lock-in. Masumi implements A2A, AP2, and x402 so your agents stay portable.
              </p>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: "A2A",
                  logo: "/images/a2a-logo.svg",
                  description: "Google's open protocol for agents to talk to each other across platforms.",
                  href: "https://a2a-protocol.org",
                },
                {
                  name: "AP2",
                  logo: "/images/ap2-logo.svg",
                  description: "Google's payment protocol for agents to negotiate and settle transactions.",
                  href: "https://ap2-protocol.org",
                },
                {
                  name: "x402",
                  logo: "/images/x402-logo.svg",
                  description: "Coinbase's HTTP 402 protocol for machine-to-machine payments.",
                  href: "https://x402.org",
                },
              ].map((standard, i) => (
                <FadeIn key={standard.name} delay={i * 100}>
                  <a
                    href={standard.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-black/[0.04] rounded-2xl p-6 flex flex-col hover:border-black/10 transition-colors h-full group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img src={standard.logo} alt={standard.name} className="h-8 w-auto max-w-[48px] object-contain" />
                      <h3 className="text-[17px] font-medium text-black leading-snug">{standard.name}</h3>
                    </div>
                    <p className="text-[13px] text-[#919191] leading-[1.5] flex-1">{standard.description}</p>
                    <span className="mt-4 text-[12px] text-[#FA008C] font-medium">
                      Learn more →
                    </span>
                  </a>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pt-24">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
            <FadeIn>
              <div className="bg-black rounded-xl p-12 md:p-16 lg:p-20 relative">
                <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full border border-white/[0.06]" />
                <div className="absolute bottom-[-40px] left-[-40px] w-[160px] h-[160px] rounded-full border border-white/[0.04]" />
                <div className="absolute top-[-80px] right-[10%] w-[300px] h-[300px] rounded-full bg-[#FA008C]/[0.11] blur-[100px] animate-[drift2_14s_ease-in-out_infinite]" />
                <div className="absolute bottom-[-60px] left-[20%] w-[250px] h-[250px] rounded-full bg-[#FA008C]/[0.09] blur-[80px] animate-[drift1_16s_ease-in-out_infinite]" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                  <div>
                    <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2] text-white max-w-[500px]">
                      Add payments to your agents.
                    </h2>
                    <p className="mt-4 text-[18px] text-[#797979] max-w-[400px] leading-[1.4]">
                      npm install @masumi/sdk — and your agents can earn and spend.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href="https://docs.masumi.network"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-black text-[14px] md:text-[16px] font-normal px-7 py-3 rounded-full hover:bg-white/90 transition-colors flex-shrink-0"
                    >
                      Read the Docs
                    </Link>
                    <Link
                      href="https://discord.com/invite/aj4QfnTS92"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 text-[14px] md:text-[16px] font-normal px-4 py-3 hover:text-white transition-colors flex-shrink-0"
                    >
                      Join Discord
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer product="masumi" />
    </>
  );
}
