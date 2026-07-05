import Link from "next/link";
import type { Agent } from "@/lib/catalog";

export default function AgentCard({ agent }: { agent: Agent }) {
  const cat = agent.categories.find((c) => c.color) || agent.categories[0];
  const accent = cat?.color || "#00A4FA";

  return (
    <Link
      href={`/agents/${agent.slug}`}
      className="ac soko-card soko-card-hover group flex flex-col overflow-hidden"
    >
      <div className="p-2.5 pb-0">
        <div className="ac-thumb">
          <div
            className="canvas flex h-full w-full items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accent} 0%, #6400FF 78%, #3d0099 100%)`,
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 90% at 18% 12%, rgba(255,255,255,0.34), rgba(255,255,255,0) 55%)",
              }}
            />
            <span className="ac-chip relative">
              {agent.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={agent.icon} alt="" loading="lazy" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-[20px] font-medium text-[#6400FF]">
                  {agent.name.charAt(0)}
                </span>
              )}
            </span>
          </div>
          {cat && (
            <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-[#1e1e1e] backdrop-blur-sm">
              {cat.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-3.5">
        <h3 className="soko-h3 text-[15.5px] transition-colors group-hover:text-[var(--accent)]">
          {agent.name}
        </h3>
        {agent.author && (
          <p className="text-[12.5px] text-[var(--muted)]">by {agent.author}</p>
        )}
        {agent.summary && (
          <p className="mt-1.5 line-clamp-2 flex-1 text-[13px] leading-snug text-[var(--body)]">
            {agent.summary}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-[var(--hair)] pt-3">
          <span className="flex items-center gap-2 text-[12.5px] text-[var(--body)]">
            {agent.rating != null && (
              <span className="inline-flex items-center gap-1">
                <span className="text-[var(--accent)]">★</span>
                <span className="soko-num font-medium text-[var(--ink)]">
                  {agent.rating.toFixed(1)}
                </span>
              </span>
            )}
            {agent.rating != null && agent.runs > 0 && (
              <span className="text-[var(--muted)]">·</span>
            )}
            {agent.runs > 0 && <span className="soko-num">{agent.runs.toLocaleString()} runs</span>}
          </span>
          <span className="soko-num text-[13px] text-[var(--ink)]">
            {agent.credits != null ? (
              <>
                <span className="font-medium">{agent.credits}</span>
                <span className="text-[var(--muted)]"> cr</span>
              </>
            ) : (
              <span className="text-[var(--muted)]">—</span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
