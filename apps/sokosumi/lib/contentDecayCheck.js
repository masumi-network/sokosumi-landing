"use strict";

// Deterministic content-decay detector for /tools/content-decay. Given a
// pasted list of up to 20 URLs, fetches each (through lib/safeFetch.js) and
// flags pages that look stale: no age signal found in over two years, or old
// and thin relative to the batch's own average word count. No LLM — age
// comes from a Last-Modified header or a date in the page's own markup;
// "thin" is relative to the other URLs in this same batch, not an absolute
// rule.

const { fetchPage, collectTitle, collectJsonLd, visibleText, wordCount, collectDateMeta } = require("./htmlExtract");

const MAX_URLS = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

async function profileUrl(url) {
  const { html, finalUrl, lastModified } = await fetchPage(url);
  const title = collectTitle(html);
  const jsonLd = collectJsonLd(html);
  const dateStr = lastModified || collectDateMeta(html, jsonLd);
  const timestamp = dateStr ? Date.parse(dateStr) : NaN;
  const ageDays = isNaN(timestamp) ? null : Math.round((Date.now() - timestamp) / DAY_MS);
  const words = wordCount(visibleText(html));
  return { url: finalUrl, title, ageDays, words };
}

function analyzePages(pages) {
  const withWords = pages.filter((p) => p.words > 0);
  const avgWords = withWords.length ? withWords.reduce((s, p) => s + p.words, 0) / withWords.length : 0;

  return pages.map((p) => {
    const flags = [];
    if (p.ageDays == null) {
      flags.push("Unknown age (no Last-Modified header or date markup found)");
    } else if (p.ageDays > 730) {
      flags.push(`Over 2 years old (${Math.round(p.ageDays / 365)}y)`);
    } else if (p.ageDays > 365 && avgWords > 0 && p.words < avgWords * 0.6) {
      flags.push(`Over a year old and thinner than the batch average (${p.words} vs ~${Math.round(avgWords)} words)`);
    }
    if (avgWords > 0 && p.words < avgWords * 0.5 && p.words > 0) {
      flags.push(`Thin content (${p.words} words vs ~${Math.round(avgWords)} average for this batch)`);
    }
    return { ...p, likelyStale: flags.length > 0, flags };
  });
}

async function analyze(input) {
  const rawUrls = Array.isArray(input && input.urls) ? input.urls : [];
  const urls = rawUrls.map((u) => String(u || "").trim()).filter(Boolean);

  if (!urls.length) {
    const error = new Error("Paste at least one content URL to check.");
    error.status = 400;
    throw error;
  }
  if (urls.length > MAX_URLS) {
    const error = new Error(`Enter at most ${MAX_URLS} URLs at a time.`);
    error.status = 400;
    throw error;
  }

  const pages = await Promise.all(
    urls.map(async (url) => {
      try {
        return await profileUrl(url);
      } catch (error) {
        return { url, title: url, ageDays: null, words: 0, error: error.message || "Could not fetch this URL." };
      }
    }),
  );

  const ok = pages.filter((p) => !p.error);
  const failed = pages.filter((p) => p.error);
  const analyzed = analyzePages(ok);

  return {
    checked: pages.length,
    staleCount: analyzed.filter((p) => p.likelyStale).length,
    pages: [...analyzed, ...failed.map((p) => ({ ...p, likelyStale: false, flags: [] }))],
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze, MAX_URLS };
