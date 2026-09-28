import type { Metadata } from "next";
import LpPage from "@/components/lp/LpPage";
import { enterpriseDe } from "@/components/lp/content-enterprise";
import "@/components/lp/lp.css";

/* Ads-Landingpage "Für Unternehmen" (deutsch). noindex: für
   Kampagnen-Traffic gebaut, kein Sitemap-Eintrag, keine hreflang-Alternates. */

export const metadata: Metadata = {
  title: "AI-Coworker für Marketing-Teams | Serviceplan Agents",
  description:
    "Recherche, Analysen, Reportings, interaktive Dashboards für Ihr Marketing-Team. Beauftragung per E-Mail. Kostenlos starten mit 200 Credits im Monat.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LpPage content={enterpriseDe} />;
}
