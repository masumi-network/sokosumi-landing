import type { Metadata } from "next";
import LpPage from "@/components/lp/LpPage";
import { agenciesEn } from "@/components/lp/content-agencies";
import "@/components/lp/lp.css";

/* Ads landing page "For agencies" (English). noindex: built for campaign
   traffic, no sitemap entry, no hreflang alternates. */

export const metadata: Metadata = {
  title: "AI Coworkers for Agencies | Serviceplan Agents",
  description:
    "Research, analyses, reports, interactive dashboards. Brief by email — no prompts, no onboarding. Start free with 200 credits a month.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LpPage content={agenciesEn} />;
}
