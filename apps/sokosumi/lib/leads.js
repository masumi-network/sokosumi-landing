// Talk-to-Sales lead handling: validate, store in the CMS, then notify by
// email. Storing first is deliberate — if the mail provider is down or
// unconfigured, the lead is still in the admin rather than lost.
//
// Env:
//   CMS_FORMS_KEY      payload API key of forms@sokosumi.com (required to store)
//   RESEND_API_KEY     enables the notification email (optional)
//   SALES_NOTIFY_EMAIL   where sales notifications go (default info@sokosumi.com)
//   SUPPORT_NOTIFY_EMAIL where support notifications go (default support@sokosumi.com)
//   SALES_FROM_EMAIL     verified Resend sender (default noreply@sokosumi.com)

const { CMS_URL } = require("./cms");

const FORMS_KEY = process.env.CMS_FORMS_KEY || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const NOTIFY_TO = process.env.SALES_NOTIFY_EMAIL || "info@sokosumi.com";
const SUPPORT_TO = process.env.SUPPORT_NOTIFY_EMAIL || "support@sokosumi.com";
const NOTIFY_FROM = process.env.SALES_FROM_EMAIL || "Sokosumi <noreply@sokosumi.com>";

const MAX_FIELD = 4000;
const TEAM_SIZES = new Set(["1-10", "11-50", "51-200", "200+"]);

// Deliberately permissive: one @, a dot in the domain, no spaces. Stricter
// regexes reject valid addresses more often than they stop bad ones.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/;

function clean(v) {
  return String(v == null ? "" : v).trim().slice(0, MAX_FIELD);
}

