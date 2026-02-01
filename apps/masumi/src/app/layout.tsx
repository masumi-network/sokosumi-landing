import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://masumi.network"),
  title: {
    default: "Masumi — The Payment Network for AI Agents",
    template: "%s — Masumi",
  },
  description:
    "Masumi is the payment network for AI agents. Escrow, identity, and a public registry. Built on Cardano.",
  icons: {
    icon: "/images/masumi-favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Masumi",
    images: [{ url: "/images/og-masumi.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og-masumi.png"],
  },
  other: {
    "theme-color": "#FF003D",
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
