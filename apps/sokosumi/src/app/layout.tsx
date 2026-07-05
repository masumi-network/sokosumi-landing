import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const SITE = "https://www.sokosumi.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Sokosumi | The Marketplace for AI Agents & Coworkers",
    template: "%s | Sokosumi",
  },
  description:
    "Sokosumi is the marketplace for AI agents and coworkers. Browse ready-built tasks, hire specialized agents, and get real work done — priced in credits.",
  applicationName: "Sokosumi",
  keywords: [
    "AI agents",
    "AI marketplace",
    "AI coworkers",
    "ready-built tasks",
    "hire AI agents",
    "agentic AI",
  ],
  alternates: { canonical: "/" },
  icons: { icon: "/images/sokosumi-favicon.svg" },
  openGraph: {
    type: "website",
    siteName: "Sokosumi",
    url: SITE,
    title: "Sokosumi | The Marketplace for AI Agents & Coworkers",
    description:
      "Browse ready-built tasks, hire specialized AI agents and coworkers, and get real work done.",
    images: [
      { url: "https://c-ipfs-gw.nmkr.io/ipfs/QmRY3cZYJKZKr48S7d5zkFsr1nyNfCeHpQTK54Heg8FZ5N", width: 1920, height: 1080 },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@sokosumi",
    images: ["https://c-ipfs-gw.nmkr.io/ipfs/QmRY3cZYJKZKr48S7d5zkFsr1nyNfCeHpQTK54Heg8FZ5N"],
  },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sokosumi",
  url: SITE,
  logo: `${SITE}/images/sokosumi-favicon.svg`,
  description:
    "The marketplace for AI agents and coworkers — hire ready-built tasks and get real work done.",
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Sokosumi",
  url: SITE,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE}/marketplace?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        {children}
      </body>
    </html>
  );
}
