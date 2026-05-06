import type { Frontmatter, Typography } from "./design-md";
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

const SYSTEM = `You are a senior brand designer producing a DESIGN.md file for AI coding agents.

Your job is to look at a website's structured signal blob and raw HTML/CSS samples and produce a *believable, brand-distinctive* design system — not generic defaults.

Hard rules:
- Output STRICT JSON. No markdown fences. No commentary. No prose outside the JSON.
- Pick brand-distinctive colors. If you see a CSS variable named --primary, --brand, --accent, or a Tailwind arbitrary class like bg-[#xxx] in a hero/CTA, that's your primary. Skip near-black and near-white when picking accents.
- Use real font families found in Google Fonts links or font-family declarations. Do not invent fonts. Skip system-ui, sans-serif, inherit.
- Radii: prefer values in the 4-32px range, plus optionally a "full: 9999px" for pills. Skip 50% (avatars) and 1px (borders/shadow tricks).
- Components must use token references like "{colors.primary}" so the design system is wired up, not hardcoded.
- Voice should be a paragraph (3-5 sentences) describing tone, audience, and brand personality — not a tagline.
- Do's and Don'ts: 4-6 specific rules each, written as imperatives. Be opinionated.
- If something is genuinely unknowable, omit the field rather than invent a vague placeholder.`;

const SCHEMA = `{
  "frontmatter": {
    "version": "alpha",
    "name": "Brand name",
    "description": "1-2 sentence summary of what the brand does and who it serves.",
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
    "rounded":  { "sm": "4px", "md": "8px", "lg": "16px", "xl": "24px", "full": "9999px" },
    "spacing":  { "xs": "4px", "sm": "8px", "md": "16px", "lg": "32px", "xl": "64px" },
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
    "overview":    "1-2 paragraphs about the brand: what they do, who they serve, what makes them visually distinctive.",
    "voice":       "Paragraph describing tone of voice, vocabulary patterns, and brand personality. Include 1-2 example sentences in the brand's voice.",
    "colorUsage":  "Paragraph: which color goes where. e.g. 'Primary on CTAs and key data viz only. Secondary as supporting structure. Tertiary sparingly for highlights.'",
    "layoutNotes": "Paragraph: typical page rhythm, container behavior, white-space philosophy.",
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

  const cacheKey = `${MODEL}:v2:${url}`;
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
        "x-title": "Sokosumi DESIGN.md Creator",
        "http-referer": "https://sokosumi.com/tools/design-md-creator",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 3000,
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

  const result = shape(parsed as RawShape, url, {
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

function shape(raw: RawShape, url: string, meta: LlmMeta): LlmResult {
  const fmRaw = (raw.frontmatter ?? {}) as Record<string, unknown>;
  const proseRaw = (raw.prose ?? {}) as Record<string, unknown>;

  const name = sanitizeString(fmRaw.name) || hostnameFromUrl(url);
  const description = sanitizeString(fmRaw.description, 320);
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
    ...(Object.keys(colors).length ? { colors } : {}),
    ...(Object.keys(typography).length ? { typography } : {}),
    ...(Object.keys(rounded).length ? { rounded } : {}),
    ...(Object.keys(spacing).length ? { spacing } : {}),
    ...(Object.keys(elevation).length ? { elevation } : {}),
    ...(layout ? { layout } : {}),
    ...(components ? { components } : {}),
  };

  const prose: { heading: string; body: string }[] = [];
  const overview = sanitizeString(proseRaw.overview, 1200);
  const voice = sanitizeString(proseRaw.voice, 800);
  const colorUsage = sanitizeString(proseRaw.colorUsage, 600);
  const layoutNotes = sanitizeString(proseRaw.layoutNotes, 600);
  const dos = sanitizeStringArray(proseRaw.dos, 8);
  const donts = sanitizeStringArray(proseRaw.donts, 8);

  if (overview) prose.push({ heading: "Overview", body: overview });
  if (voice) prose.push({ heading: "Voice", body: voice });
  if (colorUsage) prose.push({ heading: "Color usage", body: colorUsage });
  if (layoutNotes) prose.push({ heading: "Layout", body: layoutNotes });
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
    .map((s) => s.trim().slice(0, 200))
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
