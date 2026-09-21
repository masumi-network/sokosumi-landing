import type { Metadata } from "next";
import { type Locale, alternatesFor, localePath } from "@/lib/i18n";
import { st as siteCopy } from "@/lib/site-copy";
import Link from "next/link";
import { Header, Footer } from "@summation/shared";
import Creator from "./Creator";
import { getRecent, type SavedExtraction } from "./lib/extractions-db";
import { cmsFetch } from "@/lib/cms";


const URL_BASE = "https://www.masumi.network";
const PAGE_PATH = "/tools/design-md";

export function buildMetadata(locale: Locale): Metadata {
  const st = siteCopy(locale);
  return {
  title:
    st("DMD15"),
  description:
    st("DMD16"),
  keywords: [
    "DESIGN.md",
    "design system",
    "design tokens",
    "AI agents",
    "Claude Code",
    "Cursor",
    "Tailwind config",
    "brand guide",
    "design system generator",
    "design tokens from URL",
  ],
  alternates: {
    canonical: `${URL_BASE}${PAGE_PATH}`,
  },
  openGraph: {
    type: "website",
    title:
      st("DMD17"),
    description:
      st("DMD18"),
    url: `${URL_BASE}${PAGE_PATH}`,
    siteName: "Masumi",
    images: [
      {
        url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt",
        width: 1920,
        height: 1080,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: st("DMD19"),
    description:
      st("DMD20"),
    images: [
      "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt",
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};
}

const jsonLdApp = (st: ReturnType<typeof siteCopy>) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: st("DMD3"),
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  url: `${URL_BASE}${PAGE_PATH}`,
  description:
    st("DMD21"),
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  publisher: {
    "@type": "Organization",
    name: st("DMD22"),
    url: URL_BASE,
  },
});

// FAQ content is edited in the CMS ("FAQs" collection, page = design-md).
// The visible accordion and the FAQPage structured data are generated from
// the same records so they can't drift apart.
type CmsFaq = { question: string; answerHtml?: string };

async function getFaqs(locale: Locale): Promise<CmsFaq[]> {
  const res = await cmsFetch<{ docs: CmsFaq[] }>(
    "/faqs?where[page][equals]=design-md&limit=50&sort=order&depth=0",
    { locale },
  );
  return res?.docs ?? [];
}

const stripHtml = (html: string) =>
  html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

function buildFaqJsonLd(faqs: CmsFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: stripHtml(f.answerHtml ?? "") },
    })),
  };
}

const exampleSites = (st: ReturnType<typeof siteCopy>) => [
  { label: st("DMD23"), url: "https://stripe.com" },
  { label: st("DMD24"), url: "https://linear.app" },
  { label: st("DMD25"), url: "https://vercel.com" },
  { label: st("DMD26"), url: "https://www.notion.so" },
];

export async function DesignMdView({ locale }: { locale: Locale }) {
  const st = siteCopy(locale);
  const faqs = await getFaqs(locale);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp(st)) }}
      />
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(faqs)) }}
        />
      )}
      <Header product="masumi" locale={locale} />
      <main className="pt-[130px] md:pt-[140px] pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <ToolHeader locale={locale} />
          <Creator examples={exampleSites(st)} locale={locale} />
          <RecentGallery locale={locale} />
          <BelowFold faqs={faqs} locale={locale} />
        </div>
      </main>
      <Footer product="masumi" locale={locale} />
    </>
  );
}

function ToolHeader({ locale }: { locale: Locale }) {
  const st = siteCopy(locale);
  return (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-4 mb-6 border-b border-black/[0.06]">
      <div>
        <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-1.5">
          {st("DMD2")}
        </p>
        <h1 className="text-[22px] md:text-[26px] font-normal tracking-[-0.5px] text-black">
          {st("DMD3")}
        </h1>
      </div>
      <div className="flex items-center gap-4 text-[12px] text-[#666]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          <span>{st("DMD4")}</span>
        </span>
        <span className="w-px h-3 bg-black/[0.1]" aria-hidden />
        <Link
          href="https://github.com/google-labs-code/design.md"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-black transition-colors"
        >
          <span>{st("DMD5")}</span>
          <span aria-hidden>↗</span>
        </Link>
      </div>
    </header>
  );
}

function BelowFold({ faqs, locale }: { faqs: CmsFaq[]; locale: Locale }) {
  return (
    <div className="mt-32 md:mt-40 max-w-[820px]">
      <Explainer locale={locale} />
      <FAQ items={faqs} locale={locale} />
    </div>
  );
}

