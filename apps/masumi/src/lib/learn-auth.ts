import "server-only";

import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextResponse } from "next/server";
import { learnOutboundSignal } from "./learn-api";
import {
  consumeOAuthState,
  createSession,
  deleteSession,
  getSessionUser,
  refreshSession,
  saveOAuthState,
  upsertLearnUser,
  type LearnUser,
} from "./learn-db";

export const LEARN_SESSION_COOKIE = "masumi_learn_session";
export const LEARN_OAUTH_COOKIE = "masumi_learn_oauth_state";

function base64url(bytes: Buffer) { return bytes.toString("base64url"); }
export function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function safeReturnTo(value: string | null | undefined) { return value === "/learn" || value?.startsWith("/learn/") ? value : "/learn/course"; }

export function learnPublicUrl(pathname: string, requestUrl: string) {
  const configuredCallback = process.env.SOKOSUMI_OAUTH_REDIRECT_URI;
  if (configuredCallback) {
    try { return new URL(pathname, new URL(configuredCallback).origin); } catch {}
  }
  return new URL(pathname, requestUrl);
}

export function oauthConfigured() {
  const provider = Boolean(process.env.SOKOSUMI_OAUTH_CLIENT_ID && process.env.SOKOSUMI_OAUTH_CLIENT_SECRET && process.env.SOKOSUMI_OAUTH_AUTHORIZE_URL && process.env.SOKOSUMI_OAUTH_TOKEN_URL && process.env.SOKOSUMI_OAUTH_USERINFO_URL);
  return provider && (process.env.NODE_ENV !== "production" || Boolean(process.env.SOKOSUMI_OAUTH_REDIRECT_URI));
}

export function oauthEndSessionConfigured() {
  return Boolean(process.env.SOKOSUMI_OAUTH_CLIENT_ID && process.env.SOKOSUMI_OAUTH_END_SESSION_URL && process.env.SOKOSUMI_OAUTH_POST_LOGOUT_REDIRECT_URI);
}

export function oauthLogoutUrl() {
  if (!oauthEndSessionConfigured()) return null;
  try {
    const endSession = new URL(process.env.SOKOSUMI_OAUTH_END_SESSION_URL!);
    const postLogout = new URL(process.env.SOKOSUMI_OAUTH_POST_LOGOUT_REDIRECT_URI!);
    if (!['http:', 'https:'].includes(endSession.protocol) || !['http:', 'https:'].includes(postLogout.protocol)) return null;
    if (process.env.NODE_ENV === "production" && (endSession.protocol !== "https:" || postLogout.protocol !== "https:")) return null;
    if (postLogout.pathname !== "/learn" || postLogout.search || postLogout.hash) return null;
    endSession.searchParams.set("client_id", process.env.SOKOSUMI_OAUTH_CLIENT_ID!);
    endSession.searchParams.set("post_logout_redirect_uri", postLogout.toString());
    endSession.searchParams.set("state", base64url(randomBytes(24)));
    return endSession;
  } catch {
    return null;
  }
}

export function devAuthEnabled() { return process.env.NODE_ENV !== "production" && process.env.MASUMI_LEARN_DEV_AUTH === "true"; }

export function beginOAuth(returnTo: string, redirectUri: string) {
  if (!oauthConfigured()) throw new Error("Sokosumi OAuth is not configured");
  const state = base64url(randomBytes(24));
  const verifier = base64url(randomBytes(48));
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  saveOAuthState(state, verifier, safeReturnTo(returnTo));
  const url = new URL(process.env.SOKOSUMI_OAUTH_AUTHORIZE_URL!);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env.SOKOSUMI_OAUTH_CLIENT_ID!);
  url.searchParams.set("redirect_uri", process.env.SOKOSUMI_OAUTH_REDIRECT_URI || redirectUri);
  url.searchParams.set("scope", process.env.SOKOSUMI_OAUTH_SCOPES || "openid");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  return { state, url };
}

