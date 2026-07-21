import { notFound } from "next/navigation";
import { requireLearnUser } from "@/lib/learn-auth";
import { getBuilderProgress } from "@/lib/learn-db";
import { builderAssessment, BUILDER_PASSING_SCORE, builderSteps } from "../../builder-data";
import { BuilderAssessment } from "../builder-client";

export const metadata = { title: "Builder assessment" };

export default async function BuilderAssessmentPage() {
  const user = await requireLearnUser("/learn/builder/assessment");
  const progress = getBuilderProgress(user.id);
  if (progress.submission?.status !== "verified" || !builderSteps.every((step) => progress.completedSteps.includes(step.key))) notFound();
  const questions = builderAssessment.map(({ id, prompt, options, explanation }) => ({ id, prompt, options, explanation }));
  return <BuilderAssessment questions={questions} passingScore={BUILDER_PASSING_SCORE} />;
}
