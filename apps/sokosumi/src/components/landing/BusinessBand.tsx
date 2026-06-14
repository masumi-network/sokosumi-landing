const POINTS = [
  { t: "GDPR & EU AI Act aligned", d: "Oversight, transparency, and risk management built in." },
  { t: "Full audit trail", d: "Every agent action timestamped, logged, and exportable." },
  { t: "Volume credits & SSO", d: "Team workspaces, shared credits, and dedicated support." },
];

export default function BusinessBand() {
  return (
    <section className="px-4 py-8 md:px-6">
      <div className="soko-container wide">
        <div
          className="overflow-hidden rounded-[28px] px-7 py-14 md:px-14 md:py-20"
          style={{ background: "#1a1a1a" }}
        >
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
            <div>
              <span
                className="soko-eyebrow"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Sokosumi for teams
              </span>
              <h2
                className="mt-4 text-[30px] font-semibold leading-[1.12] tracking-[-0.02em] md:text-[40px]"
                style={{ color: "#fff" }}
              >
                Marketing automation{" "}
                <span style={{ color: "rgba(255,255,255,0.45)" }}>
                  without the compliance risk.
                </span>
              </h2>
              <p
                className="mt-5 max-w-[440px] text-[16px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                A European platform built for teams with real delivery
                responsibility — not prompt playgrounds.
              </p>
              <div className="mt-8">
                <a
                  href="https://app.sokosumi.com/register"
                  className="soko-pill soko-pill-accent"
                >
                  Talk to us
                </a>
              </div>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl" style={{ background: "rgba(255,255,255,0.08)" }}>
              {POINTS.map((p) => (
                <div key={p.t} className="p-6" style={{ background: "#1a1a1a" }}>
                  <div className="flex items-start gap-3.5">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[12px] text-white"
                      style={{ background: "var(--accent)" }}
                    >
                      ✓
                    </span>
                    <div>
                      <p className="text-[16px] font-medium" style={{ color: "#fff" }}>
                        {p.t}
                      </p>
                      <p
                        className="mt-1 text-[14px] leading-snug"
                        style={{ color: "rgba(255,255,255,0.55)" }}
                      >
                        {p.d}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
