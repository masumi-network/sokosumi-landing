"use strict";

// Site-wide image audit for /tools/image-audit.
//
// Crawls a site's pages — via its sitemap, or a shallow same-origin link
// crawl when there isn't one — and reads every <img> and <picture> each page
// actually serves. Reports which images have no alt text and which are still
// shipped as JPEG/PNG/GIF instead of AVIF or WebP, with the page(s) each one
// was found on. No headless browser, no LLM: this reads the HTML the server
// sends, the same regex-parsed approach as lib/seoExtract.js and
// lib/llmsCheck.js. Client-side-rendered images that only appear after JS
// runs will not be counted.

const { publicUrl, safeFetch, readCapped, fetchErrorMessage } = require("./safeFetch");

const UA =
  "Mozilla/5.0 (compatible; SokosumiImageAudit/1.0; +https://sokosumi.com/tools/image-audit)";

// Image optimizers (Next.js/Vercel's included) content-negotiate on Accept:
// no avif/webp in the request and they fall back to serving a legacy format,
// which is the *opposite* of what a real visitor's browser receives. Without
// this, every proxied image reads as legacy regardless of what it actually is.
const IMAGE_ACCEPT = "image/avif,image/webp,image/apng,image/*,*/*;q=0.8";

// Crawling is the most expensive thing any tool on this site does — many
// fetches instead of one — so every knob here is deliberately conservative.
const PAGE_LIMIT = 20;
const PAGE_CONCURRENCY = 4;
const PAGE_TIMEOUT = 8000;
const PAGE_BYTES = 2 * 1024 * 1024;
const CRAWL_BUDGET_MS = 40000;

// Next.js/Vercel's image optimizer (`/_vercel/image?url=...`) is a common
// enough pattern — this site included — that a low cap here left most of a
// typical site's images unclassified. HEAD requests are cheap, so this can
// afford to be generous.
const IMAGE_PROBE_LIMIT = 60;
const IMAGE_PROBE_CONCURRENCY = 6;
const IMAGE_PROBE_TIMEOUT = 6000;

const SITEMAP_BYTES = 3 * 1024 * 1024;
const SITEMAP_TIMEOUT = 8000;
const SITEMAP_CHILD_LIMIT = 3;
const SITEMAP_CANDIDATE_CAP = PAGE_LIMIT * 6;

// ---------------------------------------------------------------------------
// Small HTML helpers — a local copy rather than a shared import, matching
// how lib/seoExtract.js and lib/llmsCheck.js each keep their own.

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

const attrOf = (tag, name) => {
  const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i").exec(tag);
  return m ? decodeEntities(m[2] ?? m[3] ?? m[4] ?? "") : "";
};

const firstSrcsetUrl = (srcset) => String(srcset || "").split(",")[0].trim().split(/\s+/)[0] || "";

// ---------------------------------------------------------------------------
// Format detection — from a URL's extension, or from a Content-Type header
// for the CDN-served images that carry neither.

