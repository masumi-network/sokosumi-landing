const LOGOS = [
  { src: "/images/logos/serviceplan.svg", alt: "Serviceplan Group", h: 20 },
  { src: "/images/logos/samsung.svg", alt: "Samsung", h: 19 },
  { src: "/images/logos/lufthansa.svg", alt: "Lufthansa", h: 22 },
  { src: "/images/logos/allianz.svg", alt: "Allianz", h: 21 },
  { src: "/images/logos/telekom.svg", alt: "Deutsche Telekom", h: 21 },
  { src: "/images/logos/bmw.svg", alt: "BMW", h: 28 },
  { src: "/images/logos/gwi.svg", alt: "GWI", h: 21 },
  { src: "/images/logos/unicef.svg", alt: "UNICEF", h: 21 },
  { src: "/images/logos/ard.svg", alt: "ARD", h: 24 },
  { src: "/images/logos/nmkr.svg", alt: "NMKR", h: 20 },
];

export default function TrustStrip() {
  return (
    <section className="border-b border-black/[0.06] px-6 py-7">
      <div className="soko-container wide flex flex-col items-center gap-5 md:flex-row md:gap-10">
        <span className="flex-shrink-0 text-[13px] font-medium text-[rgba(30,30,30,0.5)]">
          Trusted by teams at 500+ companies
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
