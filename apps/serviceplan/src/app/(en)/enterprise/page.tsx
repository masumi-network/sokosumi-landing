import type { Metadata } from "next";
import { absolute } from "@/lib/seo";
import LpPage from "@/components/lp/LpPage";
import { enterpriseEn } from "@/components/lp/content-enterprise";
import "@/components/lp/lp.css";

/* Ads landing page "For enterprises" (English). noindex: built for campaign
   traffic, no sitemap entry; hreflang links DE and EN. */

export const metadata: Metadata = {
  title: "AI Coworkers for Marketing Teams | Serviceplan Agents",
  description:
    "Campaign plans, market analyses, presentations, interactive dashboards for small marketing teams. Brief by email. Book a demo with your own example.",
  alternates: {
    canonical: absolute("/enterprise"),
    languages: {
      de: absolute("/de/enterprise"),
      en: absolute("/enterprise"),
      "x-default": absolute("/enterprise"),
    },
  },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LpPage content={enterpriseEn} />;
}
