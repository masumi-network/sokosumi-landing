import type { CheerioAPI } from "cheerio";

export type SiteSignal = {
  url: string;
  meta: {
    siteName?: string;
    title?: string;
    description?: string;
    themeColor?: string;
    ogImage?: string;
  };
  colors: {
    explicit: string[];
    cssVars: { name: string; value: string }[];
    tailwindArbitrary: string[];
    inlineHero: string[];
    frequencyTop: { hex: string; count: number }[];
  };
  typography: {
    googleFonts: string[];
    declaredFamilies: string[];
    headingSamples: string[];
  };
  geometry: {
    radii: { value: string; count: number }[];
    containerMaxWidths: string[];
    shadows: string[];
  };
  components: {
    primaryButton?: { text: string; classes?: string };
    secondaryButton?: { text: string; classes?: string };
    headerNav?: string;
    heroHeading?: string;
    heroCopy?: string;
  };
};

export function preprocessSite(
  url: string,
  $: CheerioAPI,
  rawHtml: string,
  rawCss: string,
): SiteSignal {
  const meta = extractMeta($);
  const colors = extractColors($, rawHtml, rawCss);
  const typography = extractTypography($, rawCss);
  const geometry = extractGeometry(rawCss);
  const components = extractComponents($);
  return { url, meta, colors, typography, geometry, components };
}

function extractMeta($: CheerioAPI) {
  return {
    siteName: $('meta[property="og:site_name"]').attr("content") ?? undefined,
    title: $("title").first().text().trim() || undefined,
    description:
      $('meta[name="description"]').attr("content") ??
      $('meta[property="og:description"]').attr("content") ??
      undefined,
    themeColor: $('meta[name="theme-color"]').attr("content") ?? undefined,
    ogImage: $('meta[property="og:image"]').attr("content") ?? undefined,
  };
}

const HEX_RE = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g;
const RGB_RE = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/g;
const CSS_VAR_RE =
  /(--[a-zA-Z0-9-_]+)\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsl[a]?\([^)]+\))/g;
const TAILWIND_HEX_CLASS_RE =
  /(?:bg|text|border|from|to|via|fill|stroke)-\[#([0-9a-fA-F]{3,8})\]/g;

function extractColors($: CheerioAPI, html: string, css: string) {
  const explicit = new Set<string>();
  const cssVars: { name: string; value: string }[] = [];
  const tailwindArbitrary = new Set<string>();
  const inlineHero = new Set<string>();
  const counts = new Map<string, number>();

  let m: RegExpExecArray | null;

  while ((m = CSS_VAR_RE.exec(css))) {
    const value = m[2].trim();
    cssVars.push({ name: m[1], value });
    if (value.startsWith("#")) explicit.add(normalizeHex(value));
  }

  while ((m = TAILWIND_HEX_CLASS_RE.exec(html))) {
    const hex = normalizeHex("#" + m[1]);
    tailwindArbitrary.add(hex);
    explicit.add(hex);
  }

  $("[style]").each((_, el) => {
    const style = $(el).attr("style") ?? "";
    const matches = style.match(HEX_RE) ?? [];
    for (const hex of matches) {
      inlineHero.add(normalizeHex(hex));
    }
  });

  const text = html + "\n" + css;
  HEX_RE.lastIndex = 0;
  while ((m = HEX_RE.exec(text))) {
    const hex = normalizeHex(m[0]);
    if (isInteresting(hex)) counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  RGB_RE.lastIndex = 0;
  while ((m = RGB_RE.exec(text))) {
    const hex = rgbToHex(Number(m[1]), Number(m[2]), Number(m[3]));
    if (isInteresting(hex)) counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }

  const frequencyTop = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([hex, count]) => ({ hex, count }));

  return {
    explicit: [...explicit].slice(0, 16),
    cssVars: cssVars.slice(0, 24),
    tailwindArbitrary: [...tailwindArbitrary].slice(0, 16),
    inlineHero: [...inlineHero].slice(0, 16),
    frequencyTop,
  };
}

function isInteresting(hex: string): boolean {
  const lower = hex.toLowerCase();
  if (lower === "#000000" || lower === "#ffffff") return false;
  if (lower === "#fff" || lower === "#000") return false;
  return true;
}

function normalizeHex(hex: string): string {
  const m = hex.replace("#", "");
  if (m.length === 3) {
    return ("#" + m[0] + m[0] + m[1] + m[1] + m[2] + m[2]).toLowerCase();
  }
  if (m.length === 4) {
    return ("#" + m[0] + m[0] + m[1] + m[1] + m[2] + m[2]).toLowerCase();
  }
  return ("#" + m.slice(0, 6)).toLowerCase();
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return ("#" + toHex(r) + toHex(g) + toHex(b)).toLowerCase();
}

function extractTypography($: CheerioAPI, css: string) {
  const googleFonts = new Set<string>();
  $('link[href*="fonts.googleapis.com"][href]').each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const re = /family=([^&:]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(href))) {
      googleFonts.add(decodeURIComponent(m[1]).replace(/\+/g, " "));
    }
  });

  const declared = new Set<string>();
  const re = /font-family\s*:\s*([^;}\n]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const first = m[1].split(",")[0].trim().replace(/^['"]|['"]$/g, "");
    if (
      first &&
      first.length < 60 &&
      !/^(sans-serif|serif|monospace|system-ui|inherit|initial|unset|var\()/i.test(
        first,
      )
    ) {
      declared.add(first);
    }
  }

  const headingSamples: string[] = [];
  $("h1, h2").each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, " ");
    if (text && text.length < 200) headingSamples.push(text);
  });

  return {
    googleFonts: [...googleFonts].slice(0, 6),
    declaredFamilies: [...declared].slice(0, 8),
    headingSamples: headingSamples.slice(0, 4),
  };
}

