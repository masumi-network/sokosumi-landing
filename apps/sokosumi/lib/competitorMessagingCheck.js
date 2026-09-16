"use strict";

// Deterministic multi-site messaging comparison for
// /tools/competitor-messaging. Fetches 2-5 public URLs (through
// lib/safeFetch.js) and compares the tone and recurring vocabulary each one
// uses: each site's headline, tone (contraction rate), sentence length,
// customer focus (you/we ratio), power-word density, specificity (numbers),
// and top keywords — plus which themes are shared across all of them vs
// unique to one. No LLM — every signal is a word count, regex, or set op.

const { fetchPage, collectTitle, collectHeadings, visibleText, wordCount, normalizeUrl } = require("./htmlExtract");

const MAX_SITES = 5;
const MIN_SITES = 2;

const POWER_WORDS = /\b(free|proven|secret|ultimate|essential|effortless|powerful|guaranteed|instantly|easy|simple|exclusive|new|best|leading|innovative|revolutionary)\b/gi;

const STOPWORDS = new Set(
  "a an the and or but if then so of to in on for with at by from up about into over after is are was were be been being this that these those it its your you our we us they them as not no do does did done can could should would will just more most so than very really also has have had get gets".split(
    " ",
  ),
);

function topKeywords(text, limit = 10) {
  const counts = new Map();
  (text.toLowerCase().match(/\b[a-z][a-z'-]{2,}\b/g) || []).forEach((w) => {
    if (STOPWORDS.has(w)) return;
    counts.set(w, (counts.get(w) || 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function sentences(text) {
  return text
    .split(/[.!?]+(?:\s|$)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function profileSite(url) {
  const { html, finalUrl } = await fetchPage(url);
  const title = collectTitle(html);
  const headings = collectHeadings(html);
  const text = visibleText(html);
  const words = wordCount(text);
  const sents = sentences(text);
  const avgSentenceLength = sents.length ? Math.round((words / sents.length) * 10) / 10 : 0;
  const contractions = (text.match(/\b\w+'\w+\b/g) || []).length;
  const contractionsPer100Words = words ? Math.round((contractions / words) * 1000) / 10 : 0;
  const powerWordMatches = (text.match(POWER_WORDS) || []).length;
  const powerPer100 = words ? Math.round((powerWordMatches / words) * 1000) / 10 : 0;
  // Customer-centric vs company-centric: the you/we ratio, a documented proxy.
  const youCount = (text.match(/\b(?:you|your|you're|yours)\b/gi) || []).length;
  const weCount = (text.match(/\b(?:we|our|us|ours)\b/gi) || []).length;
  const customerFocus = youCount + weCount ? Math.round((youCount / (youCount + weCount)) * 100) : 0;
  // Specificity: how often the copy reaches for a concrete number.
  const numberCount = (text.match(/\b\d+(?:[.,]\d+)?%?\b/g) || []).length;
  const numbersPer100 = words ? Math.round((numberCount / words) * 1000) / 10 : 0;
  const toneLabel = contractionsPer100Words >= 1.5 ? "Casual" : contractionsPer100Words > 0 ? "Neutral" : "Formal";
  const headline = (headings.h1 && headings.h1[0]) || title || finalUrl;
  return {
    url: finalUrl,
    title,
    headline,
    words,
    avgSentenceLength,
    contractionsPer100Words,
    powerWordMatches,
    powerPer100,
    customerFocus,
    numbersPer100,
    toneLabel,
    keywords: topKeywords(text),
  };
}

async function analyze(input) {
  const rawUrls = Array.isArray(input && input.urls) ? input.urls : [];
  const urls = rawUrls.map((u) => normalizeUrl(u)).filter(Boolean);

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

  const wordSets = sites.map((s) => new Set(s.keywords.map((k) => k.label)));
  const allWords = new Set(wordSets.flatMap((s) => [...s]));
  const shared = [...allWords].filter((w) => wordSets.every((set) => set.has(w)));
  const uniquePerSite = sites.map((site, i) => ({
    url: site.url,
    words: site.keywords.filter((k) => wordSets.every((set, j) => j === i || !set.has(k.label))).slice(0, 8),
  }));

  return {
    sites,
    sharedThemes: shared.slice(0, 10),
    uniquePerSite,
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze, MAX_SITES, MIN_SITES };
