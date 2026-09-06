"use strict";

// Deterministic headline / ad-copy scorer for /tools/headline-analyzer. Given
// a pasted headline (a blog title, ad headline, email subject line, or social
// hook) this scores four dimensions — length, emotional/power words,
// specificity, and clarity — from static rules against the text alone, the
// same approach postCheck.js and videoScriptCheck.js use. No network call,
// no LLM: every check here is a regex, a word count, or a threshold.

const MAX_TEXT_LENGTH = 300;

const POWER_WORDS =
  /\b(free|proven|secret|secrets|ultimate|essential|effortless|powerful|guaranteed|instantly|surprising|shocking|easy|simple|exclusive|limited|new|best|top|amazing|incredible|unbelievable|revolutionary|breakthrough|banned|forbidden|dangerous|warning|stop|never|always|finally|actually)\b/gi;

const GENERIC_TEMPLATES = [
  /everything you need to know/i,
  /the ultimate guide to/i,
  /you won'?t believe/i,
  /this one weird trick/i,
  /will (blow your mind|change your life)/i,
  /changes everything/i,
  /\d+ (things|reasons|ways) (that|you)/i,
];

const NUMBER_OR_STAT = /\d/;
const HOW_TO_OR_QUESTION = /^how to\b/i;
const DIMENSION_WEIGHT = { length: 25, power: 25, specificity: 25, clarity: 25 };

function band(score) {
  return score >= 80 ? "pass" : score >= 50 ? "warn" : "error";
}

function buildLengthChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const chars = text.length;
  const words = text.split(/\s+/).filter(Boolean).length;

  if (chars < 20) {
    add("warn", "Headline is very short", "length", `${chars} characters. There's often not enough here to make a specific promise — a reader has nothing to react to.`, 2);
  } else if (chars > 70) {
    add("warn", "Headline runs long", "length", `${chars} characters — likely to get truncated in a search result, a social card, or an email subject line preview.`, 2);
  } else {
    add("pass", "Length is in a solid range", "length", `${chars} characters — fits most search results, social previews and subject lines without truncating.`, 2);
  }

  if (words > 14) {
    add("warn", "Wordy", "length", `${words} words. Cutting to under 12 or so usually tightens the promise without losing the point.`, 1);
  } else {
    add("pass", "Concise word count", "length", `${words} words.`, 1);
  }

  return checks;
}

function buildPowerChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const matches = text.match(POWER_WORDS) || [];

  if (matches.length === 0) {
    add("warn", "No power or emotional word", "power", "Nothing here signals urgency, exclusivity, or a strong outcome. A flat, purely descriptive headline gets skipped more often than one with an emotional edge.", 3);
  } else if (matches.length <= 3) {
    add("pass", "Has an emotional trigger", "power", `Uses ${matches.length} power word(s): ${Array.from(new Set(matches.map((m) => m.toLowerCase()))).join(", ")}.`, 3);
  } else {
    add("warn", "Overloaded with power words", "power", `${matches.length} power words in one headline reads as spam or clickbait rather than a genuine promise.`, 2);
  }

  return checks;
}

function buildSpecificityChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const hasNumber = NUMBER_OR_STAT.test(text);
  const hasHowTo = HOW_TO_OR_QUESTION.test(text.trim());
  const isQuestion = /\?\s*$/.test(text.trim());

  if (hasNumber || hasHowTo || isQuestion) {
    const reason = hasNumber ? "includes a specific number" : hasHowTo ? "promises a specific how-to payoff" : "poses a specific question";
    add("pass", "Makes a specific promise", "specificity", `The headline ${reason} — concrete claims outperform vague ones.`, 3);
  } else {
    add("warn", "No specific hook", "specificity", "No number, how-to framing, or question — nothing here promises a concrete, checkable payoff.", 3);
  }

  return checks;
}

function buildClarityChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const trimmed = text.trim();
  const template = GENERIC_TEMPLATES.find((re) => re.test(trimmed));

  if (template) {
    add("error", "Generic template phrasing", "clarity", "This is a widely overused headline template — readers and, increasingly, spam filters have seen it thousands of times before. Say the specific claim instead of the generic wrapper.", 3);
  } else if (/[A-Z]{6,}/.test(trimmed) || /!{2,}/.test(trimmed)) {
    add("warn", "Reads as shouting", "clarity", "Long runs of capitals or stacked exclamation marks read as spam to readers and to most spam filters.", 2);
  } else {
    add("pass", "Reads clearly", "clarity", "No overused template phrasing, no shouting — the claim reads as genuine rather than manufactured.", 2);
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
    const error = new Error("Paste the headline you want scored.");
    error.status = 400;
    throw error;
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    const error = new Error(`That's ${trimmed.length} characters — keep it under ${MAX_TEXT_LENGTH}.`);
    error.status = 400;
    throw error;
  }

  const dimensions = [
    { key: "length", label: "Length", checks: buildLengthChecks(trimmed) },
    { key: "power", label: "Emotional pull", checks: buildPowerChecks(trimmed) },
    { key: "specificity", label: "Specificity", checks: buildSpecificityChecks(trimmed) },
    { key: "clarity", label: "Clarity", checks: buildClarityChecks(trimmed) },
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
