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
| `AI_GATEWAY_API_KEY` | _(required for `source: "llm"`)_ | Vercel AI Gateway key (`sumi-sites-free-tools`, masumi team, $25/month budget). Without a working key every job falls back to `heuristic`. |
| `DESIGN_MD_MODEL` | `anthropic/claude-haiku-5.5` | AI Gateway model id. |

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

### The `done` payload

Returned by the poll endpoint, and by `POST` on a cache hit (which adds `cached: true` and has no `jobId`, `url` or timestamps; the sokosumi proxy adds `url`).

| Field | Type | Notes |
| --- | --- | --- |
| `status` | `"done"` | |
| `jobId` | `string` | Poll responses only. |
| `url` | `string` | The URL as submitted. Poll responses only. |
| `source` | `"llm" \| "heuristic"` | `llm` is the full analysis. `heuristic` is the fallback when the model is unavailable: real measured tokens, fewer of them, no written voice or rationale. Retry later with `force: true` to get an `llm` result. |
| `extractionId` | `number` | Always set. Preview at `https://www.sokosumi.com/tools/design-md?analysis=<extractionId>`. |
| `designMd` | `string` | The complete file. **This is the result; store this.** |
| `frontmatter` | `object` | `designMd`'s YAML front matter, parsed. Convenience copy. |
| `prose` | `{ heading, body }[]` | `designMd`'s `##` sections, split. Convenience copy. |
| `screenshotUrl` | `string \| null` | Path relative to the masumi origin. `null` only when the page could not be rendered in a browser (plain-fetch fallback). |
| `createdAt`, `startedAt`, `finishedAt` | `number` | Unix ms. Poll responses only. |

`frontmatter` and `prose` duplicate `designMd`; clients that only store the file can ignore them.

Other notes:
- Only `source: "llm"` results appear in the public gallery or are served from the 7-day cache. A `heuristic` result never blocks a later `llm` one.
- `name` in the front matter is the brand, not the page: a subpage such as `/pages/about` is named from `og:site_name` or the domain.
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
