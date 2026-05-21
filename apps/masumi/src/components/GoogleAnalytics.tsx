"use client";

import Script from "next/script";
import { useConsent } from "./CookieConsent";

export default function GoogleAnalytics({ id }: { id: string }) {
  const consent = useConsent();
  if (consent !== "accepted") return null;

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
