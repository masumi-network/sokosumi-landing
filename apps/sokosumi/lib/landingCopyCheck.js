"use strict";

// Deterministic landing-page-copy scorer for /tools/landing-page-copy-analyzer.
// Given a landing page URL, fetches it (through lib/safeFetch.js) and scores
// the page's visible copy on four dimensions — clarity, benefit focus,
// specificity, and CTA strength — from static rules against the text alone,
// the same tolerant-regex approach headlineCheck.js and postCheck.js use.

const { fetchPage, visibleText, collectTitle, normalizeUrl } = require("./htmlExtract");
const { fetchErrorMessage } = require("./safeFetch");

const JARGON = /\b(synergy|synergies|leverage|leveraging|paradigm|holistic|ecosystem|seamlessly|seamless|robust|turnkey|best-in-class|cutting-edge|state-of-the-art|world-class|game-chang(?:er|ers|ing)|disruptive|revolutionary|unlock(?:ing)? (?:your|the) potential|frictionless|next-generation)\b/gi;

const VAGUE_QUALIFIER = /\b(various|numerous|many|several|some|a lot of|lots of|cutting-edge|state-of-the-art|world-class|best-in-class|industry-leading)\b/gi;

const BENEFIT_VERB = /\b(save|saves|saving|grow|grows|growing|increase|increases|reduce|reduces|avoid|avoids|unlock|unlocks|boost|boosts|improve|improves|cut|cuts|eliminate|eliminates|win|wins|earn|earns|gain|gains)\b/gi;

const CTA_STRONG = /\b(start (?:your )?free trial|get started free|book a demo|try (?:it )?free|get instant access|claim your|start now|join free|get your free)\b/i;
const CTA_ANY = /\b(get started|sign up|start (?:your|a) (?:trial|free)|try (?:it )?free|book a demo|buy now|download|contact us|request a demo|schedule a call|learn more|submit|click here|read more)\b/i;
const CTA_WEAK_ONLY = /\b(learn more|submit|click here|read more)\b/i;

// A "concrete number" is one that reads as an actual claim — a percentage,
// a price, a multiplier, a scaled count (10k/5M) or a number bound to a unit.
// Bare digits (SVG coordinates, ids, style values) are deliberately excluded,
// since matching every "\d+" pulls in page junk the reader never sees as copy.
const STAT_NUMBER = /[$€£]\s?\d[\d,]*(?:\.\d+)?|\b\d+(?:\.\d+)?\s?%|\b\d+(?:\.\d+)?\s?[x×](?=\s|$|[.,!?])|\b\d+(?:\.\d+)?\s?[kmb]\b|\b\d[\d,]*\+?\s?(?:hours?|hrs?|minutes?|mins?|seconds?|secs?|days?|weeks?|months?|years?|customers?|users?|teams?|companies|countries|languages|integrations?|projects?|developers?|engineers?|reviews?|ratings?|downloads?|installs?|seats?|apps?|websites?|sites?)\b/gi;

const DIMENSION_WEIGHT = { clarity: 25, benefit: 25, specificity: 25, cta: 25 };

function band(score) {
  return score >= 80 ? "pass" : score >= 50 ? "warn" : "error";
}

function sentences(text) {
  return text
    .split(/[.!?]+(?:\s|$)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Distinct matches, lower-cased, in first-seen order — for listing evidence.
function uniqueMatches(matches) {
  return Array.from(new Set(matches.map((m) => m.toLowerCase().replace(/\s+/g, " ").trim())));
}

// Many marketing pages embed live product demos, code snippets, changelogs and
// calendar widgets whose text isn't landing copy. Keep only sentences that read
// as prose, so scores and evidence reflect what a visitor actually reads rather
// than UI chrome. Falls back to the raw text if filtering removes everything.
function isCopySentence(s) {
  if (!s) return false;
  if (/[<][A-Za-z/]|=\s*[{"'`]|\)\s*\{|\}\s*;|=>|\/>/.test(s)) return false; // code fragments
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length < 3) return false;
  if ((s.match(/[·•|→]/g) || []).length >= 2) return false; // activity feeds / breadcrumb rows
  if (/\b\d+\s*(?:min|mins|sec|secs|hr|hrs|hour|hours|minutes?|seconds?|days?)\s+ago\b/i.test(s)) return false; // changelog timestamps
  if ((s.match(/\b[A-Z]{2,5}-\d{2,6}\b/g) || []).length >= 1) return false; // ticket/SKU boards
  if ((s.match(/\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\b/gi) || []).length >= 3) return false; // calendars
  const digits = (s.match(/\d/g) || []).length;
  if (digits / (s.replace(/\s/g, "").length || 1) > 0.4) return false; // number grids
  return true;
}

function copyText(text) {
  const kept = sentences(text).filter(isCopySentence);
  return kept.length ? kept.join(". ") + "." : text;
}

// Pull the page's actual marketing copy by reading only semantic copy tags
// (headings, paragraphs, list items, quotes) after dropping regions that never
// hold landing copy — nav, footer, forms, code and embedded app/demo widgets.
// This is what separates real copy from the UI chrome that flat text mixes in.
function extractCopyBlocks(html) {
  const stripped = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|template|svg|iframe|code|pre|form|select|textarea|button)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(nav|footer|aside)\b[\s\S]*?<\/\1>/gi, " ");
  const blocks = [];
  const re = /<(h1|h2|h3|h4|p|li|blockquote|figcaption)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(stripped))) {
    const text = visibleText(m[2]);
    if (text) blocks.push(text);
  }
  return blocks;
}

