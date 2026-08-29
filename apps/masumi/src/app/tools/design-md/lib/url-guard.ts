// URL normalisation and SSRF protection for the DESIGN.md extractor.
//
// The extract endpoint takes an arbitrary user-supplied URL. Browserbase
// renders remotely, so that path is someone else's network — but the fallback
// in extract-from-url.ts is a plain fetch() from OUR server, which means an
// unguarded URL is a server-side request forgery: cloud metadata endpoints
// (169.254.169.254), loopback, and anything on the private network are all
// reachable from inside the app.
//
// Guarding on the string alone is not enough. A hostname can resolve to a
// private address, so the check has to happen after DNS.

import dns from "node:dns/promises";
import net from "node:net";

export class BlockedUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlockedUrlError";
  }
}

/**
 * Canonical form of a URL for cache keys and storage.
 *
 * `stripe.com`, `https://stripe.com`, `https://stripe.com/` and
 * `https://www.stripe.com/` are one site, and before this they were four
 * separate cache entries — four Browserbase sessions and four LLM calls for
 * the same page. Lowercases the host, drops `www.`, drops a bare trailing
 * slash, and drops the fragment. The query string is kept: `?lang=de` can be
 * a genuinely different page.
 */
export function normalizeUrl(input: string): string {
  const trimmed = String(input || "").trim();
  // Reject a non-http scheme BEFORE defaulting one in: "ftp://example.com"
  // does not match ^https?:// , so prepending would produce
  // "https://ftp://example.com", which parses as host "ftp" and passes.
  const scheme = trimmed.match(/^([a-z][a-z0-9+.-]*):\/\//i);
  if (scheme && !/^https?$/i.test(scheme[1])) {
    throw new BlockedUrlError("Only http and https URLs can be analysed.");
  }
  const withScheme = scheme ? trimmed : `https://${trimmed}`;
  let u: URL;
  try {
    u = new URL(withScheme);
  } catch {
    throw new BlockedUrlError("That does not look like a URL.");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new BlockedUrlError("Only http and https URLs can be analysed.");
  }
  u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
  u.hash = "";
  if (u.pathname === "/") u.pathname = "";
  return u.toString();
}

/**
 * The registrable domain, used to tell one brand from another.
 *
 * Hostname-only dedupe treats notion.so and notion.com as two brands, which is
 * how the gallery ended up with two Notion analyses and two identical <title>
 * tags. This strips the public suffix so both key on "notion".
 *
 * Not a full PSL implementation — that would need a dependency and a data file
 * for a gallery of ~100 entries. It handles the common two-part suffixes and
 * falls back to the last two labels.
 */
const MULTI_PART_SUFFIXES = new Set([
  "co.uk", "org.uk", "ac.uk", "gov.uk", "co.jp", "or.jp", "ne.jp", "com.au",
  "net.au", "org.au", "co.nz", "com.br", "com.mx", "co.za", "com.tr", "co.in",
  "com.cn", "com.sg", "com.hk",
]);

export function registrableDomain(hostname: string): string {
  const host = hostname.toLowerCase().replace(/^www\./, "").replace(/\.$/, "");
  const parts = host.split(".");
  if (parts.length <= 2) return host;
  const lastTwo = parts.slice(-2).join(".");
  return MULTI_PART_SUFFIXES.has(lastTwo)
    ? parts.slice(-3).join(".")
    : lastTwo;
}

/** The brand key: registrable domain minus its suffix. notion.so -> notion */
export function brandKey(hostname: string): string {
  return registrableDomain(hostname).split(".")[0] || hostname;
}

// RFC1918 and friends, plus the cloud metadata address, plus loopback,
// link-local, CGNAT and unique-local v6.
function isPrivateAddress(ip: string): boolean {
  const v = net.isIP(ip);
  if (v === 4) {
    const p = ip.split(".").map(Number);
    if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
    const [a, b] = p;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true; // link-local incl. 169.254.169.254
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // multicast + reserved
    return false;
  }
  if (v === 6) {
    const ip6 = ip.toLowerCase();
    if (ip6 === "::" || ip6 === "::1") return true;
    if (ip6.startsWith("fe80")) return true; // link-local
    if (/^f[cd]/.test(ip6)) return true; // unique-local
    // v4-mapped addresses. WHATWG URL rewrites ::ffff:169.254.169.254 into
    // hex form (::ffff:a9fe:a9fe), so both spellings have to be unpacked or
    // the metadata endpoint walks straight through in its v6 disguise.
    const dotted = ip6.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (dotted) return isPrivateAddress(dotted[1]);
    const hex = ip6.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hex) {
      const n = (parseInt(hex[1], 16) << 16) | parseInt(hex[2], 16);
      return isPrivateAddress(
        [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join("."),
      );
    }
    return false;
  }
  return true; // unparseable — refuse
}

/**
 * Resolves the host and refuses anything that lands on a private or
 * link-local address. Call before every outbound fetch or render.
 */
export async function assertPublicUrl(url: string): Promise<void> {
  // URL.hostname wraps an IPv6 literal in brackets ("[::1]"), which net.isIP
  // does not recognise — strip them before the check.
  const hostname = new URL(url).hostname.replace(/^\[|\]$/g, "");

  // A bare IP literal never needs DNS, and must still be checked.
  if (net.isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      throw new BlockedUrlError("That address is not publicly reachable.");
    }
    return;
  }
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".internal")) {
    throw new BlockedUrlError("That address is not publicly reachable.");
  }

  let addrs: { address: string }[];
  try {
    addrs = await dns.lookup(hostname, { all: true });
  } catch {
    throw new BlockedUrlError(`Could not resolve ${hostname}.`);
  }
  if (!addrs.length) throw new BlockedUrlError(`Could not resolve ${hostname}.`);
  for (const { address } of addrs) {
    if (isPrivateAddress(address)) {
      throw new BlockedUrlError("That address is not publicly reachable.");
    }
  }
}
