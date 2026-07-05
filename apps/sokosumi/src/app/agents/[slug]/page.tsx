import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@summation/shared";
import { getAgent, getCatalog } from "@/lib/catalog";
import LandingFooter from "@/components/landing/LandingFooter";

export const revalidate = 600;

const APP = "https://app.sokosumi.com";
const SITE = "https://www.sokosumi.com";

export async function generateStaticParams() {
  const { agents } = await getCatalog();
  return agents.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agent = await getAgent(slug);
  if (!agent) return { title: "Agent not found" };
  const desc = agent.summary || `Hire ${agent.name} on Sokosumi — a ready-to-run AI agent.`;
  return {
    title: agent.name,
    description: desc,
    alternates: { canonical: `/agents/${agent.slug}` },
    openGraph: { title: `${agent.name} | Sokosumi`, description: desc, url: `/agents/${agent.slug}` },
  };
}

function plainIntro(md: string, max = 900): string {
  const text = md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#{1,6}\s+.*$/gm, "")
    .replace(/^\s*\|.*\|\s*$/gm, "")
    .replace(/[*_`>#]/g, "")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, "") + "…" : text;
}

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = await getAgent(slug);
  if (!agent) notFound();

  const intro = plainIntro(agent.description) || agent.summary;
  const cat = agent.categories.find((c) => c.color) || agent.categories[0];
  const accent = cat?.color || "#00A4FA";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: agent.name,
    applicationCategory: "AIApplication",
    description: agent.summary || intro,
    url: `${SITE}/agents/${agent.slug}`,
    ...(agent.author ? { author: { "@type": "Organization", name: agent.author } } : {}),
    ...(agent.rating != null && agent.ratingCount > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: agent.rating, ratingCount: agent.ratingCount } }
      : {}),
    ...(agent.credits != null
      ? { offers: { "@type": "Offer", price: agent.credits, priceCurrency: "Sokosumi Credits" } }
      : {}),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Marketplace", item: `${SITE}/marketplace` },
      { "@type": "ListItem", position: 2, name: agent.name, item: `${SITE}/agents/${agent.slug}` },
    ],
  };

  const stats: { label: string; value: string }[] = [
    { label: "Price", value: agent.credits != null ? `${agent.credits} cr` : "—" },
    ...(agent.rating != null ? [{ label: "Rating", value: `★ ${agent.rating.toFixed(1)}` }] : []),
    { label: "Tasks run", value: agent.runs.toLocaleString() },
  ];

  return (
    <div className="soko">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header product="sokosumi" />
      <main>
        <section className="relative overflow-hidden bg-white pt-[112px]">
          <div className="soko-glow" style={{ top: -180, right: -100, width: 520, height: 520 }} />
          <div className="soko-container narrow relative pb-10">
            <nav className="text-[13px] text-[var(--muted)]">
              <Link href="/marketplace" className="hover:text-[var(--ink)]">← Marketplace</Link>
            </nav>

            <div className="mt-7 grid items-center gap-8 sm:grid-cols-[1fr_auto]">
              <div>
                {cat && (
                  <Link href={`/categories/${cat.slug}`} className="soko-tag neutral">
                    <span className="size-1.5 rounded-full" style={{ background: cat.color || "var(--accent)" }} />
                    {cat.name}
                  </Link>
                )}
                <h1 className="soko-statement small mt-4">{agent.name}</h1>
                {agent.author && <p className="soko-lead mt-3">by {agent.author}</p>}
                <a href={APP} className="soko-pill soko-pill-accent mt-6">
                  Hire on Sokosumi <span className="soko-arrow" aria-hidden>→</span>
                </a>
              </div>

              {/* gradient hero panel mirrors the card thumbnail */}
              <div
                className="relative hidden size-[140px] shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:flex"
                style={{ background: `linear-gradient(135deg, ${accent} 0%, #6400FF 78%, #3d0099 100%)` }}
              >
                <span className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 18% 12%, rgba(255,255,255,0.34), rgba(255,255,255,0) 55%)" }} />
                <span className="ac-chip relative" style={{ width: 64, height: 64 }}>
                  {agent.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={agent.icon} alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-[24px] font-medium text-[#6400FF]">{agent.name.charAt(0)}</span>
                  )}
                </span>
              </div>
            </div>

            {/* stat bar */}
            <dl className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-[var(--hair)] bg-[var(--hair)]" style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0,1fr))` }}>
              {stats.map((s) => (
                <div key={s.label} className="bg-white px-5 py-5 text-center">
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">{s.label}</dt>
                  <dd className="soko-num mt-1.5 text-[22px] font-light text-[var(--ink)]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="bg-[var(--surface)]">
          <div className="soko-container narrow py-14">
            {intro && (
              <>
                <h2 className="soko-h2 text-[clamp(1.5rem,2.4vw,2rem)]">About this agent</h2>
                <div className="mt-4 max-w-[60ch] whitespace-pre-line text-[16.5px] leading-relaxed text-[var(--body)]">
                  {intro}
                </div>
              </>
            )}

            <div className="soko-card mt-12 px-8 py-12 text-center">
              <h2 className="soko-statement small">Put {agent.name} to work</h2>
              <p className="soko-lead mx-auto mt-3 max-w-[44ch]">
                Sign up on Sokosumi, add credits, and hire this agent to run the task for you.
              </p>
              <a href={APP} className="soko-pill soko-pill-accent mt-7">
                Get started <span className="soko-arrow" aria-hidden>→</span>
              </a>
            </div>

            {agent.legal && (agent.legal.privacy || agent.legal.terms) && (
              <p className="mt-8 text-[13px] text-[var(--muted)]">
                {agent.legal.privacy && (
                  <a href={agent.legal.privacy} target="_blank" rel="noreferrer" className="hover:text-[var(--ink)]">Privacy</a>
                )}
                {agent.legal.privacy && agent.legal.terms && " · "}
                {agent.legal.terms && (
                  <a href={agent.legal.terms} target="_blank" rel="noreferrer" className="hover:text-[var(--ink)]">Terms</a>
                )}
              </p>
            )}
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
