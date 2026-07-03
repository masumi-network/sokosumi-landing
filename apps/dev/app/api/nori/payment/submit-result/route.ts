import { NextRequest, NextResponse } from 'next/server';
import { NoriPaymentError, submitNoriPaymentResult } from '@/lib/nori-payment';

export const dynamic = 'force-dynamic';

function errorResponse(error: unknown) {
  if (error instanceof NoriPaymentError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        details: error.details,
      },
      { status: error.status },
    );
  }

  const message = error instanceof Error ? error.message : 'Nori payment result submission failed.';
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const session = await submitNoriPaymentResult({
      sessionId: typeof body.sessionId === 'string' ? body.sessionId : undefined,
      taskId: typeof body.taskId === 'string' ? body.taskId : undefined,
      blockchainIdentifier: typeof body.blockchainIdentifier === 'string' ? body.blockchainIdentifier : undefined,
      resultHash: typeof body.resultHash === 'string' ? body.resultHash : '',
    });

    return NextResponse.json({ ok: true, session });
  } catch (error) {
    return errorResponse(error);
  }
}
