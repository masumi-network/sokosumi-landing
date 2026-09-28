import type { Metadata } from "next";
import { ROUTES, RouteKey, Locale } from "@/lib/routes";

export const SITE_URL = "https://www.serviceplan-agents.com";
export const OG_IMAGE = "/images/og-img.png";

const OG_LOCALE: Record<Locale, string> = { en: "en_US", de: "de_DE" };
const HREFLANG: Record<Locale, string> = { en: "en", de: "de" };

export function absolute(path: string): string {
  return `${SITE_URL}${path}`;
}

/**
 * Page metadata with the canonical and both hreflang alternates filled in from
 * the route map, so a page can never declare a canonical that disagrees with
 * the sitemap.
 */
export function pageMetadata({
  route,
  locale,
  title,
  description,
  image = OG_IMAGE,
  noindex = false,
}: {
  route: RouteKey;
  locale: Locale;
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const path = ROUTES[route][locale];
  const canonical = absolute(path);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        [HREFLANG.en]: absolute(ROUTES[route].en),
        [HREFLANG.de]: absolute(ROUTES[route].de),
        "x-default": absolute(ROUTES[route].en),
      },
    },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Serviceplan Agents",
      locale: OG_LOCALE[locale],
      type: "website",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
