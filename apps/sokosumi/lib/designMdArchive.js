// Saved DESIGN.md analyses (the masumi archive) addressed by brand slug, so
// every analysis gets a stable, indexable URL on sokosumi.com:
//   /tools/design-md/analysis/linear   (linear.app)
// The slug is the hostname minus www. and its last label when that stays
// unique across the archive; otherwise the whole hostname, hyphenated.

const BASE = (process.env.MASUMI_DESIGN_MD_API_BASE || "https://www.masumi.network").replace(/\/+$/, "");
const TTL = 5 * 60 * 1000;

let listCache = { at: 0, entries: [] };
const entryCache = new Map();

async function getJson(pathname) {
  const res = await fetch(`${BASE}${pathname}`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  return res.json();
}

const host = (hostname) => String(hostname || "").toLowerCase().replace(/^www\./, "");
const hyphen = (value) => value.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const shortHost = (hostname) => {
  const parts = host(hostname).split(".");
  return parts.length > 1 ? parts.slice(0, -1).join(".") : parts[0];
};

function assignSlugs(entries) {
  const counts = new Map();
  for (const e of entries) {
    const s = hyphen(shortHost(e.hostname));
    counts.set(s, (counts.get(s) || 0) + 1);
  }
  return entries.map((e) => {
    const short = hyphen(shortHost(e.hostname));
    const full = hyphen(host(e.hostname));
    const slug = short.length >= 3 && counts.get(short) === 1 ? short : full;
    return { ...e, slug, aliases: [full, short].filter((a) => a && a !== slug), logoUrl: e.logoUrl ? `${BASE}/tools/design-md/api/logos/${e.id}` : null, screenshotUrl: e.screenshotUrl ? `${BASE}${e.screenshotUrl}` : null };
  });
}

async function list() {
  if (Date.now() - listCache.at < TTL && listCache.entries.length) return listCache.entries;
  const data = await getJson("/tools/design-md/api/extractions");
  const raw = Array.isArray(data.entries) ? data.entries : [];
  // The upstream list is newest-first; keep one entry per hostname.
  const seen = new Set();
  const entries = assignSlugs(raw.filter((e) => e && e.hostname && !seen.has(host(e.hostname)) && seen.add(host(e.hostname))));
  listCache = { at: Date.now(), entries };
  return entries;
}

async function bySlug(slug) {
  const entries = await list();
  const wanted = String(slug || "").toLowerCase();
  return entries.find((e) => e.slug === wanted) || entries.find((e) => e.aliases.includes(wanted)) || null;
}

// Older ids of a re-analysed host resolve to that host's current entry.
async function byId(id) {
  const entries = await list();
  const direct = entries.find((e) => String(e.id) === String(id));
  if (direct) return direct;
  const data = await extraction(id).catch(() => null);
  return data && data.hostname ? entries.find((e) => host(e.hostname) === host(data.hostname)) || null : null;
}

async function extraction(id) {
  const key = String(id);
  const hit = entryCache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.data;
  const data = await getJson(`/tools/design-md/api/extractions/${encodeURIComponent(key)}`);
  if (data.screenshotUrl && data.screenshotUrl.startsWith("/")) data.screenshotUrl = `${BASE}${data.screenshotUrl}`;
  data.logoProxyUrl = data.logoUrl ? `${BASE}/tools/design-md/api/logos/${data.id}` : null;
  entryCache.set(key, { at: Date.now(), data });
  return data;
}

const pathFor = (entry) => `/tools/design-md/analysis/${entry.slug}`;

module.exports = { list, bySlug, byId, extraction, pathFor, BASE };
