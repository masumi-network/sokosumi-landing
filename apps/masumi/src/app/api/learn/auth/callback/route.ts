import { NextRequest, NextResponse } from "next/server";
import { finishOAuth, learnPublicUrl, LEARN_OAUTH_COOKIE, setLearnSessionCookie } from "@/lib/learn-auth";
import { audit } from "@/lib/learn-db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const providerError = request.nextUrl.searchParams.get("error");
  if (providerError) {
    const errorCode = safeProviderErrorCode(providerError);
    const description = safeProviderDescription(request.nextUrl.searchParams.get("error_description"));
    console.warn("[learn-oauth] provider callback error", { error: errorCode, description });
    return redirectError(request, providerErrorMessage(providerError), errorCode);
  }
  if (!state || !code) return redirectError(request, "Sokosumi did not return a complete sign-in response. Please try again.");
  try {
    const result = await finishOAuth({ state, code, cookieState: request.cookies.get(LEARN_OAUTH_COOKIE)?.value, redirectUri: learnPublicUrl("/api/learn/auth/callback", request.url).toString() });
    const response = NextResponse.redirect(learnPublicUrl(result.returnTo, request.url));
    response.headers.set("cache-control", "no-store");
    setLearnSessionCookie(response, result.session);
    response.cookies.set(LEARN_OAUTH_COOKIE, "", { path: "/", maxAge: 0 });
    audit(result.user.id, "oauth_login");
    return response;
  } catch (error) { return redirectError(request, safeCallbackError(error)); }
}

function providerErrorMessage(error: string) {
  if (error === "access_denied") return "Sign-in was cancelled. You can try again when you are ready.";
  if (error === "temporarily_unavailable" || error === "server_error") return "Sokosumi sign-in is temporarily unavailable. Please try again shortly.";
  return "Sokosumi could not complete sign-in. Please try again.";
}

function safeProviderErrorCode(error: string) {
  return /^[a-z][a-z0-9_]{0,63}$/.test(error) ? error : "provider_error";
}

function safeProviderDescription(description: string | null) {
  if (!description) return undefined;
  return description.replace(/[^\x20-\x7E]/g, " ").slice(0, 200);
}

function safeCallbackError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message === "OAuth state mismatch" || message === "OAuth request expired or already used") return "This sign-in request expired or could not be verified. Please start again.";
  if (message.startsWith("OAuth token exchange failed")) return "Sokosumi could not complete the secure token exchange. Please try again.";
  if (message.startsWith("OAuth user-info request failed")) return "Sokosumi signed you in but the account profile could not be loaded. Please try again.";
  if (message === "Sokosumi profile has no stable subject identifier") return "This Sokosumi account does not provide the stable identifier required by Learn.";
  return "Sign-in failed. Please try again.";
}

function redirectError(request: NextRequest, message: string, reason?: string) {
  const url = learnPublicUrl("/learn/login", request.url);
  url.searchParams.set("error", message);
  if (reason) url.searchParams.set("reason", reason);
  const response = NextResponse.redirect(url);
  response.headers.set("cache-control", "no-store");
  response.cookies.set(LEARN_OAUTH_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return response;
}
