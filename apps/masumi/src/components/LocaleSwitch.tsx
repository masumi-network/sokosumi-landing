"use client";

import Link from "next/link";
import { type Locale, localePath, ui } from "@/lib/i18n";

// Setting the cookie is the point of this component, not the link. The
// middleware only auto-switches visitors who have never chosen; clicking here
// records a choice, so a German-browser visitor who wants the English page
// stops being redirected back on every subsequent visit.
export function LocaleSwitch({ locale, path }: { locale: Locale; path: string }) {
  const other: Locale = locale === "de" ? "en" : "de";
  const u = ui(locale);
  return (
    <Link
      href={localePath(other, path)}
      hrefLang={other}
      onClick={() => {
        document.cookie = `masumi_locale=${other}; path=/; max-age=31536000; samesite=lax`;
      }}
      className="text-[13px] text-black/45 hover:text-black underline underline-offset-4 transition-colors"
    >
      {other === "de" ? u("switchToDe") : u("switchToEn")}
    </Link>
  );
}
