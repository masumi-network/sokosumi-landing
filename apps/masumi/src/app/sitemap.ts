import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllTerms } from "@/lib/glossary";
import { cmsFetch } from "@/lib/cms";
import {
  getAllUseCases,
  getAllGuides,
  getAllReleases,
  getAllComparisons,
  industriesOf,
} from "@/lib/content";
import { localePath, type Locale } from "@/lib/i18n";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // www, matching metadataBase in layout.tsx and the host the site actually
  // serves on. This said "https://masumi.network" until 2026-09-01, so every
  // one of the 45 URLs Google was handed 301'd to its www twin — a whole
  // sitemap of redirects.
  const baseUrl = "https://www.masumi.network";

  // Routes that exist in both languages. Each entry is emitted twice, and both
  // carry the same `alternates.languages` map, which is what tells Google the
  // two URLs are translations rather than duplicates. The middleware
  // deliberately does not redirect crawlers, so both are reachable.
  const LOCALIZED_STATIC = [
    "/",
    "/x402-protocol",
    "/x402",
    "/tools/design-md",
    "/glossary",
    "/blogs",
    "/press",
    "/contact",
  ];

  const withAlternates = (path: string, locale: Locale, rest: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">) => ({
    url: `${baseUrl}${localePath(locale, path)}`,
    alternates: {
      languages: {
        en: `${baseUrl}${localePath("en", path)}`,
        de: `${baseUrl}${localePath("de", path)}`,
      },
    },
    ...rest,
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/learn`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/imprint`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const posts = await getAllPosts();
  const blogRoutes: MetadataRoute.Sitemap = posts.flatMap((post) =>
    (["en", "de"] as const).map((locale) =>
      withAlternates(`/blogs/${post.slug}`, locale, {
        lastModified: new Date(post.date),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }),
    ),
  );

  const terms = await getAllTerms();
  const glossaryRoutes: MetadataRoute.Sitemap = terms.flatMap((t) =>
    (["en", "de"] as const).map((locale) =>
      withAlternates(`/glossary/${t.slug}`, locale, {
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }),
    ),
  );

  const localizedRoutes: MetadataRoute.Sitemap = LOCALIZED_STATIC.filter(
    (p) => p !== "/glossary" || terms.length > 0,
  ).flatMap((path) =>
    (["en", "de"] as const).map((locale) =>
      withAlternates(path, locale, {
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority:
          path === "/" ? 1 : path === "/x402-protocol" || path === "/tools/design-md" ? 0.9 : path === "/x402" ? 0.8 : 0.7,
      }),
    ),
  );

  const cmsPages = await cmsFetch<{ docs: { slug: string; updatedAt?: string }[] }>(
    "/pages?where[site][equals]=masumi&limit=200&depth=0",
  );
  // Demo and scaffolding pages live in the CMS alongside real ones; they should
  // not be handed to Google. example-landing-page was in the live sitemap.
  const CMS_PAGE_DENYLIST = new Set(["example-landing-page"]);
  const pageRoutes: MetadataRoute.Sitemap = (cmsPages?.docs ?? [])
    .filter((p) => !CMS_PAGE_DENYLIST.has(p.slug))
    .map((p) => ({
    url: `${baseUrl}/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const [useCases, guides, releases, comparisons] = await Promise.all([
    getAllUseCases(),
    getAllGuides(),
    getAllReleases(),
    getAllComparisons(),
  ]);

  const industrySlugs = [
    ...new Set(
      useCases.flatMap((uc) => industriesOf(uc).map((ind) => ind.slug)),
    ),
  ];

  const useCaseRoutes: MetadataRoute.Sitemap = [
    ...(useCases.length > 0
      ? [{ url: `${baseUrl}/use-cases`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 }]
      : []),
    ...useCases.map((uc) => ({
      url: `${baseUrl}/use-cases/${uc.slug}`,
      lastModified: uc.updatedAt ? new Date(uc.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...industrySlugs.map((slug) => ({
      url: `${baseUrl}/use-cases/industries/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];

  const guideRoutes: MetadataRoute.Sitemap = [
    ...(guides.length > 0
      ? [{ url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 }]
      : []),
    ...guides.map((g) => ({
      url: `${baseUrl}/guides/${g.slug}`,
      lastModified: g.updatedAt ? new Date(g.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  const releaseRoutes: MetadataRoute.Sitemap = [
    ...(releases.length > 0
      ? [{ url: `${baseUrl}/releases`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 }]
      : []),
    ...releases.map((r) => ({
      url: `${baseUrl}/releases/${r.slug}`,
      lastModified: r.updatedAt ? new Date(r.updatedAt) : new Date(r.date),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];

  const comparisonRoutes: MetadataRoute.Sitemap = [
    ...(comparisons.length > 0
      ? [{ url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 }]
      : []),
    ...comparisons.map((c) => ({
      url: `${baseUrl}/compare/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [
    ...staticRoutes,
    ...localizedRoutes,
    ...blogRoutes,
    ...glossaryRoutes,
    ...pageRoutes,
    ...useCaseRoutes,
    ...guideRoutes,
    ...releaseRoutes,
    ...comparisonRoutes,
  ];
}
