import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, FadeIn } from "@summation/shared";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  getAllGuides,
  GUIDE_CATEGORIES,
  GUIDE_CATEGORY_LABELS,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Guides — Build and Ship on Masumi",
  description:
    "Step-by-step guides for building on the Masumi payment network: getting started, integrations, agent workflows, and advanced topics.",
  alternates: { canonical: "https://www.masumi.network/guides" },
  openGraph: {
    title: "Guides | Masumi",
    description:
      "Step-by-step guides for building on the Masumi payment network.",
    images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
  },
};

export default async function GuidesPage() {
  const guides = await getAllGuides();

  const groups = GUIDE_CATEGORIES.map((category) => ({
    category,
    items: guides
      .filter((g) => g.category === category)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <Header product="masumi" />
      <main className="pt-[120px] pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <FadeIn>
            <Breadcrumbs items={[{ label: "Guides" }]} />
            <div className="mt-10 mb-14 text-center">
              <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-3">
                Guides
              </p>
              <h1 className="text-[40px] md:text-[56px] font-normal tracking-[-1px] leading-[1.15] text-black mb-4">
                Build and ship on Masumi
              </h1>
              <p className="text-[16px] md:text-[18px] text-[#5b5b5b] max-w-[520px] mx-auto leading-[1.5]">
                Step-by-step guides — from your first agent payment to advanced
                integrations.
              </p>
            </div>
          </FadeIn>

          {groups.map((group) => (
            <section key={group.category} className="mb-14">
              <FadeIn>
                <h2 className="text-[22px] md:text-[28px] font-normal tracking-[-0.4px] leading-[1.3] text-black mb-6">
                  {GUIDE_CATEGORY_LABELS[group.category]}
                </h2>
              </FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((guide, i) => (
                  <FadeIn key={guide.slug} delay={i * 40}>
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="bg-white border border-black/[0.04] p-6 flex flex-col hover:border-black/10 transition-colors h-full group"
                    >
                      <h3 className="text-[18px] font-medium text-black leading-snug mb-2 group-hover:text-black/80 transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-[13px] text-[#919191] leading-[1.5] flex-1">
                        {guide.description}
                      </p>
                      <span className="text-[12px] text-[#FA008C] mt-4">Read guide →</span>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </section>
          ))}

          {guides.length === 0 && (
            <p className="text-center text-[15px] text-[#999] mt-12">
              No guides published yet — check back soon.
            </p>
          )}
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}
