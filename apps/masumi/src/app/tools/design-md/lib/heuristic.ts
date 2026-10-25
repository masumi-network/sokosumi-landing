import {
  contrastRatio,
  type ComponentTokens,
  type Frontmatter,
  type Logo,
  type Typography,
} from "./design-md";
import type { SiteSignal } from "./preprocess";
import type { ComputedStyle } from "./render";
import { brandKey } from "./url-guard";

// The no-LLM fallback. Everything here is measured from the page — the
// rendered DOM's computed styles first, the stylesheets second — and a token
// we could not measure is left out rather than filled with a default.

type Prose = { heading: string; body: string }[];

const MONO_RE =
  /mono|menlo|monaco|consolas|courier|lucida console|source code|fira code|jetbrains|^code/i;
const GENERIC_FONT_RE =
  /^(system-ui|-apple-system|blinkmacsystemfont|ui-sans-serif|ui-serif|ui-monospace|ui-rounded|sans-serif|serif|monospace|cursive|fantasy|emoji|math|inherit|initial|unset|var\(.*)$/i;
const MIN_CONTRAST = 4.5;
const DARK_TEXT = "#111111";
const LIGHT_TEXT = "#ffffff";

export function brandName(signal: SiteSignal): string {
  const siteName = signal.meta.siteName?.trim();
  if (siteName) return siteName;

  const url = new URL(signal.url);
  const label = brandKey(url.hostname);
  const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const parts = (signal.meta.title ?? "")
    .split(/\s+[|·–—-]\s+|\s*[|·–—]\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  // A segment that spells the domain is the brand, wherever it sits.
  const match = parts.find((p) => {
    const s = squash(p);
    return s.length > 1 && (label.includes(s) || s.includes(label));
  });
  if (match) return match;
  // A subpage title leads with the page ("About Us | Tartine"), a homepage
  // with the brand. With one segment on a subpage, the domain is safer.
  const isHome = url.pathname.replace(/\/+$/, "") === "";
  if (isHome && parts[0]) return parts[0];
  if (!isHome && parts.length > 1) return parts[parts.length - 1];
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function buildHeuristic(
  signal: SiteSignal,
  css: string,
): { frontmatter: Frontmatter; prose: Prose } {
  const computed = signal.computed ?? {};
  const name = brandName(signal);
  const description = (signal.meta.description ?? "").trim().slice(0, 240);
  const colors = buildColors(signal);
  const typography = buildTypography(signal);
  const rounded = buildRounded(signal);
  const spacing = buildSpacing(css);
  const elevation = Object.fromEntries(
    signal.geometry.shadows.slice(0, 3).map((s, i) => [["sm", "md", "lg"][i], s]),
  );
  const containerMaxWidth = signal.geometry.containerMaxWidths[0];
  const components = buildComponents(computed, colors, rounded, typography);
  const logo = pickLogo(signal);

  const frontmatter: Frontmatter = tidyFrontmatter({
    version: "alpha",
    name,
    ...(description ? { description } : {}),
    ...(logo ? { logo } : {}),
    colors,
    ...(Object.keys(typography).length ? { typography } : {}),
    ...(Object.keys(rounded).length ? { rounded } : {}),
    ...(Object.keys(spacing).length ? { spacing } : {}),
    ...(Object.keys(elevation).length ? { elevation } : {}),
    ...(containerMaxWidth ? { layout: { containerMaxWidth } } : {}),
    ...(Object.keys(components).length ? { components } : {}),
  });

  return { frontmatter, prose: buildProse(signal, frontmatter) };
}

// What the page itself says about type, spacing and radii, for the LLM
// prompt. Type levels without a measured size are left out.
export function measuredScales(signal: SiteSignal, css: string) {
  const typography = Object.fromEntries(
    Object.entries(buildTypography(signal)).filter(([, t]) => t.fontSize),
  );
  return { typography, spacing: buildSpacing(css), rounded: buildRounded(signal) };
}

// Measured type metrics win over the model's: it reads them from the same
// computed styles but tends to round them onto a generic scale.
export function withMeasuredType(fm: Frontmatter, signal: SiteSignal): Frontmatter {
  if (!fm.typography) return fm;
  const typography = { ...fm.typography };
  for (const [key, measured] of Object.entries(measuredScales(signal, "").typography)) {
    const current = typography[key];
    if (!current) continue;
    const { fontFamily, ...metrics } = measured;
    const keepFamily = current.fontFamily && !MONO_RE.test(current.fontFamily);
    typography[key] = { ...current, ...metrics, ...(keepFamily ? {} : { fontFamily }) };
  }
  return { ...fm, typography };
}

// Guarantees that hold whichever path produced the tokens: no placeholder
// survives, every on-* colour and every component's text is readable on its
// background, and the size-named radius scale only grows.
export function tidyFrontmatter(fm: Frontmatter): Frontmatter {
  const out = dropPlaceholders(fm);
  const colors = out.colors ? { ...out.colors } : undefined;
  if (colors) {
    for (const [key, value] of Object.entries(colors)) {
      if (!key.startsWith("on-")) continue;
      const base = colors[key.slice(3)];
      if (!base) continue;
      const ratio = contrastRatio(value, base);
      if (ratio !== null && ratio < MIN_CONTRAST) colors[key] = readableOn(base);
    }
  }
  const resolve = (v?: string) => {
    const ref = v?.match(/^\{colors\.(.+)\}$/);
    return ref ? colors?.[ref[1]] : v;
  };
  const components = out.components
    ? Object.fromEntries(
        Object.entries(out.components).map(([name, t]) => {
          const bg = resolve(t.backgroundColor);
          const text = resolve(t.textColor);
          const ratio = bg && text ? contrastRatio(text, bg) : null;
          return [name, ratio !== null && ratio < MIN_CONTRAST ? { ...t, textColor: readableOn(bg!) } : t];
        }),
      )
    : undefined;
  return {
    ...out,
    ...(colors ? { colors } : {}),
    ...(components ? { components } : {}),
    ...(out.rounded ? { rounded: orderScale(out.rounded) } : {}),
  };
}

function dropPlaceholders<T>(value: T): T {
  if (Array.isArray(value)) return value.map(dropPlaceholders) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => !(typeof v === "string" && /^<.*>$/.test(v.trim())))
        .map(([k, v]) => [k, dropPlaceholders(v)]),
    ) as T;
  }
  return value;
}

function buildColors(signal: SiteSignal): Record<string, string> {
  const c = signal.computed ?? {};
  const background = cssColor(c.body?.backgroundColor) ?? LIGHT_TEXT;
  const text =
    cssColor(c.body?.color) ??
    (luminanceOf(background) < 0.4 ? LIGHT_TEXT : DARK_TEXT);

  // Brand candidates, weighted. A measured CTA fill outranks everything; a
  // custom property named for the brand outranks raw frequency, which on
  // most sites is dominated by greys and framework palettes.
  const weights = new Map<string, number>();
  const add = (hex: string | null | undefined, w: number) => {
    if (hex) weights.set(hex, (weights.get(hex) ?? 0) + w);
  };
  add(cssColor(c.primaryCta?.backgroundColor), 1000);
  add(cssColor(c.secondaryCta?.backgroundColor), 200);
  add(cssColor(signal.meta.themeColor), 40);
  for (const v of signal.colors.cssVars) {
    if (/primary|brand|accent/i.test(v.name)) add(cssColor(v.value), 60);
  }
  for (const hex of [...signal.colors.tailwindArbitrary, ...signal.colors.inlineHero]) {
    add(cssColor(hex), 5);
  }
  for (const f of signal.colors.frequencyTop) add(cssColor(f.hex), f.count);

  const ranked = [...weights.entries()].sort((a, b) => b[1] - a[1]).map(([h]) => h);
  const brand: string[] = [];
  for (const hex of ranked.filter(isChromatic)) {
    if (brand.every((b) => distance(b, hex) > 60)) brand.push(hex);
    if (brand.length === 3) break;
  }
  // A monochrome site: its CTA (often black) is still the primary.
  const primary = brand[0] ?? cssColor(c.primaryCta?.backgroundColor) ?? text;

  const neutrals = ranked.filter(
    (h) => !isChromatic(h) && h !== background && h !== text,
  );
  const vsBg = (h: string) => contrastRatio(h, background) ?? 1;
  const cardBg = cssColor(c.firstCard?.backgroundColor);
  const container =
    (cardBg && cardBg !== background ? cardBg : undefined) ??
    neutrals.find((h) => vsBg(h) > 1.02 && vsBg(h) < 1.25);
  const outline = neutrals.find((h) => vsBg(h) >= 1.25 && vsBg(h) < 3);
  const muted = neutrals.find((h) => vsBg(h) >= MIN_CONTRAST && vsBg(h) < 12);

  const colors: Record<string, string> = {
    primary,
    "on-primary": readableOn(primary, cssColor(c.primaryCta?.color)),
  };
  if (brand[1]) {
    colors.secondary = brand[1];
    colors["on-secondary"] = readableOn(brand[1]);
  }
  if (brand[2]) {
    colors.tertiary = brand[2];
    colors["on-tertiary"] = readableOn(brand[2]);
  }
  colors.background = background;
  colors["on-background"] = text;
  colors.surface = background;
  colors["on-surface"] = text;
  if (container) colors["surface-container"] = container;
  if (muted) colors["on-surface-variant"] = muted;
  if (outline) colors.outline = outline;
  return colors;
}

