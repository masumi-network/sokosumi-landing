"use strict";

// Deterministic blog-to-social-week draft builder for
// /tools/blog-to-social-week. Given a blog post URL, this fetches the page
// (through lib/safeFetch.js) and pulls out its own stats, quotes and section
// headlines to build up to 7 structured post drafts — one per day — each
// pointing back at the source post. No LLM: every draft is built from text
// already on the page, not generated.

const { fetchPage, collectTitle, collectMeta, visibleText, extractH2Sections } = require("./htmlExtract");

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const STAT_PATTERN = /\b\d[\d,.]*%?[^.?!]{0,80}/g;
const QUOTE_PATTERN = /"([^"]{25,220})"/g;

function firstSentence(text) {
  const m = /^[\s\S]{1,260}?[.!?](?:\s|$)/.exec(text);
  return (m ? m[0] : text).trim();
}

function truncateWords(text, limit) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(" ") + "…";
}

async function analyze(input) {
  const url = String((input && input.url) || "").trim();
  if (!url) {
    const error = new Error("Enter the blog post URL you want turned into a week of posts.");
    error.status = 400;
    throw error;
  }

  const { html, finalUrl } = await fetchPage(url);
  const title = collectTitle(html);
  const meta = collectMeta(html);
  const text = visibleText(html);
  const sections = extractH2Sections(html).filter((s) => s.heading);
  const stats = [...new Set((text.match(STAT_PATTERN) || []).map((s) => s.trim()).filter((s) => s.length > 5 && s.length < 140))];
  const quotes = [...new Set([...text.matchAll(QUOTE_PATTERN)].map((m) => m[1].trim()))];

  const drafts = [];
  const push = (angle, body) => {
    if (!body) return;
    drafts.push({ day: DAYS[drafts.length], angle, body: truncateWords(body, 55) + `\n\n${finalUrl}` });
  };

  push("Announce the post", `${meta.description || firstSentence(text.slice(0, 500))}`);
  if (stats[0]) push("Lead with a stat", `${stats[0]}. Here's the full breakdown:`);
  sections.slice(0, 3).forEach((s) => push(`Section: ${s.heading}`, `${s.heading} — ${firstSentence(s.body)}`));
  if (quotes[0]) push("Lead with a quote", `"${quotes[0]}"`);
  push("Ask a question", `What's your take on ${title ? `"${title}"` : "this"}? Curious how other teams handle it.`);
  if (stats[1]) push("A second stat", `${stats[1]}. More in the post:`);

  const drafts7 = drafts.slice(0, 7);

  return {
    url: finalUrl,
    title,
    days: drafts7,
    dayCount: drafts7.length,
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze };
