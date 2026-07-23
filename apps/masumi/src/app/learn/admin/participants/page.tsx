import { notFound } from "next/navigation";
import { getCurrentLearnDashboardOperator } from "@/lib/learn-admin";
import { ParticipantDashboard } from "./participant-dashboard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = {
  title: "Learn participants",
  description: "Restricted learner administration for approved Masumi Learn operators.",
  robots: { index: false, follow: false },
};

export default async function LearnParticipantsPage() {
  const operator = await getCurrentLearnDashboardOperator();
  if (!operator) notFound();
  return <ParticipantDashboard />;
}