function extractGeometry(css: string) {
  const radiusCounts = new Map<string, number>();
  const radiusRe = /border-radius\s*:\s*([^;}\n]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = radiusRe.exec(css))) {
    const value = m[1].trim().split(/\s+/)[0];
    if (!/^[0-9.]+(px|em|rem|%)$/.test(value)) continue;
    if (value === "0" || value === "0px") continue;
    radiusCounts.set(value, (radiusCounts.get(value) ?? 0) + 1);
  }
  const radii = [...radiusCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([value, count]) => ({ value, count }));

  const widths = new Set<string>();
  const widthRe = /max-width\s*:\s*([0-9]+px|[0-9.]+rem)/gi;
  while ((m = widthRe.exec(css))) {
    const value = m[1];
    const px = parseFloat(value);
    if (px >= 800 && px <= 1600) widths.add(value);
  }

  const shadows = new Set<string>();
  const shadowRe = /box-shadow\s*:\s*([^;}\n]+)/gi;
  while ((m = shadowRe.exec(css))) {
    const value = m[1].trim();
    if (value !== "none" && value.length < 120) shadows.add(value);
  }

  return {
    radii,
    containerMaxWidths: [...widths].slice(0, 6),
    shadows: [...shadows].slice(0, 6),
  };
}

function extractComponents($: CheerioAPI) {
  const heroHeading = $("h1").first().text().trim().replace(/\s+/g, " ");
  const heroCopy = $("h1").first().nextAll("p").first().text().trim().slice(0, 240);

  let primaryButton: { text: string; classes?: string } | undefined;
  let secondaryButton: { text: string; classes?: string } | undefined;

  $("a, button").each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim().replace(/\s+/g, " ");
    if (!text || text.length > 40) return;
    const classes = $el.attr("class") ?? "";
    const lower = (text + " " + classes).toLowerCase();
    const looksPrimary =
      /\b(get started|sign up|start free|try|book|buy|subscribe|join|launch)\b/.test(
        text.toLowerCase(),
      ) || /(primary|cta|brand)/.test(classes);
    const looksSecondary =
      /\b(learn more|read|see|view|contact|docs|sign in|log in)\b/.test(
        text.toLowerCase(),
      ) || /(secondary|outline|ghost)/.test(classes);

    if (looksPrimary && !primaryButton) {
      primaryButton = { text, classes: classes.slice(0, 200) || undefined };
    } else if (looksSecondary && !secondaryButton) {
      secondaryButton = { text, classes: classes.slice(0, 200) || undefined };
    }
  });

  const headerNav = $("header, nav").first().text().trim().replace(/\s+/g, " ").slice(0, 240);

  return {
    primaryButton,
    secondaryButton,
    headerNav: headerNav || undefined,
    heroHeading: heroHeading || undefined,
    heroCopy: heroCopy || undefined,
  };
}

