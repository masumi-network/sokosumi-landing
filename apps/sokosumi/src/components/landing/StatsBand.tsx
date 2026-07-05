type Stat = { v: string; l: string };

export default function StatsBand({ stats }: { stats: Stat[] }) {
  if (!stats?.length) return null;
  return (
    <section className="px-6 py-12 md:py-16">
      <div className="soko-container wide">
        <div
          className="relative overflow-hidden rounded-[24px] px-6 py-12 md:px-14 md:py-14"
          style={{ background: "var(--accent-tint)" }}
        >
          <div className="soko-glow" style={{ top: -120, right: -80, width: 460, height: 460 }} />
          <div className="soko-glow iris" style={{ bottom: -160, left: -60, width: 380, height: 380 }} />
          <div className="relative grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l} className="text-center md:text-left">
                <div className="soko-num text-[34px] font-light tracking-[-0.03em] text-[var(--ink)] sm:text-[42px] md:text-[52px]">
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
