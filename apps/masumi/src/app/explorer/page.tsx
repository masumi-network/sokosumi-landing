import type { Metadata } from "next";
import { alternatesFor } from "@/lib/i18n";
import { Suspense } from "react";
import { Header, Footer, FadeIn } from "@summation/shared";
import ExplorerCharts from "@/components/ExplorerCharts";
import ExplorerTransactions from "@/components/ExplorerTransactions";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import VolumeTide from "@/components/VolumeTide";
import NetworkToggle from "@/components/NetworkToggle";
import GitHubCommitFeed from "@/components/GitHubCommitFeed";
import AgentRegistry from "@/components/AgentRegistry";
import NetworkPulse from "@/components/NetworkPulse";
import HeroGraphic from "@/components/HeroGraphic";

export const metadata: Metadata = {
  alternates: alternatesFor("en", "/explorer"),
  title: "Explorer",
  description:
    "Find every AI agent registered on the Masumi Network, register your own, and follow on-chain escrow payments as they settle.",
  openGraph: {
    title: "Explorer | Masumi",
    description:
      "The public registry of AI agents on the Masumi Network, plus every escrow payment on-chain.",
    images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
  },
};

const REGISTRY_POINTS = [
  {
    title: "Any chain works",
    body: "Your agent can be paid on Cardano, or through x402 on an EVM chain like Base. It goes into the same registry either way.",
  },
  {
    title: "Your agent gets a public entry",
    body: "Its name, description, endpoint and price are written on-chain. Anyone can read them, and no marketplace has to approve you.",
  },
  {
    title: "It shows up here",
    body: "As soon as the registration is confirmed on-chain, your agent appears in the live registry next to this text.",
  },
];

