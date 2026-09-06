"use strict";

// Deterministic video-script scorer for /tools/video-script-checker. Given a
// pasted short-form video script (Reels/TikTok/YouTube Shorts voiceover or
// on-screen dialogue) this scores three dimensions — hook quality, retention
// & pacing, and CTA clarity — from static rules against the text alone, the
// same approach postCheck.js uses for LinkedIn posts. No network call, no
// LLM: every check here is a regex, a word count, or a threshold.

const MAX_TEXT_LENGTH = 4000;
const WORDS_PER_SECOND = 2.5; // a natural spoken pace for short-form narration

const SLOW_OPENERS = [
  /^(hi|hey|hello|what'?s up|yo) (guys|everyone|everybody|folks|there)\b/i,
  /^welcome back to (my|the) (channel|page)\b/i,
  /^(today|in this video|in this one)( i'?m going to| we'?re going to| i'?ll)?\b/i,
  /^before we (start|begin|get into it)\b/i,
  /^so (today|basically|i wanted to)\b/i,
];

const HOOK_TRIGGER =
  /\?|\d|^(stop|wait|nobody|the (truth|real reason)|here'?s (why|how|what)|this is why|you'?re doing .* wrong|do this|don'?t|no one (tells|talks))/i;

const FILLER_WORDS = /\b(um|uh|like|you know|basically|actually|literally|kind of|sort of)\b/gi;

const CTA_PATTERNS = [
  /\bfollow\b/i,
  /\bcomment\b/i,
  /\bshare (this|with)\b/i,
  /\bsave (this|it)\b/i,
  /\blink in (my )?bio\b/i,
  /\bpart (2|two)\b/i,
  /\bwatch (to|till|until) the end\b/i,
  /\blet me know\b/i,
  /\bdm me\b/i,
  /\?\s*$/,
];

const PATTERN_BREAK = /\[(cut to|b-?roll|text overlay|zoom|graphic|beat|pattern break)[^\]]*\]|\bbut (here'?s|wait)\b|\bplot twist\b/i;

const DIMENSION_WEIGHT = { hook: 35, retention: 40, cta: 25 };

function band(score) {
  return score >= 80 ? "pass" : score >= 50 ? "warn" : "error";
}

function firstLine(text) {
  const idx = text.indexOf("\n");
  const line = idx === -1 ? text : text.slice(0, idx);
  return line.trim() || text.trim().slice(0, 120);
}

function buildHookChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const hook = firstLine(text);
  const words = hook.split(/\s+/).filter(Boolean).length;

  if (!hook) {
    add("error", "No opening line", "hook", "The script doesn't open with a distinct first line — nothing said in the first second or two that gives a viewer a reason to stay.", 2);
  } else if (SLOW_OPENERS.some((re) => re.test(hook))) {
    add("error", "Opens with a slow wind-up", "hook", `"${hook}" — a greeting or channel intro burns the first 1–2 seconds, which is when most short-form drop-off happens.`, 3);
  } else if (words > 20) {
    add("warn", "Opening line runs long", "hook", `${words} words before the first beat. Say it in under 12–15 words so the payoff lands inside the first 2–3 seconds.`, 2);
  } else {
    add("pass", "Opening line is tight", "hook", `${words} words — short enough to land before a viewer's thumb moves.`, 1);
  }

  if (hook && HOOK_TRIGGER.test(hook)) {
    add("pass", "Hook has a trigger", "hook", "The opening line asks a question, states a number, or makes a claim worth a contradiction — a reason to keep watching.", 2);
  } else if (hook) {
    add("warn", "Hook has no obvious trigger", "hook", "No question, number, or contrarian claim in the opening line. A flat statement gets scrolled past.", 2);
  }

  return checks;
}

function buildRetentionChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const estSeconds = Math.round(wordCount / WORDS_PER_SECOND);

  if (estSeconds < 15) {
    add("warn", "Script is very short", "length", `About ${estSeconds}s at a natural speaking pace (${wordCount} words). That can work for one punchy beat, but there's often not enough time to build a hook-to-payoff arc.`, 2);
  } else if (estSeconds > 90) {
    add("warn", "Script runs long for short-form", "length", `About ${estSeconds}s (${wordCount} words). Past roughly 60–90s, completion rate drops sharply on Reels, TikTok and Shorts — consider a part 2.`, 2);
  } else {
    add("pass", "Runtime fits the short-form window", "length", `About ${estSeconds}s (${wordCount} words) at a natural speaking pace.`, 2);
  }

  const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
  const avgSentenceWords = wordCount / Math.max(sentences.length, 1);
  if (avgSentenceWords > 22) {
    add("warn", "Sentences run long", "pacing", `About ${Math.round(avgSentenceWords)} words per sentence on average. Short, punchy sentences hold attention better on camera than long ones.`, 2);
  } else {
    add("pass", "Sentences are short and punchy", "pacing", `About ${Math.round(avgSentenceWords)} words per sentence on average.`, 2);
  }

  const fillers = trimmed.match(FILLER_WORDS) || [];
  if (fillers.length / Math.max(wordCount, 1) > 0.03) {
    add("warn", "Heavy filler words", "filler", `${fillers.length} filler word(s) ("um", "like", "basically"...) across ${wordCount} words. Cutting these tightens pacing and reads as more confident.`, 1);
  } else {
    add("pass", "Few or no filler words", "filler", `${fillers.length} filler word(s) across ${wordCount} words.`, 1);
  }

  if (PATTERN_BREAK.test(trimmed)) {
    add("pass", "Has a pattern break", "structure", "The script marks a cut, twist, or beat change partway through — a proven way to reset attention mid-watch.", 1);
  } else if (estSeconds > 30) {
    add("warn", "No pattern break", "structure", "Nothing marks a visual cut, twist, or beat change partway through. Scripts over ~30s hold attention better with at least one reset near the midpoint.", 1);
  }

  return checks;
}

function buildCtaChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const tail = text.trim().slice(-300);
  const matches = CTA_PATTERNS.filter((re) => re.test(tail));

  if (matches.length === 0) {
    add("error", "No call to action", "cta", "Nothing here asks the viewer to do anything next — no follow, comment, share, or save. A script that just stops leaves engagement on the table.", 3);
  } else if (matches.length === 1) {
    add("pass", "Clear call to action", "cta", "The close asks for one specific action — the easiest kind for a viewer to actually take.", 3);
  } else {
    add("warn", "Multiple calls to action", "cta", `${matches.length} different asks stacked at the end. One clear ask converts better than several competing ones.`, 2);
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
    const error = new Error("Paste the script you want scored.");
    error.status = 400;
    throw error;
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    const error = new Error(`That's ${trimmed.length} characters — keep it under ${MAX_TEXT_LENGTH}.`);
    error.status = 400;
    throw error;
  }

  const dimensions = [
    { key: "hook", label: "Hook quality", checks: buildHookChecks(trimmed) },
    { key: "retention", label: "Retention & pacing", checks: buildRetentionChecks(trimmed) },
    { key: "cta", label: "CTA clarity", checks: buildCtaChecks(trimmed) },
  ];

  const scored = dimensions.map((d) => ({ ...d, score: scoreFromChecks(d.checks), weight: DIMENSION_WEIGHT[d.key] }));
  const totalWeight = scored.reduce((sum, d) => sum + d.weight, 0);
  const overall = totalWeight ? Math.round(scored.reduce((sum, d) => sum + d.weight * d.score, 0) / totalWeight) : 0;

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  return {
    length: trimmed.length,
    wordCount,
    estSeconds: Math.round(wordCount / WORDS_PER_SECOND),
    overall,
    dimensions: scored.map(({ weight, ...rest }) => rest),
    recommendations: buildRecommendations(scored),
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze, band };
