"use strict";

// Deterministic landing-page-copy scorer for /tools/landing-page-copy-analyzer.
// Given pasted landing page copy, this scores four dimensions — clarity,
// benefit focus, specificity, and CTA strength — from static rules against
// the text alone, the same approach headlineCheck.js and postCheck.js use.
// No network call, no LLM.

const MAX_TEXT_LENGTH = 6000;

const JARGON = /\b(synergy|synergies|leverage|leveraging|paradigm|holistic|ecosystem|seamlessly|seamless|robust|turnkey|best-in-class|cutting-edge|state-of-the-art|world-class|game-chang(?:er|ers|ing)|disruptive|revolutionary|unlock(?:ing)? (?:your|the) potential|frictionless|next-generation)\b/gi;

const VAGUE_QUALIFIER = /\b(various|numerous|many|several|some|a lot of|lots of|cutting-edge|state-of-the-art|world-class|best-in-class|industry-leading)\b/gi;

const BENEFIT_VERB = /\b(save|saves|saving|grow|grows|growing|increase|increases|reduce|reduces|avoid|avoids|unlock|unlocks|boost|boosts|improve|improves|cut|cuts|eliminate|eliminates|win|wins|earn|earns|gain|gains)\b/gi;

const CTA_STRONG = /\b(start (?:your )?free trial|get started free|book a demo|try (?:it )?free|get instant access|claim your|start now|join free|get your free)\b/i;
const CTA_ANY = /\b(get started|sign up|start (?:your|a) (?:trial|free)|try (?:it )?free|book a demo|buy now|download|contact us|request a demo|schedule a call|learn more|submit|click here|read more)\b/i;
const CTA_WEAK_ONLY = /\b(learn more|submit|click here|read more)\b/i;

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

