import { createHmac } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { canonicalDocsUrl, portalUrl } from '@/lib/base-path';
import {
  createNoriRequestContext,
  errorDetails,
  logNoriEvent,
  type NoriRequestContext,
  withNoriRequestHeaders,
} from '@/lib/nori-observability';
import { getAllPages } from '@/lib/source';

export const dynamic = 'force-dynamic';

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
};

const AI_STREAM_HEADERS = {
  ...SSE_HEADERS,
  'x-vercel-ai-ui-message-stream': 'v1',
};

const NORI_UPSTREAM_MAX_ATTEMPTS = 2;
// The Nori runtime allows a model call to run for 120 seconds. Keep this
// bridge open slightly longer so a valid long answer is not aborted first.
const NORI_UPSTREAM_DEADLINE_MS = 130_000;
const NORI_STREAM_KEEPALIVE_MS = 10_000;
const NORI_RESPONSE_MESSAGE_ID = 'response-message';

type ChatRole = 'user' | 'assistant' | 'system';
type NoriDocsContext = ReturnType<typeof createNoriDocsContext>;

interface HistoryMessage {
  role: Exclude<ChatRole, 'system'>;
  content: string;
}

interface Citation {
  title?: string;
  section?: string;
  url?: string;
  path?: string;
}

interface PaymentEvent {
  taskId?: string;
  eventId?: string;
  masumiPayment: Record<string, unknown>;
}

function dataSse(data: unknown) {
  if (data === '[DONE]') return 'data: [DONE]\n\n';
  return `data: ${JSON.stringify(data)}\n\n`;
}

function streamAiEvents(events: unknown[], status = 200, requestId?: string) {
  const encoder = new TextEncoder();
  const headers = new Headers(AI_STREAM_HEADERS);
  if (requestId) headers.set('x-nori-request-id', requestId);

  return new NextResponse(
    new ReadableStream({
      start(controller) {
        for (const event of events) {
          controller.enqueue(encoder.encode(dataSse(event)));
        }
        controller.close();
      },
    }),
    {
      status,
      headers,
    },
  );
}

function sseBlockData(block: string) {
  return block
    .split(/\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n')
    .trim();
}

function isTerminalSseBlock(block: string) {
  const data = sseBlockData(block);
  if (data === '[DONE]') return true;

  try {
    const parsed = JSON.parse(data) as unknown;
    return Boolean(parsed && typeof parsed === 'object' && (parsed as Record<string, unknown>).type === 'finish');
  } catch {
    return false;
  }
}

function parsedSseJsonData(block: string): unknown {
  const data = sseBlockData(block);
  if (!data || data === '[DONE]') return data;

  try {
    return JSON.parse(data) as unknown;
  } catch {
    return undefined;
  }
}

function isCitationSseBlock(block: string) {
  const parsed = parsedSseJsonData(block);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const record = parsed as Record<string, unknown>;
    if (record.type === 'data-citation') return true;
  }

  return block
    .split(/\n/)
    .some((line) => line.startsWith('event:') && line.slice(6).trim() === 'citation');
}

function shouldInjectCitationsBeforeBlock(block: string) {
  const parsed = parsedSseJsonData(block);
  if (parsed === '[DONE]') return true;
  return Boolean(parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed as Record<string, unknown>).type === 'finish');
}

function normalizeCitation(citation: Citation): Citation {
  const normalized: Citation = { ...citation };

  if (citation.url) {
    normalized.url = canonicalDocsUrl(citation.url);
  }

  if (citation.path) {
    const canonicalUrl = canonicalDocsUrl(citation.path);
    if (/^https?:\/\//.test(canonicalUrl)) {
      normalized.url ??= canonicalUrl;
    } else {
      normalized.path = canonicalUrl;
    }
  }

  return normalized;
}

function normalizeNoriStreamData(data: unknown, eventName?: string): unknown {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data;

  const record = data as Record<string, unknown>;

  if (record.type === 'data-citation' && record.data && typeof record.data === 'object') {
    return {
      ...record,
      data: normalizeCitation(record.data as Citation),
    };
  }

  if (eventName === 'citation') {
    return normalizeCitation(record as Citation);
  }

  if (Array.isArray(record.citations)) {
    return {
      ...record,
      citations: record.citations.map((item) =>
        item && typeof item === 'object' ? normalizeCitation(item as Citation) : item,
      ),
    };
  }

  return data;
}

function normalizeSseBlock(block: string) {
  const data = sseBlockData(block);
  if (!data || data === '[DONE]') return `${block}\n\n`;

  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return `${block}\n\n`;
  }

  const eventName = block
    .split(/\n/)
    .find((line) => line.startsWith('event:'))
    ?.slice(6)
    .trim();
  const normalized = normalizeNoriStreamData(parsed, eventName);
  if (normalized === parsed) return `${block}\n\n`;

  const passthroughLines = block.split(/\n/).filter((line) => !line.startsWith('data:'));
  return `${[...passthroughLines, `data: ${JSON.stringify(normalized)}`].join('\n')}\n\n`;
}

function createPriorityDocsCitations(message: string, docsContext: NoriDocsContext): Citation[] {
  if (!needsFreshSokosumiDocsGuidance(message)) return [];

  const baseUrl = docsContext.canonicalBaseUrl;
  return [
    {
      title: 'Coworkers',
      url: `${baseUrl}/sokosumi/documentation/coworkers`,
    },
    {
      title: 'Pi Sokosumi',
      url: `${baseUrl}/sokosumi/documentation/pysokosumi`,
    },
    {
      title: 'Coworker API reference',
      url: `${baseUrl}/sokosumi/api-reference/coworkers/coworkers/get`,
    },
  ];
}

function priorityCitationBlocks(citations: Citation[]) {
  return citations.map((citation) => dataSse({ type: 'data-citation', data: normalizeCitation(citation) })).join('');
}

function normalizeAndCloseOnTerminalEvent(
  body: ReadableStream<Uint8Array>,
  ctx: NoriRequestContext,
  priorityCitations: Citation[] = [],
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';
  let emittedPriorityCitations = false;
  let sawPaymentEvent = false;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split(/\n\n/);
          buffer = blocks.at(-1) ?? '';

          let shouldClose = false;
          for (const block of blocks.slice(0, -1)) {
            const parsed = parsedSseJsonData(block);
            if (!sawPaymentEvent && paymentEventFromValue(parsed)) {
              sawPaymentEvent = true;
              logNoriEvent(ctx, 'info', 'chat_payment_event_received');
            }
            if (priorityCitations.length > 0 && isCitationSseBlock(block)) continue;
            if (
              priorityCitations.length > 0 &&
              !emittedPriorityCitations &&
              shouldInjectCitationsBeforeBlock(block)
            ) {
              controller.enqueue(encoder.encode(priorityCitationBlocks(priorityCitations)));
              emittedPriorityCitations = true;
            }
            controller.enqueue(encoder.encode(normalizeSseBlock(block)));
            if (isTerminalSseBlock(block)) {
              shouldClose = true;
              logNoriEvent(ctx, 'info', 'chat_stream_terminal', { sawPaymentEvent });
              if (!sawPaymentEvent) {
                logNoriEvent(ctx, 'warn', 'chat_payment_event_missing');
              }
            }
          }

          if (shouldClose) {
            await reader.cancel().catch(() => undefined);
            break;
          }
        }

        buffer += decoder.decode();
        if (buffer.trim()) {
          const parsed = parsedSseJsonData(buffer);
          if (!sawPaymentEvent && paymentEventFromValue(parsed)) {
            sawPaymentEvent = true;
            logNoriEvent(ctx, 'info', 'chat_payment_event_received');
          }
          const suppressBuffer = priorityCitations.length > 0 && isCitationSseBlock(buffer);
          if (
            priorityCitations.length > 0 &&
            !emittedPriorityCitations &&
            (suppressBuffer || shouldInjectCitationsBeforeBlock(buffer))
          ) {
            controller.enqueue(encoder.encode(priorityCitationBlocks(priorityCitations)));
            emittedPriorityCitations = true;
          }
          if (!suppressBuffer) {
            controller.enqueue(encoder.encode(normalizeSseBlock(buffer)));
          }
        }
        controller.close();
      } catch (error) {
        logNoriEvent(ctx, 'error', 'chat_stream_failed', { error: errorDetails(error) });
        controller.error(error);
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
}

