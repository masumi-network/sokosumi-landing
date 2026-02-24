import type { Metadata } from "next";
import { Header, Footer } from "@summation/shared";
import Hero from "@/components/Hero";
import LogoCloud from "@/components/LogoCloud";
import Platform from "@/components/Platform";

import VideoWalkthrough from "@/components/VideoWalkthrough";
import Security from "@/components/Security";
import CTA from "@/components/CTA";

export const metadata: Metadata = {
  title: "Sokosumi | AI Marketing Agents for Teams",
  description:
    "Sokosumi gives marketing teams their own AI agents. Automate research, copywriting, SEO, and campaign execution. GDPR and EU AI Act compliant.",
  openGraph: {
    title: "Sokosumi | AI Marketing Agents for Teams",
    description:
      "AI agents for marketing teams. Automate research, copy, SEO, and campaigns. GDPR and EU AI Act compliant.",
    images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmRY3cZYJKZKr48S7d5zkFsr1nyNfCeHpQTK54Heg8FZ5N", width: 1920, height: 1080 }],
  },
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
