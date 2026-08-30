// Open Graph / social-card inspection for /tools/og-checker.
//
// Fetches a public URL the way a social crawler would, reads the meta tags out
// of the HTML, probes the og:image for its real type and dimensions, and turns
// all of it into a list of pass/warn/error checks the page renders.
//
// Everything here runs server-side because a browser cannot fetch a third-party
// page (CORS) and cannot read an image's Content-Length. That makes this an
// SSRF surface, so every hop — the page and every redirect, then the image — is
// re-validated against isPublicUrl() *after* its hostname resolves.

const dns = require("dns").promises;
const net = require("net");

const UA =
  "Mozilla/5.0 (compatible; SokosumiOG/1.0; +https://www.sokosumi.com/tools/og-checker)";
const HTML_LIMIT = 768 * 1024; // enough for any sane <head>
const IMAGE_PROBE_BYTES = 65536; // dimensions live in the first few bytes
const PAGE_TIMEOUT = 12000;
const IMAGE_TIMEOUT = 10000;
const MAX_REDIRECTS = 5;

// ---------------------------------------------------------------------------
// URL safety

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

// A hostname can point anywhere, so resolve it before we connect. Both records
// are looked up: a host with a public A record and a private AAAA record would
// otherwise slip through.
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

// Throws rather than returning null so the caller can tell "this host does not
// exist" from "this host resolves somewhere we refuse to connect to".
async function assertFetchable(href) {
  const safe = publicUrl(href);
  if (!safe) throw Object.assign(new Error("blocked"), { code: "blocked" });
  const verdict = await resolvesPublicly(new URL(safe).hostname);
  if (verdict !== "ok") throw Object.assign(new Error(verdict), { code: verdict });
  return safe;
}

// ---------------------------------------------------------------------------
// Fetching

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

// Read at most `limit` bytes off the body, then hang up. A 40MB HTML file is
// not going to have a better <head> than its first 768KB.
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

// ---------------------------------------------------------------------------
// HTML → meta tags

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'", "#x27": "'" };

function decodeEntities(value) {
  return String(value).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, name) => {
    const key = name.toLowerCase();
    if (ENTITIES[key]) return ENTITIES[key];
    if (key[0] === "#") {
      const code = key[1] === "x" ? parseInt(key.slice(2), 16) : parseInt(key.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return match;
  });
}

const ATTR = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;

function attrs(tag) {
  const out = {};
  ATTR.lastIndex = 0;
  let match;
  while ((match = ATTR.exec(tag))) {
    out[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return out;
}

// The meta tags a social crawler reads, in the order we want to show them.
function parseHtml(html) {
  // Only the head matters, and stopping there keeps a <meta> inside a code
  // sample in the body from being reported as a real tag.
  const headEnd = html.search(/<\/head\s*>|<body[\s>]/i);
  const head = headEnd > -1 ? html.slice(0, headEnd) : html;

  const tags = [];
  for (const match of head.matchAll(/<meta\b([^>]*)>/gi)) {
    const a = attrs(match[1]);
    const key = a.property || a.name || a["http-equiv"] || "";
    const content = a.content ?? "";
    if (!key || content === "") continue;
    tags.push({ key: key.toLowerCase(), attr: a.property ? "property" : "name", value: content });
  }

  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head);
  const title = titleMatch ? decodeEntities(titleMatch[1].replace(/\s+/g, " ")).trim() : "";

  let canonical = "";
  let base = "";
  for (const match of head.matchAll(/<link\b([^>]*)>/gi)) {
    const a = attrs(match[1]);
    const rel = String(a.rel || "").toLowerCase();
    if (rel.split(/\s+/).includes("canonical") && a.href && !canonical) canonical = a.href;
  }
  const baseMatch = /<base\b([^>]*)>/i.exec(head);
  if (baseMatch) base = attrs(baseMatch[1]).href || "";

  const lang = (/<html\b([^>]*)>/i.exec(html) ? attrs(/<html\b([^>]*)>/i.exec(html)[1]).lang : "") || "";

  return { tags, title, canonical, base, lang };
}

// og:image may legitimately appear more than once; first wins for the preview.
function firstValue(tags, key) {
  const hit = tags.find((t) => t.key === key);
  return hit ? hit.value.trim() : "";
}

function allValues(tags, key) {
  return tags.filter((t) => t.key === key).map((t) => t.value.trim());
}

// ---------------------------------------------------------------------------
// Image dimensions, read straight out of the file header

function jpegSize(buf) {
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const length = buf.readUInt16BE(i + 2);
    const isSOF = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSOF) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + length;
  }
  return null;
}

function webpSize(buf) {
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X" && buf.length >= 30) {
    return {
      width: 1 + buf.readUIntLE(24, 3),
      height: 1 + buf.readUIntLE(27, 3),
    };
  }
  if (chunk === "VP8 " && buf.length >= 30) {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L" && buf.length >= 25) {
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

function svgSize(buf) {
  const text = buf.toString("utf8", 0, Math.min(buf.length, 4096));
  const tag = /<svg\b([^>]*)>/i.exec(text);
  if (!tag) return null;
  const a = attrs(tag[1]);
  const num = (v) => {
    const n = parseFloat(String(v || ""));
    return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
  };
  const width = num(a.width);
  const height = num(a.height);
  if (width && height) return { width, height };
  const box = String(a.viewbox || "").trim().split(/[\s,]+/).map(Number);
  if (box.length === 4 && box.every(Number.isFinite) && box[2] > 0 && box[3] > 0) {
    return { width: Math.round(box[2]), height: Math.round(box[3]) };
  }
  return null;
}

function imageSize(buf) {
  if (buf.length < 16) return null;
  if (buf.readUInt32BE(0) === 0x89504e47 && buf.toString("ascii", 12, 16) === "IHDR") {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), format: "png" };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    const size = jpegSize(buf);
    return size && { ...size, format: "jpeg" };
  }
  if (buf.toString("ascii", 0, 3) === "GIF") {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8), format: "gif" };
  }
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const size = webpSize(buf);
    return size && { ...size, format: "webp" };
  }
  if (buf.toString("ascii", 4, 12) === "ftypavif") {
    return { format: "avif" }; // container parsing is not worth it; type is enough
  }
  const head = buf.toString("utf8", 0, Math.min(buf.length, 256)).trimStart();
  if (head.startsWith("<svg") || head.startsWith("<?xml")) {
    const size = svgSize(buf);
    return size ? { ...size, format: "svg" } : { format: "svg" };
  }
  return null;
}

async function probeImage(href, pageUrl) {
  let absolute;
  try {
    absolute = new URL(href, pageUrl).href;
  } catch {
    return { url: href, ok: false, reason: "invalid" };
  }
  if (!publicUrl(absolute)) return { url: absolute, ok: false, reason: "unsupported-scheme" };

  try {
    const { response, url } = await safeFetch(
      absolute,
      { headers: { "User-Agent": UA, Accept: "image/*,*/*", Range: `bytes=0-${IMAGE_PROBE_BYTES - 1}` } },
      IMAGE_TIMEOUT,
    );
    if (!response.ok && response.status !== 206) {
      try {
        await response.body?.cancel();
      } catch {
        /* nothing buffered */
      }
      return { url, ok: false, reason: "status", status: response.status };
    }
    const buf = await readCapped(response, IMAGE_PROBE_BYTES);
    const contentType = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();

    // With a 206 the total is in Content-Range; with a 200 the server ignored
    // the range and Content-Length is the whole file.
    let bytes = 0;
    const range = response.headers.get("content-range");
    const total = range && /\/(\d+)\s*$/.exec(range);
    if (total) bytes = Number(total[1]);
    else if (response.status === 200) bytes = Number(response.headers.get("content-length") || 0);

    const size = imageSize(buf) || {};
    return {
      url,
      ok: true,
      status: response.status,
      contentType,
      bytes: Number.isFinite(bytes) && bytes > 0 ? bytes : 0,
      width: size.width || 0,
      height: size.height || 0,
      format: size.format || "",
    };
  } catch (error) {
    return { url: absolute, ok: false, reason: error.code === "blocked" ? "blocked" : error.code === "dns" ? "dns" : "unreachable" };
  }
}

