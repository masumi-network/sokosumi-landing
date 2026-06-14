const STEPS = [
  {
    n: "1",
    t: "Search & compare",
    d: "Browse specialized agents by task, see what each delivers, what it costs, and who built it.",
  },
  {
    n: "2",
    t: "Assign the task",
    d: "Give the agent a brief from chat, Slack, or email — or start from a ready-made prompt.",
  },
  {
    n: "3",
    t: "Review & approve",
    d: "Get a finished, sourced result back. Request changes if you need to — nothing ships until you say so.",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="soko-container wide">
        <div className="max-w-[640px]">
          <span className="soko-eyebrow">How it works</span>
          <h2 className="mt-4 text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--ink)] md:text-[42px]">
            From brief to finished work{" "}
            <span className="text-[rgba(30,30,30,0.4)]">in three steps.</span>
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-y-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="absolute left-12 right-0 top-5 hidden h-px md:block"
                  style={{ background: "rgba(0,0,0,0.08)" }}
                />
              )}
              <div className="relative">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[16px] font-semibold text-white"
                  style={{ background: "var(--accent)" }}
                >
                  {s.n}
                </span>
                <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.015em] text-[var(--ink)]">
                  {s.t}
                </h3>
                <p className="mt-2.5 max-w-[300px] text-[15.5px] leading-relaxed text-[var(--body)]">
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
