import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, FadeIn } from "@summation/shared";
import VideoModal from "@/components/VideoModal";

export const metadata: Metadata = {
  title: "Kodosumi. Run AI Agents at Scale.",
  description:
    "The distributed runtime environment that manages and executes agentic services at enterprise scale. Built on Ray.",
  openGraph: {
    title: "Kodosumi. Run AI Agents at Scale.",
    description:
      "The distributed runtime environment that manages and executes agentic services at enterprise scale. Built on Ray.",
  },
};

const pillars = [
  {
    num: "01",
    title: "Scalability via Ray",
    description:
      "Deploy locally, run pipelines in parallel, fine-tune — Kodosumi scales effortlessly thanks to Ray.",
    accent: "#00C2FF",
    mini: (
      <div className="pillar-mini flex flex-col gap-1.5 mt-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 flex flex-col gap-1">
              <div
                className="h-6 rounded-sm bg-[#00C2FF]"
                style={{ opacity: 0.15 + i * 0.2 }}
              />
              <div
                className="h-3 rounded-sm bg-[#00C2FF]"
                style={{ opacity: 0.1 + i * 0.15 }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[8px] text-[#999]">1 node</span>
          <svg
            width="24"
            height="6"
            viewBox="0 0 24 6"
            fill="none"
          >
            <path
              d="M0 3h20m0 0l-3-2.5M20 3l-3 2.5"
              stroke="#00C2FF"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[8px] text-[#00C2FF] font-medium">
            1,000+ nodes
          </span>
        </div>
      </div>
    ),
  },
  {
    num: "02",
    title: "Real-time Monitoring",
    description:
      "Built-in observability through Ray dashboard gives full visibility into agent operations and resource usage.",
    accent: "#0AFA14",
    mini: (
      <div className="pillar-mini flex flex-col gap-1.5 mt-4">
        <div className="flex items-center gap-2 bg-[#0AFA14]/[0.06] px-2.5 py-2">
          <div className="w-6 h-6 rounded-full bg-[#0AFA14] flex items-center justify-center flex-shrink-0">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] font-medium text-black leading-none">
              All systems
            </p>
            <p className="text-[8px] text-[#0AFA14]">Operational</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex-1 h-[3px] rounded-full bg-[#0AFA14]"
              style={{ opacity: i <= 5 ? 1 : 0.2 }}
            />
          ))}
        </div>
        <span className="text-[8px] text-[#999]">CPU: 42% | GPU: 78%</span>
      </div>
    ),
  },
  {
    num: "03",
    title: "No Vendor Lock-in",
    description:
      "Kodosumi is open source, framework agnostic, and portable across platforms. Use any AI framework you prefer.",
    accent: "#FF6400",
    mini: (
      <div className="pillar-mini flex flex-col gap-1 mt-4 font-mono">
        {[
          { f: "CrewAI", s: true },
          { f: "LangChain", s: true },
          { f: "FastAPI", s: true },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-2 text-[8px]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0AFA14]" />
            <span className="text-black flex-1 truncate">{l.f}</span>
            <span className="text-[#bbb]">compatible</span>
          </div>
        ))}
        <div className="mt-1 text-[8px] text-[#FF6400]">
          + any Python framework
        </div>
      </div>
    ),
  },
  {
    num: "04",
    title: "Minimal Configuration",
    description:
      "A single YAML config file is all you need. Define dependencies, environment variables, and deploy.",
    accent: "#A855F7",
    mini: (
      <div className="pillar-mini flex flex-col gap-1.5 mt-4">
        <div className="bg-[#0a0a0a] rounded-sm px-2.5 py-2 font-mono">
          <p className="text-[8px] text-[#A855F7]">config.yaml</p>
          <p className="text-[7px] text-[#666] mt-1">
            dependencies:
          </p>
          <p className="text-[7px] text-[#999] pl-2">- kodosumi</p>
          <p className="text-[7px] text-[#999] pl-2">- crewai</p>
          <p className="text-[7px] text-[#666] mt-0.5">
            env_vars: [API_KEY]
          </p>
        </div>
        <span className="text-[8px] text-[#999]">
          1 file &middot; deploy in seconds
        </span>
      </div>
    ),
  },
];

