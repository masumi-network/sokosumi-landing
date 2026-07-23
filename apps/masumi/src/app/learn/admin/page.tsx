import { notFound } from "next/navigation";
import { getCurrentLearnDashboardOperator } from "@/lib/learn-admin";
import { AdminDashboard } from "./admin-dashboard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = {
  title: "Learn admin analytics",
  description: "Privacy-preserving aggregate analytics for Masumi Learn operators.",
};

export default async function LearnAdminPage() {
  const operator = await getCurrentLearnDashboardOperator();
  if (!operator) notFound();

  return <AdminDashboard />;
}
