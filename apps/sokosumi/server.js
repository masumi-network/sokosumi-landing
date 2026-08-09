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
const vm = require("vm");
const crypto = require("crypto");

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
const contactTpl = require("./templates/contact");

const port = process.env.PORT || 3000;
const root = __dirname;
const dataDir = path.join(root, "data");
const cacheFile = path.join(dataDir, "catalog.json");
const seedFile = path.join(root, "catalog-seed.json");

const CORE_URL = process.env.SOKOSUMI_CORE_URL || "https://api.sokosumi.com";
const CORE_KEY = process.env.SOKOSUMI_CORE_KEY || "";
const REFRESH_MS = Number(process.env.CATALOG_REFRESH_MS) || 10 * 60 * 1000;
const PREVIEW_SECRET = process.env.PREVIEW_SECRET || "";

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
      profile: {
        llm: c.metadata?.profile?.llm || [],
        hosting: c.metadata?.profile?.hosting || "",
      },
      offers: mapOffers(c.metadata),
    }));

  const agents = (agentsRaw || []).map((a) => ({
    id: a.id,
    name: a.name,
    image: a.image || a.icon || null,
    icon: a.icon || null,
    credits: a.credits ?? null,
    summary: a.summary || "",
    description: a.description || "",
    rating: a.metrics?.ratings?.average ?? null,
    ratingCount: a.metrics?.ratings?.total ?? 0,
    runs: a.metrics?.executions?.count ?? 0,
    author: a.author?.organization || a.author?.name || "",
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

async function refresh() {
  if (!CORE_KEY) {
    console.log("[catalog] SOKOSUMI_CORE_KEY not set — serving cached data only");
    return false;
  }
  try {
    const [cw, ag] = await Promise.all([coreGet("/v1/coworkers?scope=all"), coreGet("/v1/agents?limit=100")]);
    catalog = withFallbackOffers(transform(cw.data, ag.data));
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify(catalog));
    console.log(`[catalog] refreshed: ${catalog.coworkers.length} coworkers, ${catalog.agents.length} agents @ ${catalog.fetchedAt}`);
    return true;
  } catch (e) {
    console.error("[catalog] refresh failed:", e.message);
    return false;
  }
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

// Public coworker slugs follow the persona name; the product's internal
// slug lives in catalogSlug. Old internal-slug URLs 301 to the public one.
async function coworkerSlugRedirect(ctx, buildPath) {
  const c = await cms.getCoworkerByCatalogSlug(ctx.params.slug, { draft: ctx.preview });
  return c && c.slug !== ctx.params.slug ? { redirect: buildPath(c.slug) } : null;
}

const routes = [
  { m: (s) => s.length === 1 && s[0] === "coworkers" && {}, h: coworkersTpl.index },
  {
    m: (s) => s.length === 2 && s[0] === "coworkers" && { slug: s[1] },
    h: async (ctx) =>
      (await coworkersTpl.profile(ctx)) ||
      coworkerSlugRedirect(ctx, (slug) => `/coworkers/${encodeURIComponent(slug)}`),
  },
  {
    m: (s) => s.length === 4 && s[0] === "coworkers" && s[2] === "tasks" && { slug: s[1], offerSlug: s[3] },
    h: async (ctx) =>
      (await tasksTpl.detail(ctx)) ||
      coworkerSlugRedirect(
        ctx,
        (slug) => `/coworkers/${encodeURIComponent(slug)}/tasks/${encodeURIComponent(ctx.params.offerSlug)}`,
      ),
  },
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
  { m: (s) => s.length === 1 && s[0] === "product" && {}, h: pagesTpl.productHub },
  { m: (s) => s.length === 1 && s[0] === "contact" && {}, h: contactTpl.render },
  {
    m: (s) => s.length === 1 && s[0] === "press" && {},
    h: async (ctx) => (await pagesTpl.cmsPage({ ...ctx, params: { slug: "press" } })) || misc.press(),
  },
];

if (process.argv.includes("--once")) {
  refresh().then((ok) => process.exit(ok ? 0 : 1));
} else {
  function resolveFile(urlPath) {
    const resolved = path.normalize(path.join(root, urlPath));
    if (resolved !== root && !resolved.startsWith(root + path.sep)) return null;
    try {
      const stat = fs.statSync(resolved);
      return stat.isFile() ? { path: resolved, size: stat.size } : null;
    } catch {
      return null;
    }
  }

  function serveIndex(res) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(fs.readFileSync(path.join(root, "index.html")));
  }

  http
    .createServer(async (req, res) => {
      const [rawPath, rawQuery] = (req.url || "/").split("?");
      const urlPath = decodeURIComponent(rawPath);
      const query = Object.fromEntries(new URLSearchParams(rawQuery || ""));

      try {
        if (urlPath === "/api/catalog") {
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=60" });
          return res.end(JSON.stringify(catalog));
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

        if (urlPath === "/robots.txt") {
          res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
          return res.end(misc.robots());
        }

        if (urlPath === "/sitemap.xml") {
          const xml = await misc.sitemap();
          res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=600" });
          return res.end(xml);
        }

        if (urlPath === "/" || urlPath === "/index.html") return serveIndex(res);

        const clean = urlPath.replace(/\/+$/, "") || "/";
        const seg = clean.split("/").filter(Boolean);
        const preview = hasPreviewCookie(req);
        const sendHtml = (html, code) => {
          res.writeHead(code || 200, {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": preview ? "no-store" : "public, max-age=120",
          });
          res.end(html);
        };

        // Static assets first (they all live under /assets or have extensions).
        if (seg[0] === "assets" || path.extname(clean)) {
          const file = resolveFile(urlPath);
          if (!file) return sendHtml(misc.notFound(), 404);
          const type = TYPES[path.extname(file.path).toLowerCase()] || "application/octet-stream";
          const range = req.headers.range;
          if (range) {
            const match = /bytes=(\d*)-(\d*)/.exec(range);
            if (match) {
              const start = match[1] ? parseInt(match[1], 10) : 0;
              const end = match[2] ? parseInt(match[2], 10) : file.size - 1;
              if (start <= end && end < file.size) {
                res.writeHead(206, {
                  "Content-Type": type,
                  "Content-Range": `bytes ${start}-${end}/${file.size}`,
                  "Accept-Ranges": "bytes",
                  "Content-Length": end - start + 1,
                });
                return fs.createReadStream(file.path, { start, end }).pipe(res);
              }
            }
          }
          res.writeHead(200, { "Content-Type": type, "Content-Length": file.size, "Accept-Ranges": "bytes" });
          return fs.createReadStream(file.path).pipe(res);
        }

        const ctx = { params: {}, query, preview, catalog };
        for (const r of routes) {
          const params = r.m(seg);
          if (!params) continue;
          ctx.params = params;
          const out = await r.h(ctx);
          if (out && out.redirect) {
            res.writeHead(301, { Location: out.redirect, "Cache-Control": "public, max-age=3600" });
            return res.end();
          }
          if (out) return sendHtml(out);
          return sendHtml(misc.notFound(), 404);
        }

        // CMS landing-page catch-all (slugs may be nested, e.g. product/x).
        const html = await pagesTpl.cmsPage({ ...ctx, params: { slug: seg.join("/") } });
        if (html) return sendHtml(html);
        return sendHtml(misc.notFound(), 404);
      } catch (e) {
        console.error(`[server] ${req.method} ${urlPath} failed:`, e);
        try {
          res.writeHead(500, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
          res.end(misc.serverError());
        } catch {
          /* headers already sent */
        }
      }
    })
    .listen(port, () => {
      console.log(`Sokosumi site listening on :${port}`);
    });

  refresh();
  setInterval(refresh, REFRESH_MS);
}
