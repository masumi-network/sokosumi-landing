"use strict";

// Deterministic "answer readiness" scorer for /tools/answer-readiness. Given
// a public URL, this estimates how easily an LLM answering a question could
// lift a clean fact from the page — heading structure, direct definitions
// and FAQ-shaped content, tables and JSON-LD, and paragraph chunk length —
// the same tolerant-regex approach as ogCheck.js. This is a proxy, the same
// way seoExtract.js labels its own ai_readiness_score a proxy rather than a
// measurement of how any specific model actually behaves — stated plainly
// in the FAQ.

const { fetchPage, collectTitle, collectHeadings, collectJsonLd, visibleText, wordCount } = require("./htmlExtract");

const DEFINITION_PATTERN = /\b[A-Z][a-zA-Z0-9 '-]{2,40}\b (?:is|are|means|refers to) /g;
const DIMENSION_WEIGHT = { headings: 25, definitions: 25, structured: 25, chunking: 25 };

function band(score) {
  return score >= 80 ? "pass" : score >= 50 ? "warn" : "error";
}

function scoreFromChecks(checks) {
  if (!checks || !checks.length) return 0;
  const credit = { pass: 1, warn: 0.5, error: 0 };
  const totalWeight = checks.reduce((sum, c) => sum + (c.weight || 1), 0);
  const earned = checks.reduce((sum, c) => sum + (c.weight || 1) * credit[c.level], 0);
  return totalWeight ? Math.round((earned / totalWeight) * 100) : 0;
}

function buildRecommendations(dimensions) {
  const priority = { error: 0, warn: 1, pass: 2 };
  return dimensions
    .flatMap((d) => d.checks.map((c) => ({ ...c, dimension: d.label })))
    .filter((c) => c.level !== "pass")
    .sort((a, b) => priority[a.level] - priority[b.level])
    .map((c) => `${c.dimension} — ${c.title}: ${c.detail}`);
}

function paragraphStats(html) {
  const paragraphs = [];
  const re = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(html))) {
    const words = wordCount(visibleText(m[1]));
    if (words > 0) paragraphs.push(words);
  }
  const total = paragraphs.reduce((a, b) => a + b, 0);
  const avg = paragraphs.length ? total / paragraphs.length : 0;
  const longCount = paragraphs.filter((w) => w > 150).length;
  return { count: paragraphs.length, avg, longCount };
}

