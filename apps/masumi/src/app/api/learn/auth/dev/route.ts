import { NextRequest, NextResponse } from "next/server";
import { createLearnSession, devAuthEnabled, learnPublicUrl, safeReturnTo, setLearnSessionCookie } from "@/lib/learn-auth";
import { audit, upsertLearnUser } from "@/lib/learn-db";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  if (!devAuthEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const user = upsertLearnUser({ subject: "dev-sokosumi-user", displayName: "Sokosumi Test Learner", email: "learner@example.test" });
  const response = NextResponse.redirect(learnPublicUrl(safeReturnTo(request.nextUrl.searchParams.get("returnTo")), request.url));
  response.headers.set("cache-control", "no-store");
  setLearnSessionCookie(response, createLearnSession(user.id));
  audit(user.id, "dev_login");
  return response;
}
