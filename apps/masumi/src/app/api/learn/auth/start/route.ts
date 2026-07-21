import { NextRequest, NextResponse } from "next/server";
import { beginOAuth, learnPublicUrl, LEARN_OAUTH_COOKIE, safeReturnTo } from "@/lib/learn-auth";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  try {
    const returnTo = safeReturnTo(request.nextUrl.searchParams.get("returnTo"));
    const redirectUri = learnPublicUrl("/api/learn/auth/callback", request.url).toString();
    const { state, url } = beginOAuth(returnTo, redirectUri);
    const response = NextResponse.redirect(url);
    response.headers.set("cache-control", "no-store");
    response.cookies.set(LEARN_OAUTH_COOKIE, state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
    return response;
  } catch (error) {
    const url = learnPublicUrl("/learn/login", request.url);
    url.searchParams.set("error", error instanceof Error ? error.message : "Unable to start sign-in");
    return NextResponse.redirect(url, { headers: { "cache-control": "no-store" } });
  }
}
