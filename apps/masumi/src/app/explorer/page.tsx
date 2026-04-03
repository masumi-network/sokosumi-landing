import type { Metadata } from "next";
import { Suspense } from "react";
import { Header, Footer, FadeIn } from "@summation/shared";
import ExplorerCharts from "@/components/ExplorerCharts";
import ExplorerTransactions from "@/components/ExplorerTransactions";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import VolumeTide from "@/components/VolumeTide";
import NetworkToggle from "@/components/NetworkToggle";

export const metadata: Metadata = {
  title: "Explorer",
  description:
    "Explore on-chain transactions for the Masumi escrow smart contract. View UTXOs, agent registrations, escrow payments, and releases.",
  openGraph: {
    title: "Explorer | Masumi",
    description:
      "On-chain transaction explorer for the Masumi payment network.",
    images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
  },
};

export default function ExplorerPage() {
  return (
    <>
      <Header product="masumi" />
      <main className="pt-[140px] pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <FadeIn>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-[32px] md:text-[48px] font-normal tracking-[-0.5px] leading-[1.15] text-black">
                  Explorer
                </h1>
                <p className="mt-3 text-[16px] text-[#919191] leading-[1.5] max-w-[480px]">
                  On-chain transaction data for the Masumi escrow smart contract.
                </p>
              </div>
              <Suspense fallback={null}>
                <NetworkToggle />
              </Suspense>
            </div>
          </FadeIn>

          <FadeIn delay={50}>
            <div className="mt-8 flex flex-col gap-10">
              {/* Option A -- Full-width banner card */}
              <div>
                <span className="block mb-2 text-sm font-medium text-gray-400">Option A</span>
                <a
                  href="https://dune.com/masumi/masumi?utm_source=share&utm_medium=copy&utm_campaign=dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-2xl bg-[#0F0F15] p-8 text-center hover:brightness-110 hover:shadow-xl hover:shadow-black/15 transition-all duration-200 group"
                >
                  <img
                    src="/images/dune-logo.svg"
                    alt="Dune Analytics"
                    className="h-16 w-auto mx-auto"
                  />
                  <span className="mt-4 block text-[16px] font-medium text-white/60 group-hover:text-white/90 transition-colors">
                    View Analytics Dashboard&ensp;&rarr;
                  </span>
                </a>
              </div>

              {/* Option B -- Horizontal card with large logo */}
              <div>
                <span className="block mb-2 text-sm font-medium text-gray-400">Option B</span>
                <a
                  href="https://dune.com/masumi/masumi?utm_source=share&utm_medium=copy&utm_campaign=dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-6 px-8 py-5 rounded-xl bg-[#0F0F15] hover:brightness-110 hover:scale-[1.02] transition-all duration-200 group shadow-lg shadow-black/10"
                >
                  <img
                    src="/images/dune-logo.svg"
                    alt="Dune Analytics"
                    className="h-14 w-auto shrink-0"
                  />
                  <span className="text-[18px] font-medium text-white/70 group-hover:text-white transition-colors">
                    Analytics Dashboard
                  </span>
                  <svg
                    className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              </div>

              {/* Option C -- Glass/outline style */}
              <div>
                <span className="block mb-2 text-sm font-medium text-gray-400">Option C</span>
                <a
                  href="https://dune.com/masumi/masumi?utm_source=share&utm_medium=copy&utm_campaign=dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-5 px-6 py-4 rounded-xl border border-black/10 bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-200 group"
                >
                  <img
                    src="/images/dune-logo.svg"
                    alt="Dune Analytics"
                    className="h-12 w-auto shrink-0"
                  />
                  <span className="text-[17px] font-medium text-gray-700 group-hover:text-black transition-colors">
                    Dune Analytics Dashboard
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              </div>
            </div>
          </FadeIn>

          <Suspense fallback={null}>
            <FadeIn delay={100}>
              <div className="mt-10">
                <ExplorerCharts />
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="mt-10">
                <ExplorerTransactions />
              </div>
            </FadeIn>

            <FadeIn delay={300}>
              <div className="mt-10">
                <VolumeTide />
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="mt-10 relative">
                <ActivityHeatmap />
              </div>
            </FadeIn>
          </Suspense>
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}
