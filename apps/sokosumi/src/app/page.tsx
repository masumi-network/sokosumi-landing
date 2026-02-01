import type { Metadata } from "next";
import { Header, Footer } from "@summation/shared";
import Hero from "@/components/Hero";
import ValueProps from "@/components/ValueProps";
import Platform from "@/components/Platform";
import Stats from "@/components/Stats";
import Deployment from "@/components/Deployment";
import Security from "@/components/Security";
import Testimonial from "@/components/Testimonial";
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
        <ValueProps />
        <Platform />
        <Stats />
        <Deployment />
        <Security />
        <Testimonial />
      </main>
      <CTA />
      <Footer product="sokosumi" />
    </>
  );
}