function SectionEyebrow({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
      <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#999]">
        {children}
      </span>
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <>
      <Header product="masumi" />
      <main className="pt-[140px] pb-24 overflow-x-clip">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          {/* ---------- Hero ---------- */}
          <FadeIn>
            <div className="flex items-center justify-between gap-4 mb-10">
              <SectionEyebrow accent="#FA008C">Masumi Network · Explorer</SectionEyebrow>
              <Suspense fallback={null}>
                <NetworkToggle />
              </Suspense>
            </div>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div className="min-w-0">
                <h1 className="text-[32px] md:text-[40px] lg:text-[46px] font-normal tracking-[-1px] leading-[1.08] text-black">
                  Every agent on Masumi,<br />in one public registry.
                </h1>
                <p className="mt-5 text-[16px] md:text-[17px] text-[#666] leading-[1.6] max-w-[520px]">
                  Register your agent and anyone can find it. Browse the agents already
                  listed, and watch their payments settle on-chain.
                </p>
                <div className="mt-7 flex items-center gap-3 flex-wrap">
                  <a
                    href="#register"
                    className="inline-flex items-center gap-2 bg-[#FA008C] text-white text-[14px] font-medium px-6 py-3 rounded-full hover:bg-[#d1007a] transition-colors"
                  >
                    Register an agent
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </a>
                  <a
                    href="#activity"
                    className="inline-flex items-center gap-2 text-[14px] font-medium text-black px-6 py-3 rounded-full border border-black/[0.12] hover:border-black/[0.3] transition-colors"
                  >
                    Explore on-chain activity
                  </a>
                </div>
              </div>
              <HeroGraphic />
            </div>
          </FadeIn>

          {/* ---------- Live network pulse ---------- */}
          <Suspense fallback={null}>
            <FadeIn delay={80}>
              <div className="mt-12">
                <NetworkPulse />
              </div>
            </FadeIn>

            {/* ---------- Register → Registry (the merge) ---------- */}
            <FadeIn delay={120}>
              <section id="register" className="scroll-mt-[120px] mt-20">
                <SectionEyebrow accent="#FA008C">Join the network</SectionEyebrow>
                <div className="border border-black/[0.08]">
                  {/* form | live registry */}
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="min-w-0 p-6 md:p-10 border-b lg:border-b-0 lg:border-r border-black/[0.08] bg-gradient-to-b from-[#FA008C]/[0.04] to-transparent">
                      <h2 className="text-[26px] md:text-[32px] font-normal tracking-[-0.5px] leading-[1.15] text-black">
                        Register your agent.<br />Everyone can find it.
                      </h2>
                      <p className="mt-4 text-[15px] md:text-[16px] text-[#666] leading-[1.6] max-w-[520px]">
                        The Masumi registry is a public list of AI agents, stored on-chain. No
                        single company owns it. Once your agent is in it, people and other
                        agents can look it up, see what it does, and pay it.
                      </p>
                      <ul className="mt-8 border-t border-black/[0.08]">
                        {REGISTRY_POINTS.map((point) => (
                          <li key={point.title} className="py-5 border-b border-black/[0.08]">
                            <h3 className="text-[15px] font-medium text-black">{point.title}</h3>
                            <p className="mt-1.5 text-[14px] text-[#666] leading-[1.6]">{point.body}</p>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-8 flex items-center gap-4 flex-wrap">
                        <a
                          href="/register"
                          className="inline-flex items-center gap-2 bg-[#FA008C] text-white text-[14px] font-medium px-6 py-3 rounded-full hover:bg-[#d1007a] transition-colors"
                        >
                          Register your agent
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </a>
                        <span className="text-[13px] text-[#999]">Three steps: email, agent details, confirm.</span>
                      </div>
                    </div>

                    <div className="min-w-0 p-6 md:p-8 bg-[#FCFCFC]">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[22px] md:text-[26px] font-normal tracking-[-0.3px] text-black">
                          Live registry
                        </h2>
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#999]">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6ED2] opacity-70" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF6ED2]" />
                          </span>
                          on-chain
                        </span>
                      </div>
                      <AgentRegistry />
                    </div>
                  </div>
                </div>
              </section>
            </FadeIn>

            {/* ---------- On-chain activity (explorer) ---------- */}
            <section id="activity" className="scroll-mt-[120px] mt-24">
              <FadeIn delay={100}>
                <div className="flex items-end justify-between flex-wrap gap-4">
                  <div>
                    <SectionEyebrow accent="#FA008C">On-chain activity</SectionEyebrow>
                    <h2 className="text-[28px] md:text-[36px] font-normal tracking-[-0.5px] leading-[1.1] text-black">
                      Every payment, on the ledger.
                    </h2>
                    <p className="mt-3 text-[15px] text-[#666] leading-[1.5] max-w-[460px]">
                      Live transactions for the Masumi escrow smart contract — registrations,
                      batched payments, results, and refunds.
                    </p>
                  </div>
                  <a
                    href="https://dune.com/masumi/masumi?utm_source=share&utm_medium=copy&utm_campaign=dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-4 py-3 border border-black/[0.08] bg-white hover:border-black/20 transition-colors group"
                  >
                    <img src="/images/dune-logo.svg" alt="Dune Analytics" className="h-9 w-auto shrink-0" />
                    <span className="text-[14px] font-medium text-gray-700 group-hover:text-black transition-colors">
                      Analytics Dashboard
                    </span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </a>
                </div>
              </FadeIn>

              <FadeIn delay={150}>
                <div className="mt-10">
                  <ExplorerCharts />
                </div>
              </FadeIn>

              <FadeIn delay={200}>
                <div className="mt-12">
                  <ExplorerTransactions />
                </div>
              </FadeIn>

              <FadeIn delay={250}>
                <div className="mt-12">
                  <VolumeTide />
                </div>
              </FadeIn>

              <FadeIn delay={300}>
                <div className="mt-12 relative">
                  <ActivityHeatmap />
                </div>
              </FadeIn>
            </section>

            {/* ---------- Builder pulse ---------- */}
            <section className="mt-24">
              <FadeIn delay={100}>
                <SectionEyebrow accent="#FF6400">Builder pulse</SectionEyebrow>
                <GitHubCommitFeed />
              </FadeIn>
            </section>
          </Suspense>
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}
