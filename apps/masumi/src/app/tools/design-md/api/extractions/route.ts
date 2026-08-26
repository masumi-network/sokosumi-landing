import { NextResponse } from "next/server";
import { getAll } from "../../lib/extractions-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const entries = getAll(120).map((entry) => ({
      ...entry,
      screenshotUrl: entry.hasScreenshot
        ? `/tools/design-md/api/screenshots/${entry.id}`
        : null,
    }));

    return NextResponse.json({ entries, total: entries.length });
  } catch (error) {
    console.error("[design-md gallery api]", error);
    return NextResponse.json({ entries: [], total: 0 });
  }
}
