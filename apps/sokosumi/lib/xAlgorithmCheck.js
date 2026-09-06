"use strict";

// Deterministic X/Twitter-post scorer for /tools/x-algorithm-analyzer. Scores
// a pasted post against the ranking signals X's own open-sourced
// recommendation algorithm ("the-algorithm", released March 2023) is
// documented to use: a real penalty on off-platform links, a boost for
// native media and for posts that generate reply conversation, and a penalty
// on spam-shaped formatting (hashtag/mention stuffing, shouting). No network
// call, no LLM — every check here is a regex or a threshold, the same
// approach postCheck.js and headlineCheck.js use.

const MAX_TEXT_LENGTH = 2000;

const REPLY_TRIGGER = /\?\s*$|what do you think|reply with|agree or disagree|thoughts\?|curious (what|how|why)|anyone else|change my mind|hot take|unpopular opinion/i;
const URL_PATTERN = /https?:\/\/\S+/gi;
const HASHTAG_PATTERN = /#\w+/g;
const MENTION_PATTERN = /@\w+/g;

const DIMENSION_WEIGHT = { conversation: 25, links: 25, format: 25, spam: 25 };

function band(score) {
  return score >= 80 ? "pass" : score >= 50 ? "warn" : "error";
}

function buildConversationChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });

  if (REPLY_TRIGGER.test(text.trim())) {
    add("pass", "Invites replies", "conversation", "A question or reply prompt is present — the algorithm's public code weights reply engagement well above likes or reposts.", 3);
  } else {
    add("warn", "No reply hook", "conversation", "Nothing here prompts a reply. Posts that spark a reply thread are documented to rank higher than ones that only collect likes.", 3);
  }

  return checks;
}

function buildLinksChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const links = text.match(URL_PATTERN) || [];

  if (links.length > 0) {
    add("warn", "Contains an off-platform link", "links", `${links.length} link(s) found. The ranking model applies a documented penalty to posts with outbound links, since it optimizes for time spent on X — put the link in the first reply instead.`, 4);
  } else {
    add("pass", "No off-platform link diluting reach", "links", "The post keeps readers on-platform.", 4);
  }

  return checks;
}

function buildFormatChecks(text, hasMedia) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const chars = text.length;

  if (hasMedia) {
    add("pass", "Includes native media", "format", "Photos, GIFs and video get a documented boost over text-only posts.", 3);
  } else {
    add("warn", "Text-only post", "format", "Consider attaching an image, GIF or video — native media gets algorithmic preference over plain text.", 3);
  }

  if (chars < 40) {
    add("warn", "Very short post", "format", `${chars} characters. Very short, low-substance posts tend to get less algorithmic reach than posts with real content.`, 2);
  } else if (chars > 640 && !text.includes("\n")) {
    add("warn", "Long, unbroken text", "format", `${chars} characters with no line breaks — hard to skim. A blank line between ideas reads easier and holds attention longer.`, 2);
  } else {
    add("pass", "Length is in a solid range", "format", `${chars} characters.`, 2);
  }

  return checks;
}

function buildSpamChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const hashtags = text.match(HASHTAG_PATTERN) || [];
  const mentions = text.match(MENTION_PATTERN) || [];

  if (hashtags.length >= 3) {
    add("warn", "Too many hashtags", "spam", `${hashtags.length} hashtags reads as spam to both readers and the ranking model — one or two focused tags outperform a stack of them.`, 2);
  } else {
    add("pass", "Hashtag use is restrained", "spam", `${hashtags.length} hashtag(s).`, 2);
  }

  if (mentions.length >= 5) {
    add("warn", "Mention-heavy", "spam", `${mentions.length} @mentions in one post reads as a tagging spree rather than a genuine reply to those people.`, 1);
  } else {
    add("pass", "Mentions look genuine", "spam", `${mentions.length} @mention(s).`, 1);
  }

  if (/[A-Z]{6,}/.test(text) || /!{2,}/.test(text)) {
    add("warn", "Reads as shouting", "spam", "Long runs of capitals or stacked exclamation marks read as spam to most ranking and spam-detection systems.", 1);
  } else {
    add("pass", "Reads clearly, no shouting", "spam", "No all-caps runs or stacked punctuation.", 1);
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
  const hasMedia = Boolean(input && input.hasMedia);
  const trimmed = text.trim();

  if (!trimmed) {
    const error = new Error("Paste the post you want scored.");
    error.status = 400;
    throw error;
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    const error = new Error(`That's ${trimmed.length} characters — keep it under ${MAX_TEXT_LENGTH}.`);
    error.status = 400;
    throw error;
  }

  const dimensions = [
    { key: "conversation", label: "Conversation prompt", checks: buildConversationChecks(trimmed) },
    { key: "links", label: "Off-platform links", checks: buildLinksChecks(trimmed) },
    { key: "format", label: "Native format", checks: buildFormatChecks(trimmed, hasMedia) },
    { key: "spam", label: "Spam signals", checks: buildSpamChecks(trimmed) },
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
