import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export function isSameOrigin(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).origin === request.nextUrl.origin; } catch { return false; }
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
