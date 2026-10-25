import * as cheerio from "cheerio";
import type { Frontmatter } from "./design-md";
import { brandName, buildHeuristic, tidyFrontmatter, withMeasuredType } from "./heuristic";
import { llmExtract, type LlmMeta } from "./llm-extract";
import { preprocessSite } from "./preprocess";
import { renderWithBrowserbase, type RenderedPage } from "./render";
import { assertPublicUrl, normalizeUrl } from "./url-guard";

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
  // Refuse anything that resolves to a private or link-local address before a
  // single request goes out. The Browserbase path is someone else's network,
  // but the fetch() fallback below runs on our own server, so an unguarded
  // URL here is server-side request forgery.
  await assertPublicUrl(url);

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

  // Gallery thumbnail uses the bigger clipped full-page capture when we
  // have it; otherwise falls back to the viewport-only shot.
  const thumbBase64 = rendered?.thumbnailBase64 ?? rendered?.screenshotBase64;
  const thumbMime = rendered?.thumbnailMime ?? rendered?.screenshotMime;
  const screenshot =
    thumbBase64 && thumbMime ? { mime: thumbMime, base64: thumbBase64 } : undefined;

  if (llm) {
    // On a subpage the model tends to name the brand after the page title
    // ("About Us"), so there the name comes from og:site_name or the domain.
    const isHome = new URL(url).pathname.replace(/\/+$/, "") === "";
    const name =
      isHome && !signal.meta.siteName ? llm.frontmatter.name : brandName(signal);
    return {
      frontmatter: tidyFrontmatter(withMeasuredType({ ...llm.frontmatter, name }, signal)),
      prose: llm.prose,
      source: "llm",
      meta: llm.meta,
      ...(screenshot ? { screenshot } : {}),
    };
  }

  console.warn(`[extract] LLM unavailable for ${url}, using heuristic fallback`);
  return {
    ...buildHeuristic(signal, allCss),
    source: "heuristic",
    ...(screenshot ? { screenshot } : {}),
  };
}

function absolutize(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}
