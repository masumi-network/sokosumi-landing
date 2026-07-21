import { CourseOverview } from "../learn-client";
import { PASSING_SCORE, units } from "../course-data";
import { requireLearnUser } from "@/lib/learn-auth";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { title: "Fundamentals course" };
export default async function CoursePage() { await requireLearnUser("/learn/course"); const summaries = units.map(({ slug, number, title, summary, duration }) => ({ slug, number, title, summary, duration })); return <><div className="mb-10"><p className="text-xs uppercase tracking-[0.18em] text-[#A50045]">Masumi Fundamentals</p><h1 className="mt-3 text-5xl font-medium tracking-tight sm:text-7xl">Your learning path</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-black/60">Unit 0 helps you choose a route. Four assessed foundations then move from the agent economy to trusted payment outcomes.</p><Link href="/learn/start" className="mt-5 inline-block rounded-full border border-black/15 px-5 py-3 text-sm">Review Unit 0 and baseline →</Link></div><CourseOverview units={summaries} passingScore={PASSING_SCORE} /></>; }
