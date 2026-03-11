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
    "Sokosumi gives marketing teams AI coworkers that automate research, copywriting, SEO, and campaign execution. Built in Europe, GDPR and EU AI Act compliant. Get started with AI marketing agents today.",
  openGraph: {
    title: "Sokosumi | AI Marketing Agents for Teams",
    description:
      "AI marketing agents that automate research, copywriting, SEO, and campaign execution. GDPR and EU AI Act compliant.",
    images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmRY3cZYJKZKr48S7d5zkFsr1nyNfCeHpQTK54Heg8FZ5N", width: 1920, height: 1080 }],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sokosumi",
  url: "https://www.sokosumi.com",
  logo: "https://www.sokosumi.com/images/sokosumi-favicon.svg",
  description:
    "AI Marketing Agents for Teams. Automate research, copywriting, SEO, and campaign execution with AI coworkers.",
  sameAs: [
    "https://x.com/sokosumi",
    "https://linkedin.com/company/sokosumi/",
  ],
  foundingLocation: {
    "@type": "Place",
    name: "Europe",
  },
};

const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Sokosumi",
  url: "https://app.sokosumi.com",
  description:
    "AI marketing agents that own tasks, follow responsibilities, and work together on your campaigns. Automate research, copywriting, SEO, and campaign execution.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    category: "Early Access",
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Sokosumi - AI Marketing Agents for Teams",
  url: "https://www.sokosumi.com",
  description:
    "Sokosumi gives marketing teams AI coworkers that automate research, copywriting, SEO, and campaign execution. Built in Europe, GDPR and EU AI Act compliant.",
  isPartOf: {
    "@type": "WebSite",
    name: "Sokosumi",
    url: "https://www.sokosumi.com",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
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
