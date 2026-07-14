import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer } from "@summation/shared";
import { cmsFetch, isDraftModeEnabled } from "@/lib/cms";
import { RenderBlocks, type PageBlock } from "@/components/CmsBlocks";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";

// CMS-built landing pages: any page published in the CMS "Pages" collection
// (site = masumi) renders here at /<slug>. Real routes always win over this
// catch-all; unknown slugs 404.

type CmsPage = {
  title: string;
  slug: string;
  description: string;
  parent?: { title: string; slug: string } | string | number | null;
  layout: PageBlock[];
};

async function getPage(slug: string): Promise<CmsPage | null> {
  const res = await cmsFetch<{ docs: CmsPage[] }>(
    `/pages?where[slug][equals]=${encodeURIComponent(slug)}&where[site][equals]=masumi&limit=1&depth=1`,
    { draft: await isDraftModeEnabled() },
  );
  return res?.docs?.[0] ?? null;
}

export async function generateStaticParams() {
  try {
    const res = await cmsFetch<{ docs: { slug: string }[] }>(
      "/pages?where[site][equals]=masumi&limit=200&depth=0",
    );
    return (res?.docs ?? []).map((p) => ({ slug: p.slug.split("/") }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug.join("/"));
  if (!page) return { title: "Page Not Found" };
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `https://www.masumi.network/${page.slug}` },
    openGraph: {
      title: `${page.title} | Masumi`,
      description: page.description,
      images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
    },
  };
}

export default async function CmsPageRoute({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug.join("/"));
  if (!page) notFound();

  const parent =
    page.parent && typeof page.parent === "object" ? page.parent : null;
  const crumbs: Crumb[] = [
    ...(parent ? [{ label: parent.title, href: `/${parent.slug}` }] : []),
    { label: page.title },
  ];

  return (
    <>
      <Header product="masumi" />
      <main className="relative pb-24">
        <div className="absolute top-[110px] left-0 right-0 z-10">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
            <Breadcrumbs items={crumbs} />
          </div>
        </div>
        <RenderBlocks blocks={page.layout} />
      </main>
      <Footer product="masumi" />
    </>
  );
}
