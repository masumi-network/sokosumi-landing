import { NextRequest, NextResponse } from "next/server";
import { bearerAccess } from "@/lib/learn-api";
import { oauthConfigured, oauthEndSessionConfigured } from "@/lib/learn-auth";
import { learnDashboardAllowlistConfigured } from "@/lib/learn-admin";
import { BUILDER_COURSE_VERSION, COURSE_VERSION, getLearnDb } from "@/lib/learn-db";

export const runtime = "nodejs";

function configured(...names: string[]) { return names.every((name) => Boolean(process.env[name])); }

export function GET(request: NextRequest) {
  try {
    getLearnDb().prepare("SELECT 1").get();
    const access = bearerAccess(request, "MASUMI_LEARN_ADMIN_TOKEN");
    if (request.headers.has("authorization") && access == null) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (request.headers.has("authorization") && !access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const response: Record<string, unknown> = { status: "ok", courseVersion: COURSE_VERSION, builderCourseVersion: BUILDER_COURSE_VERSION };
    if (access === true) {
      const mintNetwork = process.env.MASUMI_LEARN_MINT_NETWORK;
      const checks = {
        database: true,
        oauth: oauthConfigured(),
        oauthLogout: oauthEndSessionConfigured(),
        minting: configured("MASUMI_LEARN_MINT_URL", "MASUMI_LEARN_MINT_STATUS_URL", "MASUMI_LEARN_MINT_TOKEN", "MASUMI_LEARN_MINT_NETWORK") && ["preview", "preprod", "mainnet"].includes(mintNetwork || ""),
        builderVerifier: configured("MASUMI_LEARN_BUILDER_VERIFY_URL", "MASUMI_LEARN_BUILDER_VERIFY_TOKEN"),
        reviewQueue: configured("MASUMI_LEARN_REVIEW_TOKEN"),
        aggregateReport: configured("MASUMI_LEARN_REPORT_TOKEN"),
        adminDashboard: learnDashboardAllowlistConfigured(),
        operations: configured("MASUMI_LEARN_ADMIN_TOKEN"),
      };
      response.readiness = { checks, launchConfigured: Object.values(checks).every(Boolean) };
    }
    return NextResponse.json(response, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
