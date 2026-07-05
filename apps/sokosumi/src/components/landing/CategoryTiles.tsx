import Link from "next/link";

type Category = { name: string; slug: string; color: string | null; count: number };

const ICONS: Record<string, string> = {
  research: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  insight: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  design: "M4 4h16v16H4zM4 10h16M10 10v10",
  analysis: "M5 20V10M12 20V4M19 20v-7",
  data: "M5 20V10M12 20V4M19 20v-7",
  statistic: "M5 20V10M12 20V4M19 20v-7",
  content: "M12 19l7-7-3-3-7 7v3h3zM16 6l2-2 3 3-2 2",
  creative: "M12 19l7-7-3-3-7 7v3h3zM16 6l2-2 3 3-2 2",
  reasoning: "M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0012 2z",
  coaching: "M8 10h8M8 14h5M21 12a9 9 0 11-3.5-7.1L21 4v5h-5",
  prompt: "M8 10h8M8 14h5M21 12a9 9 0 11-3.5-7.1L21 4v5h-5",
};
const DEFAULT_ICON = "M4 7h16M4 12h16M4 17h10";

function iconFor(slug: string, name: string): string {
  const key = `${slug} ${name}`.toLowerCase();
  for (const k of Object.keys(ICONS)) if (key.includes(k)) return ICONS[k];
  return DEFAULT_ICON;
}

export default function CategoryTiles({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="px-6 py-16 md:py-24">
      <div className="soko-container wide">
        <div className="soko-seg items-end">
          <h2 className="soko-h2">Browse by what you need done</h2>
          <Link
            href="/marketplace"
            className="hidden flex-shrink-0 items-center gap-1.5 text-[15px] font-medium text-[var(--accent)] sm:inline-flex"
          >
            All categories
            <span className="soko-arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>
        <div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => {
            const color = c.color || "var(--accent)";
            return (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}`}
                className="soko-card soko-card-hover group flex flex-col bg-white p-5"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: `${c.color || "#6400ff"}1a`, color }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d={iconFor(c.slug, c.name)}
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h3 className="mt-4 text-[15.5px] font-semibold leading-snug text-[var(--ink)]">
                  {c.name}
                </h3>
                <p className="mt-1.5 text-[13px] leading-snug text-[var(--body)]">
                  {c.count} {c.count === 1 ? "agent" : "agents"}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
