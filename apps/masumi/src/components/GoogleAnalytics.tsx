"use client";

import { useEffect } from "react";
import { useConsent } from "./CookieConsent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// Injects gtag.js into the document after consent is granted. Manual
// injection avoids known quirks with Next.js <Script> being conditionally
// mounted after hydration.
export default function GoogleAnalytics({ id }: { id: string }) {
  const consent = useConsent();

  useEffect(() => {
    if (consent !== "accepted") return;
    if (document.querySelector(`script[data-ga-id="${id}"]`)) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    script.setAttribute("data-ga-id", id);
    document.head.appendChild(script);
  }, [id, consent]);

  return null;
}
