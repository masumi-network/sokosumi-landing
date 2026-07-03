import { NextRequest, NextResponse } from 'next/server';
import { NoriPaymentError, refreshNoriPaymentSession } from '@/lib/nori-payment';

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

  const message = error instanceof Error ? error.message : 'Nori payment status lookup failed.';
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  try {
    const session = await refreshNoriPaymentSession({
      sessionId: params.get('sessionId') ?? undefined,
      taskId: params.get('taskId') ?? undefined,
      blockchainIdentifier: params.get('blockchainIdentifier') ?? undefined,
    });

    return NextResponse.json({ ok: true, session });
  } catch (error) {
    return errorResponse(error);
  }
}
