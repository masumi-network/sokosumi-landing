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

  const findSection = (re: RegExp) =>
    system.sections.find((s) => re.test(s.heading));
  const overview = findSection(/^overview\b/i);
  const colorsProse = findSection(/^colors?\b/i);
  const typographyProse = findSection(/^typography\b/i);
  const layoutProse = findSection(/^layout\b/i);
  const elevationProse = findSection(/^elevation/i);
  const shapesProse = findSection(/^shapes?\b/i);
  const componentsProse = findSection(/^components?\b/i);
  const dosAndDonts = findSection(/do.*don.*t/i);

  return (
    <div className="flex flex-col gap-20">
      <BrandHero
        name={fm.name}
        description={fm.description}
        logo={fm.logo}
        primary={primary}
        headingFont={headingFont}
      />
      {overview && <OverviewSection section={overview} />}
      {fm.colors && Object.keys(fm.colors).length > 0 && (
        <ColorsSection colors={fm.colors} usageNote={colorsProse?.body} />
      )}
      {fm.typography && Object.keys(fm.typography).length > 0 && (
        <TypographySection
          typography={fm.typography}
          brandName={fm.name}
          notes={typographyProse?.body}
        />
      )}
      {(fm.layout || fm.spacing) && (
        <LayoutSection
          layout={fm.layout}
          spacing={fm.spacing}
          notes={layoutProse?.body}
        />
      )}
      {fm.elevation && Object.keys(fm.elevation).length > 0 && (
        <ElevationSection elevation={fm.elevation} notes={elevationProse?.body} />
      )}
      {fm.rounded && Object.keys(fm.rounded).length > 0 && (
        <ShapesSection rounded={fm.rounded} notes={shapesProse?.body} />
      )}
      {fm.components && Object.keys(fm.components).length > 0 && (
        <ComponentsSection
          components={fm.components}
          frontmatter={fm}
          notes={componentsProse?.body}
        />
      )}
      {dosAndDonts && <DosAndDontsSection body={dosAndDonts.body} />}
      <SpecFooter />
    </div>
  );
}

function SpecFooter() {
  return (
    <footer className="pt-10 mt-4 border-t border-black/[0.06]">
      <p className="text-[12px] text-[#999] leading-[1.6]">
        Output follows the canonical{" "}
        <a
          href="https://github.com/google-labs-code/design.md"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-black"
        >
          DESIGN.md
        </a>{" "}
        section order (Overview → Colors → Typography → Layout → Elevation →
        Shapes → Components → Do&apos;s and Don&apos;ts). Fields like{" "}
        <code className="font-mono text-[11px]">elevation</code>,{" "}
        <code className="font-mono text-[11px]">layout</code>, and{" "}
        <code className="font-mono text-[11px]">logo</code> are non-standard
        extensions, accepted under the spec&apos;s &quot;unknown content&quot;
        rule for forward-compatibility.
      </p>
    </footer>
  );
}

