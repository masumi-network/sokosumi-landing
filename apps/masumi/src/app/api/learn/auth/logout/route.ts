import { NextRequest, NextResponse } from "next/server";
import { clearLearnSession, getCurrentLearnUser, learnPublicUrl, oauthLogoutUrl } from "@/lib/learn-auth";
import { isSameOrigin } from "@/lib/learn-api";
import { audit } from "@/lib/learn-db";

export const runtime = "nodejs";

/**
 * End the Masumi Learn session.
 *
 * Always succeeds by clearing the local opaque session cookie and redirecting
 * back to Learn. Provider end-session is optional and only used when Sokosumi
 * accepts a request without an id_token_hint (Learn does not store ID tokens).
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers: { "cache-control": "no-store" } });
  }

  const user = await getCurrentLearnUser();
  const home = learnPublicUrl("/learn", request.url);
  home.searchParams.set("signedOut", "1");

  // Prefer a same-origin landing page. Sokosumi's live end-session endpoint
  // currently requires id_token_hint, which Learn never persists, so remote
  // logout is best-effort only when an opt-in flag is set.
  const preferProviderLogout = process.env.SOKOSUMI_OAUTH_LOGOUT_VIA_PROVIDER === "true";
  const providerLogout = preferProviderLogout ? oauthLogoutUrl() : null;
  const response = NextResponse.redirect(providerLogout || home, 303);
  response.headers.set("cache-control", "no-store");
  await clearLearnSession(response);
  if (user) audit(user.id, "oauth_logout", undefined, { providerLogout: Boolean(providerLogout) });
  return response;
}

export async function GET(request: NextRequest) {
  // Support direct navigation / retry after a failed client POST.
  const user = await getCurrentLearnUser();
  const home = learnPublicUrl("/learn", request.url);
  home.searchParams.set("signedOut", "1");
  const response = NextResponse.redirect(home, 303);
  response.headers.set("cache-control", "no-store");
  await clearLearnSession(response);
  if (user) audit(user.id, "oauth_logout", undefined, { method: "GET" });
  return response;
}
