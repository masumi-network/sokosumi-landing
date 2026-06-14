import agentsData from "./agents-data.json";

export interface Agent {
  name: string;
  slug: string;
  category: string;
  thumbnail: string;
  icon: string;
  colorLight: string;
  shortDescription: string;
  credits: string;
  isVerified: boolean;
  companyName: string;
  creatorName: string;
  isNew: boolean;
  isFeatured: boolean;
  hireLink: string;
  tags: string[];
}

/** Normalize the webflow-relative "./assets/..." paths to absolute public paths. */
function abs(p: string): string {
  if (!p) return p;
  return p.replace(/^\.\//, "/");
}

let cache: Agent[] | null = null;

export function loadAgents(): Agent[] {
  if (cache) return cache;
  const raw = agentsData as Agent[];
  cache = raw.map((a) => ({
    ...a,
    thumbnail: abs(a.thumbnail),
    icon: abs(a.icon),
  }));
  return cache;
}

/** Curated showcase order — verified, recognizable, mix of categories. */
const FEATURED_SLUGS = [
  "advanced-web-research",
  "gwi-spark",
  "extended-audience-profiles",
  "statista-single-answer",
  "attention-insight",
  "page-design-analysis",
  "youtube-channel-analysis",
  "basic-company-researcher",
];

export function featuredAgents(count = 8): Agent[] {
  const all = loadAgents();
  const bySlug = new Map(all.map((a) => [a.slug, a]));
  const picked = FEATURED_SLUGS.map((s) => bySlug.get(s)).filter(
    (a): a is Agent => Boolean(a)
  );
  for (const a of all) {
    if (picked.length >= count) break;
    if (a.isVerified && !picked.includes(a)) picked.push(a);
  }
  return picked.slice(0, count);
}

const COMPANY_LABELS: Record<string, string> = {
  "serviceplan-group": "Serviceplan Group",
  gwi: "GWI",
  nmkr: "NMKR",
  "utxo-ag": "utxo AG",
  factor168: "factor168",
  "attention-insight": "Attention Insight",
  hybridai: "HybridAI",
  nuauth: "Nuauth",
};

export function prettyCompany(name: string): string {
  if (COMPANY_LABELS[name]) return COMPANY_LABELS[name];
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * PLACEHOLDER marketplace metadata (ratings, reviews, seller level, delivery).
 * Deterministically derived from the slug so it's stable across renders.
 * Swap for real platform data when available.
 */
export interface GigMeta {
  rating: string;
  reviews: number;
  level: string;
  delivery: string;
}

const LEVELS = ["Top Rated", "Pro", "Level 2", "Rising Talent"];

export function gigMeta(a: Agent): GigMeta {
  let h = 2166136261;
  for (let i = 0; i < a.slug.length; i++) {
    h ^= a.slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h = h >>> 0;
  const rating = (4.6 + (h % 5) / 10).toFixed(1); // 4.6–5.0
  const reviews = 38 + (h % 920); // 38–957
  const level = a.isVerified ? LEVELS[h % 2] : LEVELS[2 + (h % 2)];
  const delivery = ["~2 min", "~5 min", "~10 min", "instant"][h % 4];
  return { rating, reviews, level, delivery };
}

export function agentCount(): number {
  return loadAgents().length;
}
