const POINTS = [
  "Specialists for every task — research, content, strategy, analysis",
  "Agents collaborate and hand work to each other",
  "A Task Board and decision logs — review before anything ships",
  "Pay per task with credits. Start with $30 free, no card needed",
];

export default function ValueProp() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="soko-container wide">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
          <div>
            <h2 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--ink)] md:text-[44px]">
              A whole marketing team,{" "}
              <span className="text-[rgba(30,30,30,0.4)]">on demand.</span>
            </h2>
            <ul className="mt-8 flex flex-col gap-4">
              {POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3.5">
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[12px] text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    ✓
                  </span>
                  <span className="text-[16.5px] leading-snug text-[var(--ink)]">
                    {p}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <a
                href="https://app.sokosumi.com/register"
                className="soko-pill soko-pill-accent"
              >
                Get started free
              </a>
            </div>
          </div>

          <figure className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-black/[0.06] bg-[var(--surface)]">
            <img
              src="/images/product/features.webp"
              alt="Sokosumi agents working across chat, Slack, email, and the Task Board"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
