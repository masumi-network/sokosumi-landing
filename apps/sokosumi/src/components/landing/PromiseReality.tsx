const REALITY = [
  "AI needs constant supervision",
  "Quality is inconsistent",
  "Managers coordinate instead of executing",
];

const SOKOSUMI = [
  "Task-specific agents that own and complete work",
  "Multi-agent collaboration across projects",
  "Quality built in — brand voice, decision logs",
  "Human in the loop — nothing ships without you",
];

export default function PromiseReality() {
  return (
    <section className="py-20 md:py-28">
      <div className="soko-container">
        <div className="max-w-[760px]">
          <span className="soko-eyebrow">The AI promise vs. reality</span>
          <h2 className="soko-statement section mt-5">
            Marketing teams are asked to deliver more{" "}
            <span className="muted">— without more people.</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {/* What actually happens */}
          <div className="soko-card p-8 md:p-10">
            <span className="soko-tag neutral">What usually happens</span>
            <ul className="mt-7 flex flex-col gap-4">
              {REALITY.map((item) => (
                <li key={item} className="flex items-start gap-3.5">
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-[11px] text-[rgba(30,30,30,0.5)]"
                  >
                    ✕
                  </span>
                  <span className="text-[16px] leading-snug text-[rgba(30,30,30,0.6)]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* With Sokosumi */}
          <div
            className="soko-card p-8 md:p-10"
            style={{
              background: "var(--accent-tint)",
              borderColor: "rgba(100,0,255,0.18)",
            }}
          >
            <span className="soko-tag">With Sokosumi</span>
            <ul className="mt-7 flex flex-col gap-4">
              {SOKOSUMI.map((item) => (
                <li key={item} className="flex items-start gap-3.5">
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    ✓
                  </span>
                  <span className="text-[16px] leading-snug text-[var(--ink)]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
