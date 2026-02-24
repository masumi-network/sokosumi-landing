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
    "Sokosumi gives marketing teams their own AI agents. Automate research, copywriting, SEO, and campaign execution. GDPR and EU AI Act compliant.",
  icons: {
    icon: "/images/sokosumi-favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Sokosumi",
    images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmRY3cZYJKZKr48S7d5zkFsr1nyNfCeHpQTK54Heg8FZ5N", width: 1920, height: 1080 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@sokosumi",
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
