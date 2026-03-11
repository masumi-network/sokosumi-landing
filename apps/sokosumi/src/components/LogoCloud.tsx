import Image from "next/image";
import { FadeIn } from "@summation/shared";

const companies = [
  { name: "Lufthansa", alt: "Lufthansa logo", src: "/images/logos/lufthansa.svg", width: 120 },
  { name: "ARD", alt: "ARD logo", src: "/images/logos/ard.svg", width: 55 },
  { name: "UNICEF", alt: "UNICEF logo", src: "/images/logos/unicef.svg", width: 90 },
  { name: "Lünendonk", alt: "Luenendonk logo", src: "/images/logos/lunendonk.webp", width: 100 },
  { name: "OMR", alt: "OMR logo", src: "/images/logos/omr.svg", width: 65 },
  { name: "DPA", alt: "DPA logo", src: "/images/logos/dpa.webp", width: 55 },
  { name: "TDK", alt: "TDK logo", src: "/images/logos/tdk.svg", width: 55 },
  { name: "Telekom", alt: "Telekom logo", src: "/images/logos/telekom.svg", width: 30 },
  { name: "BSH", alt: "BSH logo", src: "/images/logos/bsh.webp", width: 55 },
  { name: "Allianz", alt: "Allianz logo", src: "/images/logos/allianz.svg", width: 80 },
  { name: "Ströer", alt: "Stroeer logo", src: "/images/logos/stroer.svg", width: 80 },
  { name: "Pfisterer", alt: "Pfisterer logo", src: "/images/logos/pfisterer.webp", width: 80 },
  { name: "Emurgo", alt: "Emurgo logo", src: "/images/logos/emurgo.webp", width: 80 },
];

export default function LogoCloud() {
  return (
    <section className="pt-20 pb-0" aria-label="Trusted by leading companies">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <FadeIn>
          <p className="text-center text-[14px] text-[#999] mb-10">
            Over 500+ companies use Agents on Sokosumi
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-14 md:gap-y-8">
            {companies.map((company) => (
              <div
                key={company.name}
                className="flex items-center justify-center h-8 opacity-40 hover:opacity-70 transition-opacity"
                style={{ width: company.width }}
              >
                <Image
                  src={company.src}
                  alt={company.alt}
                  width={company.width}
                  height={32}
                  loading="lazy"
                  className="object-contain h-full w-auto brightness-0"
                />
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
