import type { Metadata } from "next";
import { absolute } from "@/lib/seo";
import LpPage from "@/components/lp/LpPage";
import { enterpriseDe } from "@/components/lp/content-enterprise";
import "@/components/lp/lp.css";

/* Ads-Landingpage "Für Unternehmen" (deutsch). noindex: für
   Kampagnen-Traffic gebaut, kein Sitemap-Eintrag; hreflang verknüpft DE und EN. */

export const metadata: Metadata = {
  title: "AI-Coworker für Marketing-Teams | Serviceplan Agents",
  description:
    "Kampagnenplanung, Marktanalysen, Präsentationen, interaktive Dashboards für kleine Marketing-Teams. Beauftragung per E-Mail. Demo-Termin an Ihrem eigenen Beispiel.",
  alternates: {
    canonical: absolute("/de/enterprise"),
    languages: {
      de: absolute("/de/enterprise"),
      en: absolute("/enterprise"),
      "x-default": absolute("/enterprise"),
    },
  },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LpPage content={enterpriseDe} />;
}
