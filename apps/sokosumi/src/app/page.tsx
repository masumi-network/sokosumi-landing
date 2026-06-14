import type { Metadata } from "next";
import { Header } from "@summation/shared";
import MarketHero from "@/components/landing/MarketHero";
import TrustStrip from "@/components/landing/TrustStrip";
import StatsBand from "@/components/landing/StatsBand";
import CategoryTiles from "@/components/landing/CategoryTiles";
import PopularAgents from "@/components/landing/PopularAgents";
import HowItWorks from "@/components/landing/HowItWorks";
import ValueProp from "@/components/landing/ValueProp";
import Testimonials from "@/components/landing/Testimonials";
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
        <StatsBand />
        <CategoryTiles />
        <PopularAgents agents={agents} count={count} />
        <HowItWorks />
        <ValueProp />
        <Testimonials />
        <BusinessBand />
      </main>
      <LandingFooter />
    </div>
  );
}