// ---------------------------------------------------------------------------
// The checks
//
// Every entry is { level, title, tag, detail }. Levels: error (the card will
// visibly break), warn (it renders but loses something), pass (fine, said out
// loud so the report reads as a review rather than a list of complaints).

const KB = 1024;
const IDEAL = { width: 1200, height: 630 };
const MIN_IMAGE = 200; // Facebook refuses anything smaller
const MAX_IMAGE_BYTES = 8 * KB * KB; // Facebook's documented ceiling
const TIGHT_IMAGE_BYTES = 5 * KB * KB; // X and LinkedIn both stop here
const RENDERABLE = new Set(["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"]);

const kb = (n) => (n >= KB * KB ? `${(n / (KB * KB)).toFixed(1)} MB` : `${Math.round(n / KB)} KB`);
const quote = (s, n = 70) => `"${s.length > n ? `${s.slice(0, n - 1)}…` : s}"`;

function isAbsolute(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function buildChecks(data) {
  const { tags, title, canonical, lang, image, finalUrl, status } = data;
  const out = [];
  const add = (level, checkTitle, tag, detail) => out.push({ level, title: checkTitle, tag, detail });

  if (status === 403 || status === 429 || status === 401) {
    add("error", `The page returns HTTP ${status}`, "http", "The site turned us away rather than serving the page — usually a bot filter or a login wall. Social crawlers hit the same wall, so the card they build will be whatever this error page contains. Allow the crawler user agents through if you want previews to work.");
  } else if (status >= 400) {
    add("error", `The page returns HTTP ${status}`, "http", "Everything below describes markup a crawler will most likely never index. Fix the status first.");
  } else if (data.redirected) {
    add("warn", "The URL redirects", "http", `Shares land on ${finalUrl}. Platforms cache the final URL, so point og:url at it.`);
  }

  const ogTitle = firstValue(tags, "og:title");
  const ogDesc = firstValue(tags, "og:description");
  const ogImage = firstValue(tags, "og:image") || firstValue(tags, "og:image:url");
  const ogUrl = firstValue(tags, "og:url");
  const ogType = firstValue(tags, "og:type");
  const ogSite = firstValue(tags, "og:site_name");
  const ogAlt = firstValue(tags, "og:image:alt");
  const ogLocale = firstValue(tags, "og:locale");
  const metaDesc = firstValue(tags, "description");
  const twCard = firstValue(tags, "twitter:card");
  const twTitle = firstValue(tags, "twitter:title");
  const twDesc = firstValue(tags, "twitter:description");
  const twImage = firstValue(tags, "twitter:image") || firstValue(tags, "twitter:image:src");

  // --- title -----------------------------------------------------------
  if (!ogTitle) {
    if (title) {
      add("error", "og:title is missing", "og:title", `Crawlers fall back to <title> — ${quote(title)} — but that title is written for a search result, not a share card. Set og:title explicitly.`);
    } else {
      add("error", "No title at all", "og:title", "Neither og:title nor <title> is set. Most platforms will show the bare URL instead of a headline.");
    }
  } else if (ogTitle.length > 70) {
    add("warn", "og:title is long", "og:title", `${ogTitle.length} characters. X cuts around 70 and WhatsApp around 65, so the end of this headline will be clipped.`);
  } else if (ogTitle.length < 15) {
    add("warn", "og:title is very short", "og:title", `${quote(ogTitle)} — ${ogTitle.length} characters. There is room for a headline that earns the click.`);
  } else {
    add("pass", "og:title reads well", "og:title", `${quote(ogTitle)} — ${ogTitle.length} characters, inside every platform's limit.`);
  }

  // --- description -----------------------------------------------------
  if (!ogDesc) {
    if (metaDesc) {
      add("warn", "og:description is missing", "og:description", `Falling back to the meta description — ${quote(metaDesc, 60)}. LinkedIn and Discord read og:description first and may show nothing.`);
    } else {
      add("error", "No description at all", "og:description", "Neither og:description nor meta description is set. The card will be a headline with empty space under it.");
    }
  } else if (ogDesc.length > 200) {
    add("warn", "og:description is long", "og:description", `${ogDesc.length} characters. Facebook shows about 200 on desktop and roughly 110 on mobile — the rest is cut.`);
  } else if (ogDesc.length < 50) {
    add("warn", "og:description is short", "og:description", `${ogDesc.length} characters. Two lines of copy convert better than one fragment.`);
  } else {
    add("pass", "og:description is a good length", "og:description", `${ogDesc.length} characters — enough to say something, short enough to survive mobile truncation.`);
  }

  // --- image -----------------------------------------------------------
  if (!ogImage) {
    add("error", "og:image is missing", "og:image", "Without an image the link renders as a plain text row. This is the single biggest lever on social click-through.");
  } else if (!isAbsolute(ogImage)) {
    add("error", "og:image is not an absolute URL", "og:image", `${quote(ogImage, 60)} is relative. Facebook, X and LinkedIn all require a full https:// URL — they do not resolve it against the page.`);
  } else if (!image || !image.ok) {
    const why =
      image && image.reason === "status"
        ? image.status === 403 || image.status === 401
          ? `The image URL returned HTTP ${image.status} — it is behind a bot filter or a login. Crawlers get the same refusal.`
          : `The image URL returned HTTP ${image.status}.`
        : image && image.reason === "blocked"
          ? "The image URL points somewhere we will not fetch."
          : "The image URL could not be loaded.";
    add("error", "og:image does not load", "og:image", `${why} A crawler that cannot fetch the image will render the card without one.`);
  } else {
    if (image.contentType === "image/svg+xml" || image.format === "svg") {
      add("error", "og:image is an SVG", "og:image", "Facebook, X and LinkedIn do not render SVG cards. Export a PNG or JPEG.");
    } else if (image.contentType && !RENDERABLE.has(image.contentType)) {
      add("warn", "og:image format is unusual", "og:image", `Served as ${image.contentType}. PNG, JPEG, GIF and WebP are the formats every platform decodes; anything else is a gamble.`);
    }

    const vector = image.contentType === "image/svg+xml" || image.format === "svg";
    if (vector) {
      // already reported above; a vector's pixel dimensions mean nothing here
    } else if (image.width && image.height) {
      const ratio = image.width / image.height;
      if (image.width < MIN_IMAGE || image.height < MIN_IMAGE) {
        add("error", "og:image is too small", "og:image", `${image.width}×${image.height}. Facebook rejects images under 200px on a side and will drop the card image entirely.`);
      } else if (image.width === IDEAL.width && image.height === IDEAL.height) {
        add("pass", "og:image is exactly 1200×630", "og:image", "The size every major platform is built around. Nothing gets cropped.");
      } else if (image.width < 600) {
        // The two thresholds are different and both documented: Facebook wants
        // 600px for the wide card, LinkedIn 401px.
        const alsoLinkedIn = image.width < 401 ? " LinkedIn does the same below 401px." : " LinkedIn still gets its wide card above 401px.";
        add("warn", "og:image is low resolution", "og:image", `${image.width}×${image.height}. Facebook falls back to a small square thumbnail under 600px wide instead of the wide card.${alsoLinkedIn}`);
      } else if (ratio < 1.6 || ratio > 2.2) {
        add("warn", "og:image aspect ratio is off", "og:image", `${image.width}×${image.height} is ${ratio.toFixed(2)}:1. Cards are cropped to 1.91:1, so the top and bottom of this image will be cut.`);
      } else {
        add("pass", "og:image dimensions work", "og:image", `${image.width}×${image.height} — close enough to 1.91:1 that cropping will not hurt. 1200×630 is the safest exact size.`);
      }
    } else {
      add("warn", "og:image dimensions unknown", "og:image", "The file loads but its header did not declare a size. Platforms that pre-check dimensions may skip it.");
    }

    if (image.bytes > MAX_IMAGE_BYTES) {
      add("error", "og:image is over 8 MB", "og:image", `${kb(image.bytes)}. Facebook's documented ceiling is 8 MB, and X and LinkedIn stop at 5 MB, so no major platform will take this file.`);
    } else if (image.bytes > TIGHT_IMAGE_BYTES) {
      // Between 5 and 8 MB is the trap: Facebook accepts it, so the card looks
      // fine where most people check, and X and LinkedIn quietly drop it.
      add("error", "og:image is over 5 MB", "og:image", `${kb(image.bytes)}. Facebook allows up to 8 MB so it will look fine there, but X and LinkedIn both stop at 5 MB and will render the card without an image.`);
    } else if (image.bytes > 2 * KB * KB) {
      add("warn", "og:image is heavy", "og:image", `${kb(image.bytes)}. Crawlers time out on slow images; keep the file under about 1 MB.`);
    } else if (image.bytes) {
      add("pass", "og:image loads cleanly", "og:image", `${kb(image.bytes)} ${image.contentType || image.format}, HTTP ${image.status}.`);
    }

    if (/^http:\/\//i.test(image.url) && /^https:\/\//i.test(finalUrl)) {
      add("warn", "og:image is served over http", "og:image", "The page is https but the image is not. Some clients block the mixed-content fetch and show no image.");
    }
  }

  if (ogImage && !ogAlt) {
    add("warn", "og:image:alt is missing", "og:image:alt", "Screen readers on Facebook, LinkedIn and Mastodon read this. One sentence describing the image is enough.");
  } else if (ogAlt) {
    add("pass", "og:image:alt is set", "og:image:alt", `${quote(ogAlt, 60)} — the card is readable to someone who cannot see it.`);
  }

  // --- identity --------------------------------------------------------
  if (!ogUrl) {
    add("warn", "og:url is missing", "og:url", "Platforms use this to merge share counts and to canonicalise tracking parameters. Without it, ?utm_source variants count as separate pages.");
  } else if (!isAbsolute(ogUrl)) {
    add("warn", "og:url is not absolute", "og:url", `${quote(ogUrl, 60)} needs to be a full https:// URL.`);
  } else {
    add("pass", "og:url is set", "og:url", `${ogUrl} — shares of this page consolidate onto one URL.`);
  }

  if (!ogType) {
    add("warn", "og:type is missing", "og:type", 'Defaults to "website". Set "article" on posts so LinkedIn and Facebook can show the byline and date.');
  } else {
    add("pass", "og:type is set", "og:type", `"${ogType}".`);
  }

  if (!ogSite) {
    add("warn", "og:site_name is missing", "og:site_name", "Discord and Slack print this above the title as the source label. Without it they fall back to the bare domain.");
  } else {
    add("pass", "og:site_name is set", "og:site_name", `${quote(ogSite, 40)} — Discord and Slack use it as the eyebrow above the title.`);
  }

  // --- X ---------------------------------------------------------------
  if (!twCard) {
    add("warn", "twitter:card is missing", "twitter:card", 'X falls back to the small square card. Set "summary_large_image" to get the full-width image.');
  } else if (twCard === "summary_large_image") {
    add("pass", "twitter:card uses the large image", "twitter:card", "summary_large_image is set, so X renders the image at full card width.");
  } else {
    add("warn", `twitter:card is "${twCard}"`, "twitter:card", 'Only "summary_large_image" gets the wide card. "summary" shows a small square thumbnail.');
  }

  if (twTitle || twDesc || twImage) {
    add("pass", "X overrides are present", "twitter:title", `${[twTitle && "title", twDesc && "description", twImage && "image"].filter(Boolean).join(", ")} set specifically for X.`);
  } else if (ogTitle) {
    add("pass", "X falls back to the og: tags", "twitter:title", "No twitter:* overrides, which is fine — X reads og:title, og:description and og:image when they are missing.");
  }

  // --- search-side basics ----------------------------------------------
  if (!title) {
    add("error", "<title> is missing", "title", "Google writes its own headline when there is none, and it is rarely the one you want.");
  } else if (title.length > 60) {
    add("warn", "<title> is long for search", "title", `${title.length} characters. Google truncates around 60 in the blue link.`);
  } else {
    add("pass", "<title> is set", "title", `${quote(title)} — ${title.length} characters.`);
  }

  if (!metaDesc) {
    add("warn", "meta description is missing", "description", "Google will assemble a snippet out of page text instead, which is usually worse than one you write.");
  } else {
    add("pass", "meta description is set", "description", `${metaDesc.length} characters.`);
  }

  if (canonical) add("pass", "canonical is set", "link[rel=canonical]", canonical);
  if (ogLocale) add("pass", "og:locale is set", "og:locale", `"${ogLocale}".`);
  else if (lang) add("pass", "html lang is set", "html[lang]", `"${lang}" — platforms use it to pick a locale when og:locale is absent.`);

  // Only the tags a social card actually reads. Repeated verification and
  // analytics tags are normal and not this tool's business.
  const REPEATABLE = new Set(["og:image", "og:image:url", "og:locale:alternate", "article:tag", "article:author", "og:video"]);
  const duplicates = [...new Set(tags.map((t) => t.key))].filter(
    (key) => /^(og:|twitter:)/.test(key) || key === "description" ? !REPEATABLE.has(key) && allValues(tags, key).length > 1 : false,
  );
  if (duplicates.length) {
    add("warn", "Duplicate meta tags", duplicates[0], `${duplicates.slice(0, 4).join(", ")} appear more than once. Crawlers pick one — usually the first — and which one is not guaranteed.`);
  }

  const order = { error: 0, warn: 1, pass: 2 };
  return out.sort((a, b) => order[a.level] - order[b.level]);
}

// ---------------------------------------------------------------------------
// The preview model: what each platform will actually show.

// Only colours a stylesheet can be trusted with. The value lands in an inline
// style on the client, so anything else has to be dropped rather than escaped.
function safeCssColor(value) {
  const v = String(value || "").trim();
  return /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%/]+\)|hsla?\([\d\s.,%/deg]+\)|[a-z]{3,20})$/i.test(v) ? v : "";
}

