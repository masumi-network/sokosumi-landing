import type { Metadata } from "next";
import { Header, Footer } from "@summation/shared";
import Hero from "@/components/landing/Hero";
import StatementBand from "@/components/landing/StatementBand";
import AgentsShowcase from "@/components/landing/AgentsShowcase";
import UseCases from "@/components/landing/UseCases";
import Pillars from "@/components/landing/Pillars";
import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";
import FinalCTA from "@/components/landing/FinalCTA";
import { featuredAgents, agentCount } from "@/components/landing/agents";

export const metadata: Metadata = {
  title: {
    absolute: "Sokosumi — Tasks that get done without you doing them",
  },
  description:
    "Sokosumi gives marketing teams specialized AI agents that own real work and finish it — research, content, strategy, and execution. GDPR & EU AI Act compliant. $30 in free credits to start.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const agents = featuredAgents();
  const count = agentCount();

  return (
    <div className="soko">
      <Header product="sokosumi" />
      <main>
        <Hero />
        <StatementBand />
        <AgentsShowcase agents={agents} count={count} />
        <UseCases />
        <Pillars />
        <Pricing />
        <Faq />
        <FinalCTA />
      </main>
      <Footer product="sokosumi" />
    </div>
  );
}
