import type { Frontmatter, Typography } from "./design-md";

const MODEL = "anthropic/claude-haiku-4.5";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM = `You extract a brand's design system from raw HTML and CSS. Output STRICT JSON, no markdown fences, no commentary, no extra prose. Pick brand-distinctive values (not generic black/white). Use real font families found in the CSS (skip system-ui, sans-serif, inherit). For radii, prefer values in the 4-32px range; skip 50% (avatars) and 1px (shadow tricks). For colors, identify the brand's signature accent colors — not just the most frequent neutrals.`;

const SHAPE = `{
  "name": "Brand Name",
  "description": "One-sentence brand summary in plain language.",
  "colors": {
    "primary": "#hex",
    "secondary": "#hex",
    "tertiary": "#hex",
    "neutral": "#hex",
    "surface": "#hex"
  },
  "typography": {
    "h1": { "fontFamily": "Real Font", "fontSize": "3rem", "fontWeight": 600, "lineHeight": 1.1 },
    "h2": { "fontFamily": "Real Font", "fontSize": "2rem", "fontWeight": 500, "lineHeight": 1.2 },
    "body-md": { "fontFamily": "Real Font", "fontSize": "1rem", "lineHeight": 1.5 }
  },
  "rounded": { "sm": "4px", "md": "8px", "lg": "16px" },
  "components": {
    "button-primary": {
      "backgroundColor": "{colors.primary}",
      "textColor": "#ffffff",
      "rounded": "{rounded.sm}",
      "padding": "12px 24px"
    }
  },
  "voice": "One-sentence summary of the brand's tone of voice."
}`;

type LlmResult = {
  frontmatter: Frontmatter;
  prose: { heading: string; body: string }[];
} | null;

const cache = new Map<string, { ts: number; result: LlmResult }>();
const TTL_MS = 60 * 60 * 1000;

export async function llmExtract(
  url: string,
  html: string,
  css: string,
): Promise<LlmResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  const cacheKey = `${MODEL}:${url}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < TTL_MS) return cached.result;

  const prompt = buildPrompt(url, html, css);

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
        temperature: 0.2,
        max_tokens: 1500,
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") return null;

  const parsed = parseJsonLoose(content);
  if (!parsed || typeof parsed !== "object") return null;

  const result = shape(parsed as Record<string, unknown>, url);
  cache.set(cacheKey, { ts: Date.now(), result });
  return result;
}

function buildPrompt(url: string, html: string, css: string): string {
  const trimmedHtml = html.slice(0, 25000);
  const trimmedCss = css.slice(0, 25000);
  return `Site URL: ${url}

Return JSON matching this exact shape:
${SHAPE}

HTML (excerpt):
${trimmedHtml}

CSS (excerpt):
${trimmedCss}`;
}

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

function shape(raw: Record<string, unknown>, url: string): LlmResult {
  const name =
    typeof raw.name === "string" && raw.name.trim()
      ? raw.name.trim()
      : new URL(url).hostname.replace(/^www\./, "");
  const description =
    typeof raw.description === "string" ? raw.description.slice(0, 240) : "";
  const colors = sanitizeColors(raw.colors);
  const typography = sanitizeTypography(raw.typography);
  const rounded = sanitizeKeyValueStrings(raw.rounded);
  const components = sanitizeComponents(raw.components);
  const voice = typeof raw.voice === "string" ? raw.voice.trim() : "";

  const frontmatter: Frontmatter = {
    version: "alpha",
    name,
    description,
    colors,
    typography,
    rounded,
    spacing: { sm: "8px", md: "16px", lg: "32px" },
    components: components ?? buildFallbackComponent(colors, rounded),
  };

  const prose: { heading: string; body: string }[] = [
    {
      heading: "Overview",
      body: `Generated from [${name}](${url}). ${description}`.trim(),
    },
  ];
  if (voice) prose.push({ heading: "Voice", body: voice });

  const colorLines = Object.entries(colors)
    .map(([k, v]) => `- **${k}** (\`${v}\`)`)
    .join("\n");
  if (colorLines) prose.push({ heading: "Colors", body: colorLines });

  return { frontmatter, prose };
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
    if (typeof t.fontWeight === "number" || typeof t.fontWeight === "string") entry.fontWeight = t.fontWeight as number | string;
    if (typeof t.lineHeight === "number" || typeof t.lineHeight === "string") entry.lineHeight = t.lineHeight as number | string;
    if (typeof t.letterSpacing === "string") entry.letterSpacing = t.letterSpacing;
    if (Object.keys(entry).length > 0) out[k] = entry;
  }
  return out;
}

function sanitizeKeyValueStrings(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
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

function buildFallbackComponent(
  colors: Record<string, string>,
  rounded: Record<string, string>,
) {
  if (!colors.primary) return undefined;
  const radiusKey = rounded.sm ? "sm" : rounded.md ? "md" : null;
  return {
    "button-primary": {
      backgroundColor: "{colors.primary}",
      textColor: "#ffffff",
      ...(radiusKey ? { rounded: `{rounded.${radiusKey}}` } : {}),
      padding: "12px 24px",
    },
  };
}
