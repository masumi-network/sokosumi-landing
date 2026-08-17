// Every URL the Webflow sokosumi.com publishes today, mapped onto this site.
//
// The old sitemap lists 112 URLs and only 13 of them exist here by the same
// path, so without this table the cutover would 404 nearly the whole indexed
// footprint — including 23 agent pages that have a direct equivalent.
//
// Rules of thumb applied below:
//   * Redirect to the specific replacement page whenever there is one.
//   * When a product is genuinely gone, redirect to the relevant hub, never
//     to the home page — Google reads an irrelevant redirect as a soft 404
//     and drops the URL anyway.
//   * The German half of the old site (55+ URLs) now has a real counterpart:
//     /de is a first-class locale (see lib/i18n.js). server.js strips the
//     /de prefix BEFORE this map runs and re-prefixes any relative redirect
//     it returns, so an old /de/ai-agents/<x> lands on /de/ai-coworkers/<x>
//     — German stays German. This module therefore never sees a "de"
//     segment and must not special-case one.
//
// To refresh after the old site changes:
//   curl -s https://www.sokosumi.com/sitemap.xml | grep -o '<loc>[^<]*'

const APP_ORIGIN = process.env.SOKOSUMI_APP_URL || "https://app.sokosumi.com";

// Old /ai-agents/<slug> where the agent still exists but under a new slug.
const RENAMED = {
  "ask-the-crowd": "ask-the-crowd-survey",
  "ask-the-crowd---opinion": "ask-the-crowd-opinion",
  "basic-company-researcher": "company-researcher",
  "basic-news-research": "news-research",
  "deepfake-detector---knight": "deepfake-detector-knight",
  "meme-creator": "meme-creator-agent",
  "product-reality-check": "product-reality-check-bansumi",
  "attention-insight": "attentioninsight-analysis-agent",
  "movie-ideation-helper": "movie-production-agent",
  "statista-single-answer": "statista-key-insight",
};

// Delisted from the catalog entirely — verified against the live product API,
// not guessed. These go to the marketplace hub.
const DELISTED = new Set(["page-content-identifier-beta", "x-analyst-for-businesses"]);

// Single old paths with a single new home.
const EXACT = {
  "/agents": "/ai-coworkers",
  "/ai-solutions": "/product",
  "/agentic-solutions": "/product",
  "/sign-up": `${APP_ORIGIN}/sign-up`,
  "/thank-you": "/",
  "/webinar": "/",
  "/webinar-b": "/",
  "/webinar-live": "/",
  "/webinar-thank-you": "/",
  "/register-for-webinar": "/",
};

// Prefixes whose children all collapse onto one hub. The old agent categories
// and press-coverage entries have no per-item equivalent here yet.
const PREFIX = {
  category: "/ai-coworkers",
  "press-coverage": "/press",
  // Only one of the old posts was carried over, and it lives at a new slug,
  // so per-post redirects would land on a 404. Send readers to the index.
  blogs: "/blog",
};

// `known` lets the caller tell us which coworker slugs actually exist, so an
// /ai-agents/<slug> we have no record of falls back to the hub instead of
// redirecting into a 404. Optional: without it the slug is trusted.
function resolve(segments, known) {
  if (!segments.length) return null;

  const full = "/" + segments.join("/");
  if (EXACT[full]) return EXACT[full];

  const hub = PREFIX[segments[0]];
  if (hub && segments.length >= 1) return hub;

  if (segments[0] === "ai-agents") {
    if (segments.length === 1) return "/ai-coworkers";
    const old = segments[1];
    if (DELISTED.has(old)) return "/ai-coworkers";
    const slug = RENAMED[old] || old;
    if (known && !known.has(slug)) return "/ai-coworkers";
    return `/ai-coworkers/${slug}`;
  }

  return null;
}

module.exports = { resolve, RENAMED, DELISTED, EXACT, PREFIX };