async function analyze(input) {
  const url = String((input && input.url) || "").trim();
  if (!url) {
    const error = new Error("Enter the URL you want scored.");
    error.status = 400;
    throw error;
  }

  const { html, finalUrl } = await fetchPage(url);
  const title = collectTitle(html);
  const headings = collectHeadings(html);
  const jsonLd = collectJsonLd(html);
  const jsonLdTypes = new Set();
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(walk);
    const t = node["@type"];
    if (typeof t === "string") jsonLdTypes.add(t);
    else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && jsonLdTypes.add(x));
    if (node["@graph"]) walk(node["@graph"]);
  };
  jsonLd.forEach(walk);

  const text = visibleText(html);
  const definitionMatches = (text.match(DEFINITION_PATTERN) || []).length;
  const tableCount = (html.match(/<table\b/gi) || []).length;
  const detailsCount = (html.match(/<details\b/gi) || []).length;
  const questionHeadings = [...headings.h1, ...headings.h2].filter((h) => /\?\s*$/.test(h.trim())).length;
  const paragraphs = paragraphStats(html);

  const headingChecks = [];
  const addH = (level, t, tag, detail, weight = 1) => headingChecks.push({ level, title: t, tag, detail, weight });
  if (headings.counts.h1 === 1) addH("pass", "Single, clear H1", "headings", `The H1 reads: "${headings.h1[0]}"`, 2);
  else if (headings.counts.h1 === 0) addH("error", "No H1 found", "headings", "A model summarizing the page has no clear topic signal to anchor on.", 2);
  else addH("warn", "Multiple H1s", "headings", `${headings.counts.h1} H1 tags — an ambiguous topic signal.`, 2);
  if (headings.skip) addH("warn", "Heading levels skip", "headings", `Jumps from ${headings.skip} — a broken outline is harder to chunk section by section.`, 2);
  else addH("pass", "Heading outline is sequential", "headings", `${headings.counts.h2} H2 section(s), no skipped levels.`, 2);

  const defChecks = [];
  const addD = (level, t, tag, detail, weight = 1) => defChecks.push({ level, title: t, tag, detail, weight });
  if (definitionMatches >= 1) addD("pass", "Has direct definitions", "definitions", `Found ${definitionMatches} "X is/are/means" style statement(s) — the easiest shape for a model to lift as a clean answer.`, 3);
  else addD("warn", "No direct definitions found", "definitions", 'No "X is Y" style statements detected — a model has to infer a definition rather than quote one.', 3);
  if (jsonLdTypes.has("FAQPage") || detailsCount >= 1 || questionHeadings >= 1) {
    addD("pass", "Has FAQ-shaped content", "definitions", "Found FAQPage schema, expandable Q&A blocks, or question-style headings.", 2);
  } else {
    addD("warn", "No FAQ-shaped content", "definitions", "No FAQPage schema, <details> blocks, or question-style headings found.", 2);
  }

  const structuredChecks = [];
  const addS = (level, t, tag, detail, weight = 1) => structuredChecks.push({ level, title: t, tag, detail, weight });
  if (tableCount >= 1) addS("pass", "Has at least one table", "structured", `${tableCount} table(s) found — tables are one of the easiest structures for a model to lift a clean fact from.`, 3);
  else addS("warn", "No tables", "structured", "No <table> elements found on the page.", 3);
  if (jsonLdTypes.size > 0) addS("pass", "Has JSON-LD structured data", "structured", `Types found: ${[...jsonLdTypes].slice(0, 6).join(", ")}.`, 2);
  else addS("warn", "No JSON-LD found", "structured", "No structured data on the page — schema.org markup gives a model an unambiguous, machine-readable summary.", 2);

  const chunkChecks = [];
  const addC = (level, t, tag, detail, weight = 1) => chunkChecks.push({ level, title: t, tag, detail, weight });
  if (paragraphs.count === 0) {
    addC("error", "No paragraph text found", "chunking", "No <p> content detected — the page may render its text via JavaScript, which this check can't see.", 3);
  } else if (paragraphs.avg > 150) {
    addC("warn", "Paragraphs run long", "chunking", `Averaging ${Math.round(paragraphs.avg)} words per paragraph — a retrieval system chunking this page will struggle to isolate one idea per chunk.`, 3);
  } else if (paragraphs.avg < 15) {
    addC("warn", "Paragraphs are very short", "chunking", `Averaging ${Math.round(paragraphs.avg)} words per paragraph — each one may lack enough standalone context to be a useful chunk.`, 3);
  } else {
    addC("pass", "Paragraph length is chunk-friendly", "chunking", `Averaging ${Math.round(paragraphs.avg)} words per paragraph across ${paragraphs.count} paragraph(s).`, 3);
  }
  if (paragraphs.longCount > 0) {
    addC("warn", "Some very long paragraphs", "chunking", `${paragraphs.longCount} paragraph(s) over 150 words — consider breaking these up.`, 1);
  } else {
    addC("pass", "No overly long paragraphs", "chunking", "Every paragraph is a reasonable chunk size.", 1);
  }

  const dimensions = [
    { key: "headings", label: "Heading structure", checks: headingChecks },
    { key: "definitions", label: "Direct definitions & FAQ", checks: defChecks },
    { key: "structured", label: "Structured data", checks: structuredChecks },
    { key: "chunking", label: "Chunk length", checks: chunkChecks },
  ];
  const scored = dimensions.map((d) => ({ ...d, score: scoreFromChecks(d.checks), weight: DIMENSION_WEIGHT[d.key] }));
  const totalWeight = scored.reduce((sum, d) => sum + d.weight, 0);
  const overall = totalWeight ? Math.round(scored.reduce((sum, d) => sum + d.weight * d.score, 0) / totalWeight) : 0;

  return {
    url: finalUrl,
    title,
    overall,
    dimensions: scored.map(({ weight, ...rest }) => rest),
    recommendations: buildRecommendations(scored),
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze, band };
