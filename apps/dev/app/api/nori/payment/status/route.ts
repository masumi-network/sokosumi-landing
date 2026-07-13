import { NextRequest, NextResponse } from 'next/server';
import { refreshNoriPaymentSession } from '@/lib/nori-payment';
import {
  createNoriRequestContext,
  logNoriEvent,
  noriJsonErrorResponse,
  withNoriRequestHeaders,
} from '@/lib/nori-observability';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const ctx = createNoriRequestContext(request, 'nori.payment.status');
  const params = request.nextUrl.searchParams;

  try {
    logNoriEvent(ctx, 'info', 'payment_status_started', {
      sessionId: params.get('sessionId'),
      taskId: params.get('taskId'),
      blockchainIdentifier: params.get('blockchainIdentifier'),
    });

    const session = await refreshNoriPaymentSession({
      sessionId: params.get('sessionId') ?? undefined,
      taskId: params.get('taskId') ?? undefined,
      blockchainIdentifier: params.get('blockchainIdentifier') ?? undefined,
    });

    logNoriEvent(ctx, 'info', 'payment_status_succeeded', {
      sessionId: session.sessionId,
      status: session.status,
      purchaseId: session.purchaseId,
      blockchainIdentifier: session.blockchainIdentifier,
      onChainState: session.onChainState,
      requestedAction: session.requestedAction,
      errorType: session.errorType,
    });

    return NextResponse.json(
      { ok: true, session, requestId: ctx.requestId },
      { headers: withNoriRequestHeaders(new Headers(), ctx) },
    );
  } catch (error) {
    return noriJsonErrorResponse(ctx, error, 'Nori payment status lookup failed.');
  }
}