function buildTypography(signal: SiteSignal): Record<string, Typography> {
  const c = signal.computed ?? {};
  const declared = [
    ...signal.typography.googleFonts,
    ...signal.typography.declaredFamilies,
  ].filter((f) => !MONO_RE.test(f) && !GENERIC_FONT_RE.test(f));
  const bodyFamily = family(c.body?.fontFamily) ?? declared[0];
  const headingFamily = family(c.h1?.fontFamily) ?? declared[0] ?? bodyFamily;

  const levels: [string, ComputedStyle | undefined, string | undefined][] = [
    ["display", c.h1, headingFamily],
    ["headline-md", c.h2, family(c.h2?.fontFamily) ?? headingFamily],
    ["body-md", c.body, bodyFamily],
    ["label-md", c.primaryCta, family(c.primaryCta?.fontFamily) ?? bodyFamily],
  ];
  const out: Record<string, Typography> = {};
  for (const [key, style, fontFamily] of levels) {
    if (!fontFamily) continue;
    // Without a rendered page there is no size to report; family alone is
    // still true, a guessed 3rem is not.
    const t: Typography = { fontFamily };
    if (style?.fontSize) t.fontSize = style.fontSize;
    if (style?.fontWeight) t.fontWeight = Number(style.fontWeight) || style.fontWeight;
    if (style?.lineHeight && style.lineHeight !== "normal") t.lineHeight = style.lineHeight;
    if (style?.letterSpacing && style.letterSpacing !== "normal") t.letterSpacing = style.letterSpacing;
    if (style || key === "display" || key === "body-md") out[key] = t;
  }
  return out;
}