function formatFromUrl(url) {
  const path = url.split(/[?#]/)[0].toLowerCase();
  if (/\.avif$/.test(path)) return "avif";
  if (/\.webp$/.test(path)) return "webp";
  if (/\.svg$/.test(path)) return "svg";
  if (/\.(jpe?g)$/.test(path)) return "jpeg";
  if (/\.png$/.test(path)) return "png";
  if (/\.gif$/.test(path)) return "gif";
  return "unknown";
}

function formatFromType(type) {
  const t = String(type || "").toLowerCase();
  if (t.includes("avif")) return "avif";
  if (t.includes("webp")) return "webp";
  if (t.includes("svg")) return "svg";
  if (t.includes("jpeg") || t.includes("jpg")) return "jpeg";
  if (t.includes("png")) return "png";
  if (t.includes("gif")) return "gif";
  return "unknown";
}

// A Next/Vercel image-optimizer URL (/_vercel/image?url=<original>&w=...)
// has no extension of its own, but the original it was generated from —
// often a local asset that does — sits right there in the query string.
function vercelProxyOriginal(url) {
  try {
    const u = new URL(url);
    if (u.pathname !== "/_vercel/image") return null;
    return u.searchParams.get("url") || null;
  } catch {
    return null;
  }
}

// formatFromUrl, falling back to a proxy's original URL when the outer one
// carries no extension of its own.
function formatFromUrlHint(url) {
  const direct = formatFromUrl(url);
  if (direct !== "unknown") return direct;
  const original = vercelProxyOriginal(url);
  return original ? formatFromUrl(original) : "unknown";
}

// avif and webp beat everything; a <picture> offering either is credited
// with the best format it offers, even if the <img> fallback is a jpeg.
const FORMAT_RANK = { avif: 0, webp: 1, svg: 2, jpeg: 3, png: 3, gif: 3, unknown: 4 };
function bestFormat(formats) {
  let best = "unknown";
  for (const f of formats) if (FORMAT_RANK[f] < FORMAT_RANK[best]) best = f;
  return best;
}
const isLegacyRaster = (format) => format === "jpeg" || format === "png" || format === "gif";

function altStatusOf(tag) {
  if (!/\balt\s*=/i.test(tag)) return "absent";
  return attrOf(tag, "alt").trim() ? "present" : "empty";
}

// Explicit width+height (or an equivalent aspect-ratio hint some frameworks
// emit) is what stops the browser reserving zero space for an image before
// it loads — the CSS a page ships alongside isn't visible to this crawl, so
// this can only see the HTML-level signal, not the computed layout.
function hasDimensions(tag) {
  return /\bwidth\s*=/i.test(tag) && /\bheight\s*=/i.test(tag);
}

function loadingOf(tag) {
  return attrOf(tag, "loading").trim().toLowerCase();
}

function resolveSrc(tag, baseUrl) {
  const raw =
    attrOf(tag, "src") ||
    attrOf(tag, "data-src") ||
    attrOf(tag, "data-lazy-src") ||
    attrOf(tag, "data-original") ||
    firstSrcsetUrl(attrOf(tag, "srcset")) ||
    firstSrcsetUrl(attrOf(tag, "data-srcset"));
  if (!raw || /^data:/i.test(raw)) return null;
  try {
    return new URL(raw, baseUrl).href;
  } catch {
    return null;
  }
}

// Every image on a page, whether a standalone <img> or one wrapped in a
// <picture> with format-negotiating <source> elements. <picture> blocks are
// consumed first and blanked out so the plain <img> pass below does not
// double-count the fallback image inside them.
function extractImages(html, pageUrl) {
  const found = [];

  const withoutPictures = html.replace(/<picture\b[^>]*>([\s\S]*?)<\/picture>/gi, (_block, inner) => {
    const formats = new Set();
    const sourceRe = /<source\b[^>]*>/gi;
    let sm;
    while ((sm = sourceRe.exec(inner))) {
      const tag = sm[0];
      const type = attrOf(tag, "type");
      if (type) formats.add(formatFromType(type));
      const srcUrl = firstSrcsetUrl(attrOf(tag, "srcset")) || attrOf(tag, "src");
      if (srcUrl && !/^data:/i.test(srcUrl)) formats.add(formatFromUrlHint(srcUrl));
    }
    const imgMatch = /<img\b[^>]*>/i.exec(inner);
    if (imgMatch) {
      const tag = imgMatch[0];
      const url = resolveSrc(tag, pageUrl);
      if (url) {
        formats.add(formatFromUrlHint(url));
        found.push({
          url,
          formats: [...formats],
          altStatus: altStatusOf(tag),
          hasDimensions: hasDimensions(tag),
          loading: loadingOf(tag),
        });
      }
    }
    return "";
  });

  const imgRe = /<img\b[^>]*>/gi;
  let m;
  while ((m = imgRe.exec(withoutPictures))) {
    const tag = m[0];
    const url = resolveSrc(tag, pageUrl);
    if (!url) continue;
    found.push({
      url,
      formats: [formatFromUrlHint(url)],
      altStatus: altStatusOf(tag),
      hasDimensions: hasDimensions(tag),
      loading: loadingOf(tag),
    });
  }

  return found;
}

// ---------------------------------------------------------------------------
// Page discovery — the sitemap first, since it is the site telling us what
// it considers real pages; a shallow same-origin link crawl from the
// homepage when there isn't one.

async function fetchRobotsSitemaps(origin) {
  try {
    const { response, url } = await safeFetch(`${origin}/robots.txt`, { headers: { "User-Agent": UA } }, 6000);
    if (!response.ok) return [];
    const buf = await readCapped(response, 256 * 1024);
    const text = buf.toString("utf8");
    const sitemaps = [];
    for (const line of text.split(/\r?\n/)) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim().toLowerCase();
      const value = line.slice(idx + 1).trim();
      if (key !== "sitemap" || !value) continue;
      try {
        sitemaps.push(new URL(value, url).href);
      } catch {
        /* skip a malformed line */
      }
    }
    return [...new Set(sitemaps)];
  } catch {
    return [];
  }
}

async function fetchSitemapLocs(sitemapUrl) {
  try {
    const { response } = await safeFetch(
      sitemapUrl,
      { headers: { "User-Agent": UA, Accept: "application/xml, text/xml, */*" } },
      SITEMAP_TIMEOUT,
    );
    if (!response.ok) return { locs: [], isIndex: false };
    const buf = await readCapped(response, SITEMAP_BYTES);
    const text = buf.toString("utf8");
    const isIndex = /<sitemapindex\b/i.test(text);
    const locs = [...text.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
    return { locs, isIndex };
  } catch {
    return { locs: [], isIndex: false };
  }
}

async function discoverPages(origin) {
  const robotsSitemaps = await fetchRobotsSitemaps(origin);
  const rootSitemaps = robotsSitemaps.length ? robotsSitemaps : [`${origin}/sitemap.xml`];

  const seen = new Set();
  const pages = [];
  let sitemapFound = false;

  outer: for (const sm of rootSitemaps.slice(0, SITEMAP_CHILD_LIMIT)) {
    const { locs, isIndex } = await fetchSitemapLocs(sm);
    if (!locs.length) continue;
    sitemapFound = true;
    const childSitemaps = isIndex ? locs.slice(0, SITEMAP_CHILD_LIMIT) : [null];
    for (const child of childSitemaps) {
      const entries = child ? (await fetchSitemapLocs(child)).locs : locs;
      for (const u of entries) {
        const safe = publicUrl(u);
        if (safe && !seen.has(safe)) {
          seen.add(safe);
          pages.push(safe);
        }
        if (pages.length >= SITEMAP_CANDIDATE_CAP) break outer;
      }
    }
  }

  let homepageError = null;
  if (!pages.length) {
    const homepage = `${origin}/`;
    try {
      const { response, url } = await safeFetch(homepage, { headers: { "User-Agent": UA, Accept: "text/html" } }, PAGE_TIMEOUT);
      const buf = await readCapped(response, PAGE_BYTES);
      const html = buf.toString("utf8");
      seen.add(url);
      pages.push(url);
      const linkRe = /<a\b[^>]*\bhref\s*=\s*("([^"]*)"|'([^']*)')/gi;
      let lm;
      while ((lm = linkRe.exec(html)) && pages.length < PAGE_LIMIT * 3) {
        const href = lm[2] ?? lm[3] ?? "";
        if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) continue;
        let abs;
        try {
          abs = new URL(href, url).href;
        } catch {
          continue;
        }
        const safe = publicUrl(abs);
        if (!safe || new URL(safe).origin !== origin) continue;
        if (!seen.has(safe)) {
          seen.add(safe);
          pages.push(safe);
        }
      }
    } catch (error) {
      homepageError = error;
    }
  }

  // Homepage first; after that, shallower paths first — a decent proxy for
  // the pages a visitor (and this audit) actually cares about, since a
  // sitemap's own ordering carries no such guarantee.
  const homepage = `${origin}/`;
  const rest = pages
    .filter((p) => p !== homepage)
    .sort((a, b) => new URL(a).pathname.split("/").filter(Boolean).length - new URL(b).pathname.split("/").filter(Boolean).length);
  const ordered = [homepage, ...rest];

  return { pages: ordered.slice(0, PAGE_LIMIT), discovered: pages.length, sitemapFound, homepageError };
}

