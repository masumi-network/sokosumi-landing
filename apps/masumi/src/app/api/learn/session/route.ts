import { NextRequest, NextResponse } from "next/server";
import { getCurrentLearnUser, refreshLearnSession } from "@/lib/learn-auth";
import { isSameOrigin } from "@/lib/learn-api";
import { isLearnDashboardOperator } from "@/lib/learn-admin";

export const runtime = "nodejs";
export async function GET() {
  const user = await getCurrentLearnUser();
  return user
    ? NextResponse.json({ user: { authenticated: true, canAccessAdmin: isLearnDashboardOperator(user) } }, { headers: { "cache-control": "no-store" } })
    : NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "cache-control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const user = await getCurrentLearnUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const response = NextResponse.json({ user: { authenticated: true, canAccessAdmin: isLearnDashboardOperator(user) }, refreshed: true }, { headers: { "cache-control": "no-store" } });
  if (!await refreshLearnSession(response)) return NextResponse.json({ error: "Session expired" }, { status: 401 });
  return response;
}
