import { NextRequest, NextResponse } from "next/server";
import { builderAssessment, BUILDER_PASSING_SCORE, builderSteps } from "@/app/learn/builder-data";
import { getCurrentLearnUser } from "@/lib/learn-auth";
import { BUILDER_COURSE_VERSION, consumeRateLimit, getBuilderProgress, getCredentialForUser, recordBuilderAssessment, recordQuestionOutcomes } from "@/lib/learn-db";
import { issueBuilderCredential } from "@/lib/learn-credentials";
import { isSameOrigin } from "@/lib/learn-api";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const user = await getCurrentLearnUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const fundamentals = getCredentialForUser(user.id);
  if (!fundamentals || fundamentals.status === "revoked" || fundamentals.status === "superseded") return NextResponse.json({ error: "A valid Fundamentals credential is required" }, { status: 403 });
  if (!consumeRateLimit(`${user.id}:builder-assessment`, 10, 3600)) return NextResponse.json({ error: "Too many assessment attempts. Try again later." }, { status: 429 });
  const progress = getBuilderProgress(user.id);
  const allSteps = builderSteps.every((step) => progress.completedSteps.includes(step.key));
  if (!allSteps || progress.submission?.status !== "verified") return NextResponse.json({ error: "Complete the Builder steps and verify the Preprod proof first" }, { status: 403 });
  const body = await request.json().catch(() => null) as { answers?: Record<string, number> } | null;
  if (!body?.answers) return NextResponse.json({ error: "Invalid assessment submission" }, { status: 400 });
  const correct = builderAssessment.filter((question) => body.answers![question.id] === question.answer).length;
  const score = Math.round(correct / builderAssessment.length * 100);
  const passed = score >= BUILDER_PASSING_SCORE;
  recordBuilderAssessment(user.id, score, passed);
  recordQuestionOutcomes("builder-assessment", builderAssessment.map((question) => ({ questionId: question.id, correct: body.answers![question.id] === question.answer })), BUILDER_COURSE_VERSION);
  const credential = passed ? issueBuilderCredential(user.id, score) : null;
  return NextResponse.json({ score, passed, correctAnswers: Object.fromEntries(builderAssessment.map((question) => [question.id, question.answer])), credential });
}