export function signalToMarkdown(signal: SiteSignal): string {
  const lines: string[] = [];
  lines.push(`## Site`);
  lines.push(`URL: ${signal.url}`);
  if (signal.meta.siteName) lines.push(`Site name: ${signal.meta.siteName}`);
  if (signal.meta.title) lines.push(`Title: ${signal.meta.title}`);
  if (signal.meta.description) lines.push(`Description: ${signal.meta.description}`);
  if (signal.meta.themeColor) lines.push(`Theme color (meta): ${signal.meta.themeColor}`);
  if (signal.meta.ogImage) lines.push(`OG image: ${signal.meta.ogImage}`);

  lines.push(`\n## Colors observed`);
  if (signal.colors.cssVars.length) {
    lines.push(`CSS custom properties:`);
    for (const v of signal.colors.cssVars) lines.push(`  ${v.name}: ${v.value}`);
  }
  if (signal.colors.tailwindArbitrary.length) {
    lines.push(`Tailwind arbitrary hex classes: ${signal.colors.tailwindArbitrary.join(", ")}`);
  }
  if (signal.colors.inlineHero.length) {
    lines.push(`Inline-style hex (hero/header): ${signal.colors.inlineHero.join(", ")}`);
  }
  if (signal.colors.frequencyTop.length) {
    lines.push(
      `Top by frequency: ${signal.colors.frequencyTop.map((c) => `${c.hex} (${c.count})`).join(", ")}`,
    );
  }

  lines.push(`\n## Typography observed`);
  if (signal.typography.googleFonts.length) {
    lines.push(`Google Fonts loaded: ${signal.typography.googleFonts.join(", ")}`);
  }
  if (signal.typography.declaredFamilies.length) {
    lines.push(`CSS font-family declarations: ${signal.typography.declaredFamilies.join(", ")}`);
  }
  if (signal.typography.headingSamples.length) {
    lines.push(`Heading samples: ${signal.typography.headingSamples.map((s) => `"${s}"`).join(" · ")}`);
  }

  lines.push(`\n## Geometry observed`);
  if (signal.geometry.radii.length) {
    lines.push(
      `Border-radius (frequency): ${signal.geometry.radii.map((r) => `${r.value} (${r.count})`).join(", ")}`,
    );
  }
  if (signal.geometry.containerMaxWidths.length) {
    lines.push(`Container max-widths: ${signal.geometry.containerMaxWidths.join(", ")}`);
  }
  if (signal.geometry.shadows.length) {
    lines.push(`Box-shadows: ${signal.geometry.shadows.slice(0, 3).join(" | ")}`);
  }

  lines.push(`\n## Components observed`);
  if (signal.components.heroHeading) lines.push(`H1: "${signal.components.heroHeading}"`);
  if (signal.components.heroCopy) lines.push(`Hero copy: "${signal.components.heroCopy}"`);
  if (signal.components.primaryButton)
    lines.push(`Primary CTA: "${signal.components.primaryButton.text}"`);
  if (signal.components.secondaryButton)
    lines.push(`Secondary CTA: "${signal.components.secondaryButton.text}"`);

  return lines.join("\n");
}
