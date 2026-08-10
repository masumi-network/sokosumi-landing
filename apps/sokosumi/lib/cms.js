// CMS access layer for the Sokosumi site. Zero-dependency reads from the
// shared Payload CMS (same instance as masumi.network; everything filtered
// to site=sokosumi).
//
// Caching: every query is cached in memory for TTL_MS and mirrored to
// data/cms-cache.json. On CMS failure the last good value is served
// indefinitely (stale-on-error), and the disk mirror survives restarts —
// the site never goes down because the CMS does.
//
// Draft preview: pass { draft: true } to any fetcher (the server does this
// when the preview cookie is set). Draft requests authenticate with
// CMS_PREVIEW_KEY, bypass the cache, and include unpublished versions.

const fs = require("fs");
const path = require("path");

const CMS_URL = process.env.CMS_URL || "https://payload-production-6f43.up.railway.app";
const CMS_PREVIEW_KEY = process.env.CMS_PREVIEW_KEY || "";
const SITE = "sokosumi";
const TTL_MS = Number(process.env.CMS_TTL_MS) || 5 * 60 * 1000;

const cacheFile = path.join(__dirname, "..", "data", "cms-cache.json");
let cache = {};
try {
  cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
} catch {
  /* cold start */
}

let persistTimer = null;
function persist() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
      fs.writeFileSync(cacheFile, JSON.stringify(cache));
    } catch (e) {
      console.error("[cms] cache persist failed:", e.message);
    }
  }, 2000);
}

async function rawFetch(pathname, draft) {
  const headers = { accept: "application/json" };
  if (draft && CMS_PREVIEW_KEY) headers.authorization = `users API-Key ${CMS_PREVIEW_KEY}`;
  const res = await fetch(CMS_URL + pathname, { headers });
  if (!res.ok) throw new Error(`CMS ${pathname} → HTTP ${res.status}`);
  return res.json();
}

// Cached GET of a payload REST path. Draft requests skip the cache entirely.
async function cmsGet(pathname, opts) {
  const draft = !!(opts && opts.draft);
  if (draft) {
    const sep = pathname.includes("?") ? "&" : "?";
    return rawFetch(`${pathname}${sep}draft=true`, true);
  }
  const hit = cache[pathname];
  const now = Date.now();
  if (hit && now - hit.at < TTL_MS) return hit.data;
  try {
    const data = await rawFetch(pathname, false);
    cache[pathname] = { at: now, data };
    persist();
    return data;
  } catch (e) {
    if (hit) {
      console.error(`[cms] ${e.message} — serving stale data`);
      return hit.data; // stale-on-error, unbounded
    }
    throw e;
  }
}

// Build a payload REST query string. where is a nested object using payload's
// bracket syntax keys, e.g. { "where[site][equals]": "sokosumi" }.
function qs(params) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") u.set(k, String(v));
  }
  return u.toString();
}

function siteWhere(extra) {
  const where = { "where[and][0][site][equals]": SITE };
  let i = 1;
  for (const [field, value] of Object.entries(extra || {})) {
    where[`where[and][${i}][${field}][equals]`] = value;
    i++;
  }
  return where;
}

async function findAll(collection, params, opts) {
  const data = await cmsGet(`/api/${collection}?${qs(params)}`, opts);
  return data.docs || [];
}

// Absolute URL for a payload media upload (relations arrive as objects when
// depth ≥ 1). Returns null when the field is empty or not populated.
function mediaUrl(m) {
  if (!m || typeof m !== "object" || !m.url) return null;
  return m.url.startsWith("http") ? m.url : CMS_URL + m.url;
}

// ── collection fetchers ──────────────────────────────────────────────────

const getVendors = (opts) =>
  findAll("vendors", { ...siteWhere({ active: "true" }), limit: 200, depth: 1, sort: "order" }, opts);

const getVendor = async (slug, opts) =>
  (await findAll("vendors", { ...siteWhere({ slug, active: "true" }), limit: 1, depth: 1 }, opts))[0] || null;