function previewModel(data) {
  const { tags, title, finalUrl, image } = data;
  const ogTitle = firstValue(tags, "og:title");
  const ogDesc = firstValue(tags, "og:description");
  const metaDesc = firstValue(tags, "description");
  const twCard = firstValue(tags, "twitter:card");
  const twImage = firstValue(tags, "twitter:image") || firstValue(tags, "twitter:image:src");

  let host = "";
  try {
    host = new URL(finalUrl).hostname.replace(/^www\./, "");
  } catch {
    host = "";
  }

  const resolved = (value) => {
    if (!value) return "";
    try {
      return new URL(value, finalUrl).href;
    } catch {
      return "";
    }
  };

  return {
    host,
    url: finalUrl,
    title: ogTitle || title || "",
    description: ogDesc || metaDesc || "",
    siteName: firstValue(tags, "og:site_name"),
    image: image && image.ok ? image.url : resolved(firstValue(tags, "og:image")),
    imageOk: Boolean(image && image.ok && image.format !== "svg"),
    imageWidth: image ? image.width : 0,
    imageHeight: image ? image.height : 0,
    // Discord tints an embed's left rule with the page's theme-color. Read it
    // so the Discord preview shows the real colour rather than always the
    // default blurple, which is what the note under it had been claiming.
    themeColor: safeCssColor(firstValue(tags, "theme-color")),
    twitter: {
      card: twCard || "summary",
      large: twCard === "summary_large_image",
      title: firstValue(tags, "twitter:title") || ogTitle || title || "",
      description: firstValue(tags, "twitter:description") || ogDesc || metaDesc || "",
      image: resolved(twImage) || (image && image.ok ? image.url : ""),
    },
  };
}

