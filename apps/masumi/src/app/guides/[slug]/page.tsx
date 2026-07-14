import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, FadeIn } from "@summation/shared";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  getAllGuides,
  getGuideBySlug,
  relatedGuides,
  GUIDE_CATEGORY_LABELS,
} from "@/lib/content";

export async function generateStaticParams() {
  try {
    return (await getAllGuides()).map((g) => ({ slug: g.slug }));
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
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: "Guide Not Found" };
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `https://www.masumi.network/guides/${guide.slug}` },
    openGraph: {
      title: `${guide.title} | Masumi Guides`,
      description: guide.description,
      images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();
  const related = relatedGuides(guide);

  return (
    <>
      <Header product="masumi" />
      <main className="pt-[120px] pb-24">
        <div className="max-w-[720px] mx-auto px-4 md:px-8">
          <FadeIn>
            <Breadcrumbs
              items={[{ label: "Guides", href: "/guides" }, { label: guide.title }]}
            />
            <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mt-12 mb-4">
              {GUIDE_CATEGORY_LABELS[guide.category] ?? guide.category}
            </p>
            <h1 className="text-[32px] md:text-[44px] font-normal tracking-[-0.8px] leading-[1.15] text-black mb-4">
              {guide.title}
            </h1>
            <p className="text-[17px] text-[#5b5b5b] leading-[1.6] mb-12">
              {guide.description}
            </p>
          </FadeIn>

          <FadeIn delay={80}>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: guide.contentHtml ?? "" }}
            />
          </FadeIn>

          {related.length > 0 && (
            <FadeIn delay={120}>
              <div className="mt-14 pt-8 border-t border-black/[0.06]">
                <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-4">
                  Related guides
                </p>
                <div className="flex flex-wrap gap-2">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/guides/${r.slug}`}
                      className="text-[13px] font-medium px-4 py-2 rounded-full bg-white border border-black/[0.08] text-[#666] hover:border-black/20 transition-colors"
                    >
                      {r.title}
                    </Link>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}
