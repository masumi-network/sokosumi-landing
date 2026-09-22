import type { Metadata } from "next";
import LpPage from "@/components/lp/LpPage";
import { agenciesDe } from "@/components/lp/content-agencies";
import "@/components/lp/lp.css";

/* Meta-Ads-Landingpage "Für Agenturen" (deutsch). noindex: für
   Kampagnen-Traffic gebaut, kein Sitemap-Eintrag, keine hreflang-Alternates. */

export const metadata: Metadata = {
  title: "AI-Coworker für Agenturen | Serviceplan Agents",
  description:
    "Recherche, Analysen, Reportings, interaktive Dashboards. Beauftragung per E-Mail, kein Prompt, keine Einarbeitung. Kostenlos starten mit 200 Credits im Monat.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LpPage content={agenciesDe} />;
}