function wordCount(text) {
  return (text.match(/\b[\w'-]+\b/g) || []).length;
}

function buildClarityChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const sents = sentences(text);
  const words = wordCount(text);
  const avgWords = sents.length ? words / sents.length : words;

  if (avgWords > 28) {
    add("warn", "Sentences run long", "clarity", `Averaging ${avgWords.toFixed(1)} words per sentence. Past ~25, readers start skimming instead of reading.`, 2);
  } else {
    add("pass", "Sentences are a readable length", "clarity", `Averaging ${avgWords.toFixed(1)} words per sentence.`, 2);
  }

  const jargonMatches = text.match(JARGON) || [];
  if (jargonMatches.length >= 3) {
    add("warn", "Heavy on corporate jargon", "clarity", `Found ${jargonMatches.length} jargon terms (${Array.from(new Set(jargonMatches.map((m) => m.toLowerCase()))).slice(0, 5).join(", ")}). These read as filler rather than a claim.`, 2);
  } else if (jargonMatches.length > 0) {
    add("pass", "Jargon is under control", "clarity", `${jargonMatches.length} jargon term(s) found — not enough to drown out the actual claim.`, 1);
  } else {
    add("pass", "No jargon filler", "clarity", "No overused corporate jargon detected.", 1);
  }

  const passiveMatches = text.match(/\b(?:is|are|was|were|be|been|being)\s+\w+ed\b/gi) || [];
  const passiveRatio = sents.length ? passiveMatches.length / sents.length : 0;
  if (passiveRatio > 0.35) {
    add("warn", "Heavy on passive voice", "clarity", `About ${Math.round(passiveRatio * 100)}% of sentences read as passive. Active voice ("we ship it" vs "it is shipped") reads faster and more confident.`, 1);
  } else {
    add("pass", "Mostly active voice", "clarity", "No heavy reliance on passive constructions.", 1);
  }

  return checks;
}

function buildBenefitChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const youCount = (text.match(/\b(you|your|you're|yours)\b/gi) || []).length;
  const weCount = (text.match(/\b(we|our|us|ours|i|my|i'm)\b/gi) || []).length;
  const total = youCount + weCount;
  const ratio = total ? youCount / total : 0;

  if (total === 0) {
    add("warn", "No first- or second-person language", "benefit", "The copy doesn't address the reader directly at all — hard to tell whose problem it's solving.", 3);
  } else if (ratio >= 0.6) {
    add("pass", "Reads customer-centric", "benefit", `"You/your" outnumbers "we/our" ${youCount}-to-${weCount} — the copy is talking about the reader's outcome, not the company.`, 3);
  } else if (ratio >= 0.3) {
    add("warn", "Mixed focus", "benefit", `"You/your" appears ${youCount} times against "we/our" ${weCount} times — leaning company-centric. Rewriting a few "we" sentences as "you" sentences usually sharpens this.`, 3);
  } else {
    add("error", "Reads company-centric", "benefit", `"We/our" (${weCount}) heavily outnumbers "you/your" (${youCount}) — this reads like an about-us page, not a pitch to the reader.`, 3);
  }

  const verbMatches = text.match(BENEFIT_VERB) || [];
  if (verbMatches.length === 0) {
    add("warn", "No outcome verbs", "benefit", 'No words like "save", "grow", "reduce" or "unlock" — nothing here names the outcome the reader gets.', 2);
  } else {
    add("pass", "Names an outcome", "benefit", `Uses outcome verbs: ${Array.from(new Set(verbMatches.map((m) => m.toLowerCase()))).slice(0, 5).join(", ")}.`, 2);
  }

  return checks;
}

function buildSpecificityChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const numberMatches = text.match(/\b\d+(?:[.,]\d+)?%?\b/g) || [];

  if (numberMatches.length === 0) {
    add("warn", "No concrete numbers", "specificity", "No stats, prices, timeframes or counts — every claim is qualitative, which is easy to skim past.", 3);
  } else {
    add("pass", "Backs claims with numbers", "specificity", `Found ${numberMatches.length} number(s) in the copy (e.g. ${numberMatches.slice(0, 4).join(", ")}).`, 3);
  }

  const vagueMatches = text.match(VAGUE_QUALIFIER) || [];
  if (vagueMatches.length >= 3) {
    add("warn", "Heavy on vague qualifiers", "specificity", `Phrases like "${Array.from(new Set(vagueMatches.map((m) => m.toLowerCase()))).slice(0, 4).join('", "')}" appear ${vagueMatches.length} times — these stand in for a real claim rather than making one.`, 2);
  } else {
    add("pass", "Light on vague qualifiers", "specificity", "No pile-up of vague filler qualifiers.", 2);
  }

  return checks;
}

function buildCtaChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const hasStrong = CTA_STRONG.test(text);
  const hasAny = CTA_ANY.test(text);
  const weakOnly = hasAny && !hasStrong && CTA_WEAK_ONLY.test(text);

  if (!hasAny) {
    add("error", "No call to action found", "cta", 'No CTA phrasing detected (no "get started", "sign up", "book a demo" or similar) — a reader who is convinced has nothing to click.', 4);
  } else if (hasStrong) {
    add("pass", "Clear, specific call to action", "cta", "The copy includes a concrete, low-friction CTA rather than a generic one.", 4);
  } else if (weakOnly) {
    add("warn", "CTA is generic", "cta", 'Only generic phrasing like "learn more" or "click here" — naming the actual next step ("start your free trial", "book a 15-minute demo") usually converts better.', 4);
  } else {
    add("pass", "Has a call to action", "cta", "The copy includes CTA-style phrasing.", 4);
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

function analyze(input) {
  const text = String((input && input.text) || "");
  const trimmed = text.trim();

  if (!trimmed) {
    const error = new Error("Paste the landing page copy you want scored.");
    error.status = 400;
    throw error;
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    const error = new Error(`That's ${trimmed.length} characters — keep it under ${MAX_TEXT_LENGTH}.`);
    error.status = 400;
    throw error;
  }

  const dimensions = [
    { key: "clarity", label: "Clarity", checks: buildClarityChecks(trimmed) },
    { key: "benefit", label: "Benefit focus", checks: buildBenefitChecks(trimmed) },
    { key: "specificity", label: "Specificity", checks: buildSpecificityChecks(trimmed) },
    { key: "cta", label: "CTA strength", checks: buildCtaChecks(trimmed) },
  ];

  const scored = dimensions.map((d) => ({ ...d, score: scoreFromChecks(d.checks), weight: DIMENSION_WEIGHT[d.key] }));
  const totalWeight = scored.reduce((sum, d) => sum + d.weight, 0);
  const overall = totalWeight ? Math.round(scored.reduce((sum, d) => sum + d.weight * d.score, 0) / totalWeight) : 0;

  return {
    length: trimmed.length,
    overall,
    dimensions: scored.map(({ weight, ...rest }) => rest),
    recommendations: buildRecommendations(scored),
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze, band };
