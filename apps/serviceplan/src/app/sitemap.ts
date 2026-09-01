import type { MetadataRoute } from "next";
import { ROUTES, ROUTE_KEYS } from "@/lib/routes";
import { absolute } from "@/lib/seo";

const PRIORITY: Partial<Record<string, number>> = {
  home: 1,
  serviceplanAi: 0.9,
  freeAnalysis: 0.9,
  competitiveAnalysis: 0.8,
  marketAnalysis: 0.8,
  audienceInsights: 0.8,
  aiVisibility: 0.8,
  aiMarketingAgency: 0.8,
  vsChatgpt: 0.7,
  demo: 0.7,
  agents: 0.6,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTE_KEYS.flatMap((key) =>
    (["en", "de"] as const).map((locale) => ({
      url: absolute(ROUTES[key][locale]),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: PRIORITY[key] ?? 0.5,
      alternates: {
        languages: {
          en: absolute(ROUTES[key].en),
          de: absolute(ROUTES[key].de),
        },
      },
    }))
  );
}
