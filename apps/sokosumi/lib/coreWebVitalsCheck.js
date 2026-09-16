"use strict";

// Deterministic Core Web Vitals proxy explainer for /tools/core-web-vitals.
// This has no headless browser and no access to real field data (CrUX) or
// lab data (Lighthouse) — both would need infrastructure this free tool
// doesn't have. Instead it reads structural signals from the fetched HTML
// document itself that are well-documented drivers of LCP, CLS and INP —
// document weight, render-blocking CSS, resource hints, a lazy hero image,
// image/iframe dimensions, viewport, font-display, script count, parser-
// blocking and third-party scripts — and translates them into plain English.
// Stated as a proxy, not a measurement, the same honesty pattern seoExtract.js
// uses for its own ai_readiness_score.

const { fetchPage, collectTitle , normalizeUrl } = require("./htmlExtract");

const DIMENSION_WEIGHT = { lcp: 34, cls: 33, inp: 33 };

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

function countRenderBlockingScripts(html) {
  const headMatch = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html);
  const head = headMatch ? headMatch[1] : html.slice(0, 4000);
  const scripts = head.match(/<script\b[^>]*\bsrc\s*=\s*["'][^"']+["'][^>]*>/gi) || [];
  return scripts.filter((tag) => !/\basync\b|\bdefer\b|type\s*=\s*["']module["']/i.test(tag)).length;
}

function countStylesheets(html) {
  const links = html.match(/<link\b[^>]*\brel\s*=\s*["']stylesheet["'][^>]*>/gi) || [];
  return links.filter((tag) => !/media\s*=\s*["']print["']/i.test(tag)).length;
}

function imageDimensionStats(html) {
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  const missing = imgs.filter((tag) => !/\bwidth\s*=/.test(tag) || !/\bheight\s*=/.test(tag));
  return { total: imgs.length, missing: missing.length };
}

function hasResourceHints(html) {
  return /<link\b[^>]*\brel\s*=\s*["'](?:preconnect|preload|dns-prefetch)["']/i.test(html);
}

// A lazy-loaded first image is a common LCP mistake — if it's the hero, the
// browser holds off fetching the largest paint.
function firstImageLazy(html) {
  const m = /<img\b[^>]*>/i.exec(html);
  return m ? /\bloading\s*=\s*["']lazy["']/i.test(m[0]) : false;
}

function iframeStats(html) {
  const frames = html.match(/<iframe\b[^>]*>/gi) || [];
  const missing = frames.filter((tag) => !/\bwidth\s*=/.test(tag) || !/\bheight\s*=/.test(tag));
  return { total: frames.length, missing: missing.length };
}

// External <script src> tags: how many, how many are cross-origin, and how many
// use async/defer/module (so the rest run render/parse-blocking).
function scriptSrcInfo(html, origin) {
  const host = (() => {
    try {
      return new URL(origin).hostname;
    } catch (_e) {
      return "";
    }
  })();
  const tags = html.match(/<script\b[^>]*\bsrc\s*=\s*["'][^"']+["'][^>]*>/gi) || [];
  let thirdParty = 0;
  let deferred = 0;
  tags.forEach((tag) => {
    const m = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(tag);
    try {
      const u = new URL(m[1], origin);
      if (u.hostname && host && u.hostname !== host) thirdParty += 1;
    } catch (_e) {
      /* skip unparseable src */
    }
    if (/\basync\b|\bdefer\b|type\s*=\s*["']module["']/i.test(tag)) deferred += 1;
  });
  return { external: tags.length, thirdParty, deferred };
}

async function analyze(input) {
  const url = normalizeUrl((input && input.url) || "");
  if (!url) {
    const error = new Error("Enter the URL you want explained.");
    error.status = 400;
    throw error;
  }

  const { html, finalUrl, truncated } = await fetchPage(url);
  const title = collectTitle(html);
  const weightKb = Math.round(Buffer.byteLength(html, "utf-8") / 1024);
  const stylesheetCount = countStylesheets(html);
  const renderBlockingScripts = countRenderBlockingScripts(html);
  const totalScripts = (html.match(/<script\b/gi) || []).length;
  const images = imageDimensionStats(html);
  const hasViewport = /<meta\b[^>]*name\s*=\s*["']viewport["']/i.test(html);

  const lcpChecks = [];
  const addLcp = (level, t, tag, detail, weight = 1) => lcpChecks.push({ level, title: t, tag, detail, weight });
  if (weightKb < 100) addLcp("pass", "HTML document is lightweight", "lcp", `${weightKb} KB of markup — this is the document only, not images/scripts/fonts.`, 2);
  else if (weightKb < 300) addLcp("warn", "HTML document is moderately heavy", "lcp", `${weightKb} KB of markup — worth checking what's inlined (styles, scripts, SVGs).`, 2);
  else addLcp("error", "HTML document is heavy", "lcp", `${weightKb} KB of markup, before a single image or script loads — this alone delays first paint.`, 2);
  if (stylesheetCount <= 2) addLcp("pass", "Few render-blocking stylesheets", "lcp", `${stylesheetCount} blocking <link rel="stylesheet"> tag(s).`, 2);
  else addLcp("warn", "Several render-blocking stylesheets", "lcp", `${stylesheetCount} blocking stylesheet(s) — each one delays first paint until it downloads.`, 2);
  if (hasResourceHints(html)) addLcp("pass", "Uses resource hints", "lcp", "Found preconnect/preload/dns-prefetch hints — these warm up connections to the origins your key assets load from.", 1);
  else addLcp("warn", "No resource hints", "lcp", "No preconnect, preload, or dns-prefetch hints — adding them for your font and CDN origins can shave time off the largest paint.", 1);
  if (images.total > 0 && firstImageLazy(html)) addLcp("warn", "First image is lazy-loaded", "lcp", 'The first <img> has loading="lazy" — if that\'s your hero image, lazy-loading delays the largest paint. Only lazy-load below-the-fold images.', 1);
  else addLcp("pass", "Hero image not lazy-loaded", "lcp", "The first image isn't marked loading=lazy, so the browser can start fetching it right away.", 1);

  const clsChecks = [];
  const addCls = (level, t, tag, detail, weight = 1) => clsChecks.push({ level, title: t, tag, detail, weight });
  if (images.total === 0) {
    addCls("pass", "No images to check", "cls", "No <img> tags found on the page.", 2);
  } else if (images.missing === 0) {
    addCls("pass", "Every image has explicit dimensions", "cls", `All ${images.total} image(s) declare width and height — the browser can reserve space before they load.`, 2);
  } else {
    const ratio = images.missing / images.total;
    addCls(ratio > 0.3 ? "error" : "warn", "Images missing explicit dimensions", "cls", `${images.missing} of ${images.total} image(s) have no width/height — each one can shift the layout as it loads in.`, 2);
  }
  if (hasViewport) addCls("pass", "Has a viewport meta tag", "cls", "Mobile browsers won't apply a desktop-width layout and then rescale.", 1);
  else addCls("error", "No viewport meta tag", "cls", "Without one, mobile browsers render a desktop-width layout and zoom out — a common source of layout jank.", 1);
  if (/font-display\s*:/i.test(html)) addCls("pass", "Declares font-display", "cls", "A font-display value is set — the browser can show text right away and swap the web font in without a reflow.", 1);
  else addCls("warn", "No font-display found", "cls", "No font-display declaration detected — a custom font can flash and shift the layout when it finishes loading. font-display: swap avoids the reflow.", 1);
  const frames = iframeStats(html);
  if (frames.total === 0) addCls("pass", "No iframes to check", "cls", "No <iframe> embeds that could shift the layout as they load.", 1);
  else if (frames.missing === 0) addCls("pass", "Iframes have explicit dimensions", "cls", `All ${frames.total} iframe(s) declare width and height.`, 1);
  else addCls("warn", "Iframes missing dimensions", "cls", `${frames.missing} of ${frames.total} iframe(s) have no width/height — embeds (video, maps, ads) shift the layout as they load unless space is reserved.`, 1);

  const inpChecks = [];
  const addInp = (level, t, tag, detail, weight = 1) => inpChecks.push({ level, title: t, tag, detail, weight });
  if (totalScripts <= 10) addInp("pass", "Modest script count", "inp", `${totalScripts} <script> tag(s) on the page.`, 2);
  else if (totalScripts <= 20) addInp("warn", "Script-heavy page", "inp", `${totalScripts} <script> tags — more parsing and execution competing for the main thread.`, 2);
  else addInp("error", "Very script-heavy page", "inp", `${totalScripts} <script> tags — a lot of JavaScript competing for the main thread before the page responds to input.`, 2);
  if (renderBlockingScripts === 0) addInp("pass", "No parser-blocking scripts in <head>", "inp", "Scripts in the head are async, deferred, or modules.", 2);
  else addInp(renderBlockingScripts > 3 ? "error" : "warn", "Parser-blocking scripts in <head>", "inp", `${renderBlockingScripts} script(s) in <head> without async/defer — these block HTML parsing and delay interactivity.`, 2);
  const scriptInfo = scriptSrcInfo(html, new URL(finalUrl).origin);
  if (scriptInfo.thirdParty <= 4) addInp("pass", "Few third-party scripts", "inp", `${scriptInfo.thirdParty} script(s) load from a third-party origin.`, 1);
  else if (scriptInfo.thirdParty <= 8) addInp("warn", "Several third-party scripts", "inp", `${scriptInfo.thirdParty} third-party scripts — analytics, chat and ad tags each run on the main thread and can delay the response to input.`, 1);
  else addInp("error", "Many third-party scripts", "inp", `${scriptInfo.thirdParty} third-party scripts — a heavy load of external tags competing for the main thread is a common INP culprit.`, 1);
  if (scriptInfo.external === 0) {
    addInp("pass", "No external scripts", "inp", "No external <script src> tags to block the main thread.", 1);
  } else {
    const blocking = scriptInfo.external - scriptInfo.deferred;
    if (blocking === 0) addInp("pass", "External scripts are async or deferred", "inp", `All ${scriptInfo.external} external script(s) use async, defer, or type=module.`, 1);
    else addInp(blocking > 3 ? "error" : "warn", "Some external scripts block", "inp", `${blocking} of ${scriptInfo.external} external script(s) load without async/defer — they run before the page can respond to input.`, 1);
  }

  const dimensions = [
    { key: "lcp", label: "Largest Contentful Paint (proxy)", checks: lcpChecks },
    { key: "cls", label: "Cumulative Layout Shift (proxy)", checks: clsChecks },
    { key: "inp", label: "Interaction to Next Paint (proxy)", checks: inpChecks },
  ];
  const scored = dimensions.map((d) => ({ ...d, score: scoreFromChecks(d.checks), weight: DIMENSION_WEIGHT[d.key] }));
  const totalWeight = scored.reduce((sum, d) => sum + d.weight, 0);
  const overall = totalWeight ? Math.round(scored.reduce((sum, d) => sum + d.weight * d.score, 0) / totalWeight) : 0;

  return {
    url: finalUrl,
    title,
    truncated,
    overall,
    dimensions: scored.map(({ weight, ...rest }) => rest),
    recommendations: buildRecommendations(scored),
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze, band };
