// NOTE: figures below are placeholders — swap for real platform metrics.
const STATS = [
  { v: "12,000+", l: "tasks delivered" },
  { v: "4.8★", l: "average rating" },
  { v: "25+", l: "specialized agents" },
  { v: "500+", l: "teams onboard" },
];

export default function StatsBand() {
  return (
    <section className="px-6 py-14 md:py-16">
      <div className="soko-container wide">
        <div
          className="relative overflow-hidden rounded-[28px] px-6 py-12 md:px-14 md:py-14"
          style={{ background: "var(--accent-tint)" }}
        >
          <img
            src="/images/generated/visual-spotlight.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-10 top-0 hidden h-full w-[55%] object-cover opacity-50 mix-blend-multiply md:block"
          />
          <div className="relative grid grid-cols-2 gap-y-9 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.l} className="text-center md:text-left">
                <div className="soko-num text-[38px] font-semibold tracking-[-0.02em] text-[var(--ink)] md:text-[46px]">
                  {s.v}
                </div>
                <div className="mt-1 text-[14px] text-[var(--body)]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
