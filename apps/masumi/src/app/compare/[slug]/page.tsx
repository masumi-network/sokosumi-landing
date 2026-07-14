import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer } from "@summation/shared";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RenderBlocks } from "@/components/CmsBlocks";
import { getAllComparisons, getComparisonBySlug } from "@/lib/content";

export async function generateStaticParams() {
  try {
    return (await getAllComparisons()).map((c) => ({ slug: c.slug }));
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
  const comparison = await getComparisonBySlug(slug);
  if (!comparison) return { title: "Comparison Not Found" };
  return {
    title: comparison.title,
    description: comparison.description,
    alternates: { canonical: `https://www.masumi.network/compare/${comparison.slug}` },
    openGraph: {
      title: `${comparison.title} | Masumi`,
      description: comparison.description,
      images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
    },
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comparison = await getComparisonBySlug(slug);
  if (!comparison) notFound();

  return (
    <>
      <Header product="masumi" />
      <main className="relative pb-24">
        <div className="absolute top-[110px] left-0 right-0 z-10">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
            <Breadcrumbs
              items={[
                { label: "Compare", href: "/compare" },
                { label: `Masumi vs. ${comparison.competitor}` },
              ]}
            />
          </div>
        </div>
        <RenderBlocks blocks={comparison.layout} />
      </main>
      <Footer product="masumi" />
    </>
  );
}