function RecentGallery({ locale }: { locale: Locale }) {
  const st = siteCopy(locale);
  let entries: SavedExtraction[] = [];
  try {
    entries = getRecent(12);
  } catch (e) {
    console.error("[gallery] failed to load recent:", e);
    entries = [];
  }
  if (entries.length === 0) return null;

  return (
    <section className="mt-16 md:mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
        <div>
          <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-1.5">
            {st("DMD6")}
          </p>
          <h2 className="text-[18px] md:text-[20px] font-medium text-black">
            {st("DMD7")}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-[12px] text-[#999] hidden md:block">
            {st("DMD8")}
          </p>
          <Link
            href="/tools/design-md/gallery"
            className="text-[12px] text-[#666] hover:text-black underline-offset-2 hover:underline transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            {st("DMD9")}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {entries.map((e) => (
          <GalleryCard key={e.id} entry={e} locale={locale} />
        ))}
      </div>
    </section>
  );
}

function GalleryCard({ entry, locale }: { entry: SavedExtraction; locale: Locale }) {
  const st = siteCopy(locale);
  const fallbackBg = entry.primaryColor ?? "#f0f0f0";
  return (
    <Link
      href={`?cached=${entry.id}`}
      className="group block bg-white border border-black/[0.06] rounded-[10px] overflow-hidden hover:border-black/30 transition-colors"
    >
      <div
        className="aspect-[16/10] relative overflow-hidden"
        style={{ background: fallbackBg }}
      >
        {entry.hasScreenshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/tools/design-md/api/screenshots/${entry.id}`}
            alt={`${entry.hostname} screenshot`}
            loading="lazy"
            className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/70 text-[12px]">
            {st("DMD10")}
          </div>
        )}
      </div>
      <div className="p-3 md:p-4 flex items-center gap-2 min-w-0">
        {entry.primaryColor && (
          <span
            className="w-3 h-3 rounded-full flex-shrink-0 border border-black/[0.06]"
            style={{ background: entry.primaryColor }}
            aria-hidden
          />
        )}
        <div className="min-w-0 flex-1">
          <p
            className="text-[13px] font-medium text-black truncate"
            title={entry.name ?? entry.hostname}
          >
            {entry.name ?? entry.hostname}
          </p>
          <p className="text-[11px] text-[#999] truncate font-mono">
            {entry.hostname}
          </p>
        </div>
      </div>
    </Link>
  );
}

function Explainer({ locale }: { locale: Locale }) {
  const st = siteCopy(locale);
  return (
    <section>
      <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] mb-3 font-mono">
        {st("DMD11")}
      </p>
      <h2 className="text-[22px] md:text-[28px] font-normal tracking-[-0.4px] leading-[1.3] text-black mb-8">
        {st("DMD12")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
        <Step
          n="01"
          title={st("DMD27")}
          body={st("DMD28")}
        />
        <Step
          n="02"
          title={st("DMD29")}
          body={st("DMD30")}
        />
        <Step
          n="03"
          title={st("DMD31")}
          body={st("DMD32")}
        />
      </div>
    </section>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <p className="text-[14px] font-mono text-[#FA008C] mb-3">{n}</p>
      <h3 className="text-[18px] font-medium text-black mb-2">{title}</h3>
      <p className="text-[15px] text-[#5b5b5b] leading-[1.55]">{body}</p>
    </div>
  );
}

function FAQ({ items, locale }: { items: CmsFaq[]; locale: Locale }) {
  const st = siteCopy(locale);
  if (items.length === 0) return null;
  return (
    <section className="mt-20 md:mt-28">
      <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] mb-3 font-mono">
        {st("DMD13")}
      </p>
      <h2 className="text-[22px] md:text-[28px] font-normal tracking-[-0.4px] leading-[1.3] text-black mb-8">
        {st("DMD14")}
      </h2>
      <div className="border-t border-black/[0.06]">
        {items.map((it, i) => (
          <details
            key={i}
            className="group border-b border-black/[0.06] py-5"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="text-[16px] md:text-[18px] text-black pr-4">
                {it.question}
              </span>
              <span className="text-[20px] text-[#999] group-open:rotate-45 transition-transform shrink-0">
                +
              </span>
            </summary>
            <div
              className="mt-4 text-[15px] text-[#5b5b5b] leading-[1.65] max-w-[680px] [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-black [&_p+p]:mt-3"
              dangerouslySetInnerHTML={{ __html: it.answerHtml ?? "" }}
            />
          </details>
        ))}
      </div>
    </section>
  );
}
