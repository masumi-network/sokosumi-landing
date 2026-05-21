import { NextResponse } from "next/server";
import { parseDesignMd } from "@/app/tools/design-md/lib/design-md";
import { getRecentByUrl } from "@/app/tools/design-md/lib/extractions-db";
import { enqueueJob } from "@/app/tools/design-md/lib/jobs-db";
import { kickWorker } from "@/app/tools/design-md/lib/job-worker";
import { requireApiKey } from "./_auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Same TTL as /tools/design-md/api/extract — brand identity rarely changes
// within a week, so repeat URLs return the saved row instantly.
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  let url: string | undefined;
  let force = false;
  try {
    const body = await req.json();
    url = typeof body?.url === "string" ? body.url.trim() : undefined;
    force = body?.force === true;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json({ error: "Missing 'url' field" }, { status: 400 });
  }

  // Fast path: cache hit returns synchronously. Same logic as the public
  // /tools/design-md/api/extract route.
  if (!force) {
    try {
      const cached = getRecentByUrl(url, CACHE_TTL_MS);
      if (cached) {
        const parsed = parseDesignMd(cached.designMd);
        return NextResponse.json({
          status: "done",
          cached: true,
          extractionId: cached.id,
          source: cached.source,
          designMd: cached.designMd,
          frontmatter: parsed.frontmatter,
          prose: parsed.sections.map((s) => ({
            heading: s.heading,
            body: s.body,
          })),
          screenshotUrl: cached.hasScreenshot
            ? `/tools/design-md/api/screenshots/${cached.id}`
            : null,
        });
      }
    } catch (e) {
      console.error("[api/v1/design-md] cache lookup error:", e);
      // fall through and enqueue
    }
  }

  const jobId = enqueueJob(url, force);
  // Fire-and-forget — kickWorker starts work in the same process. The
  // response goes out as soon as the job row is committed.
  kickWorker();

  return NextResponse.json(
    {
      status: "queued",
      jobId,
      pollUrl: `/api/v1/design-md/jobs/${jobId}`,
    },
    { status: 202 },
  );
}