// The tags, re-emitted as the HTML you would paste into a <head>. Grouped the
// way a developer reads them rather than the order they happened to appear in.
const GROUPS = [
  ["", ["description", "keywords", "robots", "author"]],
  ["Open Graph", ["og:site_name", "og:type", "og:title", "og:description", "og:image", "og:image:url", "og:image:secure_url", "og:image:alt", "og:image:width", "og:image:height", "og:url", "og:locale"]],
  ["X (Twitter)", ["twitter:card", "twitter:site", "twitter:creator", "twitter:title", "twitter:description", "twitter:image", "twitter:image:src", "twitter:image:alt"]],
];

// A content value can legitimately contain a double quote; emitting it raw
// would make the snippet people copy invalid the moment they paste it.
const metaLine = (tag) =>
  `<meta ${tag.attr}="${tag.key}" content="${tag.value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">`;

function htmlSource(data) {
  const lines = [];
  if (data.title) lines.push(`<title>${data.title}</title>`);
  const seen = new Set();
  for (const [label, keys] of GROUPS) {
    const block = [];
    for (const key of keys) {
      for (const tag of data.tags.filter((t) => t.key === key)) {
        seen.add(tag);
        block.push(metaLine(tag));
      }
    }
    if (block.length) lines.push("", ...(label ? [`<!-- ${label} -->`] : []), ...block);
  }
  const rest = data.tags.filter((t) => !seen.has(t) && /^(og:|twitter:|article:|profile:|fb:)/.test(t.key));
  if (rest.length) {
    lines.push("", "<!-- Other -->", ...rest.map(metaLine));
  }
  return lines.join("\n").trim();
}

