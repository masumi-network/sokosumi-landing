"use client";

import { useEffect, useRef } from "react";

/* Cloudflare Turnstile: cookie-free bot check, so it needs no consent in
   the cookie banner (Google reCAPTCHA would). Inactive until
   NEXT_PUBLIC_TURNSTILE_SITE_KEY is set; the server checks the token only
   when TURNSTILE_SECRET_KEY is set. Set both together. */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      appearance: "interaction-only";
      language: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
    }
  ) => string;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export default function Turnstile({
  locale,
  onToken,
}: {
  locale: "de" | "en";
  onToken: (token: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let id: string | undefined;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        id = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          appearance: "interaction-only",
          language: locale,
          callback: onToken,
          "expired-callback": () => onToken(""),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (id) window.turnstile?.remove(id);
    };
  }, [locale, onToken]);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="ag-turnstile" />;
}
