"use strict";

// Deterministic feature-matrix builder for /tools/competitor-feature-gap.
// Fetches 2-5 public URLs (through lib/safeFetch.js), pulls short list-item
// text as feature-line candidates, groups near-identical phrasing across
// sites, and renders a yes/no matrix — rows most sites agree on first, so
// the gaps (a row where most competitors say yes and yours says no) surface
// at a glance. No LLM: grouping is exact-match on normalized text, so a
// feature phrased differently on two sites won't be recognized as the same
// row — stated plainly in the FAQ.

const { fetchPage, visibleText } = require("./htmlExtract");

const MAX_SITES = 5;
const MIN_SITES = 2;
const MAX_ROWS = 20;

const JUNK_PATTERN = /copyright|privacy policy|terms of service|cookie|all rights reserved|^(home|about|contact|blog|pricing|login|sign up|sign in)$/i;

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFeatureCandidates(html) {
  const candidates = [];
  const seen = new Set();
  const re = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = re.exec(html)) && candidates.length < 60) {
    const text = visibleText(m[1]);
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length < 2 || words.length > 14) continue;
    if (JUNK_PATTERN.test(text)) continue;
    const key = normalize(text);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    candidates.push({ key, label: text.slice(0, 140) });
  }
  return candidates;
}

async function profileSite(url) {
  const { html, finalUrl } = await fetchPage(url);
  return { url: finalUrl, features: extractFeatureCandidates(html) };
}

async function analyze(input) {
  const rawUrls = Array.isArray(input && input.urls) ? input.urls : [];
  const urls = rawUrls.map((u) => String(u || "").trim()).filter(Boolean);

  if (urls.length < MIN_SITES) {
    const error = new Error(`Enter at least ${MIN_SITES} URLs to compare.`);
    error.status = 400;
    throw error;
  }
  if (urls.length > MAX_SITES) {
    const error = new Error(`Enter at most ${MAX_SITES} URLs at a time.`);
    error.status = 400;
    throw error;
  }

  const sites = await Promise.all(urls.map(profileSite));

  const groups = new Map();
  sites.forEach((site, i) => {
    site.features.forEach((f) => {
      const g = groups.get(f.key) || { label: f.label, sites: new Array(sites.length).fill(false) };
      g.sites[i] = true;
      groups.set(f.key, g);
    });
  });

  const rows = Array.from(groups.values())
    .map((g) => ({ label: g.label, sites: g.sites, count: g.sites.filter(Boolean).length }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, MAX_ROWS);

  return {
    sites: sites.map((s) => ({ url: s.url, featureCount: s.features.length })),
    rows,
    truncated: groups.size > MAX_ROWS,
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze, MAX_SITES, MIN_SITES };
