import { FadeIn } from "@summation/shared";
import { cmsFileUrl } from "@/lib/cms";

// Renderers for the CMS "pages" block types. Editors compose pages in the
// CMS; each block maps to exactly one component here, so the design stays
// locked in code.

type MediaRef = { url?: string; alt?: string } | string | null;

export type PageBlock =
  | {
      blockType: "hero";
      eyebrow?: string;
      heading: string;
      subheading?: string;
      ctaLabel?: string;
      ctaHref?: string;
      secondaryCtaLabel?: string;
      secondaryCtaHref?: string;
    }
  | { blockType: "richText"; contentHtml?: string }
  | {
      blockType: "featureGrid";
      heading?: string;
      items?: { title: string; text: string }[];
    }
  | { blockType: "logoStrip"; heading?: string; logos?: MediaRef[] }
  | {
      blockType: "faq";
      heading?: string;
      items?: { question: string; answer: string }[];
    }
  | {
      blockType: "comparisonTable";
      heading?: string;
      columns?: { label: string; highlight?: boolean }[];
      rows?: { label: string; note?: string; cells?: { value: string }[] }[];
    }
  | {
      blockType: "ctaBand";
      heading: string;
      subheading?: string;
      ctaLabel: string;
      ctaHref: string;
    };

const container = "max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12";

function Cta({ label, href, secondary }: { label: string; href: string; secondary?: boolean }) {
  return (
    <a
      href={href}
      className={
        secondary
          ? "inline-flex items-center text-[14px] font-medium text-black underline underline-offset-4 hover:text-black/60 transition-colors"
          : "inline-flex items-center gap-2 text-[14px] font-medium bg-black text-white px-6 py-3 rounded-full hover:bg-black/85 transition-colors"
      }
    >
      {label}
    </a>
  );
}

function HeroBlock(b: Extract<PageBlock, { blockType: "hero" }>) {
  return (
    <section className="pt-[160px] pb-16 text-center">
      <FadeIn className={container}>
        {b.eyebrow && (
          <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-4">{b.eyebrow}</p>
        )}
        <h1 className="text-[40px] md:text-[56px] font-normal tracking-[-1px] leading-[1.15] text-black max-w-[820px] mx-auto">
          {b.heading}
        </h1>
        {b.subheading && (
          <p className="text-[16px] md:text-[18px] text-[#5b5b5b] max-w-[560px] mx-auto mt-5 leading-[1.55]">
            {b.subheading}
          </p>
        )}
        {(b.ctaLabel || b.secondaryCtaLabel) && (
          <div className="flex items-center justify-center gap-6 mt-8">
            {b.ctaLabel && b.ctaHref && <Cta label={b.ctaLabel} href={b.ctaHref} />}
            {b.secondaryCtaLabel && b.secondaryCtaHref && (
              <Cta label={b.secondaryCtaLabel} href={b.secondaryCtaHref} secondary />
            )}
          </div>
        )}
      </FadeIn>
    </section>
  );
}

function RichTextBlock(b: Extract<PageBlock, { blockType: "richText" }>) {
  if (!b.contentHtml) return null;
  return (
    <section className="py-12">
      <FadeIn className={container}>
        <div
          className="prose max-w-[720px]"
          dangerouslySetInnerHTML={{ __html: b.contentHtml }}
        />
      </FadeIn>
    </section>
  );
}