// Returns { ok: true, lead } or { ok: false, error }.
function validate(body) {
  // Honeypot: a real browser leaves this hidden field empty. Bots fill it.
  if (clean(body.website)) return { ok: false, error: "spam" };

  const name = clean(body.name);
  const email = clean(body.email);
  const company = clean(body.company);
  const message = clean(body.message);
  const requestType = body.requestType === "reply" ? "reply" : "meeting";
  const teamSize = TEAM_SIZES.has(body.teamSize) ? body.teamSize : undefined;

  if (name.length < 2) return { ok: false, error: "Please add your name." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please add a valid email address." };
  if (message.length < 10) return { ok: false, error: "Please tell us a little about what you need." };

  return { ok: true, lead: { name, email, company, message, requestType, teamSize } };
}

// Support asks for less than sales: what broke, who you are, and optionally
// the task it happened on.
function validateSupport(body) {
  if (clean(body.website)) return { ok: false, error: "spam" };
  const name = clean(body.name);
  const email = clean(body.email);
  const message = clean(body.message);
  const taskLink = clean(body.taskLink);

  if (name.length < 2) return { ok: false, error: "Please add your name." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please add a valid email address." };
  if (message.length < 10) return { ok: false, error: "Please describe what happened." };

  return { ok: true, lead: { name, email, message, taskLink, requestType: "reply" } };
}

async function storeLead(lead, source, kind) {
  if (!FORMS_KEY) throw new Error("CMS_FORMS_KEY not set — cannot store the lead");
  const res = await fetch(`${CMS_URL}/api/sales-inquiries`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `users API-Key ${FORMS_KEY}`,
    },
    body: JSON.stringify({ ...lead, kind: kind || "sales", source, status: "new", notified: false }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`CMS create failed: HTTP ${res.status} ${detail.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.doc ? json.doc.id : null;
}

async function markNotified(id) {
  if (!id || !FORMS_KEY) return;
  await fetch(`${CMS_URL}/api/sales-inquiries/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", authorization: `users API-Key ${FORMS_KEY}` },
    body: JSON.stringify({ notified: true }),
  }).catch(() => {});
}

function emailBody(lead, source) {
  const line = (k, v) => (v ? `${k}: ${v}\n` : "");
  return (
    `New Talk to Sales inquiry from sokosumi.com\n\n` +
    line("Name", lead.name) +
    line("Email", lead.email) +
    line("Company", lead.company) +
    line("Team size", lead.teamSize) +
    line("Wants", lead.requestType === "meeting" ? "a meeting" : "a reply by email") +
    line("Page", source) +
    `\nMessage:\n${lead.message}\n`
  );
}

function supportBody(lead, source) {
  const line = (k, v) => (v ? `${k}: ${v}\n` : "");
  return (
    `New support request from sokosumi.com\n\n` +
    line("Name", lead.name) +
    line("Email", lead.email) +
    line("Task or job", lead.taskLink) +
    line("Page", source) +
    `\nWhat happened:\n${lead.message}\n`
  );
}

async function sendSupportEmail(lead, source) {
  if (!RESEND_API_KEY) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({
      from: NOTIFY_FROM,
      to: [SUPPORT_TO],
      reply_to: lead.email,
      subject: `Sokosumi support: ${lead.name}`,
      text: supportBody(lead, source),
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend failed: HTTP ${res.status} ${detail.slice(0, 200)}`);
  }
  return true;
}

async function sendEmail(lead, source) {
  if (!RESEND_API_KEY) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({
      from: NOTIFY_FROM,
      to: [NOTIFY_TO],
      reply_to: lead.email,
      subject: `Sokosumi: ${lead.requestType === "meeting" ? "meeting request" : "inquiry"} from ${lead.name}${
        lead.company ? ` (${lead.company})` : ""
      }`,
      text: emailBody(lead, source),
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend failed: HTTP ${res.status} ${detail.slice(0, 200)}`);
  }
  return true;
}

// Store then notify. A mail failure never fails the submission, because the
// lead is already saved; it is logged and left with notified = false.
async function submitLead(body, source) {
  const v = validate(body);
  if (!v.ok) return v;

  let id = null;
  try {
    id = await storeLead(v.lead, source, "sales");
  } catch (e) {
    console.error("[leads] store failed:", e.message);
    // Without storage the email is the only copy, so it must succeed.
    try {
      const sent = await sendEmail(v.lead, source);
      if (!sent) throw new Error("no email transport configured");
      console.log("[leads] stored=false emailed=true");
      return { ok: true, lead: v.lead };
    } catch (mailErr) {
      console.error("[leads] email fallback failed:", mailErr.message);
      return { ok: false, error: "We could not record that right now. Please email info@sokosumi.com directly." };
    }
  }

  try {
    if (await sendEmail(v.lead, source)) await markNotified(id);
    else console.warn("[leads] RESEND_API_KEY not set — lead stored, no email sent");
  } catch (e) {
    console.error("[leads] email failed (lead is stored):", e.message);
  }
  return { ok: true, lead: v.lead };
}

// Same store-then-notify shape as sales: the record is the copy of record,
// the email is the notification.
async function submitSupport(body, source) {
  const v = validateSupport(body);
  if (!v.ok) return v;

  let id = null;
  try {
    id = await storeLead(v.lead, source, "support");
  } catch (e) {
    console.error("[support] store failed:", e.message);
    try {
      const sent = await sendSupportEmail(v.lead, source);
      if (!sent) throw new Error("no email transport configured");
      console.log("[support] stored=false emailed=true");
      return { ok: true, lead: v.lead };
    } catch (mailErr) {
      console.error("[support] email fallback failed:", mailErr.message);
      return { ok: false, error: `We could not record that right now. Please email ${SUPPORT_TO} directly.` };
    }
  }

  try {
    if (await sendSupportEmail(v.lead, source)) await markNotified(id);
    else console.warn("[support] RESEND_API_KEY not set — request stored, no email sent");
  } catch (e) {
    console.error("[support] email failed (request is stored):", e.message);
  }
  return { ok: true, lead: v.lead };
}

// ── tiny in-memory rate limit (per IP, sliding hour) ─────────────────────
const HITS = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip) {
  const now = Date.now();
  const hits = (HITS.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    HITS.set(ip, hits);
    return true;
  }
  hits.push(now);
  HITS.set(ip, hits);
  if (HITS.size > 5000) HITS.clear(); // crude guard against unbounded growth
  return false;
}

module.exports = { submitLead, submitSupport, rateLimited, validate, validateSupport, SUPPORT_TO };
