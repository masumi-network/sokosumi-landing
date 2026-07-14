import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, FadeIn } from "@summation/shared";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  getAllIndustries,
  getIndustryBySlug,
  getUseCasesByIndustry,
} from "@/lib/content";

export async function generateStaticParams() {
  try {
    return (await getAllIndustries()).map((ind) => ({ slug: ind.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) return { title: "Industry Not Found" };
  return {
    title: `AI Agent Use Cases for ${industry.name}`,
    description:
      industry.description ??
      `How ${industry.name} teams put AI agents to work with Masumi.`,
    alternates: {
      canonical: `https://www.masumi.network/use-cases/industries/${industry.slug}`,
    },
    openGraph: {
      title: `AI Agent Use Cases for ${industry.name} | Masumi`,
      description:
        industry.description ??
        `How ${industry.name} teams put AI agents to work with Masumi.`,
      images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
    },
  };
}

export default async function IndustryHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) notFound();
  const useCases = await getUseCasesByIndustry(industry.id);

  return (
    <>
      <Header product="masumi" />
      <main className="pt-[120px] pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <FadeIn>
            <Breadcrumbs
              items={[
                { label: "Use cases", href: "/use-cases" },
                { label: industry.name },
              ]}
            />
            <div className="mt-10 mb-14 text-center">
              <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-3">
                Industry
              </p>
              <h1 className="text-[40px] md:text-[56px] font-normal tracking-[-1px] leading-[1.15] text-black mb-4">
                AI agent use cases for {industry.name}
              </h1>
              {industry.description && (
                <p className="text-[16px] md:text-[18px] text-[#5b5b5b] max-w-[560px] mx-auto leading-[1.5]">
                  {industry.description}
                </p>
              )}
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc, i) => (
              <FadeIn key={uc.slug} delay={i * 40}>
                <Link
                  href={`/use-cases/${uc.slug}`}
                  className="bg-white border border-black/[0.04] p-6 flex flex-col hover:border-black/10 transition-colors h-full group"
                >
                  <h2 className="text-[18px] font-medium text-black leading-snug mb-2 group-hover:text-black/80 transition-colors">
                    {uc.title}
                  </h2>
                  <p className="text-[13px] text-[#919191] leading-[1.5] flex-1">
                    {uc.description}
                  </p>
                  <span className="text-[12px] text-[#FA008C] mt-4">Explore use case →</span>
                </Link>
              </FadeIn>
            ))}
          </div>

          {useCases.length === 0 && (
            <p className="text-center text-[15px] text-[#999] mt-12">
              No use cases published for this industry yet —{" "}
              <Link href="/use-cases" className="underline underline-offset-4 hover:text-black transition-colors">
                browse all use cases
              </Link>
              .
            </p>
          )}
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}
