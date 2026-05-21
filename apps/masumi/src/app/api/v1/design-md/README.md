# DESIGN.md Generator — Internal API

Internal-only API around the same Browserbase + LLM extraction that powers
[/tools/design-md](../../../tools/design-md). Wraps it with a SQLite-backed
job queue so callers don't have to hold a 20–60s HTTP connection open.

- **Base URL:** `https://masumi.network/api/v1/design-md`
- **Auth:** `Authorization: Bearer $INTERNAL_API_KEY` on every request
- **Storage:** reuses `data/design-md.db` (Railway volume); 7-day URL cache shared with the public tool

## Env vars

| Var | Default | Purpose |
| --- | --- | --- |
| `INTERNAL_API_KEY` | _(required)_ | Bearer token. Without it the API returns `503`. |
| `DESIGN_MD_JOB_CONCURRENCY` | `2` | Max parallel Browserbase + LLM jobs per process. |

## Endpoints

### `POST /api/v1/design-md`

Submit a URL for extraction.

**Body:**
```json
{ "url": "https://stripe.com", "force": false }
```

`force: true` bypasses the 7-day URL cache and runs a fresh extraction.

**Response — cache hit (`200`):**

The most recent saved extraction is returned immediately; no job is created.

```json
{
  "status": "done",
  "cached": true,
  "extractionId": 42,
  "source": "llm",
  "designMd": "---\nversion: alpha\nname: Stripe\n...\n---\n\n## Overview\n...",
  "frontmatter": { "name": "Stripe", "colors": { "primary": "#635bff" }, "...": "..." },
  "prose": [{ "heading": "Overview", "body": "..." }],
  "screenshotUrl": "/tools/design-md/api/screenshots/42"
}
```

**Response — cache miss (`202`):**

A job is enqueued. Poll the `pollUrl` until `status` is `done` or `failed`.

```json
{
  "status": "queued",
  "jobId": "8e1f0c1a-3d2b-4e3a-9c4d-7a1f0c1a3d2b",
  "pollUrl": "/api/v1/design-md/jobs/8e1f0c1a-3d2b-4e3a-9c4d-7a1f0c1a3d2b"
}
```

### `GET /api/v1/design-md/jobs/:jobId`

Poll job status. Suggested interval: 2–5 seconds.

**Response shapes:**

```json
{ "status": "queued",  "jobId": "...", "url": "..." }
{ "status": "running", "jobId": "...", "url": "...", "startedAt": 1716240000000 }

{
  "status": "done",
  "jobId": "...",
  "url": "https://stripe.com",
  "source": "llm",
  "extractionId": 42,
  "designMd": "---\n...\n---\n\n## ...",
  "frontmatter": { "...": "..." },
  "prose": [{ "heading": "...", "body": "..." }],
  "screenshotUrl": "/tools/design-md/api/screenshots/42"
}

{ "status": "failed", "jobId": "...", "url": "...", "error": "..." }
```

Notes:
- `extractionId` and `screenshotUrl` are only set for `source: "llm"`. Heuristic-source results aren't saved to the public gallery.
- Jobs stuck in `running` for more than 5 minutes are auto-failed with `"Job timed out"`.
- A Railway restart during a running job re-queues it on the next API hit.

## curl examples

Submit:

```bash
curl -sS -X POST https://masumi.network/api/v1/design-md \
  -H "Authorization: Bearer $INTERNAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://stripe.com"}'
```

Poll once:

```bash
curl -sS https://masumi.network/api/v1/design-md/jobs/$JOB_ID \
  -H "Authorization: Bearer $INTERNAL_API_KEY"
```

Submit and poll until done (one-liner):

```bash
JOB=$(curl -sS -X POST https://masumi.network/api/v1/design-md \
  -H "Authorization: Bearer $INTERNAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://stripe.com"}' | jq -r '.jobId // empty')

if [ -z "$JOB" ]; then
  echo "cache hit — see response above"
else
  while :; do
    STATUS=$(curl -sS https://masumi.network/api/v1/design-md/jobs/$JOB \
      -H "Authorization: Bearer $INTERNAL_API_KEY")
    echo "$STATUS" | jq -r '.status'
    echo "$STATUS" | jq -e '.status == "done" or .status == "failed"' > /dev/null && break
    sleep 3
  done
  echo "$STATUS" | jq -r '.designMd'
fi
```

## TypeScript client example

```ts
async function generateDesignMd(url: string): Promise<string> {
  const base = process.env.MASUMI_API_BASE!;
  const key = process.env.INTERNAL_API_KEY!;
  const headers = {
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json",
  };

  const submit = await fetch(`${base}/api/v1/design-md`, {
    method: "POST",
    headers,
    body: JSON.stringify({ url }),
  });
  const first = await submit.json();
  if (first.status === "done") return first.designMd;
  if (first.status !== "queued") throw new Error(`Unexpected: ${JSON.stringify(first)}`);

  while (true) {
    await new Promise((r) => setTimeout(r, 3000));
    const poll = await fetch(`${base}${first.pollUrl}`, { headers });
    const job = await poll.json();
    if (job.status === "done") return job.designMd;
    if (job.status === "failed") throw new Error(job.error);
  }
}
```

## Error responses

| Status | Body | Cause |
| --- | --- | --- |
| `400` | `{ "error": "Invalid JSON body" }` | Body wasn't JSON |
| `400` | `{ "error": "Missing 'url' field" }` | URL not provided |
| `401` | `{ "error": "Unauthorized" }` | Missing or wrong bearer token |
| `404` | `{ "error": "Job not found" }` | Bad `jobId` |
| `503` | `{ "error": "INTERNAL_API_KEY not configured on server" }` | Env var missing on server |
