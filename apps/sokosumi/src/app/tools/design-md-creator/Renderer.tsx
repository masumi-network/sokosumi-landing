"use client";

import { useEffect } from "react";
import type { DesignSystem, Typography } from "./lib/design-md";
import { contrastRatio, resolveToken } from "./lib/design-md";

export default function Renderer({ system }: { system: DesignSystem }) {
  const fm = system.frontmatter;
  const primary = fm.colors?.primary;
  const headingFont = fm.typography?.h1?.fontFamily ?? fm.typography?.["body-md"]?.fontFamily;

  useEffect(() => {
    const families = collectFontFamilies(fm.typography);
    if (families.length === 0) return;
    const id = "design-md-fonts";
    const existing = document.getElementById(id) as HTMLLinkElement | null;
    const href = buildGoogleFontsUrl(families);
    if (existing) {
      existing.href = href;
      return;
    }
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, [fm.typography]);

  return (
    <div className="flex flex-col gap-20">
      <BrandHero
        name={fm.name}
        description={fm.description}
        primary={primary}
        headingFont={headingFont}
      />
      {fm.colors && Object.keys(fm.colors).length > 0 && (
        <ColorsSection colors={fm.colors} />
      )}
      {fm.typography && Object.keys(fm.typography).length > 0 && (
        <TypographySection typography={fm.typography} brandName={fm.name} />
      )}
      {(fm.rounded || fm.spacing) && (
        <ShapeSpacingSection rounded={fm.rounded} spacing={fm.spacing} />
      )}
      {fm.components && Object.keys(fm.components).length > 0 && (
        <ComponentsSection
          components={fm.components}
          frontmatter={fm}
        />
      )}
      {system.sections.length > 0 && <ProseSection sections={system.sections} />}
    </div>
  );
}

function BrandHero({
  name,
  description,
  primary,
  headingFont,
}: {
  name?: string;
  description?: string;
  primary?: string;
  headingFont?: string;
}) {
  const fontStack = headingFont
    ? `"${headingFont}", system-ui, sans-serif`
    : undefined;
  const onPrimary = primary ? bestTextOn(primary) : "#000";
  return (
    <header className="relative overflow-hidden border border-black/[0.06]">
      <div
        className="px-8 py-16 md:px-14 md:py-24"
        style={{ background: primary ?? "#0a0a0a", color: onPrimary }}
      >
        <p
          className="text-[12px] uppercase tracking-[0.2em] mb-6 opacity-70"
          style={{ fontFamily: fontStack }}
        >
          Design system
        </p>
        <h1
          className="text-[48px] md:text-[88px] leading-[0.95] tracking-[-0.04em]"
          style={{ fontFamily: fontStack, fontWeight: 600 }}
        >
          {name ?? "Untitled"}
        </h1>
        {description && (
          <p
            className="mt-6 max-w-[560px] text-[16px] md:text-[20px] leading-[1.4] opacity-80"
            style={{ fontFamily: fontStack }}
          >
            {description}
          </p>
        )}
      </div>
    </header>
  );
}

function SectionTitle({
  eyebrow,
  children,
}: {
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      {eyebrow && (
        <p className="text-[11px] text-[#999] uppercase tracking-[0.18em] mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-[24px] md:text-[32px] font-normal tracking-[-0.4px] text-black">
        {children}
      </h2>
    </div>
  );
}

function ColorsSection({ colors }: { colors: Record<string, string> }) {
  const entries = Object.entries(colors);
  const [primaryEntry, ...rest] = entries;
  return (
    <section>
      <SectionTitle eyebrow="Palette">Colors</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
        {primaryEntry && (
          <ColorTile
            name={primaryEntry[0]}
            hex={primaryEntry[1]}
            size="hero"
          />
        )}
        <div className="grid grid-cols-2 gap-4">
          {rest.map(([n, h]) => (
            <ColorTile key={n} name={n} hex={h} size="standard" />
          ))}
        </div>
      </div>
    </section>
  );
}

function ColorTile({
  name,
  hex,
  size,
}: {
  name: string;
  hex: string;
  size: "hero" | "standard";
}) {
  const onColor = bestTextOn(hex);
  const onWhite = contrastRatio(hex, "#ffffff");
  const onBlack = contrastRatio(hex, "#000000");
  const heightClass = size === "hero" ? "min-h-[280px]" : "min-h-[140px]";
  return (
    <div
      className={`flex flex-col justify-between p-6 ${heightClass}`}
      style={{ background: hex, color: onColor }}
    >
      <p
        className="text-[11px] uppercase tracking-[0.18em] opacity-70"
        style={{ fontFeatureSettings: '"tnum"' }}
      >
        {name}
      </p>
      <div>
        <p className="text-[18px] md:text-[22px] font-medium tracking-[-0.02em]">
          {hex.toUpperCase()}
        </p>
        <p className="text-[11px] opacity-60 mt-1">
          {onWhite ? `${onWhite.toFixed(2)} on white` : ""}
          {onWhite && onBlack ? " · " : ""}
          {onBlack ? `${onBlack.toFixed(2)} on black` : ""}
        </p>
      </div>
    </div>
  );
}

function TypographySection({
  typography,
  brandName,
}: {
  typography: Record<string, Typography>;
  brandName?: string;
}) {
  const sample = brandName ?? "The quick brown fox jumps";
  const longSample =
    "Typography is the discipline of rendering language visible. Spacing, weight, and rhythm carry meaning long before words are read.";
  return (
    <section>
      <SectionTitle eyebrow="Specimen">Typography</SectionTitle>
      <div className="flex flex-col">
        {Object.entries(typography).map(([name, t], i) => {
          const isBody = /body|paragraph|p\b/i.test(name);
          const fontStack = t.fontFamily
            ? `"${t.fontFamily}", system-ui, sans-serif`
            : undefined;
          return (
            <div
              key={name}
              className={`grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 md:gap-12 py-8 ${i > 0 ? "border-t border-black/[0.06]" : ""}`}
            >
              <div>
                <p className="text-[12px] font-medium text-black">{name}</p>
                <p className="text-[12px] text-[#999] mt-1">
                  {t.fontFamily ?? "—"}
                </p>
                <p className="text-[11px] text-[#bbb] mt-1">
                  {t.fontSize ?? ""}
                  {t.fontWeight ? ` · ${t.fontWeight}` : ""}
                  {t.lineHeight ? ` · LH ${t.lineHeight}` : ""}
                </p>
              </div>
              <p
                className="text-black"
                style={{
                  fontFamily: fontStack,
                  fontSize: t.fontSize,
                  fontWeight: t.fontWeight,
                  lineHeight: t.lineHeight,
                  letterSpacing: t.letterSpacing,
                }}
              >
                {isBody ? longSample : sample}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ShapeSpacingSection({
  rounded,
  spacing,
}: {
  rounded?: Record<string, string>;
  spacing?: Record<string, string | number>;
}) {
  return (
    <section>
      <SectionTitle eyebrow="Geometry">Shape & spacing</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {rounded && (
          <div>
            <p className="text-[12px] text-[#999] uppercase tracking-[0.15em] mb-5">
              Rounded
            </p>
            <div className="flex flex-wrap gap-5">
              {Object.entries(rounded).map(([name, value]) => (
                <div
                  key={name}
                  className="flex flex-col gap-2 items-start"
                >
                  <div
                    className="w-[80px] h-[80px] bg-black"
                    style={{ borderRadius: value }}
                  />
                  <div>
                    <p className="text-[13px] text-black">{name}</p>
                    <p className="text-[11px] text-[#999]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {spacing && (
          <div>
            <p className="text-[12px] text-[#999] uppercase tracking-[0.15em] mb-5">
              Spacing
            </p>
            <SpacingBars spacing={spacing} />
          </div>
        )}
      </div>
    </section>
  );
}

function SpacingBars({
  spacing,
}: {
  spacing: Record<string, string | number>;
}) {
  const max = Math.max(
    ...Object.values(spacing).map((v) => parseFloat(String(v)) || 0),
    1,
  );
  return (
    <div className="flex flex-col gap-3">
      {Object.entries(spacing).map(([name, value]) => {
        const numeric = parseFloat(String(value)) || 0;
        const pct = (numeric / max) * 100;
        return (
          <div key={name} className="flex items-center gap-4">
            <p className="w-[40px] text-[13px] text-black font-medium">
              {name}
            </p>
            <p className="w-[60px] text-[11px] text-[#999]">
              {typeof value === "number" ? `${value}px` : value}
            </p>
            <div className="flex-1 h-2 bg-black/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-black rounded-full"
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComponentsSection({
  components,
  frontmatter,
}: {
  components: NonNullable<DesignSystem["frontmatter"]["components"]>;
  frontmatter: DesignSystem["frontmatter"];
}) {
  return (
    <section>
      <SectionTitle eyebrow="Tokens in context">Components</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Object.entries(components).map(([name, tokens]) => (
          <ComponentCard
            key={name}
            name={name}
            tokens={tokens}
            frontmatter={frontmatter}
          />
        ))}
      </div>
    </section>
  );
}

function ComponentCard({
  name,
  tokens,
  frontmatter,
}: {
  name: string;
  tokens: Record<string, string>;
  frontmatter: DesignSystem["frontmatter"];
}) {
  const bg = resolveToken(tokens.backgroundColor, frontmatter);
  const fg = resolveToken(tokens.textColor, frontmatter);
  const radius = resolveToken(tokens.rounded, frontmatter);
  const isButton = /button|cta|btn/i.test(name);
  const fontStack = frontmatter.typography?.["body-md"]?.fontFamily
    ? `"${frontmatter.typography["body-md"].fontFamily}", system-ui, sans-serif`
    : undefined;

  return (
    <div className="border border-black/[0.06] bg-white">
      <div
        className="min-h-[160px] flex items-center justify-center p-10"
        style={{ background: "#fafafa" }}
      >
        {isButton ? (
          <span
            className="inline-flex items-center justify-center text-[15px] font-medium"
            style={{
              background: bg ?? "#000",
              color: fg ?? "#fff",
              borderRadius: radius ?? "4px",
              padding: tokens.padding ?? "12px 24px",
              fontFamily: fontStack,
              fontWeight: 500,
            }}
          >
            {humanize(name)}
          </span>
        ) : (
          <div
            className="w-full max-w-[260px] h-[80px] flex items-center justify-center text-[14px]"
            style={{
              background: bg ?? "#eee",
              color: fg ?? "#000",
              borderRadius: radius ?? "4px",
              fontFamily: fontStack,
            }}
          >
            {humanize(name)}
          </div>
        )}
      </div>
      <div className="px-5 py-4 border-t border-black/[0.06]">
        <p className="text-[13px] font-medium text-black mb-2">{name}</p>
        <ul className="text-[11px] text-[#777] flex flex-col gap-0.5 font-mono">
          {Object.entries(tokens).map(([k, v]) => (
            <li key={k}>
              <span className="text-[#bbb]">{k}:</span> {String(v)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function humanize(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function ProseSection({
  sections,
}: {
  sections: { heading: string; body: string }[];
}) {
  return (
    <section>
      <SectionTitle eyebrow="Notes">Brand notes</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {sections.map((s, i) => (
          <div key={i}>
            <h3 className="text-[14px] font-medium text-black mb-3 uppercase tracking-[0.1em]">
              {s.heading}
            </h3>
            <div
              className="text-[15px] text-[#5b5b5b] leading-[1.65]"
              dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(s.body) }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function renderInlineMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="bg-black/[0.04] px-1 rounded text-[13px] font-mono">$1</code>')
    .replace(
      /\[(.+?)\]\(([^)]+)\)/g,
      '<a href="$2" class="underline underline-offset-2 hover:text-black" target="_blank" rel="noopener noreferrer">$1</a>',
    )
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/(?:^|\n)- (.+)/g, "<br/>• $1");
}

function collectFontFamilies(
  typography: Record<string, Typography> | undefined,
): string[] {
  if (!typography) return [];
  const set = new Set<string>();
  for (const t of Object.values(typography)) {
    if (t.fontFamily) set.add(t.fontFamily);
  }
  return [...set];
}

function buildGoogleFontsUrl(families: string[]): string {
  const params = families
    .map(
      (f) =>
        `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@300;400;500;600;700`,
    )
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

function bestTextOn(hex: string): string {
  const onWhite = contrastRatio(hex, "#ffffff") ?? 0;
  const onBlack = contrastRatio(hex, "#000000") ?? 0;
  return onBlack > onWhite ? "#000000" : "#ffffff";
}
