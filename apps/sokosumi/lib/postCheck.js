"use strict";

// Deterministic social-post scorer for /tools/social-post-checker. Given a
// pasted post draft (and, optionally, a planned day/time to post it) this
// scores six dimensions — hook quality, CTA clarity, engagement-shaping
// formatting, readability, specificity/credibility, and timing — from static
// rules against the text alone. The scoring itself makes no network calls,
// no LLM: every check here is a regex or a threshold, the same way
// seoExtract.js and ogCheck.js score their own inputs. fetchPostText() below
// is the one exception — it turns a public LinkedIn post URL into the same
// plain text, for a post that's already live.

const { safeFetch, readCapped, fetchErrorMessage } = require("./safeFetch");

const MAX_TEXT_LENGTH = 5000;
const HOOK_TRUNCATE = 210; // LinkedIn's desktop "see more" cutoff, roughly

const LINKEDIN_UA =
  "Mozilla/5.0 (compatible; SokosumiPostChecker/1.0; +https://sokosumi.com/tools/social-post-checker)";
const LINKEDIN_PAGE_BYTES = 1.5 * 1024 * 1024;
const LINKEDIN_TIMEOUT = 8000;

// ---------------------------------------------------------------------------
// Static reference data

const CLICHE_OPENERS = [
  /^i'?m (so |really )?(excited|thrilled|happy|proud|honou?red)\b/i,
  /^i am (so |really )?(excited|thrilled|happy|proud|honou?red)\b/i,
  /^(big|huge|exciting) news\b/i,
  /^(thrilled|excited|proud|honou?red) to (announce|share)\b/i,
  /^just wanted to (share|say)\b/i,
];

const HOOK_TRIGGER = /\?|\d|^(how|why|this is why|the (truth|real reason)|nobody (talks|tells you)|stop\b|here'?s (why|how))/i;

const CTA_PATTERNS = [
  /\bcomment\b/i,
  /\blet me know\b/i,
  /\bdm me\b/i,
  /\bfollow (me|us|for more)\b/i,
  /what (do|would) you think/i,
  /\bdrop a\b/i,
  /\btag someone\b/i,
  /\bshare (this|your)\b/i,
  /\?\s*$/,
];

// General, widely observed B2B posting patterns — not personalized to any
// one account's actual audience data. Surfaced honestly as a proxy, the same
// way seoExtract.js labels its ai_readiness_score a proxy rather than a
// measurement.
const DAY_SCORE = { mon: 70, tue: 95, wed: 95, thu: 90, fri: 55, sat: 30, sun: 35 };
const DAY_LABEL = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };

const TIME_SCORE = { "0-6": 20, "6-8": 65, "8-10": 95, "10-12": 80, "12-14": 75, "14-16": 65, "16-18": 55, "18-24": 35 };
const TIME_LABEL = {
  "0-6": "overnight (12–6am)",
  "6-8": "early morning (6–8am)",
  "8-10": "mid-morning (8–10am)",
  "10-12": "late morning (10am–12pm)",
  "12-14": "midday (12–2pm)",
  "14-16": "afternoon (2–4pm)",
  "16-18": "late afternoon (4–6pm)",
  "18-24": "evening (6pm–12am)",
};

const DIMENSION_WEIGHT = { hook: 20, cta: 15, engagement: 25, readability: 15, specificity: 15, timing: 10 };

const CREDIBILITY_PATTERN = /\bwe (surveyed|analyzed|studied|tracked)\b|according to|data (shows|from)|\b\d+% of\b|\bcase study\b|\bcustomers? (told|said)\b/i;

function band(score) {
  return score >= 80 ? "pass" : score >= 50 ? "warn" : "error";
}

// ---------------------------------------------------------------------------
// Dimension builders — each returns an array of { level, title, tag, detail,
// weight }, the same shape (minus "weight") that ogCheck.js/llmsCheck.js use.

function firstLine(text) {
  const idx = text.indexOf("\n");
  const line = idx === -1 ? text : text.slice(0, idx);
  const trimmed = line.trim();
  return trimmed || text.trim().slice(0, HOOK_TRUNCATE);
}

function buildHookChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const hook = firstLine(text);
  const len = hook.length;

  if (!hook) {
    add("error", "No hook", "hook", "The post doesn't open with a distinct first line — nothing to earn the click past \"see more\".", 2);
  } else if (len < 15) {
    add("warn", "Hook is very short", "hook", `"${hook}" — ${len} characters. Too thin to create curiosity before the fold.`, 2);
  } else if (len > HOOK_TRUNCATE) {
    add("warn", "Hook runs past the fold", "hook", `${len} characters before the first line break. LinkedIn truncates around ${HOOK_TRUNCATE} characters on desktop, less on mobile — tighten the opening line.`, 2);
  } else {
    add("pass", "Hook fits before the fold", "hook", `${len} characters — visible before "see more" cuts in.`, 2);
  }

  if (hook && CLICHE_OPENERS.some((re) => re.test(hook))) {
    add("error", "Opens with a cliché", "hook", "\"Excited to announce\"-style openers are among the most-skipped lines on LinkedIn. Lead with the claim, the number, or the tension instead.", 3);
  } else if (hook && HOOK_TRIGGER.test(hook)) {
    add("pass", "Hook has a trigger", "hook", "The opening line asks a question, states a number, or promises an explanation — a reason to keep reading.", 2);
  } else if (hook) {
    add("warn", "Hook has no obvious trigger", "hook", "No question, number, or curiosity gap in the first line. Readers scroll past a flat statement.", 2);
  }

  return checks;
}

function buildCtaChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const tail = text.trim().slice(-300);
  const matches = CTA_PATTERNS.filter((re) => re.test(tail));

  if (matches.length === 0) {
    add("error", "No call to action", "cta", "Nothing here asks for a response — no question, no \"comment/DM/follow\", nothing that invites a reply. Early replies are what the feed uses to decide who else sees this.", 3);
  } else if (matches.length === 1) {
    add("pass", "Clear call to action", "cta", "The close asks for one specific response — the easiest kind for a reader to act on.", 3);
  } else {
    add("warn", "Multiple calls to action", "cta", `${matches.length} different asks stacked at the end. One clear ask converts better than several competing ones.`, 2);
  }

  return checks;
}

function buildEngagementChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const trimmed = text.trim();
  const len = trimmed.length;
  const words = trimmed.split(/\s+/).filter(Boolean);

  if (len < 300) {
    add("warn", "Post is short", "length", `${len} characters. Short posts can work, but there's often not enough here to build the dwell time the feed rewards.`, 2);
  } else if (len > 3000) {
    add("warn", "Post is very long", "length", `${len} characters. Long-form can work — check the first two lines are doing the work of holding attention that far.`, 1);
  } else {
    add("pass", "Post length is in a solid range", "length", `${len} characters.`, 2);
  }

  const paragraphs = trimmed.split(/\n\s*\n/).filter(Boolean);
  const avgParaWords = words.length / Math.max(paragraphs.length, 1);
  if (paragraphs.length <= 1 && words.length > 40) {
    add("warn", "No line breaks", "formatting", "The post is one unbroken block. Short paragraphs with white space between them read far faster on mobile.", 2);
  } else if (avgParaWords > 60) {
    add("warn", "Paragraphs run long", "formatting", `About ${Math.round(avgParaWords)} words per paragraph on average. Roughly one idea per line or paragraph skims faster.`, 1);
  } else {
    add("pass", "Paragraphs are short and skimmable", "formatting", `${paragraphs.length} paragraph(s), about ${Math.round(avgParaWords)} words each.`, 2);
  }

  if (/https?:\/\/\S+/.test(trimmed)) {
    add("warn", "Contains an outbound link", "links", "LinkedIn's feed is well documented to suppress reach on posts with an outbound link in the body. Put the link in the first comment instead and say so in the post.", 2);
  } else {
    add("pass", "No outbound link in the body", "links", "Nothing pulling attention — or reach — off the platform.", 1);
  }

  const hashtags = trimmed.match(/#\w+/g) || [];
  if (hashtags.length === 0) {
    add("warn", "No hashtags", "hashtags", "A few relevant hashtags help the post surface outside your immediate network.", 1);
  } else if (hashtags.length > 8) {
    add("warn", "Too many hashtags", "hashtags", `${hashtags.length} hashtags. Past 5 or so it reads as spam rather than topic-tagging — 3–5 relevant tags is the commonly cited sweet spot.`, 1);
  } else {
    add("pass", "Hashtags present", "hashtags", `${hashtags.length} hashtag(s)${hashtags.length >= 3 && hashtags.length <= 5 ? " — in the commonly cited sweet spot." : "."}`, 1);
  }

  if (/[A-Z]{6,}/.test(trimmed) || /!{2,}/.test(trimmed)) {
    add("warn", "Reads as shouting", "tone", "Long runs of capitals or stacked exclamation marks read as spam to readers and to the feed.", 1);
  } else {
    add("pass", "Tone reads naturally", "tone", "No stacked punctuation or all-caps runs.", 1);
  }

  const emoji = trimmed.match(/\p{Extended_Pictographic}/gu) || [];
  if (emoji.length && emoji.length / Math.max(words.length, 1) > 0.12) {
    add("warn", "Heavy emoji use", "tone", `${emoji.length} emoji across ${words.length} words. A few as bullet markers read fine; this many can read as noisy.`, 1);
  }

  return checks;
}

