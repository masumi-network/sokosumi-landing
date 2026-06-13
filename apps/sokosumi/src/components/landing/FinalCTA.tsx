export default function FinalCTA() {
  return (
    <section className="px-4 pb-20 pt-4 md:pb-28">
      <div className="soko-container wide">
        <div
          className="relative overflow-hidden rounded-[32px] px-6 py-20 text-center md:py-28"
          style={{ background: "#1a1a1a" }}
        >
          {/* subtle brand glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
            style={{
              background:
                "radial-gradient(60% 120% at 50% 0%, rgba(100,0,255,0.30), rgba(100,0,255,0) 70%)",
            }}
          />
          <div className="relative">
            <span
              className="soko-eyebrow"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Ready when you are
            </span>
            <h2
              className="soko-statement mx-auto mt-5 max-w-[20ch]"
              style={{ color: "#fff" }}
            >
              Stop supervising AI.{" "}
              <span style={{ color: "rgba(255,255,255,0.4)" }}>
                Start shipping work.
              </span>
            </h2>
            <p
              className="mx-auto mt-6 max-w-[540px] text-[16px] leading-relaxed md:text-[18px]"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Built for marketing teams with real delivery responsibility — not
              prompt playgrounds or “magic AI” promises.
            </p>
            <div className="mt-9 flex flex-col items-center gap-4">
              <a
                href="https://app.sokosumi.com/register"
                className="soko-pill soko-pill-accent"
              >
                Try Sokosumi
              </a>
              <span
                className="soko-num text-[13px]"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                $30 in free credits · no card needed
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
