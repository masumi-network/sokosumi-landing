import type { RouteKey, Locale } from "@/lib/routes";

/** Short link labels for navigation and the footer, per locale. */
export const NAV_LABEL: Partial<Record<RouteKey, Record<Locale, string>>> = {
  serviceplanAi: { en: "About Serviceplan AI", de: "Über Serviceplan KI" },
  aiMarketingAgency: { en: "AI marketing agency", de: "KI-Marketing-Agentur" },
  aiVisibility: { en: "AI visibility analysis", de: "KI-Sichtbarkeit" },
  competitiveAnalysis: { en: "Competitive analysis", de: "Wettbewerbsanalyse" },
  marketAnalysis: { en: "Market analysis", de: "Marktanalyse" },
  audienceInsights: { en: "Audience insights", de: "Zielgruppenanalyse" },
  freeAnalysis: {
    en: "Free competitive analysis",
    de: "Kostenlose Wettbewerbsanalyse",
  },
  vsChatgpt: { en: "Compared to ChatGPT", de: "Vergleich mit ChatGPT" },
  agents: { en: "All agents", de: "Alle Agents" },
  agentHannah: { en: "Hannah", de: "Hannah" },
  agentElena: { en: "Elena", de: "Elena" },
  agentAlex: { en: "Alex", de: "Alex" },
};

export const FOOTER_PRODUCT: RouteKey[] = [
  "serviceplanAi",
  "agents",
  "agentHannah",
  "agentElena",
  "agentAlex",
];

export const FOOTER_RESOURCES: RouteKey[] = [
  "freeAnalysis",
  "competitiveAnalysis",
  "marketAnalysis",
  "audienceInsights",
  "aiVisibility",
  "aiMarketingAgency",
  "vsChatgpt",
];
