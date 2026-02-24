import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kodosumi.io"),
  title: {
    default: "Kodosumi — Run AI Agents at Scale",
    template: "%s — Kodosumi",
  },
  description:
    "The distributed runtime environment that manages and executes agentic services at enterprise scale. Built on Ray.",
  icons: {
    icon: "/images/kodosumi-favicon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Kodosumi",
  },
  twitter: {
    card: "summary_large_image",
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
