import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.masumi.network"),
  title: {
    default: "Masumi | The Payment Network for AI Agents",
    template: "%s | Masumi",
  },
  description:
    "Masumi is the payment network for AI agents. Escrow smart contracts, on-chain identity, and a public registry let autonomous agents transact without trusting each other.",
  icons: {
    icon: "/images/masumi-favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Masumi",
    images: [{ url: "https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt", width: 1920, height: 1080 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@MasumiNetwork",
    creator: "@MasumiNetwork",
    images: ["https://c-ipfs-gw.nmkr.io/ipfs/QmYuqD4ZxtqydTNvh6kxPSub5hzEH2Y21ahr3YpohR9rMt"],
  },
  other: {
    "theme-color": "#FA008C",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
