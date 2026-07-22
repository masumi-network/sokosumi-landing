import { NextRequest, NextResponse } from 'next/server';
import { lookupNoriAgentIdentity } from '@/lib/nori-payment';
import {
  createNoriRequestContext,
  logNoriEvent,
  noriJsonErrorResponse,
  withNoriRequestHeaders,
} from '@/lib/nori-observability';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const ctx = createNoriRequestContext(request, 'nori.identity');

  try {
    logNoriEvent(ctx, 'info', 'identity_lookup_started');
    const identity = await lookupNoriAgentIdentity();
    logNoriEvent(ctx, 'info', 'identity_lookup_succeeded', {
      verified: identity.verified,
      agentIdentifier: identity.agentIdentifier,
      status: identity.status,
      network: identity.network,
      error: identity.error,
    });
    const headers = withNoriRequestHeaders(new Headers(), ctx);
    headers.set('Cache-Control', 'private, no-store, no-cache, max-age=0, must-revalidate');
    return NextResponse.json({ ok: true, identity, requestId: ctx.requestId }, { headers });
  } catch (error) {
    return noriJsonErrorResponse(ctx, error, 'Nori identity lookup failed.');
  }
}
