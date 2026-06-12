"use client";

import { usePathname } from "next/navigation";
import { Locale } from "@/lib/translations";

export default function LanguageToggle({ locale = "en" }: { locale?: Locale }) {
  const pathname = usePathname();

  const getTargetPath = (targetLocale: Locale) => {
    if (targetLocale === "de") {
      if (pathname === "/" || pathname === "") return "/de";
      if (pathname === "/request-a-demo") return "/de/request-a-demo";
      if (pathname.startsWith("/de")) return pathname;
      return "/de" + pathname;
    } else {
      if (pathname === "/de" || pathname === "/de/") return "/";
      if (pathname === "/de/request-a-demo") return "/request-a-demo";
      if (pathname.startsWith("/de")) return pathname.replace(/^\/de/, "") || "/";
      return pathname;
    }
  };

  const handleSwitch = (targetLocale: Locale) => {
    document.cookie = `locale=${targetLocale}; path=/; max-age=31536000`;
    window.location.href = getTargetPath(targetLocale);
  };

  return (
    <div className="language-toggle">
      <span
        role="button"
        tabIndex={0}
        onClick={() => handleSwitch("de")}
        onKeyDown={(e) => e.key === "Enter" && handleSwitch("de")}
        className={locale === "de" ? "active" : "inactive"}
      >
        DE
      </span>
      <span className="separator">|</span>
      <span
        role="button"
        tabIndex={0}
        onClick={() => handleSwitch("en")}
        onKeyDown={(e) => e.key === "Enter" && handleSwitch("en")}
        className={locale === "en" ? "active" : "inactive"}
      >
        EN
      </span>
    </div>
  );
}
