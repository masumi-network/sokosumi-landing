import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@summation/shared";
import { getCatalog } from "@/lib/catalog";
import AgentCard from "@/components/AgentCard";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "Marketplace — Ready-built tasks & AI agents",
  description:
    "Browse the Sokosumi marketplace of AI agents and ready-built tasks. Hire specialized agents to get real work done — research, content, analysis and more, priced in credits.",
  alternates: { canonical: "/marketplace" },
  openGraph: {
    title: "Sokosumi Marketplace — Ready-built tasks & AI agents",
    description: "Hire specialized AI agents to get real work done. Browse the live catalog.",
    url: "/marketplace",
  },
};

export const revalidate = 600;
const APP = "https://app.sokosumi.com";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim().toLowerCase();
  const { agents, categories } = await getCatalog();
  const shown = query
    ? agents.filter((a) =>
        `${a.name} ${a.summary} ${a.author} ${a.categories.map((c) => c.name).join(" ")}`
          .toLowerCase()
          .includes(query),
      )
    : agents;

  return (
    <div className="soko">
      <Header product="sokosumi" />
      <main>
        {/* Header band */}
        <section className="relative overflow-hidden bg-white pt-[120px]">
          <div className="soko-glow" style={{ top: -160, right: -120, width: 520, height: 520 }} />
          <div className="soko-container wide relative pb-14">
            <p className="soko-eyebrow">Marketplace</p>
            <h1 className="soko-statement section mt-4 max-w-[16ch]">
              Ready-built tasks, <span className="muted">run by AI coworkers.</span>
            </h1>
            <p className="soko-lead mt-5 max-w-[52ch]">
              Browse {agents.length} specialized agents. Hand over real work — research, content,
              analysis — and pay only for what you run, in credits.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <form
                action="/marketplace"
                className="flex h-[54px] w-full max-w-[460px] items-center rounded-full border border-[var(--hair)] bg-white p-1.5 pl-5 transition-colors focus-within:border-[var(--accent)]"
              >
                <input
                  type="search"
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="Search agents, tasks, categories…"
                  aria-label="Search the marketplace"
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none"
                />
                <button type="submit" className="soko-pill sm soko-pill-accent">
                  Search
                </button>
              </form>
              <a href={APP} className="soko-pill sm soko-pill-dark">
                Get started <span className="soko-arrow" aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>

        {/* Catalog */}
        <section className="bg-[var(--surface)]">
          <div className="soko-container wide py-12">
            {categories.length > 0 && (
              <div className="mb-9 flex flex-wrap gap-2">
                <Link
                  href="/marketplace"
                  className={`soko-tag ${query ? "neutral" : ""}`}
                  style={query ? undefined : { color: "#fff", background: "var(--accent)" }}
                >
                  All · {agents.length}
                </Link>
                {categories.map((c) => (
                  <Link key={c.slug} href={`/categories/${c.slug}`} className="soko-tag neutral">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ background: c.color || "var(--accent)" }}
                    />
                    {c.name} {c.count}
                  </Link>
                ))}
              </div>
            )}

            {query && (
              <p className="mb-6 text-[14px] text-[var(--body)]">
                {shown.length} {shown.length === 1 ? "result" : "results"} for{" "}
                <span className="font-medium text-[var(--ink)]">“{q}”</span>
                {" · "}
                <Link href="/marketplace" className="soko-link">
                  clear
                </Link>
              </p>
            )}

            {shown.length === 0 ? (
              <p className="py-20 text-center text-[var(--body)]">
                {query
                  ? "No agents match that search yet — try a broader term."
                  : "The live catalog is warming up. Check back in a moment."}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {shown.map((a) => (
                  <AgentCard key={a.id} agent={a} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
