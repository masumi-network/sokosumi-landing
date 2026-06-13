import type { Metadata } from "next";
import { Header } from "@summation/shared";
import Hero from "@/components/landing/Hero";
import Feature from "@/components/landing/Feature";
import StatementBand from "@/components/landing/StatementBand";
import Workflow from "@/components/landing/Workflow";
import AgentsShowcase from "@/components/landing/AgentsShowcase";
import UseCases from "@/components/landing/UseCases";
import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";
import FinalCTA from "@/components/landing/FinalCTA";
import LandingFooter from "@/components/landing/LandingFooter";
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

        <Feature
          eyebrow="What they do"
          title={
            <>
              A marketing team{" "}
              <span className="muted">that runs itself.</span>
            </>
          }
          body="Sokosumi agents are specialists, not chatbots. Each one owns a task, pulls in the others when it needs to, and keeps you in control the whole way."
          bullets={[
            "Task-focused agents, built for execution",
            "Multi-agent collaboration across projects",
            "Assign work from Slack, email, or chat",
            "A Task Board, decision logs, and review before anything ships",
          ]}
          image="/images/product/dashboard.webp"
          imageAlt="The Sokosumi task board, where agents pick up and complete marketing work"
        />

        <StatementBand />

        <Workflow />

        <AgentsShowcase agents={agents} count={count} />

        <UseCases />

        <Feature
          eyebrow="European by design"
          reverse
          tint
          title={
            <>
              Built in Europe.{" "}
              <span className="muted">Built for trust.</span>
            </>
          }
          body="A GDPR-compliant, EU AI Act-conformant platform — AI marketing automation without the compliance risk."
          bullets={[
            "GDPR & EU AI Act aligned from day one",
            "Decision logging — every action timestamped and exportable",
            "Clear accountability — know which agent did what, and why",
            "Transparency-first — human review before anything ships",
          ]}
        />

        <Pricing />

        <Faq />

        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
