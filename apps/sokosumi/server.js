// Zero-dependency static server for the Sokosumi landing page + a small
// background service that polls the Sokosumi Core API, transforms the catalog,
// caches it to disk, and serves it at /api/catalog.
//
//   node server.js          → run the site + background refresh loop
//   node server.js --once   → fetch + write data/catalog.json once, then exit
//
// Config via env (never hardcode the key in this file):
//   SOKOSUMI_CORE_URL   default: mainnet preview
//   SOKOSUMI_CORE_KEY   required for live refresh (Bearer token)
//   CATALOG_REFRESH_MS  default: 600000 (10 min)
const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const root = __dirname;
const dataDir = path.join(root, "data");
const cacheFile = path.join(dataDir, "catalog.json");

const CORE_URL = process.env.SOKOSUMI_CORE_URL || "https://sokosumi-core-mainnet-7w905wrs2.preview.sokosumi.com";
const CORE_KEY = process.env.SOKOSUMI_CORE_KEY || "";
const REFRESH_MS = Number(process.env.CATALOG_REFRESH_MS) || 10 * 60 * 1000;

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

// ── catalog cache ────────────────────────────────────────────────────────
let catalog = { fetchedAt: null, coworkers: [], agents: [], categories: [] };
try {
  catalog = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
  console.log(`[catalog] loaded disk cache from ${catalog.fetchedAt}`);
} catch {
  /* no cache yet */
}

async function coreGet(p) {
  const res = await fetch(CORE_URL + p, { headers: { Authorization: `Bearer ${CORE_KEY}` } });
  if (!res.ok) throw new Error(`${p} → HTTP ${res.status}`);
  return res.json();
}

// Map the raw Core payloads down to exactly what the landing page renders.
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

  // De-duped category list (with counts + a colour) for the marketplace filter.
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

async function refresh() {
  if (!CORE_KEY) {
    console.log("[catalog] SOKOSUMI_CORE_KEY not set — serving cached data only");
    return false;
  }
  try {
    const [cw, ag] = await Promise.all([
      coreGet("/v1/coworkers?scope=all"),
      coreGet("/v1/agents?limit=100"),
    ]);
    catalog = transform(cw.data, ag.data);
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify(catalog));
    console.log(`[catalog] refreshed: ${catalog.coworkers.length} coworkers, ${catalog.agents.length} agents @ ${catalog.fetchedAt}`);
    return true;
  } catch (e) {
    console.error("[catalog] refresh failed:", e.message);
    return false;
  }
}

// ── one-shot mode (generate/refresh the cache, then exit) ────────────────
if (process.argv.includes("--once")) {
  refresh().then((ok) => process.exit(ok ? 0 : 1));
} else {
  // ── static server + background polling ─────────────────────────────────
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
    .createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);

      if (urlPath === "/api/catalog") {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=60" });
        return res.end(JSON.stringify(catalog));
      }

      if (urlPath === "/" || urlPath === "/index.html") return serveIndex(res);

      const file = resolveFile(urlPath);
      if (!file) return serveIndex(res); // SPA-style fallback for unknown routes

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
      fs.createReadStream(file.path).pipe(res);
    })
    .listen(port, () => {
      console.log(`Sokosumi landing listening on :${port}`);
    });

  // background refresh loop
  refresh();
  setInterval(refresh, REFRESH_MS);
}
