import type { Agent } from "./agents";
import { prettyCompany } from "./agents";

export default function PopularAgents({
  agents,
  count,
}: {
  agents: Agent[];
  count: number;
}) {
  const rounded = Math.floor(count / 5) * 5;
  return (
    <section className="bg-[var(--surface)] px-6 py-16 md:py-24">
      <div className="soko-container wide">
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-[var(--ink)] md:text-[34px]">
            Popular agents
          </h2>
          <a
            href="https://app.sokosumi.com/agents"
            className="hidden flex-shrink-0 items-center gap-1.5 text-[15px] font-medium text-[var(--accent)] sm:inline-flex"
          >
            Show all {rounded}+
            <span className="soko-arrow" aria-hidden>
              →
            </span>
          </a>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {agents.map((agent) => (
            <a
              key={agent.slug}
              href={agent.hireLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(30,30,30,0.10)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-2)]">
                <img
                  src={agent.thumbnail}
                  alt={agent.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <span
                  aria-hidden
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[rgba(30,30,30,0.55)] shadow-sm backdrop-blur"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 20s-7-4.4-9.3-8.3C1.2 9 2.3 5.7 5.4 5.1 7.3 4.7 9 5.7 12 8.5c3-2.8 4.7-3.8 6.6-3.4 3.1.6 4.2 3.9 2.7 6.6C19 15.6 12 20 12 20z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    style={{ background: agent.colorLight || "var(--accent)" }}
                  >
                    {prettyCompany(agent.companyName).charAt(0)}
                  </span>
                  <span className="truncate text-[13px] text-[var(--body)]">
                    {prettyCompany(agent.companyName)}
                  </span>
                  {agent.isVerified && (
                    <span
                      className="flex-shrink-0 text-[11px]"
                      style={{ color: "var(--accent)" }}
                      title="Verified"
                    >
                      ✓
                    </span>
                  )}
                </div>

                <h3 className="mt-2.5 line-clamp-2 text-[15px] font-medium leading-snug text-[var(--ink)] group-hover:text-[var(--accent)]">
                  {agent.name}
                </h3>
                <p className="mt-1 text-[12.5px] text-[rgba(30,30,30,0.5)]">
                  {agent.category}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-black/[0.06] pt-3.5">
                  <span className="text-[11px] uppercase tracking-wide text-[rgba(30,30,30,0.45)]">
                    From
                  </span>
                  <span className="soko-num text-[15px] font-semibold text-[var(--ink)]">
                    {agent.credits} credits
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <a
            href="https://app.sokosumi.com/agents"
            className="soko-pill soko-pill-ghost"
          >
            Show all {rounded}+ agents
          </a>
        </div>
      </div>
    </section>
  );
}
