"use strict";

// Deterministic landing-page conversion teardown for
// /tools/landing-page-teardown. Given a public URL, fetches it (through
// lib/safeFetch.js) and audits four conversion signals from the actual
// markup — headline clarity, CTA presence, social proof, and trust signals —
// the same tolerant-regex approach as ogCheck.js and imageAudit.js. No
// headless browser, so "above the fold" is approximated by position in the
// raw HTML rather than rendered layout; that limit is stated in the FAQ.

const { fetchPage, collectTitle, collectHeadings, visibleText , normalizeUrl } = require("./htmlExtract");

const CTA_PATTERN = /\b(get started|sign up|start (?:your |a )?(?:free )?trial|book a demo|try (?:it )?free|buy now|download|contact us|request a demo|schedule a call|add to cart|subscribe|join (?:free|now|waitlist)|claim your)\b/i;
const CTA_PATTERN_G = new RegExp(CTA_PATTERN.source, "gi");
const SOCIAL_PROOF_PATTERN = /trusted by|as seen in|case stud(?:y|ies)|\d[\d,]*\+?\s*(?:customers|companies|users|teams|members|businesses)\b/i;
const RATINGS_PATTERN = /★|⭐|\b\d(?:\.\d)?\s*\/\s*5\b|\b\d[\d,]*\+?\s*reviews?\b|\brated\s+\d/i;
const RISK_REVERSAL_PATTERN = /money[- ]back|\bguarantee(?:d)?\b|no credit card|secure checkout|cancel anytime|free forever|\b\d+[- ]day (?:free )?(?:trial|money)/i;
const LEGAL_PATTERN = /privacy policy|terms of service|terms of use|terms & conditions|terms and conditions/i;
const BUTTON_PATTERN = /<button[\s>]|class=["'][^"']*\b(?:btn|button|cta)\b/i;

const DIMENSION_WEIGHT = { headline: 25, cta: 25, proof: 25, trust: 25 };

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

async function analyze(input) {
  const url = normalizeUrl((input && input.url) || "");
  if (!url) {
    const error = new Error("Enter the landing page URL you want torn down.");
    error.status = 400;
    throw error;
  }

  const { html, finalUrl } = await fetchPage(url);
  const title = collectTitle(html);
  const headings = collectHeadings(html);
  const heroHtml = html.slice(0, Math.min(html.length, 6000));
  const bodyText = visibleText(html);

  const headlineChecks = [];
  const addH = (level, t, tag, detail, weight = 1) => headlineChecks.push({ level, title: t, tag, detail, weight });
  if (headings.counts.h1 === 1) {
    addH("pass", "Single, clear H1", "headline", `The H1 reads: "${headings.h1[0]}"`, 3);
  } else if (headings.counts.h1 === 0) {
    addH("error", "No H1 found", "headline", "No <h1> on the page — search engines and screen-reader users both use it to know what the page is about.", 3);
  } else {
    addH("warn", "Multiple H1s", "headline", `${headings.counts.h1} H1 tags found — one clear headline usually outperforms competing ones.`, 3);
  }
  if (headings.skip) {
    addH("warn", "Heading levels skip", "headline", `Jumps from ${headings.skip} with nothing between — a flatter outline reads more scannable.`, 1);
  } else {
    addH("pass", "Heading outline is sequential", "headline", "No skipped heading levels.", 1);
  }
  if (headings.counts.h1 >= 1) {
    const words = headings.h1[0].trim().split(/\s+/).filter(Boolean).length;
    if (words <= 12) addH("pass", "Headline is concise", "headline", `The H1 is ${words} words — short enough to grasp at a glance.`, 1);
    else addH("warn", "Headline is long", "headline", `The H1 runs ${words} words — tightening it under ~12 makes the value proposition land faster.`, 1);
  }
  if (headings.counts.h2 >= 1) {
    addH("pass", "Has a supporting subheadline", "headline", "At least one H2 backs up the main headline with detail.", 1);
  } else {
    addH("warn", "No subheadline", "headline", "No H2 subheadline found — a supporting line under the H1 helps explain the offer.", 1);
  }

  const ctaChecks = [];
  const addC = (level, t, tag, detail, weight = 1) => ctaChecks.push({ level, title: t, tag, detail, weight });
  const ctaInHero = CTA_PATTERN.test(visibleText(heroHtml));
  const ctaCount = (bodyText.match(CTA_PATTERN_G) || []).length;
  if (ctaInHero) {
    addC("pass", "CTA appears early", "cta", "A call-to-action phrase shows up near the top of the page's markup.", 4);
  } else if (ctaCount > 0) {
    addC("warn", "CTA exists but not near the top", "cta", "A call-to-action was found further down the page — a reader who doesn't scroll may never see it.", 4);
  } else {
    addC("error", "No call to action found", "cta", 'No CTA phrasing detected anywhere on the page (no "get started", "sign up", "book a demo" or similar).', 4);
  }
  if (BUTTON_PATTERN.test(html)) {
    addC("pass", "Has a clickable button", "cta", "The page uses real button or button-styled elements, not just plain text links — easier to spot and tap.", 2);
  } else {
    addC("warn", "No obvious button element", "cta", "No <button> or button-styled element found — a prominent button is easier to spot and click than a plain text link.", 2);
  }
  if (ctaCount >= 2) {
    addC("pass", "CTA is repeated", "cta", `The call-to-action appears ${ctaCount} times — repeating it catches readers at different scroll depths.`, 1);
  } else if (ctaCount === 1) {
    addC("warn", "CTA appears only once", "cta", "The call-to-action shows up once — repeating it further down the page catches readers who scroll past the hero.", 1);
  }

  const proofChecks = [];
  const addP = (level, t, tag, detail, weight = 1) => proofChecks.push({ level, title: t, tag, detail, weight });
  if (SOCIAL_PROOF_PATTERN.test(bodyText)) {
    addP("pass", "Has social proof", "proof", 'Found trusted-by, customer-count, case-study or "as seen in" language.', 3);
  } else {
    addP("warn", "No social proof detected", "proof", "No customer counts, case studies, or press mentions detected — a well-documented trust lever for a first-time visitor.", 3);
  }
  if (/<blockquote/i.test(html) || /\btestimonials?\b/i.test(bodyText)) {
    addP("pass", "Shows testimonials", "proof", "Found testimonial or quote markup — a specific customer voice is stronger than a generic claim.", 2);
  } else {
    addP("warn", "No testimonials found", "proof", "No testimonial or quote block detected — a named customer quote builds more trust than a logo strip alone.", 2);
  }
  if (RATINGS_PATTERN.test(bodyText) || /"aggregateRating"/i.test(html)) {
    addP("pass", "Shows ratings or review counts", "proof", "Found a star rating or review count — quantified proof a visitor can weigh.", 1);
  } else {
    addP("warn", "No ratings or review counts", "proof", 'Optional: a rating or review count (e.g. "4.8/5 from 300 reviews") adds quantified credibility.', 1);
  }

  const trustChecks = [];
  const addT = (level, t, tag, detail, weight = 1) => trustChecks.push({ level, title: t, tag, detail, weight });
  if (RISK_REVERSAL_PATTERN.test(bodyText)) {
    addT("pass", "Has risk-reversal language", "trust", "Found a guarantee, no-credit-card, or cancel-anytime style reassurance that lowers the risk of clicking.", 3);
  } else {
    addT("warn", "No risk-reversal language", "trust", 'No guarantee, "no credit card required", or cancel-anytime language — these lower the perceived risk of the CTA.', 3);
  }
  const inputCount = (html.match(/<input\b[^>]*>/gi) || []).filter((tag) => !/type\s*=\s*["'](?:hidden|submit|button)["']/i.test(tag)).length;
  if (inputCount > 5) {
    addT("warn", "Long form", "trust", `${inputCount} visible form fields — every extra field is a documented drop-off point.`, 1);
  } else {
    addT("pass", "Form length is reasonable", "trust", inputCount ? `${inputCount} visible form field(s).` : "No long form on the page.", 1);
  }
  if (/^https:/i.test(finalUrl)) {
    addT("pass", "Served over HTTPS", "trust", "The page loads over HTTPS — a baseline security signal visitors and browsers expect.", 1);
  } else {
    addT("error", "Not served over HTTPS", "trust", "The page did not load over HTTPS — a broken-trust signal that scares off conversions.", 1);
  }
  if (LEGAL_PATTERN.test(bodyText)) {
    addT("pass", "Links to privacy / terms", "trust", "Privacy policy or terms links are present — a small but expected legitimacy signal.", 1);
  } else {
    addT("warn", "No privacy / terms links", "trust", "No privacy policy or terms links found — their absence can read as less legitimate to a cautious buyer.", 1);
  }

  const dimensions = [
    { key: "headline", label: "Headline clarity", checks: headlineChecks },
    { key: "cta", label: "Call to action", checks: ctaChecks },
    { key: "proof", label: "Social proof", checks: proofChecks },
    { key: "trust", label: "Trust signals", checks: trustChecks },
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
