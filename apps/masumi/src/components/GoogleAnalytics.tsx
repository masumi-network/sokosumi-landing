"use client";

import { useEffect } from "react";
import { useConsent } from "./CookieConsent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// Loads GA4 with Google Consent Mode v2. The tag loads on every page, but
// analytics storage starts DENIED — before the visitor consents, Google still
// receives anonymous, cookieless pings that power aggregated/modeled reporting.
// When the visitor accepts the cookie banner we upgrade analytics_storage to
// granted for full, cookie-based measurement. This maximizes data while keeping
// a GDPR-defensible posture (no analytics cookies until consent).
export default function GoogleAnalytics({ id }: { id: string }) {
  const consent = useConsent();

  // Load the tag once, with consent defaults set before any config command.
  useEffect(() => {
    if (document.querySelector(`script[data-ga-id="${id}"]`)) return;

    window.dataLayer = window.dataLayer || [];
    // gtag.js only processes the `arguments` object as a command — pushing a
    // plain array is silently ignored, so this MUST stay arguments-based.
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };

    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      wait_for_update: 500,
    });

    window.gtag("js", new Date());
    window.gtag("config", id);

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    script.setAttribute("data-ga-id", id);
    document.head.appendChild(script);
  }, [id]);

  // Reflect the visitor's decision into Consent Mode. Undecided stays denied
  // (cookieless pings continue); accepting upgrades to full measurement.
  useEffect(() => {
    if (consent === "ssr" || typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      analytics_storage: consent === "accepted" ? "granted" : "denied",
    });
  }, [consent]);

  return null;
}
