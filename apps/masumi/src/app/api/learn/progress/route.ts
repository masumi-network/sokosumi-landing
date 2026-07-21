import { NextRequest, NextResponse } from "next/server";
import { getCurrentLearnUser } from "@/lib/learn-auth";
import { getProgress, markLessonComplete } from "@/lib/learn-db";
import { getUnit } from "@/app/learn/course-data";
import { isSameOrigin } from "@/lib/learn-api";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentLearnUser();
  return user ? NextResponse.json(getProgress(user.id)) : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const user = await getCurrentLearnUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { action?: string; unit?: string; units?: string[] } | null;
  if (body?.action === "import_local_lessons" && Array.isArray(body.units)) {
    for (const slug of Array.from(new Set(body.units)).slice(0, 20)) if (getUnit(slug)) markLessonComplete(user.id, slug);
    return NextResponse.json(getProgress(user.id));
  }
  if (body?.action !== "complete_lesson" || !body.unit || !getUnit(body.unit)) return NextResponse.json({ error: "Invalid progress request" }, { status: 400 });
  markLessonComplete(user.id, body.unit);
  return NextResponse.json(getProgress(user.id));
}
