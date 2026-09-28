// A lead form redirects back with ?sent=1 whether the server stored the lead
// or quietly dropped it as spam, and anyone can open that URL directly. The
// generate_lead event must only fire for a lead that was really stored, so the
// server adds a signed, short-lived receipt to the redirect after the store
// succeeds, and the page renders the event only when the receipt verifies.
// The browser remembers each receipt it has sent (assets/track.js), so a
// reload does not count the lead twice.

const crypto = require("crypto");

const SECRET = process.env.LEAD_RECEIPT_SECRET || process.env.CMS_FORMS_KEY || "";
const MAX_AGE_MS = 15 * 60 * 1000;

function sign(form, ts) {
  return crypto.createHmac("sha256", SECRET).update(`${form}.${ts}`).digest("base64url").slice(0, 22);
}

function issue(form) {
  const ts = Date.now().toString(36);
  return `${ts}.${sign(form, ts)}`;
}

function verify(receipt, form) {
  if (!SECRET || typeof receipt !== "string") return false;
  const [ts, mac] = receipt.split(".");
  if (!ts || !mac) return false;
  const age = Date.now() - parseInt(ts, 36);
  if (!(age >= 0 && age <= MAX_AGE_MS)) return false;
  const expected = sign(form, ts);
  return mac.length === expected.length && crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected));
}

// The analytics attributes for a success state, or nothing when the receipt
// does not prove a stored lead.
function analyticsAttrs(receipt, form) {
  if (!verify(receipt, form)) return "";
  return ` data-analytics="generate_lead" data-analytics-on="load" data-analytics-form-name="${form}" data-once="${receipt}"`;
}

module.exports = { issue, verify, analyticsAttrs };
