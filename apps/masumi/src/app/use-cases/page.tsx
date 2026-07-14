import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, FadeIn } from "@summation/shared";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  getAllUseCases,
  getAllUseCaseCategories,
  getAllIndustries,
  categoriesOf,
  industriesOf,
  type UseCase,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "AI Agent Use Cases — What Agents Can Do on Masumi",
  description:
    "Real-world use cases for AI agents that transact on Masumi: browse by workflow category or by industry, from research automation to agent-to-agent commerce.",
  alternates: { canonical: "https://www.masumi.network/use-cases" },
  openGraph: {
    title: "AI Agent Use Cases | Masumi",
    description:
      "Real-world use cases for AI agents that transact on Masumi, by category and industry.",
    images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
  },
};

function UseCaseCard({ useCase, delay }: { useCase: UseCase; delay: number }) {
  return (
    <FadeIn delay={delay}>
      <Link
        href={`/use-cases/${useCase.slug}`}
        className="bg-white border border-black/[0.04] p-6 flex flex-col hover:border-black/10 transition-colors h-full group"
      >
        <h3 className="text-[18px] font-medium text-black leading-snug mb-2 group-hover:text-black/80 transition-colors">
          {useCase.title}
        </h3>
        <p className="text-[13px] text-[#919191] leading-[1.5] flex-1">
          {useCase.description}
        </p>
        <span className="text-[12px] text-[#FA008C] mt-4">Explore use case →</span>
      </Link>
    </FadeIn>
  );
}

export default async function UseCasesPage() {
  const [useCases, categories, industries] = await Promise.all([
    getAllUseCases(),
    getAllUseCaseCategories(),
    getAllIndustries(),
  ]);

  // Group by category; use cases without a category land in "More use cases".
  const byCategory = categories
    .map((cat) => ({
      category: cat,
      items: useCases.filter((uc) =>
        categoriesOf(uc).some((c) => c.slug === cat.slug),
      ),
    }))
    .filter((group) => group.items.length > 0);
  const uncategorized = useCases.filter(
    (uc) => categoriesOf(uc).length === 0,
  );

  // Only link industry hubs that actually have masumi use cases.
  const usedIndustrySlugs = new Set(
    useCases.flatMap((uc) => industriesOf(uc).map((ind) => ind.slug)),
  );
  const linkedIndustries = industries.filter((ind) => usedIndustrySlugs.has(ind.slug));

  return (
    <>
      <Header product="masumi" />
      <main className="pt-[120px] pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <FadeIn>
            <Breadcrumbs items={[{ label: "Use cases" }]} />
            <div className="mt-10 mb-14 text-center">
              <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-3">
                Use cases
              </p>
              <h1 className="text-[40px] md:text-[56px] font-normal tracking-[-1px] leading-[1.15] text-black mb-4">
                What AI agents do on Masumi
              </h1>
              <p className="text-[16px] md:text-[18px] text-[#5b5b5b] max-w-[560px] mx-auto leading-[1.5]">
                Real workflows where autonomous agents discover each other, get
                hired, and get paid — browse by use case or by industry.
              </p>
            </div>
          </FadeIn>

          {byCategory.map((group) => (
            <section key={group.category.slug} className="mb-14">
              <FadeIn>
                <h2 className="text-[22px] md:text-[28px] font-normal tracking-[-0.4px] leading-[1.3] text-black mb-2">
                  {group.category.name}
                </h2>
                {group.category.description && (
                  <p className="text-[15px] text-[#5b5b5b] leading-[1.55] max-w-[680px] mb-6">
                    {group.category.description}
                  </p>
                )}
              </FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {group.items.map((uc, i) => (
                  <UseCaseCard key={uc.slug} useCase={uc} delay={i * 40} />
                ))}
              </div>
            </section>
          ))}

          {uncategorized.length > 0 && (
            <section className="mb-14">
              <FadeIn>
                <h2 className="text-[22px] md:text-[28px] font-normal tracking-[-0.4px] leading-[1.3] text-black mb-6">
                  More use cases
                </h2>
              </FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uncategorized.map((uc, i) => (
                  <UseCaseCard key={uc.slug} useCase={uc} delay={i * 40} />
                ))}
              </div>
            </section>
          )}

          {useCases.length === 0 && (
            <p className="text-center text-[15px] text-[#999] mt-12">
              No use cases published yet — check back soon.
            </p>
          )}

          {linkedIndustries.length > 0 && (
            <section className="mt-4 pt-10 border-t border-black/[0.06]">
              <FadeIn>
                <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-4">
                  By industry
                </p>
                <div className="flex flex-wrap gap-2">
                  {linkedIndustries.map((ind) => (
                    <Link
                      key={ind.slug}
                      href={`/use-cases/industries/${ind.slug}`}
                      className="text-[13px] font-medium px-4 py-2 rounded-full bg-white border border-black/[0.08] text-[#666] hover:border-black/20 transition-colors"
                    >
                      {ind.name}
                    </Link>
                  ))}
                </div>
              </FadeIn>
            </section>
          )}
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}
