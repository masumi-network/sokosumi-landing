import { NextRequest, NextResponse } from "next/server";
import { getCurrentLearnUser } from "@/lib/learn-auth";
import { consumeRateLimit, createBuilderSubmission, getBuilderProgress, getCredentialForUser, markBuilderStep } from "@/lib/learn-db";
import { verifyBuilderSubmission } from "@/lib/learn-builder";
import { isSameOrigin } from "@/lib/learn-api";
import { builderProofStepKeys, builderSteps } from "@/app/learn/builder-data";

export const runtime = "nodejs";

function fundamentalsEligible(userId: string) {
  const credential = getCredentialForUser(userId);
  return credential && credential.status !== "revoked" && credential.status !== "superseded";
}

export async function GET() {
  const user = await getCurrentLearnUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ eligible: Boolean(fundamentalsEligible(user.id)), progress: getBuilderProgress(user.id) }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const user = await getCurrentLearnUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!fundamentalsEligible(user.id)) return NextResponse.json({ error: "Earn the Fundamentals credential first" }, { status: 403 });
  const body = await request.json().catch(() => null) as { action?: string; step?: string; transactionHash?: string; agentIdentifier?: string } | null;
  if (body?.action === "complete_step") {
    if (!body.step || !builderSteps.some((step) => step.key === body.step)) return NextResponse.json({ error: "Invalid Builder step" }, { status: 400 });
    return NextResponse.json({ progress: markBuilderStep(user.id, body.step) });
  }
  if (body?.action === "submit_proof") {
    if (!consumeRateLimit(`${user.id}:builder-proof`, 10, 3600)) return NextResponse.json({ error: "Too many proof submissions. Try again later." }, { status: 429 });
    const progress = getBuilderProgress(user.id);
    if (progress.credential) return NextResponse.json({ error: "Builder credential already issued" }, { status: 409 });
    if (!builderProofStepKeys.every((step) => progress.completedSteps.includes(step))) return NextResponse.json({ error: "Complete every Unit 5 project step first" }, { status: 403 });
    const transactionHash = body.transactionHash?.trim().toLowerCase() || "";
    const agentIdentifier = body.agentIdentifier?.trim() || "";
    if (!/^[a-f0-9]{64}$/.test(transactionHash)) return NextResponse.json({ error: "Enter a 64-character Preprod transaction hash" }, { status: 400 });
    if (!/^[A-Za-z0-9:._-]{3,200}$/.test(agentIdentifier)) return NextResponse.json({ error: "Enter the registered service identifier without spaces or secrets" }, { status: 400 });
    const submission = createBuilderSubmission(user.id, transactionHash, agentIdentifier);
    const verifiedSubmission = await verifyBuilderSubmission(submission);
    return NextResponse.json({ progress: getBuilderProgress(user.id), submission: verifiedSubmission });
  }
  return NextResponse.json({ error: "Invalid Builder request" }, { status: 400 });
}
