import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@summation/shared";
import { getCoworker, getCatalog } from "@/lib/catalog";
import LandingFooter from "@/components/landing/LandingFooter";

export const revalidate = 600;

const APP = "https://app.sokosumi.com";
const SITE = "https://www.sokosumi.com";

export async function generateStaticParams() {
  const { coworkers } = await getCatalog();
  return coworkers.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCoworker(slug);
  if (!c) return { title: "Coworker not found" };
  const desc = (c.description || `Meet ${c.name}, an AI coworker on Sokosumi.`).slice(0, 180);
  return {
    title: `${c.name} — ${c.role || "AI coworker"}`,
    description: desc,
    alternates: { canonical: `/coworkers/${c.slug}` },
    openGraph: {
      title: `${c.name} — ${c.role} | Sokosumi`,
      description: desc,
      url: `/coworkers/${c.slug}`,
      images: c.image ? [{ url: c.image }] : undefined,
    },
  };
}

export default async function CoworkerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await getCoworker(slug);
  if (!c) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: c.name,
      jobTitle: c.role || "AI coworker",
      ...(c.image ? { image: c.image } : {}),
      ...(c.company ? { worksFor: { "@type": "Organization", name: c.company } } : {}),
      description: c.description,
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Coworkers", item: `${SITE}/coworkers` },
      { "@type": "ListItem", position: 2, name: c.name, item: `${SITE}/coworkers/${c.slug}` },
    ],
  };

  return (
    <div className="soko">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header product="sokosumi" />
      <main>
        <section className="relative overflow-hidden bg-white pt-[120px]">
          <div className="soko-glow iris" style={{ top: -200, left: "50%", marginLeft: -240, width: 520, height: 520 }} />
          <div className="soko-container narrow relative pb-12 text-center">
            <nav className="text-[13px] text-[var(--muted)]">
              <Link href="/coworkers" className="hover:text-[var(--ink)]">← All coworkers</Link>
            </nav>

            <div className="mt-8 flex flex-col items-center">
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.image}
                  alt={c.name}
                  className="size-32 rounded-full object-cover ring-1 ring-[var(--hair)]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex size-32 items-center justify-center rounded-full bg-gradient-to-br from-[#6400ff] to-[#00a4fa] text-5xl font-light text-white">
                  {c.name.charAt(0)}
                </div>
              )}
              <h1 className="soko-statement small mt-6">{c.name}</h1>
              <p className="soko-lead mt-2">
                {c.role}
                {c.company && <span className="text-[var(--ink)]"> · {c.company}</span>}
              </p>
              {c.capabilities.length > 0 && (
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {c.capabilities.map((cap) => (
                    <span key={cap} className="soko-tag neutral capitalize">{cap}</span>
                  ))}
                </div>
              )}
              <a href={APP} className="soko-pill soko-pill-accent mt-7">
                Start a task with {c.name} <span className="soko-arrow" aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>

        {c.description && (
          <section className="bg-[var(--surface)]">
            <div className="soko-container narrow py-14">
              <h2 className="soko-h2 text-[clamp(1.5rem,2.4vw,2rem)]">About {c.name}</h2>
              <p className="mt-4 max-w-[62ch] text-[16.5px] leading-relaxed text-[var(--body)]">
                {c.description}
              </p>
            </div>
          </section>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}
