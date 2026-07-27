import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';

const baseUrl = new URL(process.env.NORI_E2E_BASE_URL || 'https://www.masumi.network');
const requestTimeoutMs = positiveInteger(process.env.NORI_E2E_REQUEST_TIMEOUT_MS, 150_000);
const settlementTimeoutMs = positiveInteger(process.env.NORI_E2E_PAYMENT_TIMEOUT_MS, 8 * 60_000);
const pollIntervalMs = positiveInteger(process.env.NORI_E2E_PAYMENT_POLL_INTERVAL_MS, 5_000);
const runId = randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase();
const prompt =
  process.env.NORI_E2E_PAYMENT_PROMPT ||
  `Paid-flow verification ${runId}. Explain the Masumi escrow payment lifecycle in one short paragraph.`;

const chatResponse = await fetch(new URL('/dev/api/nori/chat', baseUrl), {
  method: 'POST',
  headers: {
    Accept: 'text/event-stream',
    'Content-Type': 'application/json',
    'X-Nori-Request-Id': `nori-payment-e2e-${runId}`,
  },
  body: JSON.stringify({
    message: prompt,
    conversationId: `nori-payment-e2e-${runId.toLowerCase()}`,
  }),
  signal: AbortSignal.timeout(requestTimeoutMs),
});

assert.equal(chatResponse.status, 200, `Nori chat returned HTTP ${chatResponse.status}.`);
assert.match(chatResponse.headers.get('content-type') || '', /text\/event-stream/i);
assert.ok(chatResponse.body, 'Nori chat returned no response stream.');

let answer = '';
let paymentEvent;
let completionPromise;
let buffer = '';
const reader = chatResponse.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  const blocks = eventBlocks(buffer);
  buffer = blocks.rest;
  for (const block of blocks.complete) handleBlock(block);
}

buffer += decoder.decode();
if (buffer.trim()) handleBlock(buffer);

assert.ok(paymentEvent, 'Nori chat emitted no Masumi payment event.');
assert.ok(completionPromise, 'Payment completion did not start when the event arrived.');
assert.ok(answer.trim(), 'Nori returned no answer for the paid task.');

let session = await completionPromise;
assert.notEqual(session.status, 'failed', paymentFailure(session));

session = await waitForStatus(
  session,
  (value) => value.status === 'funds_locked' || value.status === 'result_submitted',
);

if (session.status === 'funds_locked') {
  const resultHash = createHash('sha256').update(answer.trim()).digest('hex');
  session = await postJson('/dev/api/nori/payment/submit-result', {
    sessionId: session.sessionId,
    taskId: session.taskId,
    blockchainIdentifier: session.blockchainIdentifier,
    resultHash,
  });
  assert.notEqual(session.status, 'failed', paymentFailure(session));
  session = await waitForStatus(session, (value) => value.status === 'result_submitted');
}

assert.equal(session.status, 'result_submitted', paymentFailure(session));
assert.match(session.resultHash || '', /^[a-f0-9]{64}$/i, 'The result hash was not recorded.');
assert.ok(session.txHash, 'The completed payment has no Cardano transaction hash.');

console.log(
  JSON.stringify({
    ok: true,
    runId,
    baseUrl: baseUrl.origin,
    sessionId: session.sessionId,
    purchaseId: session.purchaseId,
    status: session.status,
    txHash: session.txHash,
    explorerUrl: session.explorerLinks?.transaction ?? null,
  }),
);

function handleBlock(block) {
  const dataText = block
    .split(/\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n')
    .trim();
  if (!dataText || dataText === '[DONE]') return;

  let data;
  try {
    data = JSON.parse(dataText);
  } catch {
    return;
  }

  if (data?.type === 'error') {
    throw new Error(String(data.errorText || data.error || data.message || 'Nori stream failed.'));
  }
  if (data?.type === 'text-delta' || data?.type === 'text_delta') {
    answer += String(data.delta || data.text || '');
  }

  const event = paymentEventFromValue(data);
  if (event && !paymentEvent) {
    paymentEvent = event;
    // This call intentionally starts before the chat stream finishes. Nori may
    // wait for escrow before it emits the answer and terminal stream event.
    completionPromise = postJson('/dev/api/nori/payment/complete', event);
  }
}

async function waitForStatus(initialSession, accepts) {
  const deadline = Date.now() + settlementTimeoutMs;
  let current = initialSession;

  while (!accepts(current)) {
    assert.notEqual(current.status, 'failed', paymentFailure(current));
    if (Date.now() >= deadline) {
      throw new Error(
        `Payment did not settle within ${settlementTimeoutMs}ms (last status: ${current.status || 'unknown'}).`,
      );
    }
    await wait(pollIntervalMs);
    const params = new URLSearchParams({ sessionId: current.sessionId });
    current = await getJson(`/dev/api/nori/payment/status?${params.toString()}`);
  }

  return current;
}

async function postJson(path, body) {
  const response = await fetch(new URL(path, baseUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  return readSession(response, path);
}

async function getJson(path) {
  const response = await fetch(new URL(path, baseUrl), {
    cache: 'no-store',
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  return readSession(response, path);
}

async function readSession(response, label) {
  const payload = await response.json().catch(() => ({}));
  assert.equal(
    response.status,
    200,
    `${label} returned HTTP ${response.status}: ${JSON.stringify(payload).slice(0, 500)}`,
  );
  assert.equal(payload.ok, true, `${label} failed: ${JSON.stringify(payload).slice(0, 500)}`);
  assert.ok(payload.session, `${label} returned no payment session.`);
  return payload.session;
}

function paymentEventFromValue(value, depth = 0) {
  if (depth > 6 || !value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (isPayment(value)) {
    return {
      taskId: stringValue(value.taskId) || undefined,
      eventId: stringValue(value.eventId) || undefined,
      masumiPayment: value,
    };
  }

  const direct = value.masumiPayment ?? value.payment;
  if (isPayment(direct)) {
    return {
      taskId: stringValue(value.taskId) || stringValue(value.id) || undefined,
      eventId: stringValue(value.eventId) || undefined,
      masumiPayment: direct,
    };
  }

  for (const child of Object.values(value)) {
    const nested = paymentEventFromValue(child, depth + 1);
    if (nested) return nested;
  }
  return null;
}

function isPayment(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof value.blockchainIdentifier === 'string' &&
      typeof value.agentIdentifier === 'string' &&
      typeof value.sellerVkey === 'string' &&
      typeof value.inputHash === 'string',
  );
}

function eventBlocks(value) {
  const blocks = value.replaceAll('\r\n', '\n').split(/\n\n/);
  return { complete: blocks.slice(0, -1), rest: blocks.at(-1) ?? '' };
}

function stringValue(value) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function paymentFailure(session) {
  return `Payment failed (${session.status || 'unknown'}): ${session.errorType || ''} ${session.errorNote || ''}`.trim();
}

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
