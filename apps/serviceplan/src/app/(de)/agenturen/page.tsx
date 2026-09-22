import type { Metadata } from "next";
import AgenturenPage from "@/components/agenturen/AgenturenPage";
import "./agenturen.css";

/* Meta-Ads-Landingpage "Für Agenturen" (deutsch, ohne EN-Zwilling).
   noindex: Die Seite ist für Kampagnen-Traffic gebaut und hängt nicht im
   SEO-Gefüge der Website (kein Sitemap-Eintrag, keine hreflang-Alternates). */

export const metadata: Metadata = {
  title: "AI-Coworker für Agenturen | Serviceplan Agents",
  description:
    "Recherche, Analysen, Reportings, interaktive Dashboards. Beauftragung per E-Mail, kein Prompt, keine Einarbeitung. Kostenlos starten mit 200 Credits im Monat.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AgenturenPage />;
}
