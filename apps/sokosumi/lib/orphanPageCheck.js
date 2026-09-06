"use strict";

// Deterministic orphan-page finder for /tools/orphan-pages. Reads a site's
// sitemap.xml (via lib/siteCrawl.js) — the "should exist" set — then crawls
// a sample of those pages and unions every internal link found on them. Any
// sitemap URL that never shows up in that union, other than linking to
// itself, is flagged as an orphan: reachable only through the sitemap, not
// through the site's own navigation.

const { fetchPage, collectLinks } = require("./htmlExtract");
const { discoverPages } = require("./siteCrawl");

const MAX_PAGES = 20;

function normalize(url) {
  return url.replace(/\/+$/, "");
}

async function analyze(input) {
  const url = String((input && input.url) || "").trim();
  if (!url) {
    const error = new Error("Enter the site URL you want checked.");
    error.status = 400;
    throw error;
  }

  let discovery;
  try {
    discovery = await discoverPages(url, MAX_PAGES);
  } catch (error) {
    const err = new Error(error.message || "Could not discover pages on that site.");
    err.status = 422;
    throw err;
  }
  if (!discovery.viaSitemap) {
    const error = new Error("No sitemap.xml found on that site — orphan detection needs a sitemap to know which pages should exist.");
    error.status = 422;
    throw error;
  }
  const sitemapPages = discovery.pages.map(normalize);
  if (sitemapPages.length < 2) {
    const error = new Error("Found fewer than 2 pages in the sitemap.");
    error.status = 422;
    throw error;
  }

  const linkSets = await Promise.all(
    discovery.pages.map(async (pageUrl) => {
      try {
        const { html, finalUrl } = await fetchPage(pageUrl);
        return collectLinks(html, finalUrl).internalUrls.map(normalize);
      } catch {
        return [];
      }
    }),
  );
  const linkedTo = new Set(linkSets.flat());

  const orphans = sitemapPages.filter((p) => !linkedTo.has(p));

  return {
    sitemapPageCount: sitemapPages.length,
    orphanCount: orphans.length,
    orphans,
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze };
