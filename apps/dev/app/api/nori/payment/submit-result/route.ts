import { NextRequest, NextResponse } from 'next/server';
import { submitNoriPaymentResult } from '@/lib/nori-payment';
import {
  createNoriRequestContext,
  logNoriEvent,
  noriJsonErrorResponse,
  withNoriRequestHeaders,
} from '@/lib/nori-observability';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const ctx = createNoriRequestContext(request, 'nori.payment.submit-result');
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    logNoriEvent(ctx, 'warn', 'payment_submit_result_invalid_json');
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON request body.', requestId: ctx.requestId },
      { status: 400, headers: withNoriRequestHeaders(new Headers(), ctx) },
    );
  }

  try {
    logNoriEvent(ctx, 'info', 'payment_submit_result_started', {
      sessionId: body.sessionId,
      taskId: body.taskId,
      blockchainIdentifier: body.blockchainIdentifier,
      hasResultHash: typeof body.resultHash === 'string' && body.resultHash.length > 0,
    });

    const session = await submitNoriPaymentResult({
      sessionId: typeof body.sessionId === 'string' ? body.sessionId : undefined,
      taskId: typeof body.taskId === 'string' ? body.taskId : undefined,
      blockchainIdentifier: typeof body.blockchainIdentifier === 'string' ? body.blockchainIdentifier : undefined,
      resultHash: typeof body.resultHash === 'string' ? body.resultHash : '',
    });

    logNoriEvent(ctx, 'info', 'payment_submit_result_succeeded', {
      sessionId: session.sessionId,
      status: session.status,
      purchaseId: session.purchaseId,
      txHash: session.txHash,
      resultHash: session.resultHash,
    });

    return NextResponse.json(
      { ok: true, session, requestId: ctx.requestId },
      { headers: withNoriRequestHeaders(new Headers(), ctx) },
    );
  } catch (error) {
    return noriJsonErrorResponse(ctx, error, 'Nori payment result submission failed.');
  }
}
