"use strict";

// Deterministic two-way positioning comparison for
// /tools/competitor-positioning. Fetches two public URLs (through
// lib/safeFetch.js) and diffs what each page actually says: title, meta
// description, H1, content depth, CTA presence, pricing/proof mentions, and
// the vocabulary each emphasizes that the other doesn't. No LLM — every
// signal here is a word count, a regex, or a set difference.

const { fetchPage, collectTitle, collectMeta, collectHeadings, collectLinks, visibleText, wordCount } = require("./htmlExtract");

const CTA_PATTERN = /\b(get started|sign up|start (?:your |a )?(?:free )?trial|book a demo|try (?:it )?free|buy now|contact us|request a demo|schedule a call|subscribe)\b/gi;
const PRICING_PATTERN = /\$\d|\bpricing\b|\bplans?\b.{0,20}\b(month|year|user|seat)\b/i;
const PROOF_PATTERN = /trusted by|as seen in|testimonial|case stud(?:y|ies)|\d[\d,]*\+?\s*(?:customers|companies|users|teams|reviews)/i;

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

async function profileSite(url) {
  const { html, finalUrl } = await fetchPage(url);
  const title = collectTitle(html);
  const meta = collectMeta(html);
  const headings = collectHeadings(html);
  const links = collectLinks(html, finalUrl);
  const text = visibleText(html);
  return {
    url: finalUrl,
    title,
    description: meta.description || "",
    h1: headings.h1[0] || "",
    h1Count: headings.counts.h1,
    words: wordCount(text),
    ctaCount: (text.match(CTA_PATTERN) || []).length,
    hasPricing: PRICING_PATTERN.test(text),
    hasProof: PROOF_PATTERN.test(text),
    internalLinks: links.internal,
    keywords: topKeywords(text),
  };
}

function gapsFor(mine, theirs, myLabel, theirLabel) {
  const items = [];
  const add = (level, title, detail) => items.push({ level, title, detail });

  if (!mine.h1Count && theirs.h1Count) add("warn", "No H1", `${theirLabel} has a clear H1; ${myLabel} doesn't.`);
  if (!mine.description && theirs.description) add("warn", "No meta description", `${theirLabel} has one set; ${myLabel} doesn't — it controls the search-result snippet.`);
  if (mine.words < theirs.words * 0.6 && theirs.words > 200) add("warn", "Thinner content", `${myLabel} has ${mine.words} words on the page vs ${theirs.words} for ${theirLabel}.`);
  if (!mine.ctaCount && theirs.ctaCount) add("error", "No CTA detected", `${theirLabel} has a clear call to action; ${myLabel} doesn't.`);
  if (!mine.hasPricing && theirs.hasPricing) add("warn", "No pricing shown", `${theirLabel} shows pricing or plan language; ${myLabel} doesn't.`);
  if (!mine.hasProof && theirs.hasProof) add("warn", "No social proof", `${theirLabel} has testimonials or customer counts; ${myLabel} doesn't.`);

  const theirWords = new Set(theirs.keywords.map((k) => k.label));
  const myWords = new Set(mine.keywords.map((k) => k.label));
  const onlyTheirs = theirs.keywords.filter((k) => !myWords.has(k.label)).slice(0, 5);
  if (onlyTheirs.length) {
    add("pass", "Vocabulary they emphasize that you don't", onlyTheirs.map((k) => k.label).join(", "));
  }
  void theirWords;
  return items;
}

async function analyze(input) {
  const urlA = String((input && input.urlA) || "").trim();
  const urlB = String((input && input.urlB) || "").trim();
  if (!urlA || !urlB) {
    const error = new Error("Enter both URLs you want to compare.");
    error.status = 400;
    throw error;
  }

  const [siteA, siteB] = await Promise.all([profileSite(urlA), profileSite(urlB)]);

  return {
    siteA,
    siteB,
    gapsA: gapsFor(siteA, siteB, "Site A", "Site B"),
    gapsB: gapsFor(siteB, siteA, "Site B", "Site A"),
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze };
