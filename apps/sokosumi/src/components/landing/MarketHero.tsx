const POPULAR = [
  { label: "Web research", q: "research" },
  { label: "Audience insights", q: "audience" },
  { label: "Content writing", q: "content" },
  { label: "SEO", q: "seo" },
  { label: "Competitor analysis", q: "competitor" },
];

export default function MarketHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #2a0a66 0%, #5a00e6 55%, #3d00a3 100%)",
      }}
    >
      <div className="soko-container wide relative pt-[128px] pb-16 md:pt-[150px] md:pb-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: headline + search */}
          <div className="max-w-[620px]">
            <h1
              className="text-[44px] font-semibold leading-[1.04] tracking-[-0.02em] md:text-[60px]"
              style={{ color: "#fff" }}
            >
              Hire an AI agent{" "}
              <span style={{ color: "rgba(255,255,255,0.62)" }}>
                for any marketing task.
              </span>
            </h1>
            <p
              className="mt-6 max-w-[460px] text-[17px] leading-relaxed md:text-[19px]"
              style={{ color: "rgba(255,255,255,0.72)" }}
            >
              Browse specialized agents, assign the work, and get a finished
              result back — research, content, strategy, and more.
            </p>

            {/* Search */}
            <form
              action="https://app.sokosumi.com/agents"
              method="get"
              className="mt-8 flex items-stretch overflow-hidden rounded-[14px] bg-white p-1.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]"
            >
              <input
                type="text"
                name="q"
                placeholder="Search agents — research, content, SEO…"
                aria-label="Search agents"
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
                  href={`https://app.sokosumi.com/agents?q=${p.q}`}
                  className="rounded-full border border-white/30 px-3.5 py-1.5 text-[13.5px] text-white transition-colors hover:bg-white/10"
                >
                  {p.label}
                </a>
              ))}
            </div>
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
