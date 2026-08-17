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
// Committed snapshot of the same cache (refresh it by crawling the site
// against a healthy CMS and copying the warm data/cms-cache.json over this
// file — see CMS.md). It exists so that a COLD START
// DURING A CMS OUTAGE — new deploy, no data/ volume, CMS down — still renders
// every page from the last committed content instead of failing. The seed is
// only a floor: entries are stamped far in the past, so the first request per
// path still asks the CMS and replaces them the moment it answers.
const seedFile = path.join(__dirname, "..", "cms-seed.json");
let cache = {};
try {
  const seeded = JSON.parse(fs.readFileSync(seedFile, "utf8"));
  for (const k of Object.keys(seeded)) cache[k] = { at: 0, data: seeded[k].data };
} catch {
  /* no committed seed */
}
try {
  const disk = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
  Object.assign(cache, disk);
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

// A CMS that fails is survivable — the stale cache covers it. A CMS that
// merely hangs is not: without a deadline every HTML route waits on it
// forever, and the whole site stops responding while looking perfectly
// healthy. Fail fast and let the stale-on-error path do its job.
const FETCH_TIMEOUT_MS = Number(process.env.CMS_TIMEOUT_MS) || 4000;

async function rawFetch(pathname, draft) {
  const headers = { accept: "application/json" };
  if (draft && CMS_PREVIEW_KEY) headers.authorization = `users API-Key ${CMS_PREVIEW_KEY}`;
  const res = await fetch(CMS_URL + pathname, { headers, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`CMS ${pathname} → HTTP ${res.status}`);
  return res.json();
}

// One in-flight request per path. Without this, a burst of concurrent visitors
// arriving just after a TTL expiry each opened their own round-trip to the CMS
// and each waited for it.
const inFlight = new Map();

// The cache is keyed on the request path, and 404 handling queries the CMS for
// whatever slug was asked for — so a crawler walking nonsense URLs could grow
// it without limit, and it is mirrored to disk. Bound it, evicting whatever
// was least recently used.
const MAX_ENTRIES = Number(process.env.CMS_CACHE_MAX) || 500;
function remember(pathname, entry) {
  cache[pathname] = entry;
  const keys = Object.keys(cache);
  if (keys.length > MAX_ENTRIES) {
    keys
      .sort((a, b) => (cache[a].at || 0) - (cache[b].at || 0))
      .slice(0, keys.length - MAX_ENTRIES)
      .forEach((k) => delete cache[k]);
  }
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

  const pending = inFlight.get(pathname);
  if (pending) return pending;

  const job = rawFetch(pathname, false)
    .then((data) => {
      // A find on a healthy payload ALWAYS answers { docs: [...] }. A 200
      // without one is a half-deployed CMS (schema migrated ahead of its
      // code, an error body, a proxy interstitial). Throwing HERE — before
      // remember() — keeps the garbage out of the cache and routes the
      // request through the stale-on-error path like any other CMS failure,
      // instead of letting it masquerade as an authoritative empty result.
      if (!data || !Array.isArray(data.docs)) {
        throw new Error(`CMS ${pathname} answered without a docs array`);
      }
      remember(pathname, { at: Date.now(), data });
      persist();
      return data;
    })
    .catch((e) => {
      if (hit) {
        console.error(`[cms] ${e.message} — serving stale data for ${pathname}`);
        return hit.data;
      }
      // No previous good value to fall back on. Whatever the route does with
      // this, it must NOT read as "this content does not exist": the CMS did
      // not answer, so nothing is known. The server maps this flag to a 503
      // (retryable, keeps the URL indexed) instead of a 404 or a bare 500.
      e.cmsUnavailable = true;
      throw e;
    })
    .finally(() => inFlight.delete(pathname));

  inFlight.set(pathname, job);
  return job;
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
  // A find on a healthy payload ALWAYS answers { docs: [...] }. A 200 without
  // a docs array is a half-deployed CMS (schema migrated ahead of its code,
  // an error body, a proxy interstitial) — treating it as an authoritative
  // empty result is how a CMS blip once turned into template-level 404s that
  // told Google to deindex real pages. Malfunction, not "does not exist".
  if (!data || !Array.isArray(data.docs)) {
    const e = new Error(`CMS /api/${collection} answered without a docs array`);
    e.cmsUnavailable = true;
    throw e;
  }
  return data.docs;
}

// True when an error means "the CMS could not answer" rather than a bug in
// this codebase. The server turns these into 503s, never 404s or 500s.
function isCmsUnavailable(e) {
  return !!(e && e.cmsUnavailable);
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

// Single-doc lookups keyed on a slug have a cache entry only for slugs that
// have actually been visited — so during an outage a never-visited profile
// used to throw even though the COLLECTION list was sitting warm in the cache
// (every index page refreshes it, and the committed seed always carries it).
// When the direct query cannot be answered, answer from that list instead:
// present → serve the stale doc; absent → an authoritative "does not exist",
// which is what keeps unknown slugs 404ing correctly even mid-outage.
async function findOne(direct, list, match) {
  try {
    return (await direct())[0] || null;
  } catch (e) {
    if (!isCmsUnavailable(e)) throw e;
    const docs = await list().catch(() => null);
    if (!docs) throw e;
    console.error(`[cms] ${e.message} — resolved from the cached collection list`);
    return docs.find(match) || null;
  }
}

const getVendor = (slug, opts) =>
  findOne(
    () => findAll("vendors", { ...siteWhere({ slug, active: "true" }), limit: 1, depth: 1 }, opts),
    () => getVendors(opts),
    (v) => v.slug === slug,
  );

const getCoworkers = (opts) =>
  findAll("coworkers", { ...siteWhere({ active: "true" }), limit: 500, depth: 1, sort: "order" }, opts);

const getCoworker = (slug, opts) =>
  findOne(
    () => findAll("coworkers", { ...siteWhere({ slug }), limit: 1, depth: 1 }, opts),
    () => getCoworkers(opts),
    (c) => c.slug === slug,
  );

// Lookup by the product's internal slug (offers.agentSlug join key) — used
// to 301 old URLs after a public slug diverges from the catalog slug.
const getCoworkerByCatalogSlug = (catalogSlug, opts) =>
  findOne(
    () => findAll("coworkers", { ...siteWhere({ catalogSlug }), limit: 1, depth: 0 }, opts),
    () => getCoworkers(opts),
    (c) => c.catalogSlug === catalogSlug,
  );

const getOffers = (opts) =>
  findAll("offers", { ...siteWhere({ active: "true" }), limit: 500, depth: 0, sort: "order" }, opts);

const getOffersFor = async (agentSlug, opts) => {
  try {
    return await findAll("offers", { ...siteWhere({ agentSlug, active: "true" }), limit: 100, depth: 0, sort: "order" }, opts);
  } catch (e) {
    if (!isCmsUnavailable(e)) throw e;
    const all = await getOffers(opts).catch(() => null);
    if (!all) throw e;
    console.error(`[cms] ${e.message} — resolved from the cached offers list`);
    return all.filter((o) => o.agentSlug === agentSlug);
  }
};

const getOffer = (agentSlug, slug, opts) =>
  findOne(
    () => findAll("offers", { ...siteWhere({ agentSlug, slug }), limit: 1, depth: 0 }, opts),
    () => getOffers(opts),
    (o) => o.agentSlug === agentSlug && o.slug === slug,
  );

const getIndustries = (opts) => findAll("industries", { limit: 200, depth: 0, sort: "name" }, opts);

const getIndustry = (slug, opts) =>
  findOne(
    () => findAll("industries", { "where[slug][equals]": slug, limit: 1, depth: 0 }, opts),
    () => getIndustries(opts),
    (i) => i.slug === slug,
  );

const getUseCases = (opts) => findAll("use-cases", { ...siteWhere(), limit: 500, depth: 1, sort: "title" }, opts);

const getUseCase = (slug, opts) =>
  findOne(
    () => findAll("use-cases", { ...siteWhere({ slug }), limit: 1, depth: 1 }, opts),
    () => getUseCases(opts),
    (u) => u.slug === slug,
  );

const getGuides = (opts) => findAll("guides", { ...siteWhere(), limit: 500, depth: 1, sort: "order" }, opts);

const getGuide = (slug, opts) =>
  findOne(
    () => findAll("guides", { ...siteWhere({ slug }), limit: 1, depth: 1 }, opts),
    () => getGuides(opts),
    (g) => g.slug === slug,
  );

const getPosts = (opts) => findAll("posts", { ...siteWhere(), limit: 500, depth: 1, sort: "-date" }, opts);

const getPost = (slug, opts) =>
  findOne(
    () => findAll("posts", { ...siteWhere({ slug }), limit: 1, depth: 1 }, opts),
    () => getPosts(opts),
    (p) => p.slug === slug,
  );

const getReleases = (opts) => findAll("releases", { ...siteWhere(), limit: 500, depth: 1, sort: "-date" }, opts);

const getRelease = (slug, opts) =>
  findOne(
    () => findAll("releases", { ...siteWhere({ slug }), limit: 1, depth: 1 }, opts),
    () => getReleases(opts),
    (r) => r.slug === slug,
  );

const getComparisons = (opts) =>
  findAll("comparisons", { ...siteWhere(), limit: 200, depth: 1, sort: "title" }, opts);

const getComparison = (slug, opts) =>
  findOne(
    () => findAll("comparisons", { ...siteWhere({ slug }), limit: 1, depth: 1 }, opts),
    () => getComparisons(opts),
    (c) => c.slug === slug,
  );

const getPages = (opts) => findAll("pages", { ...siteWhere(), limit: 500, depth: 1 }, opts);

const getPage = (slug, opts) =>
  findOne(
    () => findAll("pages", { ...siteWhere({ slug }), limit: 1, depth: 1 }, opts),
    () => getPages(opts),
    (p) => p.slug === slug,
  );

const getFaqs = (opts) => findAll("faqs", { ...siteWhere(), limit: 200, depth: 0 }, opts);

const getTestimonials = (opts) =>
  findAll("testimonials", { ...siteWhere({ active: "true" }), limit: 50, depth: 1, sort: "order" }, opts);

module.exports = {
  CMS_URL,
  mediaUrl,
  isCmsUnavailable,
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
  getTestimonials,
};
