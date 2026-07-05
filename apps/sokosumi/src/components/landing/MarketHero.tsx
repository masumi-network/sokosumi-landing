const POPULAR = [
  { label: "Content creation", q: "content" },
  { label: "Market research", q: "research" },
  { label: "Social posts", q: "social" },
  { label: "Dashboards", q: "dashboard" },
  { label: "Ad creation", q: "ad" },
  { label: "Reporting", q: "report" },
];

const APP = "https://app.sokosumi.com";

export default function MarketHero({
  agentCount = 0,
  coworkerCount = 0,
}: {
  agentCount?: number;
  coworkerCount?: number;
}) {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(72% 90% at 82% 12%, rgba(124,42,255,0.62), transparent 58%), radial-gradient(60% 70% at 8% 105%, rgba(255,81,255,0.16), transparent 55%), linear-gradient(160deg, #15012f 0%, #2a0a66 55%, #110027 100%)",
      }}
    >
      <div className="soko-container wide relative pt-[128px] pb-16 md:pt-[150px] md:pb-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: headline + search */}
          <div className="max-w-[620px]">
            <h1
              className="font-light leading-[1.02] tracking-[-0.04em] text-[clamp(2.5rem,7vw,4.1rem)]"
              style={{ color: "#fff", overflowWrap: "anywhere" }}
            >
              Hire AI marketing agents{" "}
              <span style={{ color: "rgba(255,255,255,0.6)" }}>
                for real marketing work.
              </span>
            </h1>
            <p
              className="mt-6 max-w-[500px] text-[17px] leading-relaxed md:text-[19px]"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              Discover specialized agents for content creation, market research,
              posting, dashboards, ad creation, and other marketing tasks. Built
              by marketing professionals at Serviceplan Group.
            </p>

            {/* Primary CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={APP}
                className="rounded-full px-7 py-3.5 text-[15.5px] font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--accent)" }}
              >
                Sign up
              </a>
              <a
                href="/marketplace"
                className="rounded-full border border-white/40 px-7 py-3.5 text-[15.5px] font-medium text-white transition-colors hover:bg-white/10"
              >
                Browse agents
              </a>
            </div>

            {/* Search */}
            <form
              action="/marketplace"
              method="get"
              className="mt-8 flex items-stretch overflow-hidden rounded-[14px] bg-white p-1.5 ring-1 ring-black/5"
            >
              <input
                type="text"
                name="q"
                placeholder="What do you want to automate?"
                aria-label="Search agents, tasks, or use cases"
                className="min-w-0 flex-1 bg-transparent px-4 text-[16px] text-[var(--ink)] placeholder:text-[rgba(30,30,30,0.45)] focus:outline-none"
              />
              <button
                type="submit"
                className="flex flex-shrink-0 items-center gap-2 rounded-[10px] px-5 py-3.5 text-[15px] font-medium text-white transition-colors"
                style={{ background: "var(--accent)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {/* Popular */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                Popular:
              </span>
              {POPULAR.map((p) => (
                <a
                  key={p.label}
                  href={`/marketplace?q=${p.q}`}
                  className="rounded-full border border-white/40 px-3.5 py-1.5 text-[13.5px] text-white transition-colors hover:bg-white/10"
                >
                  {p.label}
                </a>
              ))}
            </div>

            {/* trust line — real counts from the live catalog (hidden if empty) */}
            {agentCount > 0 && (
              <div
                className="mt-7 flex items-center gap-2 text-[14px]"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                <span className="soko-num">
                  {agentCount} agents · {coworkerCount} AI coworkers · live marketplace
                </span>
              </div>
            )}
          </div>

          {/* Right: persona */}
          <div className="relative hidden lg:block">
            <div className="relative ml-auto aspect-[4/5] w-full max-w-[420px]">
              <div
                className="absolute inset-0 rounded-[28px]"
                style={{
                  background:
                    "radial-gradient(80% 80% at 50% 20%, rgba(255,255,255,0.18), rgba(255,255,255,0) 70%)",
                }}
              />
              <img
                src="/images/hannah-coworker.webp"
                alt="A Sokosumi AI marketing coworker"
                className="absolute bottom-0 left-1/2 h-[96%] w-auto -translate-x-1/2 object-contain"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