// The family a computed stack actually asks for: its first entry, with a
// system stack (system-ui, -apple-system, ...) reported as system-ui. Code
// fonts are never a brand typeface.
function family(stack: string | undefined): string | undefined {
  const first = stack?.split(",")[0]?.trim().replace(/^['"]|['"]$/g, "");
  if (!first || MONO_RE.test(first)) return undefined;
  if (/^(serif|sans-serif)$/i.test(first)) return first;
  return GENERIC_FONT_RE.test(first) ? "system-ui" : first;
}

function buildRounded(signal: SiteSignal): Record<string, string> {
  const c = signal.computed ?? {};
  const counts = new Map<number, number>();
  let pill = false;
  const add = (value: string | undefined, w: number) => {
    const first = value?.trim().split(/\s+/)[0];
    if (!first) return;
    if (first.endsWith("%")) {
      if (parseFloat(first) >= 50) pill = true;
      return;
    }
    const px = toPx(first);
    if (px === null || px <= 0) return;
    if (px >= 100) {
      pill = true;
      return;
    }
    counts.set(px, (counts.get(px) ?? 0) + w);
  };
  for (const r of signal.geometry.radii) add(r.value, r.count);
  add(c.primaryCta?.borderRadius, 10);
  add(c.firstCard?.borderRadius, 10);
  add(c.firstInput?.borderRadius, 10);

  const values = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([px]) => px)
    .sort((a, b) => a - b);
  const keys = values.length === 1 ? ["md"] : values.length === 2 ? ["sm", "lg"] : ["sm", "md", "lg"];
  const out: Record<string, string> = {};
  values.forEach((px, i) => (out[keys[i]] = `${px}px`));
  if (pill) out.full = "9999px";
  return out;
}

const SPACING_RE =
  /(?:padding|margin|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left|inline|block)(?:-start|-end)?)?\s*:\s*([^;}]+)/gi;

function buildSpacing(css: string): Record<string, string> {
  const counts = new Map<number, number>();
  let m: RegExpExecArray | null;
  SPACING_RE.lastIndex = 0;
  while ((m = SPACING_RE.exec(css))) {
    for (const part of m[1].trim().split(/\s+/)) {
      const px = toPx(part);
      if (px === null || px < 2 || px > 128 || !Number.isInteger(px)) continue;
      counts.set(px, (counts.get(px) ?? 0) + 1);
    }
  }
  const values = [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([px]) => px)
    .sort((a, b) => a - b);
  const keys = ["xs", "sm", "md", "lg", "xl", "2xl"].slice(6 - values.length);
  return Object.fromEntries(values.map((px, i) => [keys[i], `${px}px`]));
}

function buildComponents(
  c: NonNullable<SiteSignal["computed"]>,
  colors: Record<string, string>,
  rounded: Record<string, string>,
  typography: Record<string, Typography>,
): Record<string, ComponentTokens> {
  const colorRef = (hex: string | null | undefined, fallback: string) => {
    const key = hex ? Object.keys(colors).find((k) => colors[k] === hex) : undefined;
    return key ? `{colors.${key}}` : (hex ?? fallback);
  };
  const radiusRef = (value: string | undefined) => {
    const first = value?.trim().split(/\s+/)[0];
    if (!first) return undefined;
    if (first.endsWith("%") || (toPx(first) ?? 0) >= 100) {
      return rounded.full ? "{rounded.full}" : undefined;
    }
    const px = toPx(first);
    if (px === null || px <= 0) return undefined;
    const best = Object.entries(rounded)
      .filter(([k]) => k !== "full")
      .sort((a, b) => Math.abs(toPx(a[1])! - px) - Math.abs(toPx(b[1])! - px))[0];
    return best ? `{rounded.${best[0]}}` : undefined;
  };
  const pad = (s?: ComputedStyle) =>
    s?.padding && !/^0(px)?$/.test(s.padding) ? s.padding : undefined;
  const clean = (t: ComponentTokens) =>
    Object.fromEntries(Object.entries(t).filter(([, v]) => v)) as ComponentTokens;

  const out: Record<string, ComponentTokens> = {
    "button-primary": clean({
      backgroundColor: "{colors.primary}",
      textColor: "{colors.on-primary}",
      typography: typography["label-md"] ? "{typography.label-md}" : undefined,
      rounded: radiusRef(c.primaryCta?.borderRadius),
      padding: pad(c.primaryCta),
    }),
    link: { textColor: "{colors.primary}" },
  };
  const secondaryBg = cssColor(c.secondaryCta?.backgroundColor);
  if (secondaryBg) {
    out["button-secondary"] = clean({
      backgroundColor: colorRef(secondaryBg, colors.surface),
      textColor: colorRef(readableOn(secondaryBg, cssColor(c.secondaryCta?.color)), colors["on-surface"]),
      rounded: radiusRef(c.secondaryCta?.borderRadius),
      padding: pad(c.secondaryCta),
    });
  }
  if (c.firstCard) {
    out.card = clean({
      backgroundColor: colorRef(cssColor(c.firstCard.backgroundColor), "{colors.surface}"),
      rounded: radiusRef(c.firstCard.borderRadius),
      padding: pad(c.firstCard),
    });
  }
  if (c.firstInput) {
    out["input-field"] = clean({
      backgroundColor: colorRef(cssColor(c.firstInput.backgroundColor), "{colors.surface}"),
      textColor: "{colors.on-surface}",
      rounded: radiusRef(c.firstInput.borderRadius),
      padding: pad(c.firstInput),
    });
  }
  return out;
}

