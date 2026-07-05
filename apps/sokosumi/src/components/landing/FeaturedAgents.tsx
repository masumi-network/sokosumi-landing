import Link from "next/link";
import type { Agent } from "@/lib/catalog";
import AgentCard from "@/components/AgentCard";

export default function FeaturedAgents({
  agents,
  total,
}: {
  agents: Agent[];
  total: number;
}) {
  if (agents.length === 0) return null;
  return (
    <section className="bg-[var(--surface)] px-6 py-16 md:py-24">
      <div className="soko-container wide">
        <div className="soko-seg items-end">
          <div>
            <h2 className="soko-h2">Popular agents</h2>
            <p className="mt-2 text-[15px] text-[var(--body)]">
              Live from the marketplace — real pricing, real runs.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="hidden flex-shrink-0 items-center gap-1.5 text-[15px] font-medium text-[var(--accent)] sm:inline-flex"
          >
            Show all {total}
            <span className="soko-arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link href="/marketplace" className="soko-pill soko-pill-ghost">
            Show all {total} agents
          </Link>
        </div>
      </div>
    </section>
  );
}
