import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@summation/shared";
import LandingFooter from "@/components/landing/LandingFooter";
import { READY_TASKS, tasksByCategory } from "@/data/tasks";

const SITE = "https://www.sokosumi.com";

export const metadata: Metadata = {
  title: "Ready-built marketing tasks",
  description:
    "Browse ready-built tasks for AI marketing agents — market research, campaign briefs, reporting, presentations, and more. Pick a task, add your brief, and get the work back.",
  alternates: { canonical: "/tasks" },
  openGraph: {
    title: "Ready-built marketing tasks | Sokosumi",
    description:
      "Pick a ready-built task, add your brief, and a specialized AI agent gets the work done.",
    url: "/tasks",
  },
};

export default function TasksPage() {
  const groups = tasksByCategory();

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ready-built tasks on Sokosumi",
    numberOfItems: READY_TASKS.length,
    itemListElement: READY_TASKS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/tasks/${t.slug}`,
      name: t.title,
    })),
  };

  return (
    <div className="soko">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <Header product="sokosumi" />
      <main>
        <section className="relative overflow-hidden bg-white pt-[120px]">
          <div
            className="soko-glow"
            style={{ top: -180, right: -100, width: 500, height: 500 }}
          />
          <div className="soko-container wide relative pb-12">
            <nav className="text-[13px] text-[var(--muted)]">
              <Link href="/" className="hover:text-[var(--ink)]">Home</Link>
              <span className="px-1.5 text-[var(--muted)]">›</span>
              <span>Tasks</span>
            </nav>
            <h1 className="soko-statement section mt-4">Ready-built tasks</h1>
            <p className="soko-lead mt-4 max-w-[560px]">
              Real marketing work, pre-scoped. Pick a task, add your brief, and a
              specialized agent gets it done — no prompt engineering required.
            </p>
          </div>
        </section>

        <section className="bg-[var(--surface)]">
          <div className="soko-container wide py-12">
            {groups.map((g) => (
              <div key={g.category} className="mb-12 last:mb-0">
                <div className="mb-5 flex items-baseline gap-3">
                  <h2 className="text-[19px] font-medium tracking-[-0.01em] text-[var(--ink)]">
                    {g.category}
                  </h2>
                  <span className="text-[13px] text-[var(--muted)]">
                    {g.tasks.length} {g.tasks.length === 1 ? "task" : "tasks"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {g.tasks.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/tasks/${t.slug}`}
                      className="group flex flex-col rounded-[16px] border border-black/[0.08] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[var(--accent)]/40"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-[rgba(100,0,255,0.07)] px-3 py-1 text-[12px] font-medium text-[var(--accent)]">
                          {t.category}
                        </span>
                        <span className="text-[12px] text-[var(--muted)]">{t.output}</span>
                      </div>
                      <h3 className="mt-4 text-[17px] font-medium tracking-[-0.01em] text-[var(--ink)]">
                        {t.title}
                      </h3>
                      <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[var(--body)]">
                        {t.short}
                      </p>
                      <span className="mt-5 text-[14px] font-medium text-[var(--accent)]">
                        View task <span className="soko-arrow" aria-hidden>→</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white">
          <div className="soko-container wide py-16 text-center">
            <h2 className="soko-statement section">Don&apos;t see your task?</h2>
            <p className="soko-lead mx-auto mt-4 max-w-[480px]">
              Agents also take free-form briefs — describe what you need and hand
              it over.
            </p>
            <a
              href="https://app.sokosumi.com"
              className="mt-8 inline-block rounded-full px-8 py-4 text-[15.5px] font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              Sign up and start a task
            </a>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
