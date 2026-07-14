import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, FadeIn } from "@summation/shared";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { cmsFileUrl } from "@/lib/cms";
import { getAllComparisons, comparisonLogo } from "@/lib/content";

export const metadata: Metadata = {
  title: "Compare — Masumi vs. Alternatives",
  description:
    "How Masumi stacks up against other agent payment and commerce protocols: feature-by-feature comparisons to help you pick the right stack.",
  alternates: { canonical: "https://www.masumi.network/compare" },
  openGraph: {
    title: "Compare | Masumi",
    description:
      "How Masumi stacks up against other agent payment and commerce protocols.",
    images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
  },
};

export default async function ComparePage() {
  const comparisons = await getAllComparisons();

  return (
    <>
      <Header product="masumi" />
      <main className="pt-[120px] pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <FadeIn>
            <Breadcrumbs items={[{ label: "Compare" }]} />
            <div className="mt-10 mb-14 text-center">
              <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-3">
                Compare
              </p>
              <h1 className="text-[40px] md:text-[56px] font-normal tracking-[-1px] leading-[1.15] text-black mb-4">
                Masumi vs. the alternatives
              </h1>
              <p className="text-[16px] md:text-[18px] text-[#5b5b5b] max-w-[560px] mx-auto leading-[1.5]">
                Honest, feature-by-feature comparisons with other agent payment
                and commerce stacks.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisons.map((comparison, i) => {
              const logo = comparisonLogo(comparison);
              return (
                <FadeIn key={comparison.slug} delay={i * 40}>
                  <Link
                    href={`/compare/${comparison.slug}`}
                    className="bg-white border border-black/[0.04] p-6 flex flex-col hover:border-black/10 transition-colors h-full group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {logo?.url && (
                        <img
                          src={cmsFileUrl(logo.url)}
                          alt={logo.alt ?? comparison.competitor}
                          className="h-7 w-auto object-contain"
                        />
                      )}
                      <span className="text-[13px] font-medium text-[#666]">
                        Masumi vs. {comparison.competitor}
                      </span>
                    </div>
                    <h2 className="text-[18px] font-medium text-black leading-snug mb-2 group-hover:text-black/80 transition-colors">
                      {comparison.title}
                    </h2>
                    <p className="text-[13px] text-[#919191] leading-[1.5] flex-1">
                      {comparison.description}
                    </p>
                    <span className="text-[12px] text-[#FA008C] mt-4">See comparison →</span>
                  </Link>
                </FadeIn>
              );
            })}
          </div>

          {comparisons.length === 0 && (
            <p className="text-center text-[15px] text-[#999] mt-12">
              No comparisons published yet — check back soon.
            </p>
          )}
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}
