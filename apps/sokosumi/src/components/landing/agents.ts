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
];

export function featuredAgents(): Agent[] {
  const all = loadAgents();
  const bySlug = new Map(all.map((a) => [a.slug, a]));
  const picked = FEATURED_SLUGS.map((s) => bySlug.get(s)).filter(
    (a): a is Agent => Boolean(a)
  );
  for (const a of all) {
    if (picked.length >= 6) break;
    if (a.isVerified && !picked.includes(a)) picked.push(a);
  }
  return picked.slice(0, 6);
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

export function agentCount(): number {
  return loadAgents().length;
}
