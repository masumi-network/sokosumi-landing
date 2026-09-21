import { NextResponse } from "next/server";
import { getAll } from "../../lib/extractions-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Every brand, not the newest 120: the sokosumi gallery pages through the
    // whole list now, and a cap there silently dropped older brands out of the
    // gallery AND out of the sitemap, so pages that had been indexed
    // disappeared. Consumers that want fewer can slice.
    const entries = getAll(5000).map((entry) => ({
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
