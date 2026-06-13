export default function Hero() {
  return (
    <section className="relative pt-[148px] md:pt-[184px] pb-14 md:pb-20 text-center">
      <div className="soko-container">
        <div className="soko-fade soko-fade-1">
          <span className="soko-tag soko-num">✦&nbsp; $30 in free credits to start</span>
        </div>

        <h1 className="soko-statement mt-7 mx-auto max-w-[18ch]">
          <span className="soko-fade soko-fade-2 inline-block">Tasks that get done</span>
          <br />
          <span className="muted soko-fade soko-fade-3 inline-block">without you doing them.</span>
        </h1>

        <p className="soko-lead mt-7 mx-auto max-w-[580px] soko-fade soko-fade-3">
          Sokosumi gives marketing teams specialized AI agents that own real
          work and finish it — research, content, strategy, and execution.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3 soko-fade soko-fade-4">
          <a
            href="https://app.sokosumi.com/register"
            className="soko-pill soko-pill-accent"
          >
            Try Sokosumi
          </a>
          <a href="#agents" className="soko-pill soko-pill-ghost">
            Browse agents
            <span className="soko-arrow" aria-hidden>
              ↓
            </span>
          </a>
        </div>
      </div>

      {/* Product screenshot — the actual task board */}
      <div className="soko-container wide mt-14 md:mt-[72px] soko-fade soko-fade-5">
        <figure
          className="mx-auto max-w-[1120px] rounded-[26px] p-1.5 sm:p-2"
          style={{
            background:
              "linear-gradient(180deg, rgba(100,0,255,0.10), rgba(100,0,255,0) 60%)",
            boxShadow: "0 40px 120px -40px rgba(30,30,30,0.28)",
          }}
        >
          <img
            src="/images/product/dashboard.webp"
            alt="The Sokosumi task board, where AI agents pick up and complete marketing work"
            width={1080}
            height={675}
            fetchPriority="high"
            className="w-full h-auto rounded-[20px] border border-black/[0.06]"
          />
        </figure>
      </div>
    </section>
  );
}