// The copy the tool actually scores: semantic blocks when the page exposes
// enough of them, otherwise the flat visible text — always run through the
// prose filter so demo/log/code lines never reach the scorer either way.
function pageCopy(html) {
  const blocks = extractCopyBlocks(html);
  const joined = blocks.join(". ");
  if (blocks.length >= 6 && joined.replace(/\s/g, "").length >= 200) {
    const scoped = copyText(joined);
    if (scoped.replace(/\s/g, "").length >= 150) return scoped;
  }
  return copyText(visibleText(html).replace(/\s+/g, " ").trim());
}

// Activity feeds, changelogs and embedded product demos leak into a page's
// visible text but aren't marketing copy — de-prioritise them as evidence so
// the examples we surface are the real sentences a reader would judge.
function looksNoisy(s) {
  const middots = (s.match(/[·•|]/g) || []).length;
  const digits = (s.match(/\d/g) || []).length;
  const nonSpace = s.replace(/\s/g, "").length || 1;
  return middots >= 2 || /\b\d+\s*(?:min|mins|sec|secs|hr|hrs|hour|hours|minutes|seconds|day|days)\s+ago\b/i.test(s) || digits / nonSpace > 0.35;
}

// Up to `limit` distinct sentences the reader can actually find on the page,
// each carrying a match — the evidence behind a verdict. Clean marketing lines
// come first; noisy UI/log lines only fill in if nothing cleaner matched.
function matchingSentences(ev, re, limit, max) {
  const clean = [];
  const noisy = [];
  const seen = new Set();
  const cap = limit || 4;
  const width = max || 160;
  for (const s of ev) {
    re.lastIndex = 0;
    if (!re.test(s)) continue;
    const t = s
      .replace(/\s+/g, " ")
      .replace(/^Fig\s+\d+(?:\.\d+)?\s+/i, "") // drop figure-caption prefixes
      .trim();
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const display = t.length > width ? t.slice(0, width).trim() + "…" : t;
    (looksNoisy(t) ? noisy : clean).push(display);
  }
  return clean.concat(noisy).slice(0, cap);
}

