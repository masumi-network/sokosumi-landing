"use strict";

// Deterministic "AI search visibility readiness" proxy for
// /tools/ai-search-visibility. This has no access to any real AI search
// engine's index or answer log — it cannot tell you where you're actually
// mentioned versus a competitor, which is what "AI search visibility"
// usually promises. What it CAN check, honestly: whether the site's own
// robots.txt blocks the crawlers that feed these engines (or blocks all
// crawlers, or noindexes the homepage), whether the homepage gives an engine a
// clean brand signal (title, H1, meta description, canonical, Organization and
// WebSite schema, sameAs, a logo), and whether the site is discoverable
// (sitemap.xml, a Sitemap: line in robots.txt, llms.txt / llms-full.txt,
// HTTPS). Stated as a readiness proxy, not a visibility measurement, in the FAQ.

const { safeFetch, fetchErrorMessage, normalizeUrl } = require("./safeFetch");
const { fetchPage, collectTitle, collectMeta, collectJsonLd } = require("./htmlExtract");

const AI_BOTS = [
  { token: "GPTBot", label: "OpenAI (ChatGPT search)" },
  { token: "ChatGPT-User", label: "ChatGPT browsing" },
  { token: "ClaudeBot", label: "Anthropic (Claude)" },
  { token: "anthropic-ai", label: "Anthropic (Claude, legacy token)" },
  { token: "PerplexityBot", label: "Perplexity" },
  { token: "Google-Extended", label: "Google (Gemini / AI Overviews)" },
  { token: "CCBot", label: "Common Crawl (feeds many LLM training sets)" },
  { token: "Bytespider", label: "ByteDance" },
  { token: "Amazonbot", label: "Amazon" },
];

const DIMENSION_WEIGHT = { crawlers: 40, disambiguation: 30, discovery: 30 };

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

function blockedBots(robotsTxt) {
  if (!robotsTxt) return [];
  const blocks = robotsTxt.split(/\n(?=user-agent:)/i);
  const blocked = [];
  AI_BOTS.forEach((bot) => {
    const block = blocks.find((b) => new RegExp(`user-agent:\\s*${bot.token}\\b`, "i").test(b));
    if (block && /disallow:\s*\/\s*$/im.test(block)) blocked.push(bot);
  });
  return blocked;
}

// Does robots.txt disallow the whole site for the wildcard agent — i.e. block
// every crawler, AI or not, from everything?
function blocksAllCrawlers(robotsTxt) {
  if (!robotsTxt) return false;
  const blocks = robotsTxt.split(/\n(?=user-agent:)/i);
  const wildcard = blocks.find((b) => /user-agent:\s*\*/i.test(b));
  return Boolean(wildcard && /disallow:\s*\/\s*$/im.test(wildcard));
}

// Cheap presence checks straight off the homepage HTML — no full parse needed.
function hasTag(html, re) {
  return re.test(html || "");
}
function jsonLdHas(jsonLd, needle) {
  return (jsonLd || []).some((block) => JSON.stringify(block).includes(needle));
}

