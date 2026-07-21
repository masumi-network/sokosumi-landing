import { NextRequest, NextResponse } from "next/server";
import { clearLearnSession, getCurrentLearnUser } from "@/lib/learn-auth";
import { deleteLearnAccount, exportLearnAccount } from "@/lib/learn-db";
import { isSameOrigin } from "@/lib/learn-api";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentLearnUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return new NextResponse(JSON.stringify(exportLearnAccount(user.id), null, 2), { headers: { "content-type": "application/json", "content-disposition": "attachment; filename=masumi-learn-data.json", "cache-control": "no-store" } });
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const user = await getCurrentLearnUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { confirm?: string } | null;
  if (body?.confirm !== "DELETE") return NextResponse.json({ error: "Confirmation required" }, { status: 400 });
  deleteLearnAccount(user.id);
  const response = NextResponse.json({ deleted: true });
  await clearLearnSession(response);
  return response;
}
