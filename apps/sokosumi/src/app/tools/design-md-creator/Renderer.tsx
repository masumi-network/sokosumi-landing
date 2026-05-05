"use client";

import { useEffect } from "react";
import type { DesignSystem, Typography } from "./lib/design-md";
import { contrastRatio, resolveToken } from "./lib/design-md";

export default function Renderer({ system }: { system: DesignSystem }) {
  const fm = system.frontmatter;

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
    <div className="flex flex-col gap-16">
      <Header name={fm.name} description={fm.description} />
      {fm.colors && Object.keys(fm.colors).length > 0 && (
        <ColorsSection colors={fm.colors} />
      )}
      {fm.typography && Object.keys(fm.typography).length > 0 && (
        <TypographySection typography={fm.typography} />
      )}
      {fm.rounded && Object.keys(fm.rounded).length > 0 && (
        <RoundedSection rounded={fm.rounded} />
      )}
      {fm.spacing && Object.keys(fm.spacing).length > 0 && (
        <SpacingSection spacing={fm.spacing} />
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

function Header({ name, description }: { name?: string; description?: string }) {
  return (
    <header>
      <p className="text-[14px] text-[#999] uppercase tracking-[0.15em] mb-4">
        Design system
      </p>
      <h1 className="text-[40px] md:text-[56px] font-normal tracking-[-0.8px] leading-[1.1] text-black">
        {name ?? "Untitled"}
      </h1>
      {description && (
        <p className="mt-4 text-[18px] text-[#5b5b5b] leading-[1.4] max-w-[600px]">
          {description}
        </p>
      )}
    </header>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[24px] md:text-[32px] font-normal tracking-[-0.4px] text-black mb-8">
      {children}
    </h2>
  );
}

function ColorsSection({ colors }: { colors: Record<string, string> }) {
  return (
    <section>
      <SectionTitle>Colors</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(colors).map(([name, hex]) => (
          <ColorSwatch key={name} name={name} hex={hex} />
        ))}
      </div>
    </section>
  );
}

function ColorSwatch({ name, hex }: { name: string; hex: string }) {
  const onWhite = contrastRatio(hex, "#ffffff");
  const onBlack = contrastRatio(hex, "#000000");
  return (
    <div className="flex flex-col gap-3">
      <div
        className="aspect-[4/3] w-full rounded-[6px] border border-black/[0.08]"
        style={{ background: hex }}
      />
      <div>
        <p className="text-[14px] font-medium text-black">{name}</p>
        <p className="text-[12px] text-[#999] uppercase tracking-[0.05em]">{hex}</p>
        <p className="text-[11px] text-[#bbb] mt-1">
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
}: {
  typography: Record<string, Typography>;
}) {
  return (
    <section>
      <SectionTitle>Typography</SectionTitle>
      <div className="flex flex-col gap-6 border-t border-black/[0.06]">
        {Object.entries(typography).map(([name, t]) => (
          <div
            key={name}
            className="flex flex-col md:flex-row md:items-baseline md:gap-12 py-6 border-b border-black/[0.06]"
          >
            <div className="md:w-[180px] flex-shrink-0">
              <p className="text-[14px] font-medium text-black">{name}</p>
              <p className="text-[12px] text-[#999] mt-1">
                {t.fontFamily ?? "—"}
              </p>
              <p className="text-[11px] text-[#bbb] mt-1">
                {t.fontSize ?? ""}
                {t.fontWeight ? ` · ${t.fontWeight}` : ""}
              </p>
            </div>
            <p
              className="text-black mt-3 md:mt-0"
              style={{
                fontFamily: t.fontFamily ? `"${t.fontFamily}", system-ui, sans-serif` : undefined,
                fontSize: t.fontSize,
                fontWeight: t.fontWeight,
                lineHeight: t.lineHeight,
                letterSpacing: t.letterSpacing,
              }}
            >
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RoundedSection({ rounded }: { rounded: Record<string, string> }) {
  return (
    <section>
      <SectionTitle>Rounded</SectionTitle>
      <div className="flex flex-wrap gap-6">
        {Object.entries(rounded).map(([name, value]) => (
          <div key={name} className="flex flex-col gap-2 items-start">
            <div
              className="w-[88px] h-[88px] bg-black/[0.04] border border-black/[0.08]"
              style={{ borderRadius: value }}
            />
            <p className="text-[13px] text-black">{name}</p>
            <p className="text-[12px] text-[#999]">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SpacingSection({
  spacing,
}: {
  spacing: Record<string, string | number>;
}) {
  const max = Math.max(
    ...Object.values(spacing).map((v) => parseFloat(String(v)) || 0),
  );
  return (
    <section>
      <SectionTitle>Spacing</SectionTitle>
      <div className="flex flex-col gap-3">
        {Object.entries(spacing).map(([name, value]) => {
          const numeric = parseFloat(String(value)) || 0;
          const pct = max > 0 ? (numeric / max) * 100 : 0;
          return (
            <div key={name} className="flex items-center gap-4">
              <p className="w-[60px] text-[13px] text-black">{name}</p>
              <p className="w-[80px] text-[12px] text-[#999]">
                {typeof value === "number" ? `${value}px` : value}
              </p>
              <div
                className="h-2 bg-black/80 rounded-full"
                style={{ width: `${Math.max(pct, 4)}%` }}
              />
            </div>
          );
        })}
      </div>
    </section>
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
      <SectionTitle>Components</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(components).map(([name, tokens]) => {
          const bg = resolveToken(tokens.backgroundColor, frontmatter);
          const fg = resolveToken(tokens.textColor, frontmatter);
          const radius = resolveToken(tokens.rounded, frontmatter);
          const isButton = /button|cta|btn/i.test(name);
          return (
            <div
              key={name}
              className="border border-black/[0.06] p-8 flex flex-col gap-4 bg-white"
            >
              <p className="text-[13px] text-[#999]">{name}</p>
              <div className="min-h-[80px] flex items-center justify-center bg-[#fafafa] py-8 px-4 rounded-[4px]">
                {isButton ? (
                  <span
                    className="inline-flex items-center justify-center text-[14px] font-medium"
                    style={{
                      background: bg ?? "#000",
                      color: fg ?? "#fff",
                      borderRadius: radius ?? "4px",
                      padding: tokens.padding ?? "12px 24px",
                    }}
                  >
                    {name.replace(/-/g, " ")}
                  </span>
                ) : (
                  <div
                    className="w-full h-[60px]"
                    style={{
                      background: bg ?? "#eee",
                      borderRadius: radius ?? "4px",
                    }}
                  />
                )}
              </div>
              <ul className="text-[12px] text-[#777] flex flex-col gap-1">
                {Object.entries(tokens).map(([k, v]) => (
                  <li key={k}>
                    <span className="text-[#bbb]">{k}:</span> {String(v)}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProseSection({
  sections,
}: {
  sections: { heading: string; body: string }[];
}) {
  return (
    <section>
      <SectionTitle>Notes</SectionTitle>
      <div className="flex flex-col gap-8">
        {sections.map((s, i) => (
          <div key={i}>
            <h3 className="text-[18px] font-medium text-black mb-3">
              {s.heading}
            </h3>
            <div
              className="text-[15px] text-[#5b5b5b] leading-[1.6] whitespace-pre-wrap"
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
    .replace(/`(.+?)`/g, '<code class="bg-black/[0.04] px-1 rounded text-[13px]">$1</code>')
    .replace(
      /\[(.+?)\]\(([^)]+)\)/g,
      '<a href="$2" class="underline underline-offset-2 hover:text-black" target="_blank" rel="noopener noreferrer">$1</a>',
    );
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