// ---------------------------------------------------------------------------

async function inspect(rawUrl) {
  const target = publicUrl(rawUrl);
  if (!target) {
    const error = new Error("Enter a complete public URL, starting with https://");
    error.status = 400;
    throw error;
  }

  let response;
  let finalUrl;
  try {
    const result = await safeFetch(
      target,
      { headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml", "Accept-Language": "en" } },
      PAGE_TIMEOUT,
    );
    response = result.response;
    finalUrl = result.url;
  } catch (error) {
    const message =
      error.code === "dns"
        ? "That domain does not resolve. Check the spelling."
        : error.code === "blocked"
          ? "That URL points to a private address we will not fetch."
          : error.code === "redirects"
            ? "That URL redirects too many times."
            : error.name === "TimeoutError"
              ? "The site took too long to respond."
              : "We could not reach that URL. It may be blocking automated requests.";
    const wrapped = new Error(message);
    wrapped.status = 502;
    throw wrapped;
  }

  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  const buf = await readCapped(response, HTML_LIMIT);

  // A 404 or 410 still has HTML, and it is worth showing what a crawler would
  // make of it, so the status becomes a check rather than a dead end.
  if (contentType && !/text\/html|application\/xhtml/.test(contentType)) {
    const error = new Error(`That URL serves ${contentType.split(";")[0]}, not an HTML page. Point the checker at a page, not a file.`);
    error.status = 415;
    throw error;
  }

  const parsed = parseHtml(buf.toString("utf8"));
  const baseUrl = parsed.base ? new URL(parsed.base, finalUrl).href : finalUrl;

  const ogImage = firstValue(parsed.tags, "og:image") || firstValue(parsed.tags, "og:image:url");
  const image = ogImage ? await probeImage(ogImage, baseUrl) : null;

  const data = { ...parsed, url: target, finalUrl, status: response.status, redirected: finalUrl !== target, image };

  return {
    url: target,
    finalUrl,
    redirected: finalUrl !== target,
    status: response.status,
    checks: buildChecks(data),
    preview: previewModel(data),
    tags: parsed.tags,
    title: parsed.title,
    canonical: parsed.canonical,
    image,
    html: htmlSource(data),
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { inspect, publicUrl, imageSize, parseHtml };
