"use strict";

// Deterministic blog-to-carousel slide builder for /tools/blog-to-carousel.
// Given a blog post URL, this fetches the page (through lib/safeFetch.js)
// and turns its own heading structure into a slide-by-slide carousel
// outline: a hook slide from the title/description, one slide per H2
// section using that section's own opening sentence as the body, and a
// closing CTA slide. No LLM — every slide's text is lifted directly from
// the page, not generated.

const { fetchPage, collectTitle, collectMeta, visibleText, wordCount, extractH2Sections } = require("./htmlExtract");

const MAX_SECTION_SLIDES = 8;
const SLIDE_BODY_WORDS = 32;

function truncateWords(text, limit) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(" ") + "…";
}

function firstSentence(text) {
  const m = /^[\s\S]{1,300}?[.!?](?:\s|$)/.exec(text);
  return (m ? m[0] : text).trim();
}

async function analyze(input) {
  const url = String((input && input.url) || "").trim();
  if (!url) {
    const error = new Error("Enter the blog post URL you want turned into a carousel.");
    error.status = 400;
    throw error;
  }

  const { html, finalUrl } = await fetchPage(url);
  const title = collectTitle(html);
  const meta = collectMeta(html);
  const sections = extractH2Sections(html).filter((s) => s.heading && wordCount(s.body) >= 8);

  if (!sections.length) {
    const error = new Error("Couldn't find any H2 sections with body text on that page to build slides from.");
    error.status = 422;
    throw error;
  }

  const hookLine = meta.description || firstSentence(visibleText(html).slice(0, 600));
  const slides = [
    { index: 1, kind: "hook", heading: title || "Untitled post", body: truncateWords(hookLine, SLIDE_BODY_WORDS) },
  ];

  sections.slice(0, MAX_SECTION_SLIDES).forEach((s, i) => {
    slides.push({
      index: i + 2,
      kind: "section",
      heading: s.heading,
      body: truncateWords(firstSentence(s.body), SLIDE_BODY_WORDS),
    });
  });

  slides.push({
    index: slides.length + 1,
    kind: "cta",
    heading: "Want the full breakdown?",
    body: `Read the whole post: ${finalUrl}`,
  });

  return {
    url: finalUrl,
    title,
    slideCount: slides.length,
    slides,
    truncated: sections.length > MAX_SECTION_SLIDES,
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze };
