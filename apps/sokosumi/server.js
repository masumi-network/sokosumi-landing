// Zero-dependency server for the Sokosumi site.
//
// Serves: the static landing page (index.html + /assets), /api/catalog (live
// product catalog, cached to disk), and the server-rendered sub-pages, which
// are CMS-backed (see lib/cms.js — same Payload instance as masumi.network).
//
//   node server.js          → run the site + background catalog refresh
//   node server.js --once   → fetch + write data/catalog.json once, then exit
//
// Config via env (never hardcode keys in this file):
//   SOKOSUMI_CORE_URL   default: https://api.sokosumi.com
//   SOKOSUMI_CORE_KEY   user API key for the catalog refresh (Bearer token)
//   CATALOG_REFRESH_MS  default: 600000 (10 min)
//   CMS_URL             default: the shared payload instance
//   PREVIEW_SECRET      enables /api/preview?secret=…&path=… draft mode
//   CMS_PREVIEW_KEY     payload user API key used for draft fetches
const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const vm = require("vm");
const crypto = require("crypto");
const net = require("net");

const shell = require("./templates/shell");
const misc = require("./templates/misc");
const coworkersTpl = require("./templates/coworkers");
const guidesTpl = require("./templates/guides");
const tasksTpl = require("./templates/tasks");
const vendorsTpl = require("./templates/vendors");
const useCasesTpl = require("./templates/useCases");
const blogTpl = require("./templates/blog");
const releasesTpl = require("./templates/releases");
const compareTpl = require("./templates/compare");
const pagesTpl = require("./templates/pagesCms");
const agencyRunByAiTpl = require("./templates/agencyRunByAi");
const europeanAiTpl = require("./templates/europeanAi");
const contactTpl = require("./templates/contact");
const designMdTpl = require("./templates/designMd");
const designMdArchive = require("./lib/designMdArchive");
const toolsTpl = require("./templates/tools");

const port = process.env.PORT || 3000;
const root = __dirname;
const dataDir = path.join(root, "data");
const cacheFile = path.join(dataDir, "catalog.json");
const seedFile = path.join(root, "catalog-seed.json");
const statsFile = path.join(dataDir, "stats-floor.json");

const CORE_URL = process.env.SOKOSUMI_CORE_URL || "https://api.sokosumi.com";
const CORE_KEY = process.env.SOKOSUMI_CORE_KEY || "";
const REFRESH_MS = Number(process.env.CATALOG_REFRESH_MS) || 10 * 60 * 1000;
const PREVIEW_SECRET = process.env.PREVIEW_SECRET || "";
const DESIGN_MD_API_BASE = (process.env.MASUMI_DESIGN_MD_API_BASE || "https://www.masumi.network").replace(/\/+$/, "");
const DESIGN_MD_API_KEY = process.env.MASUMI_DESIGN_MD_API_KEY || "";
const DESIGN_MD_RATE_LIMIT = Number(process.env.DESIGN_MD_RATE_LIMIT) || 6;
const designMdRequests = new Map();

function publicWebsiteUrl(value) {
  let parsed;
  try {
    parsed = new URL(String(value || "").trim());
  } catch {
    return null;
  }
  if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password) return null;
  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) return null;
  const ipVersion = net.isIP(hostname);
  if (ipVersion === 4) {
    const parts = hostname.split(".").map(Number);
    const privateAddress =
      parts[0] === 0 ||
      parts[0] === 10 ||
      parts[0] === 127 ||
      (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) ||
      (parts[0] === 169 && parts[1] === 254) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      (parts[0] === 198 && (parts[1] === 18 || parts[1] === 19)) ||
      parts[0] >= 224;
    if (privateAddress) return null;
  }
  if (
    ipVersion === 6 &&
    (hostname === "::" ||
      hostname === "::1" ||
      /^f[cd]/i.test(hostname) ||
      /^fe[89ab]/i.test(hostname) ||
      /^::ffff:/i.test(hostname))
  ) return null;
  parsed.hash = "";
  return parsed.href;
}

function readJsonBody(req, maxBytes = 8192) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size <= maxBytes) body += chunk;
    });
    req.on("end", () => {
      if (size > maxBytes) return reject(new Error("too-large"));
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("invalid-json"));
      }
    });
    req.on("error", reject);
  });
}

function designMdRateLimited(ip) {
  const now = Date.now();
  const windowStart = now - 60 * 60 * 1000;
  const hits = (designMdRequests.get(ip) || []).filter((time) => time > windowStart);
  if (hits.length >= DESIGN_MD_RATE_LIMIT) return true;
  hits.push(now);
  designMdRequests.set(ip, hits);
  if (designMdRequests.size > 2000) {
    for (const [key, times] of designMdRequests) {
      if (!times.some((time) => time > windowStart)) designMdRequests.delete(key);
    }
  }
  return false;
}

async function designMdFetch(pathname, options = {}) {
  const response = await fetch(`${DESIGN_MD_API_BASE}${pathname}`, {
    ...options,
    headers: { Accept: "application/json", ...(options.headers || {}) },
    signal: AbortSignal.timeout(12000),
  });
  const body = await response.text();
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    data = { error: "The analysis service returned an invalid response." };
  }
  return { data, status: response.status };
}

function absoluteDesignMdAssets(data) {
  if (!data || typeof data !== "object") return data;
  const rewrite = (value) =>
    typeof value === "string" && value.startsWith("/") ? `${DESIGN_MD_API_BASE}${value}` : value;
  const logoProxy = (entry) => (entry && entry.logoUrl && entry.id ? `${DESIGN_MD_API_BASE}/tools/design-md/api/logos/${entry.id}` : null);
  if (Array.isArray(data.entries)) {
    data.entries = data.entries.map((entry) => ({ ...entry, screenshotUrl: rewrite(entry.screenshotUrl), logoUrl: logoProxy(entry) }));
  }
  if (data.screenshotUrl) data.screenshotUrl = rewrite(data.screenshotUrl);
  if (data.id && data.logoUrl) data.logoProxyUrl = logoProxy(data);
  return data;
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

// ── catalog cache (landing page + nightly CMS sync source) ───────────────
let catalog = { fetchedAt: null, coworkers: [], agents: [], categories: [] };
try {
  catalog = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
  console.log(`[catalog] loaded disk cache from ${catalog.fetchedAt}`);
} catch {
  try {
    catalog = JSON.parse(fs.readFileSync(seedFile, "utf8"));
    console.log(`[catalog] no disk cache — loaded committed seed from ${catalog.fetchedAt}`);
  } catch {
    /* no cache, no seed */
  }
}

// /api/catalog is ~250 KB and the landing page asks for it on every view.
// Serialising it per request burnt ~10 ms of event loop each time; it only
// changes when refresh() replaces the catalog.
let catalogJsonCache = null;
let catalogEditorialPromise = null;
function catalogJson() {
  if (catalogJsonCache === null) catalogJsonCache = JSON.stringify(catalog);
  return catalogJsonCache;
}

function ensureCatalogEditorial() {
  if (!catalogEditorialPromise) {
    catalogEditorialPromise = attachBlurbs(catalog.coworkers).then(() => {
      catalogJsonCache = null;
    });
  }
  return catalogEditorialPromise;
}

// Lets the legacy redirect map check a target exists before sending anyone
// there — a 301 into a 404 is worse than a 301 to the hub. The coworker pages
// are CMS-backed (catalog.coworkers is only the dozen curated personas), and
// lib/cms serves this from memory, so it costs nothing on the 404 path.
async function coworkerSlugs() {
  try {
    const list = await cms.getCoworkers();
    return new Set(list.filter((c) => c.active !== false).map((c) => c.slug).filter(Boolean));
  } catch {
    return null; // CMS down: trust the slug rather than dumping everyone on the hub
  }
}

async function coreGet(p) {
  const res = await fetch(CORE_URL + p, { headers: { Authorization: `Bearer ${CORE_KEY}` } });
  if (!res.ok) throw new Error(`${p} → HTTP ${res.status}`);
  return res.json();
}

// Turn a coworker's raw metadata.offers into the shape the pages render.
function mapOffers(metadata) {
  const raw = (metadata && metadata.offers) || [];
  const seen = new Set();
  return raw
    .filter((o) => o && o.title)
    .map((o) => {
      let slug = shell.slugify(o.title);
      let s = slug,
        i = 2;
      while (seen.has(s)) s = `${slug}-${i++}`;
      seen.add(s);
      return {
        slug: s,
        title: o.title,
        description: o.description || "",
        category: o.category || "",
        deliverable: o.deliverable || "",
        prompt: o.prompt || "",
        outputs: (o.outputs || []).filter(Boolean).map((out) => ({
          type: out.type || "text",
          url: out.url || null,
          label: out.label || null,
          text: out.text || null,
        })),
      };
    });
}

// Vendor logo paths from /v1/coworkers are app-relative ("/images/logos/x.png").
// Make them absolute so the CMS sync and the pages can use them directly.
const APP_ORIGIN = process.env.SOKOSUMI_APP_URL || "https://app.sokosumi.com";
function absLogo(u) {
  if (!u) return null;
  return /^https?:\/\//i.test(u) ? u : APP_ORIGIN + (u.startsWith("/") ? u : `/${u}`);
}

// The product's own vendor record. `logos.light` is dark artwork for light
// backgrounds, `logos.dark` is the white version for dark ones.
function mapVendor(v) {
  if (!v || !v.name) return null;
  return {
    id: v.id || null,
    name: v.name,
    slug: v.slug || null,
    logoLight: absLogo(v.logos?.light),
    logoDark: absLogo(v.logos?.dark),
  };
}

function transform(coworkersRaw, agentsRaw) {
  const coworkers = (coworkersRaw || [])
    .filter((c) => c.isWhitelisted)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      role: c.caption || "",
      company: c.company || "",
      companyLogo: c.companyLogo || null,
      image: c.image || null,
      description: c.description || "",
      capabilities: c.capabilities || [],
      vendor: mapVendor(c.vendor),
      profile: {
        llm: c.metadata?.profile?.llm || [],
        hosting: c.metadata?.profile?.hosting || "",
      },
      offers: mapOffers(c.metadata),
    }));

  // Marketplace listings are represented by their ICON, always. The `image`
  // field is a shared Sokosumi mark for most of them and a bespoke picture for
  // a handful, so mixing the two gave a grid that was half line-art and half
  // artwork. The icons are one consistent set, one per listing.
  const agents = (agentsRaw || []).map((a) => ({
    id: a.id,
    name: a.name,
    image: a.icon || a.image || null,
    icon: a.icon || null,
    credits: a.credits ?? null,
    summary: a.summary || "",
    description: a.description || "",
    rating: a.metrics?.ratings?.average ?? null,
    ratingCount: a.metrics?.ratings?.total ?? 0,
    runs: a.metrics?.executions?.count ?? 0,
    author: a.author?.organization || a.author?.name || "",
    // The maker's brand wordmark. White artwork on transparency, so it only
    // reads on a dark chip. Per agent, not per organization: the org field is
    // unreliable (Factor168 agents are filed under "HybridAI"), the image is not.
    authorImage: a.author?.image || null,
    authorName: a.author?.name || "",
    authorOrg: a.author?.organization || "",
    legal: a.legal ? { privacy: a.legal.privacyPolicy || null, terms: a.legal.terms || null } : null,
    categories: (a.categories || []).map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      color: cat.styles?.light?.color || null,
      priority: cat.priority ?? 99,
    })),
  }));

  const catMap = new Map();
  for (const a of agents) {
    for (const cat of a.categories) {
      const e = catMap.get(cat.slug) || { name: cat.name, slug: cat.slug, color: cat.color, priority: cat.priority, count: 0 };
      e.count++;
      if (!e.color && cat.color) e.color = cat.color;
      catMap.set(cat.slug, e);
    }
  }
  const categories = Array.from(catMap.values()).sort((a, b) => a.priority - b.priority || b.count - a.count);

  return { fetchedAt: new Date().toISOString(), coworkers, agents, categories };
}

// Editorial card text and portrait overrides live in the CMS. The product API
// knows nothing about either, so join them onto the homepage catalog here.
// `blurb` stays separate because `description` feeds other surfaces. The CMS
// must never be able to break the catalog: on failure the product data ships
// unchanged and the page falls back to its synced bio and portrait.
//
// Join key: the catalog slug is the product's internal slug. Once a public
// CMS slug diverges from it, the CMS record keeps the product slug in
// catalogSlug (see coworkerSlugRedirect / cms.getCoworkerByCatalogSlug);
// until then the two are the same value in `slug`. So match catalogSlug
// first, then slug.
async function attachBlurbs(coworkers) {
  if (!coworkers || !coworkers.length) return;
  const cmsCw = await cms.getCoworkers().catch(() => []);
  const byCatalogSlug = new Map();
  const byPublicSlug = new Map();
  for (const c of cmsCw) {
    const text = typeof c.seoDescription === "string" ? c.seoDescription.trim() : "";
    const editorial = { blurb: text, image: c.image || "" };
    if (c.catalogSlug) byCatalogSlug.set(c.catalogSlug, editorial);
    if (c.slug) byPublicSlug.set(c.slug, editorial);
  }
  for (const c of coworkers) {
    const editorial = byCatalogSlug.get(c.slug) || byPublicSlug.get(c.slug);
    if (editorial?.blurb) c.blurb = editorial.blurb;
    if (editorial?.image) c.image = editorial.image;
  }
}

// ── platform stats (two numbers, one API request each) ───────────────────
//   tasks — every task ever briefed on the platform, from
//     /v1/admin/tasks meta.pagination.total. Needs an admin-scoped key; if
//     the key lacks that scope the number is simply omitted (never faked).
//   jobs  — the sum of every marketplace agent's public execution count.
//     Verified global rather than org-scoped: one agent reports 249
//     executions while this org's whole /v1/jobs feed holds 3 of them.
//     Coworker-dispatched jobs are not exposed globally, so this figure can
//     only understate activity, never overstate it.
//
// Both are monotonic. A partial API response must never make a public
// counter tick backwards, so the highest value ever seen is persisted to
// disk and used as a floor.
function readFloors() {
  try {
    return JSON.parse(fs.readFileSync(statsFile, "utf8"));
  } catch {
    return {};
  }
}
function computeStats(agents, tasksTotal, previous) {
  const prev = previous || {};
  const floors = readFloors();
  const jobsRaw = (agents || []).reduce((n, a) => n + (Number(a.runs) || 0), 0);

  const jobs = Math.max(jobsRaw, Number(floors.jobs) || 0, Number(prev.jobs) || 0);
  const tasks = Math.max(Number(tasksTotal) || 0, Number(floors.tasks) || 0, Number(prev.tasks) || 0);

  if (jobs > (Number(floors.jobs) || 0) || tasks > (Number(floors.tasks) || 0)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(statsFile, JSON.stringify({ tasks, jobs, at: new Date().toISOString() }));
    } catch (e) {
      console.error("[stats] could not persist floors:", e.message);
    }
  }
  // The site shows ONE number: tasks briefed on the platform plus agent
  // jobs run for them. Both parts stay in the payload for transparency.
  return {
    tasks: tasks || null,
    jobs: jobs || null,
    total: (tasks || 0) + (jobs || 0) || null,
    updatedAt: new Date().toISOString(),
  };
}

// ── curated-task fallback for the landing page's catalog ─────────────────
const OUTPUT_BY_LABEL = { "PDF report": "pdf", Document: "doc", Slides: "slides", Code: "text", Sheet: "sheet" };
let curatedBySlug = {};
function loadCurated() {
  try {
    const src = fs.readFileSync(path.join(root, "assets", "tasks.js"), "utf8");
    const sandbox = { window: {} };
    vm.runInNewContext(src, sandbox, { timeout: 500 });
    const tasks = sandbox.window.SOKOSUMI_TASKS || [];
    const map = {};
    for (const t of tasks) {
      (map[t.coworkerSlug] = map[t.coworkerSlug] || []).push({
        slug: t.slug || shell.slugify(t.title),
        title: t.title,
        description: t.short || "",
        category: t.category || "",
        deliverable: "",
        prompt: "",
        outputs: [{ type: OUTPUT_BY_LABEL[t.output] || "text", url: null, label: t.output || null, text: null }],
      });
    }
    curatedBySlug = map;
  } catch (e) {
    console.error("[curated] failed to load assets/tasks.js:", e.message);
    curatedBySlug = {};
  }
}
loadCurated();

function withFallbackOffers(cat) {
  for (const c of cat.coworkers || []) {
    if (!c.offers || !c.offers.length) c.offers = curatedBySlug[c.slug] || [];
  }
  return cat;
}
withFallbackOffers(catalog);

// Coworkers and agents refresh independently: /v1/agents is public while
// /v1/coworkers needs a valid USER api key, and one failing must not freeze
// the other (a bad key once pinned the whole catalog to a stale snapshot).
async function refresh() {
  if (!CORE_KEY) {
    console.log("[catalog] SOKOSUMI_CORE_KEY not set — serving cached data only");
    return false;
  }
  let cwRaw = null;
  let agRaw = null;
  let tasksTotal = null;
  try {
    cwRaw = (await coreGet("/v1/coworkers?scope=all")).data;
  } catch (e) {
    console.error("[catalog] coworkers refresh failed:", e.message);
  }
  try {
    agRaw = (await coreGet("/v1/agents?limit=100")).data;
  } catch (e) {
    console.error("[catalog] agents refresh failed:", e.message);
  }
  try {
    // Platform task total: one request, we only read the pagination count.
    tasksTotal = (await coreGet("/v1/admin/tasks?limit=1")).meta?.pagination?.total ?? null;
  } catch (e) {
    console.error("[stats] task total unavailable (needs an admin-scoped key):", e.message);
  }
  if (!cwRaw && !agRaw) return false;

  const fresh = transform(cwRaw || [], agRaw || []);
  await attachBlurbs(fresh.coworkers);
  const now = fresh.fetchedAt;
  const agents = agRaw ? fresh.agents : catalog.agents;
  catalog = withFallbackOffers({
    fetchedAt: now,
    coworkersFetchedAt: cwRaw ? now : catalog.coworkersFetchedAt || catalog.fetchedAt,
    agentsFetchedAt: agRaw ? now : catalog.agentsFetchedAt || catalog.fetchedAt,
    coworkers: cwRaw ? fresh.coworkers : catalog.coworkers,
    agents,
    categories: agRaw ? fresh.categories : catalog.categories,
    stats: computeStats(agents, tasksTotal, catalog.stats),
  });
  catalogJsonCache = null;
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(catalog));
  console.log(
    `[catalog] refreshed${cwRaw ? "" : " (coworkers STALE — check SOKOSUMI_CORE_KEY)"}: ` +
      `${catalog.coworkers.length} coworkers @ ${catalog.coworkersFetchedAt}, ` +
      `${catalog.agents.length} agents @ ${catalog.agentsFetchedAt}, ` +
      `${catalog.stats.tasks ?? "?"} tasks / ${catalog.stats.jobs ?? "?"} jobs`,
  );
  return true;
}

// ── preview (draft) mode ─────────────────────────────────────────────────
const previewToken = PREVIEW_SECRET
  ? crypto.createHmac("sha256", PREVIEW_SECRET).update("soko-preview").digest("hex")
  : null;

function hasPreviewCookie(req) {
  if (!previewToken) return false;
  const cookies = String(req.headers.cookie || "");
  return cookies.split(/;\s*/).some((c) => c === `soko_preview=${previewToken}`);
}

// ── routing ──────────────────────────────────────────────────────────────
// Each route: match(segments) → params or null, then handler(ctx) →
// html string | { redirect } | null (404).
const cms = require("./lib/cms");
const i18n = require("./lib/i18n");
const { t } = i18n;
const { buildNav } = require("./lib/nav");
const leads = require("./lib/leads");
const salesTpl = require("./templates/sales");
const pricingTpl = require("./templates/pricing");
const aboutTpl = require("./templates/about");
const og = require("./lib/og");
const supportTpl = require("./templates/support");
const legalTpl = require("./templates/legal");
const legacyRedirects = require("./lib/legacyRedirects");
const listAgentTpl = require("./templates/listAgent");

// Public coworker slugs follow the persona name; the product's internal
// slug lives in catalogSlug. Old internal-slug URLs 301 to the public one.
async function coworkerSlugRedirect(ctx, buildPath) {
  const c = await cms.getCoworkerByCatalogSlug(ctx.params.slug, { draft: ctx.preview });
  return c && c.slug !== ctx.params.slug ? { redirect: buildPath(c.slug) } : null;
}

const routes = [
  { m: (s) => s.length === 1 && s[0] === "ai-coworkers" && {}, h: coworkersTpl.index },
  {
    m: (s) => s.length === 2 && s[0] === "ai-coworkers" && { slug: s[1] },
    h: async (ctx) =>
      (await coworkersTpl.profile(ctx)) ||
      coworkerSlugRedirect(ctx, (slug) => `/ai-coworkers/${encodeURIComponent(slug)}`),
  },
  {
    m: (s) => s.length === 4 && s[0] === "ai-coworkers" && s[2] === "tasks" && { slug: s[1], offerSlug: s[3] },
    h: async (ctx) =>
      (await tasksTpl.detail(ctx)) ||
      coworkerSlugRedirect(
        ctx,
        (slug) => `/ai-coworkers/${encodeURIComponent(slug)}/tasks/${encodeURIComponent(ctx.params.offerSlug)}`,
      ),
  },
  // These pages lived at /coworkers/* until the 2026-08 SEO rename. Permanent
  // redirect so old links and the indexed footprint carry over in one hop.
  {
    m: (s) => s[0] === "coworkers" && { rest: s.slice(1) },
    h: (ctx) => ({ redirect: ["/ai-coworkers", ...ctx.params.rest].join("/") }),
  },
  { m: (s) => s.length === 1 && s[0] === "agency-run-by-ai" && {}, h: agencyRunByAiTpl.render },
  { m: (s) => s.length === 1 && s[0] === "european-ai" && {}, h: europeanAiTpl.render },
  { m: (s) => s.length === 1 && s[0] === "tasks" && {}, h: tasksTpl.browse },
  { m: (s) => s.length === 1 && s[0] === "vendors" && {}, h: vendorsTpl.index },
  { m: (s) => s.length === 2 && s[0] === "vendors" && { slug: s[1] }, h: vendorsTpl.detail },
  { m: (s) => s.length === 1 && s[0] === "use-cases" && {}, h: useCasesTpl.hub },
  {
    m: (s) => s.length === 3 && s[0] === "use-cases" && s[1] === "industries" && { slug: s[2] },
    h: useCasesTpl.industry,
  },
  { m: (s) => s.length === 2 && s[0] === "use-cases" && { slug: s[1] }, h: useCasesTpl.detail },
  { m: (s) => s.length === 1 && s[0] === "guides" && {}, h: guidesTpl.index },
  { m: (s) => s.length === 2 && s[0] === "guides" && { slug: s[1] }, h: guidesTpl.detail },
  { m: (s) => s.length === 1 && s[0] === "blog" && {}, h: blogTpl.index },
  { m: (s) => s.length === 2 && s[0] === "blog" && { slug: s[1] }, h: blogTpl.detail },
  { m: (s) => s.length === 1 && s[0] === "releases" && {}, h: releasesTpl.index },
  { m: (s) => s.length === 2 && s[0] === "releases" && { slug: s[1] }, h: releasesTpl.detail },
  { m: (s) => s.length === 1 && s[0] === "compare" && {}, h: compareTpl.index },
  { m: (s) => s.length === 2 && s[0] === "compare" && { slug: s[1] }, h: compareTpl.detail },
  { m: (s) => s.length === 1 && s[0] === "tools" && {}, h: toolsTpl.render },
  { m: (s) => s.length === 2 && s[0] === "tools" && s[1] === "design-md" && {}, h: designMdTpl.render },
  { m: (s) => s.length === 4 && s[0] === "tools" && s[1] === "design-md" && s[2] === "analysis" && { slug: s[3] }, h: designMdTpl.analysis },
  { m: (s) => s.length === 1 && s[0] === "product" && {}, h: pagesTpl.productHub },
  { m: (s) => s.length === 1 && s[0] === "pricing" && {}, h: pricingTpl.render },
  // The entity page for Sokosumi itself lives in code so its JSON-LD is
  // generated from the same facts as the visible text (see templates/about.js).
  { m: (s) => s.length === 1 && s[0] === "about" && {}, h: aboutTpl.render },
  { m: (s) => s.length === 1 && s[0] === "contact" && {}, h: contactTpl.render },
  { m: (s) => s.length === 2 && s[0] === "contact" && s[1] === "sales" && {}, h: salesTpl.render },
  { m: (s) => s.length === 2 && s[0] === "contact" && s[1] === "support" && {}, h: supportTpl.render },
  // the routes these two used to live at, kept as permanent redirects
  { m: (s) => s.length === 1 && s[0] === "talk-to-sales" && {}, h: () => ({ redirect: "/contact/sales" }) },
  { m: (s) => s.length === 1 && s[0] === "support" && {}, h: () => ({ redirect: "/contact/support" }) },
  { m: (s) => s.length === 1 && s[0] === "list-your-agent" && {}, h: listAgentTpl.render },
  { m: (s) => s.length === 1 && s[0] === "legal" && {}, h: legalTpl.index },
  { m: (s) => s.length === 2 && s[0] === "legal" && { slug: s[1] }, h: legalTpl.detail },
  // sokosumi.com publishes these at the root today, so those URLs keep working.
  // The German locale needs no special case any more: the /de prefix is
  // stripped before routing and re-applied to relative redirects, so the
  // Terms' clause-2.4 link to /de/acceptable-use lands on /de/legal/acceptable-use.
  {
    m: (s) => s.length === 1 && legalTpl.isLegal(s[0]) && { slug: s[0] },
    h: (ctx) => ({ redirect: `/legal/${ctx.params.slug}` }),
  },
  {
    m: (s) => s.length === 1 && s[0] === "press" && {},
    h: async (ctx) => (await pagesTpl.cmsPage({ ...ctx, params: { slug: "press" } })) || misc.press(),
  },
];

