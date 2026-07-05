import Link from "next/link";
import type { Coworker } from "@/lib/catalog";

export default function CoworkerShowcase({ coworkers }: { coworkers: Coworker[] }) {
  if (coworkers.length === 0) return null;
  const shown = coworkers.slice(0, 6);
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="soko-container wide">
        <div className="mx-auto max-w-[680px] text-center">
          <p className="soko-eyebrow">Your AI team</p>
          <h2 className="soko-statement section mt-4">Meet your AI coworkers</h2>
          <p className="soko-lead mx-auto mt-5 max-w-[520px]">
            Specialist agents with names, roles and real expertise. Get to know the team — then hand
            over the task and let them run the work.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {shown.map((c) => (
            <Link
              key={c.id}
              href={`/coworkers/${c.slug}`}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image}
                    alt={c.name}
                    className="size-[96px] rounded-full object-cover ring-1 ring-[var(--hair)] transition-transform duration-300 group-hover:-translate-y-1"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex size-[96px] items-center justify-center rounded-full bg-gradient-to-br from-[#6400FF] to-[#00A4FA] text-3xl font-light text-white ring-1 ring-[var(--hair)] transition-transform duration-300 group-hover:-translate-y-1">
                    {c.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="soko-h3 mt-4 text-[16px] group-hover:text-[var(--accent)]">{c.name}</h3>
              <p className="mt-0.5 line-clamp-1 text-[12.5px] text-[var(--muted)]">{c.role}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href="/marketplace" className="soko-pill soko-pill-accent">
            Explore ready-built tasks <span className="soko-arrow" aria-hidden>→</span>
          </Link>
          <Link href="/coworkers" className="soko-pill soko-pill-ghost">
            Meet the whole team
          </Link>
        </div>
      </div>
    </section>
  );
}
