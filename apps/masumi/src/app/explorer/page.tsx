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