const getCoworkers = (opts) =>
  findAll("coworkers", { ...siteWhere({ active: "true" }), limit: 500, depth: 1, sort: "order" }, opts);

const getCoworker = async (slug, opts) =>
  (await findAll("coworkers", { ...siteWhere({ slug }), limit: 1, depth: 1 }, opts))[0] || null;

// Lookup by the product's internal slug (offers.agentSlug join key) — used
// to 301 old URLs after a public slug diverges from the catalog slug.
const getCoworkerByCatalogSlug = async (catalogSlug, opts) =>
  (await findAll("coworkers", { ...siteWhere({ catalogSlug }), limit: 1, depth: 0 }, opts))[0] || null;

const getOffers = (opts) =>
  findAll("offers", { ...siteWhere({ active: "true" }), limit: 500, depth: 0, sort: "order" }, opts);

const getOffersFor = (agentSlug, opts) =>
  findAll("offers", { ...siteWhere({ agentSlug, active: "true" }), limit: 100, depth: 0, sort: "order" }, opts);

const getOffer = async (agentSlug, slug, opts) =>
  (await findAll("offers", { ...siteWhere({ agentSlug, slug }), limit: 1, depth: 0 }, opts))[0] || null;

const getIndustries = (opts) => findAll("industries", { limit: 200, depth: 0, sort: "name" }, opts);

const getIndustry = async (slug, opts) =>
  (await findAll("industries", { "where[slug][equals]": slug, limit: 1, depth: 0 }, opts))[0] || null;

const getUseCases = (opts) => findAll("use-cases", { ...siteWhere(), limit: 500, depth: 1, sort: "title" }, opts);

const getUseCase = async (slug, opts) =>
  (await findAll("use-cases", { ...siteWhere({ slug }), limit: 1, depth: 1 }, opts))[0] || null;

const getGuides = (opts) => findAll("guides", { ...siteWhere(), limit: 500, depth: 1, sort: "order" }, opts);

const getGuide = async (slug, opts) =>
  (await findAll("guides", { ...siteWhere({ slug }), limit: 1, depth: 1 }, opts))[0] || null;

const getPosts = (opts) => findAll("posts", { ...siteWhere(), limit: 500, depth: 1, sort: "-date" }, opts);

const getPost = async (slug, opts) =>
  (await findAll("posts", { ...siteWhere({ slug }), limit: 1, depth: 1 }, opts))[0] || null;

const getReleases = (opts) => findAll("releases", { ...siteWhere(), limit: 500, depth: 1, sort: "-date" }, opts);

const getRelease = async (slug, opts) =>
  (await findAll("releases", { ...siteWhere({ slug }), limit: 1, depth: 1 }, opts))[0] || null;

const getComparisons = (opts) =>
  findAll("comparisons", { ...siteWhere(), limit: 200, depth: 1, sort: "title" }, opts);

const getComparison = async (slug, opts) =>
  (await findAll("comparisons", { ...siteWhere({ slug }), limit: 1, depth: 1 }, opts))[0] || null;

const getPages = (opts) => findAll("pages", { ...siteWhere(), limit: 500, depth: 1 }, opts);

const getPage = async (slug, opts) =>
  (await findAll("pages", { ...siteWhere({ slug }), limit: 1, depth: 1 }, opts))[0] || null;

const getFaqs = (opts) => findAll("faqs", { ...siteWhere(), limit: 200, depth: 0 }, opts);

module.exports = {
  CMS_URL,
  mediaUrl,
  getVendors,
  getVendor,
  getCoworkers,
  getCoworker,
  getCoworkerByCatalogSlug,
  getOffers,
  getOffersFor,
  getOffer,
  getIndustries,
  getIndustry,
  getUseCases,
  getUseCase,
  getGuides,
  getGuide,
  getPosts,
  getPost,
  getReleases,
  getRelease,
  getComparisons,
  getComparison,
  getPages,
  getPage,
  getFaqs,
};
