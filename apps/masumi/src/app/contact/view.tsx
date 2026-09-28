import type { Metadata } from "next";
import { type Locale, alternatesFor } from "@/lib/i18n";
import { st as siteCopy } from "@/lib/site-copy";
import Link from "next/link";
import { Header, Footer } from "@summation/shared";

export function buildMetadata(locale: Locale): Metadata {
  const st = siteCopy(locale);
  return {
  title: st("CONTACT1"),
  description: st("CONTACT16"),
  openGraph: {
    title: st("CONTACT17"),
    description: st("CONTACT18"),
    images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
  },
  alternates: alternatesFor(locale, "/contact"),
};
}

const linkClass = "inline-flex items-center gap-2 text-[16px] text-[#FA008C] hover:text-[#460A23] transition-colors";

export function ContactPageView({ locale }: { locale: Locale }) {
  const st = siteCopy(locale);
  return (
    <>
      <Header product="masumi" locale={locale} />
      <main className="pt-[140px] pb-24">
        <div className="max-w-[720px] mx-auto px-4 md:px-8">
          <h1 className="text-[32px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2] text-black mb-6">
            {st("CONTACT1")}
          </h1>
          <p className="text-[16px] text-[#919191] leading-[1.7] mb-16">
            {st("CONTACT2")}
          </p>

          <div className="flex flex-col gap-16">
            <section>
              <h2 className="text-[13px] font-medium text-[#919191] uppercase tracking-[0.08em] mb-4">
                {st("CONTACT3")}
              </h2>
              <p className="text-[16px] text-[#333] leading-[1.7] mb-4">
                {st("CONTACT4")}
              </p>
              <a href="mailto:info@masumi.network" className={linkClass}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <rect x="1.5" y="3.5" width="13" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M1.5 4.5L8 9L14.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {st("CONTACT5")}
              </a>
            </section>

            <section>
              <h2 className="text-[13px] font-medium text-[#919191] uppercase tracking-[0.08em] mb-4">
                {st("CONTACT6")}
              </h2>
              <p className="text-[16px] text-[#333] leading-[1.7] mb-4">
                {st("CONTACT7")}
              </p>
              <div className="flex flex-col gap-3">
                <a href="https://discord.com/invite/aj4QfnTS92" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {st("CONTACT8")}
                </a>
                <a href="https://github.com/masumi-network" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {st("CONTACT9")}
                </a>
              </div>
            </section>

            <section>
              <h2 className="text-[13px] font-medium text-[#919191] uppercase tracking-[0.08em] mb-4">
                {st("CONTACT10")}
              </h2>
              <p className="text-[16px] text-[#333] leading-[1.7] mb-4">
                {st("CONTACT11")}
              </p>
              <Link href="/press" className={linkClass}>
                {st("CONTACT12")}
              </Link>
            </section>

            <section>
              <h2 className="text-[13px] font-medium text-[#919191] uppercase tracking-[0.08em] mb-4">
                {st("CONTACT13")}
              </h2>
              <p className="text-[16px] text-[#333] leading-[1.7] mb-4">
                {st("CONTACT14")}
              </p>
              <Link href="/imprint" className={linkClass}>
                {st("CONTACT15")}
              </Link>
            </section>
          </div>
        </div>
      </main>
      <Footer product="masumi" locale={locale} />
    </>
  );
}
