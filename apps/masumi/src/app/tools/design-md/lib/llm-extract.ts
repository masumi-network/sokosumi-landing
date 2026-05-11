import type { Frontmatter, Logo, Typography } from "./design-md";
import type { SiteSignal } from "./preprocess";
import { signalToMarkdown } from "./preprocess";
import type { RenderedPage } from "./render";

const MODEL = "anthropic/claude-haiku-4.5";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export type LlmMeta = {
  model: string;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
};

export type LlmResult = {
  frontmatter: Frontmatter;
  prose: { heading: string; body: string }[];
  meta: LlmMeta;
} | null;

const cache = new Map<string, { ts: number; result: LlmResult }>();
const TTL_MS = 60 * 60 * 1000;

const SYSTEM = `You are a senior brand designer producing a DESIGN.md file (https://github.com/google-labs-code/design.md) for AI coding agents.

Your job: look at a screenshot of the rendered site + a structured signal blob + raw HTML/CSS samples, and produce a *believable, brand-distinctive, dense* design system that matches the quality bar of the Material 3-style reference files used to train designers.

Quality bar (non-negotiable):
- The output must read like a senior designer wrote it after spending 2 hours studying the brand. Generic adjectives ("soft shadows", "modern typography") are failures. Every prose section must contain at least 3 concrete CSS values (px, rem, rgba, ms, %).
- Use the Material 3 expanded color token system. Define the full surface stack (surface, surface-dim, surface-bright, surface-container, surface-container-low/lowest/high/highest, surface-variant), the on-* pairs (on-surface, on-surface-variant, inverse-surface, inverse-on-surface), the role colors (primary + on-primary + primary-container + on-primary-container + inverse-primary, plus the *-fixed and *-fixed-dim variants), and the same for secondary, tertiary, and error.
- Typography: at least 6 levels (display, headline-lg, headline-md, body-lg, body-md, label-md or similar). Use real fontFamily from Google Fonts links / @font-face / font-family declarations. Skip system-ui, sans-serif, inherit. Real px sizes, real letter-spacing in em (-0.04em to 0.1em as appropriate), real lineHeight as px or unitless.
- Components: at least 10 entries including state variants (e.g. button-primary AND button-primary-hover as separate components, per spec). Components must use {colors.x}, {rounded.x}, {typography.x}, {spacing.x} token refs — never hardcode hexes inside component blocks. Variant components reference their base via a related key name.
- Rounded scale: sm, DEFAULT, md, lg, xl, full. Real px or rem values.
- Spacing: semantic keys when sensible (gutter, margin, container-max, unit) alongside a sm/md/lg scale.

Hard rules:
- Output STRICT JSON. No markdown fences, no commentary, no prose outside JSON.
- A SCREENSHOT may be attached. When attached, the screenshot is ground truth — when it conflicts with the text signal, trust the screenshot. Identify the most prominent CTA visually and use its color as primary.
- Pick brand-distinctive accents — skip near-black and near-white when picking primary/secondary/tertiary. Look for CSS vars named --primary/--brand/--accent, Tailwind bg-[#xxx] classes in hero/CTA, and the "Live computed styles" block.
- Components must use token references like {colors.primary} so the system is wired up, not hardcoded.
- Prose follows the canonical DESIGN.md section order: Overview (also "Brand & Style"), Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts. Voice and brand personality belong inside Overview. Color usage rules belong inside Colors. Spacing rationale belongs inside Layout. Border-radius rationale belongs inside Shapes.
- Logo: from the provided candidate list, pick the single best one for "src" — preferring a vector SVG > apple-touch-icon > header img logo > og-image. If the site appears to have a separate dark-mode logo, set "srcDark". Always copy candidate URLs verbatim. If no candidates are provided, omit the logo field entirely.
- If something is genuinely unknowable, omit the field rather than invent a placeholder.`;

