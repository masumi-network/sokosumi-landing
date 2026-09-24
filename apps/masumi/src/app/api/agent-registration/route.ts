import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;

// In-memory IP rate limit: 5 submissions per IP per hour. Reset on cold start.
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
  return entry.count > RATE_LIMIT;
}

export async function POST(req: Request) {
  let body: {
    name?: unknown;
    email?: unknown;
    agree?: unknown;
    agentName?: unknown;
    description?: unknown;
    apiBaseUrl?: unknown;
    tags?: unknown;
    pricing?: unknown;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const agree = body.agree === true;
  const agentName = typeof body.agentName === "string" ? body.agentName.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const apiBaseUrl = typeof body.apiBaseUrl === "string" ? body.apiBaseUrl.trim() : "";
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string").map((t) => t.trim()).filter(Boolean)
    : [];
  const pricing = typeof body.pricing === "string" ? body.pricing.trim() : "Dynamic";

  // Step 1 — account
  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  if (!agree) {
    return NextResponse.json({ error: "Please agree to the Privacy Policy" }, { status: 400 });
  }
  // Step 2 — agent details
  if (agentName.length < 2) {
    return NextResponse.json({ error: "Please enter your agent's name" }, { status: 400 });
  }
  if (!description) {
    return NextResponse.json({ error: "Please add a short description" }, { status: 400 });
  }
  if (!URL_RE.test(apiBaseUrl)) {
    return NextResponse.json({ error: "Enter a valid API base URL (https://…)" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions from this IP. Try again in an hour." },
      { status: 429 }
    );
  }

  const payload = {
    name,
    email,
    agree,
    agentName,
    description,
    apiBaseUrl,
    tags,
    pricing,
    ip,
    ts: new Date().toISOString(),
    userAgent: req.headers.get("user-agent") ?? "",
    referer: req.headers.get("referer") ?? "",
    source: "agent-explorer-registration",
  };

  // Durable sinks (Sheets/email) can be wired here later; for now we log the
  // submission so nothing is lost, and always confirm to the user.
  console.log("[agent-registration]", JSON.stringify(payload));

  return NextResponse.json({ ok: true });
}
