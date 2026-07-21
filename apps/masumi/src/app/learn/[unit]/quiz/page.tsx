import { notFound } from "next/navigation";
import { getUnit, PASSING_SCORE, units } from "../../course-data";
import { Quiz } from "../../learn-client";
import { requireLearnUser } from "@/lib/learn-auth";

export function generateStaticParams() { return units.map((unit) => ({ unit: unit.slug })); }
export default async function QuizPage({ params }: { params: Promise<{ unit: string }> }) { const { unit: slug } = await params; const unit = getUnit(slug); if (!unit) notFound(); await requireLearnUser(`/learn/${slug}/quiz`); const summary = { slug: unit.slug, number: unit.number, title: unit.title, summary: unit.summary, duration: unit.duration }; const questions = unit.quiz.map((question) => ({ id: question.id, prompt: question.prompt, options: question.options, explanation: question.explanation })); return <Quiz unit={summary} questions={questions} passingScore={PASSING_SCORE} />; }
