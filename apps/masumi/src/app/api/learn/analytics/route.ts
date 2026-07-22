import { NextRequest, NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/learn-api";
import {
  COURSE_VERSION,
  LEARN_AGGREGATE_EVENTS,
  recordLearnAggregateEvent,
  type LearnAggregateEvent,
} from "@/lib/learn-db";

export const runtime = "nodejs";

const noStoreHeaders = { "cache-control": "no-store" };

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers: noStoreHeaders });
  const body = await request.json().catch(() => null) as { event?: unknown } | null;
  if (typeof body?.event !== "string" || !LEARN_AGGREGATE_EVENTS.includes(body.event as LearnAggregateEvent)) {
    return NextResponse.json({ error: "Invalid analytics event" }, { status: 400, headers: noStoreHeaders });
  }

  recordLearnAggregateEvent(body.event as LearnAggregateEvent, COURSE_VERSION);
  return new NextResponse(null, { status: 204, headers: noStoreHeaders });
}
