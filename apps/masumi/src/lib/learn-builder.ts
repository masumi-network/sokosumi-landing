import "server-only";

import { BUILDER_COURSE_VERSION, updateBuilderSubmission, type BuilderSubmission } from "./learn-db";
import { learnOutboundSignal } from "./learn-api";

function boundedText(value: unknown, limit: number) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, limit) || undefined : undefined;
}

export async function verifyBuilderSubmission(submission: BuilderSubmission) {
  if (submission.status === "verified") return submission;
  const url = process.env.MASUMI_LEARN_BUILDER_VERIFY_URL;
  const token = process.env.MASUMI_LEARN_BUILDER_VERIFY_TOKEN;
  if (!url || !token) return submission;
  updateBuilderSubmission(submission.id, "verifying");
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json", "idempotency-key": submission.id },
      body: JSON.stringify({ transactionHash: submission.transactionHash, agentIdentifier: submission.agentIdentifier, courseVersion: BUILDER_COURSE_VERSION }),
      cache: "no-store",
      signal: learnOutboundSignal(),
    });
    if (!response.ok) throw new Error(`Builder verifier returned ${response.status}`);
    const result = await response.json() as { status?: "verified" | "pending" | "rejected"; reference?: string; reason?: string };
    const reference = boundedText(result.reference, 200);
    if (result.status === "verified") return updateBuilderSubmission(submission.id, "verified", { reference });
    if (result.status === "rejected") return updateBuilderSubmission(submission.id, "rejected", { reference, note: boundedText(result.reason, 500) || "Proof did not satisfy the verifier" });
    return updateBuilderSubmission(submission.id, "pending_review", { reference });
  } catch (error) {
    return updateBuilderSubmission(submission.id, "verification_error", { note: error instanceof Error ? error.message : "Builder verification failed" });
  }
}
