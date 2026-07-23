import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const baseUrl = new URL(process.env.NORI_E2E_BASE_URL || 'https://www.masumi.network');
const chatUrl = new URL('/dev/api/nori/chat', baseUrl);
const healthUrl = new URL('/dev/api/nori/health', baseUrl);
const identityUrl = new URL('/dev/api/nori/identity', baseUrl);
const expectedCommitSha = (process.env.NORI_E2E_EXPECT_COMMIT_SHA || '').trim();
const requestTimeoutMs = positiveInteger(process.env.NORI_E2E_REQUEST_TIMEOUT_MS, 150_000);
const rolloutTimeoutMs = positiveInteger(process.env.NORI_E2E_ROLLOUT_TIMEOUT_MS, 180_000);
const runId = randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase();
const conversationId = `nori-e2e-${runId.toLowerCase()}`;

const health = await waitForExpectedDeployment();
assert.equal(health.ok, true, `Nori health endpoint is not ready: ${JSON.stringify(health)}`);

const firstMarker = `NORI_E2E_FIRST_${runId}`;
const firstPrompt = `Deployment verification. Reply with exactly ${firstMarker}. Do not call tools.`;
const first = await callNori('first-turn', {
  message: firstPrompt,
  conversationId,
});
assert.match(first.answer, new RegExp(firstMarker), 'First-turn reply did not contain its unique marker.');

const followUpMarker = `NORI_E2E_FOLLOWUP_${runId}`;
const followUp = await callNori('follow-up', {
  message: `This is the second turn. Reply with exactly ${followUpMarker}. Do not call tools.`,
  conversationId,
  history: [
    { role: 'user', content: firstPrompt },
    { role: 'assistant', content: first.answer },
  ],
});
assert.match(
  followUp.answer,
  new RegExp(followUpMarker),
  'Follow-up reply did not contain its unique marker.',
);

const longMarker = `NORI_E2E_LONG_${runId}`;
const longPrompt = [
  'Deployment length canary. This is a deterministic transcription test.',
  'Do not call tools. Output only the requested rows: no heading, explanation, bullets, code fence, ellipsis, or summary.',
  'Write exactly 140 newline-separated rows.',
  'For each integer N from 1 through 140 inclusive, write exactly:',
  'ROW NNN masumi escrow payment agent task verify settle receipt status complete',
  'Replace NNN with N zero-padded to three digits. Start at ROW 001. Do not skip, duplicate, merge, or abbreviate rows.',
  `After ROW 140, write ${longMarker} on its own line.`,
  'The marker must be the final non-whitespace text.',
].join(' ');
const long = await callNori('response-allowance', {
  message: longPrompt,
  conversationId,
  history: [
    { role: 'user', content: firstPrompt },
    { role: 'assistant', content: first.answer },
  ],
});
const normalizedLongAnswer = long.answer.replaceAll('\r\n', '\n').trim();
assert.ok(
  normalizedLongAnswer.endsWith(`\n${longMarker}`),
  `Long reply did not finish with its unique marker. Tail: ${normalizedLongAnswer.slice(-300)}`,
);
assert.equal(
  normalizedLongAnswer.split(longMarker).length - 1,
  1,
  'Long reply did not contain exactly one final marker.',
);
const longRows = [
  ...normalizedLongAnswer.matchAll(
    /^ROW (\d{3}) masumi escrow payment agent task verify settle receipt status complete$/gm,
  ),
].map((match) => Number(match[1]));
assert.ok(longRows.length >= 130, `Long reply contained only ${longRows.length} valid canary rows.`);
assert.equal(longRows[0], 1, 'Long reply did not start with ROW 001.');
assert.equal(longRows.at(-1), 140, 'Long reply did not reach ROW 140.');
assert.equal(new Set(longRows).size, longRows.length, 'Long reply duplicated one or more canary rows.');
assert.ok(
  longRows.every((value, index) => index === 0 || value > longRows[index - 1]),
  'Long reply canary rows were out of order.',
);
const longLexicalUnits = normalizedLongAnswer.split(/\s+/).length;
assert.ok(longLexicalUnits >= 1_500, `Long reply contained only ${longLexicalUnits} lexical units.`);
assert.ok(normalizedLongAnswer.length >= 8_000, `Long reply contained only ${normalizedLongAnswer.length} characters.`);
assert.ok(
  long.headersMs < 15_000,
  `Long reply stream took ${long.headersMs} ms to open; keepalives may not be flushing.`,
);

const docsMarker = `NORI_E2E_DOCS_${runId}`;
const docs = await callNori('docs-grounding', {
  message:
    'Explain briefly how to create and authenticate a Sokosumi coworker using the current developer portal. ' +
    `End the answer with ${docsMarker}.`,
  conversationId: `${conversationId}-docs`,
});
assert.match(docs.answer, new RegExp(docsMarker), 'Docs reply did not contain its unique marker.');
assert.ok(
  docs.citations.some((url) => url.startsWith('https://www.masumi.network/dev/sokosumi/')),
  `Docs reply had no canonical Sokosumi citation: ${JSON.stringify(docs.citations)}`,
);
for (const citation of docs.citations) {
  assert.doesNotMatch(
    citation,
    /docs\.masumi\.network|docs\.sokosumi\.com|localhost|\.up\.railway\.app/i,
    `Docs reply exposed a legacy or deployment-only citation: ${citation}`,
  );
}

