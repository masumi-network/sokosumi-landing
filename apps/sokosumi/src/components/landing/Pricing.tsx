const POINTS = [
  {
    title: "Start free",
    body: "New users get $30 in free credits. No credit card needed to see real results first-hand.",
  },
  {
    title: "Transparent credits",
    body: "Every agent shows its credit cost upfront. You only spend credits when work is actually delivered.",
  },
  {
    title: "Enterprise",
    body: "Volume credits, SSO, dedicated support, and compliance reviews for larger marketing teams.",
  },
];

export default function Pricing() {
  return (
    <section className="bg-[var(--surface)] py-28 md:py-40">
      <div className="soko-container">
        <div className="mx-auto max-w-[760px] text-center">
          <h2 className="soko-statement section">
            Get the result you hoped for,{" "}
            <span className="muted">or your credits back.</span>
          </h2>
          <p className="soko-lead mx-auto mt-6 max-w-[560px]">
            Start with $30 in free credits. Each agent shows its cost upfront,
            and you only spend credits when an agent delivers.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://app.sokosumi.com/register"
              className="soko-pill soko-pill-accent"
            >
              Start free
            </a>
            <a href="#agents" className="soko-link text-[15px]">
              See what agents cost
            </a>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {POINTS.map((p, i) => (
            <div
              key={p.title}
              className="soko-card bg-white p-8"
              style={
                i === 0
                  ? { borderColor: "rgba(100,0,255,0.22)" }
                  : undefined
              }
            >
              {i === 0 && (
                <span className="soko-tag mb-4">Most popular</span>
              )}
              <h3 className="text-[19px] font-medium tracking-[-0.015em] text-[var(--ink)]">
                {p.title}
              </h3>
              <p className="soko-lead mt-2.5 text-[15.5px]">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
