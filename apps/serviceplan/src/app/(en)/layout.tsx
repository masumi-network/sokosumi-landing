import type { Metadata } from "next";
import RootShell from "@/components/RootShell";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/images/favicon-32.png",
    shortcut: "/images/favicon-32.png",
    apple: "/images/apple-touch-icon-256.png",
  },
};

export default function EnLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RootShell locale="en">{children}</RootShell>;
}
