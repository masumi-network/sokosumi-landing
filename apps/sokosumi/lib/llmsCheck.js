// llms.txt inspection for /tools/llms-txt.
//
// Fetches a site's /llms.txt, parses it against the format at llmstxt.org, and
// reports what an agent reading it would actually find. The format is short
// enough to quote in full:
//
//   * an optional BOM
//   * an H1 with the name of the project — "the only required section"
//   * a blockquote with a short summary
//   * zero or more markdown sections of any type EXCEPT headings
//   * zero or more H2-delimited sections containing file lists, each a markdown
//     list of `- [name](url): optional notes`
//   * a section named "Optional" marks links an agent may skip
//
// The bit nobody else checks is whether the links in the file resolve. An
// llms.txt is a promise that these URLs are the good ones; a 404 in there sends
// an agent away with nothing, and the site owner never finds out because
// nothing in their stack ever fetches it.

const { publicUrl, safeFetch, readCapped, fetchErrorMessage } = require("./safeFetch");

const UA =
  "Mozilla/5.0 (compatible; SokosumiLLMsTxt/1.0; +https://www.sokosumi.com/tools/llms-txt)";
const FILE_LIMIT = 512 * 1024;
const FETCH_TIMEOUT = 12000;
const LINK_TIMEOUT = 8000;
// Enough to catch a rotten file without hammering someone's origin.
const LINKS_PROBED = 12;
const LINK_CONCURRENCY = 4;

// llms.txt is meant to fit in a context window alongside everything else.
const SIZE_COMFORTABLE = 20 * 1024;
const SIZE_LARGE = 100 * 1024;

// ---------------------------------------------------------------------------
// Parsing

const LINK_RE = /^\s*[-*+]\s+\[([^\]]*)\]\(\s*(\S+?)\s*\)\s*(?::\s*(.*))?$/;

// Everything the format allows, in the order it allows it.
function parse(text) {
  const body = text.replace(/^﻿/, "");
  const lines = body.split(/\r?\n/);

  let title = null;
  let summary = null;
  const details = [];
  const sections = [];

  let current = null; // the open H2 section
  let seenH1 = false;
  let inFence = false;
  const problems = [];

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.trimEnd();

    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const h1 = /^#\s+(.*)$/.exec(line);
    if (h1) {
      if (seenH1) problems.push({ kind: "extra-h1", line: i + 1, text: h1[1].trim() });
      else {
        title = h1[1].trim();
        seenH1 = true;
      }
      continue;
    }

    const h2 = /^##\s+(.*)$/.exec(line);
    if (h2) {
      current = { name: h2[1].trim(), links: [], strays: [] };
      sections.push(current);
      continue;
    }

    // H3+ inside a file-list section is outside the format.
    const deep = /^(#{3,})\s+(.*)$/.exec(line);
    if (deep) {
      problems.push({ kind: "deep-heading", line: i + 1, level: deep[1].length, text: deep[2].trim() });
      continue;
    }

    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      if (!current) summary = [summary, quote[1].trim()].filter(Boolean).join(" ");
      continue;
    }

    if (!line.trim()) continue;

    const link = LINK_RE.exec(line);
    if (link) {
      const entry = { name: link[1].trim(), url: link[2].trim(), note: (link[3] || "").trim(), line: i + 1 };
      if (current) current.links.push(entry);
      else problems.push({ kind: "link-outside-section", line: i + 1, text: entry.name || entry.url });
      continue;
    }

    // A bullet in a file-list section that carries no link is a broken row.
    if (/^\s*[-*+]\s+/.test(line) && current) {
      current.strays.push({ line: i + 1, text: line.replace(/^\s*[-*+]\s+/, "").slice(0, 80) });
      continue;
    }

    if (!current) details.push(line.trim());
  }

  return { title, summary, details, sections, problems };
}

// ---------------------------------------------------------------------------
// Link probing

