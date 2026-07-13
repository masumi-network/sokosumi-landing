import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer } from "@summation/shared";
import { cmsFetch } from "@/lib/cms";
import { RenderBlocks, type PageBlock } from "@/components/CmsBlocks";

// CMS-built landing pages: any page published in the CMS "Pages" collection
// (site = masumi) renders here at /<slug>. Real routes always win over this
// catch-all; unknown slugs 404.

type CmsPage = {
  title: string;
  slug: string;
  description: string;
  layout: PageBlock[];
};

async function getPage(slug: string): Promise<CmsPage | null> {
  const res = await cmsFetch<{ docs: CmsPage[] }>(
    `/pages?where[slug][equals]=${encodeURIComponent(slug)}&where[site][equals]=masumi&limit=1&depth=1`,
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

  return (
    <>
      <Header product="masumi" />
      <main className="pb-24">
        <RenderBlocks blocks={page.layout} />
      </main>
      <Footer product="masumi" />
    </>
  );
}