function wordCount(text) {
  return (text.match(/\b[\w'-]+\b/g) || []).length;
}

function buildClarityChecks(text, evSents) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1, evidence) =>
    checks.push({ level, title, tag, detail, weight, evidence: evidence && evidence.length ? evidence : undefined });
  const sents = sentences(text);
  const ev = evSents && evSents.length ? evSents : sents;
  const words = wordCount(text);
  const avgWords = sents.length ? words / sents.length : words;

  if (avgWords > 28) {
    const longOnes = sents
      .filter((s) => wordCount(s) > 28)
      .sort((a, b) => wordCount(b) - wordCount(a))
      .slice(0, 4)
      .map((s) => (s.length > 160 ? s.slice(0, 160).trim() + "…" : s));
    add("warn", "Sentences run long", "clarity", `Averaging ${avgWords.toFixed(1)} words per sentence. Past ~25, readers start skimming instead of reading.`, 2, longOnes);
  } else {
    add("pass", "Sentences are a readable length", "clarity", `Averaging ${avgWords.toFixed(1)} words per sentence.`, 2);
  }

  const jargonMatches = text.match(JARGON) || [];
  const jargonWords = uniqueMatches(jargonMatches);
  if (jargonMatches.length >= 3) {
    add("warn", "Heavy on corporate jargon", "clarity", `Corporate jargon appears ${jargonMatches.length} times across ${jargonWords.length} term(s): ${jargonWords.map((w) => `"${w}"`).join(", ")}. These read as filler rather than a concrete claim.`, 2, matchingSentences(ev, JARGON, 8));
  } else if (jargonMatches.length > 0) {
    add("pass", "Jargon is under control", "clarity", `Only ${jargonMatches.length} jargon term(s) — ${jargonWords.map((w) => `"${w}"`).join(", ")} — not enough to drown out the actual claim.`, 1, matchingSentences(ev, JARGON, 8));
  } else {
    add("pass", "No jargon filler", "clarity", "No overused corporate jargon (synergy, leverage, best-in-class, seamless…) found in the copy.", 1);
  }

  const PASSIVE = /\b(?:is|are|was|were|be|been|being)\s+\w+ed\b/gi;
  const passiveMatches = text.match(PASSIVE) || [];
  const passiveRatio = sents.length ? passiveMatches.length / sents.length : 0;
  if (passiveRatio > 0.35) {
    add("warn", "Heavy on passive voice", "clarity", `About ${Math.round(passiveRatio * 100)}% of sentences read as passive (${passiveMatches.length} of ${sents.length}). Active voice reads faster and more confident.`, 1, matchingSentences(ev, PASSIVE, 8));
  } else {
    add("pass", "Mostly active voice", "clarity", `Only ${passiveMatches.length} passive construction(s) across ${sents.length} sentence(s).`, 1);
  }

  return checks;
}

function buildBenefitChecks(text, evSents) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1, evidence) =>
    checks.push({ level, title, tag, detail, weight, evidence: evidence && evidence.length ? evidence : undefined });
  const sents = sentences(text);
  const ev = evSents && evSents.length ? evSents : sents;
  const youCount = (text.match(/\b(you|your|you're|yours)\b/gi) || []).length;
  const weCount = (text.match(/\b(we|our|us|ours|i|my|i'm)\b/gi) || []).length;
  const total = youCount + weCount;
  const ratio = total ? youCount / total : 0;
  const WE = /\b(we|our|us|ours)\b/gi;
  const YOU = /\b(you|your|you're|yours)\b/gi;

  if (total === 0) {
    add("warn", "No first- or second-person language", "benefit", "The copy doesn't address the reader directly at all — hard to tell whose problem it's solving.", 3);
  } else if (ratio >= 0.6) {
    add("pass", "Reads customer-centric", "benefit", `"You/your" outnumbers "we/our" ${youCount}-to-${weCount} — the copy is talking about the reader's outcome, not the company.`, 3, matchingSentences(ev, YOU, 8));
  } else if (ratio >= 0.3) {
    add("warn", "Mixed focus", "benefit", `"You/your" appears ${youCount} times against "we/our" ${weCount} times — leaning company-centric. These "we/our" sentences are the ones to consider rewriting as "you" sentences.`, 3, matchingSentences(ev, WE, 8));
  } else {
    add("error", "Reads company-centric", "benefit", `"We/our" (${weCount}) heavily outnumbers "you/your" (${youCount}) — this reads like an about-us page, not a pitch to the reader.`, 3, matchingSentences(ev, WE, 8));
  }

  const verbMatches = text.match(BENEFIT_VERB) || [];
  if (verbMatches.length === 0) {
    add("warn", "No outcome verbs", "benefit", 'No words like "save", "grow", "reduce" or "unlock" — nothing here names the outcome the reader gets.', 2);
  } else {
    add("pass", "Names an outcome", "benefit", `Uses outcome verbs: ${uniqueMatches(verbMatches).slice(0, 5).join(", ")}.`, 2, matchingSentences(ev, BENEFIT_VERB, 8));
  }

  return checks;
}

function buildSpecificityChecks(text, evSents) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1, evidence) =>
    checks.push({ level, title, tag, detail, weight, evidence: evidence && evidence.length ? evidence : undefined });
  const sents = sentences(text);
  const ev = evSents && evSents.length ? evSents : sents;
  const numberMatches = (text.match(STAT_NUMBER) || []).map((m) => m.replace(/\s+/g, " ").trim());
  if (numberMatches.length === 0) {
    add("warn", "No concrete numbers", "specificity", "No stats, prices, timeframes or counts (e.g. \"40% faster\", \"$9/mo\", \"10,000 teams\") — every claim is qualitative, which is easy to skim past.", 3);
  } else {
    const shown = uniqueMatches(numberMatches).slice(0, 6);
    add("pass", "Backs claims with numbers", "specificity", `Uses ${numberMatches.length} concrete figure(s) — e.g. ${shown.join(", ")}.`, 3, matchingSentences(ev, STAT_NUMBER, 8));
  }

  const vagueMatches = text.match(VAGUE_QUALIFIER) || [];
  const vagueWords = uniqueMatches(vagueMatches);
  if (vagueMatches.length >= 3) {
    add("warn", "Heavy on vague qualifiers", "specificity", `Vague qualifiers appear ${vagueMatches.length} times across ${vagueWords.length} term(s): ${vagueWords.map((w) => `"${w}"`).join(", ")}. These stand in for a real claim rather than making one.`, 2, matchingSentences(ev, VAGUE_QUALIFIER, 8));
  } else {
    add("pass", "Light on vague qualifiers", "specificity", "No pile-up of vague filler qualifiers (various, several, world-class…).", 2);
  }

  return checks;
}

function buildCtaChecks(text, evSents) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1, evidence) =>
    checks.push({ level, title, tag, detail, weight, evidence: evidence && evidence.length ? evidence : undefined });
  const sents = sentences(text);
  const ev = evSents && evSents.length ? evSents : sents;
  const strongMatch = text.match(CTA_STRONG);
  const anyMatch = text.match(CTA_ANY);
  const weakMatch = text.match(CTA_WEAK_ONLY);
  const hasStrong = !!strongMatch;
  const hasAny = !!anyMatch;
  const weakOnly = hasAny && !hasStrong && !!weakMatch;

  if (!hasAny) {
    add("error", "No call to action found", "cta", 'No CTA phrasing detected (no "get started", "sign up", "book a demo" or similar) — a reader who is convinced has nothing to click.', 4);
  } else if (hasStrong) {
    add("pass", "Clear, specific call to action", "cta", `Found a concrete, low-friction CTA — "${strongMatch[0].trim()}".`, 4, matchingSentences(ev, CTA_STRONG, 8));
  } else if (weakOnly) {
    add("warn", "CTA is generic", "cta", `The strongest CTA phrasing found is "${weakMatch[0].trim()}" — naming the actual next step ("start your free trial", "book a 15-minute demo") usually converts better.`, 4, matchingSentences(ev, CTA_WEAK_ONLY, 8));
  } else {
    add("pass", "Has a call to action", "cta", `The copy includes CTA-style phrasing — "${anyMatch[0].trim()}".`, 4, matchingSentences(ev, CTA_ANY, 8));
  }

  return checks;
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

async function analyze(input) {
  const url = normalizeUrl((input && input.url) || "");
  if (!url) {
    const error = new Error("Enter the landing page URL you want analyzed.");
    error.status = 400;
    throw error;
  }

  let html, finalUrl;
  try {
    ({ html, finalUrl } = await fetchPage(url));
  } catch (error) {
    const err = new Error(fetchErrorMessage(error) || error.message || "Could not fetch that URL.");
    err.status = 422;
    throw err;
  }

  const title = collectTitle(html);
  // Score the page's real copy blocks (headings, paragraphs, quotes) — not the
  // nav, footer, or embedded demo/code/calendar chrome that flat text mixes in.
  const text = pageCopy(html);
  if (!text) {
    const error = new Error("That page had no readable copy to analyze — it may render its text with JavaScript after load.");
    error.status = 422;
    throw error;
  }
  // Scoring runs on the strict copy blocks (`text`). Evidence is drawn from a
  // wider, still prose-filtered pool — the copy blocks first, then any other
  // real sentences from the full page — so a verdict can show several examples
  // even when the strict extraction is sparse. Copy-block sentences rank first.
  const evPool = Array.from(
    new Set(sentences(text).concat(sentences(copyText(visibleText(html).replace(/\s+/g, " ").trim())))),
  );

  const dimensions = [
    { key: "clarity", label: "Clarity", checks: buildClarityChecks(text, evPool) },
    { key: "benefit", label: "Benefit focus", checks: buildBenefitChecks(text, evPool) },
    { key: "specificity", label: "Specificity", checks: buildSpecificityChecks(text, evPool) },
    { key: "cta", label: "CTA strength", checks: buildCtaChecks(text, evPool) },
  ];

  const scored = dimensions.map((d) => ({ ...d, score: scoreFromChecks(d.checks), weight: DIMENSION_WEIGHT[d.key] }));
  const totalWeight = scored.reduce((sum, d) => sum + d.weight, 0);
  const overall = totalWeight ? Math.round(scored.reduce((sum, d) => sum + d.weight * d.score, 0) / totalWeight) : 0;

  return {
    url: finalUrl,
    title,
    length: text.length,
    overall,
    dimensions: scored.map(({ weight, ...rest }) => rest),
    recommendations: buildRecommendations(scored),
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze, band };