const SCHEMA = `{
  "frontmatter": {
    "version": "alpha",
    "name": "Brand name",
    "description": "1-2 sentence brand summary.",
    "logo": { "src": "https://...", "srcDark": "https://..." },
    "colors": {
      "surface": "#hex",
      "surface-dim": "#hex",
      "surface-bright": "#hex",
      "surface-container-lowest": "#hex",
      "surface-container-low": "#hex",
      "surface-container": "#hex",
      "surface-container-high": "#hex",
      "surface-container-highest": "#hex",
      "on-surface": "#hex",
      "on-surface-variant": "#hex",
      "inverse-surface": "#hex",
      "inverse-on-surface": "#hex",
      "outline": "#hex",
      "outline-variant": "#hex",
      "surface-tint": "#hex",
      "primary": "#hex",
      "on-primary": "#hex",
      "primary-container": "#hex",
      "on-primary-container": "#hex",
      "inverse-primary": "#hex",
      "secondary": "#hex",
      "on-secondary": "#hex",
      "secondary-container": "#hex",
      "on-secondary-container": "#hex",
      "tertiary": "#hex",
      "on-tertiary": "#hex",
      "tertiary-container": "#hex",
      "on-tertiary-container": "#hex",
      "error": "#hex",
      "on-error": "#hex",
      "error-container": "#hex",
      "on-error-container": "#hex",
      "primary-fixed": "#hex",
      "primary-fixed-dim": "#hex",
      "on-primary-fixed": "#hex",
      "on-primary-fixed-variant": "#hex",
      "secondary-fixed": "#hex",
      "secondary-fixed-dim": "#hex",
      "on-secondary-fixed": "#hex",
      "on-secondary-fixed-variant": "#hex",
      "tertiary-fixed": "#hex",
      "tertiary-fixed-dim": "#hex",
      "on-tertiary-fixed": "#hex",
      "on-tertiary-fixed-variant": "#hex",
      "background": "#hex",
      "on-background": "#hex",
      "surface-variant": "#hex"
    },
    "typography": {
      "display":      { "fontFamily": "...", "fontSize": "60px", "fontWeight": "700", "lineHeight": "68px", "letterSpacing": "-0.04em" },
      "headline-lg":  { "fontFamily": "...", "fontSize": "40px", "fontWeight": "600", "lineHeight": "48px", "letterSpacing": "-0.02em" },
      "headline-md":  { "fontFamily": "...", "fontSize": "28px", "fontWeight": "600", "lineHeight": "36px" },
      "title-lg":     { "fontFamily": "...", "fontSize": "20px", "fontWeight": "600", "lineHeight": "28px" },
      "body-lg":      { "fontFamily": "...", "fontSize": "18px", "fontWeight": "400", "lineHeight": "28px" },
      "body-md":      { "fontFamily": "...", "fontSize": "16px", "fontWeight": "400", "lineHeight": "24px" },
      "label-md":     { "fontFamily": "...", "fontSize": "14px", "fontWeight": "600", "lineHeight": "20px", "letterSpacing": "0.01em" },
      "label-sm":     { "fontFamily": "...", "fontSize": "12px", "fontWeight": "500", "lineHeight": "16px" }
    },
    "spacing":  { "unit": "8px", "xs": "4px", "sm": "12px", "md": "24px", "lg": "40px", "xl": "64px", "gutter": "24px", "container-max": "1280px" },
    "rounded":  { "sm": "0.25rem", "DEFAULT": "0.5rem", "md": "0.75rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px" },
    "elevation":{ "sm": "0 1px 2px rgba(0,0,0,0.06)", "md": "0 4px 12px rgba(0,0,0,0.08)", "lg": "0 16px 40px rgba(0,0,0,0.12)" },
    "layout":   { "containerMaxWidth": "1280px", "gridColumns": 12 },
    "components": {
      "button-primary":           { "backgroundColor": "{colors.primary}", "textColor": "{colors.on-primary}", "typography": "{typography.label-md}", "rounded": "{rounded.lg}", "padding": "{spacing.md}", "height": "48px" },
      "button-primary-hover":     { "backgroundColor": "{colors.primary-container}", "textColor": "{colors.on-primary-container}" },
      "button-secondary":         { "backgroundColor": "transparent", "textColor": "{colors.primary}", "typography": "{typography.label-md}", "rounded": "{rounded.lg}", "padding": "{spacing.md}", "height": "48px" },
      "button-secondary-hover":   { "backgroundColor": "{colors.surface-container-high}" },
      "card":                     { "backgroundColor": "{colors.surface-container-lowest}", "rounded": "{rounded.xl}", "padding": "{spacing.md}" },
      "card-hover":               { "backgroundColor": "{colors.surface-container-high}" },
      "input-field":              { "backgroundColor": "{colors.surface-container-low}", "textColor": "{colors.on-surface}", "typography": "{typography.body-md}", "rounded": "{rounded.DEFAULT}", "padding": "{spacing.sm}" },
      "list-item":                { "backgroundColor": "transparent", "rounded": "{rounded.md}", "padding": "{spacing.sm}" },
      "list-item-hover":          { "backgroundColor": "{colors.surface-container-high}", "textColor": "{colors.primary}" },
      "badge":                    { "backgroundColor": "{colors.tertiary-container}", "textColor": "{colors.on-tertiary-container}", "typography": "{typography.label-sm}", "rounded": "{rounded.full}", "padding": "{spacing.xs}" }
    }
  },
  "prose": {
    "overview":   "2 paragraphs. Para 1: what the brand does, who it serves, the aesthetic movement (e.g. 'Glassmorphism', 'Architectural Minimalism', 'Soft Brutalism'), and the emotional response the UI evokes. Para 2: tone of voice, vocabulary patterns, brand personality. End with one short example sentence written in the brand's voice.",
    "colors":     "1-2 paragraphs covering color philosophy AND specific usage rules with explicit hex/rgba values. Break down each role: 'Primary (HEX) is used for Y. Secondary (HEX) supports Z.' Include gradient or surface-stack rules when relevant.",
    "typography": "1 paragraph covering the type system rationale: how display/headline/body relate, what the type pairing communicates, when to use each weight. Include at least one concrete CSS treatment instruction (e.g. 'apply text-shadow 0 2px 4px rgba(0,0,0,0.15) on small labels over busy backgrounds').",
    "layout":     "1 paragraph covering page rhythm (grid model: fluid vs fixed, column count), container max-width in px, white-space philosophy, and how the spacing scale is used. Reference the spacing tokens by name (e.g. 'lg spacing for section separation').",
    "elevation":  "1 paragraph: how visual hierarchy is conveyed with concrete values. If shadows used, give the exact box-shadow string (e.g. '0 8px 32px rgba(0,0,0,0.1)'). If flat / glassmorphism, describe the layer stack (Level 1 / Level 2 / Level 3) with their backdrop-filter, background, and border specs.",
    "shapes":     "1 paragraph with a named shape philosophy (e.g. 'Architectural Sharpness', 'Soft-Technical', 'Organic and approachable'). Specify which radius is used for buttons vs cards vs inputs, in px or rem, and explain the reasoning.",
    "components": "1-2 paragraphs broken into named subsections in the prose itself: e.g. '### Action Elements' (buttons), '### Containers & Surfaces' (cards), '### Inputs & Interaction'. Each subsection must contain at least one specific instruction (animation timing in ms, exact border width, hover transition).",
    "dos":  ["Do… (specific, opinionated, 1 sentence)", "Do…", "Do…", "Do…"],
    "donts":["Don't… (specific, opinionated, 1 sentence)", "Don't…", "Don't…", "Don't…"]
  }
}`;

