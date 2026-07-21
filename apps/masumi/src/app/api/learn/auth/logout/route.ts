import { NextRequest, NextResponse } from "next/server";
import { clearLearnSession, getCurrentLearnUser, learnPublicUrl, oauthLogoutUrl } from "@/lib/learn-auth";
import { isSameOrigin } from "@/lib/learn-api";
import { audit } from "@/lib/learn-db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const user = await getCurrentLearnUser();
  const response = NextResponse.redirect(oauthLogoutUrl() || learnPublicUrl("/learn", request.url), 303);
  response.headers.set("cache-control", "no-store");
  await clearLearnSession(response);
  if (user) audit(user.id, "oauth_logout");
  return response;
}
