import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@summation/shared";
import { getCatalog } from "@/lib/catalog";
import AgentCard from "@/components/AgentCard";
import LandingFooter from "@/components/landing/LandingFooter";
import { READY_TASKS, getTask } from "@/data/tasks";

export const revalidate = 600;
const SITE = "https://www.sokosumi.com";
const APP = "https://app.sokosumi.com";

const STEPS = [
  { t: "Choose an agent", d: "Pick the recommended agent for this task, or browse alternatives." },
  { t: "Add your brief", d: "Start from the example input below and make it yours." },
  { t: "Review the result", d: "Get the output back, ask for changes if you need them." },
  { t: "Reuse the workflow", d: "Run it again whenever the work comes back around." },
];

export function generateStaticParams() {
  return READY_TASKS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const task = getTask(slug);
  if (!task) return { title: "Task not found" };
  return {
    title: `${task.title} — ready-built task`,
    description: task.short,
    alternates: { canonical: `/tasks/${task.slug}` },
    openGraph: {
      title: `${task.title} | Sokosumi`,
      description: task.short,
      url: `/tasks/${task.slug}`,
    },
  };
}

export default async function TaskPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const task = getTask(slug);
  if (!task) notFound();

  const { agents, coworkers } = await getCatalog();
  const coworker = task.coworkerSlug
    ? coworkers.find((c) => c.slug === task.coworkerSlug)
    : undefined;
  const recommended = agents
    .filter((a) => a.categories.some((c) => c.slug === task.agentCategorySlug))
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 4);
  const related = task.related
    .map((s) => getTask(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tasks", item: `${SITE}/tasks` },
      { "@type": "ListItem", position: 2, name: task.title, item: `${SITE}/tasks/${task.slug}` },
    ],
  };
  const faqLd = task.faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: task.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <div className="soko">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <Header product="sokosumi" />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-white pt-[120px]">
          <div className="soko-glow" style={{ top: -180, right: -100, width: 500, height: 500 }} />
          <div className="soko-container wide relative pb-12">
            <nav className="text-[13px] text-[var(--muted)]">
              <Link href="/tasks" className="hover:text-[var(--ink)]">Tasks</Link>
              <span className="px-1.5 text-[var(--muted)]">›</span>
              <span>{task.title}</span>
            </nav>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-[rgba(100,0,255,0.07)] px-3 py-1 text-[12.5px] font-medium text-[var(--accent)]">
                {task.category}
              </span>
              <span className="rounded-full border border-black/[0.1] px-3 py-1 text-[12.5px] text-[var(--body)]">
                Output: {task.output}
              </span>
            </div>
            <h1 className="soko-statement section mt-4">{task.title}</h1>
            <p className="soko-lead mt-4 max-w-[600px]">{task.short}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={APP}
                className="rounded-full px-7 py-3.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--accent)" }}
              >
                Sign up to run this task
              </a>
              {coworker && (
                <Link
                  href={`/coworkers/${coworker.slug}`}
                  className="rounded-full border border-black/[0.15] px-7 py-3.5 text-[15px] font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent)]"
                >
                  Meet {coworker.name}, who runs it
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* What + who + example input */}
        <section className="bg-[var(--surface)]">
          <div className="soko-container wide grid gap-10 py-14 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-[22px] font-medium tracking-[-0.01em] text-[var(--ink)]">
                What this task does
              </h2>
              <p className="mt-4 max-w-[560px] text-[15.5px] leading-relaxed text-[var(--body)]">
                {task.what}
              </p>

              <h2 className="mt-10 text-[22px] font-medium tracking-[-0.01em] text-[var(--ink)]">
                How it works
              </h2>
              <ol className="mt-5 grid gap-4 sm:grid-cols-2">
                {STEPS.map((s, i) => (
                  <li key={s.t} className="rounded-[14px] border border-black/[0.08] bg-white p-5">
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-[rgba(100,0,255,0.08)] text-[13px] font-semibold text-[var(--accent)]">
                      {i + 1}
                    </span>
                    <div className="mt-3 text-[15px] font-medium text-[var(--ink)]">{s.t}</div>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--body)]">{s.d}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h2 className="text-[22px] font-medium tracking-[-0.01em] text-[var(--ink)]">
                Who it&apos;s for
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {task.whoFor.map((w) => (
                  <li
                    key={w}
                    className="rounded-full border border-black/[0.1] bg-white px-3.5 py-1.5 text-[13.5px] text-[var(--body)]"
                  >
                    {w}
                  </li>
                ))}
              </ul>

              <h2 className="mt-10 text-[22px] font-medium tracking-[-0.01em] text-[var(--ink)]">
                Example brief
              </h2>
              <div className="mt-4 rounded-[14px] border border-black/[0.08] bg-white p-5">
                <p className="text-[14px] leading-relaxed text-[var(--body)]">
                  &ldquo;{task.exampleInput}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended agents (live) */}
        {recommended.length > 0 && (
          <section className="bg-white">
            <div className="soko-container wide py-14">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-[22px] font-medium tracking-[-0.01em] text-[var(--ink)]">
                  Agents for this kind of work
                </h2>
                <Link href="/marketplace" className="text-[14px] font-medium text-[var(--accent)]">
                  Browse all →
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {recommended.map((a) => (
                  <AgentCard key={a.id} agent={a} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {task.faq.length > 0 && (
          <section className="bg-[var(--surface)]">
            <div className="soko-container wide py-14">
              <h2 className="text-[22px] font-medium tracking-[-0.01em] text-[var(--ink)]">
                Frequently asked
              </h2>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {task.faq.map((f) => (
                  <div key={f.q} className="rounded-[14px] border border-black/[0.08] bg-white p-6">
                    <h3 className="text-[15.5px] font-medium text-[var(--ink)]">{f.q}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-[var(--body)]">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related + CTA */}
        <section className="bg-white">
          <div className="soko-container wide py-14">
            {related.length > 0 && (
              <>
                <h2 className="text-[22px] font-medium tracking-[-0.01em] text-[var(--ink)]">
                  Related tasks
                </h2>
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {related.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/tasks/${t.slug}`}
                      className="group rounded-[16px] border border-black/[0.08] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[var(--accent)]/40"
                    >
                      <span className="text-[12px] font-medium text-[var(--accent)]">{t.category}</span>
                      <h3 className="mt-2 text-[16px] font-medium text-[var(--ink)]">{t.title}</h3>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--body)]">{t.short}</p>
                    </Link>
                  ))}
                </div>
              </>
            )}
            <div className="mt-14 rounded-[20px] px-8 py-12 text-center" style={{ background: "linear-gradient(135deg, #6400FF, #4b00bf)" }}>
              <h2 className="text-[26px] font-light tracking-[-0.02em] text-white md:text-[32px]">
                Ready to hand this off?
              </h2>
              <p className="mx-auto mt-3 max-w-[420px] text-[15px] text-white/80">
                Sign up, pick your agent, and run {task.title.toLowerCase()} today.
              </p>
              <a
                href={APP}
                className="mt-7 inline-block rounded-full bg-white px-8 py-3.5 text-[15px] font-medium text-[#0A0A0A] transition-transform hover:-translate-y-0.5"
              >
                Sign up
              </a>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
