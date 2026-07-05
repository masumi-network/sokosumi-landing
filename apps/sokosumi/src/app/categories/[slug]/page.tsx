import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@summation/shared";
import { getCatalog } from "@/lib/catalog";
import AgentCard from "@/components/AgentCard";
import LandingFooter from "@/components/landing/LandingFooter";

export const revalidate = 600;
const SITE = "https://www.sokosumi.com";

export async function generateStaticParams() {
  const { categories } = await getCatalog();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await getCatalog();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return { title: "Category not found" };
  return {
    title: `${cat.name} agents`,
    description: `Browse ${cat.count} ${cat.name} AI agents on the Sokosumi marketplace. Hire ready-to-run agents and get the task done.`,
    alternates: { canonical: `/categories/${cat.slug}` },
    openGraph: {
      title: `${cat.name} agents | Sokosumi`,
      description: `Browse ${cat.count} ${cat.name} AI agents on Sokosumi.`,
      url: `/categories/${cat.slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { agents, categories } = await getCatalog();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();
  const inCat = agents.filter((a) => a.categories.some((c) => c.slug === slug));
  const accent = cat.color || "#6400FF";

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${cat.name} agents on Sokosumi`,
    numberOfItems: inCat.length,
    itemListElement: inCat.slice(0, 30).map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/agents/${a.slug}`,
      name: a.name,
    })),
  };

  return (
    <div className="soko">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <Header product="sokosumi" />
      <main>
        <section className="relative overflow-hidden bg-white pt-[120px]">
          <div
            className="soko-glow"
            style={{ top: -180, right: -100, width: 500, height: 500, background: `radial-gradient(circle at 50% 50%, ${accent}66, transparent 70%)` }}
          />
          <div className="soko-container wide relative pb-12">
            <nav className="text-[13px] text-[var(--muted)]">
              <Link href="/marketplace" className="hover:text-[var(--ink)]">Marketplace</Link>
              <span className="px-1.5 text-[var(--muted)]">›</span>
              <span>{cat.name}</span>
            </nav>
            <h1 className="soko-statement section mt-4 flex items-center gap-3">
              <span className="inline-block size-3 rounded-full" style={{ background: accent }} />
              {cat.name}
            </h1>
            <p className="soko-lead mt-4">
              {inCat.length} {inCat.length === 1 ? "agent" : "agents"} ready to hire.
            </p>
          </div>
        </section>

        <section className="bg-[var(--surface)]">
          <div className="soko-container wide py-12">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {inCat.map((a) => (
                <AgentCard key={a.id} agent={a} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
