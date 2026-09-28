// Saved DESIGN.md analyses (the masumi archive) addressed by brand slug, so
// every analysis gets a stable, indexable URL on sokosumi.com:
//   /tools/design-md/analysis/linear   (linear.app)
// The slug is the hostname minus www. and its last label when that stays
// unique across the archive; otherwise the whole hostname, hyphenated.

const BASE = (process.env.MASUMI_DESIGN_MD_API_BASE || "https://www.masumi.network").replace(/\/+$/, "");
const TTL = 5 * 60 * 1000;

// Anyone can feed a URL into the generator, so the archive fills with sites
// nobody searches for — and with sites people search for in the WRONG way:
// by Sept 2026, 42% of the site's search impressions were analysis pages
// ranking for piracy-site brand names (cinejoy.to, apk2me, shinigami) at
// ~0.3% CTR. Hundreds of thin pages ranking for unrelated brands is the
// exact footprint Google's scaled-content policies punish sitewide, so
// indexation is opt-in: only the hosts below keep an indexable page. Every
// other analysis still renders and works — it just carries noindex.
// Add a host here when its "<brand> design md" query is one we want.
//
// 2026-09-27: cut from ~150 hosts to 30. The analysis pages drew designers and
// developers searching brand names, not the marketing teams Sokosumi sells
// to, and 150 thin brand pages made the site read as a design-tools site. What
// stays: brands with measured "<brand> design md" searches in GSC (linear,
// shadcn, duolingo, apple, cloudflare, shopify, notion, airbnb), brands a
// marketing team studies as a reference, and our own two sites.
const INDEXED_HOSTS = new Set([
  "linear.app", "notion.so", "stripe.com", "figma.com", "shopify.com",
  "cloudflare.com", "shadcn.io", "apple.com", "airbnb.it", "duolingo.com",
  "spotify.com", "samsung.com", "mercedes-benz.com", "porsche.com",
  "redbull.com", "patagonia.com", "klarna.com", "wise.com", "mailchimp.com",
  "linkedin.com", "instagram.com", "youtube.com", "openai.com", "chatgpt.com",
  "anthropic.com", "perplexity.ai", "pwc.com", "kpmg.com",
  "sokosumi.com", "masumi.network",
]);

// Piracy mirrors, porn, follower panels and "private profile viewers" run
// themselves through the generator to get a page about their brand on a
// clean domain. Those don't get noindex — they get 410 and vanish from the
// gallery, the related lists and the archive API entirely.
const BLOCKED_HOSTS = new Set([
  "cinejoy.to", "cinehd.app", "z2.idlixku.com", "g.shinigami.asia",
  "mobomovies.net", "jut-su.net", "moviebox.pk", "ppv.st", "apk2me.com",
  "gplvault.com", "unsmm.com", "numberpanel.tech", "spideytracker.net",
  "stalkr.ai", "wankzvr.com", "voyeurverite.com", "fapify.com",
  "1xlite-11151.pro", "olymptrade-ae.com", "x444storez.syncxs.xyz",
  "hack.redlimit.id",
]);

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
  const entries = assignSlugs(raw.filter((e) => e && e.hostname && !BLOCKED_HOSTS.has(host(e.hostname)) && !seen.has(host(e.hostname)) && seen.add(host(e.hostname))));
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

const indexable = (entry) => INDEXED_HOSTS.has(host(entry.hostname));

// Blocked entries never make it into list(), so their slugs can't be looked
// up there. Both slug forms of every blocked host answer here instead, so
// the route can send 410 rather than a soft 404.
const goneSlugs = new Set([...BLOCKED_HOSTS].flatMap((h) => [hyphen(h), hyphen(shortHost(h))]));
const isGone = (slug) => goneSlugs.has(String(slug || "").toLowerCase());

module.exports = { list, bySlug, byId, extraction, pathFor, indexable, isGone, BASE };