function BrandHero({
  name,
  description,
  logo,
  primary,
  headingFont,
}: {
  name?: string;
  description?: string;
  logo?: { src: string; srcDark?: string; alt?: string };
  primary?: string;
  headingFont?: string;
}) {
  const fontStack = headingFont
    ? `"${headingFont}", system-ui, sans-serif`
    : undefined;
  const onPrimary = primary ? bestTextOn(primary) : "#000";
  // Pick light vs dark logo variant based on background
  const logoSrc =
    logo &&
    (onPrimary === "#ffffff" && logo.src
      ? logo.src
      : onPrimary === "#000000" && logo.srcDark
        ? logo.srcDark
        : logo.src);

  return (
    <header className="relative overflow-hidden border border-black/[0.06]">
      <div
        className="px-8 py-16 md:px-14 md:py-24"
        style={{ background: primary ?? "#0a0a0a", color: onPrimary }}
      >
        {logoSrc && (
          <div className="mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt={logo?.alt ?? `${name ?? ""} logo`}
              className="max-h-[56px] w-auto"
              style={{ filter: onPrimary === "#000000" ? undefined : undefined }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
        <p
          className="text-[12px] uppercase tracking-[0.2em] mb-6 opacity-70"
          style={{ fontFamily: fontStack }}
        >
          Design system
        </p>
        <h1
          className="text-[36px] sm:text-[48px] md:text-[88px] leading-[0.95] tracking-[-0.04em] break-words"
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

function ColorsSection({
  colors,
  usageNote,
}: {
  colors: Record<string, string>;
  usageNote?: string;
}) {
  const groups = groupM3Colors(colors);
  const featured = ["primary", "secondary", "tertiary"]
    .map((k) => [k, colors[k]] as const)
    .filter((p): p is readonly [string, string] => typeof p[1] === "string");

  return (
    <section>
      <SectionTitle eyebrow="Palette">Colors</SectionTitle>

      {/* Hero row: the three brand-defining accents */}
      {featured.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {featured.map(([name, hex]) => (
            <ColorTile key={name} name={name} hex={hex} size="hero" />
          ))}
        </div>
      )}

      {/* Grouped M3 token ramps */}
      <div className="flex flex-col gap-10">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-[12px] text-[#999] uppercase tracking-[0.18em] font-mono mb-3">
              {group.label}
              <span className="text-[#ccc] ml-2 normal-case tracking-normal font-sans">
                {group.tokens.length} tokens
              </span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {group.tokens.map(([name, hex]) => (
                <ColorTile key={name} name={name} hex={hex} size="mini" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {usageNote && (
        <div
          className="mt-10 text-[15px] text-[#5b5b5b] leading-[1.65] max-w-[680px]"
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(usageNote) }}
        />
      )}
    </section>
  );
}

type ColorGroup = { label: string; tokens: [string, string][] };

function groupM3Colors(colors: Record<string, string>): ColorGroup[] {
  const used = new Set<string>(["primary", "secondary", "tertiary"]);
  const pick = (predicate: (key: string) => boolean): [string, string][] => {
    const out: [string, string][] = [];
    for (const [name, hex] of Object.entries(colors)) {
      if (used.has(name)) continue;
      if (predicate(name)) {
        used.add(name);
        out.push([name, hex]);
      }
    }
    return out;
  };

  const groups: ColorGroup[] = [
    {
      label: "Surface stack",
      tokens: pick(
        (k) =>
          k === "surface" ||
          k.startsWith("surface-") ||
          k === "background" ||
          k === "on-background",
      ),
    },
    {
      label: "Primary family",
      tokens: [
        ["primary", colors.primary],
        ...pick((k) => k.startsWith("primary-") || k.startsWith("on-primary") || k === "inverse-primary"),
      ].filter((p): p is [string, string] => typeof p[1] === "string"),
    },
    {
      label: "Secondary family",
      tokens: [
        ["secondary", colors.secondary],
        ...pick((k) => k.startsWith("secondary-") || k.startsWith("on-secondary")),
      ].filter((p): p is [string, string] => typeof p[1] === "string"),
    },
    {
      label: "Tertiary family",
      tokens: [
        ["tertiary", colors.tertiary],
        ...pick((k) => k.startsWith("tertiary-") || k.startsWith("on-tertiary")),
      ].filter((p): p is [string, string] => typeof p[1] === "string"),
    },
    {
      label: "Error",
      tokens: pick((k) => k === "error" || k.startsWith("error-") || k.startsWith("on-error")),
    },
    {
      label: "Outline & utility",
      tokens: pick(
        (k) => k.startsWith("outline") || k === "surface-tint" || k.startsWith("on-surface") || k.startsWith("inverse-"),
      ),
    },
    {
      label: "Other",
      tokens: pick(() => true), // anything left over
    },
  ];

  // Drop empty groups; also drop "Primary family" if it's just the primary
  // we already showed in the hero row alone.
  return groups.filter((g) => g.tokens.length > 0);
}

function OverviewSection({
  section,
}: {
  section: { heading: string; body: string };
}) {
  return (
    <section>
      <SectionTitle eyebrow="The brand">Overview</SectionTitle>
      <div
        className="text-[18px] md:text-[20px] text-[#222] leading-[1.5] max-w-[680px]"
        dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(section.body) }}
      />
    </section>
  );
}

function DosAndDontsSection({ body }: { body: string }) {
  const { dos, donts } = parseDosAndDonts(body);
  return (
    <section>
      <SectionTitle eyebrow="Rules of the brand">
        Do&apos;s &amp; Don&apos;ts
      </SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RuleColumn
          variant="do"
          items={dos}
          title="Do"
        />
        <RuleColumn
          variant="dont"
          items={donts}
          title="Don't"
        />
      </div>
    </section>
  );
}

function RuleColumn({
  variant,
  items,
  title,
}: {
  variant: "do" | "dont";
  items: string[];
  title: string;
}) {
  if (items.length === 0) return null;
  const accent = variant === "do" ? "#0a8a3a" : "#B8422E";
  const symbol = variant === "do" ? "+" : "−";
  return (
    <div className="border border-black/[0.06] p-7">
      <p
        className="text-[12px] uppercase tracking-[0.18em] mb-5"
        style={{ color: accent }}
      >
        {title}
      </p>
      <ul className="flex flex-col gap-4">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-[15px] text-black leading-[1.5]">
            <span
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[12px] font-medium mt-[2px]"
              style={{ background: accent + "1f", color: accent }}
            >
              {symbol}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function parseDosAndDonts(body: string): { dos: string[]; donts: string[] } {
  const dos: string[] = [];
  const donts: string[] = [];
  let current: "do" | "dont" | null = null;
  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^\*\*\s*do\s*\*\*$/i.test(line) || /^do\b/i.test(line.replace(/[*_]/g, ""))) {
      current = "do";
      continue;
    }
    if (/^\*\*\s*don.?t\s*\*\*$/i.test(line) || /^don.?t\b/i.test(line.replace(/[*_]/g, ""))) {
      current = "dont";
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const text = line.replace(/^[-*]\s+/, "").trim();
      if (current === "do") dos.push(text);
      else if (current === "dont") donts.push(text);
    }
  }
  return { dos, donts };
}

function ElevationSection({
  elevation,
  notes,
}: {
  elevation: Record<string, string>;
  notes?: string;
}) {
  return (
    <section>
      <SectionTitle eyebrow="Depth">Elevation &amp; Depth</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {Object.entries(elevation).map(([name, value]) => (
          <div key={name} className="flex flex-col gap-3">
            <div
              className="h-[120px] bg-white rounded-[10px]"
              style={{ boxShadow: value }}
            />
            <div>
              <p className="text-[13px] font-medium text-black">{name}</p>
              <p className="text-[11px] text-[#999] font-mono break-words mt-1">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
      {notes && (
        <p className="mt-8 text-[15px] text-[#5b5b5b] leading-[1.65] max-w-[640px]">
          {notes}
        </p>
      )}
    </section>
  );
}

function LayoutSection({
  layout,
  spacing,
  notes,
}: {
  layout?: { containerMaxWidth?: string; gridColumns?: number };
  spacing?: Record<string, string | number>;
  notes?: string;
}) {
  const hasContainer = layout?.containerMaxWidth || layout?.gridColumns;
  return (
    <section>
      <SectionTitle eyebrow="Structure">Layout</SectionTitle>
      {hasContainer && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          {layout?.containerMaxWidth && (
            <div>
              <p className="text-[12px] text-[#999] uppercase tracking-[0.15em] mb-4">
                Container
              </p>
              <div className="relative h-[120px] bg-black/[0.03] rounded-[6px] overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 bg-black/[0.08] border-l border-r border-black/10"
                  style={{
                    width: `min(100%, ${layout.containerMaxWidth})`,
                  }}
                />
              </div>
              <p className="mt-3 text-[13px] text-black">
                Max width:{" "}
                <span className="font-mono">{layout.containerMaxWidth}</span>
              </p>
            </div>
          )}
          {layout?.gridColumns && (
            <div>
              <p className="text-[12px] text-[#999] uppercase tracking-[0.15em] mb-4">
                Grid
              </p>
              <div
                className="grid gap-1 h-[120px]"
                style={{
                  gridTemplateColumns: `repeat(${layout.gridColumns}, 1fr)`,
                }}
              >
                {Array.from({ length: layout.gridColumns }).map((_, i) => (
                  <div key={i} className="bg-black/[0.06] rounded-[2px]" />
                ))}
              </div>
              <p className="mt-3 text-[13px] text-black">
                {layout.gridColumns}-column grid
              </p>
            </div>
          )}
        </div>
      )}
      {spacing && Object.keys(spacing).length > 0 && (
        <div>
          <p className="text-[12px] text-[#999] uppercase tracking-[0.15em] mb-5">
            Spacing scale
          </p>
          <SpacingBars spacing={spacing} />
        </div>
      )}
      {notes && (
        <p className="mt-8 text-[15px] text-[#5b5b5b] leading-[1.65] max-w-[640px]">
          {notes}
        </p>
      )}
    </section>
  );
}

function ShapesSection({
  rounded,
  notes,
}: {
  rounded: Record<string, string>;
  notes?: string;
}) {
  return (
    <section>
      <SectionTitle eyebrow="Geometry">Shapes</SectionTitle>
      <div className="flex flex-wrap gap-6">
        {Object.entries(rounded).map(([name, value]) => (
          <div key={name} className="flex flex-col gap-2 items-start">
            <div
              className="w-[88px] h-[88px] bg-black"
              style={{ borderRadius: value }}
            />
            <div>
              <p className="text-[13px] text-black">{name}</p>
              <p className="text-[11px] text-[#999]">{value}</p>
            </div>
          </div>
        ))}
      </div>
      {notes && (
        <p className="mt-8 text-[15px] text-[#5b5b5b] leading-[1.65] max-w-[640px]">
          {notes}
        </p>
      )}
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
  size: "hero" | "standard" | "mini";
}) {
  const onColor = bestTextOn(hex);
  const onWhite = contrastRatio(hex, "#ffffff");
  const onBlack = contrastRatio(hex, "#000000");

  if (size === "mini") {
    return (
      <div className="flex flex-col gap-1.5">
        <div
          className="aspect-[5/3] rounded-[6px] border border-black/[0.06]"
          style={{ background: hex }}
          title={`${name} — ${hex.toUpperCase()}`}
        />
        <div className="min-w-0">
          <p className="text-[11px] text-black truncate" title={name}>
            {name}
          </p>
          <p className="text-[10px] text-[#999] font-mono">
            {hex.toUpperCase()}
          </p>
        </div>
      </div>
    );
  }

  const heightClass = size === "hero" ? "min-h-[200px]" : "min-h-[140px]";
  return (
    <div
      className={`flex flex-col justify-between p-6 rounded-[8px] ${heightClass}`}
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
  notes,
}: {
  typography: Record<string, Typography>;
  brandName?: string;
  notes?: string;
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
      {notes && (
        <p className="mt-8 text-[15px] text-[#5b5b5b] leading-[1.65] max-w-[640px]">
          {notes}
        </p>
      )}
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
  notes,
}: {
  components: NonNullable<DesignSystem["frontmatter"]["components"]>;
  frontmatter: DesignSystem["frontmatter"];
  notes?: string;
}) {
  const groups = groupComponentVariants(components);
  return (
    <section>
      <SectionTitle eyebrow="Tokens in context">Components</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {groups.map(({ base, variants }) => (
          <ComponentCard
            key={base.name}
            name={base.name}
            tokens={base.tokens}
            variants={variants}
            frontmatter={frontmatter}
          />
        ))}
      </div>
      {notes && (
        <div
          className="mt-8 text-[15px] text-[#5b5b5b] leading-[1.65] max-w-[680px]"
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(notes) }}
        />
      )}
    </section>
  );
}

type ComponentEntry = { name: string; tokens: Record<string, string> };
type ComponentGroup = { base: ComponentEntry; variants: ComponentEntry[] };

function groupComponentVariants(
  components: Record<string, Record<string, string>>,
): ComponentGroup[] {
  const entries = Object.entries(components);
  const map = new Map<string, ComponentGroup>();

  // First pass: register everything that doesn't look like a variant
  const variantSuffix = /-(hover|active|focus|pressed|disabled|selected|open)$/;
  for (const [name, tokens] of entries) {
    if (!variantSuffix.test(name)) {
      map.set(name, { base: { name, tokens }, variants: [] });
    }
  }
  // Second pass: attach variants to their base if it exists
  for (const [name, tokens] of entries) {
    const m = name.match(variantSuffix);
    if (!m) continue;
    const baseName = name.slice(0, -m[0].length);
    const target = map.get(baseName);
    if (target) {
      target.variants.push({ name, tokens });
    } else {
      // Variant without a base — surface as its own card
      map.set(name, { base: { name, tokens }, variants: [] });
    }
  }

  return [...map.values()];
}

function ComponentCard({
  name,
  tokens,
  variants = [],
  frontmatter,
}: {
  name: string;
  tokens: Record<string, string>;
  variants?: { name: string; tokens: Record<string, string> }[];
  frontmatter: DesignSystem["frontmatter"];
}) {
  const isButton = /button|cta|btn/i.test(name);
  const fontStack = frontmatter.typography?.["body-md"]?.fontFamily
    ? `"${frontmatter.typography["body-md"].fontFamily}", system-ui, sans-serif`
    : undefined;

  // Merge base + variant tokens so a hover state inherits unspecified fields
  const states: { label: string; tokens: Record<string, string> }[] = [
    { label: "default", tokens },
    ...variants.map((v) => ({
      label: v.name.split("-").slice(-1)[0],
      tokens: { ...tokens, ...v.tokens },
    })),
  ];

  return (
    <div className="border border-black/[0.06] bg-white">
      <div
        className="min-h-[160px] p-6 md:p-8 flex flex-wrap items-center justify-center gap-4"
        style={{ background: "#fafafa" }}
      >
        {states.map((s, i) => {
          const bg = resolveToken(s.tokens.backgroundColor, frontmatter) ?? s.tokens.backgroundColor;
          const fg = resolveToken(s.tokens.textColor, frontmatter) ?? s.tokens.textColor;
          const radius = resolveToken(s.tokens.rounded, frontmatter) ?? s.tokens.rounded;
          const previewLabel = i === 0 ? humanize(name) : s.label;
          return isButton ? (
            <div
              key={s.label}
              className="flex flex-col items-center gap-2"
            >
              <span
                className="inline-flex items-center justify-center text-[14px] font-medium"
                style={{
                  background: bg ?? "#000",
                  color: fg ?? "#fff",
                  borderRadius: radius ?? "4px",
                  padding: s.tokens.padding ?? "12px 24px",
                  fontFamily: fontStack,
                  fontWeight: 500,
                }}
              >
                {previewLabel}
              </span>
              {i > 0 && (
                <span className="text-[10px] text-[#999] uppercase tracking-[0.15em] font-mono">
                  {s.label}
                </span>
              )}
            </div>
          ) : (
            <div
              key={s.label}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="w-[140px] h-[64px] flex items-center justify-center text-[13px]"
                style={{
                  background: bg ?? "#eee",
                  color: fg ?? "#000",
                  borderRadius: radius ?? "4px",
                  fontFamily: fontStack,
                }}
              >
                {previewLabel}
              </div>
              {i > 0 && (
                <span className="text-[10px] text-[#999] uppercase tracking-[0.15em] font-mono">
                  {s.label}
                </span>
              )}
            </div>
          );
        })}
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
        {variants.length > 0 && (
          <p className="mt-2 text-[10px] text-[#999] uppercase tracking-[0.15em] font-mono">
            {variants.length} state{variants.length > 1 ? "s" : ""}:{" "}
            {variants.map((v) => v.name.split("-").slice(-1)[0]).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

function humanize(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
