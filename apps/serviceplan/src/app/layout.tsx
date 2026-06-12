import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "AI Marketing Agents by Serviceplan | Research, Strategy & Project Management",
  description:
    "AI-Coworkers by Europe's leading agency. The quality of the Serviceplan Group delivered to your inbox. Get competitive research, market analysis & project plans. Try your AI-Coworker free.",
  openGraph: {
    title:
      "AI Marketing Agents by Serviceplan | Research, Strategy & Project Management",
    description:
      "AI-Coworkers by Europe's leading agency. The quality of the Serviceplan Group delivered to your inbox. Get competitive research, market analysis & project plans. Try your AI-Coworker free.",
    type: "website",
    images: [{ url: "/images/og-img.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "AI Marketing Agents by Serviceplan | Research, Strategy & Project Management",
    description:
      "AI-Coworkers by Europe's leading agency. The quality of the Serviceplan Group delivered to your inbox. Get competitive research, market analysis & project plans. Try your AI-Coworker free.",
    images: ["/images/og-img.png"],
  },
  icons: {
    icon: "/images/favicon-32.png",
    shortcut: "/images/favicon-32.png",
    apple: "/images/apple-touch-icon-256.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-wf-domain="www.serviceplan-agents.com" data-wf-page="6990b008d2c582acd039bfe7" data-wf-site="6990b006d2c582acd039bf7e" className="w-mod-js w-mod-ix w-mod-ix3">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="/styles/webflow.css" rel="stylesheet" type="text/css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WFRT3NVF');`,
          }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WFRT3NVF"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
