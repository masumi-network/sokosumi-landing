import Image from "next/image";
import { FadeIn } from "@summation/shared";

const companies = [
  { name: "Lufthansa", src: "/images/logos/lufthansa.svg", width: 120 },
  { name: "ARD", src: "/images/logos/ard.svg", width: 55 },
  { name: "UNICEF", src: "/images/logos/unicef.svg", width: 90 },
  { name: "Lünendonk", src: "/images/logos/lunendonk.webp", width: 100 },
  { name: "OMR", src: "/images/logos/omr.svg", width: 65 },
  { name: "DPA", src: "/images/logos/dpa.webp", width: 55 },
  { name: "TDK", src: "/images/logos/tdk.svg", width: 55 },
  { name: "Telekom", src: "/images/logos/telekom.svg", width: 30 },
  { name: "BSH", src: "/images/logos/bsh.webp", width: 55 },
  { name: "Allianz", src: "/images/logos/allianz.svg", width: 80 },
  { name: "Ströer", src: "/images/logos/stroer.svg", width: 80 },
  { name: "Pfisterer", src: "/images/logos/pfisterer.webp", width: 80 },
  { name: "Emurgo", src: "/images/logos/emurgo.webp", width: 80 },
];

export default function LogoCloud() {
  return (
    <section className="pt-20 pb-0">
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
                  alt={company.name}
                  width={company.width}
                  height={32}
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
