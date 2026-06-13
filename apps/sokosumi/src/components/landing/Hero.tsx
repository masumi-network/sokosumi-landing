const LOGOS = [
  { src: "/images/logos/serviceplan.svg", alt: "Serviceplan Group", h: 22 },
  { src: "/images/logos/samsung.svg", alt: "Samsung", h: 21 },
  { src: "/images/logos/lufthansa.svg", alt: "Lufthansa", h: 25 },
  { src: "/images/logos/allianz.svg", alt: "Allianz", h: 23 },
  { src: "/images/logos/telekom.svg", alt: "Deutsche Telekom", h: 23 },
  { src: "/images/logos/bmw.svg", alt: "BMW", h: 32 },
  { src: "/images/logos/gwi.svg", alt: "GWI", h: 23 },
  { src: "/images/logos/stroer.svg", alt: "Ströer", h: 25 },
  { src: "/images/logos/unicef.svg", alt: "UNICEF", h: 23 },
  { src: "/images/logos/ard.svg", alt: "ARD", h: 27 },
  { src: "/images/logos/omr.svg", alt: "OMR", h: 23 },
  { src: "/images/logos/nmkr.svg", alt: "NMKR", h: 22 },
];

export default function Hero() {
  return (
    <section className="relative px-6 pt-[168px] pb-24 text-center md:pt-[212px] md:pb-32">
      <div className="soko-container">
        <div className="soko-fade soko-fade-1">
          <span className="soko-tag soko-num">✦&nbsp;&nbsp;$30 in free credits to start</span>
        </div>

        <h1 className="soko-statement mx-auto mt-8 max-w-[15ch]">
          <span className="soko-fade soko-fade-2 inline-block">Tasks that get done</span>
          <br />
          <span className="muted soko-fade soko-fade-3 inline-block">
            without you doing them.
          </span>
        </h1>

        <p className="soko-lead mx-auto mt-8 max-w-[600px] soko-fade soko-fade-3">
          Sokosumi gives marketing teams specialized AI agents that own real
          work and finish it — research, content, strategy, and execution.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 soko-fade soko-fade-4">
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

      {/* Trust wall — integrated into the hero, exactly.ai style */}
      <div className="soko-container mt-24 md:mt-36 soko-fade soko-fade-5">
        <p className="text-[13px] text-[rgba(30,30,30,0.42)]">
          Trusted by teams at{" "}
          <span className="soko-num font-medium text-[rgba(30,30,30,0.72)]">
            500+
          </span>{" "}
          companies
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-9 md:gap-x-16">
          {LOGOS.map((logo) => (
            <img
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              className="soko-logo"
              style={{ height: logo.h }}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