function errorStream(message: string, status = 200, requestId?: string) {
  return streamAiEvents(
    [
      { type: 'error', errorText: message, requestId },
      { type: 'finish' },
      '[DONE]',
    ],
    status,
    requestId,
  );
}

async function jsonOrText(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) return response.json();
  return response.text();
}

function textFromContent(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (!Array.isArray(value)) return '';

  return value
    .map((part) => {
      if (typeof part === 'string') return part;
      if (!part || typeof part !== 'object') return '';
      const record = part as Record<string, unknown>;
      return String(record.text ?? record.content ?? record.input_text ?? '');
    })
    .filter(Boolean)
    .join('\n')
    .trim();
}

function textFromMessage(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';

  const record = value as Record<string, unknown>;
  return (
    textFromContent(record.parts) ||
    textFromContent(record.content) ||
    textFromContent(record.text) ||
    textFromContent(record.body)
  );
}

function lastMessageText(messages: unknown): string {
  if (!Array.isArray(messages)) return '';

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    const role = message && typeof message === 'object' ? (message as Record<string, unknown>).role : undefined;
    if (role && role !== 'user' && role !== 'system') continue;

    const text = textFromMessage(message);
    if (text) return text;
  }

  return '';
}

function normalizeHistory(value: unknown): HistoryMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): HistoryMessage | null => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const role = record.role === 'assistant' ? 'assistant' : record.role === 'user' ? 'user' : null;
      const content = textFromContent(record.content);
      if (!role || !content) return null;
      return { role, content };
    })
    .filter((item): item is HistoryMessage => Boolean(item))
    .slice(-12);
}

function toSokosumiMessage(message: { role: ChatRole; content: string }, index: number) {
  return {
    id: `docs-${message.role}-${index}`,
    role: message.role,
    content: message.content,
    parts: [{ type: 'text', text: message.content }],
  };
}

function normalizeIncomingMessages(value: unknown): Array<ReturnType<typeof toSokosumiMessage>> {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const role = record.role === 'assistant' || record.role === 'system' ? record.role : 'user';
      const content = textFromMessage(record);
      if (!content) return null;
      return toSokosumiMessage({ role, content }, index);
    })
    .filter((item): item is ReturnType<typeof toSokosumiMessage> => Boolean(item));
}

function needsFreshSokosumiDocsGuidance(message: string) {
  return /\b(coworker|co-worker|coworkers|co-workers|pysokosumi|py sokosumi|pi sokosumi|pi-sokosumi)\b/i.test(message);
}

function createFreshSokosumiDocsGuidance(message: string, docsContext: NoriDocsContext) {
  if (!needsFreshSokosumiDocsGuidance(message)) return '';

  const baseUrl = docsContext.canonicalBaseUrl;
  return [
    'Developer portal freshness note for Nori. Do not quote this block directly.',
    `Use the current DevHub docs under ${baseUrl}; do not cite docs.masumi.network, docs.sokosumi.com, or Railway preview URLs.`,
    '',
    'For questions about creating, registering, connecting, or running Sokosumi coworkers:',
    `- Primary guide: ${baseUrl}/sokosumi/documentation/coworkers`,
    `- Pi Sokosumi guide: ${baseUrl}/sokosumi/documentation/pysokosumi`,
    `- API reference: ${baseUrl}/sokosumi/api-reference/coworkers/coworkers/get`,
    '',
    'Authoritative coworker flow:',
    '1. Create the coworker profile in Sokosumi with an admin API key or `sokosumi coworkers register`.',
    '2. Set `capabilities` to `chat`, `tasks`, or both. Chat coworkers need an OpenAI Responses-compatible `baseURL`; task coworkers need a worker process.',
    '3. Whitelist the coworker with `PATCH /coworkers/{id}/whitelist`.',
    '4. Create a dedicated coworker API key with `POST /coworkers/{id}/api-keys` and run the agent with `SOKOSUMI_COWORKER_API_KEY`.',
    '5. Verify the runtime token with `GET /coworkers/me`.',
    '6. Task coworkers poll `GET /coworkers/me/events`, create task events, and report billable usage with `POST /coworkers/me/usage`.',
    '',
    'Pi Sokosumi/PySokosumi note: teams may say PySokosumi, but the current public helper is the TypeScript package `@masumi-network/pi-sokosumi`, installed from `github:masumi-network/pi-sokosumi` until it is published to npm.',
  ].join('\n');
}

