import { finalAssessment, PASSING_SCORE, units } from "../course-data";
import { Assessment } from "../learn-client";
import { requireLearnUser } from "@/lib/learn-auth";
import { getProgress } from "@/lib/learn-db";
export const metadata = { title: "Fundamentals assessment" };
export default async function AssessmentPage() { const user = await requireLearnUser("/learn/assessment"); const progress = getProgress(user.id); const questions = finalAssessment.map((question) => ({ id: question.id, prompt: question.prompt, options: question.options, explanation: question.explanation })); return <Assessment questions={questions} passingScore={PASSING_SCORE} unlocked={progress.passedQuizzes.length === units.length} passedCount={progress.passedQuizzes.length} unitCount={units.length} />; }
