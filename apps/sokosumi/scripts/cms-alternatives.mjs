// Upserts the "<tool> alternatives" pages into the CMS `pages` collection.
//   node scripts/cms-alternatives.mjs            # drafts
//   PUBLISH=1 node scripts/cms-alternatives.mjs  # publish
//
// Why these two and no others. Every candidate was checked against Ahrefs for
// volume AND against its live SERP, because KD alone was wrong on every term
// tested this session. Validated 2026-08-27 (country=us):
//
//   copy ai alternatives    150 vol  KD 1   $3.50  TP 400   SERP DR floor 8
//   manus ai alternatives   200 vol  KD 4   $4.00  TP 0     SERP DR floor 13
//
// sokosumi.com is DR 33, so both SERPs have pages ranking at or below our own
// authority. Rejected: `jasper alternatives` (250 vol but SERP DR floor 48
// with G2 at #1), `lindy ai alternatives` (DR floor 54), `motion alternatives`
// (ambiguous term, Reddit at #1), and `canva`/`zapier`/`n8n alternatives` —
// high volume, wrong intent: those searchers want a design tool or an
// automation platform, not a marketplace. `writesonic alternatives` scored
// well (250 vol, DR floor 27) but we hold no sourced research on Writesonic,
// and a page about a vendor we have not checked is the exact filler this site
// avoids.
//
// Every vendor fact below is lifted from content/compare-pairs/*.json, which
// carry a `checked` date (2026-08-26). Nothing here is estimated. German
// demand for these terms is 0–60/month, so /alternatives/* is English-only
// (see DE_ENGLISH_PATHS in lib/i18n.js) rather than shipping English prose on
// a German URL.

import fs from "node:fs";
import os from "node:os";
import { lexical } from "./lib/lexical.mjs";

const BASE = "https://payload-production-6f43.up.railway.app/api";
const SIGNUP = "https://app.sokosumi.com";
const CHECKED = "26 August 2026";

