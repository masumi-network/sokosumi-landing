// Only entities genuinely tied to Sokosumi: Serviceplan Group built it;
// NMKR + the Cardano Foundation are the Masumi-protocol partners; GWI ships a
// live agent (GWI Spark) on the platform. No borrowed / unaffiliated logos.
const LOGOS = [
  { src: "/images/logos/serviceplan.svg", alt: "Serviceplan Group", h: 20 },
  { src: "/images/logos/nmkr.svg", alt: "NMKR", h: 20 },
  { src: "/assets/Logos/cardano-foundation.svg", alt: "Cardano Foundation", h: 24 },
  { src: "/images/logos/gwi.svg", alt: "GWI", h: 21 },
];

export default function TrustStrip() {
  return (
    <section className="border-b border-black/[0.06] px-6 py-7">
      <div className="soko-container wide flex flex-col items-center gap-5 md:flex-row md:gap-10">
        <span className="flex-shrink-0 text-[13px] font-medium text-[rgba(10,10,10,0.55)]">
          Built with Serviceplan Group &amp; the Masumi ecosystem
        </span>
        <div className="flex flex-1 flex-wrap items-center justify-center gap-x-9 gap-y-4 md:justify-start">
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
