const TRUST = [
  { t: "GDPR & EU AI Act aligned", d: "Oversight, transparency, and risk management from day one." },
  { t: "Decision logging", d: "Every agent action timestamped and exportable for audit." },
  { t: "Clear accountability", d: "Know exactly which agent did what, and why. No black boxes." },
  { t: "Transparency-first", d: "See the reasoning behind every output. Human review before ship." },
];

export default function Pillars() {
  return (
    <section className="py-28 md:py-40">
      <div className="soko-container wide">
        <div className="max-w-[680px]">
          <h2 className="soko-statement section">
            Built to fit{" "}
            <span className="muted">how teams already work.</span>
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card
            className="lg:col-span-7"
            title="Task-focused agents for execution"
            body="Agents own specific work — GWI audience research, Statista data enrichment, ad variations, SEO outlines, campaign summaries — built by high-quality partners."
          />
          <Card
            className="lg:col-span-5"
            title="Agents that work as a team"
            body="A multi-agent platform: agents delegate, hire each other when needed, and collaborate across projects — structured agent-to-agent workflows with humans in control."
          />
          <Card
            className="lg:col-span-5"
            title="Human-first by design"
            body="Agents fit how teams already work. AI behaves like a coworker, not another tool to manage. Assign work from Slack, email, or chat."
          />
          <Card
            className="lg:col-span-7"
            title="Full control, no black box"
            body="Task-based, not chat-only. A Task Board shows exactly what each agent is doing — track progress and decisions, and review results before anything ships."
          />

          {/* Trust band */}
          <div
            className="soko-card lg:col-span-12 p-8 md:p-10"
            style={{ background: "var(--accent-tint)", borderColor: "rgba(100,0,255,0.18)" }}
          >
            <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-14">
              <div>
                <span className="soko-tag">European by design</span>
                <h3 className="mt-4 text-[26px] font-medium leading-tight tracking-[-0.02em] text-[var(--ink)]">
                  Built in Europe. Built for trust.
                </h3>
                <p className="soko-lead mt-3 max-w-[400px]">
                  A GDPR-compliant, EU AI Act-conformant platform — AI marketing
                  automation without the compliance risk.
                </p>
              </div>
              <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {TRUST.map((item) => (
                  <div key={item.t} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] text-white"
                      style={{ background: "var(--accent)" }}
                    >
                      ✓
                    </span>
                    <div>
                      <p className="text-[15px] font-medium text-[var(--ink)]">
                        {item.t}
                      </p>
                      <p className="mt-0.5 text-[13.5px] leading-snug text-[var(--body)]">
                        {item.d}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({
  className,
  title,
  body,
}: {
  className?: string;
  title: string;
  body: string;
}) {
  return (
    <div className={`soko-card p-8 md:p-9 ${className ?? ""}`}>
      <h3 className="text-[20px] font-medium leading-snug tracking-[-0.015em] text-[var(--ink)]">
        {title}
      </h3>
      <p className="soko-lead mt-3 max-w-[460px] text-[16px]">{body}</p>
    </div>
  );
}
