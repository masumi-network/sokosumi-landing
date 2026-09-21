import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@summation/shared";
import { type Locale, localePath, alternatesFor } from "@/lib/i18n";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { t as copy } from "./copy";

// The neutral, chain-agnostic x402 explainer.
//
// /x402 is the Cardano page, built around the vending-machine demo. This page
// takes the head terms it cannot: x402 (2,900 US / 9,300 global), x402 protocol
// (1,000/2,600), http 402 (600/3,500, KD 12), what is x402 (350/800).
//
// EVERYTHING HERE IS v2 AND WAS CHECKED AGAINST THE SPEC, not from memory.
// The first draft of this page documented v1 from recall and was wrong in ways
// that mattered: it used the legacy X-PAYMENT header, described the payment
// terms as living in the response body, claimed "one resource, one payment, no
// subscription" when upto/auth-capture/batch-settlement all exist, and credited
// Masumi with escrow that is in fact a payment flow in the base specification.
// Sources, all verified 2026-09-01:
//   specs/transports-v2/http.md              — the three headers
//   specs/x402-specification-v2.md           — §6.1 payment flows, §7 facilitator
//   specs/schemes/exact/scheme_exact_cardano.md — default | masumi | script
// If you edit this page, re-check the spec first. It moves.

const URL_BASE = "https://www.masumi.network";
const PAGE_PATH = "/x402-protocol";
const SPEC_URL = "https://github.com/x402-foundation/x402/blob/main/specs/x402-specification-v2.md";
const HTTP_SPEC_URL = "https://github.com/x402-foundation/x402/blob/main/specs/transports-v2/http.md";
const CARDANO_SPEC_URL =
  "https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_cardano.md";

// The wire trace is protocol bytes. It is identical in both locales; translating
// header names or JSON keys would make it wrong.
const WIRE = `GET /premium-data HTTP/1.1
Host: api.example.com

HTTP/1.1 402 Payment Required
PAYMENT-REQUIRED: <base64 of the JSON below>

{
  "x402Version": 2,
  "error": "PAYMENT-SIGNATURE header is required",
  "resource": {
    "url": "https://api.example.com/premium-data",
    "description": "Access to premium market data",
    "mimeType": "application/json"
  },
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:84532",        // CAIP-2
    "amount": "10000",                // atomic units
    "asset": "0x036CbD53...dCF7e",
    "payTo": "0x209693Bc...12287C",
    "maxTimeoutSeconds": 60
  }]
}

GET /premium-data HTTP/1.1
Host: api.example.com
PAYMENT-SIGNATURE: <base64 of the signed payload>

HTTP/1.1 200 OK
PAYMENT-RESPONSE: <base64 of { success, transaction, network, payer }>`;

const FLOW_NAMES = ["authorization", "upfront", "escrow"] as const;
const FLOW_ORDER: Record<(typeof FLOW_NAMES)[number], string> = {
  authorization: "verify \u2192 resource \u2192 settle \u2192 respond",
  upfront: "settle \u2192 resource \u2192 respond",
  escrow: "settle \u2192 resource \u2192 settle \u2192 respond",
};
const SCHEME_NAMES = ["exact", "upto", "auth-capture", "batch-settlement"] as const;
const STANDARD_NAMES = ["x402", "AP2", "ACP"] as const;
const FAQ_COUNT = 7;

const TABLE_HEADS: Record<Locale, string[]> = {
  en: ["Standard", "From", "Layer", "Settles?", "What it actually is"],
  de: ["Standard", "Von", "Ebene", "Settlement?", "Was es tats\u00e4chlich ist"],
};

