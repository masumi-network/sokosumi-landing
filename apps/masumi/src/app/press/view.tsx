import type { Metadata } from "next";
import { type Locale, alternatesFor } from "@/lib/i18n";
import { st as siteCopy } from "@/lib/site-copy";
import { Header, Footer } from "@summation/shared";
import { hasData, getDb } from "@/lib/explorer-db";

// Refresh hourly so the transaction count stays current.

function liveTxCount(): string {
  try {
    if (hasData("mainnet")) {
      const n = (
        getDb("mainnet").prepare("SELECT COUNT(*) as c FROM transactions").get() as { c: number }
      ).c;
      if (n > 0) return (Math.floor(n / 1000) * 1000).toLocaleString("en-US");
    }
  } catch {
    /* explorer DB not synced yet — use the fallback below */
  }
  return "22,000";
}

export function buildMetadata(locale: Locale): Metadata {
  const st = siteCopy(locale);
  return {
  alternates: alternatesFor(locale, "/press"),
  title: st("PRESS1"),
  description: st("PRESS12"),
  openGraph: {
    title: st("PRESS13"),
    description: st("PRESS14"),
    images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
  },
};
}

export function PressPageView({ locale }: { locale: Locale }) {
  const st = siteCopy(locale);
  return (
    <>
      <Header product="masumi" locale={locale} />
      <main className="pt-[140px] pb-24">
        <div className="max-w-[720px] mx-auto px-4 md:px-8">
          <h1 className="text-[32px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2] text-black mb-6">
            {st("PRESS1")}
          </h1>
          <p className="text-[16px] text-[#919191] leading-[1.7] mb-16">
            {st("PRESS2")}
          </p>

          <div className="flex flex-col gap-16">
            {/* About */}
            <section>
              <h2 className="text-[13px] font-medium text-[#919191] uppercase tracking-[0.08em] mb-4">
                {st("PRESS3")}
              </h2>
              <div className="text-[16px] text-[#333] leading-[1.7] flex flex-col gap-4">
                <p>
                  {st("PRESS4")}
                </p>
                <p>
                  {st("PRESS5")}
                </p>
                <p>
                  {st("FRAG_PRESS_A")} {liveTxCount()} {st("FRAG_PRESS_B")}
                </p>
              </div>
            </section>

            {/* Brand Assets */}
            <section>
              <h2 className="text-[13px] font-medium text-[#919191] uppercase tracking-[0.08em] mb-4">
                {st("PRESS6")}
              </h2>
              <p className="text-[16px] text-[#333] leading-[1.7] mb-6">
                {st("PRESS7")}
              </p>
              <a
                href="https://drive.google.com/drive/u/1/folders/1WbjV0HBr9ztn1C5Zyc7_xeuya3az3FEY"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-[14px] font-medium bg-black text-white px-5 py-2.5 rounded-full hover:bg-black/85 transition-colors"
              >
                {st("PRESS8")}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                  <path d="M5.5 2.5H3.5C2.94772 2.5 2.5 2.94772 2.5 3.5V10.5C2.5 11.0523 2.94772 11.5 3.5 11.5H10.5C11.0523 11.5 11.5 11.0523 11.5 10.5V8.5M8.5 2.5H11.5V5.5M11.5 2.5L6.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-[13px] font-medium text-[#919191] uppercase tracking-[0.08em] mb-4">
                {st("PRESS9")}
              </h2>
              <p className="text-[16px] text-[#333] leading-[1.7] mb-4">
                {st("PRESS10")}
              </p>
              <a
                href="mailto:info@masumi.network"
                className="inline-flex items-center gap-2 text-[16px] text-[#FA008C] hover:text-[#460A23] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <rect x="1.5" y="3.5" width="13" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M1.5 4.5L8 9L14.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {st("PRESS11")}
              </a>
            </section>
          </div>
        </div>
      </main>
      <Footer product="masumi" locale={locale} />
    </>
  );
}
