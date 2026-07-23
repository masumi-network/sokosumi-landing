import { NextRequest, NextResponse } from "next/server";
import { getCurrentLearnDashboardOperator } from "@/lib/learn-admin";
import {
  audit,
  BUILDER_COURSE_VERSION,
  COURSE_VERSION,
  getLearnAvailableVersions,
  getLearnAggregateReport,
} from "@/lib/learn-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1_000;
const MAX_RANGE_DAYS = 366;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const privateHeaders = {
  "cache-control": "private, no-store",
  vary: "Cookie",
};

function calendarDate(value: string | null) {
  if (value == null) return null;
  const match = DATE_PATTERN.exec(value);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return undefined;
  return date;
}

function minimumCohort() {
  const configured = Number(process.env.MASUMI_LEARN_REPORT_MIN_COHORT || 5);
  return Number.isFinite(configured) ? Math.max(1, Math.min(100, Math.floor(configured))) : 5;
}

export async function GET(request: NextRequest) {
  const operator = await getCurrentLearnDashboardOperator();
  if (!operator) return NextResponse.json({ error: "Not found" }, { status: 404, headers: privateHeaders });

  const params = request.nextUrl.searchParams;
  const fromInput = params.get("from");
  const toInput = params.get("to");
  const fromDate = calendarDate(fromInput);
  const toDate = calendarDate(toInput);
  if (fromDate === undefined || toDate === undefined) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400, headers: privateHeaders });
  }

  const from = fromDate?.toISOString();
  const toExclusiveDate = toDate ? new Date(toDate.getTime() + DAY_MS) : null;
  const to = toExclusiveDate?.toISOString();
  if (fromDate && toExclusiveDate && (toExclusiveDate <= fromDate || toExclusiveDate.getTime() - fromDate.getTime() > MAX_RANGE_DAYS * DAY_MS)) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400, headers: privateHeaders });
  }

  const courseVersion = params.get("courseVersion") || COURSE_VERSION;
  const builderCourseVersion = params.get("builderVersion") || BUILDER_COURSE_VERSION;
  const availableVersions = getLearnAvailableVersions();
  if (!availableVersions.fundamentals.includes(courseVersion) || !availableVersions.builder.includes(builderCourseVersion)) {
    return NextResponse.json({ error: "Invalid course version" }, { status: 400, headers: privateHeaders });
  }

  const report = getLearnAggregateReport({
    minimumCohort: minimumCohort(),
    from,
    to,
    courseVersion,
    builderCourseVersion,
  });
  audit(operator.id, "admin_dashboard_access", undefined, {
    surface: "report",
    from: fromInput,
    to: toInput,
    courseVersion,
    builderCourseVersion,
  });

  return NextResponse.json(report, { headers: privateHeaders });
}