const LOGO_ORDER = [
  "icon-svg",
  "header-svg",
  "mask-icon",
  "apple-touch-icon",
  "header-img",
  "icon-png",
  "og-image",
  "favicon-ico",
];

function pickLogo(signal: SiteSignal): Logo | undefined {
  const best = [...signal.logos].sort(
    (a, b) => LOGO_ORDER.indexOf(a.source) - LOGO_ORDER.indexOf(b.source),
  )[0];
  return best ? { src: best.url, ...(best.alt ? { alt: best.alt } : {}) } : undefined;
}

function buildProse(signal: SiteSignal, fm: Frontmatter): Prose {
  const colors = fm.colors ?? {};
  const prose: Prose = [];
  const { heroHeading, heroCopy, primaryButton } = signal.components;

  const overview = [
    `${fm.name}${fm.description ? `: ${fm.description}` : "."}`,
    `Tokens below were measured from ${signal.url}: computed styles of the rendered page where available, stylesheet declarations otherwise.`,
  ];
  const voice = [
    heroHeading && `- Headline: "${heroHeading}"`,
    heroCopy && `- Supporting copy: "${heroCopy}"`,
    primaryButton && `- Primary call to action: "${primaryButton.text}"`,
  ].filter(Boolean);
  if (voice.length) overview.push(`Voice, in the site's own words:\n\n${voice.join("\n")}`);
  prose.push({ heading: "Overview", body: overview.join("\n\n") });

  const role = (key: string, use: string) =>
    colors[key] ? `- **${key}** \`${colors[key]}\`: ${use}` : null;
  const onPrimaryRatio = contrastRatio(colors["on-primary"], colors.primary);
  prose.push({
    heading: "Colors",
    body: [
      role("primary", "calls to action, links, focus and active states."),
      role(
        "on-primary",
        `text and icons on primary${onPrimaryRatio ? ` (${onPrimaryRatio.toFixed(1)}:1 contrast)` : ""}.`,
      ),
      role("secondary", "supporting accent; use sparingly next to primary."),
      role("tertiary", "highlights and illustrations."),
      role("background", "page background."),
      role("on-background", "body text."),
      role("surface-container", "cards and raised panels."),
      role("on-surface-variant", "secondary text, captions and metadata."),
      role("outline", "borders and dividers."),
    ]
      .filter(Boolean)
      .join("\n"),
  });

  const type = Object.entries(fm.typography ?? {});
  if (type.length) {
    prose.push({
      heading: "Typography",
      body: type
        .map(([k, t]) =>
          `- **${k}**: ${[t.fontFamily, t.fontSize, t.fontWeight, t.lineHeight && `line-height ${t.lineHeight}`, t.letterSpacing && `tracking ${t.letterSpacing}`]
            .filter(Boolean)
            .join(", ")}`,
        )
        .join("\n"),
    });
  }

  const layout = [
    fm.layout?.containerMaxWidth && `Content sits in a container up to ${fm.layout.containerMaxWidth} wide.`,
    fm.spacing && `Spacing steps found in the stylesheets: ${Object.values(fm.spacing).join(", ")}.`,
  ].filter(Boolean);
  if (layout.length) prose.push({ heading: "Layout", body: layout.join(" ") });

  if (fm.elevation) {
    prose.push({
      heading: "Elevation & Depth",
      body: Object.entries(fm.elevation).map(([k, v]) => `- **${k}**: \`${v}\``).join("\n"),
    });
  }

  if (fm.rounded) {
    prose.push({
      heading: "Shapes",
      body: Object.entries(fm.rounded).map(([k, v]) => `- **${k}**: ${v}`).join("\n"),
    });
  }

  prose.push({
    heading: "Components",
    body: Object.entries(fm.components ?? {})
      .map(([k, t]) => `- **${k}**: ${Object.entries(t).map(([p, v]) => `${p} ${v}`).join(", ")}`)
      .join("\n"),
  });

  const body = fm.typography?.["body-md"]?.fontFamily;
  const dos = [
    `Use primary (${colors.primary}) for the main action on a screen and keep other elements neutral around it.`,
    colors["on-primary"] && `Set text on primary in ${colors["on-primary"]}.`,
    body && `Set body copy in ${body}.`,
  ].filter(Boolean);
  const donts = [
    "Don't introduce colours outside this palette for interactive elements.",
    fm.rounded && "Don't use corner radii outside the rounded scale.",
    "Don't use a code or monospace font for headings or body copy.",
  ].filter(Boolean);
  prose.push({
    heading: "Do's and Don'ts",
    body: ["**Do**", ...dos.map((d) => `- ${d}`), "", "**Don't**", ...donts.map((d) => `- ${d}`)].join("\n"),
  });

  return prose;
}

