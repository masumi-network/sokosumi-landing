"use strict";

// Shared HTML-parsing primitives for the batch of URL-crawling /tools added
// after seo-md.js/ogCheck.js — tolerant regexes, no headless browser, no
// LLM, the same approach those two use. Where seoExtract.js has its own
// private copies of some of these, this module exists so the dozen-plus
// crawler tools that came after it (competitor teardown, 404 checker,
// internal linking finder, etc.) share ONE copy rather than each growing its
// own. Fetching always goes through lib/safeFetch.js — every one of these
// tools points our server at a URL a stranger typed, so none of them get to
// skip the SSRF guard.

const { safeFetch, readCapped, fetchErrorMessage } = require("./safeFetch");

const UA = "Mozilla/5.0 (compatible; SokosumiToolsBot/1.0; +https://sokosumi.com/tools)";

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

function visibleText(html) {
  return clean(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style|noscript|template|svg)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function collectTitle(html) {
  const m = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return m ? clean(m[1]) : "";
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

function collectHeadings(html) {
  const counts = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
  const h1 = [];
  const h2 = [];
  const order = [];
  const re = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html))) {
    const level = m[1].toLowerCase();
    counts[level]++;
    order.push(Number(level[1]));
    const text = visibleText(m[2]).slice(0, 200);
    if (level === "h1" && text) h1.push(text);
    if (level === "h2" && text) h2.push(text);
  }
  let skip = null;
  for (let i = 1; i < order.length && !skip; i++) {
    if (order[i] - order[i - 1] > 1) skip = `h${order[i - 1]} → h${order[i]}`;
  }
  return { counts, h1, h2, skip };
}

function collectImages(html) {
  let total = 0;
  let withAlt = 0;
  const re = /<img\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    total++;
    const alt = attrOf(m[0], "alt");
    if (/\balt\s*=/.test(m[0]) && alt.trim()) withAlt++;
  }
  return { total, withAlt, missingAlt: total - withAlt };
}

// internalPaths ranks by how often a path is linked to (a decent proxy for
// which pages the site itself treats as important); externalUrls is capped
// so a page with thousands of outbound links can't blow up the response.
function collectLinks(html, baseUrl) {
  let internal = 0;
  let external = 0;
  let host = "";
  try {
    host = new URL(baseUrl).hostname.replace(/^www\./, "");
  } catch {
    /* ignore */
  }
  const pages = new Map();
  const externalUrls = [];
  const internalUrls = new Set();
  const re = /<a\b([^>]*?)\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))([^>]*)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = decodeEntities(m[3] ?? m[4] ?? m[5] ?? "").trim();
    if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) continue;
    let target;
    try {
      target = new URL(href, baseUrl);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(target.protocol)) continue;
    target.hash = "";
    if (target.hostname.replace(/^www\./, "") === host) {
      internal++;
      const path = (target.pathname + target.search).replace(/\/+$/, "") || "/";
      const anchor = visibleText(m[7]).slice(0, 80);
      const entry = pages.get(path) || { count: 0, anchor: "" };
      entry.count++;
      if (!entry.anchor && anchor) entry.anchor = anchor;
      pages.set(path, entry);
      internalUrls.add(target.href);
    } else {
      external++;
      if (externalUrls.length < 200) externalUrls.push(target.href);
    }
  }
  const topInternal = [...pages.entries()]
    .map(([path, v]) => ({ path, count: v.count, anchor: v.anchor }))
    .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path));
  return { internal, external, topInternal, internalUrls: [...internalUrls], externalUrls };
}

function collectJsonLd(html) {
  const blocks = [];
  const re = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      blocks.push(JSON.parse(m[1].trim()));
    } catch {
      /* ignore malformed blocks */
    }
  }
  return blocks;
}

function wordCount(text) {
  return (text.match(/\b[\w'-]+\b/g) || []).length;
}

// Slices the raw HTML between successive <h2> tags so callers (blog-to-
// carousel, blog-to-social-week) can treat each section's own opening text
// as a summary of that section, without re-deriving positions themselves.
function extractH2Sections(html) {
  const positions = [];
  const re = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  let m;
  while ((m = re.exec(html))) {
    positions.push({ start: m.index, headingEnd: re.lastIndex, heading: visibleText(m[1]) });
  }
  return positions.map((p, i) => {
    const end = i + 1 < positions.length ? positions[i + 1].start : html.length;
    const bodyHtml = html.slice(p.headingEnd, end);
    return { heading: p.heading, body: visibleText(bodyHtml) };
  });
}

// Fetches through the SSRF-checked safeFetch, capped and timed out, and
// returns the decoded body as text plus the bits every crawler tool needs.
async function fetchPage(url, { maxBytes = 2 * 1024 * 1024, timeoutMs = 10000 } = {}) {
  let response, finalUrl;
  try {
    ({ response, url: finalUrl } = await safeFetch(url, { headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" } }, timeoutMs));
  } catch (error) {
    const err = new Error(fetchErrorMessage(error));
    err.status = 422;
    throw err;
  }
  if (!response.ok) {
    const err = new Error(`That page responded with HTTP ${response.status}.`);
    err.status = 422;
    throw err;
  }
  const contentType = response.headers.get("content-type") || "";
  if (contentType && !/text\/html|application\/xhtml/i.test(contentType)) {
    const err = new Error("That URL did not return an HTML page.");
    err.status = 422;
    throw err;
  }
  const buffer = await readCapped(response, maxBytes);
  const html = buffer.toString("utf-8");
  return {
    html,
    finalUrl,
    status: response.status,
    truncated: buffer.length >= maxBytes,
    lastModified: response.headers.get("last-modified") || null,
  };
}

// Looks for a publish/modified date in the page's own markup — a meta tag or
// JSON-LD — for pages that don't send a Last-Modified header (most don't).
function collectDateMeta(html, jsonLdBlocks) {
  const meta = collectMeta(html);
  const metaDate = meta["article:modified_time"] || meta["article:published_time"] || meta.date || meta["og:updated_time"];
  if (metaDate) return metaDate;
  for (const block of jsonLdBlocks || []) {
    const stack = [block];
    while (stack.length) {
      const node = stack.pop();
      if (!node || typeof node !== "object") continue;
      if (Array.isArray(node)) {
        stack.push(...node);
        continue;
      }
      if (node.dateModified || node.datePublished) return node.dateModified || node.datePublished;
      if (node["@graph"]) stack.push(node["@graph"]);
    }
  }
  return null;
}

module.exports = {
  decodeEntities,
  clean,
  attrOf,
  visibleText,
  collectTitle,
  collectMeta,
  collectHeadings,
  collectImages,
  collectLinks,
  collectJsonLd,
  wordCount,
  extractH2Sections,
  collectDateMeta,
  fetchPage,
};
