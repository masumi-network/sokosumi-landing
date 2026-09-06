"use strict";

// Deterministic "AI search visibility readiness" proxy for
// /tools/ai-search-visibility. This has no access to any real AI search
// engine's index or answer log — it cannot tell you where you're actually
// mentioned versus a competitor, which is what "AI search visibility"
// usually promises. What it CAN check, honestly: whether the site's own
// robots.txt blocks the crawlers that feed these engines, whether an
// llms.txt exists, and whether the homepage gives an engine a clean brand
// signal to work with (title, Organization schema with sameAs, a sitemap).
// Stated as a readiness proxy, not a visibility measurement, in the FAQ.

const { safeFetch, fetchErrorMessage } = require("./safeFetch");
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
  const raw = String((input && input.url) || "").trim();
  if (!raw) {
    const error = new Error("Enter your website URL.");
    error.status = 400;
    throw error;
  }
  let origin, title, meta, jsonLd;
  try {
    const { html, finalUrl } = await fetchPage(raw);
    origin = new URL(finalUrl).origin;
    title = collectTitle(html);
    meta = collectMeta(html);
    jsonLd = collectJsonLd(html);
  } catch (error) {
    const err = new Error(fetchErrorMessage(error) || error.message || "Could not fetch that URL.");
    err.status = 422;
    throw err;
  }

  const [robotsTxt, llmsTxt, sitemapXml] = await Promise.all([
    fetchTextIfExists(`${origin}/robots.txt`),
    fetchTextIfExists(`${origin}/llms.txt`),
    fetchTextIfExists(`${origin}/sitemap.xml`),
  ]);
  const blocked = blockedBots(robotsTxt);

  const crawlerChecks = [];
  const addCrawl = (level, t, tag, detail, weight = 1) => crawlerChecks.push({ level, title: t, tag, detail, weight });
  if (!robotsTxt) {
    addCrawl("pass", "No robots.txt restrictions found", "crawlers", "No robots.txt was found, so nothing is blocking AI crawlers by default.", 4);
  } else if (blocked.length === 0) {
    addCrawl("pass", "No AI crawlers blocked", "crawlers", `Checked ${AI_BOTS.length} known AI-related crawler tokens in robots.txt — none are disallowed from the whole site.`, 4);
  } else {
    addCrawl("error", "Some AI crawlers are blocked", "crawlers", `robots.txt disallows: ${blocked.map((b) => `${b.token} (${b.label})`).join(", ")}. If that's intentional, ignore this — otherwise these engines can't crawl you at all.`, 4);
  }

  const disambigChecks = [];
  const addDis = (level, t, tag, detail, weight = 1) => disambigChecks.push({ level, title: t, tag, detail, weight });
  if (title && title.length >= 8) addDis("pass", "Has a descriptive title", "disambiguation", `"${title}"`, 2);
  else addDis("warn", "Title is missing or very short", "disambiguation", "A short or missing <title> gives an engine little to anchor a brand mention to.", 2);
  const orgType = jsonLd.some((block) => JSON.stringify(block).includes('"Organization"'));
  const hasSameAs = jsonLd.some((block) => JSON.stringify(block).includes('"sameAs"'));
  if (orgType && hasSameAs) addDis("pass", "Has Organization schema with sameAs links", "disambiguation", "This is one of the clearest signals an engine can use to disambiguate your brand from similarly-named ones.", 3);
  else if (orgType) addDis("warn", "Has Organization schema, no sameAs", "disambiguation", "Add sameAs links to your official social/Wikipedia/Crunchbase profiles to help disambiguate the brand.", 3);
  else addDis("warn", "No Organization schema found", "disambiguation", "No JSON-LD Organization type found — this is a well-documented way to give engines an unambiguous entity to attach mentions to.", 3);
  if (meta.description) addDis("pass", "Has a meta description", "disambiguation", "A clear one-line summary an engine can quote or paraphrase.", 1);
  else addDis("warn", "No meta description", "disambiguation", "No meta description found.", 1);

  const discoveryChecks = [];
  const addDisc = (level, t, tag, detail, weight = 1) => discoveryChecks.push({ level, title: t, tag, detail, weight });
  if (sitemapXml) addDisc("pass", "Has a sitemap.xml", "discovery", "Makes it easier for any crawler to discover your full set of pages.", 2);
  else addDisc("warn", "No sitemap.xml found", "discovery", "No sitemap.xml at the site root.", 2);
  if (llmsTxt) addDisc("pass", "Has an llms.txt", "discovery", "An explicit, structured index aimed at LLM-based crawlers and assistants.", 2);
  else addDisc("warn", "No llms.txt found", "discovery", "No llms.txt at the site root — an emerging convention some AI crawlers look for.", 2);

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
