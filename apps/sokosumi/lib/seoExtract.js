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

// Internal-link frequency is a decent proxy for which pages a site considers
// important: the header/footer/CTA links that repeat across the page rise to the
// top. We rank those and keep the first descriptive anchor for each — no crawl.
function collectLinks(html, baseUrl) {
  let internal = 0;
  let external = 0;
  let nofollow = 0;
  let host = "";
  try { host = new URL(baseUrl).hostname.replace(/^www\./, ""); } catch { /* ignore */ }
  const pages = new Map();
  const re = /<a\b([^>]*?)\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))([^>]*)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = decodeEntities(m[3] ?? m[4] ?? m[5] ?? "").trim();
    if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) continue;
    const tagAttrs = (m[1] || "") + " " + (m[6] || "");
    if (/\brel\s*=\s*["']?[^"'>]*nofollow/i.test(tagAttrs)) nofollow++;
    let target;
    try { target = new URL(href, baseUrl); } catch { continue; }
    if (!/^https?:$/.test(target.protocol)) continue;
    if (target.hostname.replace(/^www\./, "") === host) {
      internal++;
      const path = (target.pathname + target.search).replace(/\/+$/, "") || "/";
      if (path === "/") continue; // home link is not an "important page" signal
      const anchor = visibleText(m[7]).slice(0, 80);
      const entry = pages.get(path) || { count: 0, anchor: "" };
      entry.count++;
      if (!entry.anchor && anchor) entry.anchor = anchor;
      pages.set(path, entry);
    } else {
      external++;
    }
  }
  const topInternal = [...pages.entries()]
    .map(([path, v]) => ({ path, count: v.count, anchor: v.anchor }))
    .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path))
    .slice(0, 12);
  return { internal, external, nofollow, topInternal };
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

// Common English function words — dropped so keyword counts reflect the page's
// actual subject matter, not "the/and/for". Deliberately small and static so the
// extractor stays deterministic and dependency-free.
const STOPWORDS = new Set(
  ("a an the and or but if then else for to of in on at by with from up down out over under again " +
    "once here there all any both each few more most other some such no nor not only own same so than too very " +
    "can will just should now is are was were be been being have has had do does did this that these those it its " +
    "as we you your our their they them he she his her who what which when where why how also into through about " +
    "per via etc our us your yours www com http https one two three get got make made use used using new like").split(/\s+/),
);

