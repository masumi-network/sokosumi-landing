import { NextRequest, NextResponse } from "next/server";
import { getCurrentLearnUser } from "@/lib/learn-auth";
import { consumeRateLimit, getProgress, recordAssessment, recordQuestionOutcomes } from "@/lib/learn-db";
import { finalAssessment, PASSING_SCORE, units } from "@/app/learn/course-data";
import { issueCredential } from "@/lib/learn-credentials";
import { isSameOrigin } from "@/lib/learn-api";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const user = await getCurrentLearnUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!consumeRateLimit(`${user.id}:assessment`, 10, 3600)) return NextResponse.json({ error: "Too many assessment attempts. Try again later." }, { status: 429 });
  const progress = getProgress(user.id);
  if (progress.passedQuizzes.length !== units.length) return NextResponse.json({ error: "Pass all unit quizzes first" }, { status: 403 });
  const body = await request.json().catch(() => null) as { answers?: Record<string, number> } | null;
  if (!body?.answers) return NextResponse.json({ error: "Invalid assessment submission" }, { status: 400 });
  const correct = finalAssessment.filter((q) => body.answers![q.id] === q.answer).length;
  const score = Math.round(correct / finalAssessment.length * 100);
  const passed = score >= PASSING_SCORE;
  recordAssessment(user.id, score, passed);
  recordQuestionOutcomes("assessment", finalAssessment.map((question) => ({ questionId: question.id, correct: body.answers![question.id] === question.answer })));
  const credential = passed ? issueCredential(user.id, score) : null;
  return NextResponse.json({ score, passed, correctAnswers: Object.fromEntries(finalAssessment.map((q) => [q.id, q.answer])), credential });
}
