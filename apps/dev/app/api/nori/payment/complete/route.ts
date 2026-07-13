import { NextRequest, NextResponse } from 'next/server';
import { completeNoriPayment } from '@/lib/nori-payment';
import {
  createNoriRequestContext,
  logNoriEvent,
  noriJsonErrorResponse,
  withNoriRequestHeaders,
} from '@/lib/nori-observability';

export const dynamic = 'force-dynamic';

function objectRecord(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export async function POST(request: NextRequest) {
  const ctx = createNoriRequestContext(request, 'nori.payment.complete');
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    logNoriEvent(ctx, 'warn', 'payment_complete_invalid_json');
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON request body.', requestId: ctx.requestId },
      { status: 400, headers: withNoriRequestHeaders(new Headers(), ctx) },
    );
  }

  const record = objectRecord(body);
  const masumiPayment = objectRecord(record.masumiPayment ?? record.payment);

  if (!Object.keys(masumiPayment).length) {
    logNoriEvent(ctx, 'warn', 'payment_complete_missing_payment');
    return NextResponse.json(
      { ok: false, error: 'masumiPayment is required.', requestId: ctx.requestId },
      { status: 400, headers: withNoriRequestHeaders(new Headers(), ctx) },
    );
  }

  try {
    logNoriEvent(ctx, 'info', 'payment_complete_started', {
      taskId: record.taskId,
      eventId: record.eventId,
      paymentId: masumiPayment.id,
      blockchainIdentifier: masumiPayment.blockchainIdentifier,
      agentIdentifier: masumiPayment.agentIdentifier,
    });

    const session = await completeNoriPayment({
      taskId: typeof record.taskId === 'string' ? record.taskId : undefined,
      eventId: typeof record.eventId === 'string' ? record.eventId : undefined,
      masumiPayment,
    });

    logNoriEvent(ctx, 'info', 'payment_complete_succeeded', {
      sessionId: session.sessionId,
      status: session.status,
      purchaseId: session.purchaseId,
      blockchainIdentifier: session.blockchainIdentifier,
    });

    return NextResponse.json(
      { ok: true, session, requestId: ctx.requestId },
      { headers: withNoriRequestHeaders(new Headers(), ctx) },
    );
  } catch (error) {
    return noriJsonErrorResponse(ctx, error, 'Nori payment completion failed.');
  }
}
