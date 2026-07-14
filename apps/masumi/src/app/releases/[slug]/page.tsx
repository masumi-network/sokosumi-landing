import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer, FadeIn } from "@summation/shared";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  getAllReleases,
  getReleaseBySlug,
  TAG_COLORS,
  TAG_LABELS,
} from "@/lib/content";

export async function generateStaticParams() {
  try {
    return (await getAllReleases()).map((r) => ({ slug: r.slug }));
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
  const release = await getReleaseBySlug(slug);
  if (!release) return { title: "Release Not Found" };
  return {
    title: release.version ? `${release.title} (${release.version})` : release.title,
    description: release.description,
    alternates: { canonical: `https://www.masumi.network/releases/${release.slug}` },
    openGraph: {
      title: `${release.title} | Masumi Releases`,
      description: release.description,
      images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
    },
  };
}

export default async function ReleasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const release = await getReleaseBySlug(slug);
  if (!release) notFound();
  const highlights = release.highlights ?? [];

  return (
    <>
      <Header product="masumi" />
      <main className="pt-[120px] pb-24">
        <div className="max-w-[720px] mx-auto px-4 md:px-8">
          <FadeIn>
            <Breadcrumbs
              items={[
                { label: "Releases", href: "/releases" },
                { label: release.title },
              ]}
            />
            <div className="flex flex-wrap items-center gap-3 mt-12 mb-4">
              <time
                dateTime={release.date}
                className="text-[12px] text-[#999] font-mono uppercase tracking-[0.08em]"
              >
                {new Date(release.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              {release.version && (
                <span className="text-[11px] font-medium font-mono px-2 py-0.5 rounded-full bg-black text-white">
                  {release.version}
                </span>
              )}
            </div>
            <h1 className="text-[32px] md:text-[44px] font-normal tracking-[-0.8px] leading-[1.15] text-black mb-4">
              {release.title}
            </h1>
            <p className="text-[17px] text-[#5b5b5b] leading-[1.6] mb-10">
              {release.description}
            </p>
          </FadeIn>

          {highlights.length > 0 && (
            <FadeIn delay={60}>
              <ul className="space-y-2.5 mb-12">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${TAG_COLORS[h.tag] ?? "#666"}15`,
                        color: TAG_COLORS[h.tag] ?? "#666",
                      }}
                    >
                      {TAG_LABELS[h.tag] ?? h.tag}
                    </span>
                    <span className="text-[15px] text-[#5b5b5b] leading-[1.55]">
                      {h.text}
                    </span>
                  </li>
                ))}
              </ul>
            </FadeIn>
          )}

          {release.contentHtml && (
            <FadeIn delay={100}>
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: release.contentHtml }}
              />
            </FadeIn>
          )}
        </div>
      </main>
      <Footer product="masumi" />
    </>
  );
}