async function probeLink(href, base) {
  let absolute;
  try {
    absolute = new URL(href, base).href;
  } catch {
    return { url: href, ok: false, reason: "invalid" };
  }
  if (!publicUrl(absolute)) return { url: absolute, ok: false, reason: "unsupported-scheme" };
  try {
    // HEAD first: most origins answer it and it costs them nothing. A few
    // reject HEAD outright, so a 405 or 501 is retried as a ranged GET rather
    // than reported as a broken link.
    let { response, url } = await safeFetch(absolute, { method: "HEAD", headers: { "User-Agent": UA } }, LINK_TIMEOUT);
    if (response.status === 405 || response.status === 501 || response.status === 403) {
      try {
        await response.body?.cancel();
      } catch {
        /* nothing buffered */
      }
      ({ response, url } = await safeFetch(
        absolute,
        { method: "GET", headers: { "User-Agent": UA, Range: "bytes=0-2047" } },
        LINK_TIMEOUT,
      ));
      try {
        await response.body?.cancel();
      } catch {
        /* nothing buffered */
      }
    }
    return { url, ok: response.ok || response.status === 206, status: response.status };
  } catch (error) {
    return { url: absolute, ok: false, reason: error.code === "dns" ? "dns" : "unreachable" };
  }
}

async function probeLinks(links, base) {
  const out = [];
  for (let i = 0; i < links.length; i += LINK_CONCURRENCY) {
    const batch = links.slice(i, i + LINK_CONCURRENCY);
    const done = await Promise.all(batch.map((l) => probeLink(l.url, base).then((r) => ({ ...l, probe: r }))));
    out.push(...done);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Checks

const kb = (n) => (n >= 1024 * 1024 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

function buildChecks(data) {
  const { parsed, bytes, contentType, probed, full, status } = data;
  const out = [];
  const add = (level, title, tag, detail) => out.push({ level, title, tag, detail });

  const linkCount = parsed.sections.reduce((n, s) => n + s.links.length, 0);

  // --- the file itself ---------------------------------------------------
  if (status >= 400) {
    add("error", `/llms.txt returns HTTP ${status}`, "llms.txt", "There is nothing at this address for an agent to read.");
    return out;
  }
  if (contentType && /text\/html/.test(contentType)) {
    add(
      "error",
      "/llms.txt is served as HTML",
      "content-type",
      `The server answered ${contentType.split(";")[0]}, which usually means a catch-all route returned your app shell instead of the file. Agents will read markup, not your links.`,
    );
  } else if (contentType && !/text\/(plain|markdown)/.test(contentType)) {
    add("warn", `/llms.txt is served as ${contentType.split(";")[0]}`, "content-type", "text/plain or text/markdown is what readers expect.");
  } else if (contentType) {
    add("pass", "Served with a sensible content type", "content-type", contentType.split(";")[0]);
  }

  // --- structure ---------------------------------------------------------
  if (!parsed.title) {
    add("error", "No H1", "# heading", "The H1 naming the project is the one required part of the format. Without it a reader has no idea whose file this is.");
  } else {
    add("pass", "H1 names the project", "# heading", `"${parsed.title}"`);
  }

  if (parsed.problems.some((p) => p.kind === "extra-h1")) {
    const n = parsed.problems.filter((p) => p.kind === "extra-h1").length;
    add("warn", "More than one H1", "# heading", `${plural(n + 1, "H1", "H1s")} in the file. The format has exactly one, at the top; the rest should be H2 section headers.`);
  }

  if (!parsed.summary) {
    add(
      "warn",
      "No summary blockquote",
      "> summary",
      "The format puts a blockquote under the H1 carrying the key information needed to understand the rest. It is the first thing a reader uses to decide whether to keep going.",
    );
  } else {
    add("pass", "Summary blockquote present", "> summary", `${parsed.summary.length} characters.`);
  }

  if (!parsed.sections.length) {
    add("error", "No H2 sections", "## sections", "The link lists live under H2 headings. With none, this file points an agent at nothing.");
  } else {
    add("pass", plural(parsed.sections.length, "section", "sections"), "## sections", parsed.sections.map((s) => s.name).slice(0, 6).join(" · "));
  }

  if (!linkCount) {
    if (parsed.sections.length) add("error", "No links in any section", "links", "Every section is empty. The whole point of the file is the list of URLs behind it.");
  } else {
    add("pass", plural(linkCount, "link", "links"), "links", `Across ${plural(parsed.sections.length, "section", "sections")}.`);
  }

  const optional = parsed.sections.find((s) => /^optional$/i.test(s.name));
  if (optional) {
    add("pass", "Has an Optional section", "## Optional", `${plural(optional.links.length, "link", "links")} marked skippable when a shorter context is needed.`);
  } else if (linkCount > 12) {
    add(
      "warn",
      "No Optional section",
      "## Optional",
      `${linkCount} links and no "Optional" section. That section is how you tell an agent with a tight context window which of these it can skip.`,
    );
  }

  // --- format slips ------------------------------------------------------
  const deep = parsed.problems.filter((p) => p.kind === "deep-heading");
  if (deep.length) {
    add("warn", "Headings deeper than H2", "### heading", `${plural(deep.length, "heading", "headings")}, first on line ${deep[0].line}. The format is H1 then H2 only; anything deeper is not part of a file list.`);
  }
  const orphans = parsed.problems.filter((p) => p.kind === "link-outside-section");
  if (orphans.length) {
    add("warn", "Links before the first H2", "links", `${plural(orphans.length, "link", "links")} sit above any section heading, first on line ${orphans[0].line}. Readers group links by their H2; these belong to nothing.`);
  }
  const strays = parsed.sections.flatMap((s) => s.strays);
  if (strays.length) {
    add("warn", "List items with no link", "links", `${plural(strays.length, "item", "items")}, first on line ${strays[0].line}: "${strays[0].text}". Every row in a file list needs a [name](url).`);
  }

  // --- size --------------------------------------------------------------
  if (bytes > SIZE_LARGE) {
    add("warn", "The file is large", "size", `${kb(bytes)}. It is meant to fit in a context window next to everything else — the detail belongs behind the links, not in the file.`);
  } else if (bytes) {
    add("pass", "Comfortable size", "size", `${kb(bytes)}${bytes <= SIZE_COMFORTABLE ? "" : ", still workable"}.`);
  }

  // --- the links actually resolving --------------------------------------
  if (probed && probed.length) {
    const broken = probed.filter((l) => !l.probe.ok);
    const relative = probed.filter((l) => !/^https?:\/\//i.test(l.url));
    if (broken.length) {
      const first = broken[0];
      const why = first.probe.status ? `HTTP ${first.probe.status}` : first.probe.reason;
      add(
        "error",
        `${plural(broken.length, "link does", "links do")} not resolve`,
        "links",
        `Of ${probed.length} checked. First: "${first.name || first.url}" on line ${first.line} → ${why}. An agent following that gets nothing, and nothing else in your stack ever fetches these.`,
      );
    } else {
      add("pass", `All ${probed.length} links checked resolve`, "links", linkCount > probed.length ? `Sampled ${probed.length} of ${linkCount}.` : "Every link in the file.");
    }
    if (relative.length) {
      add("warn", `${plural(relative.length, "relative link", "relative links")}`, "links", `Agents fetch llms.txt on its own and may not resolve a relative path against your origin. Use full https:// URLs.`);
    }
  }

  // --- the companion file ------------------------------------------------
  if (full && full.ok) {
    add("pass", "/llms-full.txt is there too", "llms-full.txt", `${kb(full.bytes)} of expanded content for readers that want everything in one fetch.`);
  } else {
    add(
      "warn",
      "No /llms-full.txt",
      "llms-full.txt",
      "Optional, but it is the companion that carries the full text inline for a reader that would rather not follow every link.",
    );
  }

  const order = { error: 0, warn: 1, pass: 2 };
  return out.sort((a, b) => order[a.level] - order[b.level]);
}

// ---------------------------------------------------------------------------

// Accepts a bare domain, a page URL or the llms.txt URL itself. The bare
// domain is the common case — the field on the page says "example.com" — so
// the scheme is assumed here rather than only in the browser, which keeps a
// pasted API URL and a shared result link working too.
function llmsUrlFor(raw) {
  const text = String(raw || "").trim();
  const safe = publicUrl(/^https?:\/\//i.test(text) ? text : `https://${text.replace(/^\/+/, "")}`);
  if (!safe) return null;
  const u = new URL(safe);
  if (/\/llms(-full)?\.txt$/i.test(u.pathname)) return u.href;
  return new URL("/llms.txt", u.origin).href;
}

async function fetchText(url, timeout) {
  const { response, url: finalUrl } = await safeFetch(
    url,
    { headers: { "User-Agent": UA, Accept: "text/plain, text/markdown, */*" } },
    timeout,
  );
  const buf = await readCapped(response, FILE_LIMIT);
  return {
    ok: response.ok,
    status: response.status,
    url: finalUrl,
    contentType: (response.headers.get("content-type") || "").toLowerCase(),
    text: buf.toString("utf8"),
    bytes: buf.length,
  };
}

async function inspect(rawUrl) {
  const target = llmsUrlFor(rawUrl);
  if (!target) {
    const error = new Error("Enter a site, like example.com — we will look for its /llms.txt");
    error.status = 400;
    throw error;
  }

  let res;
  try {
    res = await fetchText(target, FETCH_TIMEOUT);
  } catch (error) {
    const wrapped = new Error(fetchErrorMessage(error));
    wrapped.status = 502;
    throw wrapped;
  }

  const origin = new URL(res.url).origin;

  // A 404 is a real, common answer and deserves its own report rather than an
  // error page: most sites simply do not have one yet.
  if (res.status === 404) {
    return {
      url: target,
      finalUrl: res.url,
      origin,
      found: false,
      status: 404,
      checks: [
        {
          level: "error",
          title: "No llms.txt at this domain",
          tag: "llms.txt",
          detail: `${origin}/llms.txt returned 404. Nothing here yet — the starter below is a working file you can put at that address.`,
        },
      ],
      parsed: { title: null, summary: null, details: [], sections: [], problems: [] },
      links: [],
      bytes: 0,
      fetchedAt: new Date().toISOString(),
    };
  }

  const parsed = parse(res.text);
  const allLinks = parsed.sections.flatMap((s) => s.links);
  const probed = await probeLinks(allLinks.slice(0, LINKS_PROBED), res.url);

  // Presence only; the content of llms-full.txt is not this tool's business.
  let full = null;
  try {
    const f = await fetchText(new URL("/llms-full.txt", origin).href, LINK_TIMEOUT);
    full = { ok: f.ok, bytes: f.bytes, status: f.status };
  } catch {
    full = { ok: false };
  }

  return {
    url: target,
    finalUrl: res.url,
    origin,
    found: res.status < 400,
    status: res.status,
    bytes: res.bytes,
    contentType: res.contentType,
    checks: buildChecks({ parsed, bytes: res.bytes, contentType: res.contentType, probed, full, status: res.status }),
    parsed: {
      title: parsed.title,
      summary: parsed.summary,
      details: parsed.details.slice(0, 12),
      sections: parsed.sections.map((s) => ({ name: s.name, count: s.links.length })),
      problems: parsed.problems,
    },
    links: probed.map((l) => ({ name: l.name, url: l.url, note: l.note, line: l.line, ok: l.probe.ok, status: l.probe.status || null, reason: l.probe.reason || null })),
    linkTotal: allLinks.length,
    text: res.text.length > 20000 ? res.text.slice(0, 20000) + "\n…" : res.text,
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { inspect, parse, llmsUrlFor };
