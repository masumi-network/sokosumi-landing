import fs from "node:fs";
import path from "node:path";

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
  const file = path.join(process.cwd(), "public", "data", "agents.json");
  const raw = JSON.parse(fs.readFileSync(file, "utf-8")) as Agent[];
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
  "statista-single-answer",
  "extended-audience-profiles",
  "page-design-analysis",
  "attention-insight",
  "youtube-channel-analysis",
  "meme-creator",
];

export function featuredAgents(): Agent[] {
  const all = loadAgents();
  const bySlug = new Map(all.map((a) => [a.slug, a]));
  const picked = FEATURED_SLUGS.map((s) => bySlug.get(s)).filter(
    (a): a is Agent => Boolean(a)
  );
  // Top up from verified agents if any curated slug is missing.
  if (picked.length < 8) {
    for (const a of all) {
      if (picked.length >= 8) break;
      if (a.isVerified && !picked.includes(a)) picked.push(a);
    }
  }
  return picked.slice(0, 8);
}

export function agentCount(): number {
  return loadAgents().length;
}
