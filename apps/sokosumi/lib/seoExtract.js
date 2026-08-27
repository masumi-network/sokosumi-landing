"use strict";

// Deterministic SEO extractor. Given a public URL it fetches the page (plus
// robots.txt), parses the real on-page signals with tolerant regexes — no
// headless browser, no LLM, no API key — and returns both a structured object
// (for the live preview) and a rendered SEO.md file. The output is meant to be
// dropped into a repo as durable context for AI agents doing SEO work.

const UA =
  "Mozilla/5.0 (compatible; SokosumiSEOBot/1.0; +https://sokosumi.com/tools/seo-md)";

// Pull the response body as text but stop after maxBytes so a hostile or huge
// page can't exhaust memory. Follows redirects and reports the final URL.
async function fetchCapped(url, { maxBytes = 2 * 1024 * 1024, timeoutMs = 12000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
    });
    const reader = res.body && res.body.getReader ? res.body.getReader() : null;
    let text = "";
    let bytes = 0;
    if (reader) {
      const decoder = new TextDecoder("utf-8", { fatal: false });
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        text += decoder.decode(value, { stream: true });
        if (bytes >= maxBytes) {
          try { await reader.cancel(); } catch { /* ignore */ }
          break;
        }
      }
      text += decoder.decode();
    } else {
      text = (await res.text()).slice(0, maxBytes);
    }
    return { finalUrl: res.url || url, status: res.status, headers: res.headers, text, truncated: bytes >= maxBytes };
  } finally {
    clearTimeout(timer);
  }
}

const decodeEntities = (s) =>
  String(s || "")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

const clean = (s) => decodeEntities(String(s || "").replace(/\s+/g, " ").trim());
const attrOf = (tag, name) => {
  const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i").exec(tag);
  return m ? decodeEntities(m[2] ?? m[3] ?? m[4] ?? "") : "";
};

// Strip scripts/styles/comments and tags, so word counts and h1 text reflect
// visible copy rather than markup.
function visibleText(html) {
  return clean(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style|noscript|template|svg)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function collectMeta(html) {
  const meta = {};
  const re = /<meta\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const key = (attrOf(tag, "name") || attrOf(tag, "property") || attrOf(tag, "itemprop")).toLowerCase();
    const content = attrOf(tag, "content");
    if (key && content && meta[key] === undefined) meta[key] = clean(content);
  }
  return meta;
}

// Some marquee/animation components repeat the same phrase inside one heading;
// collapse an immediately-doubled string back to a single copy so the reported
// H1 reads like the real headline.
function dedupeRepeat(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const n = words.length;
  for (const times of [2, 3]) {
    if (n < times || n % times !== 0) continue;
    const unit = n / times;
    let repeats = true;
    for (let i = unit; i < n && repeats; i++) {
      if (words[i] !== words[i % unit]) repeats = false;
    }
    if (repeats) return words.slice(0, unit).join(" ");
  }
  return text;
}

function collectHeadings(html) {
  const counts = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
  const h1 = [];
  const order = [];
  const re = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html))) {
    const level = m[1].toLowerCase();
    counts[level]++;
    order.push(Number(level[1]));
    if (level === "h1") {
      const text = dedupeRepeat(visibleText(m[2]));
      if (text) h1.push(text.slice(0, 200));
    }
  }
  // First place the outline skips a level (e.g. h1 → h3 with no h2 between).
  let skip = null;
  for (let i = 1; i < order.length && !skip; i++) {
    if (order[i] - order[i - 1] > 1) skip = `h${order[i - 1]} → h${order[i]}`;
  }
  return { counts, h1, skip };
}

function collectImages(html) {
  let total = 0;
  let withAlt = 0;
  const re = /<img\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    total++;
    const alt = attrOf(m[0], "alt");
    // A present, non-empty alt (or an explicit empty alt on a decorative image
    // is fine too, but we only credit descriptive alts here).
    if (/\balt\s*=/.test(m[0]) && alt.trim()) withAlt++;
  }
  return { total, withAlt, missingAlt: total - withAlt };
}

