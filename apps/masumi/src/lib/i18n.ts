// masumi had no i18n at all until 2026-09-01, but every Payload collection has
// been localized (en/de) for months and 22 of 22 posts plus all 16 glossary
// terms are genuinely translated. The German content existed; there were just
// no German URLs to serve it on. This module is that layer.

export const LOCALES = ["en", "de"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(v: string | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

// German pages live under /de/*; English keeps the bare paths so no existing
// URL moves and nothing already indexed 301s.
export function localePath(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  return locale === DEFAULT_LOCALE ? clean || "/" : `/de${clean}`;
}

// Relative alternates so they resolve against metadataBase and can't drift the
// way the hardcoded sitemap host did.
export function alternates(path: string) {
  return {
    canonical: localePath(DEFAULT_LOCALE, path),
    languages: {
      en: localePath("en", path),
      de: localePath("de", path),
      "x-default": localePath("en", path),
    },
  };
}

export function alternatesFor(locale: Locale, path: string) {
  return { ...alternates(path), canonical: localePath(locale, path) };
}

// Accept-Language, quality-weighted. "de-AT,de;q=0.9,en;q=0.8" -> de.
export function preferredLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.trim().toLowerCase(), q: q ? parseFloat(q.split("=")[1]) || 0 : 1 };
    })
    .filter((r) => r.tag)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (base === "de") return "de";
    if (base === "en") return "en";
  }
  return DEFAULT_LOCALE;
}

// Chrome that lives in the page templates rather than the CMS: headings,
// labels, empty states. CMS body content is already localized per collection,
// so this table stays small on purpose.
const UI = {
  glossaryEyebrow: { en: "Glossary", de: "Glossar" },
  glossaryH1: { en: "The agent economy, defined", de: "Die Agent Economy, definiert" },
  glossaryLede: {
    en: "Plain-English definitions of the protocols and concepts behind agent-to-agent payments.",
    de: "Verständliche Definitionen der Protokolle und Konzepte hinter Zahlungen zwischen Agents.",
  },
  glossaryTitle: {
    en: "Agentic Payments Glossary — AI Agent Economy Terms Explained",
    de: "Glossar: Agentic Payments — Begriffe der AI Agent Economy erklärt",
  },
  glossaryDescription: {
    en: "Plain-English definitions of the terms behind the AI agent economy: x402, A2A, AP2, escrow smart contracts, agent registries, DIDs, and more.",
    de: "Verständliche Definitionen der Begriffe hinter der AI Agent Economy: x402, A2A, AP2, Escrow Smart Contracts, Agent Registries, DIDs und mehr.",
  },
  readDefinition: { en: "Read definition →", de: "Definition lesen →" },
  noTerms: { en: "No terms published yet.", de: "Noch keine Begriffe veröffentlicht." },
  relatedTerms: { en: "Related terms", de: "Verwandte Begriffe" },
  backToGlossary: { en: "← All terms", de: "← Alle Begriffe" },
  // Shown when a visitor lands on the locale their browser did not ask for.
  switchToDe: { en: "Diese Seite auf Deutsch lesen", de: "Diese Seite auf Deutsch lesen" },
  switchToEn: { en: "Read this page in English", de: "Read this page in English" },
} as const;

export type UiKey = keyof typeof UI;

export function ui(locale: Locale) {
  return (key: UiKey): string => UI[key][locale] || UI[key].en;
}

const UI2 = {
  whatIs: { en: "What is {term}?", de: "Was ist {term}?" },
  glossarySuffix: { en: "Agentic Payments Glossary", de: "Glossar: Agentic Payments" },
  ctaHeading: { en: "Build on Masumi", de: "Auf Masumi entwickeln" },
  ctaBody: {
    en: "Payments, identity, and discovery for AI agents — live on Cardano.",
    de: "Zahlungen, Identität und Discovery für AI Agents — live auf Cardano.",
  },
  ctaButton: { en: "Read the docs", de: "Zur Dokumentation" },
  termNotFound: { en: "Term Not Found", de: "Begriff nicht gefunden" },
} as const;

export type Ui2Key = keyof typeof UI2;

export function ui2(locale: Locale) {
  return (key: Ui2Key, vars?: Record<string, string>): string => {
    const raw = UI2[key][locale] || UI2[key].en;
    return vars ? raw.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m) : raw;
  };
}

const UI3 = {
  blogTitle: { en: "Blog", de: "Blog" },
  blogMetaTitle: { en: "Blog", de: "Blog" },
  blogDescription: {
    en: "News, technical deep-dives, and product updates from the Masumi team. The payment network for AI agents.",
    de: "News, technische Analysen und Produkt-Updates vom Masumi-Team. Das Zahlungsnetzwerk für AI Agents.",
  },
  blogLede: {
    en: "Updates, guides, and ideas from the team.",
    de: "Updates, Anleitungen und Überlegungen aus dem Team.",
  },
  all: { en: "All", de: "Alle" },
  catAnnouncements: { en: "Announcements", de: "Ankündigungen" },
  catArticles: { en: "Articles", de: "Artikel" },
  catPressReleases: { en: "Press Releases", de: "Pressemitteilungen" },
  noPosts: { en: "No posts in this category yet.", de: "In dieser Kategorie gibt es noch keine Beiträge." },
} as const;

export type Ui3Key = keyof typeof UI3;

export function ui3(locale: Locale) {
  return (key: Ui3Key): string => UI3[key][locale] || UI3[key].en;
}

// Dates render in the reader's convention: "Sep 1, 2026" vs "1. Sept. 2026".
export function formatDate(locale: Locale, date: string | Date): string {
  return new Date(date).toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const UI4 = {
  backToBlog: { en: "Back to Blog", de: "Zurück zum Blog" },
  postNotFound: { en: "Post Not Found", de: "Beitrag nicht gefunden" },
} as const;

export function ui4(locale: Locale) {
  return (key: keyof typeof UI4): string => UI4[key][locale] || UI4[key].en;
}

export function formatLongDate(locale: Locale, date: string | Date): string {
  return new Date(date).toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
