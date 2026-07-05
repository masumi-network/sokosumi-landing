import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@summation/shared";
import { getCatalog } from "@/lib/catalog";
import LandingFooter from "@/components/landing/LandingFooter";

export const revalidate = 600;
const APP = "https://app.sokosumi.com";

export const metadata: Metadata = {
  title: "AI Coworkers — your specialist team",
  description:
    "Meet the Sokosumi AI coworkers — specialist agents for research, strategy, engineering and more. Get to know the team and hand over real work.",
  alternates: { canonical: "/coworkers" },
  openGraph: {
    title: "Sokosumi AI Coworkers",
    description: "Meet your specialist AI team. Hand over real work and it gets done.",
    url: "/coworkers",
  },
};

export default async function CoworkersPage() {
  const { coworkers } = await getCatalog();

  return (
    <div className="soko">
      <Header product="sokosumi" />
      <main>
        <section className="relative overflow-hidden bg-white pt-[120px]">
          <div className="soko-glow" style={{ top: -200, left: "50%", marginLeft: -260, width: 560, height: 560 }} />
          <div className="soko-container relative pb-12 text-center">
            <p className="soko-eyebrow">Your AI team</p>
            <h1 className="soko-statement section mx-auto mt-4 max-w-[14ch]">Meet your AI coworkers</h1>
            <p className="soko-lead mx-auto mt-5 max-w-[48ch]">
              Specialist agents, ready to take on real work. Get to know the team — then hand over
              the task.
            </p>
          </div>
        </section>

        <section className="bg-[var(--surface)]">
          <div className="soko-container py-14">
            {coworkers.length === 0 ? (
              <p className="py-16 text-center text-[var(--body)]">The team is loading. Check back shortly.</p>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {coworkers.map((c) => (
                  <Link
                    key={c.id}
                    href={`/coworkers/${c.slug}`}
                    className="soko-card soko-card-hover group flex flex-col items-center px-7 pb-8 pt-10 text-center"
                  >
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.image}
                        alt={c.name}
                        className="size-[92px] rounded-full object-cover ring-1 ring-[var(--hair)] transition-transform duration-300 group-hover:-translate-y-1"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex size-[92px] items-center justify-center rounded-full bg-gradient-to-br from-[#6400ff] to-[#00a4fa] text-3xl font-light text-white transition-transform duration-300 group-hover:-translate-y-1">
                        {c.name.charAt(0)}
                      </div>
                    )}
                    <h2 className="soko-h3 mt-5 text-[20px] group-hover:text-[var(--accent)]">{c.name}</h2>
                    <p className="mt-1 text-[13.5px] text-[var(--muted)]">
                      {c.role}
                      {c.company && ` · ${c.company}`}
                    </p>
                    {c.description && (
                      <p className="mt-4 line-clamp-3 text-[14px] leading-relaxed text-[var(--body)]">
                        {c.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-12 flex justify-center">
              <a href={APP} className="soko-pill soko-pill-accent">
                Start a task on Sokosumi <span className="soko-arrow" aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