function collectLinks(html, baseUrl) {
  let internal = 0;
  let external = 0;
  let nofollow = 0;
  let host = "";
  try { host = new URL(baseUrl).hostname.replace(/^www\./, ""); } catch { /* ignore */ }
  const re = /<a\b[^>]*\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "").trim();
    if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) continue;
    if (/\brel\s*=\s*["']?[^"'>]*nofollow/i.test(m[0])) nofollow++;
    let target;
    try { target = new URL(href, baseUrl); } catch { continue; }
    if (!/^https?:$/.test(target.protocol)) continue;
    if (target.hostname.replace(/^www\./, "") === host) internal++;
    else external++;
  }
  return { internal, external, nofollow };
}

function collectJsonLd(html) {
  const types = [];
  const re = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(walk);
    const t = node["@type"];
    if (typeof t === "string") types.push(t);
    else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && types.push(x));
    if (node["@graph"]) walk(node["@graph"]);
  };
  while ((m = re.exec(html))) {
    try { walk(JSON.parse(m[1].trim())); } catch { /* ignore malformed blocks */ }
  }
  return [...new Set(types)];
}

function collectHreflang(html) {
  const langs = [];
  const re = /<link\b[^>]*\brel\s*=\s*["']?alternate["']?[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const lang = attrOf(m[0], "hreflang");
    if (lang) langs.push(lang);
  }
  return [...new Set(langs)];
}

// First declared icon (favicon or apple-touch-icon), resolved to an absolute URL.
function collectFavicon(html, baseUrl) {
  const re = /<link\b[^>]*>/gi;
  let m;
  let apple = "";
  while ((m = re.exec(html))) {
    const rel = attrOf(m[0], "rel").toLowerCase();
    const href = attrOf(m[0], "href");
    if (!href) continue;
    let abs;
    try { abs = new URL(href, baseUrl).href; } catch { continue; }
    if (/\bicon\b/.test(rel) && !/apple/.test(rel)) return abs;
    if (/apple-touch-icon/.test(rel) && !apple) apple = abs;
  }
  return apple;
}

async function fetchRobots(origin) {
  try {
    const { status, text } = await fetchCapped(`${origin}/robots.txt`, { maxBytes: 512 * 1024, timeoutMs: 6000 });
    if (status !== 200 || /<html/i.test(text)) return { found: false, sitemaps: [], blocksAll: false };
    const sitemaps = [];
    let blocksAll = false;
    let userAgentAll = false;
    for (const line of text.split(/\r?\n/)) {
      const [rawKey, ...rest] = line.split(":");
      const key = (rawKey || "").trim().toLowerCase();
      const value = rest.join(":").trim();
      if (key === "sitemap" && value) sitemaps.push(value);
      if (key === "user-agent") userAgentAll = value === "*";
      if (key === "disallow" && userAgentAll && value === "/") blocksAll = true;
    }
    return { found: true, sitemaps: [...new Set(sitemaps)], blocksAll };
  } catch {
    return { found: false, sitemaps: [], blocksAll: false, error: true };
  }
}

