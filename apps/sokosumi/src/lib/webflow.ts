import fs from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "src/content/webflow");

export type WebflowPageData = {
  title: string;
  description: string;
  bodyClass: string;
  bodyHtml: string;
  bodyScripts: string[];
  headStylesheets: string[];
  jsonLd: string[];
  inlineHeadStyles: string[];
};

const cache = new Map<string, WebflowPageData>();

function rewriteAssetPaths(html: string): string {
  // Webflow exports use ./assets/, ./css/, ./js/, ./data/. In Next.js,
  // files under public/ are served at root, so map ./ → /.
  return html
    .replace(/(["'(])\.\/assets\//g, "$1/assets/")
    .replace(/(["'(])\.\/css\//g, "$1/css/")
    .replace(/(["'(])\.\/js\//g, "$1/js/")
    .replace(/(["'(])\.\/data\//g, "$1/data/")
    .replace(/(["'(])\.\/ai-agents\//g, "$1/ai-agents/")
    // Bare hrefs like href="./agents" → "/agents" (route, not asset)
    .replace(/(href|src)=(["'])\.\//g, '$1=$2/');
}

export function loadWebflowPage(relPath: string): WebflowPageData {
  const cached = cache.get(relPath);
  if (cached) return cached;

  const fullPath = path.join(CONTENT_DIR, relPath);
  const html = fs.readFileSync(fullPath, "utf8");

  // Title + description from <title> and <meta name="description">.
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? "Sokosumi";
  const description =
    html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] ?? "";

  // Stylesheets — collect every <link rel="stylesheet" href="...">. Loaded
  // globally in the webflow layout via next/link tags.
  const headStylesheets: string[] = [];
  const linkRe = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
  for (const linkTag of html.matchAll(linkRe)) {
    const hrefMatch = linkTag[0].match(/href=["']([^"']+)["']/);
    if (hrefMatch) {
      headStylesheets.push(hrefMatch[1].replace(/^\.\//, "/"));
    }
  }

  // JSON-LD (schema.org structured data) — keep as raw strings so each
  // entry survives unmodified.
  const jsonLd: string[] = [];
  const jsonLdRe =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const m of html.matchAll(jsonLdRe)) {
    jsonLd.push(m[1].trim());
  }

  // Inline <style> blocks in <head> — must be preserved (they define CSS
  // variables, fonts, etc. that the body markup depends on).
  const inlineHeadStyles: string[] = [];
  const headOnly = html.match(/<head[^>]*>([\s\S]*?)<\/head>/)?.[1] ?? "";
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  for (const m of headOnly.matchAll(styleRe)) {
    inlineHeadStyles.push(m[1]);
  }

  // Extract body element and its class.
  const bodyMatch = html.match(/<body([^>]*)>([\s\S]*?)<\/body>/);
  const bodyAttrs = bodyMatch?.[1] ?? "";
  const bodyClass = bodyAttrs.match(/class=["']([^"']+)["']/)?.[1] ?? "";
  let bodyHtml = bodyMatch?.[2] ?? "";

  // Pull external <script src="..."> tags out of the body — we'll load
  // them via next/script after the inner HTML mounts. Inline <script>
  // blocks (without src) stay in place; they typically wire Webflow widgets.
  const bodyScripts: string[] = [];
  const scriptSrcRe =
    /<script[^>]*src=["']([^"']+)["'][^>]*>\s*<\/script>/gi;
  for (const m of bodyHtml.matchAll(scriptSrcRe)) {
    bodyScripts.push(m[1].replace(/^\.\//, "/"));
  }
  bodyHtml = bodyHtml.replace(scriptSrcRe, "");

  // Rewrite relative paths to absolute.
  bodyHtml = rewriteAssetPaths(bodyHtml);

  const data: WebflowPageData = {
    title,
    description,
    bodyClass,
    bodyHtml,
    bodyScripts,
    headStylesheets,
    jsonLd,
    inlineHeadStyles,
  };
  cache.set(relPath, data);
  return data;
}

export function listAiAgentSlugs(): string[] {
  const dir = path.join(CONTENT_DIR, "ai-agents");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".html"))
    .map((f) => f.replace(/\.html$/, ""));
}
