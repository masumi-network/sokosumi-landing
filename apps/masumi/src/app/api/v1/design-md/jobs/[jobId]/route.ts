import { NextResponse } from "next/server";
import { parseDesignMd } from "@/app/tools/design-md/lib/design-md";
import { getById } from "@/app/tools/design-md/lib/extractions-db";
import { getJob } from "@/app/tools/design-md/lib/jobs-db";
import { kickWorker } from "@/app/tools/design-md/lib/job-worker";
import { requireApiKey } from "../../_auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ jobId: string }> },
) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const { jobId } = await ctx.params;

  // Opportunistic — keeps the queue draining even if the original
  // kickWorker call was lost to a process restart, and times out stale rows.
  kickWorker();

  const job = getJob(jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status === "done" && job.resultMd) {
    const parsed = parseDesignMd(job.resultMd);
    const extraction =
      job.extractionId != null ? getById(job.extractionId) : null;
    return NextResponse.json({
      status: "done",
      jobId: job.id,
      url: job.url,
      source: job.resultSource,
      extractionId: job.extractionId,
      designMd: job.resultMd,
      frontmatter: parsed.frontmatter,
      prose: parsed.sections.map((s) => ({
        heading: s.heading,
        body: s.body,
      })),
      screenshotUrl: extraction?.hasScreenshot
        ? `/tools/design-md/api/screenshots/${job.extractionId}`
        : null,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      finishedAt: job.finishedAt,
    });
  }

  if (job.status === "failed") {
    return NextResponse.json({
      status: "failed",
      jobId: job.id,
      url: job.url,
      error: job.error ?? "Unknown error",
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      finishedAt: job.finishedAt,
    });
  }

  return NextResponse.json({
    status: job.status,
    jobId: job.id,
    url: job.url,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
  });
}