// Rule-based checks — each is a pass/warn/fail with a short reason and a weight,
// so the score leans on the signals that matter most (title, description,
// indexability, HTTPS carry more than, say, a missing favicon). Deterministic:
// the same page always scores the same way.
function buildChecks(d) {
  const checks = [];
  const add = (level, label, detail, weight = 1) => checks.push({ level, label, detail, weight });

  const titleLen = d.title ? d.title.length : 0;
  if (!d.title) add("fail", "Title tag", "No <title> found.", 3);
  else if (titleLen < 30) add("warn", "Title tag", `Short at ${titleLen} chars — aim for 30–60.`, 3);
  else if (titleLen > 60) add("warn", "Title tag", `Long at ${titleLen} chars — may truncate in search.`, 3);
  else add("pass", "Title tag", `${titleLen} chars.`, 3);

  const descLen = d.description ? d.description.length : 0;
  if (!d.description) add("fail", "Meta description", "No meta description found.", 3);
  else if (descLen < 70) add("warn", "Meta description", `Short at ${descLen} chars — aim for 70–160.`, 3);
  else if (descLen > 160) add("warn", "Meta description", `Long at ${descLen} chars — may truncate.`, 3);
  else add("pass", "Meta description", `${descLen} chars.`, 3);

  if (d.headings.counts.h1 === 0) add("fail", "H1 heading", "No H1 on the page.", 2);
  else if (d.headings.counts.h1 > 1) add("warn", "H1 heading", `${d.headings.counts.h1} H1s — one is usually best.`, 2);
  else add("pass", "H1 heading", "Exactly one H1.", 2);

  if (d.headings.skip) add("warn", "Heading structure", `Outline skips a level (${d.headings.skip}).`);
  else if (d.headings.counts.h2) add("pass", "Heading structure", "No skipped heading levels.");

  if (!d.canonical) add("warn", "Canonical URL", "No canonical link — duplicate-content risk.", 2);
  else if (d.canonicalOffHost) add("warn", "Canonical URL", `Points to another host (${d.canonicalOffHost}).`, 2);
  else add("pass", "Canonical URL", d.canonical, 2);

  if (d.robotsMeta && /noindex/i.test(d.robotsMeta)) add("fail", "Indexability", `Meta robots is "${d.robotsMeta}" — page is blocked from search.`, 3);
  else if (d.robots.blocksAll) add("fail", "Indexability", "robots.txt disallows all crawlers.", 3);
  else add("pass", "Indexability", "Open to crawlers.", 3);

  if (!d.lang) add("warn", "Language", "No lang attribute on <html>.");
  else add("pass", "Language", d.lang);

  if (!d.viewport) add("warn", "Mobile viewport", "No viewport meta — poor mobile rendering.", 2);
  else add("pass", "Mobile viewport", d.viewport, 2);

  if (!d.og["og:title"] && !d.og["og:image"]) add("warn", "Open Graph", "No Open Graph tags — weak link previews.", 2);
  else if (!d.og["og:image"]) add("warn", "Open Graph", "og:image missing — no preview image.", 2);
  else add("pass", "Open Graph", "Title and image present.", 2);

  if (d.images.total && d.images.missingAlt) add("warn", "Image alt text", `${d.images.missingAlt} of ${d.images.total} images missing alt.`);
  else if (d.images.total) add("pass", "Image alt text", "All images have alt text.");

  if (!d.jsonLd.length) add("warn", "Structured data", "No JSON-LD schema found.");
  else add("pass", "Structured data", d.jsonLd.join(", "));

  if (!d.favicon) add("warn", "Favicon", "No icon or apple-touch-icon declared.");
  else add("pass", "Favicon", "Declared.");

  if (!d.robots.found) add("warn", "robots.txt", "No robots.txt found.");
  else add("pass", "robots.txt", d.robots.sitemaps.length ? `Found, references ${d.robots.sitemaps.length} sitemap(s).` : "Found.");

  if (!d.sitemaps.length) add("warn", "XML sitemap", "No sitemap referenced or found.");
  else add("pass", "XML sitemap", d.sitemaps[0]);

  if (!d.https) add("fail", "HTTPS", "Final URL is not served over HTTPS.", 3);
  else add("pass", "HTTPS", "Served over HTTPS.", 3);

  return checks;
}

const FIELD = (label, value) => `- ${label}: ${value === "" || value == null ? "—" : value}`;

