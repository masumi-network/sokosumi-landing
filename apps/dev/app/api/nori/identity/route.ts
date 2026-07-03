import { NextResponse } from 'next/server';
import { NoriPaymentError, lookupNoriAgentIdentity } from '@/lib/nori-payment';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const identity = await lookupNoriAgentIdentity();
    return NextResponse.json({ ok: true, identity });
  } catch (error) {
    if (error instanceof NoriPaymentError) {
      return NextResponse.json({ ok: false, error: error.message, details: error.details }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : 'Nori identity lookup failed.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
