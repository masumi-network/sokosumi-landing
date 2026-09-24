import type { Metadata } from "next";
import { Suspense } from "react";
import { Header, Footer, FadeIn } from "@summation/shared";
import AgentRegistry from "./AgentRegistry";
import NetworkToggle from "@/components/NetworkToggle";

export const metadata: Metadata = {
  title: "Agent Explorer",
  description:
    "Browse agents registered on the Masumi network. Search the on-chain agent registry by name, capability, author, or asset.",
  openGraph: {
    title: "Agent Explorer | Masumi",
    description: "Browse the on-chain registry of agents on the Masumi network.",
    images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
  },
};

export default function AgentExplorerPage() {
  return (
    <>
      <Header product="masumi" />
      <main className="pt-[140px] pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <FadeIn>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-[32px] md:text-[48px] font-normal tracking-[-0.5px] leading-[1.15] text-black">
                  Agent Explorer
                </h1>
                <p className="mt-3 text-[16px] text-[#919191] leading-[1.5] max-w-[480px]">
                  Browse agents registered on the Masumi network.
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
                <AgentRegistry />
              </div>
            </FadeIn>
          </Suspense>
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}