function renderSeoMd(d) {
  const L = [];
  L.push(`# SEO.md`);
  L.push(`> AI-readable SEO specification for ${d.hostname}`);
  L.push(`> Generated by Sokosumi · https://sokosumi.com/tools/seo-md`);
  L.push(``);
  L.push(`## Summary`);
  L.push(`- score: ${d.score}/100 (${d.pass} passed · ${d.warn} warnings · ${d.fail} failing)`);
  L.push(`- url: ${d.url}`);
  if (d.finalUrl && d.finalUrl !== d.url) L.push(`- final_url: ${d.finalUrl}`);
  L.push(`- fetched: ${new Date(d.fetchedAt).toISOString()}`);
  L.push(``);
  L.push(`## Identity`);
  L.push(FIELD("title", d.title ? `"${d.title}"` : ""));
  L.push(FIELD("title_length", d.title ? d.title.length : 0));
  L.push(FIELD("meta_description", d.description ? `"${d.description}"` : ""));
  L.push(FIELD("description_length", d.description ? d.description.length : 0));
  L.push(FIELD("canonical", d.canonical));
  L.push(FIELD("lang", d.lang));
  L.push(FIELD("robots_meta", d.robotsMeta));
  L.push(FIELD("charset", d.charset));
  L.push(FIELD("viewport", d.viewport));
  L.push(FIELD("favicon", d.favicon));
  L.push(``);
  L.push(`## Social`);
  L.push(FIELD("og:title", d.og["og:title"]));
  L.push(FIELD("og:description", d.og["og:description"]));
  L.push(FIELD("og:image", d.og["og:image"]));
  L.push(FIELD("og:type", d.og["og:type"]));
  L.push(FIELD("og:site_name", d.og["og:site_name"]));
  L.push(FIELD("twitter:card", d.twitter["twitter:card"]));
  L.push(FIELD("twitter:site", d.twitter["twitter:site"]));
  L.push(``);
  L.push(`## Structure`);
  L.push(FIELD("h1", d.headings.h1.length ? d.headings.h1.map((h) => `"${h}"`).join(", ") : ""));
  L.push(FIELD("heading_outline", Object.entries(d.headings.counts).filter(([, n]) => n).map(([k, n]) => `${k}×${n}`).join(" · ")));
  L.push(FIELD("word_count", d.wordCount));
  L.push(FIELD("images", `${d.images.total} (${d.images.withAlt} with alt, ${d.images.missingAlt} missing)`));
  L.push(FIELD("links", `${d.links.internal} internal, ${d.links.external} external, ${d.links.nofollow} nofollow`));
  L.push(FIELD("hreflang", d.hreflang.length ? d.hreflang.join(", ") : ""));
  L.push(``);
  L.push(`## Indexing`);
  L.push(FIELD("https", d.https ? "yes" : "no"));
  L.push(FIELD("robots_txt", d.robots.found ? "found" : "not found"));
  L.push(FIELD("sitemaps", d.sitemaps.length ? d.sitemaps.join(", ") : ""));
  L.push(FIELD("structured_data", d.jsonLd.length ? d.jsonLd.join(", ") : "none"));
  L.push(``);
  L.push(`## Checklist`);
  const mark = { pass: "x", warn: "~", fail: " " };
  for (const c of d.checks) L.push(`- [${mark[c.level]}] ${c.label} — ${c.detail}`);
  L.push(``);
  if (d.recommendations.length) {
    L.push(`## Recommendations`);
    d.recommendations.forEach((r, i) => L.push(`${i + 1}. ${r}`));
    L.push(``);
  }
  return L.join("\n");
}

function buildRecommendations(checks) {
  const priority = { fail: 0, warn: 1, pass: 2 };
  return checks
    .filter((c) => c.level !== "pass")
    .sort((a, b) => priority[a.level] - priority[b.level])
    .map((c) => `${c.label}: ${c.detail}`);
}