export function buildMetadata(locale: Locale): Metadata {
  const t = copy(locale);
  const title = t("TITLE");
  const description = t("DESCRIPTION");
  return {
    title,
    description,
    alternates: alternatesFor(locale, PAGE_PATH),
    openGraph: {
      type: "article",
      title,
      description,
      url: `${URL_BASE}${localePath(locale, PAGE_PATH)}`,
      siteName: "Masumi",
      locale: locale === "de" ? "de_DE" : "en_US",
      images: [
        {
          url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt",
          width: 1920,
          height: 1080,
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

function Section({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-16 md:py-20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">{children}</div>
    </section>
  );
}

export function X402ProtocolView({ locale }: { locale: Locale }) {
  const t = copy(locale);
  const url = `${URL_BASE}${localePath(locale, PAGE_PATH)}`;
  const faq = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    q: t(`FAQ${i + 1}_Q`),
    a: t(`FAQ${i + 1}_A`),
  }));

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    inLanguage: locale,
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${url}#article`,
    headline: t("TITLE"),
    description: t("DESCRIPTION"),
    url,
    inLanguage: locale,
    about: { "@type": "Thing", name: "x402 protocol" },
    publisher: { "@type": "Organization", name: "Masumi", url: URL_BASE },
  };

  return (
    <>
      <Header product="masumi" locale={locale} />
      <main className="overflow-x-clip">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([articleJsonLd, faqJsonLd]) }}
        />

        <Section>
          <p className="text-xs uppercase tracking-[0.14em] text-black/50 mb-5">{t("EYEBROW")}</p>
          <h1 className="text-4xl md:text-6xl font-light tracking-[-0.03em] leading-[1.04] max-w-[20ch]">
            {t("H1")}
          </h1>
          <p className="mt-7 text-lg md:text-xl leading-relaxed text-black/70 max-w-[62ch]">
            {t("LEDE")}
          </p>
          <div className="mt-9 flex flex-wrap gap-3 text-sm">
            <Link
              href={localePath(locale, "/x402")}
              className="inline-flex items-center px-5 py-2.5 bg-black text-white hover:bg-black/85 transition-colors"
            >
              {t("CTA_PRIMARY")}
            </Link>
            <a
              href={SPEC_URL}
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 border border-black/15 hover:border-black/40 transition-colors"
            >
              {t("CTA_SECONDARY")}
            </a>
          </div>
          <div className="mt-6">
            <LocaleSwitch locale={locale} path={PAGE_PATH} />
          </div>
        </Section>

        <Section id="on-the-wire">
          <h2 className="text-3xl md:text-4xl font-light tracking-[-0.02em] mb-4">{t("H2_WIRE")}</h2>
          <p className="text-black/60 max-w-[62ch] mb-10">{t("WIRE_INTRO")}</p>
          <pre className="overflow-x-auto border border-black/[0.08] bg-black/[0.02] p-5 md:p-7 text-[12.5px] leading-[1.7] font-mono">
            {WIRE}
          </pre>
          <p className="mt-5 text-sm text-black/55 max-w-[68ch]">
            <a href={HTTP_SPEC_URL} rel="noopener noreferrer" className="underline underline-offset-4">
              {locale === "de" ? "Alle Felddefinitionen in der HTTP-Transport-Spezifikation" : "Full field definitions in the HTTP transport specification"}
            </a>
            .
          </p>
        </Section>

        <Section id="payment-flows">
          <h2 className="text-3xl md:text-4xl font-light tracking-[-0.02em] mb-4">{t("H2_FLOWS")}</h2>
          <p className="text-black/60 max-w-[66ch] mb-10">{t("FLOWS_INTRO")}</p>
          <div className="grid gap-px bg-black/[0.08] border border-black/[0.08] md:grid-cols-3">
            {FLOW_NAMES.map((name) => (
              <div key={name} className="bg-white p-7">
                <h3 className="font-mono text-sm mb-2">{name}</h3>
                <p className="text-[13px] font-mono text-black/45 mb-3">{FLOW_ORDER[name]}</p>
                <p className="text-black/65 leading-relaxed text-sm">
                  {t(`FLOW_${name.toUpperCase()}`)}
                </p>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-medium mt-14 mb-5">{t("H3_SCHEMES")}</h3>
          <dl className="grid gap-px bg-black/[0.08] border border-black/[0.08] md:grid-cols-2">
            {SCHEME_NAMES.map((name) => (
              <div key={name} className="bg-white p-6">
                <dt className="font-mono text-sm mb-1.5">{name}</dt>
                <dd className="text-black/65 leading-relaxed text-sm">
                  {t(`SCHEME_${name.toUpperCase().replace(/-/g, "_")}`)}
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="standards">
          <h2 className="text-3xl md:text-4xl font-light tracking-[-0.02em] mb-4">{t("H2_STANDARDS")}</h2>
          <p className="text-black/60 max-w-[66ch] mb-10">{t("STANDARDS_INTRO")}</p>
          <div className="overflow-x-auto border border-black/[0.08]">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr className="bg-black/[0.02]">
                  {TABLE_HEADS[locale].map((h) => (
                    <th key={h} scope="col" className="text-left font-medium p-4 border-b border-black/[0.08]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STANDARD_NAMES.map((name) => {
                  const k = name.toUpperCase();
                  return (
                    <tr key={name} className="align-top">
                      <th scope="row" className="text-left font-medium p-4 border-b border-black/[0.06] whitespace-nowrap">
                        {name}
                      </th>
                      <td className="p-4 border-b border-black/[0.06] text-black/65">{t(`STD_${k}_FROM`)}</td>
                      <td className="p-4 border-b border-black/[0.06] text-black/65">{t(`STD_${k}_LAYER`)}</td>
                      <td className="p-4 border-b border-black/[0.06] text-black/65">{t(`STD_${k}_SETTLES`)}</td>
                      <td className="p-4 border-b border-black/[0.06] text-black/65">{t(`STD_${k}_NOTE`)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-sm text-black/55 max-w-[68ch]">{t("STANDARDS_NOTE")}</p>
        </Section>

        <Section id="limits">
          <h2 className="text-3xl md:text-4xl font-light tracking-[-0.02em] mb-6">{t("H2_LIMITS")}</h2>
          <div className="grid gap-8 md:grid-cols-2 max-w-[92ch]">
            <p className="text-black/70 leading-relaxed">{t("LIMITS_P1")}</p>
            <p className="text-black/70 leading-relaxed">
              {t("LIMITS_P2")}{" "}
              <a href={CARDANO_SPEC_URL} rel="noopener noreferrer" className="underline underline-offset-4">
                {locale === "de" ? "Das Cardano-Binding" : "The Cardano binding"}
              </a>{" "}
              {locale === "de" ? "definiert alle drei;" : "defines all three;"}{" "}
              <Link href={localePath(locale, "/x402")} className="underline underline-offset-4 hover:text-black">
                {locale === "de" ? "unsere Cardano-Seite" : "our Cardano page"}
              </Link>{" "}
              {locale === "de"
                ? "beschreibt, was Masumi \u00e4ndert und was der Dispute-Pfad konkret voraussetzt."
                : "covers what Masumi changes and what its dispute path actually requires."}
            </p>
          </div>
        </Section>

        <Section id="faq">
          <h2 className="text-3xl md:text-4xl font-light tracking-[-0.02em] mb-10">{t("H2_FAQ")}</h2>
          <div className="border-t border-black/[0.08] max-w-[92ch]">
            {faq.map((f) => (
              <details key={f.q} className="group border-b border-black/[0.08]">
                <summary className="flex items-start justify-between gap-6 cursor-pointer py-5 list-none">
                  <span className="font-medium">{f.q}</span>
                  <span className="text-black/30 group-open:rotate-45 transition-transform shrink-0">+</span>
                </summary>
                <p className="pb-6 text-black/65 leading-relaxed max-w-[70ch]">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        <Section>
          <h2 className="text-xl font-medium mb-6">{t("H2_RELATED")}</h2>
          <div className="grid gap-px bg-black/[0.08] border border-black/[0.08] md:grid-cols-3">
            {(["/x402", "/glossary/x402", "/glossary"] as const).map((href) => {
              const k = href.replace(/[^a-z0-9]/gi, "_").toUpperCase();
              return (
                <Link
                  key={href}
                  href={localePath(locale, href)}
                  className="bg-white p-7 hover:bg-black/[0.015] transition-colors"
                >
                  <strong className="block font-medium mb-1.5">{t(`REL_${k}_TITLE`)}</strong>
                  <span className="text-black/60 text-sm leading-relaxed">{t(`REL_${k}_NOTE`)}</span>
                </Link>
              );
            })}
          </div>
        </Section>
      </main>
      <Footer product="masumi" locale={locale} />
    </>
  );
}
