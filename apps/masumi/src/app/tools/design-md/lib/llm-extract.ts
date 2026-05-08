import type { Frontmatter, Logo, Typography } from "./design-md";
import type { SiteSignal } from "./preprocess";
import { signalToMarkdown } from "./preprocess";

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

Your job: look at a structured signal blob from a website plus raw HTML/CSS samples, and produce a *believable, brand-distinctive* design system.

Hard rules:
- Output STRICT JSON. No markdown fences, no commentary, no prose outside JSON.
- Pick brand-distinctive colors. If you see a CSS var named --primary/--brand/--accent or a Tailwind bg-[#xxx] in a hero/CTA, that's primary. Skip near-black and near-white when picking accents.
- Use real font families found in Google Fonts links or font-family declarations. Skip system-ui/sans-serif/inherit. Don't invent fonts.
- Radii: prefer 4-32px, plus optionally "full: 9999px". Skip 50% (avatars) and 1px (borders/shadow tricks).
- Components must use token references like {colors.primary} so the system is wired up, not hardcoded.
- Prose follows the canonical DESIGN.md section order: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts. Voice and brand personality belong inside Overview. Color usage rules belong inside Colors. Spacing rationale belongs inside Layout. Border-radius rationale belongs inside Shapes.
- Logo: from the provided candidate list, pick the single best one for "src" — preferring a vector SVG > apple-touch-icon > header img logo > og-image. If the site appears to have a separate dark-mode logo, set "srcDark". Always copy candidate URLs verbatim. If no candidates are provided, omit the logo field entirely.
- If something is genuinely unknowable, omit the field rather than invent a placeholder.`;

const SCHEMA = `{
  "frontmatter": {
    "version": "alpha",
    "name": "Brand name",
    "description": "1-2 sentence brand summary.",
    "logo": { "src": "https://...", "srcDark": "https://..." },
    "colors": {
      "primary": "#hex",
      "secondary": "#hex",
      "tertiary": "#hex",
      "neutral": "#hex",
      "surface": "#hex"
    },
    "typography": {
      "display": { "fontFamily": "...", "fontSize": "4.5rem", "fontWeight": 600, "lineHeight": 1.0, "letterSpacing": "-0.04em" },
      "h1":      { "fontFamily": "...", "fontSize": "3rem", "fontWeight": 600, "lineHeight": 1.1 },
      "h2":      { "fontFamily": "...", "fontSize": "2rem", "fontWeight": 500, "lineHeight": 1.2 },
      "h3":      { "fontFamily": "...", "fontSize": "1.5rem", "fontWeight": 500, "lineHeight": 1.3 },
      "body-lg": { "fontFamily": "...", "fontSize": "1.125rem", "lineHeight": 1.5 },
      "body-md": { "fontFamily": "...", "fontSize": "1rem", "lineHeight": 1.5 },
      "body-sm": { "fontFamily": "...", "fontSize": "0.875rem", "lineHeight": 1.5 },
      "caption": { "fontFamily": "...", "fontSize": "0.75rem", "lineHeight": 1.4, "letterSpacing": "0.05em" }
    },
    "spacing":  { "xs": "4px", "sm": "8px", "md": "16px", "lg": "32px", "xl": "64px" },
    "rounded":  { "sm": "4px", "md": "8px", "lg": "16px", "xl": "24px", "full": "9999px" },
    "elevation":{ "sm": "0 1px 2px rgba(0,0,0,0.06)", "md": "0 4px 12px rgba(0,0,0,0.08)", "lg": "0 16px 40px rgba(0,0,0,0.12)" },
    "layout":   { "containerMaxWidth": "1280px", "gridColumns": 12 },
    "components": {
      "button-primary":   { "backgroundColor": "{colors.primary}", "textColor": "#ffffff", "rounded": "{rounded.sm}", "padding": "12px 24px", "typography": "{typography.body-md}" },
      "button-secondary": { "backgroundColor": "{colors.surface}", "textColor": "{colors.primary}", "rounded": "{rounded.sm}", "padding": "12px 24px" },
      "button-ghost":     { "backgroundColor": "transparent", "textColor": "{colors.primary}", "padding": "12px 16px" },
      "card":             { "backgroundColor": "{colors.surface}", "rounded": "{rounded.md}", "padding": "24px" },
      "input":            { "backgroundColor": "{colors.surface}", "textColor": "{colors.neutral}", "rounded": "{rounded.sm}", "padding": "10px 14px" },
      "badge":            { "backgroundColor": "{colors.tertiary}", "textColor": "#ffffff", "rounded": "{rounded.full}", "padding": "4px 10px" }
    }
  },
  "prose": {
    "overview":   "1-2 paragraphs covering: (a) what the brand does and who it serves; (b) the visual personality and emotional response the UI evokes; (c) tone of voice, vocabulary, and brand personality (3-4 sentences within the same prose). End with one short example sentence written in the brand's voice.",
    "colors":     "1 paragraph covering color philosophy AND specific usage rules. e.g. 'Primary on CTAs and key data viz only. Secondary as supporting structure. Tertiary sparingly for highlights.'",
    "typography": "1 paragraph covering the type system rationale: how display/h1/body relate, what the type pairing communicates, when to use which weight.",
    "layout":     "1 paragraph covering page rhythm, container behavior, white-space philosophy, and how the spacing scale is used.",
    "elevation":  "1 paragraph: how visual hierarchy is conveyed. If shadows used, when. If flat, what conveys depth instead (borders, color contrast).",
    "shapes":     "1 paragraph: shape language rationale. How the radii scale supports the brand (sharp vs soft, mechanical vs organic).",
    "components": "1 paragraph: component patterns, button hierarchy, what makes a card/input feel on-brand.",
    "dos":  ["Do this.", "Do that.", "Do another."],
    "donts":["Don't this.", "Don't that.", "Don't another."]
  }
}`;

export async function llmExtract(
  url: string,
  signal: SiteSignal,
  rawHtml: string,
  rawCss: string,
): Promise<LlmResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  const cacheKey = `${MODEL}:v3:${url}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < TTL_MS) return cached.result;

  const signalMd = signalToMarkdown(signal);
  const prompt = buildPrompt(signalMd, rawHtml, rawCss);

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
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 3500,
      }),
      signal: AbortSignal.timeout(45000),
    });
  } catch {
    return null;
  }
  const latencyMs = Date.now() - t0;

  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") return null;

  const parsed = parseJsonLoose(content);
  if (!parsed || typeof parsed !== "object") return null;

  const result = shape(parsed as RawShape, url, signal, {
    model: MODEL,
    latencyMs,
    inputTokens: data?.usage?.prompt_tokens,
    outputTokens: data?.usage?.completion_tokens,
  });
  cache.set(cacheKey, { ts: Date.now(), result });
  return result;
}

function buildPrompt(signalMd: string, html: string, css: string): string {
  const trimmedHtml = html.slice(0, 18000);
  const trimmedCss = css.slice(0, 18000);
  return `Below is a structured signal blob extracted from the target website, plus raw HTML and CSS excerpts for additional context.

Use the structured signal as your PRIMARY source. Use the raw excerpts only for confirmation or when the signal is sparse.

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
  const components = sanitizeComponents(fmRaw.components);

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

function hostnameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Untitled";
  }
}
