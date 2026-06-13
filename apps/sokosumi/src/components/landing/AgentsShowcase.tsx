import type { Agent } from "./agents";
import { prettyCompany } from "./agents";

export default function AgentsShowcase({
  agents,
  count,
}: {
  agents: Agent[];
  count: number;
}) {
  const rounded = Math.floor(count / 5) * 5;
  return (
    <section id="agents" className="scroll-mt-24 px-6 py-28 md:py-40">
      <div className="soko-container wide">
        <div className="mx-auto max-w-[820px] text-center">
          <h2 className="soko-statement section">
            Meet agents that{" "}
            <span className="muted">actually do the work.</span>
          </h2>
          <p className="soko-lead mx-auto mt-7 max-w-[560px]">
            Not chatbots. Specialized agents that own a task, follow clear
            responsibilities, and hand back outcomes you can review.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 md:gap-6">
          {agents.map((agent) => (
            <a
              key={agent.slug}
              href={agent.hireLink}
              target="_blank"
              rel="noopener noreferrer"
              className="soko-card soko-card-hover group flex flex-col overflow-hidden"
            >
              <div className="relative aspect-[3/2] overflow-hidden bg-[var(--surface-2)]">
                <img
                  src={agent.thumbnail}
                  alt={agent.name}
                  className="h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
                  loading="lazy"
                />
                {agent.isVerified && (
                  <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-[var(--ink)] shadow-sm backdrop-blur">
                    <span style={{ color: "var(--accent)" }}>✓</span> Verified
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-7 md:p-8">
                <div className="flex items-center justify-between gap-3">
                  <span className="soko-tag neutral">{agent.category}</span>
                  <span className="soko-num font-[family-name:var(--font-dm-mono)] text-[12.5px] text-[rgba(30,30,30,0.5)]">
                    {agent.credits} credits
                  </span>
                </div>
                <h3 className="mt-4 text-[22px] font-medium leading-tight tracking-[-0.02em] text-[var(--ink)]">
                  {agent.name}
                </h3>
                <p className="mt-2.5 line-clamp-2 text-[16px] leading-relaxed text-[var(--body)]">
                  {agent.shortDescription}
                </p>
                <div className="mt-7 flex items-center justify-between border-t border-black/[0.06] pt-5">
                  <span className="text-[13.5px] text-[rgba(30,30,30,0.5)]">
                    by {prettyCompany(agent.companyName)}
                  </span>
                  <span className="text-[15px] font-medium text-[var(--accent)]">
                    Hire{" "}
                    <span className="soko-arrow" aria-hidden>
                      →
                    </span>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-14 text-center">
          <a
            href="https://app.sokosumi.com/agents"
            className="soko-pill soko-pill-ghost"
          >
            Browse all {rounded}+ agents
            <span className="soko-arrow" aria-hidden>
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
