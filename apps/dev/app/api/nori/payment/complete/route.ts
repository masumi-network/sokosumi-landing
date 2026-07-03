import { NextRequest, NextResponse } from 'next/server';
import { completeNoriPayment, NoriPaymentError } from '@/lib/nori-payment';

export const dynamic = 'force-dynamic';

function objectRecord(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

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

  const message = error instanceof Error ? error.message : 'Nori payment completion failed.';
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const record = objectRecord(body);
  const masumiPayment = objectRecord(record.masumiPayment ?? record.payment);

  if (!Object.keys(masumiPayment).length) {
    return NextResponse.json({ ok: false, error: 'masumiPayment is required.' }, { status: 400 });
  }

  try {
    const session = await completeNoriPayment({
      taskId: typeof record.taskId === 'string' ? record.taskId : undefined,
      eventId: typeof record.eventId === 'string' ? record.eventId : undefined,
      masumiPayment,
    });

    return NextResponse.json({ ok: true, session });
  } catch (error) {
    return errorResponse(error);
  }
}