function withFreshDocsGuidance(message: string, docsContext: NoriDocsContext) {
  const guidance = createFreshSokosumiDocsGuidance(message, docsContext);
  if (!guidance) return message;

  return `${guidance}\n\nUser question:\n${message}`;
}

function createSokosumiChatPayload(
  payload: Record<string, unknown>,
  message: string,
  docsContext = createNoriDocsContext(),
  userId = 'docs-user',
) {
  const freshDocsGuidance = createFreshSokosumiDocsGuidance(message, docsContext);
  const routedMessage = freshDocsGuidance ? withFreshDocsGuidance(message, docsContext) : message;
  const history = normalizeHistory(payload.history);
  const incomingMessages = normalizeIncomingMessages(payload.messages);
  const messages =
    incomingMessages.length > 0
      ? incomingMessages
      : [...history, { role: 'user' as const, content: message }].map((item, index) =>
          toSokosumiMessage(item, index),
        );

  const metadata = {
    ...(payload.metadata && typeof payload.metadata === 'object' ? (payload.metadata as Record<string, unknown>) : {}),
    agentId: 'nori',
    coworker: 'nori',
    coworker_slug: 'nori',
    source: 'masumi-dev-portal',
    surface: 'docs',
    credits: 0.25,
    messages: history,
    docsContext,
    docs_context: docsContext,
    freshDocsGuidance,
    ...(payload.page && typeof payload.page === 'object' ? { page: payload.page } : {}),
  };

  return {
    messages,
    message: routedMessage,
    userId,
    input: routedMessage,
    prompt: routedMessage,
    history,
    docsContext,
    docs_context: docsContext,
    ...(payload.page && typeof payload.page === 'object' ? { page: payload.page } : {}),
    metadata,
    agentId: 'nori',
    surface: 'docs',
    ...(typeof payload.conversationId === 'string' ? { conversationId: payload.conversationId } : {}),
    ...(typeof payload.model === 'string' ? { model: payload.model } : {}),
  };
}

function createNoriDocsContext() {
  const pages = getAllPages();

  return {
    name: 'Masumi Developer Portal',
    canonicalBaseUrl: portalUrl,
    products: ['masumi', 'sokosumi'],
    pageCount: pages.length,
    machineReadable: {
      conciseIndexUrl: `${portalUrl}/llms.txt`,
      fullCorpusUrl: `${portalUrl}/llms-full.txt`,
      markdownIndexUrl: `${portalUrl}/md-index`,
      perPageMarkdownPattern: `${portalUrl}/<path>.md`,
    },
    requiredFreshPages: [
      `${portalUrl}/sokosumi/documentation/coworkers`,
      `${portalUrl}/sokosumi/documentation/pysokosumi`,
      `${portalUrl}/sokosumi/api-reference/coworkers/coworkers/get`,
      `${portalUrl}/sokosumi/api-reference/coworkers/coworkers/post`,
      `${portalUrl}/sokosumi/api-reference/coworkers/coworkers/id/whitelist/patch`,
      `${portalUrl}/sokosumi/api-reference/coworkers/coworkers/id/api-keys/post`,
      `${portalUrl}/sokosumi/api-reference/coworkers/coworkers/me/get`,
      `${portalUrl}/sokosumi/api-reference/coworkers/coworkers/me/events/get`,
      `${portalUrl}/sokosumi/api-reference/coworkers/coworkers/me/usage/post`,
      `${portalUrl}/masumi/documentation/get-started/masumi-as-a-service`,
    ],
    requiredFreshMarkdown: [
      `${portalUrl}/sokosumi/documentation/coworkers.md`,
      `${portalUrl}/sokosumi/documentation/pysokosumi.md`,
      `${portalUrl}/sokosumi/api-reference/coworkers/coworkers/get.md`,
      `${portalUrl}/sokosumi/api-reference/coworkers/coworkers/post.md`,
      `${portalUrl}/sokosumi/api-reference/coworkers/coworkers/id/whitelist/patch.md`,
      `${portalUrl}/sokosumi/api-reference/coworkers/coworkers/id/api-keys/post.md`,
      `${portalUrl}/sokosumi/api-reference/coworkers/coworkers/me/get.md`,
      `${portalUrl}/sokosumi/api-reference/coworkers/coworkers/me/events/get.md`,
      `${portalUrl}/sokosumi/api-reference/coworkers/coworkers/me/usage/post.md`,
      `${portalUrl}/masumi/documentation/get-started/masumi-as-a-service.md`,
    ],
    citationPolicy:
      `Return human-facing documentation citations under ${portalUrl}/masumi/... or ${portalUrl}/sokosumi/... only.`,
  };
}

