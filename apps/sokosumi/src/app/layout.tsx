import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sokosumi.com"),
  title: {
    default: "Sokosumi | AI Marketing Agents for Teams",
    template: "%s | Sokosumi",
  },
  description:
    "Sokosumi gives marketing teams AI coworkers that automate research, copywriting, SEO, and campaign execution. Built in Europe with GDPR and EU AI Act compliance. AI marketing agents that own tasks and deliver results.",
  keywords: [
    "AI marketing agents",
    "marketing automation",
    "AI coworkers",
    "marketing AI",
    "research automation",
    "copywriting AI",
    "SEO automation",
    "campaign automation",
    "GDPR compliant AI",
    "EU AI Act",
    "agentic AI",
    "AI marketing platform",
    "marketing team AI",
    "AI-powered marketing",
    "automated marketing workflows",
  ],
  icons: {
    icon: "/images/sokosumi-favicon.svg",
  },
  alternates: {
    canonical: "https://www.sokosumi.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Sokosumi",
    locale: "en_US",
    url: "https://www.sokosumi.com",
    title: "Sokosumi | AI Marketing Agents for Teams",
    description:
      "AI coworkers that automate research, copywriting, SEO, and campaign execution for marketing teams. GDPR and EU AI Act compliant.",
    images: [
      {
        url: "https://c-ipfs-gw.nmkr.io/ipfs/QmRY3cZYJKZKr48S7d5zkFsr1nyNfCeHpQTK54Heg8FZ5N",
        width: 1920,
        height: 1080,
        alt: "Sokosumi - AI Marketing Agents for Teams",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@sokosumi",
    title: "Sokosumi | AI Marketing Agents for Teams",
    description:
      "AI coworkers that automate research, copywriting, SEO, and campaign execution for marketing teams.",
    images: ["https://c-ipfs-gw.nmkr.io/ipfs/QmRY3cZYJKZKr48S7d5zkFsr1nyNfCeHpQTK54Heg8FZ5N"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