const concepts = [
  {
    label: "Core Concept",
    title: "Agent",
    description:
      "An autonomous object that can perform specific tasks or services. Agents are the fundamental building blocks in Kodosumi, each encapsulating specialized capabilities that can be orchestrated into larger workflows.",
    visual: (
      <div className="bg-[#F5F5F5] p-5 h-full flex items-center justify-center">
        <div className="flex flex-col gap-4 w-full max-w-[340px]">
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 rounded-2xl bg-[#00C2FF] flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
              </svg>
            </div>
          </div>
          <div className="feature-visual-item bg-white border border-black/5 p-3 w-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-[#00C2FF]/10 flex items-center justify-center">
                <span className="text-[8px] font-bold text-[#00C2FF]">1</span>
              </div>
              <span className="text-[10px] text-[#999]">
                Receives task request
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-black">
                Research Query
              </span>
              <span className="text-[10px] text-[#00C2FF] font-medium bg-[#00C2FF]/10 px-2 py-0.5 rounded-full">
                Processing
              </span>
            </div>
          </div>
          <div className="feature-visual-item bg-white border border-black/5 p-3 w-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-[#0AFA14]/10 flex items-center justify-center">
                <span className="text-[8px] font-bold text-[#0AFA14]">2</span>
              </div>
              <span className="text-[10px] text-[#999]">
                Returns structured result
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-black">
                Analysis Report
              </span>
              <span className="text-[10px] text-[#0AFA14] font-medium bg-[#0AFA14]/10 px-2 py-0.5 rounded-full">
                Complete
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "Core Concept",
    title: "Flow",
    description:
      "An automated process, workflow, or system of interconnected tasks. Flows define how multiple agents coordinate, passing data between steps to accomplish complex objectives.",
    visual: (
      <div className="bg-[#F5F5F5] p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-medium text-[#666]">
            Flow Pipeline
          </span>
          <span className="text-[10px] text-[#aaa]">3 steps</span>
        </div>
        <div className="flex flex-col gap-2">
          {[
            {
              step: "1",
              name: "Data Ingestion",
              agent: "Collector Agent",
              status: "complete",
              color: "#0AFA14",
            },
            {
              step: "2",
              name: "Analysis",
              agent: "Research Agent",
              status: "running",
              color: "#00C2FF",
            },
            {
              step: "3",
              name: "Report Generation",
              agent: "Writer Agent",
              status: "queued",
              color: "#A855F7",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="feature-visual-item bg-white px-3 py-2.5 border border-black/[0.03] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-medium"
                  style={{ backgroundColor: item.color }}
                >
                  {item.step}
                </div>
                <div>
                  <span className="text-[11px] font-medium text-black block leading-tight">
                    {item.name}
                  </span>
                  <span className="text-[9px] text-[#999]">
                    {item.agent}
                  </span>
                </div>
              </div>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${item.color}15`,
                  color: item.color,
                }}
              >
                {item.status}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-[2px] bg-[#0AFA14] rounded-full" />
            <div className="flex-1 h-[2px] bg-[#00C2FF] rounded-full relative overflow-hidden">
              <div
                className="absolute inset-0 bg-[#00C2FF] rounded-full"
                style={{ width: "60%" }}
              />
            </div>
            <div className="flex-1 h-[2px] bg-black/[0.06] rounded-full" />
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "Core Concept",
    title: "Agentic Service",
    description:
      "A self-contained, deployable unit that integrates one or more Flows. Agentic Services are what you deploy to Kodosumi — they bundle agents, flows, and configuration into a single runtime.",
    visual: (
      <div className="bg-[#F5F5F5] p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-medium text-[#666]">
            Deployed Service
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0AFA14] pulse-dot" />
            <span className="text-[10px] text-[#0AFA14]">Running</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="feature-visual-item bg-white border border-black/5 p-3 w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-black">
                market-research-service
              </span>
              <span className="text-[9px] text-[#999] font-mono">v1.2.0</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[8px] bg-[#00C2FF]/10 text-[#00C2FF] px-1.5 py-0.5 rounded-full">
                Flow: data-collect
              </span>
              <span className="text-[8px] bg-[#A855F7]/10 text-[#A855F7] px-1.5 py-0.5 rounded-full">
                Flow: analyze
              </span>
              <span className="text-[8px] bg-[#FF6400]/10 text-[#FF6400] px-1.5 py-0.5 rounded-full">
                Flow: report
              </span>
            </div>
          </div>
          <div className="feature-visual-item bg-white border border-black/5 p-3 w-full">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[14px] font-medium text-black">3</p>
                <p className="text-[8px] text-[#999]">Agents</p>
              </div>
              <div>
                <p className="text-[14px] font-medium text-black">2</p>
                <p className="text-[8px] text-[#999]">Flows</p>
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#0AFA14]">99.9%</p>
                <p className="text-[8px] text-[#999]">Uptime</p>
              </div>
            </div>
          </div>
          <div className="feature-visual-item bg-white border border-black/5 p-3 w-full font-mono text-[9px]">
            <div className="flex items-center gap-2 text-[#999]">
              <span className="text-[#00C2FF]">ray</span>
              <span className="text-black/30">|</span>
              <span>4 replicas</span>
              <span className="text-black/30">|</span>
              <span>GPU: A100</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];


export default function KodosumiPage() {
  return (
    <>
      <Header product="kodosumi" />
      <main className="overflow-x-clip">
        {/* Hero */}
        <section className="pt-[140px] pb-0 flex flex-col items-center text-center relative">
          <FadeIn className="flex flex-col items-center text-center relative">
            {/* Decorative kanji stamps */}
            <div className="hidden lg:flex absolute top-0 bottom-0 items-center pointer-events-none select-none" style={{ right: "calc(50% + 420px)" }}>
              <img
                src="/images/kodosumi-kanji-black.png"
                alt=""
                aria-hidden="true"
                className="w-[48px] opacity-[0.07]"
              />
            </div>
            {/* Wordmark logo */}
            <div className="mb-6">
              <img
                src="/images/kodosumi-wordmark-black.png"
                alt="Kodosumi"
                className="h-[28px] md:h-[36px] opacity-90"
              />
            </div>
            <h1 className="text-[40px] md:text-[64px] font-normal tracking-[-1.28px] leading-[1.15] text-black max-w-[800px] px-6">
              Run AI Agents at Scale, Reliable and Fast
            </h1>
            <p className="mt-8 text-[16px] md:text-[20px] text-[#5b5b5b] max-w-[560px] leading-[1.31] px-6">
              The distributed runtime environment that manages and executes
              agentic services at enterprise scale.
            </p>
            <div className="mt-8 mb-8 flex items-center gap-4">
              <Link
                href="https://docs.kodosumi.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-black text-white text-[14px] font-normal px-6 py-2.5 rounded-full hover:bg-black/85 transition-colors"
              >
                Getting Started
              </Link>
              <Link
                href="https://github.com/masumi-network/kodosumi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center text-black text-[14px] font-normal px-6 py-2.5 rounded-full border border-black/10 hover:border-black/20 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="mr-2"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Link>
            </div>
          </FadeIn>

          {/* Hero visual — video thumbnail with popup */}
          <FadeIn delay={200} className="mt-12 w-full max-w-[960px] px-4 md:px-8 lg:px-12 mx-auto">
            <VideoModal />
          </FadeIn>
        </section>

        {/* Value Props — Pillars */}
        <section className="pt-24 relative">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 relative">
            <FadeIn>
              <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.31] text-black text-center max-w-[700px] mx-auto mb-16">
                Built for production. From day one.
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pillars.map((p, i) => (
                <FadeIn key={p.title} delay={i * 100}>
                  <div className="pillar-card bg-white border border-black/[0.04] p-6 flex flex-col justify-between hover:border-black/10 group h-full">
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <span
                          className="text-[11px] font-mono tracking-wide"
                          style={{ color: p.accent }}
                        >
                          {p.num}
                        </span>
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: p.accent,
                            opacity: 0.5,
                          }}
                        />
                      </div>
                      <h3 className="text-[17px] font-medium text-black leading-snug mb-2">
                        {p.title}
                      </h3>
                      <p className="text-[13px] text-[#919191] leading-[1.5]">
                        {p.description}
                      </p>
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

        {/* Core Concepts */}
        <section className="pt-24 relative">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 relative">
            <FadeIn>
              <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.31] text-black text-center max-w-[700px] mx-auto mb-16">
                Three core concepts
              </h2>
            </FadeIn>
            <div className="flex flex-col gap-4">
              {concepts.map((concept, i) => (
                <FadeIn key={concept.title} delay={i * 100}>
                  <div className="feature-card bg-white border border-black/[0.04] overflow-hidden hover:border-black/10">
                    <div
                      className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-0`}
                    >
                      <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                        <p className="text-[13px] text-[#919191] mb-3">
                          {concept.label}
                        </p>
                        <h3 className="text-[24px] md:text-[30px] font-normal tracking-[-0.3px] leading-[1.41] text-black">
                          {concept.title}
                        </h3>
                        <p className="mt-4 text-[16px] text-[#5b5b5b] leading-[1.5] max-w-[450px]">
                          {concept.description}
                        </p>
                      </div>
                      <div className="flex-1 min-h-[300px] lg:min-h-[400px] p-4">
                        {concept.visual}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pt-24">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
            <FadeIn>
              <div className="bg-black overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-10 md:p-14 lg:p-16 flex flex-col justify-center">
                    <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2] text-white max-w-[420px]">
                      Start running agents at scale.
                    </h2>
                    <p className="mt-4 text-[16px] text-[#666] max-w-[360px] leading-[1.5]">
                      Install Kodosumi, write a config, deploy your agents. Built
                      on Ray. Open source.
                    </p>
                    <div className="mt-8 flex items-center gap-4">
                      <Link
                        href="https://docs.kodosumi.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-black text-[14px] font-normal px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors flex-shrink-0"
                      >
                        Getting Started
                      </Link>
                      <Link
                        href="https://discord.com/invite/aj4QfnTS92"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/50 text-[14px] md:text-[16px] font-normal px-4 py-3 hover:text-white transition-colors flex-shrink-0"
                      >
                        Join Discord
                      </Link>
                    </div>
                  </div>

                  <div className="flex-1 p-6 md:p-10 lg:p-12 lg:pl-0">
                    <div className="bg-[#0a0a0a] border border-white/[0.06] p-6 font-mono text-[13px] leading-[1.8] h-full">
                      <div className="flex items-center gap-2 mb-5">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      </div>
                      <p className="code-line text-[#666]">
                        <span className="text-[#888]">$</span>{" "}
                        <span className="text-white">pip install</span>{" "}
                        <span className="text-[#00C2FF]">kodosumi</span>
                      </p>
                      <p className="code-line text-[#333] mt-4 mb-1">
                        # Define your agent
                      </p>
                      <p className="code-line">
                        <span className="text-[#00C2FF]">from</span>{" "}
                        <span className="text-white">kodosumi</span>{" "}
                        <span className="text-[#00C2FF]">import</span>{" "}
                        <span className="text-white">Agent, Flow</span>
                      </p>
                      <p className="code-line mt-3">
                        <span className="text-[#00C2FF]">class</span>{" "}
                        <span className="text-white">ResearchAgent</span>
                        <span className="text-[#888]">(Agent):</span>
                      </p>
                      <p className="code-line pl-4">
                        <span className="text-white">name</span>
                        <span className="text-[#666]"> = </span>
                        <span className="text-[#888]">
                          &apos;researcher&apos;
                        </span>
                      </p>
                      <p className="code-line pl-4">
                        <span className="text-white">model</span>
                        <span className="text-[#666]"> = </span>
                        <span className="text-[#888]">
                          &apos;gpt-4&apos;
                        </span>
                      </p>
                      <p className="code-line mt-3">
                        <span className="text-[#00C2FF]">flow</span>
                        <span className="text-[#666]"> = </span>
                        <span className="text-white">Flow</span>
                        <span className="text-[#888]">
                          (agents=[ResearchAgent])
                        </span>
                      </p>
                      <p className="code-line mt-3">
                        <span className="text-white">flow</span>
                        <span className="text-[#666]">.</span>
                        <span className="text-white">deploy</span>
                        <span className="text-[#888]">()</span>
                      </p>
                      <p className="code-line mt-1 text-[#333]">
                        # Running on Ray.{" "}
                        <span className="code-cursor" />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer product="kodosumi" />
    </>
  );
}