const identity = await fetchJson(identityUrl, 'identity');
assert.equal(identity.response.status, 200, `Identity endpoint returned ${identity.response.status}.`);
assert.equal(identity.data?.ok, true, `Identity lookup failed: ${JSON.stringify(identity.data)}`);
assert.equal(identity.data?.identity?.verified, true, `Nori is not registry-verified: ${JSON.stringify(identity.data)}`);
assert.equal(
  identity.data?.identity?.status,
  'RegistrationConfirmed',
  `Nori registry status is not confirmed: ${JSON.stringify(identity.data?.identity)}`,
);

console.log(
  JSON.stringify({
    ok: true,
    runId,
    baseUrl: baseUrl.origin,
    commitSha: health.commitSha ?? null,
    cases: [
      summarize(first),
      summarize(followUp),
      summarize(long),
      summarize(docs),
      { name: 'registry-identity', verified: true },
    ],
  }),
);

async function waitForExpectedDeployment() {
  const deadline = Date.now() + rolloutTimeoutMs;
  let lastError;

  do {
    try {
      const { response, data } = await fetchJson(healthUrl, 'health');
      if (response.ok && data?.ok && commitMatches(data.commitSha)) return data;
      lastError = new Error(
        `Health response is not ready for expected commit ${expectedCommitSha || '(any)'}: ${JSON.stringify(data)}`,
      );
    } catch (error) {
      lastError = error;
    }

    if (Date.now() >= deadline) break;
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  } while (true);

  throw lastError || new Error('Nori deployment did not become ready.');
}

function commitMatches(actual) {
  if (!expectedCommitSha) return true;
  if (typeof actual !== 'string' || !actual) return false;
  return actual === expectedCommitSha || actual.startsWith(expectedCommitSha) || expectedCommitSha.startsWith(actual);
}

async function callNori(name, payload) {
  const requestId = `nori-e2e-${name}-${randomUUID()}`;
  const startedAt = Date.now();
  const response = await fetch(chatUrl, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      'X-Nori-Request-Id': requestId,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  const headersMs = Date.now() - startedAt;
  const raw = await response.text();
  const totalMs = Date.now() - startedAt;

  assert.equal(response.status, 200, `${name}: chat returned HTTP ${response.status}: ${raw.slice(0, 500)}`);
  assert.match(
    response.headers.get('content-type') || '',
    /text\/event-stream/i,
    `${name}: chat did not return SSE.`,
  );
  assert.equal(
    response.headers.get('x-nori-request-id'),
    requestId,
    `${name}: request correlation ID was not preserved.`,
  );
  const cacheControl = response.headers.get('cache-control') || '';
  assert.match(cacheControl, /no-store/i, `${name}: chat response is cacheable (${cacheControl}).`);
  assert.doesNotMatch(cacheControl, /\bpublic\b/i, `${name}: chat response is publicly cacheable (${cacheControl}).`);

  const parsed = parseSse(raw);
  assert.equal(parsed.errors.length, 0, `${name}: Nori emitted an SSE error: ${parsed.errors.join(' | ')}`);
  assert.equal(parsed.finished, true, `${name}: Nori stream had no finish or [DONE] event.`);
  assert.ok(parsed.answer.trim(), `${name}: Nori returned an empty answer.`);
  assert.doesNotMatch(
    parsed.answer,
    /Pi agent completed without an assistant reply|Nori backend returned|internal server error|Nori returned an empty answer/i,
    `${name}: Nori returned a known failure response.`,
  );

  return {
    name,
    requestId,
    answer: parsed.answer,
    citations: parsed.citations,
    headersMs,
    totalMs,
    durationHeader: response.headers.get('server-timing'),
  };
}

function parseSse(raw) {
  const blocks = raw.replaceAll('\r\n', '\n').split(/\n\n+/).filter(Boolean);
  let answer = '';
  let finished = false;
  const errors = [];
  const citations = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    const eventName = lines.find((line) => line.startsWith('event:'))?.slice(6).trim();
    const data = lines
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n')
      .trim();
    if (!data) continue;
    if (data === '[DONE]') {
      finished = true;
      continue;
    }

    let event;
    try {
      event = JSON.parse(data);
    } catch {
      if (eventName === 'error') errors.push(data);
      continue;
    }

    if (eventName === 'error' || event?.type === 'error') {
      errors.push(String(event?.errorText || event?.error || event?.message || data));
    }
    if (event?.type === 'finish') finished = true;
    if (event?.type === 'text-delta' || event?.type === 'text_delta') {
      answer += String(event.delta || event.text || '');
    }

    const citation = event?.type === 'data-citation' ? event.data : eventName === 'citation' ? event : null;
    const citationUrl = citation?.url || citation?.href;
    if (typeof citationUrl === 'string') citations.push(citationUrl);
  }

  return { answer: answer.trim(), finished, errors, citations: [...new Set(citations)] };
}

async function fetchJson(url, label) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'X-Nori-Request-Id': `nori-e2e-${label}-${randomUUID()}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`${label}: expected JSON from ${url}, got ${response.status}: ${text.slice(0, 500)}`);
  }
  return { response, data };
}

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function summarize(result) {
  return {
    name: result.name,
    requestId: result.requestId,
    answerLength: result.answer.length,
    citationCount: result.citations.length,
    headersMs: result.headersMs,
    totalMs: result.totalMs,
  };
}
