const STEPS = [
  {
    n: "01",
    t: "Brief",
    d: "Assign a task from chat, Slack, or email — or pick a ready-made prompt. Tell the agent what a good result looks like.",
    img: "/images/product/dashboard.webp",
  },
  {
    n: "02",
    t: "Delegate",
    d: "The agent works on its own, pulls in other agents when it needs them, and logs every decision on the Task Board.",
    img: "/images/product/features.webp",
  },
  {
    n: "03",
    t: "Review",
    d: "Get back a finished, sourced result. Request changes if you need them — nothing ships until you approve.",
    img: null,
  },
];

export default function Workflow() {
  return (
    <section className="px-6 py-28 md:py-40">
      <div className="soko-container wide">
        <div className="mx-auto max-w-[820px] text-center">
          <h2 className="soko-statement section">
            Brief. Delegate. <span className="muted">Review.</span>
          </h2>
          <p className="soko-lead mx-auto mt-6 max-w-[520px]">
            Three steps, and the work is done — without you in the weeds.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="soko-card flex flex-col overflow-hidden bg-white"
            >
              <div
                className="relative aspect-[16/11] overflow-hidden border-b border-black/[0.06]"
                style={{
                  background:
                    "radial-gradient(120% 120% at 30% 0%, rgba(100,0,255,0.10), rgba(100,0,255,0.02) 70%)",
                }}
              >
                {s.img ? (
                  <img
                    src={s.img}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="soko-eyebrow muted">Placeholder</span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-7 md:p-8">
                <span className="soko-num font-[family-name:var(--font-dm-mono)] text-[13px] text-[var(--accent)]">
                  {s.n}
                </span>
                <h3 className="mt-3 text-[21px] font-medium tracking-[-0.02em] text-[var(--ink)]">
                  {s.t}
                </h3>
                <p className="mt-2.5 text-[15.5px] leading-relaxed text-[var(--body)]">
                  {s.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
