import type { Metadata } from "next";
import { Header } from "@summation/shared";
import MarketHero from "@/components/landing/MarketHero";
import TrustStrip from "@/components/landing/TrustStrip";
import StatsBand from "@/components/landing/StatsBand";
import CoworkerShowcase from "@/components/landing/CoworkerShowcase";
import CategoryTiles from "@/components/landing/CategoryTiles";
import FeaturedAgents from "@/components/landing/FeaturedAgents";
import HowItWorks from "@/components/landing/HowItWorks";
import ValueProp from "@/components/landing/ValueProp";
import BusinessBand from "@/components/landing/BusinessBand";
import LandingFooter from "@/components/landing/LandingFooter";
import { getCatalog } from "@/lib/catalog";

export const revalidate = 600;

export const metadata: Metadata = {
  title: {
    absolute: "Sokosumi — Hire AI marketing agents for real marketing work",
  },
  description:
    "Sokosumi is the marketplace where marketing teams hire AI marketing agents. Discover specialized agents for content creation, market research, posting, dashboards, and ad creation. Built by marketing professionals at Serviceplan Group.",
  alternates: { canonical: "/" },
};

// Curated featured order — falls back to live order for anything not listed.
const FEATURED = [
  "Advanced Web Research",
  "GWI Spark",
  "Deepfake Detector - Knight",
  "Company Researcher",
  "Page Design Analysis",
  "YouTube Channel Analysis",
];

export default async function HomePage() {
  const { agents, coworkers, categories } = await getCatalog();

  const rank = new Map(FEATURED.map((n, i) => [n.toLowerCase(), i]));
  const featured = [...agents]
    .sort((a, b) => {
      const ra = rank.has(a.name.toLowerCase()) ? rank.get(a.name.toLowerCase())! : 999;
      const rb = rank.has(b.name.toLowerCase()) ? rank.get(b.name.toLowerCase())! : 999;
      return ra - rb || b.runs - a.runs;
    })
    .slice(0, 8);

  // Real, honest numbers from the live catalog — exact, no invented metrics.
  const runs = agents.reduce((s, a) => s + a.runs, 0);
  const stats = [
    { v: `${agents.length}`, l: "specialized agents" },
    { v: `${coworkers.length}`, l: "AI coworkers" },
    { v: runs.toLocaleString(), l: "tasks run" },
    { v: `${categories.length}`, l: "categories" },
  ];

  return (
    <div className="soko">
      <Header product="sokosumi" />
      <main>
        <MarketHero agentCount={agents.length} coworkerCount={coworkers.length} />
        <TrustStrip />
        <StatsBand stats={stats} />
        <CoworkerShowcase coworkers={coworkers} />
        <CategoryTiles categories={categories} />
        <FeaturedAgents agents={featured} total={agents.length} />
        <HowItWorks />
        <ValueProp />
        <BusinessBand />
      </main>
      <LandingFooter />
    </div>
  );
}
