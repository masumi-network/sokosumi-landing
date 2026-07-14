import { FadeIn } from "@summation/shared";
import { cmsFileUrl } from "@/lib/cms";

// Renderers for the CMS "pages" block types. Editors compose pages in the
// CMS; each block maps to exactly one component here, so the design stays
// locked in code.

type MediaRef = { url?: string; alt?: string; width?: number; height?: number } | string | null;

function mediaObj(m: MediaRef | undefined): { url: string; alt?: string; width?: number; height?: number } | null {
  if (typeof m !== "object" || !m?.url) return null;
  return { ...m, url: m.url };
}

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
    }
  | {
      blockType: "stats";
      heading?: string;
      items?: { value: string; label: string }[];
    }
  | {
      blockType: "steps";
      heading?: string;
      subheading?: string;
      items?: { title: string; text: string }[];
    }
  | {
      blockType: "testimonials";
      heading?: string;
      items?: { quote: string; name: string; role?: string; avatar?: MediaRef }[];
    }
  | {
      blockType: "mediaText";
      heading: string;
      text: string;
      image?: MediaRef;
      mediaSide?: "left" | "right";
      ctaLabel?: string;
      ctaHref?: string;
    }
  | {
      blockType: "checklist";
      heading?: string;
      intro?: string;
      items?: { text: string }[];
    }
  | {
      blockType: "pricing";
      heading?: string;
      subheading?: string;
      plans?: {
        name: string;
        price: string;
        per?: string;
        description?: string;
        features?: { text: string }[];
        highlight?: boolean;
        ctaLabel?: string;
        ctaHref?: string;
      }[];
    }
  | { blockType: "videoEmbed"; heading?: string; url?: string; caption?: string }
  | { blockType: "image"; image?: MediaRef; caption?: string };

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