function orderScale(scale: Record<string, string>): Record<string, string> {
  const order = ["xs", "sm", "DEFAULT", "md", "lg", "xl", "2xl", "3xl"];
  const keys = order.filter((k) => k in scale && toPx(scale[k]) !== null);
  const sorted = keys.map((k) => scale[k]).sort((a, b) => toPx(a)! - toPx(b)!);
  const out = { ...scale };
  keys.forEach((k, i) => (out[k] = sorted[i]));
  return out;
}

function readableOn(bg: string, preferred?: string | null): string {
  const options = [preferred, LIGHT_TEXT, DARK_TEXT].filter((c): c is string => !!c);
  return (
    options.find((c) => (contrastRatio(c, bg) ?? 0) >= MIN_CONTRAST) ??
    options.sort((a, b) => (contrastRatio(b, bg) ?? 0) - (contrastRatio(a, bg) ?? 0))[0]
  );
}

function toPx(value: string): number | null {
  const m = value.trim().match(/^(-?[0-9.]+)(px|rem|em)?$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (Number.isNaN(n)) return null;
  return m[2] === "rem" || m[2] === "em" ? n * 16 : m[2] === "px" || n === 0 ? n : null;
}

// rgb()/rgba()/hex to lowercase #rrggbb; null for transparent or unparseable.
function cssColor(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  const hex = v.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    const h = hex[1];
    if (h.length === 3 || h.length === 4) return "#" + [...h.slice(0, 3)].map((x) => x + x).join("");
    if (h.length === 8 && h.slice(6) === "00") return null;
    return "#" + h.slice(0, 6);
  }
  const rgb = v.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/);
  if (!rgb) return null;
  if (rgb[4] !== undefined && parseFloat(rgb[4]) === 0) return null;
  return "#" + [rgb[1], rgb[2], rgb[3]].map((n) => Math.round(Number(n)).toString(16).padStart(2, "0")).join("");
}

function rgbOf(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

function isChromatic(hex: string): boolean {
  const [r, g, b] = rgbOf(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min || l < 0.15 || l > 0.85) return false;
  const s = (max - min) / (1 - Math.abs(2 * l - 1));
  return s >= 0.35;
}

function luminanceOf(hex: string): number {
  return (contrastRatio(hex, "#000000") ?? 1) * 0.05 - 0.05;
}

function distance(a: string, b: string): number {
  const [x, y] = [rgbOf(a), rgbOf(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}