// Few-shot exemplar (trimmed) — shows the LLM the density and specificity bar.
// This is one of the curated reference DESIGN.md files we want to match.
const FEW_SHOT = `Here is a reference DESIGN.md (Material 3 + Glassmorphism aesthetic, for an atmospheric weather app) at the quality bar we're matching:

---
EXAMPLE FRONTMATTER (abbreviated; full output should be this dense):
colors:
  surface: "#0b1326"
  surface-container-lowest: "#060e20"
  surface-container: "#171f33"
  surface-container-highest: "#2d3449"
  on-surface: "#dae2fd"
  on-surface-variant: "#c4c7c8"
  outline: "#8e9192"
  outline-variant: "#444748"
  surface-tint: "#c6c6c7"
  primary: "#ffffff"
  on-primary: "#2f3131"
  primary-container: "#e2e2e2"
  on-primary-container: "#636565"
  secondary: "#adc9eb"
  on-secondary: "#14324e"
  secondary-container: "#304b68"
  tertiary: "#ffffff"
  tertiary-container: "#ffd8e7"
  error: "#ffb4ab"
  error-container: "#93000a"
  primary-fixed: "#e2e2e2"
  primary-fixed-dim: "#c6c6c7"
  on-primary-fixed: "#1a1c1c"
  ... (all 40+ M3 tokens populated)

typography:
  display-lg:
    fontFamily: Inter
    fontSize: 84px
    fontWeight: "700"
    lineHeight: 90px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
    letterSpacing: -0.02em
  body-lg: { fontFamily: Inter, fontSize: 18px, fontWeight: "400", lineHeight: 28px }
  label-sm: { fontFamily: Inter, fontSize: 12px, fontWeight: "600", lineHeight: 16px, letterSpacing: 0.05em }

components:
  glass-card-standard:
    backgroundColor: rgba(255, 255, 255, 0.1)
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.glass-padding}"
  glass-card-elevated:
    backgroundColor: rgba(255, 255, 255, 0.2)
    rounded: "{rounded.xl}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xl}"
    height: 48px
    padding: "0 24px"
  button-primary-hover: { backgroundColor: "{colors.primary-fixed-dim}" }
  button-ghost: { backgroundColor: rgba(255, 255, 255, 0.05), textColor: "{colors.primary}", rounded: "{rounded.xl}" }
  input-field:
    backgroundColor: rgba(255, 255, 255, 0.1)
    rounded: "{rounded.xl}"
    padding: 20px
  ... (10+ components total, with hover/focus variants as separate entries)

EXAMPLE PROSE — note the density:

## Brand & Style
This design system centers on a high-fidelity Glassmorphism aesthetic designed to evoke clarity, depth, and modern sophistication. The brand personality is ethereal yet functional, transforming complex meteorological data into a serene visual experience.

The UI relies on a "vibrant-minimalist" approach: the background provides the energy through multi-colored abstract gradients (pinks, purples, and blues), while the interface elements act as frosted crystalline lenses that focus the user's attention. Voice: precise, calm, never breathless. Example sentence: "Tomorrow's cold front arrives at 6:14 — pack a layer."

## Elevation & Depth
Depth in this design system is not achieved through darkness, but through the physics of light and refraction.
- Level 1 (Base): Dynamic background gradient with slight grain texture.
- Level 2 (Standard Card): backdrop-filter: blur(20px), background: rgba(255, 255, 255, 0.1).
- Level 3 (Elevated/Modals): backdrop-filter: blur(40px), background: rgba(255, 255, 255, 0.2).
Every glass surface must have a 1px solid border at rgba(255, 255, 255, 0.2). Soft, spread shadows (box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1)) separate glass layers from the background.

---
End of reference. Your output must match this density: full M3 color stack, 10+ components with variants, prose with concrete CSS values, named aesthetic movements, no generic adjectives.`;

