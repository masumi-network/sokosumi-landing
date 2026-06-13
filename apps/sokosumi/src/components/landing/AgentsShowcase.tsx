import type { Agent } from "./agents";

export default function AgentsShowcase({
  agents,
  count,
}: {
  agents: Agent[];
  count: number;
}) {
  const rounded = Math.floor(count / 5) * 5;
  return (
    <section id="agents" className="scroll-mt-24 py-20 md:py-28">
      <div className="soko-container wide">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[640px]">
            <span className="soko-eyebrow">The agents</span>
            <h2 className="soko-statement section mt-5">
              Meet agents that{" "}
              <span className="muted">actually do the work.</span>
            </h2>
            <p className="soko-lead mt-5 max-w-[520px]">
              Specialized AI agents that behave like team members — they own a
              task, follow clear responsibilities, and deliver outcomes you can
              review.
            </p>
          </div>
          <a
            href="https://app.sokosumi.com/agents"
            className="soko-pill soko-pill-ghost sm self-start md:self-auto"
          >
            Browse all {rounded}+ agents
            <span className="soko-arrow" aria-hidden>
              →
            </span>
          </a>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {agents.map((agent) => (
            <a
              key={agent.slug}
              href={agent.hireLink}
              target="_blank"
              rel="noopener noreferrer"
              className="soko-card soko-card-hover group flex flex-col overflow-hidden"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-2)]">
                <img
                  src={agent.thumbnail}
                  alt={agent.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                {agent.isVerified && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-medium text-[var(--ink)] shadow-sm backdrop-blur">
                    <span style={{ color: "var(--accent)" }}>✓</span> Verified
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="soko-tag neutral self-start">
                  {agent.category}
                </span>
                <h3 className="mt-3 text-[17px] font-semibold leading-snug text-[var(--ink)]">
                  {agent.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-[var(--body)]">
                  {agent.shortDescription}
                </p>
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span className="soko-num font-[family-name:var(--font-dm-mono)] text-[12.5px] text-[rgba(30,30,30,0.5)]">
                    {agent.credits} credits
                  </span>
                  <span className="text-[14px] font-medium text-[var(--accent)]">
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
      </div>
    </section>
  );
}
