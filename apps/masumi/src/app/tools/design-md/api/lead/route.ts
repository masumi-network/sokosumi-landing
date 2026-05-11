import { NextResponse } from "next/server";
import { appendLead } from "../../lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory IP rate limit: 5 leads per IP per hour. Reset on cold start.
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, { count: number; firstSeen: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.firstSeen > WINDOW_MS) {
    hits.set(ip, { count: 1, firstSeen: now });
    return false;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT) return true;
  return false;
}

export async function POST(req: Request) {
  let body: { email?: unknown; url?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address" },
      { status: 400 },
    );
  }

  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions from this IP. Try again in an hour." },
      { status: 429 },
    );
  }

  const payload = {
    email,
    url,
    ip,
    ts: new Date().toISOString(),
    userAgent: req.headers.get("user-agent") ?? "",
    referer: req.headers.get("referer") ?? "",
    source: "design-md-generator",
  };

  // Forward to all sinks in parallel. None block the user-facing response
  // on failure — the lead is already in our logs.
  await Promise.allSettled([
    forwardToSheet(payload),
    forwardToOnboarding(email, url),
  ]);

  return NextResponse.json({ ok: true });
}

const ONBOARDING_URL = "https://elena.serviceplan-agents.com/onboarding/submit";

async function forwardToOnboarding(email: string, websiteUrl: string) {
  try {
    const res = await fetch(ONBOARDING_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, website_url: websiteUrl }),
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!res.ok) {
      console.error(
        `[lead] onboarding webhook responded ${res.status} for ${email} / ${websiteUrl}`,
      );
    }
  } catch (e) {
    console.error("[lead] onboarding webhook error:", e);
  }
}

async function forwardToSheet(payload: {
  email: string;
  url: string;
  ip: string;
  ts: string;
  userAgent: string;
  referer: string;
  source: string;
}) {
  try {
    const wrote = await appendLead({
      timestamp: payload.ts,
      email: payload.email,
      websiteUrl: payload.url,
      source: payload.source,
      ip: payload.ip,
      userAgent: payload.userAgent,
      referer: payload.referer,
    });
    if (!wrote) {
      console.log(
        "[lead] (Sheets not configured — set GOOGLE_SERVICE_ACCOUNT_B64, SIGNUPS_SHEET_ID, SIGNUPS_SHEET_TAB_NAME)",
        JSON.stringify(payload),
      );
    }
  } catch (e) {
    console.error("[lead] sheet write error:", e);
  }
}
