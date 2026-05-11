import * as cheerio from "cheerio";
import type { Frontmatter, Typography } from "./design-md";
import { llmExtract, type LlmMeta } from "./llm-extract";
import { preprocessSite } from "./preprocess";
import { renderWithBrowserbase, type RenderedPage } from "./render";

const HEX_RE = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g;
const RGB_RE = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/g;

export type ExtractResult = {
  frontmatter: Frontmatter;
  prose: { heading: string; body: string }[];
  source: "llm" | "heuristic";
  meta?: LlmMeta;
  screenshot?: { mime: string; base64: string };
};

export async function extractFromUrl(
  rawUrl: string,
  opts?: { force?: boolean },
): Promise<ExtractResult> {
  const url = normalizeUrl(rawUrl);

  // Primary path: Browserbase rendering. Captures HTML *after* JS runs +
  // viewport screenshot + computed styles of key elements.
  let rendered: RenderedPage | null = null;
  try {
    rendered = await renderWithBrowserbase(url);
  } catch {
    rendered = null;
  }

  let html: string;
  if (rendered) {
    html = rendered.html;
  } else {
    // Fallback: plain fetch (works for SSR'd marketing sites, fails for SPAs)
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url} (HTTP ${res.status})`);
    }
    html = await res.text();
  }

  const $ = cheerio.load(html);

  const cssTexts: string[] = [];
  $("style").each((_, el) => {
    cssTexts.push($(el).text());
  });
  const cssLinks: string[] = [];
  $('link[rel="stylesheet"][href]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) cssLinks.push(absolutize(href, url));
  });

  const fetched = await Promise.allSettled(
    cssLinks.slice(0, 5).map((u) =>
      fetch(u, { redirect: "follow" }).then((r) =>
        r.ok ? r.text() : Promise.reject(),
      ),
    ),
  );
  for (const result of fetched) {
    if (result.status === "fulfilled") cssTexts.push(result.value);
  }

  const allCss = cssTexts.join("\n");

  const signal = preprocessSite(url, $, html, allCss);
  if (rendered) {
    signal.computed = rendered.computed;
  }
  const llm = await llmExtract(url, signal, html, allCss, rendered, {
    force: opts?.force === true,
  });
  if (llm) {
    const screenshot =
      rendered?.screenshotBase64 && rendered.screenshotMime
        ? {
            mime: rendered.screenshotMime,
            base64: rendered.screenshotBase64,
          }
        : undefined;
    return {
      frontmatter: llm.frontmatter,
      prose: llm.prose,
      source: "llm",
      meta: llm.meta,
      ...(screenshot ? { screenshot } : {}),
    };
  }

  const allText = html + "\n" + allCss;
  const colors = extractColors(allText);
  const fonts = extractFonts(allCss, $);
  const radii = extractRadii(allCss);

  const siteName =
    $('meta[property="og:site_name"]').attr("content") ||
    $("title").text().split(/[|·–\-]/)[0].trim() ||
    new URL(url).hostname.replace(/^www\./, "");

  const description =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";

  const frontmatter: Frontmatter = {
    version: "alpha",
    name: siteName,
    description: description.slice(0, 240),
    colors,
    typography: fonts,
    rounded: radii,
    spacing: { sm: "8px", md: "16px", lg: "32px" },
    components: buildComponents(colors, radii),
  };

  const prose = [
    {
      heading: "Overview",
      body: `Generated from [${siteName}](${url}). ${description}`.trim(),
    },
    {
      heading: "Colors",
      body: Object.entries(colors)
        .map(([k, v]) => `- **${k}** (\`${v}\`)`)
        .join("\n"),
    },
  ];

  return { frontmatter, prose, source: "heuristic" };
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function absolutize(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function extractColors(text: string): Record<string, string> {
  const counts = new Map<string, number>();

  const skip = (hex: string) => {
    const lower = hex.toLowerCase();
    return lower === "#000000" || lower === "#ffffff" || lower === "#fff" || lower === "#000";
  };

  let m: RegExpExecArray | null;
  while ((m = HEX_RE.exec(text))) {
    const hex = normalizeHex(m[0]);
    if (skip(hex)) continue;
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }

  while ((m = RGB_RE.exec(text))) {
    const hex = rgbToHex(Number(m[1]), Number(m[2]), Number(m[3]));
    if (skip(hex)) continue;
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 6).map(([h]) => h);

  const result: Record<string, string> = {};
  const slots = ["primary", "secondary", "tertiary", "accent", "neutral", "surface"];
  top.forEach((hex, i) => {
    if (slots[i]) result[slots[i]] = hex;
  });

  return result;
}

function normalizeHex(hex: string): string {
  const m = hex.replace("#", "");
  if (m.length === 3) {
    return ("#" + m[0] + m[0] + m[1] + m[1] + m[2] + m[2]).toLowerCase();
  }
  return ("#" + m).toLowerCase();
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return ("#" + toHex(r) + toHex(g) + toHex(b)).toLowerCase();
}

function extractFonts(
  css: string,
  $: cheerio.CheerioAPI,
): Record<string, Typography> {
  const families = new Set<string>();
  const fontFamilyRe = /font-family\s*:\s*([^;}\n]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = fontFamilyRe.exec(css))) {
    const first = m[1].split(",")[0].trim().replace(/['"]/g, "");
    if (first && !/^(sans-serif|serif|monospace|system-ui|inherit|initial|var\()/i.test(first)) {
      families.add(first);
    }
  }

  const googleFamilies = new Set<string>();
  $('link[href*="fonts.googleapis.com"][href]').each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const re = /family=([^&:]+)/g;
    let mm: RegExpExecArray | null;
    while ((mm = re.exec(href))) {
      googleFamilies.add(decodeURIComponent(mm[1]).replace(/\+/g, " "));
    }
  });

  const display = [...googleFamilies, ...families][0];
  const body = [...families, ...googleFamilies][0] ?? display;

  const typography: Record<string, Typography> = {};
  if (display) {
    typography["h1"] = { fontFamily: display, fontSize: "3rem", fontWeight: 600, lineHeight: 1.1 };
    typography["h2"] = { fontFamily: display, fontSize: "2rem", fontWeight: 500, lineHeight: 1.2 };
  }
  if (body) {
    typography["body-md"] = { fontFamily: body, fontSize: "1rem", lineHeight: 1.5 };
    typography["body-sm"] = { fontFamily: body, fontSize: "0.875rem", lineHeight: 1.5 };
  }
  return typography;
}

function extractRadii(css: string): Record<string, string> {
  const counts = new Map<string, number>();
  const re = /border-radius\s*:\s*([^;}\n]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const value = m[1].trim().split(/\s+/)[0];
    if (/^(0|none)$/.test(value)) continue;
    if (!/^[0-9.]+(px|em|rem|%)$/.test(value)) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const result: Record<string, string> = {};
  if (sorted[0]) result["sm"] = sorted[0][0];
  if (sorted[1]) result["md"] = sorted[1][0];
  if (sorted[2]) result["lg"] = sorted[2][0];
  if (Object.keys(result).length === 0) {
    return { sm: "4px", md: "8px", lg: "16px" };
  }
  return result;
}

function buildComponents(
  colors: Record<string, string>,
  radii: Record<string, string>,
) {
  if (!colors.primary) return undefined;
  return {
    "button-primary": {
      backgroundColor: "{colors.primary}",
      textColor: "#ffffff",
      rounded: `{rounded.${radii.sm ? "sm" : "md"}}`,
      padding: "12px 24px",
    },
  };
}
