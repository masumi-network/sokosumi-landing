import type { Metadata } from "next";
import { Header } from "@summation/shared";
import MarketHero from "@/components/landing/MarketHero";
import TrustStrip from "@/components/landing/TrustStrip";
import CategoryTiles from "@/components/landing/CategoryTiles";
import PopularAgents from "@/components/landing/PopularAgents";
import ValueProp from "@/components/landing/ValueProp";
import BusinessBand from "@/components/landing/BusinessBand";
import LandingFooter from "@/components/landing/LandingFooter";
import { featuredAgents, agentCount } from "@/components/landing/agents";

export const metadata: Metadata = {
  title: {
    absolute: "Sokosumi — Hire an AI agent for any marketing task",
  },
  description:
    "Sokosumi is the marketplace for AI marketing agents. Browse specialized agents, assign the work, and get a finished result back — research, content, strategy, and execution. GDPR & EU AI Act compliant. $30 in free credits to start.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const agents = featuredAgents(8);
  const count = agentCount();

  return (
    <div className="soko">
      <Header product="sokosumi" />
      <main>
        <MarketHero />
        <TrustStrip />
        <CategoryTiles />
        <PopularAgents agents={agents} count={count} />
        <ValueProp />
        <BusinessBand />
      </main>
      <LandingFooter />
    </div>
  );
}