// Folds in the Notion brief's separate "LinkedIn Post Analyzer" (score hook,
// readability, specificity, credibility, CTA, engagement potential) rather
// than shipping it as a second, near-duplicate tool — these two checks are
// the only real gap between that spec and what hook/cta/engagement already
// covered above.
function buildReadabilityChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });
  const sentences = text.split(/[.!?]+(?:\s|$)/).map((s) => s.trim()).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean).length;
  const avgWords = sentences.length ? words / sentences.length : words;

  if (avgWords > 22) {
    add("warn", "Sentences run long", "readability", `Averaging ${avgWords.toFixed(1)} words per sentence — long sentences read slower in a fast-scrolling feed.`, 2);
  } else {
    add("pass", "Sentences are a readable length", "readability", `Averaging ${avgWords.toFixed(1)} words per sentence.`, 2);
  }

  const passiveMatches = text.match(/\b(?:is|are|was|were|be|been|being)\s+\w+ed\b/gi) || [];
  const passiveRatio = sentences.length ? passiveMatches.length / sentences.length : 0;
  if (passiveRatio > 0.35) {
    add("warn", "Heavy on passive voice", "readability", "Active voice reads faster and more confident in a feed post.", 1);
  } else {
    add("pass", "Mostly active voice", "readability", "No heavy reliance on passive constructions.", 1);
  }

  return checks;
}

function buildSpecificityChecks(text) {
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });

  if (/\d/.test(text)) {
    add("pass", "Backs the claim with a number", "specificity", "A specific figure reads as more credible than a vague claim.", 2);
  } else {
    add("warn", "No concrete numbers", "specificity", "Nothing here is a specific figure, price, or count — every claim is qualitative.", 2);
  }

  if (CREDIBILITY_PATTERN.test(text)) {
    add("pass", "Cites evidence", "specificity", "The post points to data, a source, or a named result rather than asserting the claim alone.", 2);
  } else {
    add("warn", "No cited evidence", "specificity", 'No "according to", data reference, or named result found — a reader has to take the claim on faith.', 2);
  }

  return checks;
}

function buildTimingChecks(day, timeBucket) {
  if (!day && !timeBucket) return null;
  const checks = [];
  const add = (level, title, tag, detail, weight = 1) => checks.push({ level, title, tag, detail, weight });

  if (day) {
    const score = DAY_SCORE[day];
    const level = band(score);
    const title =
      level === "pass" ? `${DAY_LABEL[day]} is a strong day to post` : level === "warn" ? `${DAY_LABEL[day]} is a middling day to post` : `${DAY_LABEL[day]} tends to underperform`;
    add(level, title, "day", "Based on widely observed B2B posting patterns, not this account's own audience data — Tuesday through Thursday tends to outperform Friday and weekends.", 1);
  }
  if (timeBucket) {
    const score = TIME_SCORE[timeBucket];
    const level = band(score);
    const label = TIME_LABEL[timeBucket];
    const title = level === "pass" ? `${label} is a strong slot` : level === "warn" ? `${label} is a middling slot` : `${label} tends to underperform`;
    add(level, title, "time", "General best practice, not adjusted for your audience's specific timezone or habits — mid-morning local time tends to catch people at the start of their scroll.", 1);
  }

  return checks;
}

