"use client";

import { usePathname } from "next/navigation";
import { alternatePath } from "@/lib/routes";
import { Locale } from "@/lib/translations";

/**
 * Real anchors, not click handlers: this is the only internal link between the
 * English and German trees, and /de carries most of the site's search traffic.
 */
export default function LanguageToggle({ locale = "en" }: { locale?: Locale }) {
  const pathname = usePathname() || "/";

  const href = (target: Locale) =>
    target === locale ? pathname : alternatePath(pathname, target);

  const setCookie = (target: Locale) => {
    document.cookie = `locale=${target}; path=/; max-age=31536000`;
  };

  return (
    <div className="language-toggle">
      <a
        href={href("de")}
        hrefLang="de"
        onClick={() => setCookie("de")}
        className={locale === "de" ? "active" : "inactive"}
      >
        DE
      </a>
      <span className="separator">|</span>
      <a
        href={href("en")}
        hrefLang="en"
        onClick={() => setCookie("en")}
        className={locale === "en" ? "active" : "inactive"}
      >
        EN
      </a>
    </div>
  );
}