// Term-frequency keywords: single words and two-word phrases, minus stopwords.
// Terms that also appear in the title or H1 get a small boost so the page's own
// emphasis surfaces first.
function collectKeywords(text, emphasis) {
  const words = text.toLowerCase().match(/[a-z][a-z0-9'’+-]{1,}/g) || [];
  const uni = new Map();
  const bi = new Map();
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const wOk = w.length >= 3 && !STOPWORDS.has(w);
    if (wOk) uni.set(w, (uni.get(w) || 0) + 1);
    if (i + 1 < words.length) {
      const b = words[i + 1];
      if (wOk && b.length >= 3 && !STOPWORDS.has(b)) {
        const key = `${w} ${b}`;
        bi.set(key, (bi.get(key) || 0) + 1);
      }
    }
  }
  const emph = new Set((String(emphasis || "").toLowerCase().match(/[a-z][a-z0-9'’+-]{2,}/g) || []));
  const rank = (map, limit) =>
    [...map.entries()]
      .filter(([, c]) => c >= 2)
      .map(([term, count]) => ({ term, count, w: count + (term.split(" ").every((t) => emph.has(t)) ? 2 : 0) }))
      .sort((a, b) => b.w - a.w || b.count - a.count || a.term.localeCompare(b.term))
      .slice(0, limit)
      .map(({ term, count }) => ({ term, count }));
  return { terms: rank(uni, 12), phrases: rank(bi, 8) };
}

const stripTags = (s) => clean(String(s || "").replace(/<[^>]+>/g, " "));

// Walk every JSON-LD block and pull the things an answer engine cares about:
// named entities (Organization, Product, Person…) and explicit Q&A pairs
// (FAQPage / Question → acceptedAnswer). Only what the page actually declares.
const NAMED_ENTITY =
  /^(Organization|Corporation|LocalBusiness|OnlineBusiness|WebSite|Product|SoftwareApplication|Service|Person|Brand|Article|NewsArticle|BlogPosting|Book|Course|Event|Place|Recipe)$/i;

const asText = (v) => {
  if (v == null) return "";
  if (typeof v === "string") return clean(v);
  if (typeof v === "number") return String(v);
  if (typeof v === "object") return clean(v.name || v.text || v.value || "");
  return "";
};

function collectEntities(html) {
  const entities = [];
  const answers = [];
  const sameAs = new Set();
  let org = null;
  const seen = new Set();
  const typeOf = (n) => (Array.isArray(n["@type"]) ? n["@type"][0] : n["@type"]);
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(walk);
    if (node.sameAs) {
      const arr = Array.isArray(node.sameAs) ? node.sameAs : [node.sameAs];
      arr.forEach((u) => typeof u === "string" && u.trim() && sameAs.add(u.trim()));
    }
    const type = typeOf(node);
    if (typeof type === "string") {
      if (/^Question$/i.test(type) && node.name) {
        const acc = node.acceptedAnswer;
        const ans = acc && (acc.text || (Array.isArray(acc) && acc[0] && acc[0].text));
        if (answers.length < 15) answers.push({ q: stripTags(node.name).slice(0, 200), a: stripTags(ans).slice(0, 300) });
      } else if (NAMED_ENTITY.test(type) && typeof node.name === "string" && node.name.trim()) {
        const name = clean(node.name).slice(0, 120);
        const key = `${type}|${name.toLowerCase()}`;
        if (!seen.has(key) && entities.length < 20) {
          seen.add(key);
          entities.push({ type, name });
        }
        // Capture the first organization-like node's public business details.
        if (!org && /^(Organization|Corporation|LocalBusiness|OnlineBusiness)$/i.test(type)) {
          const addr = node.address && typeof node.address === "object" ? node.address : {};
          const founders = [].concat(node.founder || []).map(asText).filter(Boolean);
          org = {
            name,
            legalName: clean(node.legalName || ""),
            foundingDate: clean(node.foundingDate || ""),
            email: clean(node.email || ""),
            telephone: clean(node.telephone || ""),
            employees: asText(node.numberOfEmployees),
            location: clean([addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean).join(", ")),
            founders,
          };
        }
      }
    }
    for (const k of Object.keys(node)) {
      if (k === "@context") continue;
      walk(node[k]);
    }
  };
  const re = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try { walk(JSON.parse(m[1].trim())); } catch { /* ignore malformed blocks */ }
  }
  return { entities, answers, sameAs: [...sameAs], org };
}

// Social profiles: from JSON-LD sameAs plus any page link to a known network.
const SOCIAL_NETWORKS = [
  { network: "X / Twitter", re: /(?:^|\.)(?:twitter\.com|x\.com)$/i },
  { network: "LinkedIn", re: /(?:^|\.)linkedin\.com$/i },
  { network: "Facebook", re: /(?:^|\.)facebook\.com$/i },
  { network: "Instagram", re: /(?:^|\.)instagram\.com$/i },
  { network: "YouTube", re: /(?:^|\.)(?:youtube\.com|youtu\.be)$/i },
  { network: "GitHub", re: /(?:^|\.)github\.com$/i },
  { network: "TikTok", re: /(?:^|\.)tiktok\.com$/i },
  { network: "Discord", re: /(?:^|\.)discord(?:app)?\.(?:com|gg)$/i },
  { network: "Threads", re: /(?:^|\.)threads\.net$/i },
  { network: "Mastodon", re: /(?:^|\.)mastodon\./i },
  { network: "Pinterest", re: /(?:^|\.)pinterest\./i },
  { network: "Reddit", re: /(?:^|\.)reddit\.com$/i },
];

function classifySocial(url) {
  try {
    const host = new URL(url).hostname;
    const hit = SOCIAL_NETWORKS.find((s) => s.re.test(host));
    return hit ? hit.network : "";
  } catch { return ""; }
}

function collectSocial(html, sameAs, baseUrl) {
  const found = new Map();
  const consider = (url) => {
    const net = classifySocial(url);
    if (net && !found.has(net)) found.set(net, url.trim());
  };
  sameAs.forEach(consider);
  const re = /<a\b[^>]*\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "").trim();
    if (!href) continue;
    try { consider(new URL(href, baseUrl).href); } catch { /* ignore */ }
  }
  return [...found.entries()].map(([network, url]) => ({ network, url }));
}

// Primary navigation: the <nav> with the most links, as label → path pairs.
function collectNav(html, baseUrl) {
  const navs = [];
  const re = /<nav\b[^>]*>([\s\S]*?)<\/nav>/gi;
  let m;
  while ((m = re.exec(html))) navs.push(m[1]);
  let best = "";
  let bestCount = 0;
  for (const n of navs) {
    const c = (n.match(/<a\b/gi) || []).length;
    if (c > bestCount) { best = n; bestCount = c; }
  }
  const items = [];
  const seen = new Set();
  const linkRe = /<a\b[^>]*\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  let a;
  while ((a = linkRe.exec(best))) {
    const href = decodeEntities(a[2] ?? a[3] ?? a[4] ?? "").trim();
    const label = visibleText(a[5]).slice(0, 60);
    if (!label || /^(#|javascript:|mailto:|tel:)/i.test(href)) continue;
    let path = href;
    try { const u = new URL(href, baseUrl); path = (u.pathname + u.search) || "/"; } catch { /* keep raw */ }
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ label, path });
    if (items.length >= 12) break;
  }
  return items;
}

// Classify known site sections from internal paths, so the report can say which
// content areas exist (blog, docs, pricing…) without crawling them.
const SECTION_RULES = [
  { label: "Product / services", re: /^\/(?:products?|solutions?|services?|features?|platform|use-cases?)(?:\/|$)/i },
  { label: "Pricing", re: /^\/(?:pricing|plans?)(?:\/|$)/i },
  { label: "Blog / news", re: /^\/(?:blog|news|articles?|stories|press|insights?)(?:\/|$)/i },
  { label: "Docs / developers", re: /^\/(?:docs?|documentation|developers?|api|reference|sdk)(?:\/|$)/i },
  { label: "Resources / guides", re: /^\/(?:resources?|guides?|learn|library|help|support|academy|tutorials?)(?:\/|$)/i },
  { label: "About / company", re: /^\/(?:about|company|team|careers?|jobs|customers?|contact)(?:\/|$)/i },
  { label: "Legal", re: /^\/(?:legal|privacy|terms|cookies?|gdpr)(?:\/|$)/i },
];

function detectSections(paths) {
  const sections = new Map();
  for (const raw of paths) {
    const path = typeof raw === "string" ? raw : raw && raw.path;
    if (!path) continue;
    // Also test with a leading locale/country segment stripped (/in/, /en/,
    // /en-us/) so localized sites still classify their sections.
    const delocalized = path.replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/)/i, "");
    for (const rule of SECTION_RULES) {
      if (rule.re.test(path) || (delocalized !== path && rule.re.test(delocalized))) {
        if (!sections.has(rule.label)) sections.set(rule.label, { label: rule.label, example: path });
        break;
      }
    }
  }
  return [...sections.values()];
}