export async function finishOAuth(input: { state: string; code: string; cookieState?: string; redirectUri: string }) {
  if (!input.cookieState || input.cookieState !== input.state) throw new Error("OAuth state mismatch");
  const saved = consumeOAuthState(input.state);
  if (!saved) throw new Error("OAuth request expired or already used");
  const tokenResponse = await fetch(process.env.SOKOSUMI_OAUTH_TOKEN_URL!, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: input.code,
      redirect_uri: process.env.SOKOSUMI_OAUTH_REDIRECT_URI || input.redirectUri,
      client_id: process.env.SOKOSUMI_OAUTH_CLIENT_ID!,
      client_secret: process.env.SOKOSUMI_OAUTH_CLIENT_SECRET!,
      code_verifier: saved.code_verifier,
    }),
    cache: "no-store",
    signal: learnOutboundSignal(),
  });
  const tokens = await tokenResponse.json().catch(() => ({})) as { access_token?: string; token_type?: string; error?: string };
  if (!tokenResponse.ok) {
    console.warn("[learn-oauth] token exchange failed", { status: tokenResponse.status, error: typeof tokens.error === "string" ? tokens.error.slice(0, 80) : undefined });
    throw new Error(`OAuth token exchange failed (${tokenResponse.status})`);
  }
  if (!tokens.access_token) throw new Error("OAuth token response did not include an access token");
  const profileResponse = await fetch(process.env.SOKOSUMI_OAUTH_USERINFO_URL!, {
    headers: { authorization: `${tokens.token_type || "Bearer"} ${tokens.access_token}`, accept: "application/json" },
    cache: "no-store",
    signal: learnOutboundSignal(),
  });
  if (!profileResponse.ok) throw new Error(`OAuth user-info request failed (${profileResponse.status})`);
  const profile = await profileResponse.json() as Record<string, unknown>;
  const subject = String(profile.sub || profile.id || "");
  if (!subject) throw new Error("Sokosumi profile has no stable subject identifier");
  const user = upsertLearnUser({
    subject,
    displayName: typeof profile.name === "string" ? profile.name : typeof profile.displayName === "string" ? profile.displayName : null,
    email: typeof profile.email === "string" ? profile.email : null,
    avatarUrl: typeof profile.picture === "string" ? profile.picture : typeof profile.avatarUrl === "string" ? profile.avatarUrl : null,
  });
  return { user, returnTo: saved.return_to, session: createLearnSession(user.id) };
}

export function createLearnSession(userId: string) {
  const token = base64url(randomBytes(32));
  const maxAge = learnSessionMaxAge();
  const absoluteMaxAge = learnSessionAbsoluteMaxAge();
  const effectiveMaxAge = Math.min(maxAge, absoluteMaxAge);
  createSession(userId, hashToken(token), new Date(Date.now() + effectiveMaxAge * 1000).toISOString(), new Date(Date.now() + absoluteMaxAge * 1000).toISOString());
  return { token, maxAge: effectiveMaxAge };
}

function learnSessionMaxAge() {
  const configured = Number(process.env.MASUMI_LEARN_SESSION_DAYS || 7);
  const days = Number.isFinite(configured) ? Math.min(30, Math.max(1, configured)) : 7;
  return days * 24 * 60 * 60;
}

function learnSessionAbsoluteMaxAge() {
  const configured = Number(process.env.MASUMI_LEARN_SESSION_ABSOLUTE_DAYS || 30);
  const days = Number.isFinite(configured) ? Math.min(30, Math.max(1, configured)) : 30;
  return days * 24 * 60 * 60;
}

export function setLearnSessionCookie(response: NextResponse, session: { token: string; maxAge: number }) {
  response.cookies.set(LEARN_SESSION_COOKIE, session.token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: session.maxAge });
}

export async function getCurrentLearnUser(): Promise<LearnUser | null> {
  const token = (await cookies()).get(LEARN_SESSION_COOKIE)?.value;
  return token ? getSessionUser(hashToken(token)) : null;
}

export async function refreshLearnSession(response: NextResponse) {
  const token = (await cookies()).get(LEARN_SESSION_COOKIE)?.value;
  if (!token) return false;
  const maxAge = learnSessionMaxAge();
  const refreshed = refreshSession(hashToken(token), new Date(Date.now() + maxAge * 1000).toISOString());
  if (refreshed) setLearnSessionCookie(response, { token, maxAge });
  return refreshed;
}

export async function requireLearnUser(returnTo: string) {
  const user = await getCurrentLearnUser();
  if (!user) redirect(`/learn/login?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`);
  return user;
}

export async function clearLearnSession(response: NextResponse) {
  const token = (await cookies()).get(LEARN_SESSION_COOKIE)?.value;
  if (token) deleteSession(hashToken(token));
  response.cookies.set(LEARN_SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}