function FeatureGridBlock(b: Extract<PageBlock, { blockType: "featureGrid" }>) {
  const items = b.items ?? [];
  if (items.length === 0) return null;
  return (
    <section className="py-16">
      <FadeIn className={container}>
        {b.heading && (
          <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2] text-black mb-10">
            {b.heading}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div key={i} className="bg-white border border-black/[0.04] p-6">
              <h3 className="text-[18px] font-medium text-black mb-2">{item.title}</h3>
              <p className="text-[15px] text-[#5b5b5b] leading-[1.55]">{item.text}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function LogoStripBlock(b: Extract<PageBlock, { blockType: "logoStrip" }>) {
  const logos = (b.logos ?? []).filter(
    (l): l is { url?: string; alt?: string } => typeof l === "object" && !!l?.url,
  );
  if (logos.length === 0) return null;
  return (
    <section className="py-12">
      <FadeIn className={container}>
        {b.heading && (
          <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] font-mono mb-6">{b.heading}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
          {logos.map((logo, i) => (
            <img
              key={i}
              src={cmsFileUrl(logo.url)}
              alt={logo.alt ?? ""}
              className="h-8 w-auto object-contain opacity-60"
            />
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function FaqBlock(b: Extract<PageBlock, { blockType: "faq" }>) {
  const items = b.items ?? [];
  if (items.length === 0) return null;
  return (
    <section className="py-16">
      <FadeIn className={`${container} max-w-[820px]`}>
        <h2 className="text-[22px] md:text-[28px] font-normal tracking-[-0.4px] leading-[1.3] text-black mb-8">
          {b.heading ?? "Frequently asked"}
        </h2>
        <div className="border-t border-black/[0.06]">
          {items.map((it, i) => (
            <details key={i} className="group border-b border-black/[0.06] py-5">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="text-[16px] md:text-[18px] text-black pr-4">{it.question}</span>
                <span className="text-[20px] text-[#999] group-open:rotate-45 transition-transform shrink-0">+</span>
              </summary>
              <p className="mt-4 text-[15px] text-[#5b5b5b] leading-[1.65] max-w-[680px]">{it.answer}</p>
            </details>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function ComparisonCell({ value, pink }: { value: string; pink?: boolean }) {
  const v = value.trim().toLowerCase();
  if (v === "no") {
    return <span className="inline-flex w-[18px] h-[18px] rounded-full border-[1.5px] border-black/[0.15]" aria-hidden />;
  }
  if (v === "yes") {
    return (
      <span
        className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-white text-[10px]"
        style={{ background: pink ? "#FA008C" : "#0a0a0a" }}
        aria-hidden
      >
        ✓
      </span>
    );
  }
  return <span className={`text-[12px] md:text-[13px] text-center leading-tight ${pink ? "text-[#FA008C] font-medium" : "text-[#666]"}`}>{value}</span>;
}

function ComparisonTableBlock(b: Extract<PageBlock, { blockType: "comparisonTable" }>) {
  const columns = b.columns ?? [];
  const rows = b.rows ?? [];
  if (columns.length === 0 || rows.length === 0) return null;
  const gridCols = { gridTemplateColumns: `1.4fr repeat(${columns.length}, 1fr)` };
  return (
    <section className="py-16">
      <FadeIn className={container}>
        {b.heading && (
          <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2] text-black mb-10">
            {b.heading}
          </h2>
        )}
        <div className="border border-black/[0.04] bg-white overflow-hidden max-w-[980px]">
          <div className="grid items-center" style={gridCols}>
            <div className="p-3 md:p-6" />
            {columns.map((col, i) => (
              <div
                key={i}
                className={`px-1.5 py-4 md:p-6 border-l border-black/[0.04] text-center ${col.highlight ? "bg-[#FA008C]/[0.05]" : ""}`}
              >
                <span className={`text-[12px] md:text-[13px] font-medium ${col.highlight ? "text-[#FA008C]" : "text-black"}`}>
                  {col.label}
                </span>
              </div>
            ))}
          </div>
          {rows.map((row, ri) => (
            <div key={ri} className="grid items-center border-t border-black/[0.04]" style={gridCols}>
              <div className="p-3 md:p-6 min-w-0">
                <p className="text-[13px] md:text-[14px] font-medium text-black">{row.label}</p>
                {row.note && (
                  <p className="mt-1 text-[12px] md:text-[13px] text-[#8a8a8a] leading-[1.5] max-w-[440px]">{row.note}</p>
                )}
              </div>
              {columns.map((col, ci) => (
                <div
                  key={ci}
                  className={`px-1.5 py-4 md:p-6 border-l border-black/[0.04] flex items-center justify-center ${col.highlight ? "bg-[#FA008C]/[0.03]" : ""}`}
                >
                  <ComparisonCell value={row.cells?.[ci]?.value ?? ""} pink={col.highlight} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function CtaBandBlock(b: Extract<PageBlock, { blockType: "ctaBand" }>) {
  return (
    <section className="py-16">
      <FadeIn className={container}>
        <div className="bg-black text-white px-8 py-14 md:px-16 md:py-20 text-center">
          <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2]">
            {b.heading}
          </h2>
          {b.subheading && (
            <p className="text-[16px] text-white/60 max-w-[520px] mx-auto mt-4 leading-[1.55]">{b.subheading}</p>
          )}
          <a
            href={b.ctaHref}
            className="inline-flex items-center gap-2 text-[14px] font-medium bg-white text-black px-6 py-3 rounded-full hover:bg-white/85 transition-colors mt-8"
          >
            {b.ctaLabel}
          </a>
        </div>
      </FadeIn>
    </section>
  );
}

export function RenderBlocks({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.blockType) {
          case "hero":
            return <HeroBlock key={i} {...block} />;
          case "richText":
            return <RichTextBlock key={i} {...block} />;
          case "featureGrid":
            return <FeatureGridBlock key={i} {...block} />;
          case "logoStrip":
            return <LogoStripBlock key={i} {...block} />;
          case "faq":
            return <FaqBlock key={i} {...block} />;
          case "comparisonTable":
            return <ComparisonTableBlock key={i} {...block} />;
          case "ctaBand":
            return <CtaBandBlock key={i} {...block} />;
          default:
            return null;
        }
      })}
    </>
  );
}
