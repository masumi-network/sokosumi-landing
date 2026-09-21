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

import { lexical } from "./lib/lexical.mjs";

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
