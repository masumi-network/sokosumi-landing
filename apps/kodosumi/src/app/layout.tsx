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
    default: "Kodosumi | Run AI Agents at Scale",
    template: "%s | Kodosumi",
  },
  description:
    "Deploy, orchestrate, and scale AI agent services with Kodosumi. A distributed runtime built on Ray for agent execution, pipelines, and observability.",
  icons: {
    icon: "/images/kodosumi-favicon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Kodosumi",
    images: [{ url: "/images/og-kodosumi.png", width: 1920, height: 1080 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@masaborad",
    images: ["/images/og-kodosumi.png"],
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
