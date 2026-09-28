// Upserts the research-led topic guides (EN + DE) from content/topic-guides/*.mjs
// into the CMS `guides` collection. Separate from cms-tool-guides.mjs because
// these carry no tool key and must never touch content/tool-guides.json.
//   node scripts/cms-topic-guides.mjs            # drafts
//   PUBLISH=1 node scripts/cms-topic-guides.mjs  # publish
//   PUBLISH=1 node scripts/cms-topic-guides.mjs <slug>   # one guide
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { lexical } from "./lib/lexical.mjs";

const BASE = "https://payload-production-6f43.up.railway.app/api";
const root = path.join(path.dirname(new URL(import.meta.url).pathname), "..");

function apiKey() {
  if (process.env.SOKOSUMI_CMS_API_KEY) return process.env.SOKOSUMI_CMS_API_KEY;
  const m = fs.readFileSync(path.join(os.homedir(), ".claude", ".env"), "utf8").match(/SOKOSUMI_CMS_API_KEY=(\S+)/);
  if (!m) throw new Error("no SOKOSUMI_CMS_API_KEY");
  return m[1];
}
const H = { "Content-Type": "application/json", Authorization: `users API-Key ${apiKey()}` };

async function api(method, url, body) {
  const res = await fetch(`${BASE}${url}`, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${url} ${res.status}: ${JSON.stringify(j).slice(0, 500)}`);
  return j;
}

function articleWithFaq(guide, locale) {
  const content = guide[locale];
  if (!content.faq?.length) return content.body;
  const faq = content.faq.map(([question, answer]) => `### ${question}\n\n${answer}`).join("\n\n");
  return `${content.body}\n\n## ${content.faqHeading}\n\n${faq}`;
}

const dir = path.join(root, "content", "topic-guides");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mjs")).sort();
const only = process.argv[2];
const status = process.env.PUBLISH ? "published" : "draft";

for (const f of files) {
  const g = (await import(path.join(dir, f))).default;
  if (only && g.slug !== only) continue;
  const existing = await api(
    "GET",
    `/guides?where[slug][equals]=${encodeURIComponent(g.slug)}&where[site][equals]=sokosumi&limit=1&depth=0&draft=true`,
  );
  const body = {
    title: g.en.title,
    slug: g.slug,
    description: g.en.description,
    site: "sokosumi",
    category: g.category || "advanced",
    order: g.order || 200,
    content: lexical(articleWithFaq(g, "en")),
    sections: [],
    _status: status,
  };
  const doc = existing.docs[0]
    ? (await api("PATCH", `/guides/${existing.docs[0].id}?locale=en`, body)).doc
    : (await api("POST", `/guides?locale=en`, body)).doc;
  if (g.de) {
    await api("PATCH", `/guides/${doc.id}?locale=de`, {
      title: g.de.title,
      description: g.de.description,
      content: lexical(articleWithFaq(g, "de")),
      sections: [],
      _status: status,
    });
  }
  console.log(`${status} ${g.slug} #${doc.id}${g.de ? " +de" : ""}`);
}
console.log(`${files.length} topic guides`);