function answerFromRecord(record: Record<string, unknown>, fallback: unknown): string {
  if (typeof fallback === 'string') return fallback;

  const direct = record.answer ?? record.reply ?? record.message ?? record.content ?? record.text ?? record.output_text;
  if (typeof direct === 'string') return direct;

  const output = record.output;
  if (Array.isArray(output)) {
    return output
      .map((item) => {
        if (!item || typeof item !== 'object') return '';
        const content = (item as Record<string, unknown>).content;
        if (!Array.isArray(content)) return '';
        return content
          .map((part) => {
            if (!part || typeof part !== 'object') return '';
            const partRecord = part as Record<string, unknown>;
            return String(partRecord.text ?? partRecord.output_text ?? '');
          })
          .join('');
      })
      .join('')
      .trim();
  }

  return '';
}

function pathFromSource(source: string) {
  const canonicalUrl = canonicalDocsUrl(source);
  if (/^https?:\/\//.test(canonicalUrl)) return { url: canonicalUrl };

  const normalized = source
    .replace(/^apps\/dev\//, '')
    .replace(/^content\/docs\//, '')
    .replace(/^content\//, '')
    .replace(/\.(mdx|md)$/i, '')
    .replace(/\/index$/i, '');

  if (!normalized || normalized === source) return { path: source };
  return { path: `/${normalized}` };
}

function pushCitation(citations: Citation[], seen: Set<string>, citation: Citation) {
  const normalizedCitation = normalizeCitation(citation);
  const key = normalizedCitation.url || normalizedCitation.path || `${normalizedCitation.title ?? ''}:${normalizedCitation.section ?? ''}`;
  if (!key || seen.has(key)) return;
  seen.add(key);
  citations.push(normalizedCitation);
}

function collectToolCitations(value: unknown, citations: Citation[], seen: Set<string>) {
  if (!value || citations.length >= 8) return;

  if (Array.isArray(value)) {
    for (const item of value) collectToolCitations(item, citations, seen);
    return;
  }

  if (typeof value !== 'object') return;

  const record = value as Record<string, unknown>;
  const source = typeof record.source === 'string' ? record.source : undefined;
  const chunk = record.chunk && typeof record.chunk === 'object' ? (record.chunk as Record<string, unknown>) : undefined;
  const chunkSource = typeof chunk?.source === 'string' ? chunk.source : undefined;

  if (source || chunkSource) {
    const resolvedSource = source ?? chunkSource ?? '';
    pushCitation(citations, seen, {
      title: typeof record.title === 'string' ? record.title : typeof chunk?.title === 'string' ? chunk.title : resolvedSource,
      section: typeof record.chunkId === 'string' ? record.chunkId : typeof chunk?.id === 'string' ? chunk.id : undefined,
      ...pathFromSource(resolvedSource),
    });
  }

  for (const child of Object.values(record)) {
    if (citations.length >= 8) break;
    collectToolCitations(child, citations, seen);
  }
}

function citationsFromRecord(record: Record<string, unknown>): Citation[] {
  const citations: Citation[] = [];
  const seen = new Set<string>();

  if (Array.isArray(record.citations)) {
    for (const item of record.citations) {
      if (item && typeof item === 'object') pushCitation(citations, seen, item as Citation);
    }
  }

  collectToolCitations(record.toolEvents, citations, seen);
  return citations;
}

function objectRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function stringValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function isMasumiPayment(value: unknown) {
  const record = objectRecord(value);
  if (!record) return false;

  return (
    typeof record.blockchainIdentifier === 'string' &&
    typeof record.agentIdentifier === 'string' &&
    typeof record.sellerVkey === 'string' &&
    typeof record.inputHash === 'string'
  );
}

function paymentEventFromValue(value: unknown, depth = 0): PaymentEvent | null {
  if (depth > 5) return null;

  const record = objectRecord(value);
  if (!record) return null;

  if (isMasumiPayment(record)) {
    return {
      taskId: stringValue(record.taskId),
      eventId: stringValue(record.eventId),
      masumiPayment: record,
    };
  }

  const directPayment = record.masumiPayment ?? record.payment;
  const directPaymentRecord = objectRecord(directPayment);
  if (directPaymentRecord && isMasumiPayment(directPaymentRecord)) {
    return {
      taskId: stringValue(record.taskId) ?? stringValue(record.id),
      eventId: stringValue(record.eventId),
      masumiPayment: directPaymentRecord,
    };
  }

  if (objectRecord(record.paymentEvent)) {
    const nested = paymentEventFromValue(record.paymentEvent, depth + 1);
    if (nested) {
      return {
        taskId: stringValue(record.taskId) ?? nested.taskId,
        eventId: stringValue(record.eventId) ?? nested.eventId,
        masumiPayment: nested.masumiPayment,
      };
    }
  }

  for (const child of Object.values(record)) {
    const nested = paymentEventFromValue(child, depth + 1);
    if (nested) return nested;
  }

  return null;
}

function jsonAnswerEvents(
  answer: string,
  citations: Citation[],
  paymentEvent: PaymentEvent | null,
) {
  return [
    { type: 'text-start', id: NORI_RESPONSE_MESSAGE_ID },
    ...(paymentEvent ? [{ type: 'data-payment', data: paymentEvent }] : []),
    {
      type: 'text-delta',
      id: NORI_RESPONSE_MESSAGE_ID,
      delta: answer || 'Nori returned an empty answer.',
    },
    { type: 'text-end', id: NORI_RESPONSE_MESSAGE_ID },
    ...citations.map((citation) => ({ type: 'data-citation', data: citation })),
    { type: 'finish' },
    '[DONE]',
  ];
}

function safeHost(value: string) {
  try {
    return new URL(value).host;
  } catch {
    return 'invalid-url';
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createNoriRateLimitUserId(request: NextRequest, secret: string) {
  // Railway sets X-Real-IP at its edge. Do not accept caller-controlled
  // conversation IDs or forwarded-for values as quota identities.
  const realIp = request.headers.get('x-real-ip')?.trim() || 'unattributed';
  const digest = createHmac('sha256', secret || 'nori-public-rate-limit')
    .update(realIp)
    .digest('hex')
    .slice(0, 32);
  return `docs-${digest}`;
}

async function fetchNoriUpstream(
  ctx: NoriRequestContext,
  agentUrl: string,
  headers: Record<string, string>,
  body: string,
  signal: AbortSignal,
) {
  let lastError: unknown;
  const deadline = Date.now() + NORI_UPSTREAM_DEADLINE_MS;

  for (let attempt = 1; attempt <= NORI_UPSTREAM_MAX_ATTEMPTS; attempt += 1) {
    try {
      signal.throwIfAborted();
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) throw new Error('Nori upstream deadline exceeded.');
      const response = await fetch(agentUrl, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.any([signal, AbortSignal.timeout(remainingMs)]),
      });

      if (response.status >= 500 && attempt < NORI_UPSTREAM_MAX_ATTEMPTS) {
        const detail = await response.text().catch(() => '');
        logNoriEvent(ctx, 'warn', 'chat_upstream_retry', {
          attempt,
          status: response.status,
          detail: detail.slice(0, 500),
        });
        const retryDelayMs = Math.min(300, Math.max(0, deadline - Date.now()));
        if (retryDelayMs > 0) await wait(retryDelayMs);
        continue;
      }

      return response;
    } catch (error) {
      if (signal.aborted) throw error;
      lastError = error;
      logNoriEvent(ctx, attempt < NORI_UPSTREAM_MAX_ATTEMPTS ? 'warn' : 'error', 'chat_upstream_retry', {
        attempt,
        willRetry: attempt < NORI_UPSTREAM_MAX_ATTEMPTS,
        error: errorDetails(error),
      });

      if (attempt >= NORI_UPSTREAM_MAX_ATTEMPTS) throw error;
      const retryDelayMs = Math.min(300, Math.max(0, deadline - Date.now()));
      if (retryDelayMs > 0) await wait(retryDelayMs);
    }
  }

  throw lastError;
}

function streamNoriUpstreamResponse({
  ctx,
  agentUrl,
  headers,
  body,
  priorityCitations,
  requestSignal,
}: {
  ctx: NoriRequestContext;
  agentUrl: string;
  headers: Record<string, string>;
  body: string;
  priorityCitations: Citation[];
  requestSignal: AbortSignal;
}) {
  const encoder = new TextEncoder();
  const responseHeaders = new Headers(AI_STREAM_HEADERS);
  withNoriRequestHeaders(responseHeaders, ctx);
  let cancelled = false;
  let upstreamReader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  const downstreamAbort = new AbortController();
  const upstreamSignal = AbortSignal.any([requestSignal, downstreamAbort.signal]);

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enqueue = (chunk: string | Uint8Array) => {
        if (cancelled) return false;
        try {
          controller.enqueue(typeof chunk === 'string' ? encoder.encode(chunk) : chunk);
          return true;
        } catch (error) {
          cancelled = true;
          downstreamAbort.abort(error);
          return false;
        }
      };
      const enqueueEvent = (event: unknown) => enqueue(dataSse(event));

      // Flush response headers immediately. Nori currently returns JSON only
      // after the model finishes, which can exceed the public first-byte limit.
      enqueue(': nori-open\n\n');
      logNoriEvent(ctx, 'info', 'chat_stream_opened');

      const keepalive = setInterval(() => {
        enqueue(`: nori-keepalive ${Date.now()}\n\n`);
      }, NORI_STREAM_KEEPALIVE_MS);

      void (async () => {
        try {
          const upstream = await fetchNoriUpstream(ctx, agentUrl, headers, body, upstreamSignal);
          const contentType = upstream.headers.get('content-type') ?? '';
          logNoriEvent(ctx, upstream.ok ? 'info' : 'warn', 'chat_upstream_response', {
            status: upstream.status,
            contentType,
          });

          if (!upstream.ok) {
            const detail = await upstream.text().catch(() => '');
            logNoriEvent(ctx, 'warn', 'chat_upstream_error_body', {
              status: upstream.status,
              detail: detail.slice(0, 500),
            });
            enqueueEvent({
              type: 'error',
              errorText: `Nori backend returned ${upstream.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`,
              requestId: ctx.requestId,
            });
            enqueueEvent({ type: 'finish' });
            enqueueEvent('[DONE]');
            return;
          }

          if (contentType.includes('text/event-stream') && upstream.body) {
            const upstreamStreamVersion = upstream.headers.get('x-vercel-ai-ui-message-stream');
            if (upstreamStreamVersion && upstreamStreamVersion !== 'v1') {
              await upstream.body.cancel();
              logNoriEvent(ctx, 'error', 'chat_upstream_stream_version_mismatch', {
                upstreamStreamVersion,
                supportedStreamVersion: 'v1',
              });
              enqueueEvent({
                type: 'error',
                errorText: `Nori returned an unsupported stream version (Nori request ${ctx.requestId})`,
                requestId: ctx.requestId,
              });
              enqueueEvent({ type: 'finish' });
              enqueueEvent('[DONE]');
              return;
            }

            upstreamReader = normalizeAndCloseOnTerminalEvent(
              upstream.body,
              ctx,
              priorityCitations,
            ).getReader();
            while (!cancelled) {
              const { done, value } = await upstreamReader.read();
              if (done) break;
              enqueue(value);
            }
            return;
          }

          const data = await jsonOrText(upstream);
          const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
          const answer = answerFromRecord(record, data);
          const upstreamCitations = citationsFromRecord(record);
          const citations = priorityCitations.length > 0 ? priorityCitations : upstreamCitations;
          const paymentEvent = paymentEventFromValue(record);
          logNoriEvent(ctx, 'info', 'chat_json_response', {
            hasAnswer: Boolean(answer),
            citationCount: citations.length,
            upstreamCitationCount: upstreamCitations.length,
            hasPaymentEvent: Boolean(paymentEvent),
          });
          if (!paymentEvent) {
            logNoriEvent(ctx, 'warn', 'chat_payment_event_missing');
          }

          for (const event of jsonAnswerEvents(answer, citations, paymentEvent)) {
            enqueueEvent(event);
          }
        } catch (error) {
          if (cancelled || upstreamSignal.aborted) {
            logNoriEvent(ctx, 'info', 'chat_request_cancelled', {
              error: errorDetails(error),
            });
            return;
          }

          const message = error instanceof Error ? error.message : 'Nori backend request failed.';
          logNoriEvent(ctx, 'error', 'chat_request_failed', { error: errorDetails(error) });
          enqueueEvent({
            type: 'error',
            errorText: `${message} (Nori request ${ctx.requestId})`,
            requestId: ctx.requestId,
          });
          enqueueEvent({ type: 'finish' });
          enqueueEvent('[DONE]');
        } finally {
          clearInterval(keepalive);
          if (!cancelled) {
            try {
              controller.close();
            } catch {
              cancelled = true;
            }
          }
        }
      })();
    },
    cancel(reason) {
      cancelled = true;
      downstreamAbort.abort(reason);
      return upstreamReader?.cancel(reason);
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: responseHeaders,
  });
}

export async function POST(request: NextRequest) {
  const ctx = createNoriRequestContext(request, 'nori.chat');
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    logNoriEvent(ctx, 'warn', 'chat_invalid_json');
    return errorStream('Invalid JSON request body.', 400, ctx.requestId);
  }

  const payload = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const message = typeof payload.message === 'string' ? payload.message.trim() : lastMessageText(payload.messages);

  if (!message) {
    logNoriEvent(ctx, 'warn', 'chat_missing_message');
    return errorStream('Message is required.', 400, ctx.requestId);
  }

  const agentUrl = process.env.NORI_AGENT_URL;
  if (!agentUrl) {
    logNoriEvent(ctx, 'error', 'chat_missing_agent_url');
    return errorStream('Nori is not connected yet. Set NORI_AGENT_URL to enable live docs answers.', 200, ctx.requestId);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream, application/json',
  };

  const noriApiKey = process.env.COWORKERS_API_KEY || process.env.NORI_AGENT_API_KEY;
  const noriUserId = createNoriRateLimitUserId(
    request,
    process.env.NORI_RATE_LIMIT_SECRET || noriApiKey || '',
  );
  headers['X-Nori-Request-Id'] = ctx.requestId;
  headers['X-User-Id'] = noriUserId;
  if (noriApiKey) {
    headers.Authorization = `Bearer ${noriApiKey}`;
  }

  const docsContext = createNoriDocsContext();
  const priorityCitations = createPriorityDocsCitations(message, docsContext);
  headers['X-Nori-Docs-Base-Url'] = docsContext.canonicalBaseUrl;
  headers['X-Nori-Docs-Index-Url'] = docsContext.machineReadable.conciseIndexUrl;
  headers['X-Nori-Docs-Full-Corpus-Url'] = docsContext.machineReadable.fullCorpusUrl;
  headers['X-Nori-Docs-Markdown-Index-Url'] = docsContext.machineReadable.markdownIndexUrl;

  logNoriEvent(ctx, 'info', 'chat_request_started', {
    messageLength: message.length,
    hasHistory: Array.isArray(payload.history) && payload.history.length > 0,
    hasMessages: Array.isArray(payload.messages) && payload.messages.length > 0,
    hasPriorityDocsContext: priorityCitations.length > 0,
    page:
      payload.page && typeof payload.page === 'object'
        ? {
            path: (payload.page as Record<string, unknown>).path,
            title: (payload.page as Record<string, unknown>).title,
          }
        : undefined,
    noriAgentHost: safeHost(agentUrl),
  });

  return streamNoriUpstreamResponse({
    ctx,
    agentUrl,
    headers,
    body: JSON.stringify(createSokosumiChatPayload(payload, message, docsContext, noriUserId)),
    priorityCitations,
    requestSignal: request.signal,
  });
}
