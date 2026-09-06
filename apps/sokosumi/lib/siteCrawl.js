"use strict";

// Shared site-page discovery for the batch of multi-page crawler tools
// (internal linking finder, 404 checker, orphan page finder, content decay
// detector): try /sitemap.xml (following one level into a sitemap index),
// falling back to the links found on the homepage itself. Capped and timed
// out so a large site can't hang the request — every one of these tools
// only gets a sample, not a full site audit.

const { safeFetch, readCapped, fetchErrorMessage } = require("./safeFetch");
const { fetchPage, collectLinks } = require("./htmlExtract");

const UA = "Mozilla/5.0 (compatible; SokosumiToolsBot/1.0; +https://sokosumi.com/tools)";

async function fetchXmlLocs(url, timeoutMs = 8000) {
  let response;
  try {
    ({ response } = await safeFetch(url, { headers: { "User-Agent": UA, Accept: "application/xml,text/xml" } }, timeoutMs));
  } catch (error) {
    throw new Error(fetchErrorMessage(error));
  }
  if (!response.ok) throw new Error(`sitemap responded with HTTP ${response.status}`);
  const buffer = await readCapped(response, 2 * 1024 * 1024);
  const xml = buffer.toString("utf-8");
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
  const isSitemapIndex = /<sitemapindex\b/i.test(xml);
  return { locs, isSitemapIndex };
}

// Returns { pages, viaSitemap } — pages capped at maxPages. Falls back to
// the homepage's own internal links when no sitemap exists.
async function discoverPages(startUrl, maxPages = 12) {
  const origin = new URL(startUrl).origin;
  try {
    const { locs, isSitemapIndex } = await fetchXmlLocs(`${origin}/sitemap.xml`);
    if (isSitemapIndex && locs.length) {
      const first = await fetchXmlLocs(locs[0]);
      if (first.locs.length) return { pages: first.locs.slice(0, maxPages), viaSitemap: true };
    }
    if (locs.length) return { pages: locs.slice(0, maxPages), viaSitemap: true };
  } catch {
    /* fall through to homepage-link discovery */
  }

  const { html, finalUrl } = await fetchPage(startUrl);
  const links = collectLinks(html, finalUrl);
  const pages = [finalUrl, ...links.internalUrls.slice(0, maxPages - 1)];
  return { pages: [...new Set(pages)].slice(0, maxPages), viaSitemap: false };
}

module.exports = { discoverPages, fetchXmlLocs };