export async function llmExtract(
  url: string,
  signal: SiteSignal,
  rawHtml: string,
  rawCss: string,
  rendered: RenderedPage | null,
  opts?: { force?: boolean },
): Promise<LlmResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  // Cache key includes whether we have vision input — a vision-augmented
  // run can have different (better) results than text-only for the same URL.
  // v5 bumps for the M3-expanded schema + few-shot prompt.
  const cacheKey = `${MODEL}:v5${rendered ? ":vision" : ":text"}:${url}`;
  if (!opts?.force) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < TTL_MS) return cached.result;
  }

  const signalMd = signalToMarkdown(signal);
  const prompt = buildPrompt(signalMd, rawHtml, rawCss, !!rendered);

  // Vision input: pass screenshot as image_url with data URL.
  const userContent: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [{ type: "text", text: prompt }];
  if (rendered) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: `data:${rendered.screenshotMime};base64,${rendered.screenshotBase64}`,
      },
    });
  }

  const t0 = Date.now();
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        "x-title": "Masumi DESIGN.md Generator",
        "http-referer": "https://www.masumi.network/tools/design-md",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 7000,
      }),
      signal: AbortSignal.timeout(90_000),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[llm-extract] fetch failed for ${url}: ${msg}`);
    return null;
  }
  const latencyMs = Date.now() - t0;

  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    console.error(
      `[llm-extract] HTTP ${res.status} for ${url} after ${latencyMs}ms: ${body.slice(0, 400)}`,
    );
    return null;
  }

  const data = await res.json().catch((e) => {
    console.error(`[llm-extract] JSON parse failed for ${url}:`, e);
    return null;
  });
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    const finishReason = data?.choices?.[0]?.finish_reason ?? "?";
    console.error(
      `[llm-extract] missing content for ${url} (finish_reason=${finishReason}):`,
      JSON.stringify(data).slice(0, 400),
    );
    return null;
  }

  const parsed = parseJsonLoose(content);
  if (!parsed || typeof parsed !== "object") {
    console.error(
      `[llm-extract] could not parse JSON for ${url} (content len ${content.length}, first 300 chars):`,
      content.slice(0, 300),
    );
    return null;
  }

  const result = shape(parsed as RawShape, url, signal, {
    model: MODEL,
    latencyMs,
    inputTokens: data?.usage?.prompt_tokens,
    outputTokens: data?.usage?.completion_tokens,
  });
  // Only cache *successful* results. Caching nulls would mean a single
  // transient failure locks the URL into heuristic-fallback for an hour.
  if (result) {
    cache.set(cacheKey, { ts: Date.now(), result });
  }
  return result;
}

function buildPrompt(
  signalMd: string,
  html: string,
  css: string,
  hasScreenshot: boolean,
): string {
  const trimmedHtml = html.slice(0, 16000);
  const trimmedCss = css.slice(0, 16000);
  const visionLine = hasScreenshot
    ? `A SCREENSHOT of the rendered page is attached. **Use the screenshot to verify** color choices, identify the most prominent CTA, see the hero composition, and check dark vs light mode. The screenshot is ground truth — when the screenshot conflicts with the text signal, trust the screenshot.`
    : "";

  return `${FEW_SHOT}

