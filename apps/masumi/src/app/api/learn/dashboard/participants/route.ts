import { NextRequest, NextResponse } from "next/server";
import { getCurrentLearnDashboardOperator, getLearnParticipantReport } from "@/lib/learn-admin";
import { audit } from "@/lib/learn-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateHeaders = {
  "cache-control": "private, no-store",
  vary: "Cookie",
  "x-robots-tag": "noindex, nofollow",
};

function integerParam(value: string | null, fallback: number, maximum: number) {
  if (value == null) return fallback;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= maximum ? parsed : null;
}

export async function GET(request: NextRequest) {
  const operator = await getCurrentLearnDashboardOperator();
  if (!operator) return NextResponse.json({ error: "Not found" }, { status: 404, headers: privateHeaders });

  const limit = integerParam(request.nextUrl.searchParams.get("limit"), 25, 100);
  const offset = integerParam(request.nextUrl.searchParams.get("offset"), 0, 1_000_000);
  if (limit == null || offset == null || limit < 1) {
    return NextResponse.json({ error: "Invalid pagination" }, { status: 400, headers: privateHeaders });
  }

  const report = getLearnParticipantReport(limit, offset);
  audit(operator.id, "admin_participant_list_access", undefined, { surface: "participants", limit, offset });
  return NextResponse.json(report, { headers: privateHeaders });
}
