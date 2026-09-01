import { cmsFetch, isDraftModeEnabled } from "./cms";
import { DEFAULT_LOCALE, type Locale } from "./i18n";

export type GlossaryTerm = {
  term: string;
  slug: string;
  shortDefinition: string;
  definitionHtml?: string;
  related?: { term: string; slug: string }[] | number[];
};

export async function getAllTerms(locale: Locale = DEFAULT_LOCALE): Promise<GlossaryTerm[]> {
  const res = await cmsFetch<{ docs: GlossaryTerm[] }>(
    "/glossary?where[site][equals]=masumi&limit=200&sort=term&depth=0",
    { locale },
  );
  return res?.docs ?? [];
}

export async function getTermBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<GlossaryTerm | null> {
  const res = await cmsFetch<{ docs: GlossaryTerm[] }>(
    `/glossary?where[slug][equals]=${encodeURIComponent(slug)}&where[site][equals]=masumi&limit=1&depth=1`,
    { draft: await isDraftModeEnabled(), locale },
  );
  return res?.docs?.[0] ?? null;
}

export function relatedTerms(term: GlossaryTerm): { term: string; slug: string }[] {
  if (!Array.isArray(term.related)) return [];
  return term.related.filter(
    (r): r is { term: string; slug: string } => typeof r === "object" && !!r?.slug,
  );
}