// Fetch the AI/crawler-facing discovery files in parallel: llms.txt, an existing
// SEO.md, and the sitemap (for a URL count). All best-effort and failure-tolerant.
async function fetchOne(url, opts) {
  try { return await fetchCapped(url, opts); }
  catch { return { status: 0, text: "", headers: null }; }
}

async function fetchDiscoverability(origin, sitemapUrls) {
  const sitemapUrl = sitemapUrls[0] || `${origin}/sitemap.xml`;
  const [llms, seomd, sitemap] = await Promise.all([
    fetchOne(`${origin}/llms.txt`, { maxBytes: 256 * 1024, timeoutMs: 6000 }),
    fetchOne(`${origin}/SEO.md`, { maxBytes: 256 * 1024, timeoutMs: 6000 }),
    fetchOne(sitemapUrl, { maxBytes: 2 * 1024 * 1024, timeoutMs: 8000 }),
  ]);
  const isText = (r) => r.status === 200 && r.text && !/^\s*<(?:!doctype html|html)/i.test(r.text.trim());
  const llmsTxt = {
    found: isText(llms) && /\S/.test(llms.text),
    lines: isText(llms) ? llms.text.split(/\r?\n/).filter((l) => l.trim()).length : 0,
  };
  const seoMd = { found: isText(seomd) && /\S/.test(seomd.text) };
  let sm = { found: false, isIndex: false, count: 0, url: "" };
  if (sitemap.status === 200 && /<(?:urlset|sitemapindex)/i.test(sitemap.text)) {
    sm = {
      found: true,
      isIndex: /<sitemapindex/i.test(sitemap.text),
      count: (sitemap.text.match(/<loc\b/gi) || []).length,
      url: sitemapUrl,
    };
  }
  return { llmsTxt, seoMd, sitemap: sm };
}

