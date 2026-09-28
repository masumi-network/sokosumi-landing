// Fetching arbitrary user-supplied URLs, safely.
//
// Both free tools point our server at a URL a stranger typed — /tools/og-checker
// at their page, /tools/llms-txt at their llms.txt — which makes this the SSRF
// surface for the whole site. It lived inside lib/ogCheck.js until the second
// tool needed it; two copies of a security boundary is one copy too many.
//
// The rules, none of which are optional:
//
//   * http(s) only, no credentials in the URL.
//   * The hostname is RESOLVED and every address it answers with is checked,
//     not just the literal string. `internal.example.com` pointing at
//     169.254.169.254 is the whole attack.
//   * Both A and AAAA are checked. A host with a public A record and a private
//     AAAA record would otherwise walk straight through.
//   * Redirects are followed BY HAND so every hop is re-validated. A public
//     first hop redirecting to metadata is the other half of the attack.
//   * Every read is byte-capped, so a 40GB response cannot take the process
//     down.
//
// There is a TOCTOU window between the resolve and the connect that this does
// not close; closing it needs a custom agent that pins the resolved address.
// Worth doing if this ever fetches anything privileged. Today both callers are
// read-only and public.

const dns = require("dns").promises;
const net = require("net");

const MAX_REDIRECTS = 5;

function privateIPv4(hostname) {
  const p = hostname.split(".").map(Number);
  return (
    p[0] === 0 ||
    p[0] === 10 ||
    p[0] === 127 ||
    (p[0] === 100 && p[1] >= 64 && p[1] <= 127) ||
    (p[0] === 169 && p[1] === 254) ||
    (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
    (p[0] === 192 && p[1] === 168) ||
    (p[0] === 198 && (p[1] === 18 || p[1] === 19)) ||
    p[0] >= 224
  );
}

function privateIPv6(hostname) {
  const h = hostname.toLowerCase();
  return h === "::" || h === "::1" || /^f[cd]/.test(h) || /^fe[89ab]/.test(h) || /^::ffff:/.test(h);
}

function privateAddress(hostname) {
  const version = net.isIP(hostname);
  if (version === 4) return privateIPv4(hostname);
  if (version === 6) return privateIPv6(hostname);
  return false;
}

// Syntactic check. Returns the normalised href, or null.
function publicUrl(value) {
  let parsed;
  try {
    parsed = new URL(String(value || "").trim());
  } catch {
    return null;
  }
  if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password) return null;
  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (!hostname) return null;
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) return null;
  if (privateAddress(hostname)) return null;
  parsed.hash = "";
  return parsed.href;
}

// "ok" | "blocked" | "dns" — the caller needs to tell "this host does not
// exist" from "this host resolves somewhere we refuse to connect to", because
// those are very different messages to put in front of a user.
async function resolvesPublicly(hostname) {
  const host = hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(host)) return privateAddress(host) ? "blocked" : "ok";
  let records;
  try {
    records = await dns.lookup(host, { all: true, verbatim: true });
  } catch {
    return "dns";
  }
  if (!records.length) return "dns";
  return records.every((r) => !privateAddress(r.address)) ? "ok" : "blocked";
}

async function assertFetchable(href) {
  const safe = publicUrl(href);
  if (!safe) throw Object.assign(new Error("blocked"), { code: "blocked" });
  const verdict = await resolvesPublicly(new URL(safe).hostname);
  if (verdict !== "ok") throw Object.assign(new Error(verdict), { code: verdict });
  return safe;
}

// Redirects are followed by hand so every hop is validated, not just the first.
async function safeFetch(startUrl, init, timeout) {
  let current = await assertFetchable(startUrl);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const response = await fetch(current, {
      ...init,
      redirect: "manual",
      signal: AbortSignal.timeout(timeout),
    });
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      let next;
      try {
        next = new URL(location, current).href;
      } catch {
        return { response, url: current };
      }
      const safe = await assertFetchable(next);
      try {
        await response.body?.cancel();
      } catch {
        /* already consumed */
      }
      current = safe;
      continue;
    }
    return { response, url: current };
  }
  throw Object.assign(new Error("too-many-redirects"), { code: "redirects" });
}

// Read at most `limit` bytes off the body, then hang up.
async function readCapped(response, limit) {
  if (!response.body) return Buffer.alloc(0);
  const chunks = [];
  let size = 0;
  const reader = response.body.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(Buffer.from(value));
      size += value.length;
      if (size >= limit) break;
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      /* stream already closed */
    }
  }
  return Buffer.concat(chunks).subarray(0, limit);
}

// One message per failure mode, so callers do not each invent their own.
function fetchErrorMessage(error) {
  if (error.code === "dns") return "That domain does not resolve. Check the spelling.";
  if (error.code === "blocked") return "That URL points to a private address we will not fetch.";
  if (error.code === "redirects") return "That URL redirects too many times.";
  if (error.name === "TimeoutError") return "The site took too long to respond.";
  return "We could not reach that URL. It may be blocking automated requests.";
}

module.exports = { publicUrl, safeFetch, readCapped, fetchErrorMessage, privateAddress };