// The request handler and its helpers are defined at module scope so a
// serverless host (Vercel) can `require()` this file and call handler(req, res)
// per request. The standalone HTTP listener and the background catalog refresh
// live at the very bottom and run ONLY when this file is executed directly
// (Railway, or `node server.js`) — never when it is imported.

// Static files come out of assets/ and nowhere else. Resolving against the
// app root instead would hand out the entire source tree — every module, the
// catalog cache, package.json, and any .env sitting in the working copy that
// a `railway up` tarball happened to carry along.
const assetsDir = path.join(root, "assets");

  // The handful of files a browser insists on finding at the root. Each is a
  // real file in assets/, published one level up.
  const ROOT_FILES = {
    "/favicon.ico": "favicon.ico",
    "/favicon.png": "favicon.png",
    "/apple-touch-icon.png": "apple-touch-icon.png",
    "/apple-touch-icon-precomposed.png": "apple-touch-icon.png",
    "/site.webmanifest": "site.webmanifest",
  };

  function resolveFile(urlPath) {
    const named = ROOT_FILES[urlPath];
    const resolved = named
      ? path.join(assetsDir, named)
      : path.normalize(path.join(root, urlPath));
    if (!resolved.startsWith(assetsDir + path.sep)) return null;
    try {
      const stat = fs.statSync(resolved);
      return stat.isFile() ? { path: resolved, size: stat.size } : null;
    } catch {
      return null;
    }
  }

  // Sent on every response. None of these need a CDN or a reverse proxy, and
  // without them the site scored zero on the basics.
  const BASE_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  };

  const COMPRESSIBLE = /^(?:text\/|application\/(?:json|xml|javascript|manifest))/;

  // Which encoding the client asked for, best first. q=0 is a refusal, so an
  // "identity;q=0, gzip" client still gets gzip and a "gzip;q=0" one does not.
  function pickEncoding(req) {
    const raw = String(req.headers["accept-encoding"] || "");
    const accepted = new Map(
      raw.split(",").map((part) => {
        const [name, ...params] = part.trim().split(";");
        const q = params.find((p) => p.trim().startsWith("q="));
        return [name.toLowerCase(), q ? parseFloat(q.split("=")[1]) : 1];
      }),
    );
    if (accepted.get("br") > 0) return "br";
    if (accepted.get("gzip") > 0) return "gzip";
    return null;
  }

  const compressors = { br: zlib.brotliCompressSync, gzip: zlib.gzipSync };

  // The single exit point for every non-streamed response: applies the base
  // headers, compresses when it is worth it, and honours HEAD.
  // ---- markdown content negotiation (acceptmarkdown.com) ------------------
  // An agent that sends `Accept: text/markdown` gets the page as markdown,
  // converted from the same HTML a browser would get. Every negotiated
  // response varies on Accept so a CDN never serves the wrong variant.
  function wantsMarkdown(req) {
    const a = String(req.headers.accept || "");
    if (!a.includes("text/markdown")) return false;
    // If html is also acceptable, markdown wins only when listed first or html absent.
    const md = a.indexOf("text/markdown");
    const html = a.indexOf("text/html");
    return html === -1 || md < html;
  }

  function htmlToMarkdown(html) {
    let s = String(html);
    const title = (/<title>([^<]*)<\/title>/.exec(s) || [])[1] || "";
    const canonical = (/<link rel="canonical" href="([^"]+)"/.exec(s) || [])[1] || "";
    // Prefer the page's main content; fall back to body.
    const main = /<main[^>]*>([\s\S]*?)<\/main>/.exec(s);
    s = main ? main[1] : ((/<body[^>]*>([\s\S]*?)<\/body>/.exec(s) || [null, s])[1]);
    s = s
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<svg[\s\S]*?<\/svg>/gi, "")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");
    const inner = (t) => t.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    s = s
      .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (m, t) => `\n# ${inner(t)}\n`)
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (m, t) => `\n## ${inner(t)}\n`)
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (m, t) => `\n### ${inner(t)}\n`)
      .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (m, t) => `\n#### ${inner(t)}\n`)
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (m, t) => `\n- ${inner(t)}`)
      .replace(/<a\s[^>]*href="([^"#][^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (m, href, t) => {
        const label = inner(t);
        if (!label) return "";
        const abs = href.startsWith("http") ? href : `https://www.sokosumi.com${href.startsWith("/") ? href : "/" + href}`;
        return `[${label}](${abs})`;
      })
      .replace(/<(?:p|blockquote|figcaption)[^>]*>([\s\S]*?)<\/(?:p|blockquote|figcaption)>/gi, (m, t) => `\n${inner(t)}\n`)
      .replace(/<(?:br|hr)\s*\/?>(?!\n)/gi, "\n")
      .replace(/<[^>]+>/g, " ");
    s = s
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
      .replace(/&mdash;/g, "—").replace(/&ldquo;/g, "\u201c").replace(/&rdquo;/g, "\u201d");
    s = s.replace(/[ \t]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    const head = [title ? `# ${title}` : "", canonical ? `<${canonical}>` : ""].filter(Boolean).join("\n");
    return (head ? head + "\n\n" : "") + s + "\n";
  }

  // Only the production hostname may be indexed. Vercel preview builds, the
  // *.vercel.app deployment URLs and any other alias serve this same code, so
  // without this they are a full, crawlable duplicate of the site competing
  // with it in search. robots.txt is per-host, so www's file cannot cover
  // them — the host has to answer for itself.
  const CANONICAL_HOST = (process.env.CANONICAL_HOST || "www.sokosumi.com").toLowerCase();
  function isPublicHost(req) {
    const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").toLowerCase().split(":")[0];
    if (!host) return true;
    if (host === CANONICAL_HOST) return true;
    // local development and the apex (which 301s to www) stay untouched
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "sokosumi.com";
  }

  function send(req, res, status, headers, body) {
    const head = { ...BASE_HEADERS, ...headers };
    if (!isPublicHost(req)) head["X-Robots-Tag"] = "noindex, nofollow";
    let payload = Buffer.isBuffer(body) ? body : Buffer.from(body ?? "", "utf8");
    const type = String(head["Content-Type"] || "");

    // Below ~1 KB the header overhead cancels out the saving.
    if (payload.length > 1024 && COMPRESSIBLE.test(type)) {
      const enc = pickEncoding(req);
      if (enc) {
        payload = compressors[enc](payload);
        head["Content-Encoding"] = enc;
        head.Vary = head.Vary ? `${head.Vary}, Accept-Encoding` : "Accept-Encoding";
      }
    }
    head["Content-Length"] = payload.length;
    res.writeHead(status, head);
    if (req.method === "HEAD") return res.end();
    res.end(payload);
  }

  // X-Forwarded-For is a list the client can prepend to at will, so the
  // leftmost entry is attacker-controlled and useless for rate limiting.
  // Trust only the hops our own proxy appended: count from the right.
  const TRUSTED_HOPS = Number(process.env.TRUSTED_PROXY_HOPS ?? 1);
  function clientIp(req) {
    const chain = String(req.headers["x-forwarded-for"] || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (TRUSTED_HOPS > 0 && chain.length) {
      return chain[Math.max(0, chain.length - TRUSTED_HOPS)];
    }
    return req.socket.remoteAddress || "unknown";
  }

  // Assets are cached hard (a day, plus a week of stale-while-revalidate), which
  // is right for performance and wrong the moment a file changes in place: the
  // browser keeps serving the old hero video, stylesheet or script without ever
  // asking. Stamp every asset URL in the HTML with a hash of that file's size
  // and mtime, so replacing a file changes its URL and the new one is fetched
  // immediately, while unchanged files stay cached.
  const assetVersions = new Map();
  // Hash the bytes, not the stat. mtimeMs is NOT stable across Vercel lambda
  // instances: the invocation that renders the HTML and the one that serves
  // the asset can see different mtimes, so a size-and-mtime hash produced a
  // `?v=` that never matched on the way back in. Every versioned asset then
  // fell through to the `no-cache` branch and production revalidated all four
  // stylesheets on every page view, while local dev looked perfectly fine.
  // Content hashing is identical on every instance, and the result is memoised
  // per process so each file is read at most once.
  function assetVersion(rel) {
    if (assetVersions.has(rel)) return assetVersions.get(rel);
    let v = "";
    try {
      v = crypto.createHash("sha1").update(fs.readFileSync(path.join(root, rel))).digest("hex").slice(0, 8);
    } catch {
      /* referenced but missing — leave the URL alone */
    }
    assetVersions.set(rel, v);
    return v;
  }

  // Only same-origin /assets/... references, and only those without a query
  // already. Anything absolute or external is left untouched.
  const ASSET_REF = /(["'(])(\/assets\/[A-Za-z0-9._\/-]+)(["')])/g;
  // Route the homepage's heaviest raster images through Vercel's optimizer.
  // Done here rather than in index.html so the markup keeps plain /assets/
  // paths that work under `node server.js`, where /_vercel/image does not
  // exist. serviceplan-hq.jpg is the worst offender: 405KB of 1400px JPEG for
  // a slot that is ~340 CSS px wide on a phone. At w=640 AVIF it is 26KB.
  const OPTIMIZE_IMAGES = Boolean(process.env.VERCEL);
  const opt = (p, w) => `/_vercel/image?url=${encodeURIComponent(p)}&w=${w}&q=85`;
  // Each entry: the asset path, the widths to offer, and the `sizes` hint that
  // tells the browser how wide it renders. Without `sizes` a srcset is a guess.
  const HOMEPAGE_IMAGES = [
    { file: "/assets/serviceplan-hq.jpg", widths: [828, 1200, 1656], sizes: "(max-width: 900px) 92vw, 640px" },
    { file: "/assets/florian-haller.jpg", widths: [828, 1200, 1656], sizes: "(max-width: 900px) 92vw, 720px" },
    { file: "/assets/shot-board.webp", widths: [1200, 1920, 2400], sizes: "100vw" },
    { file: "/assets/shot-roster.webp", widths: [1200, 1920, 2400], sizes: "100vw" },
    { file: "/assets/shot-brief.webp", widths: [1200, 1920, 2400], sizes: "100vw" },
    { file: "/assets/shot-chat2.webp", widths: [1200, 1920, 2400], sizes: "100vw" },
  ];
  function optimizeImages(html) {
    if (!OPTIMIZE_IMAGES) return html;
    for (const { file, widths, sizes } of HOMEPAGE_IMAGES) {
      const srcset = widths.map((w) => `${opt(file, w)} ${w}w`).join(", ");
      const mid = widths[Math.floor(widths.length / 2)];
      // Both plain src and the deferred data-src the hero rotator hydrates.
      for (const name of ["src", "data-src"]) {
        html = html.split(`${name}="${file}"`).join(`${name}="${opt(file, mid)}" srcset="${srcset}" sizes="${sizes}"`);
      }
    }
    return html;
  }

  // Image preloads are left alone: their href must match the url() in the
  // stylesheet exactly, and CSS references are not versioned. A ?v= on the
  // preload alone made the browser download the hero photo twice.
  const PRELOAD_IMAGE = /<link rel="preload" as="image"[^>]*>/g;
  function versionAssets(html) {
    return html
      .split(PRELOAD_IMAGE)
      .map((chunk) => chunk.replace(ASSET_REF, (m, open, url, close) => {
        const v = assetVersion(url.slice(1));
        return v ? `${open}${url}?v=${v}${close}` : m;
      }))
      .reduce((out, chunk, i, arr) => out + chunk + (i < arr.length - 1 ? html.match(PRELOAD_IMAGE)[i] : ""), "");
  }



  // Hero social proof, rendered with the document instead of hydrated after a
  // fetch. Falls back to an empty string (the row simply does not appear) when
  // the catalog has no portraits yet.
  function heroSocialHtml() {
    const faces = (catalog.coworkers || []).filter((c) => c && c.image).slice(0, 5);
    if (!faces.length) return "";
    const count = (catalog.agents || []).length || (catalog.coworkers || []).length;
    const imgs = faces
      .map((c, i) => `<img${shell.thumbSrc(c.image, 96)} alt="" width="40" height="40" decoding="async"${i === 0 ? ' fetchpriority="high"' : ""} />`)
      .join("");
    return `<div class="hero-social in" id="heroSocial" data-reveal>
          <span class="avatars" id="heroAvatars">${imgs}</span>
          <span class="count" id="heroCount">${count}+ ${t("Agents")}</span>
        </div>`;
  }

  async function serveIndex(req, res) {
    const file = path.join(root, "index.html");
    const stat = fs.statSync(file);
    // Shared chrome is injected here from shell.js so the homepage cannot
    // drift from the sub-pages: header (overlay over the hero), the closing
    // CTA band, and the footer. Styles for the band live in styles.css;
    // header/footer styles live in nav.css. Inside a /de request the injected
    // chrome renders German by itself (shell reads the locale context); the
    // static body is translated by i18n.translateHomepage below.
    shell.setNav(await buildNav({ draft: hasPreviewCookie(req) }).catch(() => null));
    let html = fs
      .readFileSync(file, "utf8")
      .replace("<!--SSR:HEADER-->", shell.header("/", { overlay: true }))
      .replace(
        "<!--SSR:CTA-->",
        shell.ctaBand({
          heading: t("Give a coworker a task."),
          subheading: t("Sign up on the free plan and send the first brief today."),
          ctaLabel: t("Sign Up"),
        }),
      )
      .replace("<!--SSR:FOOTER-->", shell.footerHtml())
      // The hero's face row used to wait for /api/catalog, so the first thing
      // above the headline popped in a second late. The catalog is already in
      // memory here — render it with the document.
      .replace("<!--SSR:HERO_SOCIAL-->", heroSocialHtml());
    // Editor-owned hero positioning: when the sokosumi-site-config global has
    // a hero subtitle, it replaces the built-in line (per locale via cms's
    // locale-aware fetch). Empty global = the file's own copy stands.
    const siteConfig = await cms.getSiteConfig().catch(() => null);
    const heroSub = siteConfig && siteConfig.positioning && siteConfig.positioning.heroSubtitle;
    if (heroSub) {
      html = html.replace(
        /(<p class="hero-sub"[^>]*>)[\s\S]*?(<\/p>)/,
        (m, open, close) => open + "\n          " + String(heroSub).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]) + "\n        " + close,
      );
    }
    // hreflang pair + locale-correct canonical. index.html hard-codes its
    // canonical, so the swap matches that exact tag on both locales.
    const EN_HOME = "https://www.sokosumi.com/";
    const DE_HOME = "https://www.sokosumi.com/de";
      const canonicalHref = i18n.locale() === "de" ? DE_HOME : EN_HOME;
      // index.html bypasses shell.head(), so the gate is repeated here.
      const homeHead = i18n.deIndexable("/")
        ? `<link rel="canonical" href="${canonicalHref}" />\n    <link rel="alternate" hreflang="en" href="${EN_HOME}" />\n    <link rel="alternate" hreflang="de" href="${DE_HOME}" />\n    <link rel="alternate" hreflang="x-default" href="${EN_HOME}" />`
        : i18n.locale() === "de"
          ? '<meta name="robots" content="noindex,follow" />'
          : `<link rel="canonical" href="${EN_HOME}" />`;
      html = html.replace('<link rel="canonical" href="https://www.sokosumi.com/" />', homeHead);

      // The hero is the photographic one - a light frame with the product on a
      // laptop. landing.css keys its entire light treatment off these two
      // classes, so they are applied unconditionally now rather than behind the
      // query parameter the variants used while we were choosing.
      html = html
        .replace("<body", '<body class="hero-aurora hero-bg-photowelcome2"')
        .replace('<div class="hero">', '<div class="hero is-aurora">');
    if (i18n.locale() === "de") html = i18n.translateHomepage(html);
    html = i18n.localizeHtml(html);
    send(req, res, 200, {
      "Content-Type": "text/html; charset=utf-8",
      // max-age=0 so a browser revalidates the document on every load, and
      // s-maxage so the CDN still absorbs the traffic. Assets are versioned by
      // content hash, so a stale document is the one thing that keeps serving
      // last deploy's CSS and JS — which looked exactly like a deploy that had
      // not happened. Revalidation is a cheap 304; the CDN does the real work.
      // stale-while-revalidate: the CDN answers from its copy at once and
      // re-renders in the background, so a visitor never waits on a function
      // boot. Field TTFB was 1.3s with the CDN missing on most requests.
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400, must-revalidate",
      "Last-Modified": stat.mtime.toUTCString(),
    }, versionAssets(optimizeImages(html)));
  }

  const handler = async (req, res) => {
      // Fallback only. vercel.json now redirects the apex at the edge, before a
      // function boots — answering it here instead measured 771ms of the mobile
      // Lighthouse run, because a 301 that costs a cold lambda is not cheap.
      // Kept so the behaviour is still correct under `node server.js` and if the
      // edge rule is ever removed. Exact-match: preview hosts and localhost are
      // left alone.
      const host = String(req.headers.host || "").toLowerCase();
      if (host === "sokosumi.com") {
        return send(req, res, 301, {
          Location: `https://www.sokosumi.com${req.url || "/"}`,
          "Cache-Control": "public, max-age=3600",
        }, "");
      }
      const [rawPath, rawQuery] = (req.url || "/").split("?");
      // decodeURIComponent throws on a malformed escape ("/%zz"), and this
      // runs before the try below — an uncaught throw here took the whole
      // process down, so one bad link from a crawler was a site outage.
      let urlPath;
      try {
        urlPath = decodeURIComponent(rawPath);
      } catch {
        return send(req, res, 400, { "Content-Type": "text/plain; charset=utf-8" }, "Bad Request");
      }
      // A NUL byte reaches fs.statSync and throws a TypeError the catch below
      // turns into a 500 — an unauthenticated 5xx generator. It is simply not
      // a valid path.
      if (urlPath.includes("\0")) {
        return send(req, res, 400, { "Content-Type": "text/plain; charset=utf-8" }, "Bad Request");
      }
      const query = Object.fromEntries(new URLSearchParams(rawQuery || ""));

      if (!["GET", "HEAD", "POST"].includes(req.method)) {
        return send(req, res, 405, { Allow: "GET, HEAD, POST", "Content-Type": "text/plain; charset=utf-8" }, "Method Not Allowed");
      }

      // One URL per page. Duplicate slashes, a trailing slash and /index.html
      // all used to serve a 200, which hands a crawler an unbounded set of
      // URLs for the same content. Redirect them instead, keeping the query
      // string so campaign attribution survives the hop.
      const qs = rawQuery ? `?${rawQuery}` : "";
      if (req.method !== "POST") {
        let canonicalPath = urlPath.replace(/\/{2,}/g, "/");
        if (canonicalPath.length > 1) canonicalPath = canonicalPath.replace(/\/+$/, "") || "/";
        if (canonicalPath === "/index.html") canonicalPath = "/";
        if (canonicalPath !== urlPath) {
          return send(req, res, 301, {
            Location: encodeURI(canonicalPath) + qs,
            "Cache-Control": "public, max-age=3600",
          }, "");
        }
      }

      // ── locale ──
      // /de/<path> is the German mirror of /<path>: strip the prefix here and
      // run the WHOLE request inside the locale context (AsyncLocalStorage, so
      // it survives every await without leaking into concurrent requests).
      // Every handler below then serves both locales unchanged; lib/i18n.js
      // rewrites the links and lib/cms.js asks Payload for the right locale.
      // English stays at the un-prefixed root — those URLs carry the ranking.
      let locale = "en";
      if (urlPath === "/de" || urlPath.startsWith("/de/")) {
        locale = "de";
        urlPath = urlPath.slice(3) || "/";
      }
      // Relative redirects computed below are locale-less; keep the visitor
      // in their language on the way through.
      const inLocale = (to) => (to.startsWith("/") ? i18n.localizePath(to, locale) : to);

      return i18n.run({ locale, path: urlPath }, async () => {
      try {
        // Saved analyses used to be deep links into the tool (?analysis=ID);
        // each now has its own page under /tools/design-md/analysis/<brand>.
        if (urlPath === "/tools/design-md" && /(?:^|&)analysis=(\d+)(?:&|$)/.test(rawQuery || "")) {
          const id = /(?:^|&)analysis=(\d+)/.exec(rawQuery)[1];
          const entry = await designMdArchive.byId(id).catch(() => null);
          if (entry) {
            return send(req, res, 301, { Location: designMdArchive.pathFor(entry), "Cache-Control": "public, max-age=86400" }, "");
          }
        }
        if (locale === "de" && (urlPath === "/tools" || urlPath.startsWith("/tools/"))) {
          return send(req, res, 301, {
            Location: `${urlPath}${rawQuery ? `?${rawQuery}` : ""}`,
            "Cache-Control": "public, max-age=86400",
          }, "");
        }
        // Shared files must live at ONE url: /de/assets/…, /de/robots.txt,
        // /de/sitemap.xml and friends would be crawlable duplicates, so they
        // bounce to the canonical un-prefixed copy. (Extension-less /de/api/*
        // stays served — the lead forms post there so their redirects can
        // stay in German.)
        if (locale === "de" && (urlPath.startsWith("/assets/") || path.extname(urlPath))) {
          return send(req, res, 301, { Location: encodeURI(urlPath) + qs, "Cache-Control": "public, max-age=3600" }, "");
        }
        if (urlPath === "/api/catalog") {
          await ensureCatalogEditorial();
          return send(req, res, 200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=60" }, catalogJson());
        }

        // Nav model for the landing page's dropdown menus (sub-pages render
        // it server-side). Same shape as templates/shell.js consumes.
        if (urlPath === "/api/nav") {
          const model = await buildNav({}).catch(() => ({ vendors: [], industries: [] }));
          return send(req, res, 200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=300" }, JSON.stringify(model));
        }

        if (urlPath === "/api/design-md/gallery") {
          try {
            // One entry per host, with the slug its analysis page lives at.
            const entries = (await designMdArchive.list()).map((e) => ({ ...e, path: designMdArchive.pathFor(e) }));
            return send(req, res, 200, {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": "public, max-age=60, s-maxage=300",
            }, JSON.stringify({ entries, total: entries.length }));
          } catch {
            return send(req, res, 502, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, JSON.stringify({ error: "The saved-analysis archive is unavailable right now." }));
          }
        }

        const extractionMatch = /^\/api\/design-md\/extractions\/(\d+)$/.exec(urlPath);
        if (extractionMatch) {
          try {
            const upstream = await designMdFetch(`/tools/design-md/api/extractions/${extractionMatch[1]}`);
            const data = absoluteDesignMdAssets(upstream.data);
            return send(req, res, upstream.status, {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": upstream.status === 200 ? "public, max-age=300" : "no-store",
            }, JSON.stringify(data));
          } catch {
            return send(req, res, 502, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, JSON.stringify({ error: "This saved analysis is unavailable right now." }));
          }
        }

        if (urlPath === "/api/design-md" && req.method === "POST") {
          if (!DESIGN_MD_API_KEY) {
            return send(req, res, 503, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, JSON.stringify({ error: "The generator is temporarily unavailable." }));
          }
          let body;
          try {
            body = await readJsonBody(req);
          } catch (error) {
            const message = error.message === "too-large" ? "The request is too large." : "Send a valid JSON request.";
            return send(req, res, 400, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, JSON.stringify({ error: message }));
          }
          const targetUrl = publicWebsiteUrl(body.url);
          if (!targetUrl) {
            return send(req, res, 400, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, JSON.stringify({ error: "Enter a complete public website URL." }));
          }
          if (designMdRateLimited(clientIp(req))) {
            return send(req, res, 429, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Retry-After": "3600" }, JSON.stringify({ error: "You have reached the hourly generation limit. Try again later or open a saved analysis below." }));
          }
          try {
            const upstream = await designMdFetch("/api/v1/design-md", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${DESIGN_MD_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ url: targetUrl }),
            });
            const data = absoluteDesignMdAssets(upstream.data);
            if (data && data.jobId) data.pollUrl = `/api/design-md/jobs/${data.jobId}`;
            if (data && data.status === "done" && !data.url) data.url = targetUrl;
            const responseStatus = upstream.status === 401 || upstream.status === 403 ? 503 : upstream.status;
            if (responseStatus === 503) data.error = "The generator is temporarily unavailable.";
            return send(req, res, responseStatus, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, JSON.stringify(data));
          } catch {
            return send(req, res, 502, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, JSON.stringify({ error: "The generator could not reach its analysis service. Try again in a moment." }));
          }
        }

        const designJobMatch = /^\/api\/design-md\/jobs\/([A-Za-z0-9-]{16,80})$/.exec(urlPath);
        if (designJobMatch) {
          if (!DESIGN_MD_API_KEY) {
            return send(req, res, 503, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, JSON.stringify({ error: "The generator is temporarily unavailable." }));
          }
          try {
            const upstream = await designMdFetch(`/api/v1/design-md/jobs/${encodeURIComponent(designJobMatch[1])}`, {
              headers: { Authorization: `Bearer ${DESIGN_MD_API_KEY}` },
            });
            const data = absoluteDesignMdAssets(upstream.data);
            const responseStatus = upstream.status === 401 || upstream.status === 403 ? 503 : upstream.status;
            if (responseStatus === 503) data.error = "The generator is temporarily unavailable.";
            return send(req, res, responseStatus, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, JSON.stringify(data));
          } catch {
            return send(req, res, 502, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, JSON.stringify({ error: "The generator could not reach its analysis service. Try again in a moment." }));
          }
        }

        // Draft preview: /api/preview?secret=…&path=/x sets the cookie and
        // redirects; /api/exit-preview clears it.
        if (urlPath === "/api/preview") {
          if (!previewToken || query.secret !== PREVIEW_SECRET) {
            res.writeHead(401, { "Content-Type": "text/plain" });
            return res.end("Invalid preview secret");
          }
          const to = query.path && query.path.startsWith("/") ? query.path : "/";
          res.writeHead(302, {
            Location: to,
            "Set-Cookie": `soko_preview=${previewToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=7200`,
          });
          return res.end();
        }
        if (urlPath === "/api/exit-preview") {
          res.writeHead(302, {
            Location: "/",
            "Set-Cookie": "soko_preview=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
          });
          return res.end();
        }

        // Talk-to-Sales submissions. Plain form POST so the page keeps
        // working without JavaScript; always redirects (post/redirect/get).
        if (urlPath === "/api/sales-inquiry" && req.method === "POST") {
          const ip = clientIp(req);
          const back = (params) => {
            res.writeHead(303, { Location: inLocale("/contact/sales") + "?" + new URLSearchParams(params), "Cache-Control": "no-store" });
            res.end();
          };

          if (leads.rateLimited(ip)) {
            return back({ error: "Too many requests just now. Please try again shortly." });
          }

          let raw = "";
          let tooBig = false;
          let seen = 0;
          req.on("data", (chunk) => {
            seen += chunk.length;
            // Past 64 KB we stop keeping the body but keep draining, so the
            // response socket stays usable and we can redirect with an error.
            if (seen > 64 * 1024) {
              tooBig = true;
              raw = "";
              if (seen > 1024 * 1024) req.destroy();
              return;
            }
            raw += chunk;
          });
          await new Promise((resolve) => {
            req.on("end", resolve);
            req.on("close", resolve);
            req.on("error", resolve);
          });
          if (tooBig) return back({ error: "That message is too long." });

          const body = Object.fromEntries(new URLSearchParams(raw));
          const result = await leads.submitLead(body, body.source || "/contact/sales");
          if (!result.ok) {
            // Silently accept honeypot hits so bots learn nothing.
            if (result.error === "spam") return back({ sent: "1" });
            return back({
              error: result.error,
              name: body.name || "",
              email: body.email || "",
              company: body.company || "",
              teamSize: body.teamSize || "",
              message: body.message || "",
              requestType: body.requestType || "",
            });
          }
          return back({ sent: "1" });
        }

        // Support requests. Same plain-form POST + redirect shape as sales,
        // so the page works with JavaScript disabled.
        if (urlPath === "/api/support-request" && req.method === "POST") {
          const ip = clientIp(req);
          const back = (params) => {
            res.writeHead(303, { Location: inLocale("/contact/support") + "?" + new URLSearchParams(params), "Cache-Control": "no-store" });
            res.end();
          };

          if (leads.rateLimited(ip)) {
            return back({ error: "Too many requests just now. Please try again shortly." });
          }

          let raw = "";
          let tooBig = false;
          let seen = 0;
          req.on("data", (chunk) => {
            seen += chunk.length;
            if (seen > 64 * 1024) {
              tooBig = true;
              raw = "";
              if (seen > 1024 * 1024) req.destroy();
              return;
            }
            raw += chunk;
          });
          await new Promise((resolve) => {
            req.on("end", resolve);
            req.on("close", resolve);
            req.on("error", resolve);
          });
          if (tooBig) return back({ error: "That message is too long." });

          const body = Object.fromEntries(new URLSearchParams(raw));
          const result = await leads.submitSupport(body, body.source || "/contact/support");
          if (!result.ok) {
            if (result.error === "spam") return back({ sent: "1" });
            return back({
              error: result.error,
              name: body.name || "",
              email: body.email || "",
              taskLink: body.taskLink || "",
              message: body.message || "",
            });
          }
          return back({ sent: "1" });
        }

        // Agent listing submissions. Larger body than the other two forms
        // (the Terms of Use field alone can be long), so the cap is raised.
        if (urlPath === "/api/agent-listing" && req.method === "POST") {
          const ip = clientIp(req);
          const back = (params) => {
            res.writeHead(303, {
              Location: inLocale("/list-your-agent") + "?" + new URLSearchParams(params),
              "Cache-Control": "no-store",
            });
            res.end();
          };

          if (leads.rateLimited(ip)) {
            return back({ error: "Too many requests just now. Please try again shortly." });
          }

          let raw = "";
          let tooBig = false;
          let seen = 0;
          req.on("data", (chunk) => {
            seen += chunk.length;
            if (seen > 256 * 1024) {
              tooBig = true;
              raw = "";
              if (seen > 2 * 1024 * 1024) req.destroy();
              return;
            }
            raw += chunk;
          });
          await new Promise((resolve) => {
            req.on("end", resolve);
            req.on("close", resolve);
            req.on("error", resolve);
          });
          if (tooBig) return back({ error: "That submission is too long." });

          // the checklist is a checkbox group, so the same key repeats
          const params = new URLSearchParams(raw);
          const body = {};
          for (const key of new Set(params.keys())) {
            const all = params.getAll(key);
            body[key] = all.length > 1 ? all : all[0];
          }

          const result = await leads.submitListing(body, "/list-your-agent");
          if (!result.ok) {
            if (result.error === "spam") return back({ sent: "1" });
            const echo = { error: result.error };
            for (const [name] of leads.LISTING_FIELDS) {
              const v = body[name];
              if (v) echo[name] = Array.isArray(v) ? v.join("|") : v;
            }
            return back(echo);
          }
          return back({ sent: "1" });
        }

        // Generated share images: everything comes from the query string so
        // the CDN caches one PNG per page. See lib/og.js.
        if (urlPath === "/og.png" || urlPath.startsWith("/og/")) {
          try {
            const q = urlPath === "/og.png" ? Object.fromEntries(new URLSearchParams(rawQuery || "")) : og.parsePath(urlPath);
            if (!q) return send(req, res, 404, { "Content-Type": "text/plain" }, "not found");
            const png = await og.render(q);
            return send(req, res, 200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000" }, png);
          } catch (e) {
            console.error("[og]", e.message);
            return send(req, res, 500, { "Content-Type": "text/plain" }, "og failed");
          }
        }
        if (urlPath === "/llms.txt") {
          return send(req, res, 200, { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600, must-revalidate" }, misc.llmsTxt());
        }
        if (urlPath === "/robots.txt") {
          const body = isPublicHost(req) ? misc.robots() : "User-agent: *\nDisallow: /\n";
          return send(req, res, 200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" }, body);
        }

        if (urlPath === "/sitemap.xml") {
          const xml = await misc.sitemap();
          return send(req, res, 200, { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=600" }, xml);
        }

        // awaited so a CMS hiccup inside serveIndex lands in the catch below
        // instead of becoming an unhandled rejection
        if (urlPath === "/") return await serveIndex(req, res);

        const clean = urlPath.replace(/\/+$/, "") || "/";
        const seg = clean.split("/").filter(Boolean);
        const preview = hasPreviewCookie(req);
        const sendHtml = (html, code) => {
          // A 404 must not sit in a shared cache for two minutes: the usual
          // cause is content that is about to exist.
          const cache = preview || code === 404 ? "no-store" : "public, max-age=0, s-maxage=120, stale-while-revalidate=86400, must-revalidate";
          // localizeHtml: on /de pages, root-relative links gain the /de
          // prefix; on every page the language switcher's /en marker collapses.
          const finalHtml = versionAssets(i18n.localizeHtml(html));
          // Pages negotiate on Accept (text/markdown for agents), so every
          // page response varies on it — otherwise a shared cache can hand
          // the HTML variant to an agent that asked for markdown.
          if (wantsMarkdown(req)) {
            return send(req, res, code || 200, { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": cache, Vary: "Accept" }, htmlToMarkdown(finalHtml));
          }
          send(req, res, code || 200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": cache, Vary: "Accept" }, finalHtml);
        };

        // Static assets first (they all live under /assets or have extensions).
        if (seg[0] === "assets" || path.extname(clean)) {
          const file = resolveFile(urlPath);
          if (!file) return sendHtml(misc.notFound(), 404);
          const ext = path.extname(file.path).toLowerCase();
          const type = TYPES[ext] || "application/octet-stream";
          const stat = fs.statSync(file.path);
          const etag = `"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`;
          const lastModified = stat.mtime.toUTCString();
          // The site's own JS/CSS are unhashed and get edited (the cookie
          // banner lives in consent.js). Caching them hard once stranded a fix
          // in every returning visitor's browser for a day. `no-cache` here
          // does NOT mean "don't cache" — it means "revalidate every load",
          // and because we send an ETag that revalidation is a tiny 304 when
          // nothing changed, so a fix ships on the next navigation. Fonts,
          // images, video and icons rarely change, so they keep the long,
          // revalidate-in-background cache.
          const isAppCode = ext === ".js" || ext === ".css";
          // A `?v=` that matches the current content hash names this exact
          // byte sequence, and every edit or deploy changes the hash (the
          // rendered HTML always links the current one), so that URL can be
          // cached forever. Unversioned requests keep the revalidate rule.
          const versioned = query.v && query.v === assetVersion(path.relative(root, file.path));
          const cacheControl = versioned
            ? "public, max-age=31536000, immutable"
            : isAppCode
              ? "public, no-cache"
              : "public, max-age=86400, stale-while-revalidate=604800";

          const inm = req.headers["if-none-match"];
          const ims = req.headers["if-modified-since"];
          if (inm === etag || (!inm && ims && new Date(ims) >= new Date(lastModified.slice(0, 25)))) {
            res.writeHead(304, { ...BASE_HEADERS, ETag: etag, "Cache-Control": cacheControl });
            return res.end();
          }

          const range = req.headers.range;
          if (range) {
            // "bytes=-500" means the LAST 500 bytes. Treating the empty first
            // group as 0 served the first 501 instead.
            const match = /bytes=(\d*)-(\d*)/.exec(range);
            if (match && (match[1] || match[2])) {
              const suffix = !match[1] && match[2];
              const start = suffix
                ? Math.max(0, file.size - parseInt(match[2], 10))
                : parseInt(match[1], 10);
              const end = suffix || !match[2] ? file.size - 1 : parseInt(match[2], 10);
              if (start <= end && end < file.size) {
                res.writeHead(206, {
                  ...BASE_HEADERS,
                  "Content-Type": type,
                  "Content-Range": `bytes ${start}-${end}/${file.size}`,
                  "Accept-Ranges": "bytes",
                  "Content-Length": end - start + 1,
                  "Cache-Control": cacheControl,
                  ETag: etag,
                });
                if (req.method === "HEAD") return res.end();
                return fs.createReadStream(file.path, { start, end }).pipe(res);
              }
            }
          }

          const headers = {
            "Content-Type": type,
            "Accept-Ranges": "bytes",
            "Cache-Control": cacheControl,
            ETag: etag,
            "Last-Modified": lastModified,
          };
          // Text assets go through send() so they get compressed; binaries
          // (images, video, fonts) are already compressed and stream instead.
          if (COMPRESSIBLE.test(type)) return send(req, res, 200, headers, fs.readFileSync(file.path));
          res.writeHead(200, { ...BASE_HEADERS, ...headers, "Content-Length": file.size });
          if (req.method === "HEAD") return res.end();
          return fs.createReadStream(file.path).pipe(res);
        }

        // Dropdown menus need the nav model; it is identical for every
        // visitor, so the shell caches it module-side.
        shell.setNav(await buildNav({ draft: preview }).catch(() => null));

        const ctx = { params: {}, query, preview, catalog };
        for (const r of routes) {
          const params = r.m(seg);
          if (!params) continue;
          ctx.params = params;
          const out = await r.h(ctx);
          if (out && out.redirect) {
            // Keep utm_* and friends across the hop, or every redirected
            // entry point lands in analytics as direct traffic. inLocale()
            // keeps a German visitor on /de through the redirect.
            const target = inLocale(out.redirect);
            const sep = target.includes("?") ? "&" : "?";
            const to = rawQuery ? target + sep + rawQuery : target;
            return send(req, res, out.status || 301, { Location: to, "Cache-Control": "public, max-age=3600" }, "");
          }
          if (out) return sendHtml(out);
          return sendHtml(misc.notFound(), 404);
        }

        // CMS landing-page catch-all (slugs may be nested, e.g. product/x).
        const html = await pagesTpl.cmsPage({ ...ctx, params: { slug: seg.join("/") } });
        if (html) return sendHtml(html);

        // Nothing here by that name — but the site this one replaces may have
        // published it. Check the legacy map before giving up, so the indexed
        // footprint survives the cutover.
        // The locale prefix was stripped above, so old German URLs resolve
        // through the same map and stay German: /de/ai-agents/<x> lands on
        // /de/ai-coworkers/<x> (absolute app URLs pass through untouched).
        const legacy = legacyRedirects.resolve(seg, await coworkerSlugs());
        if (legacy) {
          const target = inLocale(legacy);
          const sep = target.includes("?") ? "&" : "?";
          const to = rawQuery ? target + sep + rawQuery : target;
          return send(req, res, 301, { Location: to, "Cache-Control": "public, max-age=86400" }, "");
        }

        return sendHtml(misc.notFound(), 404);
      } catch (e) {
        console.error(`[server] ${req.method} ${urlPath} failed:`, e);
        try {
          // The CMS not answering is an upstream outage, not a bug here, and
          // MUST NOT surface as a 404 (tells Google to deindex) or a plain
          // 500 (reads as our code crashing). A 503 with Retry-After is the
          // one status that says "temporary, come back" — crawlers keep the
          // URL indexed and retry. Every route that could reach the CMS with
          // a cold cache lands here via the cmsUnavailable tag; anything with
          // a warm cache never throws at all (stale-on-error in lib/cms.js).
          if (cms.isCmsUnavailable(e)) {
            return send(req, res, 503, {
              "Content-Type": "text/html; charset=utf-8",
              "Cache-Control": "no-store",
              "Retry-After": "120",
            }, misc.serviceUnavailable());
          }
          send(req, res, 500, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }, misc.serverError());
        } catch {
          /* headers already sent */
        }
      }
      });
  };

// ── run modes ────────────────────────────────────────────────────────────────
if (process.argv.includes("--once")) {
  // `node server.js --once`: refresh the catalog cache to disk once, then exit.
  refresh().then((ok) => process.exit(ok ? 0 : 1));
} else if (require.main === module) {
  // Executed directly (Railway / local): a long-running server plus the
  // background catalog refresh. A serverless host imports this file instead of
  // running it, so neither of these fires there — the platform invokes the
  // exported handler per request, and the catalog comes from the committed
  // seed loaded at module init.
  http.createServer(handler).listen(port, () => {
    console.log(`Sokosumi site listening on :${port}`);
  });
  // The disk/seed catalog predates the CMS blurb join, and when the product
  // key is missing or its API is down refresh() never replaces it. Attach the
  // CMS blurbs to whatever we booted with, so the homepage is not blurbless
  // just because the product API is unreachable. If refresh() wins the race
  // and swaps the catalog first, this mutates the discarded array — harmless.
  ensureCatalogEditorial();
  refresh();
  setInterval(refresh, REFRESH_MS);
}

module.exports = handler;
module.exports.handler = handler;