function apiKey() {
  if (process.env.SOKOSUMI_CMS_API_KEY) return process.env.SOKOSUMI_CMS_API_KEY;
  const m = fs.readFileSync(`${os.homedir()}/.claude/.env`, "utf8").match(/SOKOSUMI_CMS_API_KEY=(\S+)/);
  if (!m) throw new Error("no SOKOSUMI_CMS_API_KEY");
  return m[1];
}
const KEY = apiKey();
async function api(path, init = {}) {
  const r = await fetch(BASE + path, {
    ...init,
    headers: { Authorization: `users API-Key ${KEY}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  if (!r.ok) throw new Error(`${init.method || "GET"} ${path} → ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

// Sokosumi's own column, so the table compares like with like.
const SOKO = {
  who: "Marketing teams that want a finished file back, not a chat window",
  price: "Free (250 credits per seat); Starter €25, Standard €75, Pro €200 per seat monthly",
  free: "Free plan, 250 credits per seat",
  eu: "Operated in the EU; each coworker states its own model and data handling",
  metered: "Credits per task run — catalogue tasks cost 30–1,850 credits ($0.30–$18.50)",
};

const PAGES = [
  {
    slug: "alternatives/copy-ai",
    tool: "Copy.ai",
    title: "Copy.ai alternatives: 5 options compared on price",
    description:
      "Copy.ai alternatives compared on what actually decides it: the jump from $29 to $1,000, what each tool meters, and which publish EU hosting. Prices checked 26 August 2026.",
    heroSub:
      "Most people leaving Copy.ai are not leaving over output quality. They are leaving over the price step and the credit maths. Here is the field, with prices as checked.",
    intro: [
      "Copy.ai sells chat across OpenAI, Anthropic and Gemini models plus workflows, and it suits sales and marketing ops teams building repeatable processes. Two things push people to look elsewhere.",
      "**The price step.** Chat is $29 a month for 5 seats. The next tier, Growth, is $1,000. There is nothing in between, so a ten-person team that wants workflows is buying a plan sized for 75 seats. There was also no free plan shown on the pricing page when we checked.",
      "**The credit maths.** Workflows are metered at 20,000, 45,000 or 75,000 credits a month by tier. Reviewers name credits, billing and support as the main friction; Copy.ai's Trustpilot score was 1.9/5 at check and support is email-only, with slow replies reported.",
      "If neither of those is biting, staying put is a reasonable answer. Switching costs are real and the tool is competent at what it does.",
    ],
    columns: ["Sokosumi", "Copy.ai", "Jasper", "Writer", "HubSpot Breeze"],
    rows: [
      ["Who it is for", [SOKO.who,
        "Sales and marketing ops teams building repeatable workflows",
        "Marketing teams that write daily and want on-brand output",
        "Enterprises rolling out governed AI across departments",
        "SMB and mid-market teams already on HubSpot"]],
      ["Price", [SOKO.price,
        "Chat $29/mo for 5 seats; Growth $1,000, Expansion $2,000, Scale $3,000",
        "Pro $69 per seat monthly, $59 annual; Business custom",
        "Starter $39 per user monthly, $29 annual, max 5 seats; Enterprise custom",
        "Per outcome: $0.50 per resolved conversation, $1.00 per lead, $0.10 per answer"]],
      ["Free plan or trial", [SOKO.free,
        "No free plan shown on the pricing page at check",
        "7-day free trial on Pro",
        "14-day Starter trial, no card",
        "28-day trial of Customer and Prospecting Agents on Pro and Enterprise"]],
      ["EU hosting", [SOKO.eu,
        "Not published",
        "No — data hosted in US data centres",
        "Not published; single-tenant deployment on Enterprise",
        "CRM data in Frankfurt if chosen at setup, but Breeze AI features run outside the EU"]],
      ["What is metered", [SOKO.metered,
        "Workflow credits: 20K, 45K, 75K per month by tier",
        "Chat and Canvas unmetered; agents and GEO Hub use credits on Business",
        "Not published per tier",
        "Outcomes: 50 credits per resolved conversation, 100 per recommended lead"]],
    ],
    pick: [
      ["Stay on Copy.ai", "You are on Chat at $29, five seats covers you, and you are not hitting workflow credit limits. Nothing below is worth a migration for that."],
      ["Jasper", "Writing volume is the job and brand consistency matters more than hosting. Note US-only data centres — that decides it for some EU teams before anything else does."],
      ["Writer", "You need governance, single-tenant deployment and a procurement process to point at. Expect an enterprise contract rather than a card."],
      ["HubSpot Breeze", "Your CRM is already HubSpot and you want agents switched on rather than built. Outcome pricing is unusually legible — you pay per resolved conversation, not per seat."],
      ["Sokosumi", "You want a finished deliverable rather than a writing surface: a competitor memo, an audience deck, a launch content set. Priced per task, so one job costs a few dollars rather than a tier."],
    ],
    faq: [
      ["Does Copy.ai have a free plan?", `No free plan was shown on the Copy.ai pricing page when we checked on ${CHECKED}. There is a paid Chat tier at $29 a month covering 5 seats. Verify before you plan around it — pricing pages move.`],
      ["Why is the jump from $29 to $1,000 such a problem?", "Because workflows — the reason most teams want Copy.ai — sit on Growth. There is no mid-priced tier, so a team of ten that needs workflows pays for a plan sized at 75 seats. That single gap drives most of the alternative-shopping."],
      ["Does Copy.ai host in the EU?", "Not published. A SOC 2 report is available. If EU hosting is a procurement requirement, get it in writing rather than inferring it from a trust page."],
      ["Is Sokosumi a replacement for Copy.ai?", "Only if what you want is a finished file. Copy.ai is a surface you write in; Sokosumi is a marketplace where you brief a named coworker and a deck, report or content set comes back. If you want to sit and write with AI assistance, Copy.ai or Jasper is the closer fit."],
    ],
  },
  {
    slug: "alternatives/manus",
    tool: "Manus",
    title: "Manus alternatives: 5 autonomous agents compared",
    description:
      "Manus alternatives compared on credit burn, what happens when a task fails, and where your data lives. Includes the 2026 ownership change. Prices checked 26 August 2026.",
    heroSub:
      "Manus runs long autonomous tasks well. The two things that send people looking are unpredictable credit burn and an unsettled ownership picture.",
    intro: [
      "Manus is an autonomous agent with a browser, a code sandbox and file output, aimed at solo operators and small teams who want one agent to run a task end to end. It gives 300 daily refresh credits on every plan, including free.",
      "**Credit burn is hard to predict.** Reviewers report complex research tasks consuming 500–900 credits, and multi-step tasks failing mid-stream with no refund. On a 4,000-credit Standard plan, a handful of failed long runs is most of your month.",
      "**Ownership is unsettled.** Meta's roughly $2bn purchase was blocked by Chinese regulators in April 2026. Manus is returning to independent operation, and the process involved deleting user data created since 29 December 2025. EU hosting is not published; the company is headquartered in Singapore and reviews note SOC 2 and GDPR certification are not complete.",
      "If you are running personal research and the free tier's 300 daily credits covers you, none of that need move you.",
    ],
    columns: ["Sokosumi", "Manus", "Genspark", "Relevance AI", "Lindy"],
    rows: [
      ["Who it is for", [SOKO.who,
        "Solo operators and small teams wanting one agent to run long tasks end to end",
        "People who want finished slides, docs and sheets fast",
        "Ops and go-to-market teams that want to build their own agents",
        "Individuals wanting a ready assistant in Slack, email and calendar"]],
      ["Price", [SOKO.price,
        "Free $0; Standard $20/mo (4,000 credits); Customizable $40 (8,000); Extended $200 (40,000)",
        "Free (100 daily credits); Plus from 10,000 credits, Pro from 125,000 — dollar prices shown only after signup",
        "Free $0; Pro $19/mo annual or $29 monthly; Team $234 annual or $349 monthly",
        "Plus $29.99, Pro $99.99, Max $199.99 per user monthly; Enterprise custom"]],
      ["Free plan or trial", [SOKO.free,
        "Free plan with 300 daily credits",
        "Free plan with 100 daily credits",
        "Free plan: 200 actions per month, 1 user, 1 project",
        "No free plan; 7-day trial only for teammates joining via Slack"]],
      ["EU hosting", [SOKO.eu,
        "Not published. HQ Singapore; SOC 2 and GDPR certification not complete",
        "Enterprise only: EU, US or APAC residency. Individual and Team plans not published",
        "Region chosen at signup: US, EU/UK (London) or AU",
        "Not published. SOC 2 Type II, GDPR and HIPAA controls listed"]],
      ["What happens when a task fails", ["You are charged for the task run; the roster and price are visible before you start",
        "Failed multi-step tasks reported with no refund",
        "Failed tasks are still charged; credits do not roll over",
        "Metered in actions — 200, 2,500 or 7,000 a month, plus top-ups",
        "Credits per user: 3,000 / 15,000 / 35,000 a month, by task size"]],
    ],
    pick: [
      ["Stay on Manus", "The free tier's 300 daily credits covers your usage, and long autonomous runs are exactly the job. The ownership question is worth watching, not necessarily acting on."],
      ["Genspark", "You mainly want finished slides and docs. Note that dollar prices only appear after signup and failed tasks are still charged — check the credit maths before committing."],
      ["Relevance AI", "You want to build and operate your own agents, and you need to choose your data region up front. It is the only tool here that lets you pick EU/UK hosting at signup on a self-serve plan."],
      ["Lindy", "The assistant should live in Slack, email and calendar rather than in its own workspace. There is no free plan, so budget for a paid seat from day one."],
      ["Sokosumi", "You want a specific marketing deliverable rather than a general-purpose agent — and you want to see the price of a job before it runs. Tasks are priced individually, from $0.30 to $18.50."],
    ],
    faq: [
      ["What happened to Manus in 2026?", `Meta's roughly $2bn purchase was blocked by Chinese regulators in April 2026 and Manus is returning to independent operation. The process involved deleting user data created since 29 December 2025. Checked ${CHECKED}.`],
      ["Why do people say Manus credits run out quickly?", "Because consumption scales with task complexity and is hard to forecast. Reviewers report single complex research runs using 500–900 credits, and multi-step tasks failing partway with no refund. Standard is 4,000 credits a month."],
      ["Does Manus host data in the EU?", "Not published. The company is headquartered in Singapore, and reviews note SOC 2 and GDPR certification are not complete. Of the tools on this page, Relevance AI is the only one offering an EU/UK region on a self-serve plan."],
      ["Is Sokosumi an autonomous agent like Manus?", "No, and the difference matters. Manus is one general agent you point at a task. Sokosumi is a marketplace of named specialists, each with a stated job and a price you see before it runs. If you want open-ended autonomy, Manus is the closer fit; if you want a predictable deliverable, Sokosumi is."],
    ],
  },
];

function layout(p) {
  return [
    { blockType: "hero", eyebrow: "Alternatives", heading: `${p.tool} alternatives`, subheading: p.heroSub, ctaLabel: "Try Sokosumi free", ctaHref: SIGNUP, secondaryCtaLabel: "See the coworkers", secondaryCtaHref: "/ai-coworkers" },
    { blockType: "richText", content: lexical(p.intro.join("\n\n")) },
    {
      blockType: "comparisonTable",
      heading: `${p.tool} and four alternatives, side by side`,
      columns: p.columns.map((label, i) => ({ label, highlight: i === 0 })),
      rows: p.rows.map(([label, cells]) => ({ label, note: null, cells: cells.map((value) => ({ value })) })),
    },
    { blockType: "featureGrid", heading: "Which one to pick", items: p.pick.map(([title, text]) => ({ title, text })) },
    { blockType: "richText", content: lexical(`Every price and hosting claim on this page was checked on ${CHECKED} against each vendor's own pricing and trust pages, except where marked as coming from a third-party tracker. Vendors change pricing without notice — verify before you buy.`) },
    { blockType: "faq", heading: `${p.tool} alternatives: common questions`, items: p.faq.map(([question, answer]) => ({ question, answer })) },
    { blockType: "ctaBand", heading: "Brief a coworker instead.", subheading: "The free plan carries 250 credits per seat — enough to run a real task and compare the output yourself.", ctaLabel: "Sign Up", ctaHref: SIGNUP },
  ];
}

const status = process.env.PUBLISH === "1" ? "published" : "draft";
for (const p of PAGES) {
  const body = { title: p.title, description: p.description, slug: p.slug, site: "sokosumi", layout: layout(p), _status: status };
  const found = await api(`/pages?where[slug][equals]=${encodeURIComponent(p.slug)}&depth=0&locale=en&draft=true`);
  if (found.docs.length) {
    await api(`/pages/${found.docs[0].id}?locale=en`, { method: "PATCH", body: JSON.stringify(body) });
    console.log(`updated  ${p.slug}  #${found.docs[0].id}  [${status}]`);
  } else {
    const doc = await api(`/pages?locale=en`, { method: "POST", body: JSON.stringify(body) });
    console.log(`created  ${p.slug}  #${(doc.doc || doc).id}  [${status}]`);
  }
}
console.log(`${PAGES.length} alternatives pages`);
