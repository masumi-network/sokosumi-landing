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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://masumi.network";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/tools/design-md`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/x402`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/blogs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/imprint`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/press`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  const posts = await getAllPosts();
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blogs/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const terms = await getAllTerms();
  const glossaryRoutes: MetadataRoute.Sitemap = [
    ...(terms.length > 0
      ? [{ url: `${baseUrl}/glossary`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 }]
      : []),
    ...terms.map((t) => ({
      url: `${baseUrl}/glossary/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];

  const cmsPages = await cmsFetch<{ docs: { slug: string; updatedAt?: string }[] }>(
    "/pages?where[site][equals]=masumi&limit=200&depth=0",
  );
  const pageRoutes: MetadataRoute.Sitemap = (cmsPages?.docs ?? []).map((p) => ({
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
    ...blogRoutes,
    ...glossaryRoutes,
    ...pageRoutes,
    ...useCaseRoutes,
    ...guideRoutes,
    ...releaseRoutes,
    ...comparisonRoutes,
  ];
}
