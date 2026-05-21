import { extractFromUrl } from "./extract-from-url";
import { saveExtraction } from "./extractions-db";
import { serializeDesignMd } from "./design-md";
import {
  claimNextJob,
  completeJob,
  failJob,
  failStaleRunning,
  resetOrphanedRunning,
  type Job,
} from "./jobs-db";

// How many extraction jobs can run in parallel inside this Node process.
// Each one holds an open Browserbase session + an LLM call, so keep it small.
const MAX_CONCURRENT = Number(process.env.DESIGN_MD_JOB_CONCURRENCY ?? 2);

// Hard ceiling — if a job sits in 'running' past this it's marked failed by
// the next kick. extractFromUrl normally finishes in 20-60s.
const STALE_MS = 5 * 60 * 1000;

let running = 0;
let bootReset = false;

export function kickWorker(): void {
  if (!bootReset) {
    bootReset = true;
    const orphaned = resetOrphanedRunning();
    if (orphaned > 0) {
      console.log(`[job-worker] reset ${orphaned} orphaned running jobs from previous process`);
    }
  }

  failStaleRunning(STALE_MS);

  while (running < MAX_CONCURRENT) {
    const job = claimNextJob();
    if (!job) return;
    running++;
    runJob(job)
      .catch((e) => {
        console.error(`[job-worker] unhandled error for ${job.id}:`, e);
      })
      .finally(() => {
        running--;
        // Drain anything else that's queued.
        kickWorker();
      });
  }
}

async function runJob(job: Job): Promise<void> {
  console.log(`[job-worker] starting ${job.id} for ${job.url}`);
  try {
    const result = await extractFromUrl(job.url, { force: job.force });

    const designMd = serializeDesignMd({
      frontmatter: result.frontmatter,
      sections: result.prose.map((p) => ({
        heading: p.heading,
        body: p.body,
      })),
      raw: "",
    });

    // Only LLM-source extractions go into the public gallery; heuristic
    // fallbacks would clutter it with low-quality entries. Matches the
    // policy in /tools/design-md/api/extract.
    let extractionId: number | null = null;
    if (result.source === "llm") {
      extractionId = saveExtraction({
        url: job.url,
        name: result.frontmatter.name ?? null,
        primaryColor: result.frontmatter.colors?.primary ?? null,
        logoUrl: result.frontmatter.logo?.src ?? null,
        screenshot: result.screenshot ?? null,
        designMd,
        source: result.source,
      });
    }

    completeJob(job.id, extractionId, designMd, result.source);
    console.log(`[job-worker] done ${job.id} (extraction=${extractionId}, source=${result.source})`);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    failJob(job.id, message);
    console.error(`[job-worker] failed ${job.id}:`, message);
  }
}