async function fetchTextIfExists(url) {
  try {
    const { response } = await safeFetch(url, { headers: { Accept: "text/plain,*/*" } }, 6000);
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

async function analyze(input) {
  const raw = normalizeUrl((input && input.url) || "");
  if (!raw) {
    const error = new Error("Enter your website URL.");
    error.status = 400;
    throw error;
  }
  let origin, finalUrl, html, title, meta, jsonLd;
  try {
    ({ html, finalUrl } = await fetchPage(raw));
    origin = new URL(finalUrl).origin;
    title = collectTitle(html);
    meta = collectMeta(html);
    jsonLd = collectJsonLd(html);
  } catch (error) {
    const err = new Error(fetchErrorMessage(error) || error.message || "Could not fetch that URL.");
    err.status = 422;
    throw err;
  }

  const [robotsTxt, llmsTxt, llmsFullTxt, sitemapXml] = await Promise.all([
    fetchTextIfExists(`${origin}/robots.txt`),
    fetchTextIfExists(`${origin}/llms.txt`),
    fetchTextIfExists(`${origin}/llms-full.txt`),
    fetchTextIfExists(`${origin}/sitemap.xml`),
  ]);
  const blocked = blockedBots(robotsTxt);
  const isHttps = /^https:/i.test(finalUrl);
  const robotsMeta = String(meta.robots || "").toLowerCase();

  const crawlerChecks = [];
  const addCrawl = (level, t, tag, detail, weight = 1) => crawlerChecks.push({ level, title: t, tag, detail, weight });
  if (!robotsTxt) {
    addCrawl("pass", "No robots.txt restrictions found", "crawlers", "No robots.txt was found, so nothing is blocking AI crawlers by default.", 4);
  } else if (blocked.length === 0) {
    addCrawl("pass", "No AI crawlers blocked", "crawlers", `Checked ${AI_BOTS.length} known AI-related crawler tokens in robots.txt — none are disallowed from the whole site.`, 4);
  } else {
    addCrawl("error", "Some AI crawlers are blocked", "crawlers", `robots.txt disallows: ${blocked.map((b) => `${b.token} (${b.label})`).join(", ")}. If that's intentional, ignore this — otherwise these engines can't crawl you at all.`, 4);
  }
  if (blocksAllCrawlers(robotsTxt)) {
    addCrawl("error", "robots.txt blocks all crawlers", "crawlers", "The wildcard User-agent: * has Disallow: / — that blocks every crawler, including search and AI engines, from the whole site.", 3);
  } else {
    addCrawl("pass", "Not blocking crawlers site-wide", "crawlers", "The wildcard User-agent: * rule does not disallow the whole site.", 3);
  }
  if (/\bnoindex\b/.test(robotsMeta)) {
    addCrawl("error", "Homepage is set to noindex", "crawlers", 'The homepage has a robots meta tag with "noindex" — engines are told not to index it at all.', 2);
  } else {
    addCrawl("pass", "Homepage is indexable", "crawlers", "No noindex robots meta tag on the homepage, so engines are allowed to index it.", 2);
  }

  const disambigChecks = [];
  const addDis = (level, t, tag, detail, weight = 1) => disambigChecks.push({ level, title: t, tag, detail, weight });
  if (title && title.length >= 8) addDis("pass", "Has a descriptive title", "disambiguation", `"${title}"`, 2);
  else addDis("warn", "Title is missing or very short", "disambiguation", "A short or missing <title> gives an engine little to anchor a brand mention to.", 2);
  const orgType = jsonLdHas(jsonLd, '"Organization"');
  const hasSameAs = jsonLdHas(jsonLd, '"sameAs"');
  if (orgType && hasSameAs) addDis("pass", "Has Organization schema with sameAs links", "disambiguation", "This is one of the clearest signals an engine can use to disambiguate your brand from similarly-named ones.", 3);
  else if (orgType) addDis("warn", "Has Organization schema, no sameAs", "disambiguation", "Add sameAs links to your official social/Wikipedia/Crunchbase profiles to help disambiguate the brand.", 3);
  else addDis("warn", "No Organization schema found", "disambiguation", "No JSON-LD Organization type found — this is a well-documented way to give engines an unambiguous entity to attach mentions to.", 3);
  if (meta.description) addDis("pass", "Has a meta description", "disambiguation", "A clear one-line summary an engine can quote or paraphrase.", 1);
  else addDis("warn", "No meta description", "disambiguation", "No meta description found.", 1);
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1Count === 1) addDis("pass", "Has a single clear H1", "disambiguation", "One H1 tells an engine the page's main subject without ambiguity.", 1);
  else if (h1Count > 1) addDis("warn", "Multiple H1 headings", "disambiguation", `Found ${h1Count} H1s — a single H1 is a cleaner signal of the page's main subject.`, 1);
  else addDis("warn", "No H1 heading", "disambiguation", "No H1 on the homepage — an engine has no clear main heading to read the page's subject from.", 1);
  if (jsonLdHas(jsonLd, '"WebSite"')) addDis("pass", "Has WebSite schema", "disambiguation", "A JSON-LD WebSite entity helps engines model the site itself and can enable a sitelinks search box.", 1);
  else addDis("warn", "No WebSite schema", "disambiguation", "No JSON-LD WebSite type found — a small addition that helps engines model your site as an entity.", 1);
  const hasLogo = Boolean(meta["og:image"]) || jsonLdHas(jsonLd, '"logo"');
  if (hasLogo) addDis("pass", "Declares a brand image or logo", "disambiguation", "An og:image or a logo in Organization schema gives engines a visual to attach to the brand.", 1);
  else addDis("warn", "No brand image or logo declared", "disambiguation", "No og:image or schema logo found — add one so engines have a brand visual to show.", 1);
  const hasCanonical = hasTag(html, /<link\b[^>]*\brel=["']?canonical/i);
  if (hasCanonical) addDis("pass", "Declares a canonical URL", "disambiguation", "A canonical link tells engines which URL is authoritative, avoiding split or duplicate signals.", 1);
  else addDis("warn", "No canonical URL", "disambiguation", "No rel=canonical link on the homepage — add one so engines consolidate signals on a single authoritative URL.", 1);

  const discoveryChecks = [];
  const addDisc = (level, t, tag, detail, weight = 1) => discoveryChecks.push({ level, title: t, tag, detail, weight });
  if (sitemapXml) addDisc("pass", "Has a sitemap.xml", "discovery", "Makes it easier for any crawler to discover your full set of pages.", 2);
  else addDisc("warn", "No sitemap.xml found", "discovery", "No sitemap.xml at the site root.", 2);
  if (robotsTxt && /^\s*sitemap:\s*\S+/im.test(robotsTxt)) addDisc("pass", "Sitemap declared in robots.txt", "discovery", "robots.txt points crawlers to your sitemap with a Sitemap: line — the most reliable way for them to find it.", 1);
  else addDisc("warn", "No Sitemap: line in robots.txt", "discovery", "Add a Sitemap: line to robots.txt so crawlers can find your sitemap without guessing its location.", 1);
  if (llmsTxt) addDisc("pass", "Has an llms.txt", "discovery", "An explicit, structured index aimed at LLM-based crawlers and assistants.", 2);
  else addDisc("warn", "No llms.txt found", "discovery", "No llms.txt at the site root — an emerging convention some AI crawlers look for.", 2);
  if (llmsFullTxt) addDisc("pass", "Has an llms-full.txt", "discovery", "A full-content companion to llms.txt that gives assistants your material inline.", 1);
  else addDisc("warn", "No llms-full.txt found", "discovery", "Optional: a full-content llms-full.txt lets assistants read your key content without crawling every page.", 1);
  if (isHttps) addDisc("pass", "Served over HTTPS", "discovery", "The site resolves over HTTPS — expected by every modern crawler and a baseline trust signal.", 1);
  else addDisc("error", "Not served over HTTPS", "discovery", "The site did not resolve over HTTPS — a basic trust and security signal that engines expect.", 1);

  const dimensions = [
    { key: "crawlers", label: "AI crawler access", checks: crawlerChecks },
    { key: "disambiguation", label: "Brand disambiguation", checks: disambigChecks },
    { key: "discovery", label: "Discoverability", checks: discoveryChecks },
  ];
  const scored = dimensions.map((d) => ({ ...d, score: scoreFromChecks(d.checks), weight: DIMENSION_WEIGHT[d.key] }));
  const totalWeight = scored.reduce((sum, d) => sum + d.weight, 0);
  const overall = totalWeight ? Math.round(scored.reduce((sum, d) => sum + d.weight * d.score, 0) / totalWeight) : 0;

  return {
    url: origin,
    title,
    overall,
    dimensions: scored.map(({ weight, ...rest }) => rest),
    recommendations: buildRecommendations(scored),
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze, band };
