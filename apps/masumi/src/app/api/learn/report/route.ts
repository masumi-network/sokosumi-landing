import { NextRequest, NextResponse } from "next/server";
import { bearerAccess } from "@/lib/learn-api";
import { getLearnAggregateReport } from "@/lib/learn-db";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  const access = bearerAccess(request, "MASUMI_LEARN_REPORT_TOKEN");
  if (access == null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const configured = Number(process.env.MASUMI_LEARN_REPORT_MIN_COHORT || 5);
  const minimum = Number.isFinite(configured) ? Math.max(1, Math.min(100, Math.floor(configured))) : 5;
  return NextResponse.json(getLearnAggregateReport(minimum), { headers: { "cache-control": "no-store" } });
}
