import type { Metadata } from "next";
import LpPage from "@/components/lp/LpPage";
import { enterpriseEn } from "@/components/lp/content-enterprise";
import "@/components/lp/lp.css";

/* Ads landing page "For enterprises" (English). noindex: built for campaign
   traffic, no sitemap entry, no hreflang alternates. */

export const metadata: Metadata = {
  title: "AI Coworkers for Marketing Teams | Serviceplan Agents",
  description:
    "Research, analyses, reports, interactive dashboards for your marketing team. Brief by email. Start free with 200 credits a month.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LpPage content={enterpriseEn} />;
}
