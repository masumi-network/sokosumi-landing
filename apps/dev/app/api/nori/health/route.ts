import { NextRequest, NextResponse } from 'next/server';
import {
  createNoriRequestContext,
  logNoriEvent,
  withNoriRequestHeaders,
} from '@/lib/nori-observability';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const ctx = createNoriRequestContext(request, 'nori.health');
  const configured = Boolean(process.env.NORI_AGENT_URL);
  const headers = withNoriRequestHeaders(new Headers(), ctx);
  headers.set('Cache-Control', 'private, no-store, no-cache, max-age=0, must-revalidate');

  logNoriEvent(ctx, configured ? 'info' : 'error', 'health_checked', {
    configured,
    commitSha: process.env.RAILWAY_GIT_COMMIT_SHA,
    deploymentId: process.env.RAILWAY_DEPLOYMENT_ID,
  });

  return NextResponse.json(
    {
      ok: configured,
      status: configured ? 'ready-for-live-probe' : 'configuration-missing',
      commitSha: process.env.RAILWAY_GIT_COMMIT_SHA ?? null,
      deploymentId: process.env.RAILWAY_DEPLOYMENT_ID ?? null,
      requestId: ctx.requestId,
    },
    { status: configured ? 200 : 503, headers },
  );
}
