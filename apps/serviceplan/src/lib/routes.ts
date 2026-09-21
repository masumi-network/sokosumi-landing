import type { Locale } from "@/lib/translations";

export type { Locale };

export type RouteKey =
  | "home"
  | "demo"
  | "serviceplanAi"
  | "aiMarketingAgency"
  | "aiVisibility"
  | "competitiveAnalysis"
  | "marketAnalysis"
  | "audienceInsights"
  | "freeAnalysis"
  | "vsChatgpt"
  | "agents"
  | "agentHannah"
  | "agentElena"
  | "agentAlex";

/**
 * Single source of truth for every indexable URL.
 *
 * Drives the sitemap, the hreflang alternates, the language toggle and the
 * internal links between landing pages. German slugs are translated rather
 * than mirrored, so nothing here can be derived by prefixing "/de".
 */
export const ROUTES: Record<RouteKey, Record<Locale, string>> = {
  home: { en: "/", de: "/de" },
  demo: { en: "/request-a-demo", de: "/de/request-a-demo" },
  serviceplanAi: { en: "/serviceplan-ai", de: "/de/serviceplan-ki" },
  aiMarketingAgency: {
    en: "/ai-marketing-agency",
    de: "/de/ki-marketing-agentur",
  },
  aiVisibility: {
    en: "/ai-visibility-analysis",
    de: "/de/ki-sichtbarkeit",
  },
  competitiveAnalysis: {
    en: "/competitive-analysis",
    de: "/de/wettbewerbsanalyse",
  },
  marketAnalysis: { en: "/market-analysis", de: "/de/marktanalyse" },
  audienceInsights: { en: "/audience-insights", de: "/de/zielgruppenanalyse" },
  freeAnalysis: {
    en: "/free-competitive-analysis",
    de: "/de/kostenlose-wettbewerbsanalyse",
  },
  vsChatgpt: { en: "/vs/chatgpt", de: "/de/vergleich/chatgpt" },
  agents: { en: "/agents", de: "/de/agents" },
  agentHannah: { en: "/agents/hannah", de: "/de/agents/hannah" },
  agentElena: { en: "/agents/elena", de: "/de/agents/elena" },
  agentAlex: { en: "/agents/alex", de: "/de/agents/alex" },
};

export const ROUTE_KEYS = Object.keys(ROUTES) as RouteKey[];

export function routeKeyForPath(pathname: string): RouteKey | null {
  const clean = pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
  for (const key of ROUTE_KEYS) {
    if (ROUTES[key].en === clean || ROUTES[key].de === clean) return key;
  }
  return null;
}

/** The counterpart URL of `pathname` in `target`, or the target home page. */
export function alternatePath(pathname: string, target: Locale): string {
  const key = routeKeyForPath(pathname);
  return key ? ROUTES[key][target] : ROUTES.home[target];
}
