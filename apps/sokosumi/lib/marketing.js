// Marketing email capture from the free tools. The popup in
// assets/email-gate.js posts here; rows land in the sokosumi-marketing
// Neon database (Vercel marketplace resource, DATABASE_URL).
//
// The consent wording is stored with every row, because a list is only
// usable for marketing if you can show what each address agreed to and
// when. Keep CONSENT identical to the sentence the popup displays.

const { neon } = require("@neondatabase/serverless");

const CONSENT =
  "By submitting, you agree to receive marketing emails from Sokosumi. Unsubscribe anytime.";

const TOOLS = new Set(["design-md", "og-checker", "llms-txt", "seo-md"]);

// Same deliberately permissive shape as lib/leads.js.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/;

let sql = null;
let ensured = null;

function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  if (!sql) sql = neon(process.env.DATABASE_URL);
  return sql;
}

// One CREATE per process, remembered as a promise so concurrent first
// requests share it instead of racing.
function ensureTable() {
  if (!ensured) {
    ensured = db()`create table if not exists tool_emails (
      id bigserial primary key,
      email text not null,
      tool text not null,
      path text,
      locale text,
      consent text not null,
      created_at timestamptz not null default now(),
      unique (email, tool)
    )`;
  }
  return ensured;
}

// Returns { ok: true } or { ok: false, error }.
async function save(body) {
  // Honeypot: a real browser leaves this hidden field empty.
  if (String(body.website || "").trim()) return { ok: false, error: "spam" };

  const email = String(body.email || "").trim().toLowerCase().slice(0, 320);
  const tool = String(body.tool || "").trim();
  const path = String(body.path || "").slice(0, 500) || null;
  const locale = body.locale === "de" ? "de" : "en";

  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please add a valid email address." };
  if (!TOOLS.has(tool)) return { ok: false, error: "Unknown tool." };

  await ensureTable();
  // Re-submitting the same address from the same tool is a no-op, not an error.
  await db()`insert into tool_emails (email, tool, path, locale, consent)
    values (${email}, ${tool}, ${path}, ${locale}, ${CONSENT})
    on conflict (email, tool) do nothing`;
  return { ok: true };
}

// ── tiny in-memory rate limit (per IP, sliding hour) ─────────────────────
const HITS = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;

function rateLimited(ip) {
  const now = Date.now();
  const hits = (HITS.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    HITS.set(ip, hits);
    return true;
  }
  hits.push(now);
  HITS.set(ip, hits);
  if (HITS.size > 5000) HITS.clear();
  return false;
}

module.exports = { save, rateLimited, CONSENT };
