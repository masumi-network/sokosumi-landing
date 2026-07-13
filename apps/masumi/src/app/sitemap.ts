import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllTerms } from "@/lib/glossary";
import { cmsFetch } from "@/lib/cms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://masumi.network";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/tools/design-md`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/x402-cardano`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/blogs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/imprint`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/press`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
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

  return [...staticRoutes, ...blogRoutes, ...glossaryRoutes, ...pageRoutes];
}