// ---------------------------------------------------------------------------
// Fetching a post's text from a public LinkedIn URL, for a post that's
// already live. LinkedIn server-renders the full post body into a plain
// <meta name="description"> tag on a public post's page — no login, no JS
// required to read it, verified against live posts at /posts/... and
// /feed/update/... URLs. A post that requires login to view (removed, or
// visible to connections only) renders without that tag, which is the signal
// used below to fail rather than guess.

const decodeEntities = (s) =>
  String(s || "")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

// Accepts the URL forms LinkedIn actually hands out for a post: /posts/...,
// /feed/update/..., and pulse/ articles. Anything else — a profile, a company
// page, a non-LinkedIn URL — is out of scope for "paste a post link".
function linkedInPostUrl(raw) {
  let parsed;
  try {
    parsed = new URL(String(raw || "").trim());
  } catch {
    return null;
  }
  if (!/^https?:$/.test(parsed.protocol)) return null;
  const host = parsed.hostname.toLowerCase();
  if (host !== "linkedin.com" && !host.endsWith(".linkedin.com")) return null;
  if (!/^\/(posts|feed\/update|pulse)\//.test(parsed.pathname)) return null;
  parsed.hash = "";
  return parsed.href;
}

async function fetchPostText(rawUrl) {
  const url = linkedInPostUrl(rawUrl);
  if (!url) {
    const error = new Error("Paste a public LinkedIn post link — linkedin.com/posts/... or /feed/update/...");
    error.status = 400;
    throw error;
  }

  let response;
  try {
    ({ response } = await safeFetch(
      url,
      { headers: { "User-Agent": LINKEDIN_UA, Accept: "text/html" } },
      LINKEDIN_TIMEOUT,
    ));
  } catch (fetchError) {
    const error = new Error(fetchErrorMessage(fetchError));
    error.status = 502;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(
      response.status === 404
        ? "Couldn't find that post. Check the link, or paste the text instead."
        : "LinkedIn didn't return that post. Paste the text instead.",
    );
    error.status = 502;
    throw error;
  }

  const buf = await readCapped(response, LINKEDIN_PAGE_BYTES);
  const html = buf.toString("utf8");
  const match = /<meta\s+name="description"\s+content="([^"]*)"/i.exec(html);
  const text = match ? decodeEntities(match[1]).trim() : "";

  // A login wall or a removed post still answers 200 with a generic page —
  // the tell is that the description is missing or too thin to be a post.
  if (text.length < 20) {
    const error = new Error(
      "Couldn't read that post automatically — it may require login to view. Paste the text instead.",
    );
    error.status = 502;
    throw error;
  }

  return text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text;
}

// ---------------------------------------------------------------------------

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
    const error = new Error("Paste the post you want scored.");
    error.status = 400;
    throw error;
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    const error = new Error(`That's ${trimmed.length} characters — keep it under ${MAX_TEXT_LENGTH}.`);
    error.status = 400;
    throw error;
  }

  const day = input && Object.prototype.hasOwnProperty.call(DAY_SCORE, input.day) ? input.day : null;
  const timeBucket = input && Object.prototype.hasOwnProperty.call(TIME_SCORE, input.timeBucket) ? input.timeBucket : null;

  const dimensions = [
    { key: "hook", label: "Hook quality", checks: buildHookChecks(trimmed) },
    { key: "cta", label: "CTA clarity", checks: buildCtaChecks(trimmed) },
    { key: "engagement", label: "Engagement potential", checks: buildEngagementChecks(trimmed) },
    { key: "readability", label: "Readability", checks: buildReadabilityChecks(trimmed) },
    { key: "specificity", label: "Specificity & credibility", checks: buildSpecificityChecks(trimmed) },
  ];
  const timingChecks = buildTimingChecks(day, timeBucket);
  if (timingChecks) dimensions.push({ key: "timing", label: "Timing", checks: timingChecks });

  const scored = dimensions.map((d) => ({ ...d, score: scoreFromChecks(d.checks), weight: DIMENSION_WEIGHT[d.key] }));
  const totalWeight = scored.reduce((sum, d) => sum + d.weight, 0);
  const overall = totalWeight ? Math.round(scored.reduce((sum, d) => sum + d.weight * d.score, 0) / totalWeight) : 0;

  return {
    length: trimmed.length,
    day,
    timeBucket,
    overall,
    dimensions: scored.map(({ weight, ...rest }) => rest),
    recommendations: buildRecommendations(scored),
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze, fetchPostText };
