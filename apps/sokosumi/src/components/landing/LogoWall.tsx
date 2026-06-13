const LOGOS = [
  { src: "/images/logos/serviceplan.svg", alt: "Serviceplan Group", h: 22 },
  { src: "/images/logos/samsung.svg", alt: "Samsung", h: 20 },
  { src: "/images/logos/lufthansa.svg", alt: "Lufthansa", h: 24 },
  { src: "/images/logos/allianz.svg", alt: "Allianz", h: 22 },
  { src: "/images/logos/telekom.svg", alt: "Deutsche Telekom", h: 22 },
  { src: "/images/logos/bmw.svg", alt: "BMW", h: 30 },
  { src: "/images/logos/gwi.svg", alt: "GWI", h: 22 },
  { src: "/images/logos/stroer.svg", alt: "Ströer", h: 24 },
  { src: "/images/logos/unicef.svg", alt: "UNICEF", h: 22 },
  { src: "/images/logos/ard.svg", alt: "ARD", h: 26 },
  { src: "/images/logos/omr.svg", alt: "OMR", h: 22 },
  { src: "/images/logos/nmkr.svg", alt: "NMKR", h: 22 },
];

export default function LogoWall() {
  return (
    <section className="py-12 md:py-16">
      <div className="soko-container">
        <p className="text-center text-[13px] text-[rgba(30,30,30,0.45)]">
          Trusted by teams at{" "}
          <span className="text-[rgba(30,30,30,0.7)] font-medium soko-num">
            500+
          </span>{" "}
          companies
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-7 md:gap-x-14">
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