// ---------------------------------------------------------------------------
// Crawling and image aggregation

async function fetchPage(url) {
  const { response, url: finalUrl } = await safeFetch(
    url,
    { headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" } },
    PAGE_TIMEOUT,
  );
  if (!response.ok) return null;
  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  if (contentType && !/text\/html|application\/xhtml/.test(contentType)) return null;
  const buf = await readCapped(response, PAGE_BYTES);
  return { url: finalUrl, html: buf.toString("utf8") };
}

// A page that times out or 404s just does not contribute images; it is not
// worth failing the whole audit over one bad URL in a sitemap.
async function crawlPages(pages) {
  const results = [];
  const deadline = Date.now() + CRAWL_BUDGET_MS;
  for (let i = 0; i < pages.length; i += PAGE_CONCURRENCY) {
    if (Date.now() > deadline) break;
    const batch = pages.slice(i, i + PAGE_CONCURRENCY);
    const done = await Promise.all(batch.map((u) => fetchPage(u).catch(() => null)));
    for (const d of done) if (d) results.push(d);
  }
  return results;
}

function aggregate(pageResults) {
  const map = new Map();
  for (const page of pageResults) {
    const seenOnPage = new Set();
    let index = 0;
    for (const img of extractImages(page.html, page.url)) {
      const isFirstOnPage = index === 0;
      index += 1;
      if (seenOnPage.has(img.url)) continue;
      seenOnPage.add(img.url);
      let entry = map.get(img.url);
      if (!entry) {
        entry = { url: img.url, formats: new Set(), pages: [], bytes: null };
        map.set(img.url, entry);
      }
      img.formats.forEach((f) => entry.formats.add(f));
      entry.pages.push({
        page: page.url,
        alt: img.altStatus,
        hasDimensions: img.hasDimensions,
        // A hero/LCP image being lazy is the actual anti-pattern — flagging
        // it not-lazy would tell a site to do the opposite of best practice,
        // so the first image encountered on a page is exempt from this check.
        lazyIssue: !isFirstOnPage && img.loading !== "lazy",
      });
    }
  }
  return map;
}

async function probeImageFormat(url) {
  try {
    let { response } = await safeFetch(
      url,
      { method: "HEAD", headers: { "User-Agent": UA, Accept: IMAGE_ACCEPT } },
      IMAGE_PROBE_TIMEOUT,
    );
    if (response.status === 405 || response.status === 501 || response.status === 403) {
      try {
        await response.body?.cancel();
      } catch {
        /* nothing buffered */
      }
      ({ response } = await safeFetch(
        url,
        { method: "GET", headers: { "User-Agent": UA, Accept: IMAGE_ACCEPT, Range: "bytes=0-1023" } },
        IMAGE_PROBE_TIMEOUT,
      ));
      try {
        await response.body?.cancel();
      } catch {
        /* nothing buffered */
      }
    }
    return formatFromType(response.headers.get("content-type"));
  } catch {
    return "unknown";
  }
}

// The key a probe result should be filed under: for a proxied image, that's
// the original it was generated from, since a dozen width variants of the
// same source are the same underlying format and not worth a dozen probes.
function probeKeyOf(url) {
  return vercelProxyOriginal(url) || url;
}

// Byte size lives behind its own probe, separate from format classification:
// a proxied image's width variants share one *format* (grouping by original
// is correct there) but not one *size* — a 2560px and a 320px export of the
// same source differ by 10x, so size has to be read per exact URL.
const SIZE_PROBE_LIMIT = 40;
const SIZE_PROBE_CONCURRENCY = 6;
const SIZE_PROBE_TIMEOUT = 6000;

// WebP savings vs. each legacy codec, at equivalent visual quality. These are
// industry-typical figures (Google's own WebP studies), not a per-image
// measurement — nothing here actually re-encodes anything.
const FORMAT_SAVINGS_FACTOR = { jpeg: 0.3, png: 0.45, gif: 0.4 };

function sizeFromHeaders(response) {
  const range = response.headers.get("content-range");
  if (range) {
    const m = /\/(\d+)$/.exec(range);
    if (m) return Number(m[1]);
  }
  const len = response.headers.get("content-length");
  return len && /^\d+$/.test(len) ? Number(len) : null;
}

async function probeImageSize(url) {
  try {
    let { response } = await safeFetch(url, { method: "HEAD", headers: { "User-Agent": UA, Accept: IMAGE_ACCEPT } }, SIZE_PROBE_TIMEOUT);
    let bytes = sizeFromHeaders(response);
    if (bytes == null && (response.status === 405 || response.status === 501 || response.status === 403 || response.ok)) {
      try {
        await response.body?.cancel();
      } catch {
        /* nothing buffered */
      }
      ({ response } = await safeFetch(
        url,
        { method: "GET", headers: { "User-Agent": UA, Accept: IMAGE_ACCEPT, Range: "bytes=0-1023" } },
        SIZE_PROBE_TIMEOUT,
      ));
      bytes = sizeFromHeaders(response);
      try {
        await response.body?.cancel();
      } catch {
        /* nothing buffered */
      }
    }
    return bytes;
  } catch {
    return null;
  }
}

// Real byte size for a capped number of legacy-format images, worst (largest
// savings potential) first — the same conservative-request philosophy as
// probeUnknown below, just keyed on the exact URL instead of the proxy original.
async function probeLegacySizes(entries) {
  const deadline = Date.now() + 15000;
  const keys = entries.slice(0, SIZE_PROBE_LIMIT);
  for (let i = 0; i < keys.length; i += SIZE_PROBE_CONCURRENCY) {
    if (Date.now() > deadline) break;
    const batch = keys.slice(i, i + SIZE_PROBE_CONCURRENCY);
    await Promise.all(
      batch.map(async (entry) => {
        entry.bytes = await probeImageSize(entry.url);
      }),
    );
  }
}

// Images served from an extensionless CDN path are the one case a URL alone
// cannot classify, so a capped number get an actual request to read their
// real Content-Type. Capped because this is a per-image network round trip —
// grouped first by underlying resource so width variants of one proxied
// image share a single probe instead of paying for it once each.
async function probeUnknown(entries) {
  const groups = new Map();
  for (const entry of entries) {
    const key = probeKeyOf(entry.url);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }

  const keys = [...groups.keys()].slice(0, IMAGE_PROBE_LIMIT);
  for (let i = 0; i < keys.length; i += IMAGE_PROBE_CONCURRENCY) {
    const batch = keys.slice(i, i + IMAGE_PROBE_CONCURRENCY);
    await Promise.all(
      batch.map(async (key) => {
        const group = groups.get(key);
        const fmt = await probeImageFormat(group[0].url);
        if (fmt !== "unknown") for (const entry of group) entry.formats.add(fmt);
      }),
    );
  }
}

const ALT_RANK = { absent: 0, empty: 1, present: 2 };
function worstAlt(pages) {
  let worst = "present";
  for (const p of pages) if (ALT_RANK[p.alt] < ALT_RANK[worst]) worst = p.alt;
  return worst;
}

function finalizeImage(entry) {
  const format = bestFormat(entry.formats);
  return {
    url: entry.url,
    format,
    modern: format === "avif" || format === "webp",
    altStatus: worstAlt(entry.pages),
    // Missing on any occurrence is enough to flag it — a size shipped on one
    // page and not another is still a page that will jump when it loads.
    missingDimensions: entry.pages.some((p) => !p.hasDimensions),
    notLazy: entry.pages.some((p) => p.lazyIssue),
    pages: entry.pages.map((p) => p.page),
    bytes: entry.bytes,
    estimatedSavingsBytes: null,
  };
}

// ---------------------------------------------------------------------------
// Checks

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildChecks({
  images,
  missingAlt,
  legacy,
  missingDimensions,
  notLazy,
  estimatedSavingsBytes,
  sizedLegacyCount,
  pagesCrawled,
  discovered,
  sitemapFound,
}) {
  const out = [];
  const add = (level, title, tag, detail) => out.push({ level, title, tag, detail });
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  add(
    "pass",
    `${plural(pagesCrawled, "page", "pages")} crawled`,
    "crawl",
    sitemapFound
      ? `Found via sitemap.xml${discovered > pagesCrawled ? ` — ${discovered} URLs discovered, first ${pagesCrawled} checked.` : "."}`
      : "No sitemap found — crawled from the links on the homepage.",
  );

  if (!images.length) {
    add("warn", "No images found", "images", "Nothing to check on the pages crawled.");
    return out;
  }

  add("pass", `${plural(images.length, "image", "images")} found`, "images", `Across ${plural(pagesCrawled, "page", "pages")}.`);

  if (missingAlt.length) {
    add(
      "error",
      `${plural(missingAlt.length, "image has", "images have")} no alt text`,
      "alt text",
      `Of ${images.length} checked. Screen readers and search crawlers get nothing for these. First: ${missingAlt[0].url}`,
    );
  } else {
    add("pass", "Every image has alt text", "alt text", "");
  }

  if (legacy.length) {
    add(
      "warn",
      `${plural(legacy.length, "image is", "images are")} in a legacy format`,
      "format",
      `JPEG, PNG or GIF where AVIF or WebP would be smaller and load faster. First: ${legacy[0].url}`,
    );
  } else if (images.some((i) => i.format !== "svg" && i.format !== "unknown")) {
    add("pass", "All raster images use a modern format", "format", "AVIF or WebP throughout.");
  }

  const unknown = images.filter((i) => i.format === "unknown").length;
  if (unknown) {
    add(
      "warn",
      `${plural(unknown, "image", "images")} of unknown format`,
      "format",
      "No file extension, and the server did not answer with a usable Content-Type.",
    );
  }

  if (estimatedSavingsBytes > 0) {
    add(
      "warn",
      `~${formatBytes(estimatedSavingsBytes)} of potential savings`,
      "size",
      `Estimated from real file sizes on ${plural(sizedLegacyCount, "legacy image", "legacy images")}, using typical WebP savings vs. JPEG/PNG/GIF at equivalent quality. Not a guarantee — no image was actually re-encoded to measure this.`,
    );
  }

  if (missingDimensions.length) {
    add(
      "warn",
      `${plural(missingDimensions.length, "image is", "images are")} missing width/height`,
      "layout shift",
      `Without both attributes the browser reserves no space for the image before it loads, which shifts the page underneath it. First: ${missingDimensions[0].url}`,
    );
  } else {
    add("pass", "Every image declares its dimensions", "layout shift", "");
  }

  if (notLazy.length) {
    add(
      "warn",
      `${plural(notLazy.length, "image", "images")} not lazy-loaded`,
      "loading",
      `Missing loading="lazy" on an image other than the first on its page — those images load eagerly and compete with content actually in view. First: ${notLazy[0].url}`,
    );
  } else if (images.length > 1) {
    add("pass", "Below-the-fold images are lazy-loaded", "loading", "");
  }

  const order = { error: 0, warn: 1, pass: 2 };
  return out.sort((a, b) => order[a.level] - order[b.level]);
}

// ---------------------------------------------------------------------------

// Accepts a bare domain or a full URL and normalizes to its origin — the
// audit always starts from the site root, not the specific page pasted in.
function originFor(raw) {
  const text = String(raw || "").trim();
  const safe = publicUrl(/^https?:\/\//i.test(text) ? text : `https://${text.replace(/^\/+/, "")}`);
  return safe ? new URL(safe).origin : null;
}

async function analyze(rawUrl) {
  const origin = originFor(rawUrl);
  if (!origin) {
    const error = new Error("Enter a public website URL, like example.com.");
    error.status = 400;
    throw error;
  }

  const { pages, discovered, sitemapFound, homepageError } = await discoverPages(origin);
  if (!pages.length) {
    const error = new Error(homepageError ? fetchErrorMessage(homepageError) : "That site could not be reached. Check the URL and try again.");
    error.status = 502;
    throw error;
  }

  const pageResults = await crawlPages(pages);
  if (!pageResults.length) {
    const error = new Error("None of the site's pages could be fetched. It may be blocking automated requests.");
    error.status = 502;
    throw error;
  }

  const map = aggregate(pageResults);
  await probeUnknown([...map.values()].filter((e) => bestFormat(e.formats) === "unknown"));

  // Size only after format is settled — it's the legacy ones, worst (least
  // efficient) first, that the savings estimate below needs real bytes for.
  const legacyEntries = [...map.values()].filter((e) => isLegacyRaster(bestFormat(e.formats)));
  await probeLegacySizes(legacyEntries);

  const images = [...map.values()].map(finalizeImage);
  for (const img of images) {
    if (img.bytes != null && isLegacyRaster(img.format)) {
      img.estimatedSavingsBytes = Math.round(img.bytes * FORMAT_SAVINGS_FACTOR[img.format]);
    }
  }
  // Worst first: no alt text and a legacy format are what someone opens this
  // tool to find, so those rows should not be buried under a hundred clean ones.
  const priority = (i) => (i.altStatus !== "present" ? 2 : 0) + (isLegacyRaster(i.format) ? 1 : 0);
  images.sort((a, b) => priority(b) - priority(a));

  const missingAlt = images.filter((i) => i.altStatus !== "present");
  const legacy = images.filter((i) => isLegacyRaster(i.format));
  const missingDimensions = images.filter((i) => i.missingDimensions);
  const notLazy = images.filter((i) => i.notLazy);
  const estimatedSavingsBytes = legacy.reduce((sum, i) => sum + (i.estimatedSavingsBytes || 0), 0);
  const sizedLegacyCount = legacy.filter((i) => i.bytes != null).length;

  return {
    origin,
    pagesCrawled: pageResults.length,
    pagesAttempted: pages.length,
    pagesDiscovered: discovered,
    sitemapFound,
    crawledPages: pageResults.map((p) => p.url),
    imagesTotal: images.length,
    missingAltCount: missingAlt.length,
    legacyCount: legacy.length,
    modernCount: images.filter((i) => i.modern).length,
    missingDimensionsCount: missingDimensions.length,
    notLazyCount: notLazy.length,
    estimatedSavingsBytes,
    sizedLegacyCount,
    checks: buildChecks({
      images,
      missingAlt,
      legacy,
      missingDimensions,
      notLazy,
      estimatedSavingsBytes,
      sizedLegacyCount,
      pagesCrawled: pageResults.length,
      discovered,
      sitemapFound,
    }),
    images,
    missingAlt,
    missingDimensions,
    notLazy,
    legacy,
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { analyze };
