import { redirect } from "next/navigation";
import { requireLearnUser } from "@/lib/learn-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Fundamentals badge" };
export default async function CompletionPage() { await requireLearnUser("/learn/completion"); redirect("/learn/dashboard"); }