---

Now analyze the target website below and produce a DESIGN.md at the same quality bar.

${visionLine}

Use the **Live computed styles** section of the signal (when present) as your most trustworthy source — those are real values from the rendered DOM. Use the raw excerpts only for confirmation or when the signal is sparse.

Return a JSON object matching this exact shape:
${SCHEMA}

# Structured signal
${signalMd}

# Raw HTML excerpt
${trimmedHtml}

# Raw CSS excerpt
${trimmedCss}`;
}

type RawShape = {
  frontmatter?: Record<string, unknown>;
  prose?: Record<string, unknown>;
};

function parseJsonLoose(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {}
  const m = text.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch {}
  }
  return null;
}

function shape(
  raw: RawShape,
  url: string,
  signal: SiteSignal,
  meta: LlmMeta,
): LlmResult {
  const fmRaw = (raw.frontmatter ?? {}) as Record<string, unknown>;
  const proseRaw = (raw.prose ?? {}) as Record<string, unknown>;

  const name = sanitizeString(fmRaw.name) || hostnameFromUrl(url);
  const description = sanitizeString(fmRaw.description, 320);
  const logo = sanitizeLogo(fmRaw.logo, signal);
  const colors = sanitizeColors(fmRaw.colors);
  const typography = sanitizeTypography(fmRaw.typography);
  const rounded = sanitizeStringMap(fmRaw.rounded);
  const spacing = sanitizeStringOrNumberMap(fmRaw.spacing);
  const elevation = sanitizeStringMap(fmRaw.elevation);
  const layout = sanitizeLayout(fmRaw.layout);
  let components = sanitizeComponents(fmRaw.components);

  // Validate token refs in components against actually-defined tokens.
  // A reference like {colors.surface} when no `surface` is defined gets
  // replaced with a sensible fallback so the rendered output never shows
  // unresolved tokens.
  if (components) {
    components = validateComponentRefs(components, {
      colors,
      rounded,
      spacing,
      typography: Object.keys(typography),
    });
  }

  const frontmatter: Frontmatter = {
    version: "alpha",
    name,
    ...(description ? { description } : {}),
    ...(logo ? { logo } : {}),
    ...(Object.keys(colors).length ? { colors } : {}),
    ...(Object.keys(typography).length ? { typography } : {}),
    ...(Object.keys(rounded).length ? { rounded } : {}),
    ...(Object.keys(spacing).length ? { spacing } : {}),
    ...(Object.keys(elevation).length ? { elevation } : {}),
    ...(layout ? { layout } : {}),
    ...(components ? { components } : {}),
  };

  const prose: { heading: string; body: string }[] = [];
  const overview = sanitizeString(proseRaw.overview, 1600);
  const colorsText = sanitizeString(proseRaw.colors, 800);
  const typographyText = sanitizeString(proseRaw.typography, 800);
  const layoutText = sanitizeString(proseRaw.layout, 800);
  const elevationText = sanitizeString(proseRaw.elevation, 600);
  const shapesText = sanitizeString(proseRaw.shapes, 600);
  const componentsText = sanitizeString(proseRaw.components, 800);
  const dos = sanitizeStringArray(proseRaw.dos, 8);
  const donts = sanitizeStringArray(proseRaw.donts, 8);

  if (overview) prose.push({ heading: "Overview", body: overview });
  if (colorsText) prose.push({ heading: "Colors", body: colorsText });
  if (typographyText) prose.push({ heading: "Typography", body: typographyText });
  if (layoutText) prose.push({ heading: "Layout", body: layoutText });
  if (elevationText) prose.push({ heading: "Elevation & Depth", body: elevationText });
  if (shapesText) prose.push({ heading: "Shapes", body: shapesText });
  if (componentsText) prose.push({ heading: "Components", body: componentsText });
  if (dos.length || donts.length) {
    const lines: string[] = [];
    if (dos.length) {
      lines.push("**Do**");
      for (const item of dos) lines.push(`- ${item}`);
    }
    if (donts.length) {
      if (lines.length) lines.push("");
      lines.push("**Don't**");
      for (const item of donts) lines.push(`- ${item}`);
    }
    prose.push({ heading: "Do's and Don'ts", body: lines.join("\n") });
  }

  return { frontmatter, prose, meta };
}

function sanitizeString(v: unknown, max = 320): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function sanitizeStringArray(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .map((s) => s.trim().slice(0, 240))
    .slice(0, max);
}

function sanitizeColors(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string" && /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(v.trim())) {
      out[k] = v.trim().toLowerCase();
    }
  }
  return out;
}

function sanitizeTypography(raw: unknown): Record<string, Typography> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, Typography> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== "object") continue;
    const t = v as Record<string, unknown>;
    const entry: Typography = {};
    if (typeof t.fontFamily === "string") entry.fontFamily = t.fontFamily;
    if (typeof t.fontSize === "string") entry.fontSize = t.fontSize;
    if (typeof t.fontWeight === "number" || typeof t.fontWeight === "string") {
      entry.fontWeight = t.fontWeight as number | string;
    }
    if (typeof t.lineHeight === "number" || typeof t.lineHeight === "string") {
      entry.lineHeight = t.lineHeight as number | string;
    }
    if (typeof t.letterSpacing === "string") entry.letterSpacing = t.letterSpacing;
    if (Object.keys(entry).length > 0) out[k] = entry;
  }
  return out;
}

function sanitizeStringMap(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

function sanitizeStringOrNumberMap(
  raw: unknown,
): Record<string, string | number> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string" || typeof v === "number") out[k] = v;
  }
  return out;
}

function sanitizeLayout(raw: unknown):
  | { containerMaxWidth?: string; gridColumns?: number }
  | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const out: { containerMaxWidth?: string; gridColumns?: number } = {};
  if (typeof r.containerMaxWidth === "string") {
    out.containerMaxWidth = r.containerMaxWidth;
  }
  if (typeof r.gridColumns === "number") out.gridColumns = r.gridColumns;
  return Object.keys(out).length ? out : undefined;
}

function sanitizeLogo(raw: unknown, signal: SiteSignal): Logo | undefined {
  const candidates = signal.logos.map((l) => l.url);
  const candidateSet = new Set(candidates);

  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    const src =
      typeof r.src === "string" && (candidateSet.has(r.src) || isHttpUrl(r.src))
        ? r.src
        : undefined;
    const srcDark =
      typeof r.srcDark === "string" &&
      (candidateSet.has(r.srcDark) || isHttpUrl(r.srcDark))
        ? r.srcDark
        : undefined;
    const alt = typeof r.alt === "string" ? r.alt.slice(0, 200) : undefined;
    if (src) return { src, ...(srcDark ? { srcDark } : {}), ...(alt ? { alt } : {}) };
  }

  if (signal.logos.length > 0) {
    return { src: signal.logos[0].url };
  }
  return undefined;
}

function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s) || s.startsWith("data:");
}

function sanitizeComponents(
  raw: unknown,
): Record<string, Record<string, string>> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const out: Record<string, Record<string, string>> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== "object") continue;
    const inner: Record<string, string> = {};
    for (const [pk, pv] of Object.entries(v as Record<string, unknown>)) {
      if (typeof pv === "string") inner[pk] = pv;
    }
    if (Object.keys(inner).length > 0) out[k] = inner;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function validateComponentRefs(
  components: Record<string, Record<string, string>>,
  defined: {
    colors: Record<string, string>;
    rounded: Record<string, string>;
    spacing: Record<string, string | number>;
    typography: string[];
  },
): Record<string, Record<string, string>> {
  const validRef = (ref: string): boolean => {
    const m = ref.match(/^\{([\w.-]+)\}$/);
    if (!m) return true; // not a ref — raw value, leave it
    const [group, ...rest] = m[1].split(".");
    const token = rest.join(".");
    if (!token) return false;
    if (group === "colors") return token in defined.colors;
    if (group === "rounded") return token in defined.rounded;
    if (group === "spacing") return token in defined.spacing;
    if (group === "typography") return defined.typography.includes(token);
    return true; // unknown group — leave for forward-compat
  };

  const fallback = (key: string): string | undefined => {
    if (key === "backgroundColor") {
      // Prefer a defined neutral, fall back to a fixed light surface.
      if ("surface" in defined.colors) return "{colors.surface}";
      if ("primary" in defined.colors) return "{colors.primary}";
      return undefined;
    }
    if (key === "textColor") {
      if ("on-surface" in defined.colors) return "{colors.on-surface}";
      if ("on-primary" in defined.colors) return "{colors.on-primary}";
      return undefined;
    }
    if (key === "rounded") {
      if ("md" in defined.rounded) return "{rounded.md}";
      if ("DEFAULT" in defined.rounded) return "{rounded.DEFAULT}";
      return undefined;
    }
    if (key === "typography") {
      if (defined.typography.includes("body-md")) return "{typography.body-md}";
      return undefined;
    }
    return undefined;
  };

  const out: Record<string, Record<string, string>> = {};
  for (const [name, props] of Object.entries(components)) {
    const fixed: Record<string, string> = {};
    for (const [k, v] of Object.entries(props)) {
      if (typeof v !== "string") continue;
      if (validRef(v)) {
        fixed[k] = v;
      } else {
        const fb = fallback(k);
        if (fb) fixed[k] = fb;
        // else drop the field entirely — invalid ref with no sane fallback
      }
    }
    out[name] = fixed;
  }
  return out;
}

function hostnameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Untitled";
  }
}