function StatsBlock(b: Extract<PageBlock, { blockType: "stats" }>) {
  const items = b.items ?? [];
  if (items.length === 0) return null;
  return (
    <section className="py-16">
      <FadeIn className={container}>
        {b.heading && (
          <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2] text-black text-center mb-12">
            {b.heading}
          </h2>
        )}
        <div className="flex flex-wrap justify-evenly gap-x-8 gap-y-10 text-center">
          {items.map((item, i) => (
            <div key={i}>
              <p className="text-[40px] md:text-[56px] font-normal tracking-[-1px] leading-[1.1] text-black">
                {item.value}
              </p>
              <p className="text-[13px] text-[#8a8a8a] mt-2">{item.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function StepsBlock(b: Extract<PageBlock, { blockType: "steps" }>) {
  const items = b.items ?? [];
  if (items.length === 0) return null;
  return (
    <section className="py-16">
      <FadeIn className={container}>
        {b.heading && (
          <h2
            className={`text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2] text-black ${b.subheading ? "mb-3" : "mb-10"}`}
          >
            {b.heading}
          </h2>
        )}
        {b.subheading && (
          <p className="text-[16px] text-[#5b5b5b] max-w-[560px] leading-[1.55] mb-10">{b.subheading}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div key={i} className="bg-white border border-black/[0.04] p-6">
              <p className="text-[11px] font-mono tracking-wide text-[#FA008C] mb-3">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="text-[18px] font-medium text-black mb-2">{item.title}</h3>
              <p className="text-[15px] text-[#5b5b5b] leading-[1.55]">{item.text}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function TestimonialsBlock(b: Extract<PageBlock, { blockType: "testimonials" }>) {
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
          {items.map((item, i) => {
            const avatar = mediaObj(item.avatar);
            return (
              <figure key={i} className="bg-white border border-black/[0.04] p-6 flex flex-col">
                <blockquote className="text-[15px] text-black leading-[1.65] flex-1">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3 mt-6">
                  {avatar ? (
                    <img
                      src={cmsFileUrl(avatar.url)}
                      alt={avatar.alt ?? item.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-[#FA008C]/10 text-[#FA008C] text-[13px] font-medium flex items-center justify-center">
                      {item.name?.charAt(0).toUpperCase() ?? "?"}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-[14px] font-medium text-black">{item.name}</span>
                    {item.role && <span className="block text-[13px] text-[#8a8a8a]">{item.role}</span>}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </FadeIn>
    </section>
  );
}

function MediaTextBlock(b: Extract<PageBlock, { blockType: "mediaText" }>) {
  const image = mediaObj(b.image);
  return (
    <section className="py-16">
      <FadeIn className={container}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {image && (
            <img
              src={cmsFileUrl(image.url)}
              alt={image.alt ?? ""}
              width={image.width}
              height={image.height}
              className={`w-full h-auto object-cover ${b.mediaSide === "right" ? "md:order-2" : ""}`}
            />
          )}
          <div>
            <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2] text-black">
              {b.heading}
            </h2>
            <p className="text-[15px] md:text-[16px] text-[#5b5b5b] leading-[1.65] mt-4">{b.text}</p>
            {b.ctaLabel && b.ctaHref && (
              <div className="mt-8">
                <Cta label={b.ctaLabel} href={b.ctaHref} />
              </div>
            )}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function ChecklistBlock(b: Extract<PageBlock, { blockType: "checklist" }>) {
  const items = b.items ?? [];
  if (items.length === 0) return null;
  return (
    <section className="py-16">
      <FadeIn className={`${container} max-w-[820px]`}>
        {b.heading && (
          <h2 className="text-[22px] md:text-[28px] font-normal tracking-[-0.4px] leading-[1.3] text-black mb-4">
            {b.heading}
          </h2>
        )}
        {b.intro && <p className="text-[15px] text-[#5b5b5b] leading-[1.65] mb-8">{b.intro}</p>}
        <ul className="flex flex-col gap-4 max-w-[680px]">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#FA008C] text-white text-[10px] shrink-0 mt-0.5"
                aria-hidden
              >
                ✓
              </span>
              <span className="text-[15px] text-black leading-[1.55]">{item.text}</span>
            </li>
          ))}
        </ul>
      </FadeIn>
    </section>
  );
}

const pricingGrid: Record<number, string> = {
  1: "grid-cols-1 max-w-[400px]",
  2: "grid-cols-1 md:grid-cols-2 max-w-[760px]",
  3: "grid-cols-1 md:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

function PricingBlock(b: Extract<PageBlock, { blockType: "pricing" }>) {
  const plans = (b.plans ?? []).slice(0, 4);
  if (plans.length === 0) return null;
  return (
    <section className="py-16">
      <FadeIn className={container}>
        {b.heading && (
          <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2] text-black text-center">
            {b.heading}
          </h2>
        )}
        {b.subheading && (
          <p className="text-[16px] text-[#5b5b5b] max-w-[560px] mx-auto mt-4 leading-[1.55] text-center">
            {b.subheading}
          </p>
        )}
        <div className={`grid gap-4 mx-auto mt-12 ${pricingGrid[plans.length] ?? pricingGrid[3]}`}>
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`bg-white p-6 flex flex-col ${
                plan.highlight ? "border border-[#FA008C]/40 bg-[#FA008C]/[0.02]" : "border border-black/[0.04]"
              }`}
            >
              {plan.highlight && (
                <p className="text-[11px] text-[#FA008C] uppercase tracking-[0.18em] font-mono mb-3">Recommended</p>
              )}
              <h3 className="text-[18px] font-medium text-black">{plan.name}</h3>
              <p className="mt-3">
                <span className="text-[32px] font-normal tracking-[-0.4px] text-black">{plan.price}</span>
                {plan.per && <span className="text-[13px] text-[#8a8a8a] ml-1">{plan.per}</span>}
              </p>
              {plan.description && (
                <p className="text-[14px] text-[#5b5b5b] leading-[1.55] mt-2">{plan.description}</p>
              )}
              {(plan.features ?? []).length > 0 && (
                <ul className="flex flex-col gap-2.5 mt-6">
                  {(plan.features ?? []).map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2.5">
                      <span
                        className={`inline-flex items-center justify-center w-[16px] h-[16px] rounded-full text-white text-[9px] shrink-0 mt-0.5 ${
                          plan.highlight ? "bg-[#FA008C]" : "bg-black"
                        }`}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <span className="text-[14px] text-[#5b5b5b] leading-[1.5]">{f.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              {plan.ctaLabel && plan.ctaHref && (
                <a
                  href={plan.ctaHref}
                  className={`inline-flex items-center justify-center text-[14px] font-medium px-6 py-3 rounded-full transition-colors mt-8 ${
                    plan.highlight
                      ? "bg-[#FA008C] text-white hover:bg-[#FA008C]/85"
                      : "bg-black text-white hover:bg-black/85"
                  }`}
                >
                  {plan.ctaLabel}
                </a>
              )}
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function videoEmbedUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "");
  if (host === "youtube.com" || host === "m.youtube.com") {
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
    const [first, second] = u.pathname.split("/").filter(Boolean);
    if (["embed", "shorts", "live"].includes(first) && second) {
      return `https://www.youtube-nocookie.com/embed/${second}`;
    }
    return null;
  }
  if (host === "youtu.be") {
    const [id] = u.pathname.split("/").filter(Boolean);
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean).find((p) => /^\d+$/.test(p));
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}

function VideoEmbedBlock(b: Extract<PageBlock, { blockType: "videoEmbed" }>) {
  if (!b.url) return null;
  const embed = videoEmbedUrl(b.url);
  return (
    <section className="py-16">
      <FadeIn className={`${container} max-w-[980px]`}>
        {b.heading && (
          <h2 className="text-[28px] md:text-[40px] font-normal tracking-[-0.4px] leading-[1.2] text-black mb-8">
            {b.heading}
          </h2>
        )}
        {embed ? (
          <div className="relative aspect-video bg-black">
            <iframe
              src={embed}
              title={b.heading ?? "Video"}
              className="absolute inset-0 w-full h-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <a
            href={b.url}
            className="text-[14px] font-medium text-black underline underline-offset-4 hover:text-black/60 transition-colors"
          >
            {b.heading ?? "Watch the video"}
          </a>
        )}
        {b.caption && <p className="text-[13px] text-[#8a8a8a] mt-4">{b.caption}</p>}
      </FadeIn>
    </section>
  );
}

function ImageBlock(b: Extract<PageBlock, { blockType: "image" }>) {
  const image = mediaObj(b.image);
  if (!image) return null;
  return (
    <section className="py-12">
      <FadeIn className={container}>
        <figure>
          <img
            src={cmsFileUrl(image.url)}
            alt={image.alt ?? ""}
            width={image.width}
            height={image.height}
            className="w-full h-auto"
          />
          {b.caption && (
            <figcaption className="text-[13px] text-[#8a8a8a] mt-3">{b.caption}</figcaption>
          )}
        </figure>
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
          case "stats":
            return <StatsBlock key={i} {...block} />;
          case "steps":
            return <StepsBlock key={i} {...block} />;
          case "testimonials":
            return <TestimonialsBlock key={i} {...block} />;
          case "mediaText":
            return <MediaTextBlock key={i} {...block} />;
          case "checklist":
            return <ChecklistBlock key={i} {...block} />;
          case "pricing":
            return <PricingBlock key={i} {...block} />;
          case "videoEmbed":
            return <VideoEmbedBlock key={i} {...block} />;
          case "image":
            return <ImageBlock key={i} {...block} />;
          default:
            return null;
        }
      })}
    </>
  );
}
