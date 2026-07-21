import { NextRequest, NextResponse } from "next/server";
import { getCurrentLearnUser } from "@/lib/learn-auth";
import { consumeRateLimit, getProgress, recordQuestionOutcomes, recordQuizAttempt } from "@/lib/learn-db";
import { getUnit, PASSING_SCORE } from "@/app/learn/course-data";
import { isSameOrigin } from "@/lib/learn-api";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const user = await getCurrentLearnUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!consumeRateLimit(`${user.id}:quiz`, 30, 3600)) return NextResponse.json({ error: "Too many quiz attempts. Try again later." }, { status: 429 });
  const body = await request.json().catch(() => null) as { unit?: string; answers?: Record<string, number> } | null;
  const unit = body?.unit ? getUnit(body.unit) : null;
  if (!unit || !body?.answers) return NextResponse.json({ error: "Invalid quiz submission" }, { status: 400 });
  const correct = unit.quiz.filter((question) => body.answers![question.id] === question.answer).length;
  const score = Math.round(correct / unit.quiz.length * 100);
  const passed = score >= PASSING_SCORE;
  recordQuizAttempt(user.id, unit.slug, score, passed);
  recordQuestionOutcomes(`unit:${unit.slug}`, unit.quiz.map((question) => ({ questionId: question.id, correct: body.answers![question.id] === question.answer })));
  return NextResponse.json({ score, passed, correctAnswers: Object.fromEntries(unit.quiz.map((q) => [q.id, q.answer])), progress: getProgress(user.id) });
}
