import { NextRequest, NextResponse } from 'next/server';

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

type ChatRole = 'user' | 'assistant' | 'system';

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

function streamAiEvents(events: unknown[], status = 200) {
  const encoder = new TextEncoder();
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
      headers: AI_STREAM_HEADERS,
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

function closeOnTerminalEvent(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          controller.enqueue(value);
          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split(/\n\n/);
          buffer = blocks.at(-1) ?? '';

          if (blocks.slice(0, -1).some(isTerminalSseBlock)) {
            await reader.cancel().catch(() => undefined);
            break;
          }
        }

        buffer += decoder.decode();
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
}

function errorStream(message: string, status = 200) {
  return streamAiEvents(
    [
      { type: 'error', errorText: message },
      { type: 'finish' },
      '[DONE]',
    ],
    status,
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

function createSokosumiChatPayload(payload: Record<string, unknown>, message: string) {
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
    source: 'masumi-docs',
    surface: 'docs',
    credits: 0.25,
    messages: history,
    ...(payload.page && typeof payload.page === 'object' ? { page: payload.page } : {}),
  };

  return {
    messages,
    message,
    userId: typeof payload.userId === 'string' ? payload.userId : 'docs-user',
    input: message,
    prompt: message,
    history,
    ...(payload.page && typeof payload.page === 'object' ? { page: payload.page } : {}),
    metadata,
    agentId: 'nori',
    surface: 'docs',
    ...(typeof payload.conversationId === 'string' ? { conversationId: payload.conversationId } : {}),
    ...(typeof payload.model === 'string' ? { model: payload.model } : {}),
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
  if (/^https?:\/\//.test(source)) return { url: source };

  const normalized = source
    .replace(/^content\/docs\//, '')
    .replace(/\.(mdx|md)$/i, '')
    .replace(/\/index$/i, '');

  if (!normalized || normalized === source) return { path: source };
  return { path: `/${normalized}` };
}

function pushCitation(citations: Citation[], seen: Set<string>, citation: Citation) {
  const key = citation.url || citation.path || `${citation.title ?? ''}:${citation.section ?? ''}`;
  if (!key || seen.has(key)) return;
  seen.add(key);
  citations.push(citation);
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

function streamJsonAnswer(answer: string, citations: Citation[], paymentEvent: PaymentEvent | null) {
  const messageId = 'response-message';
  const events: unknown[] = [
    { type: 'text-start', id: messageId },
    ...(paymentEvent ? [{ type: 'data-payment', data: paymentEvent }] : []),
    { type: 'text-delta', id: messageId, delta: answer || 'Nori returned an empty answer.' },
    { type: 'text-end', id: messageId },
    ...citations.map((citation) => ({ type: 'data-citation', data: citation })),
    { type: 'finish' },
    '[DONE]',
  ];

  return streamAiEvents(events);
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorStream('Invalid JSON request body.', 400);
  }

  const payload = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const message = typeof payload.message === 'string' ? payload.message.trim() : lastMessageText(payload.messages);

  if (!message) {
    return errorStream('Message is required.', 400);
  }

  const agentUrl = process.env.NORI_AGENT_URL;
  if (!agentUrl) {
    return errorStream('Nori is not connected yet. Set NORI_AGENT_URL to enable live docs answers.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream, application/json',
  };

  const noriApiKey = process.env.COWORKERS_API_KEY || process.env.NORI_AGENT_API_KEY;
  if (noriApiKey) {
    headers.Authorization = `Bearer ${noriApiKey}`;
  }

  try {
    const upstream = await fetch(agentUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(createSokosumiChatPayload(payload, message)),
    });

    const contentType = upstream.headers.get('content-type') ?? '';

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return errorStream(
        `Nori backend returned ${upstream.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`,
        200,
      );
    }

    if (contentType.includes('text/event-stream') && upstream.body) {
      const streamHeaders = new Headers(AI_STREAM_HEADERS);
      const upstreamAiStream = upstream.headers.get('x-vercel-ai-ui-message-stream');
      if (upstreamAiStream) streamHeaders.set('x-vercel-ai-ui-message-stream', upstreamAiStream);

      return new NextResponse(closeOnTerminalEvent(upstream.body), {
        status: 200,
        headers: streamHeaders,
      });
    }

    const data = await jsonOrText(upstream);
    const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
    const answer = answerFromRecord(record, data);
    const citations = citationsFromRecord(record);
    const paymentEvent = paymentEventFromValue(record);

    return streamJsonAnswer(answer, citations, paymentEvent);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Nori backend request failed.';
    return errorStream(message);
  }
}
