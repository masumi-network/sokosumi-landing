import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, FadeIn } from "@summation/shared";
import { getAllTerms } from "@/lib/glossary";
import { type Locale, localePath, alternatesFor, ui } from "@/lib/i18n";
import { LocaleSwitch } from "@/components/LocaleSwitch";

export function buildMetadata(locale: Locale): Metadata {
  const u = ui(locale);
  return {
    title: u("glossaryTitle"),
    description: u("glossaryDescription"),
    alternates: alternatesFor(locale, "/glossary"),
    openGraph: {
      title: `${u("glossaryEyebrow")} | Masumi`,
      description: u("glossaryLede"),
      locale: locale === "de" ? "de_DE" : "en_US",
      images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
    },
  };
}

export async function GlossaryIndexView({ locale }: { locale: Locale }) {
  const u = ui(locale);
  const terms = await getAllTerms(locale);

  return (
    <>
      <Header product="masumi" locale={locale} />
      <main className="pt-[160px] pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <FadeIn>
            <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-3 text-center">
              {u("glossaryEyebrow")}
            </p>
            <h1 className="text-[40px] md:text-[56px] font-normal tracking-[-1px] leading-[1.15] text-black text-center mb-4">
              {u("glossaryH1")}
            </h1>
            <p className="text-[16px] md:text-[18px] text-[#5b5b5b] text-center max-w-[520px] mx-auto mb-14 leading-[1.5]">
              {u("glossaryLede")}
            </p>
            <div className="text-center mb-14 -mt-10">
              <LocaleSwitch locale={locale} path="/glossary" />
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {terms.map((t, i) => (
              <FadeIn key={t.slug} delay={i * 40}>
                <Link
                  href={localePath(locale, `/glossary/${t.slug}`)}
                  className="bg-white border border-black/[0.04] p-6 flex flex-col hover:border-black/10 transition-colors h-full group"
                >
                  <h2 className="text-[18px] font-medium text-black leading-snug mb-2 group-hover:text-black/80 transition-colors">
                    {t.term}
                  </h2>
                  <p className="text-[13px] text-[#919191] leading-[1.5] flex-1">
                    {t.shortDefinition}
                  </p>
                  <span className="text-[12px] text-[#FA008C] mt-4">{u("readDefinition")}</span>
                </Link>
              </FadeIn>
            ))}
          </div>

          {terms.length === 0 && (
            <p className="text-center text-[15px] text-[#999] mt-12">
              {u("noTerms")}
            </p>
          )}
        </div>
      </main>
      <Footer product="masumi" locale={locale} />
    </>
  );
}
