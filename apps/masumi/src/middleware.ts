import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { HOMEPAGE_LINK_HEADER } from "@/lib/homepage-link-header";
import { preferredLocale } from "@/lib/i18n";

// Paths that exist in German. Auto-switching only fires for these; sending a
// visitor to /de/explorer when no such route exists would 404 them for the
// crime of having a German browser.
const LOCALIZED = [
  /^\/x402$/,
  /^\/x402-protocol$/,
  /^\/glossary$/,
  /^\/glossary\/[^/]+$/,
  /^\/blogs$/,
  /^\/blogs\/[^/]+$/,
];

// Crawlers must never be redirected by language. Google crawls from the US
// with no Accept-Language and does not maintain per-locale crawlers; if the
// middleware bounced it, only one of the two versions would ever be indexed
// and the hreflang pair would be pointless. Bots always get the URL they asked
// for; hreflang alone tells them the other one exists.
const BOT =
  /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|facebookexternalhit|twitterbot|linkedinbot|embedly|quora|pinterest|slackbot|whatsapp|telegram|discord|applebot|petalbot|ahrefs|semrush|gptbot|oai-searchbot|chatgpt-user|perplexitybot|claudebot|anthropic|ccbot|bytespider/i;

const LOCALE_COOKIE = "masumi_locale";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  if (host === "masumi.network") {
    const url = request.nextUrl.clone();
    url.host = "www.masumi.network";
    const response = NextResponse.redirect(url, 301);
    if (pathname === "/") {
      response.headers.set("Link", HOMEPAGE_LINK_HEADER);
    }
    return response;
  }

  // A visitor who is already on /de, or who has picked a language before, is
  // left alone. The cookie is what makes the switch a suggestion rather than a
  // cage: follow one /en link and you stop being redirected.
  const onGerman = pathname === "/de" || pathname.startsWith("/de/");
  const chosen = request.cookies.get(LOCALE_COOKIE)?.value;
  const ua = request.headers.get("user-agent") || "";

  if (
    !onGerman &&
    !chosen &&
    !BOT.test(ua) &&
    LOCALIZED.some((re) => re.test(pathname)) &&
    preferredLocale(request.headers.get("accept-language")) === "de"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/de${pathname}`;
    // 307, not 301: the language preference is per-visitor, and a permanent
    // redirect would be cached in browsers that later change their setting.
    const response = NextResponse.redirect(url, 307);
    response.headers.set("Vary", "Accept-Language, Cookie");
    return response;
  }

  const response = NextResponse.next();
  if (pathname === "/") {
    response.headers.set("Link", HOMEPAGE_LINK_HEADER);
  }
  // No Vary is set here on purpose. Next.js overwrites a middleware Vary on
  // next() with its own router value, so setting one would be theatre. It is
  // also not needed: the redirect above is the only response whose content
  // depends on Accept-Language, and it carries Vary itself. Every page URL is
  // language-stable (/x402-protocol is always English, /de/* always German),
  // so a CDN caching a 200 here can only ever fail by not auto-switching —
  // never by serving the wrong language. Varying these pages on
  // Accept-Language would shred the cache hit rate for no gain, because that
  // header has effectively unbounded cardinality.
  return response;
}
