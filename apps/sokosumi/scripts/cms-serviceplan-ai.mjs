// Creates/updates the "Serviceplan Group and AI" CMS pages (EN + DE) from
// content/serviceplan-ai/pages.mjs.  Usage:
//   node scripts/cms-serviceplan-ai.mjs            # upsert as draft
//   PUBLISH=1 node scripts/cms-serviceplan-ai.mjs  # publish
// Auth: SOKOSUMI_CMS_API_KEY in env or ~/.claude/.env.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pages } from "../content/serviceplan-ai/pages.mjs";

const BASE = "https://payload-production-6f43.up.railway.app/api";
function apiKey() {
  if (process.env.SOKOSUMI_CMS_API_KEY) return process.env.SOKOSUMI_CMS_API_KEY;
  const env = fs.readFileSync(path.join(os.homedir(), ".claude", ".env"), "utf8");
  const m = env.match(/SOKOSUMI_CMS_API_KEY=(\S+)/);
  if (!m) throw new Error("no SOKOSUMI_CMS_API_KEY");
  return m[1];
}
const H = { "Content-Type": "application/json", Authorization: `users API-Key ${apiKey()}` };
async function api(method, url, body) {
  const res = await fetch(`${BASE}${url}`, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${url} ${res.status}: ${JSON.stringify(j).slice(0, 400)}`);
  return j;
}

// ---- markdown-ish → Lexical ------------------------------------------
const txt = (text, format = 0) => ({ type: "text", text, format, style: "", mode: "normal", detail: 0, version: 1 });
function inline(s) {
  // **bold**, [label](url)
  const out = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(txt(s.slice(last, m.index)));
    if (m[1]) out.push(txt(m[1], 1));
    else out.push({ type: "link", version: 3, fields: { url: m[3], newTab: /^https?:/.test(m[3]), linkType: "custom" }, children: [txt(m[2])] });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(txt(s.slice(last)));
  return out;
}
const P = (s) => ({ type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr", textFormat: 0, children: inline(s) });
const Hh = (tag, s) => ({ type: "heading", tag, format: "", indent: 0, version: 1, direction: "ltr", children: inline(s) });
const LI = (s, i) => ({ type: "listitem", value: i + 1, format: "", indent: 0, version: 1, direction: "ltr", children: inline(s) });
const UL = (items) => ({ type: "list", listType: "bullet", tag: "ul", start: 1, format: "", indent: 0, version: 1, direction: "ltr", children: items.map(LI) });
export function lexical(md) {
  const children = [];
  const lines = md.trim().split(/\n/);
  let list = null;
  const flush = () => { if (list) { children.push(UL(list)); list = null; } };
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) { flush(); continue; }
    if (l.startsWith("- ")) { (list = list || []).push(l.slice(2)); continue; }
    flush();
    if (l.startsWith("### ")) children.push(Hh("h3", l.slice(4)));
    else if (l.startsWith("## ")) children.push(Hh("h2", l.slice(3)));
    else children.push(P(l));
  }
  flush();
  return { root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children } };
}

// Localised text lives in the same block ids: PATCH ?locale=de with the EN ids.
function withIds(en, de) {
  return de.map((b, i) => ({ ...b, id: en[i]?.id, items: b.items && en[i]?.items ? b.items.map((it, j) => ({ ...it, id: en[i].items[j]?.id })) : b.items }));
}
const toBlocks = (layout) => layout.map((b) => (b.blockType === "richText" && typeof b.content === "string" ? { ...b, content: lexical(b.content) } : b));

const status = process.env.PUBLISH ? "published" : "draft";
const ids = {};
for (const p of pages) {
  const existing = await api("GET", `/pages?where[slug][equals]=${encodeURIComponent(p.slug)}&where[site][equals]=sokosumi&limit=1&depth=0&draft=true`);
  const body = { title: p.en.title, slug: p.slug, description: p.en.description, site: "sokosumi", layout: toBlocks(p.en.layout), _status: status };
  if (p.parent) body.parent = ids[p.parent];
  let doc = existing.docs[0]
    ? (await api("PATCH", `/pages/${existing.docs[0].id}?locale=en`, body)).doc
    : (await api("POST", `/pages?locale=en`, body)).doc;
  ids[p.slug] = doc.id;
  if (p.de) {
    const deBody = { title: p.de.title, description: p.de.description, layout: withIds(doc.layout, toBlocks(p.de.layout)), _status: status };
    await api("PATCH", `/pages/${doc.id}?locale=de`, deBody);
  }
  console.log(`${status} ${p.slug} #${doc.id}${p.de ? " +de" : ""}`);
}