// Secondary heuristic scores, each a share of concrete pass/fail factors. These
// are separate from the SEO score and never change it. ai_readiness is an
// honest proxy — how understandable the site is to AI, not measured AI presence.
function scoreFrom(factors) {
  const ok = factors.filter((f) => f.ok).length;
  return { score: factors.length ? Math.round((ok / factors.length) * 100) : 0, factors };
}

function computeScores(d) {
  const content = scoreFrom([
    { label: "≥300 words of body copy", ok: d.wordCount >= 300 },
    { label: "Exactly one H1", ok: d.headings.counts.h1 === 1 },
    { label: "Uses H2 subheadings", ok: d.headings.counts.h2 > 0 },
    { label: "No skipped heading levels", ok: !d.headings.skip },
    { label: "Internal links present", ok: d.links.topInternal.length > 0 },
    { label: "Images have alt text", ok: d.images.total === 0 || d.images.missingAlt === 0 },
    { label: "Keyword-rich copy", ok: d.keywords.terms.length >= 3 },
  ]);
  const brand = scoreFrom([
    { label: "Organization/WebSite schema", ok: d.jsonLd.some((t) => /^(?:Organization|Corporation|LocalBusiness|WebSite)$/i.test(t)) },
    { label: "og:site_name set", ok: !!d.og["og:site_name"] },
    { label: "Icon/logo declared", ok: !!d.favicon },
    { label: "Social profiles linked", ok: d.social.length > 0 },
    { label: "Company details in schema", ok: !!(d.org && (d.org.location || d.org.foundingDate || d.org.legalName)) },
    { label: "Named entities declared", ok: d.entities.length > 0 },
  ]);
  const ai = scoreFrom([
    { label: "Structured data present", ok: d.jsonLd.length > 0 },
    { label: "Named entities declared", ok: d.entities.length > 0 },
    { label: "FAQ / Q&A markup", ok: d.answers.length > 0 },
    { label: "llms.txt published", ok: d.discovery.llmsTxt.found },
    { label: "Canonical URL set", ok: !!d.canonical && !d.canonicalOffHost },
    { label: "Descriptive meta description", ok: d.description.length >= 70 },
    { label: "XML sitemap available", ok: d.discovery.sitemap.found || d.sitemaps.length > 0 },
  ]);
  const overall = Math.round(d.score * 0.3 + content.score * 0.25 + brand.score * 0.2 + ai.score * 0.25);
  return { content, brand, ai, overall };
}

