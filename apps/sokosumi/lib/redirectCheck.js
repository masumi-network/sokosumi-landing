"use strict";

// Deterministic 404/redirect checker for /tools/redirect-checker. Discovers
// a sample of a site's pages (via lib/siteCrawl.js), crawls the internal
// links found on those pages, and checks each one's final status through
// lib/safeFetch.js — which already follows redirects by hand, so what's left
// broken here is a true dead end, not just "has a redirect". Each broken URL
// gets a suggested replacement from the site's own known-good pages, ranked
// by path-word overlap.

const { safeFetch, fetchErrorMessage } = require("./safeFetch");
const { fetchPage, collectLinks } = require("./htmlExtract");
const { discoverPages } = require("./siteCrawl");

const SEED_PAGES = 6;
const MAX_LINKS_TO_CHECK = 40;
const UA = "Mozilla/5.0 (compatible; SokosumiToolsBot/1.0; +https://sokosumi.com/tools)";

function pathWords(url) {
  try {
    return new Set((new URL(url).pathname.match(/[a-z0-9]+/gi) || []).map((w) => w.toLowerCase()));
  } catch {
    return new Set();
  }
}

function bestMatch(brokenUrl, knownGood) {
  const words = pathWords(brokenUrl);
  let best = null;
  let bestScore = 0;
  knownGood.forEach((good) => {
    if (good === brokenUrl) return;
    const goodWords = pathWords(good);
    if (!goodWords.size) return;
    let overlap = 0;
    words.forEach((w) => {
      if (goodWords.has(w)) overlap++;
    });
    const score = overlap / Math.max(1, Math.max(words.size, goodWords.size));
    if (score > bestScore) {
      bestScore = score;
      best = good;
    }
  });
  return bestScore > 0 ? best : null;
}

async function checkStatus(url) {
  try {
    const { response } = await safeFetch(url, { method: "GET", headers: { "User-Agent": UA } }, 8000);
    try {
      await response.body?.cancel();
    } catch {
      /* already closed */
    }
    return response.status;
  } catch (error) {
    return error.code === "blocked" || error.code === "dns" ? -1 : -2;
  }
}

async function analyze(input) {
  const url = String((input && input.url) || "").trim();
  if (!url) {
    const error = new Error("Enter the site URL you want checked.");
    error.status = 400;
    throw error;
  }

  let seeds;
  try {
    seeds = (await discoverPages(url, SEED_PAGES)).pages;
  } catch (error) {
    const err = new Error(fetchErrorMessage(error) || error.message || "Could not discover pages on that site.");
    err.status = 422;
    throw err;
  }

  const linkSets = await Promise.all(
    seeds.map(async (seedUrl) => {
      try {
        const { html, finalUrl } = await fetchPage(seedUrl);
        return collectLinks(html, finalUrl).internalUrls;
      } catch {
        return [];
      }
    }),
  );
  const candidates = [...new Set(linkSets.flat())].slice(0, MAX_LINKS_TO_CHECK);
  if (!candidates.length) {
    const error = new Error("Found no internal links to check on that site.");
    error.status = 422;
    throw error;
  }

  const statuses = await Promise.all(candidates.map(checkStatus));
  const knownGood = candidates.filter((_, i) => statuses[i] >= 200 && statuses[i] < 300);
  const broken = candidates
    .map((candidateUrl, i) => ({ url: candidateUrl, status: statuses[i] }))
    .filter((r) => r.status < 200 || r.status >= 400)
    .map((r) => ({
      url: r.url,
      status: r.status === -1 ? "blocked" : r.status === -2 ? "unreachable" : r.status,
      suggestion: bestMatch(r.url, knownGood.length ? knownGood : seeds),
    }));

  return {
    checked: candidates.length,
    brokenCount: broken.length,
    broken,
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze };
