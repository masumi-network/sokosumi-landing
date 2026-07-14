import { cmsFetch, isDraftModeEnabled } from "./cms";

export type GlossaryTerm = {
  term: string;
  slug: string;
  shortDefinition: string;
  definitionHtml?: string;
  related?: { term: string; slug: string }[] | number[];
};

export async function getAllTerms(): Promise<GlossaryTerm[]> {
  const res = await cmsFetch<{ docs: GlossaryTerm[] }>(
    "/glossary?where[site][equals]=masumi&limit=200&sort=term&depth=0",
  );
  return res?.docs ?? [];
}

export async function getTermBySlug(slug: string): Promise<GlossaryTerm | null> {
  const res = await cmsFetch<{ docs: GlossaryTerm[] }>(
    `/glossary?where[slug][equals]=${encodeURIComponent(slug)}&where[site][equals]=masumi&limit=1&depth=1`,
    { draft: await isDraftModeEnabled() },
  );
  return res?.docs?.[0] ?? null;
}

export function relatedTerms(term: GlossaryTerm): { term: string; slug: string }[] {
  if (!Array.isArray(term.related)) return [];
  return term.related.filter(
    (r): r is { term: string; slug: string } => typeof r === "object" && !!r?.slug,
  );
}