async function analyze(inputUrl) {
  const { finalUrl, status, headers, text, truncated } = await fetchCapped(inputUrl);
  if (status >= 400) {
    const err = new Error(`The site returned HTTP ${status}.`);
    err.statusCode = status;
    throw err;
  }
  if (!/</.test(text)) throw new Error("That URL did not return an HTML page.");

  const head = (/[\s\S]*?<\/head>/i.exec(text) || [text])[0];
  const meta = collectMeta(text);
  const parsedFinal = new URL(finalUrl);
  const origin = parsedFinal.origin;

  const titleMatch = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(head);
  const title = titleMatch ? clean(titleMatch[1]) : "";
  const canonicalTag = /<link\b[^>]*\brel\s*=\s*["']?canonical["']?[^>]*>/i.exec(head);
  const canonical = canonicalTag ? attrOf(canonicalTag[0], "href") : "";
  const htmlTag = /<html\b[^>]*>/i.exec(text);
  const lang = htmlTag ? attrOf(htmlTag[0], "lang") : "";
  const charsetTag = /<meta\b[^>]*charset\s*=\s*["']?([\w-]+)/i.exec(head);
  const charset = charsetTag ? charsetTag[1].toLowerCase() : (meta["content-type"] ? "" : "");

  const og = {};
  const twitter = {};
  for (const [k, v] of Object.entries(meta)) {
    if (k.startsWith("og:")) og[k] = v;
    if (k.startsWith("twitter:")) twitter[k] = v;
  }

  const headings = collectHeadings(text);
  const images = collectImages(text);
  const links = collectLinks(text, finalUrl);
  const jsonLd = collectJsonLd(text);
  const hreflang = collectHreflang(head);
  const favicon = collectFavicon(head, finalUrl);
  const robots = await fetchRobots(origin);

  // Flag a canonical that points at a different host (a common misconfiguration
  // that de-indexes the page). Same-host path differences are legitimate.
  let canonicalOffHost = "";
  if (canonical) {
    try {
      const cu = new URL(canonical, finalUrl);
      if (cu.hostname.replace(/^www\./, "") !== parsedFinal.hostname.replace(/^www\./, "")) canonicalOffHost = cu.hostname;
    } catch { /* ignore unparseable canonical */ }
  }

  // Sitemaps: prefer those declared in robots.txt, fall back to the conventional
  // path (which we don't verify here — that would be another fetch per guess).
  const sitemaps = robots.sitemaps.length ? robots.sitemaps : [];

  const d = {
    url: inputUrl,
    finalUrl,
    hostname: parsedFinal.hostname,
    https: parsedFinal.protocol === "https:",
    fetchedAt: Date.now(),
    truncated,
    title,
    description: meta["description"] || "",
    canonical,
    canonicalOffHost,
    favicon,
    lang,
    charset,
    viewport: meta["viewport"] || "",
    robotsMeta: meta["robots"] || "",
    xRobotsTag: headers.get ? headers.get("x-robots-tag") || "" : "",
    og,
    twitter,
    headings,
    images,
    links,
    jsonLd,
    hreflang,
    robots,
    sitemaps,
    wordCount: visibleText((/[\s\S]*?<body[^>]*>([\s\S]*)<\/body>/i.exec(text) || [null, text])[1] || text)
      .split(/\s+/)
      .filter(Boolean).length,
  };

  d.checks = buildChecks(d);
  d.pass = d.checks.filter((c) => c.level === "pass").length;
  d.warn = d.checks.filter((c) => c.level === "warn").length;
  d.fail = d.checks.filter((c) => c.level === "fail").length;
  // Weighted score: full credit for passes, half for warnings, nothing for
  // fails — each scaled by the check's weight so critical signals dominate.
  const credit = { pass: 1, warn: 0.5, fail: 0 };
  const totalWeight = d.checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = d.checks.reduce((sum, c) => sum + c.weight * credit[c.level], 0);
  d.score = totalWeight ? Math.round((earned / totalWeight) * 100) : 0;
  d.recommendations = buildRecommendations(d.checks);
  d.seoMd = renderSeoMd(d);
  return d;
}

module.exports = { analyze, renderSeoMd };