// Deterministic AEO/GEO opportunities — concrete, "you don't have X yet" gaps.
function buildOpportunities(d) {
  const ops = [];
  if (!d.discovery.llmsTxt.found) ops.push("AEO: No llms.txt — add one so AI crawlers get a curated map of your key pages.");
  if (!d.jsonLd.some((t) => /^(?:Organization|Corporation|LocalBusiness)$/i.test(t))) ops.push("AEO: No Organization schema — add it so AI systems can identify your brand as an entity.");
  if (!d.answers.length) ops.push("AEO: No FAQ schema — add Q&A markup so your answers can surface in AI and rich results.");
  if (!d.social.length) ops.push("Brand: No social profiles linked via sameAs — add them to strengthen your entity graph.");
  if (!d.discovery.seoMd.found) ops.push("AEO: No SEO.md published — commit this file at /SEO.md so agents can read your SEO state directly.");
  return ops;
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
  else if (d.xRobotsTag && /noindex/i.test(d.xRobotsTag)) add("fail", "Indexability", `X-Robots-Tag header is "${d.xRobotsTag}" — page is blocked from search.`, 3);
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
  L.push(`- overall_score: ${d.scores.overall}/100`);
  L.push(`- seo_score: ${d.score}/100 (${d.pass} passed · ${d.warn} warnings · ${d.fail} failing)`);
  L.push(`- content_score: ${d.scores.content.score}/100`);
  L.push(`- brand_clarity_score: ${d.scores.brand.score}/100`);
  L.push(`- ai_readiness_score: ${d.scores.ai.score}/100 (proxy — how understandable the site is to AI, not measured AI presence)`);
  L.push(`- url: ${d.url}`);
  if (d.finalUrl && d.finalUrl !== d.url) L.push(`- final_url: ${d.finalUrl}`);
  L.push(`- fetched: ${new Date(d.fetchedAt).toISOString()}`);
  if (d.truncated) L.push(`- note: page exceeded 2 MB and was read partially — signals near the end may be missing.`);
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
  L.push(`## Brand`);
  L.push(FIELD("brand_name", (d.org && d.org.name) || d.og["og:site_name"] || ""));
  if (d.org) {
    L.push(FIELD("legal_name", d.org.legalName));
    L.push(FIELD("founded", d.org.foundingDate));
    L.push(FIELD("location", d.org.location));
    L.push(FIELD("founders", d.org.founders.length ? d.org.founders.join(", ") : ""));
    L.push(FIELD("employees", d.org.employees));
    L.push(FIELD("contact", [d.org.email, d.org.telephone].filter(Boolean).join(" · ")));
  }
  if (d.social.length) {
    L.push(`- social_profiles:`);
    for (const s of d.social) L.push(`  - ${s.network}: ${s.url}`);
  } else {
    L.push(FIELD("social_profiles", ""));
  }
  L.push(``);
  L.push(`## Structure`);
  L.push(FIELD("h1", d.headings.h1.length ? d.headings.h1.map((h) => `"${h}"`).join(", ") : ""));
  L.push(FIELD("heading_outline", Object.entries(d.headings.counts).filter(([, n]) => n).map(([k, n]) => `${k}×${n}`).join(" · ")));
  L.push(FIELD("word_count", d.wordCount));
  L.push(FIELD("images", `${d.images.total} (${d.images.withAlt} with alt, ${d.images.missingAlt} missing)`));
  L.push(FIELD("links", `${d.links.internal} internal, ${d.links.external} external, ${d.links.nofollow} nofollow`));
  L.push(FIELD("hreflang", d.hreflang.length ? d.hreflang.join(", ") : ""));
  L.push(``);
  L.push(`## Keywords`);
  L.push(FIELD("top_terms", d.keywords.terms.length ? d.keywords.terms.map((t) => `${t.term} (${t.count})`).join(", ") : ""));
  L.push(FIELD("top_phrases", d.keywords.phrases.length ? d.keywords.phrases.map((t) => `"${t.term}" (${t.count})`).join(", ") : ""));
  L.push(``);
  L.push(`## Content`);
  L.push(FIELD("internal_links", d.links.internal));
  L.push(FIELD("external_links", d.links.external));
  if (d.links.topInternal.length) {
    L.push(`- important_pages:`);
    for (const p of d.links.topInternal) L.push(`  - ${p.path}${p.anchor ? ` — "${p.anchor}"` : ""} (${p.count}×)`);
  } else {
    L.push(FIELD("important_pages", ""));
  }
  L.push(``);
  L.push(`## Navigation`);
  if (d.nav.length) {
    L.push(`- primary_nav:`);
    for (const n of d.nav) L.push(`  - ${n.label} → ${n.path}`);
  } else {
    L.push(FIELD("primary_nav", ""));
  }
  L.push(FIELD("sections", d.sections.length ? d.sections.map((s) => s.label).join(", ") : ""));
  L.push(``);
  L.push(`## Indexing`);
  L.push(FIELD("https", d.https ? "yes" : "no"));
  L.push(FIELD("x_robots_tag", d.xRobotsTag));
  L.push(FIELD("robots_txt", d.robots.found ? "found" : "not found"));
  L.push(FIELD("sitemaps", d.sitemaps.length ? d.sitemaps.join(", ") : ""));
  L.push(FIELD("sitemap_urls", d.discovery.sitemap.found ? `${d.discovery.sitemap.count}${d.discovery.sitemap.isIndex ? " child sitemaps" : " URLs"}` : ""));
  L.push(FIELD("llms_txt", d.discovery.llmsTxt.found ? `found (${d.discovery.llmsTxt.lines} lines)` : "not found"));
  L.push(FIELD("seo_md", d.discovery.seoMd.found ? "found" : "not found"));
  L.push(FIELD("structured_data", d.jsonLd.length ? d.jsonLd.join(", ") : "none"));
  L.push(``);
  if (d.entities.length) {
    L.push(`## Entities`);
    for (const e of d.entities) L.push(`- ${e.type}: ${e.name}`);
    L.push(``);
  }
  if (d.answers.length) {
    L.push(`## Answers`);
    for (const a of d.answers) {
      L.push(`- Q: ${a.q}`);
      L.push(`  A: ${a.a || "—"}`);
    }
    L.push(``);
  }
  L.push(`## Scores`);
  const scoreBlock = (title, s) => {
    L.push(`- ${title}: ${s.score}/100`);
    for (const f of s.factors) L.push(`  - [${f.ok ? "x" : " "}] ${f.label}`);
  };
  scoreBlock("content", d.scores.content);
  scoreBlock("brand_clarity", d.scores.brand);
  scoreBlock("ai_readiness", d.scores.ai);
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
  const charset = charsetTag ? charsetTag[1].toLowerCase() : "";

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
  const { entities, answers, sameAs, org } = collectEntities(text);
  const social = collectSocial(text, sameAs, finalUrl);
  const nav = collectNav(text, finalUrl);
  const sections = detectSections([...links.topInternal.map((p) => p.path), ...nav.map((n) => n.path)]);
  const hreflang = collectHreflang(head);
  const favicon = collectFavicon(head, finalUrl);
  const robots = await fetchRobots(origin);
  const discovery = await fetchDiscoverability(origin, robots.sitemaps.length ? robots.sitemaps : []);

  const bodyHtml = (/[\s\S]*?<body[^>]*>([\s\S]*)<\/body>/i.exec(text) || [null, text])[1] || text;
  const bodyText = visibleText(bodyHtml);
  const keywords = collectKeywords(bodyText, `${title} ${headings.h1.join(" ")}`);

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
    entities,
    answers,
    org,
    social,
    nav,
    sections,
    discovery,
    keywords,
    hreflang,
    robots,
    sitemaps,
    wordCount: bodyText.split(/\s+/).filter(Boolean).length,
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
  d.scores = computeScores(d);
  d.recommendations = [...buildRecommendations(d.checks), ...buildOpportunities(d)];
  d.seoMd = renderSeoMd(d);
  return d;
}

module.exports = { analyze, renderSeoMd };
