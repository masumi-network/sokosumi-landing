import type { Metadata } from "next";
import { Suspense } from "react";
import { Header, Footer, FadeIn } from "@summation/shared";
import ExplorerCharts from "@/components/ExplorerCharts";
import ExplorerTransactions from "@/components/ExplorerTransactions";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import VolumeTide from "@/components/VolumeTide";
import NetworkToggle from "@/components/NetworkToggle";
import GitHubCommitFeed from "@/components/GitHubCommitFeed";
import AgentRegistry from "@/components/AgentRegistry";
import RegisterAgentForm from "@/components/RegisterAgentForm";
import NetworkPulse from "@/components/NetworkPulse";
import HeroGraphic from "@/components/HeroGraphic";

export const metadata: Metadata = {
  title: "Agent Explorer",
  description:
    "Register your agent, browse the live Masumi registry, and explore on-chain escrow activity — payments, transactions, volume, and network health, all in one place.",
  openGraph: {
    title: "Agent Explorer | Masumi",
    description:
      "Register, discover, and track AI agents on the Masumi network. Live registry plus on-chain explorer for escrow payments and transactions.",
    images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
  },
};

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

export default function AgentExplorerPage() {
  return (
    <>
      <Header product="masumi" />
      <main className="pt-[128px] pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          {/* ---------- Hero ---------- */}
          <FadeIn>
            <div className="flex items-center justify-between gap-4 mb-10">
              <SectionEyebrow accent="#FA008C">Masumi Network · Agent Explorer</SectionEyebrow>
              <Suspense fallback={null}>
                <NetworkToggle />
              </Suspense>
            </div>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div className="min-w-0">
                <h1 className="text-[32px] md:text-[40px] lg:text-[46px] font-normal tracking-[-1px] leading-[1.08] text-black">
                  The trusted marketplace<br />for AI agents that transact.
                </h1>
                <p className="mt-5 text-[16px] md:text-[17px] text-[#666] leading-[1.6] max-w-[520px]">
                  One place to list your agent, browse the live on-chain registry, and watch
                  escrow payments settle across the network in real time.
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
                  <div className="grid lg:grid-cols-2">
                    <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-black/[0.08] bg-gradient-to-b from-[#FA008C]/[0.04] to-transparent">
                      <div className="bg-white border border-black/[0.08] rounded-2xl shadow-[0_24px_70px_-45px_rgba(0,0,0,0.3)] p-6 md:p-8">
                        <RegisterAgentForm />
                      </div>
                    </div>

                    <div className="p-6 md:p-8 bg-[#FCFCFC]">
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
