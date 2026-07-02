import type { NextRequest } from "next/server";
import { getConfirmations, type ConfirmResult } from "@/lib/x402-facilitator";

export const dynamic = "force-dynamic";

// x402 facilitator: confirmation check. Given a settled tx hash, asks the chain
// (via Blockfrost) whether it's landed in a block yet and how many confirmations
// it has. The client polls this after settlement — submission ≠ confirmation.
//
// This is a same-origin endpoint that fans out to a metered Blockfrost key, so
// it's protected against amplification: results are cached per-hash for a few
// seconds (repeated polls collapse to one upstream call) and a coarse per-IP
// window caps how fast any one caller can drive upstream requests.

const HASH_RE = /^[0-9a-fA-F]{64}$/;

const cache = new Map<string, { at: number; body: ConfirmResult }>();
const FOUND_TTL = 30_000; // a confirmed result is stable
const MISS_TTL = 7_000; // not-yet-mined: re-check at roughly half a block

const hits = new Map<string, { count: number; resetAt: number }>();
const RL_WINDOW = 30_000;
const RL_LIMIT = 25; // generous for one legitimate poller, hostile for a flood

function tooMany(ip: string, now: number): boolean {
  const h = hits.get(ip);
  if (!h || now > h.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RL_WINDOW });
    return false;
  }
  h.count += 1;
  return h.count > RL_LIMIT;
}

export async function GET(req: NextRequest) {
  const now = Date.now();
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (tooMany(ip, now)) {
    return Response.json({ found: false, error: "rate_limited" }, { status: 429, headers: { "cache-control": "no-store" } });
  }

  const hash = req.nextUrl.searchParams.get("hash");
  if (!hash || !HASH_RE.test(hash)) {
    return Response.json({ found: false, error: "Missing or malformed tx hash" }, { status: 400 });
  }

  const cached = cache.get(hash);
  if (cached && now - cached.at < (cached.body.found ? FOUND_TTL : MISS_TTL)) {
    return Response.json(cached.body, { status: 200, headers: { "cache-control": "no-store" } });
  }

  const c = await getConfirmations(hash);
  if (cache.size > 500) cache.clear(); // keep the demo map from growing unbounded
  cache.set(hash, { at: now, body: c });
  return Response.json(c, { status: 200, headers: { "cache-control": "no-store" } });
}
