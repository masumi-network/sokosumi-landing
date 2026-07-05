import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { READY_TASKS } from "@/data/tasks";

const SITE = "https://www.sokosumi.com";
export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { agents, coworkers, categories } = await getCatalog();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/marketplace`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/tasks`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/coworkers`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/agentic-coworkers`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/agentic-solutions`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/ai-solutions`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/press`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/terms-of-service`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/cookie-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/imprint`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/acceptable-use`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const agentRoutes: MetadataRoute.Sitemap = agents.map((a) => ({
    url: `${SITE}/agents/${a.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const coworkerRoutes: MetadataRoute.Sitemap = coworkers.map((c) => ({
    url: `${SITE}/coworkers/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE}/categories/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const taskRoutes: MetadataRoute.Sitemap = READY_TASKS.map((t) => ({
    url: `${SITE}/tasks/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...agentRoutes, ...coworkerRoutes, ...categoryRoutes, ...taskRoutes];
}
