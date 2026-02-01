import type { Metadata } from "next";
import { Header, Footer } from "@summation/shared";
import Hero from "@/components/Hero";
import LogoCloud from "@/components/LogoCloud";
import Platform from "@/components/Platform";

import VideoWalkthrough from "@/components/VideoWalkthrough";
import Security from "@/components/Security";
import CTA from "@/components/CTA";

export const metadata: Metadata = {
  title: "AI Marketing Agents for Teams | Sokosumi",
  description:
    "Sokosumi is an AI marketing platform for teams. Work with specialized AI agents, automate marketing workflows, and stay GDPR & EU AI Act compliant.",
};

export default function Home() {
  return (
    <>
      <Header product="sokosumi" />
      <main>
        <Hero />
        <LogoCloud />
        <Platform />
        <VideoWalkthrough />
        <Security />
      </main>
      <CTA />
      <Footer product="sokosumi" />
    </>
  );
}
