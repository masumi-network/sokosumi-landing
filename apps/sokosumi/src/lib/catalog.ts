// Server-side live catalog from the Sokosumi Core API.
// Fetched on the server with Next ISR caching (revalidate), so every page is
// server-rendered with live data — no client-only fetching, good for SEO.
//
// Config via env (never hardcode the key):
//   SOKOSUMI_CORE_URL  default: mainnet preview
//   SOKOSUMI_CORE_KEY  Bearer token (required for live data)
import "server-only";

const CORE_URL =
  process.env.SOKOSUMI_CORE_URL ||
  "https://sokosumi-core-mainnet-7w905wrs2.preview.sokosumi.com";
const CORE_KEY = process.env.SOKOSUMI_CORE_KEY || "";
const REVALIDATE = Number(process.env.CATALOG_REVALIDATE) || 600; // seconds

export interface Coworker {
  id: string;
  name: string;
  slug: string;
  role: string;
  company: string;
  companyLogo: string | null;
  image: string | null;
  description: string;
  capabilities: string[];
}

export interface AgentCategory {
  name: string;
  slug: string;
  color: string | null;
  priority: number;
}

export interface Agent {
  id: string;
  /** Human-readable URL slug derived from the name (unique across the catalog). */
  slug: string;
  name: string;
  image: string | null;
  icon: string | null;
  credits: number | null;
  summary: string;
  description: string;
  rating: number | null;
  ratingCount: number;
  runs: number;
  author: string;
  legal: { privacy: string | null; terms: string | null } | null;
  categories: AgentCategory[];
}

export interface Catalog {
  fetchedAt: string | null;
  coworkers: Coworker[];
  agents: Agent[];
  categories: (AgentCategory & { count: number })[];
}

const EMPTY: Catalog = { fetchedAt: null, coworkers: [], agents: [], categories: [] };

async function coreGet<T>(p: string): Promise<T> {
  const res = await fetch(CORE_URL + p, {
    headers: { Authorization: `Bearer ${CORE_KEY}` },
    next: { revalidate: REVALIDATE, tags: ["catalog"] },
  });
  if (!res.ok) throw new Error(`${p} → HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function transform(coworkersRaw: any[], agentsRaw: any[]): Catalog {
  const coworkers: Coworker[] = (coworkersRaw || [])
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

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "agent";
  const seenSlugs = new Set<string>();

  const agents: Agent[] = (agentsRaw || []).map((a) => ({
    id: a.id,
    slug: "", // filled below once all names are known
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
    categories: (a.categories || []).map((cat: any) => ({
      name: cat.name,
      slug: cat.slug,
      color: cat.styles?.light?.color || null,
      priority: cat.priority ?? 99,
    })),
  }));

  // Readable, stable, unique slugs: slugified name, id-suffixed on collision.
  for (const a of agents) {
    let s = slugify(a.name);
    if (seenSlugs.has(s)) s = `${s}-${a.id.slice(-4)}`;
    seenSlugs.add(s);
    a.slug = s;
  }

  // Many agents share a single generic default thumbnail (a flat red swirl).
  // Null those out so the UI renders an on-brand gradient instead — keep only
  // images that are genuinely distinct generative art.
  const imgFreq = new Map<string, number>();
  for (const a of agents) if (a.image) imgFreq.set(a.image, (imgFreq.get(a.image) || 0) + 1);
  for (const a of agents) if (a.image && (imgFreq.get(a.image) || 0) >= 3) a.image = null;

  const catMap = new Map<string, AgentCategory & { count: number }>();
  for (const a of agents) {
    for (const cat of a.categories) {
      const e = catMap.get(cat.slug) || { ...cat, count: 0 };
      e.count++;
      if (!e.color && cat.color) e.color = cat.color;
      catMap.set(cat.slug, e);
    }
  }
  const categories = Array.from(catMap.values()).sort(
    (a, b) => a.priority - b.priority || b.count - a.count,
  );

  return { fetchedAt: new Date().toISOString(), coworkers, agents, categories };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** The full catalog. Returns empty (never throws) if the key is missing or Core is down. */
export async function getCatalog(): Promise<Catalog> {
  if (!CORE_KEY) return EMPTY;
  try {
    const [cw, ag] = await Promise.all([
      coreGet<{ data: any[] }>("/v1/coworkers?scope=all"),
      coreGet<{ data: any[] }>("/v1/agents?limit=100"),
    ]);
    return transform(cw.data, ag.data);
  } catch (e) {
    console.error("[catalog] fetch failed:", (e as Error).message);
    return EMPTY;
  }
}

/** Look up an agent by slug (canonical) or id (legacy links). */
export async function getAgent(slugOrId: string): Promise<Agent | undefined> {
  const { agents } = await getCatalog();
  return agents.find((a) => a.slug === slugOrId) ?? agents.find((a) => a.id === slugOrId);
}

export async function getCoworker(slug: string): Promise<Coworker | undefined> {
  const { coworkers } = await getCatalog();
  return coworkers.find((c) => c.slug === slug);
}
