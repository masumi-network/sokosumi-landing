import { cmsFetch } from "./cms";
import type { PageBlock } from "@/components/CmsBlocks";

// Loaders for the programmatic-SEO content collections: use cases, guides,
// releases, and competitor comparisons. All collections are drafted in the
// CMS; the public API only returns published docs. `industries` and
// `use-case-categories` are shared taxonomies (no `site` field) — everything
// else is filtered to site=masumi.

const SITE = "&where[site][equals]=masumi";

type Rel<T> = T | string | number;

function populated<T extends object>(rels: Rel<T>[] | undefined | null): T[] {
  return (rels ?? []).filter((r): r is T => typeof r === "object" && r !== null);
}

// --- Use cases -------------------------------------------------------------

export type Industry = {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
};

export type UseCaseCategory = {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
};

export type UseCase = {
  title: string;
  slug: string;
  description: string;
  industries?: Rel<Industry>[];
  categories?: Rel<UseCaseCategory>[];
  relatedAgents?: { agentSlug: string }[];
  layout: PageBlock[];
  updatedAt?: string;
};

export function industriesOf(uc: UseCase): Industry[] {
  return populated(uc.industries);
}

export function categoriesOf(uc: UseCase): UseCaseCategory[] {
  return populated(uc.categories);
}

export async function getAllUseCases(): Promise<UseCase[]> {
  const res = await cmsFetch<{ docs: UseCase[] }>(
    `/use-cases?limit=200&depth=1&sort=title${SITE}`,
  );
  return res?.docs ?? [];
}

export async function getUseCaseBySlug(slug: string): Promise<UseCase | null> {
  const res = await cmsFetch<{ docs: UseCase[] }>(
    `/use-cases?where[slug][equals]=${encodeURIComponent(slug)}${SITE}&limit=1&depth=1`,
  );
  return res?.docs?.[0] ?? null;
}

export async function getUseCasesByIndustry(
  industryId: string | number,
): Promise<UseCase[]> {
  const res = await cmsFetch<{ docs: UseCase[] }>(
    `/use-cases?where[industries][in]=${encodeURIComponent(String(industryId))}${SITE}&limit=200&depth=1&sort=title`,
  );
  return res?.docs ?? [];
}

export async function getAllIndustries(): Promise<Industry[]> {
  const res = await cmsFetch<{ docs: Industry[] }>("/industries?limit=200&sort=name");
  return res?.docs ?? [];
}

export async function getIndustryBySlug(slug: string): Promise<Industry | null> {
  const res = await cmsFetch<{ docs: Industry[] }>(
    `/industries?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
  );
  return res?.docs?.[0] ?? null;
}

export async function getAllUseCaseCategories(): Promise<UseCaseCategory[]> {
  const res = await cmsFetch<{ docs: UseCaseCategory[] }>(
    "/use-case-categories?limit=200&sort=name",
  );
  return res?.docs ?? [];
}

// --- Guides ----------------------------------------------------------------

export const GUIDE_CATEGORIES = [
  "getting-started",
  "integrations",
  "workflows",
  "advanced",
] as const;

export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

export const GUIDE_CATEGORY_LABELS: Record<GuideCategory, string> = {
  "getting-started": "Getting started",
  integrations: "Integrations",
  workflows: "Workflows",
  advanced: "Advanced",
};

export type Guide = {
  title: string;
  slug: string;
  description: string;
  category: GuideCategory;
  order?: number;
  contentHtml?: string;
  related?: Rel<{ title: string; slug: string; description?: string }>[];
  updatedAt?: string;
};

export function relatedGuides(g: Guide): { title: string; slug: string }[] {
  return populated(g.related);
}

export async function getAllGuides(): Promise<Guide[]> {
  const res = await cmsFetch<{ docs: Guide[] }>(
    `/guides?limit=200&depth=1&sort=order${SITE}`,
  );
  return res?.docs ?? [];
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const res = await cmsFetch<{ docs: Guide[] }>(
    `/guides?where[slug][equals]=${encodeURIComponent(slug)}${SITE}&limit=1&depth=1`,
  );
  return res?.docs?.[0] ?? null;
}

// --- Releases ----------------------------------------------------------------

export type HighlightTag = "new" | "improved" | "fixed";

export const TAG_COLORS: Record<HighlightTag, string> = {
  new: "#FA008C",
  improved: "#FF6400",
  fixed: "#460A23",
};

export const TAG_LABELS: Record<HighlightTag, string> = {
  new: "New",
  improved: "Improved",
  fixed: "Fixed",
};

export type Release = {
  title: string;
  slug: string;
  description: string;
  version?: string;
  date: string;
  highlights?: { tag: HighlightTag; text: string }[];
  contentHtml?: string;
  updatedAt?: string;
};

export async function getAllReleases(): Promise<Release[]> {
  const res = await cmsFetch<{ docs: Release[] }>(
    `/releases?limit=200&sort=-date${SITE}`,
  );
  return res?.docs ?? [];
}

export async function getReleaseBySlug(slug: string): Promise<Release | null> {
  const res = await cmsFetch<{ docs: Release[] }>(
    `/releases?where[slug][equals]=${encodeURIComponent(slug)}${SITE}&limit=1`,
  );
  return res?.docs?.[0] ?? null;
}

// --- Comparisons -------------------------------------------------------------

export type Comparison = {
  title: string;
  slug: string;
  description: string;
  competitor: string;
  competitorLogo?: { url?: string; alt?: string } | string | number | null;
  layout: PageBlock[];
  updatedAt?: string;
};

export function comparisonLogo(c: Comparison): { url?: string; alt?: string } | null {
  return typeof c.competitorLogo === "object" && c.competitorLogo !== null
    ? c.competitorLogo
    : null;
}

export async function getAllComparisons(): Promise<Comparison[]> {
  const res = await cmsFetch<{ docs: Comparison[] }>(
    `/comparisons?limit=200&depth=1&sort=competitor${SITE}`,
  );
  return res?.docs ?? [];
}

export async function getComparisonBySlug(slug: string): Promise<Comparison | null> {
  const res = await cmsFetch<{ docs: Comparison[] }>(
    `/comparisons?where[slug][equals]=${encodeURIComponent(slug)}${SITE}&limit=1&depth=1`,
  );
  return res?.docs?.[0] ?? null;
}
