import { NextRequest, NextResponse } from 'next/server';
import { NoriPaymentError } from '@/lib/nori-payment';

type NoriLogLevel = 'info' | 'warn' | 'error';

export interface NoriRequestContext {
  requestId: string;
  route: string;
  method: string;
  path: string;
  startedAt: number;
  host?: string;
  referer?: string;
}

const redactedKeys = /api[-_]?key|authorization|token|secret|password|vkey/i;
const maxRedactionDepth = 6;

function headerValue(request: NextRequest, name: string) {
  return request.headers.get(name) ?? undefined;
}

export function createNoriRequestContext(request: NextRequest, route: string): NoriRequestContext {
  return {
    requestId:
      headerValue(request, 'x-nori-request-id') ??
      headerValue(request, 'x-request-id') ??
      headerValue(request, 'x-railway-request-id') ??
      crypto.randomUUID(),
    route,
    method: request.method,
    path: request.nextUrl.pathname,
    startedAt: Date.now(),
    host: headerValue(request, 'host'),
    referer: headerValue(request, 'referer'),
  };
}

function redact(value: unknown, seen = new WeakSet<object>(), depth = 0): unknown {
  if (typeof value === 'bigint') return value.toString();
  if (!value || typeof value !== 'object') return value;

  if (value instanceof Error) return errorDetails(value);
  if (seen.has(value)) return '[circular]';
  if (depth >= maxRedactionDepth) return '[truncated]';
  seen.add(value);

  if (Array.isArray(value)) return value.map((item) => redact(item, seen, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      redactedKeys.test(key) ? '[redacted]' : redact(item, seen, depth + 1),
    ]),
  );
}

export function errorDetails(error: unknown) {
  if (error instanceof NoriPaymentError) {
    return {
      name: error.name,
      message: error.message,
      status: error.status,
      details: redact(error.details),
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    };
  }

  return { message: String(error) };
}

export function logNoriEvent(
  ctx: NoriRequestContext,
  level: NoriLogLevel,
  event: string,
  data: Record<string, unknown> = {},
) {
  const payload = {
    ts: new Date().toISOString(),
    scope: 'nori',
    level,
    event,
    requestId: ctx.requestId,
    route: ctx.route,
    method: ctx.method,
    path: ctx.path,
    durationMs: Date.now() - ctx.startedAt,
    host: ctx.host,
    referer: ctx.referer,
    ...(redact(data) as Record<string, unknown>),
  };

  const line = JSON.stringify(payload);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

export function noriJsonErrorResponse(ctx: NoriRequestContext, error: unknown, fallback: string) {
  const details = errorDetails(error);
  const status = error instanceof NoriPaymentError ? error.status : 500;
  const message = typeof details.message === 'string' && details.message ? details.message : fallback;

  logNoriEvent(ctx, status >= 500 ? 'error' : 'warn', 'request_failed', {
    status,
    error: details,
  });

  return NextResponse.json(
    {
      ok: false,
      error: message,
      requestId: ctx.requestId,
      details: details.details,
    },
    {
      status,
      headers: {
        'x-nori-request-id': ctx.requestId,
      },
    },
  );
}

export function withNoriRequestHeaders(headers: Headers, ctx: NoriRequestContext) {
  headers.set('x-nori-request-id', ctx.requestId);
  return headers;
}
