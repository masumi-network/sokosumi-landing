"use strict";

// Deterministic internal-linking opportunity finder for
// /tools/internal-linking-finder. Given a site URL, this tries its
// sitemap.xml (falling back to the homepage's own links) for up to
// MAX_PAGES pages, fetches each (through lib/safeFetch.js), and computes a
// simple keyword-overlap similarity between every pair — two pages that
// share a lot of vocabulary but don't yet link to each other are a linking
// opportunity. No LLM: similarity is a Jaccard set overlap on each page's
// top keywords, capped and timed out so a large site can't hang the request.

const { fetchPage, collectTitle, collectLinks, visibleText } = require("./htmlExtract");
const { discoverPages } = require("./siteCrawl");

const MAX_PAGES = 12;
const MAX_SUGGESTIONS = 20;
const TOP_KEYWORDS_PER_PAGE = 20;

const STOPWORDS = new Set(
  "a an the and or but if then so of to in on for with at by from up about into over after is are was were be been being this that these those it its your you our we us they them as not no do does did done can could should would will just more most so than very really also has have had get gets home page about contact blog".split(
    " ",
  ),
);

function topKeywordSet(text) {
  const counts = new Map();
  (text.toLowerCase().match(/\b[a-z][a-z'-]{2,}\b/g) || []).forEach((w) => {
    if (STOPWORDS.has(w)) return;
    counts.set(w, (counts.get(w) || 0) + 1);
  });
  return new Set(
    Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_KEYWORDS_PER_PAGE)
      .map(([w]) => w),
  );
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  a.forEach((w) => {
    if (b.has(w)) intersection++;
  });
  const union = a.size + b.size - intersection;
  return union ? intersection / union : 0;
}

async function analyze(input) {
  const url = String((input && input.url) || "").trim();
  if (!url) {
    const error = new Error("Enter the site URL you want checked.");
    error.status = 400;
    throw error;
  }

  let pageUrls;
  try {
    pageUrls = (await discoverPages(url, MAX_PAGES)).pages;
  } catch (error) {
    const err = new Error(error.message || "Could not discover pages on that site.");
    err.status = 422;
    throw err;
  }
  if (pageUrls.length < 2) {
    const error = new Error("Found fewer than 2 pages to compare — check the URL and try again.");
    error.status = 422;
    throw error;
  }

  const pages = await Promise.all(
    pageUrls.map(async (pageUrl) => {
      try {
        const { html, finalUrl } = await fetchPage(pageUrl);
        const title = collectTitle(html) || finalUrl;
        const links = collectLinks(html, finalUrl);
        const keywords = topKeywordSet(visibleText(html));
        return { url: finalUrl, title, keywords, linksTo: new Set(links.internalUrls.map((u) => u.replace(/\/+$/, ""))) };
      } catch {
        return null;
      }
    }),
  );
  const ok = pages.filter(Boolean);
  if (ok.length < 2) {
    const error = new Error("Could not fetch enough pages on that site to compare.");
    error.status = 422;
    throw error;
  }

  const suggestions = [];
  for (let i = 0; i < ok.length; i++) {
    for (let j = 0; j < ok.length; j++) {
      if (i === j) continue;
      const from = ok[i];
      const to = ok[j];
      const normalizedTo = to.url.replace(/\/+$/, "");
      if (from.linksTo.has(normalizedTo)) continue;
      const similarity = jaccard(from.keywords, to.keywords);
      if (similarity < 0.15) continue;
      const shared = [...from.keywords].filter((w) => to.keywords.has(w)).slice(0, 3);
      suggestions.push({
        fromUrl: from.url,
        fromTitle: from.title,
        toUrl: to.url,
        toTitle: to.title,
        similarity: Math.round(similarity * 100),
        anchorSuggestion: shared.join(", ") || to.title,
      });
    }
  }
  suggestions.sort((a, b) => b.similarity - a.similarity);

  return {
    pagesCrawled: ok.length,
    suggestions: suggestions.slice(0, MAX_SUGGESTIONS),
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze, MAX_PAGES };
