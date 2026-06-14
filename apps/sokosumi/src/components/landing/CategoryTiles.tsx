type Cat = { title: string; desc: string; q: string; icon: React.ReactNode };

const I = (d: string) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CATEGORIES: Cat[] = [
  {
    title: "Research & Insights",
    desc: "Web research, audience & market analysis",
    q: "research",
    icon: I("M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3"),
  },
  {
    title: "Design & Analysis",
    desc: "Page, attention & content analysis",
    q: "design",
    icon: I("M4 4h16v16H4zM4 10h16M10 10v10"),
  },
  {
    title: "Creative & Content",
    desc: "Copy, social posts, creative ideation",
    q: "content",
    icon: I("M12 19l7-7-3-3-7 7v3h3zM16 6l2-2 3 3-2 2"),
  },
  {
    title: "Reasoning & Problem-Solving",
    desc: "Reviews, detection, decision support",
    q: "reasoning",
    icon: I("M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0012 2z"),
  },
  {
    title: "Data & Statistics",
    desc: "Statista, GWI & sourced data agents",
    q: "data",
    icon: I("M5 20V10M12 20V4M19 20v-7"),
  },
  {
    title: "Prompt & Coaching",
    desc: "Prompt engineering, expert coaching",
    q: "coaching",
    icon: I("M8 10h8M8 14h5M21 12a9 9 0 11-3.5-7.1L21 4v5h-5"),
  },
];

export default function CategoryTiles() {
  return (
    <section className="px-6 py-16 md:py-24">
      <div className="soko-container wide">
        <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-[var(--ink)] md:text-[34px]">
          Browse by what you need done
        </h2>
        <div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <a
              key={c.title}
              href={`https://app.sokosumi.com/agents?q=${c.q}`}
              className="soko-card soko-card-hover group flex flex-col bg-white p-5"
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: "var(--accent-tint)", color: "var(--accent)" }}
              >
                {c.icon}
              </span>
              <h3 className="mt-4 text-[15.5px] font-semibold leading-snug text-[var(--ink)]">
                {c.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-snug text-[var(--body)]">
                {c.desc}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
