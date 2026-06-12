import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "KI Marketing Agents von Serviceplan | Research, Strategie & Projektmanagement",
  description:
    "KI-Coworker von Serviceplan - Europas f\u00fchrende Agentur. Erhalten Sie Wettbewerbsanalysen, Marktforschung & Projektpl\u00e4ne direkt in Ihr Postfach. AI-Coworker kostenlos testen.",
  openGraph: {
    title:
      "KI Marketing Agents von Serviceplan | Research, Strategie & Projektmanagement",
    description:
      "KI-Coworker von Serviceplan - Europas f\u00fchrende Agentur. Erhalten Sie Wettbewerbsanalysen, Marktforschung & Projektpl\u00e4ne direkt in Ihr Postfach. AI-Coworker kostenlos testen.",
    type: "website",
    images: [{ url: "/images/og-img.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "KI Marketing Agents von Serviceplan | Research, Strategie & Projektmanagement",
    description:
      "KI-Coworker von Serviceplan - Europas f\u00fchrende Agentur. Erhalten Sie Wettbewerbsanalysen, Marktforschung & Projektpl\u00e4ne direkt in Ihr Postfach. AI-Coworker kostenlos testen.",
    images: ["/images/og-img.png"],
  },
};

export default function DeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
