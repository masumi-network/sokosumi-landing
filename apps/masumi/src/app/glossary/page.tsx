import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, FadeIn } from "@summation/shared";
import { getAllTerms } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Agentic Payments Glossary — AI Agent Economy Terms Explained",
  description:
    "Plain-English definitions of the terms behind the AI agent economy: x402, A2A, AP2, escrow smart contracts, agent registries, DIDs, and more.",
  alternates: { canonical: "https://www.masumi.network/glossary" },
  openGraph: {
    title: "Agentic Payments Glossary | Masumi",
    description:
      "Plain-English definitions of the terms behind the AI agent economy.",
    images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
  },
};

export default async function GlossaryIndex() {
  const terms = await getAllTerms();

  return (
    <>
      <Header product="masumi" />
      <main className="pt-[160px] pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <FadeIn>
            <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-3 text-center">
              Glossary
            </p>
            <h1 className="text-[40px] md:text-[56px] font-normal tracking-[-1px] leading-[1.15] text-black text-center mb-4">
              The agent economy, defined
            </h1>
            <p className="text-[16px] md:text-[18px] text-[#5b5b5b] text-center max-w-[520px] mx-auto mb-14 leading-[1.5]">
              Plain-English definitions of the protocols and concepts behind
              agent-to-agent payments.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {terms.map((t, i) => (
              <FadeIn key={t.slug} delay={i * 40}>
                <Link
                  href={`/glossary/${t.slug}`}
                  className="bg-white border border-black/[0.04] p-6 flex flex-col hover:border-black/10 transition-colors h-full group"
                >
                  <h2 className="text-[18px] font-medium text-black leading-snug mb-2 group-hover:text-black/80 transition-colors">
                    {t.term}
                  </h2>
                  <p className="text-[13px] text-[#919191] leading-[1.5] flex-1">
                    {t.shortDefinition}
                  </p>
                  <span className="text-[12px] text-[#FA008C] mt-4">Read definition →</span>
                </Link>
              </FadeIn>
            ))}
          </div>

          {terms.length === 0 && (
            <p className="text-center text-[15px] text-[#999] mt-12">
              No terms published yet.
            </p>
          )}
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}
