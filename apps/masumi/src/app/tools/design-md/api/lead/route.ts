import { NextResponse } from "next/server";

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

  // Forward to webhook if configured. Otherwise just log.
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
        redirect: "follow",
      });
      if (!res.ok) {
        console.error(
          `[lead] webhook responded ${res.status} for ${email} / ${url}`,
        );
        // Don't fail the user-facing request — we already have the lead in logs
      }
    } catch (e) {
      console.error("[lead] webhook error:", e);
    }
  } else {
    console.log("[lead] (no webhook configured)", JSON.stringify(payload));
  }

  return NextResponse.json({ ok: true });
}
