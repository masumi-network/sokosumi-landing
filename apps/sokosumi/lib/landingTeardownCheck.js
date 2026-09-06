"use strict";

// Deterministic landing-page conversion teardown for
// /tools/landing-page-teardown. Given a public URL, fetches it (through
// lib/safeFetch.js) and audits four conversion signals from the actual
// markup — headline clarity, CTA presence, social proof, and trust signals —
// the same tolerant-regex approach as ogCheck.js and imageAudit.js. No
// headless browser, so "above the fold" is approximated by position in the
// raw HTML rather than rendered layout; that limit is stated in the FAQ.

const { fetchPage, collectTitle, collectHeadings, visibleText } = require("./htmlExtract");

const CTA_PATTERN = /\b(get started|sign up|start (?:your |a )?(?:free )?trial|book a demo|try (?:it )?free|buy now|download|contact us|request a demo|schedule a call|add to cart|subscribe|join (?:free|now|waitlist)|claim your)\b/i;
const TRUST_PROOF_PATTERN = /trusted by|as seen in|testimonial|case stud(?:y|ies)|\d[\d,]*\+?\s*(?:customers|companies|users|teams|reviews)/i;
const TRUST_BADGE_PATTERN = /money[- ]back|\bguarantee\b|secure checkout|\bssl\b|privacy policy|terms of service|no credit card/i;

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
  const url = String((input && input.url) || "").trim();
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

  const ctaChecks = [];
  const addC = (level, t, tag, detail, weight = 1) => ctaChecks.push({ level, title: t, tag, detail, weight });
  const ctaInHero = CTA_PATTERN.test(visibleText(heroHtml));
  const ctaAnywhere = CTA_PATTERN.test(bodyText);
  if (ctaInHero) {
    addC("pass", "CTA appears early", "cta", "A call-to-action phrase shows up near the top of the page's markup.", 4);
  } else if (ctaAnywhere) {
    addC("warn", "CTA exists but not near the top", "cta", "A call-to-action was found further down the page — a reader who doesn't scroll may never see it.", 4);
  } else {
    addC("error", "No call to action found", "cta", 'No CTA phrasing detected anywhere on the page (no "get started", "sign up", "book a demo" or similar).', 4);
  }

  const proofChecks = [];
  const addP = (level, t, tag, detail, weight = 1) => proofChecks.push({ level, title: t, tag, detail, weight });
  if (TRUST_PROOF_PATTERN.test(bodyText)) {
    addP("pass", "Has social proof", "proof", "Found testimonial, customer-count, or \"as seen in\"-style language.", 4);
  } else {
    addP("warn", "No social proof detected", "proof", "No testimonials, customer counts, or press mentions detected — these are a well-documented trust lever for a first-time visitor.", 4);
  }

  const trustChecks = [];
  const addT = (level, t, tag, detail, weight = 1) => trustChecks.push({ level, title: t, tag, detail, weight });
  if (TRUST_BADGE_PATTERN.test(bodyText)) {
    addT("pass", "Has trust signals", "trust", "Found a guarantee, security, or no-credit-card-style reassurance.", 3);
  } else {
    addT("warn", "No trust signals detected", "trust", 'No guarantee, security badge, or "no credit card required" language found — these lower the perceived risk of clicking the CTA.', 3);
  }
  const inputCount = (html.match(/<input\b[^>]*>/gi) || []).filter((tag) => !/type\s*=\s*["'](?:hidden|submit|button)["']/i.test(tag)).length;
  if (inputCount > 5) {
    addT("warn", "Long form", "trust", `${inputCount} visible form fields — every extra field is a documented drop-off point.`, 1);
  } else {
    addT("pass", "Form length is reasonable", "trust", inputCount ? `${inputCount} visible form field(s).` : "No long form on the page.", 1);
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
