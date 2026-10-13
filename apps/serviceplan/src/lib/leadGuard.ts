import { promises as dns } from "node:dns";
import type { NextRequest } from "next/server";
import disposableDomains from "@/lib/disposable-domains.json";
import {
  checkEmail,
  emailDomain,
  normalizeWebsite,
  HONEYPOT_FIELD,
  type LeadCheck,
} from "@/lib/leadRules";

/* Server-side spam protection for /api/analysis and /api/demo. Each free
   analysis costs real money and fires a Meta Lead event, so a request has
   to pass every check here before anything is sent on. */

const DISPOSABLE = new Set<string>(disposableDomains as string[]);

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_PER_EMAIL = 3;
const hits = new Map<string, number[]>();

function overLimit(key: string, max: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length > max;
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(Object.assign(new Error("timeout"), { code: "ETIMEOUT" })), ms)
    ),
  ]);
}

/** False only when DNS says the name does not exist. Timeouts and server
 *  errors let the lead through rather than lose a real one. */
async function resolves(lookup: () => Promise<unknown[]>): Promise<boolean> {
  try {
    return (await withTimeout(lookup(), 3000)).length > 0;
  } catch (err) {
    const code = (err as { code?: string }).code;
    return !(code === "ENOTFOUND" || code === "ENODATA" || code === "NXDOMAIN");
  }
}


export interface GuardOptions {
  /** Landing-page forms carry the honeypot field. */
  fromLandingPage: boolean;
  rejectFreemail: boolean;
  /** Website field to validate (free analysis only). */
  website?: unknown;
}

export async function guardLead(
  req: NextRequest,
  body: Record<string, unknown>,
  opts: GuardOptions
): Promise<LeadCheck> {
  const ip = clientIp(req);
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (opts.fromLandingPage && body[HONEYPOT_FIELD]) {
    return { ok: false, field: "form", code: "rejected" };
  }
  if (overLimit(`ip:${req.nextUrl.pathname}:${ip}`, MAX_PER_IP)) {
    return { ok: false, field: "form", code: "rate_limited" };
  }

  const emailCheck = checkEmail(email, opts.rejectFreemail);
  if (!emailCheck.ok) return emailCheck;

  const domain = emailDomain(email);
  if (DISPOSABLE.has(domain)) {
    return { ok: false, field: "email", code: "email_disposable" };
  }
  if (!(await resolves(() => dns.resolveMx(domain)))) {
    return { ok: false, field: "email", code: "email_domain" };
  }
  if (overLimit(`email:${req.nextUrl.pathname}:${email.toLowerCase()}`, MAX_PER_EMAIL)) {
    return { ok: false, field: "form", code: "rate_limited" };
  }

  if (opts.website !== undefined) {
    const url = normalizeWebsite(typeof opts.website === "string" ? opts.website : "");
    if (!url) return { ok: false, field: "url", code: "url_invalid" };
    const host = new URL(url).hostname;
    if (!(await resolves(async () => [await dns.lookup(host)]))) {
      return { ok: false, field: "url", code: "url_unreachable" };
    }
  }

  return { ok: true };
}
