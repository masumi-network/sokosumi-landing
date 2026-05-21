"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const STORAGE_KEY = "masumi-cookie-consent";
export const CONSENT_EVENT = "masumi-cookie-consent";

type Decision = "accepted" | "declined";

function consentSubscribe(cb: () => void) {
  window.addEventListener(CONSENT_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CONSENT_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function readConsent(): Decision | null {
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "accepted" || v === "declined" ? v : null;
}

// Server-side has no localStorage — render no banner during SSR/hydration
// to avoid a flash; the client-side snapshot replaces it after hydration.
function consentServerSnapshot(): Decision | "ssr" {
  return "ssr";
}

export function useConsent(): Decision | null | "ssr" {
  return useSyncExternalStore(consentSubscribe, readConsent, consentServerSnapshot);
}

function writeConsent(value: Decision) {
  window.localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

export default function CookieConsent() {
  const consent = useConsent();

  // Hide on the server, on hydration, and after the user has decided.
  if (consent === "ssr" || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-[380px] z-[100] bg-white border border-black/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] p-4"
    >
      <p className="text-[13px] text-black leading-[1.5]">
        We use Google Analytics to understand how visitors use the site.
        It sets cookies on your device.{" "}
        <Link
          href="/privacy"
          className="underline decoration-[#ddd] hover:decoration-black"
        >
          Learn more
        </Link>
        .
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => writeConsent("declined")}
          className="text-[12px] px-3 py-1.5 border border-black/[0.12] text-[#666] hover:text-black hover:border-black/[0.32] transition-colors"
        >
          Decline
        </button>
        <button
          onClick={() => writeConsent("accepted")}
          className="text-[12px] px-3 py-1.5 bg-black text-white hover:bg-black/85 transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
