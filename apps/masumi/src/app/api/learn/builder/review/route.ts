import { NextRequest, NextResponse } from "next/server";
import { bearerAccess } from "@/lib/learn-api";
import { getBuilderSubmission, listBuilderSubmissions, updateBuilderSubmission } from "@/lib/learn-db";

export const runtime = "nodejs";

const reviewNotes = {
  preprod_match: "Preprod transaction and registered service matched.",
  transaction_not_found: "The submitted Preprod transaction could not be found.",
  wrong_network: "The transaction was not on the approved Preprod network.",
  service_mismatch: "The transaction did not match the submitted registered service.",
  insufficient_finality: "The transaction had not reached the required finality.",
  payment_semantics_mismatch: "The transaction did not satisfy the required Masumi payment semantics.",
} as const;

export function GET(request: NextRequest) {
  const access = bearerAccess(request, "MASUMI_LEARN_REVIEW_TOKEN");
  if (access == null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const requested = request.nextUrl.searchParams.get("status") || "pending_review";
  const allowed = ["pending_review", "verification_error", "verified", "rejected"];
  if (!allowed.includes(requested)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  return NextResponse.json({ submissions: listBuilderSubmissions(requested) }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(request: NextRequest) {
  const access = bearerAccess(request, "MASUMI_LEARN_REVIEW_TOKEN");
  if (access == null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { submissionId?: string; status?: "verified" | "rejected"; reviewCode?: keyof typeof reviewNotes } | null;
  if (!body?.submissionId || !body.status || !["verified", "rejected"].includes(body.status)) return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  if (!getBuilderSubmission(body.submissionId)) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  if (!body.reviewCode || !(body.reviewCode in reviewNotes)) return NextResponse.json({ error: "A valid review code is required" }, { status: 400 });
  if (body.status === "verified" && body.reviewCode !== "preprod_match") return NextResponse.json({ error: "Verified reviews require preprod_match" }, { status: 400 });
  if (body.status === "rejected" && body.reviewCode === "preprod_match") return NextResponse.json({ error: "Rejected reviews require a rejection code" }, { status: 400 });
  const note = reviewNotes[body.reviewCode];
  return NextResponse.json({ submission: updateBuilderSubmission(body.submissionId, body.status, { note, reference: "manual-review" }) });
}
