import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

/**
 * Public site origin for CSRF same-origin checks.
 * Behind Railway (or any reverse proxy), request.nextUrl.origin can be the
 * internal service host, while browsers send the public https origin.
 */
export function publicRequestOrigin(request: NextRequest) {
  for (const candidate of [
    process.env.SOKOSUMI_OAUTH_REDIRECT_URI,
    process.env.SOKOSUMI_OAUTH_POST_LOGOUT_REDIRECT_URI,
    process.env.MASUMI_PUBLIC_ORIGIN,
  ]) {
    if (!candidate) continue;
    try {
      return new URL(candidate).origin;
    } catch {
      // ignore malformed config and fall through
    }
  }

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
      || (process.env.NODE_ENV === "production" ? "https" : request.nextUrl.protocol.replace(":", "") || "http");
    return `${proto}://${host}`;
  }

  return request.nextUrl.origin;
}

export function isSameOrigin(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const allowed = new Set([publicRequestOrigin(request), request.nextUrl.origin]);
    return allowed.has(new URL(origin).origin);
  } catch {
    return false;
  }
}

export function bearerAccess(request: NextRequest, environmentVariable: string) {
  const expected = process.env[environmentVariable];
  if (!expected) return null;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(provided);
  return expectedBytes.length === providedBytes.length && timingSafeEqual(expectedBytes, providedBytes);
}

export function learnOutboundSignal() {
  const configured = Number(process.env.MASUMI_LEARN_OUTBOUND_TIMEOUT_MS || 10_000);
  const milliseconds = Number.isFinite(configured) ? Math.max(1_000, Math.min(30_000, Math.floor(configured))) : 10_000;
  return AbortSignal.timeout(milliseconds);
}
