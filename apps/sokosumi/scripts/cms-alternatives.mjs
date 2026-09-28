// Upserts the "<tool> alternatives" pages into the CMS `pages` collection.
//   node scripts/cms-alternatives.mjs            # drafts
//   PUBLISH=1 node scripts/cms-alternatives.mjs  # publish
//
// CAREFUL: a draft run PATCHes _status=draft onto EXISTING pages too, which
// unpublishes them (observed 2026-09-12: copy-ai 404'd until the publish
// run). On a live site, run with PUBLISH=1 unless you mean to take the
// pages down.
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
// Vendor facts were first lifted from content/compare-pairs/*.json (checked
// 2026-08-26) and re-verified on 2026-09-27 against each vendor's own pricing,
// help and trust pages; anything without a first-party source was dropped.
// Third-party facts (Trustpilot, news) are dated and credited in the copy.
// Nothing here is estimated. German
// demand for these terms is 0–60/month, so /alternatives/* is English-only
// (see DE_ENGLISH_PATHS in lib/i18n.js) rather than shipping English prose on
// a German URL.
//
// 2026-09-12: added `alternatives/sintra` as a PILOT — one page, measured
// before any more are added. Ahrefs that day: sintra ai review 450/mo,
// sintra ai pricing 200, sintra ai alternatives 70, all near-zero KD. The
// review/pricing intent is folded into this page's FAQ with dated numbers;
// the detailed two-product comparison stays at /compare/sokosumi-vs-sintra
// (one intent per URL — do not also chase "review" from the compare page).
// lindy/jasper stay rejected on the SERP grounds above until the pilot
// shows indexation and query separation.

import fs from "node:fs";
import os from "node:os";
import { lexical } from "./lib/lexical.mjs";

const BASE = "https://payload-production-6f43.up.railway.app/api";
const SIGNUP = "https://app.sokosumi.com";
const CHECKED = "27 September 2026";

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

// Sokosumi's own column, so the table compares like with like. House rules
// (2026-09-27): pricing is per seat per month with a monthly credit allowance
// that tasks spend. Never convert credits to money, never "pay per task
// instead of per seat", never a catalogue-wide credit range or catalogue
// counts. Hosting depends on the coworker; don't claim EU hosting.
const SOKO = {
  who: "Marketing teams that want a finished file back, not a chat window",
  price: "Per seat per month: Free €0 (250 credits), Starter €25 (1,500), Standard €75 (5,000), Pro €200 (15,000); Enterprise custom",
  free: "Free plan: 250 credits per seat each month, no card",
  hosting: "Depends on the coworker; each profile shows models and hosting where the vendor states them",
  metered: "Tasks spend credits from each seat's monthly allowance; every task shows its credit price before it runs",
};

// Relevance AI appears on two pages. Prices from its pricing docs; the
// marketing pricing page shows Enterprise only, so the cell says where the
// numbers come from. Regions from its SDK authentication docs.
const RELEVANCE = {
  who: "Ops and go-to-market teams that want to build their own agents",
  price: "Pro $19/mo billed annually or $29 monthly; Team $234 annual or $349 monthly; Enterprise custom (Relevance AI docs; the pricing page lists Enterprise only)",
  free: "Free plan closed to new signups",
  hosting: "Each project runs in a US, EU or Australian region",
  metered: "Actions: 2,500 (Pro) or 7,000 (Team) a month, plus vendor credits",
  pick: "You want to build and run your own agents and need your data in an EU region. Relevance AI runs each project in a US, EU or Australian region. The free plan is closed to new signups, so start on Pro.",
};
const RELEVANCE_SOURCES = [
  ["Relevance AI pricing docs", "https://relevanceai.com/docs/get-started/pricing"],
  ["Relevance AI regions (SDK authentication docs)", "https://relevanceai.com/docs/sdk/authentication"],
];

const LINDY = {
  who: "Individuals and small teams that want an assistant in Slack, email and calendar",
  price: "Plus $29.99, Pro $99.99, Max $199.99 per user monthly; Enterprise custom",
  free: "No free plan; 7-day trial only for teammates joining via Slack",
  hosting: "Not published. SOC 2 and GDPR listed; HIPAA on Enterprise",
  metered: "Credits per user: 3,000 / 15,000 / 35,000 a month",
};
const LINDY_SOURCES = [
  ["Lindy pricing", "https://www.lindy.ai/pricing"],
  ["Lindy security", "https://www.lindy.ai/security"],
];
const SOKO_SOURCE = ["Sokosumi pricing", "https://www.sokosumi.com/pricing"];

const PAGES = [
  {
    slug: "alternatives/copy-ai",
    tool: "Copy.ai",
    title: "Copy.ai alternatives: 4 compared on price",
    description:
      "Copy.ai alternatives compared: Jasper, Writer, HubSpot Breeze and Sokosumi side by side on price, free plans, EU hosting and what each tool meters.",
    heroSub:
      "Copy.ai's self-serve tiers jump from $29 to $1,000 a month, and workflows are metered in credits.",
    intro: [
      "Copy.ai sells chat across OpenAI, Anthropic and Gemini models, plus workflows, and markets itself to go-to-market teams. Two things are worth checking.",
      "**The price step.** Chat costs $29 a month ($24 billed annually) and covers 5 seats. The next tier, Growth, is $1,000 a month billed annually ($12,000 a year) for 75 seats, with nothing in between. Workflows start on Growth, so a ten-person team that wants them pays for a plan sized for 75. The pricing page shows no free plan.",
      `**The credit maths.** Workflows are metered at 20,000, 45,000 or 75,000 credits a month depending on the tier, and Copy.ai says a run costs more the more steps and content it has. On ${CHECKED}, Copy.ai's Trustpilot score was 1.8 out of 5 from 196 reviews.`,
      "If neither of those bothers you, staying put is a fair choice.",
    ],
    columns: ["Sokosumi", "Copy.ai", "Jasper", "Writer", "HubSpot Breeze"],
    rows: [
      ["Who it is for", [SOKO.who,
        "Go-to-market teams building repeatable sales and marketing workflows",
        "Marketing teams that write daily and want on-brand output",
        "Large organizations rolling out governed AI across departments",
        "Teams already on HubSpot Professional or Enterprise"]],
      ["Price", [SOKO.price,
        "Chat $29/mo for 5 seats ($24 billed annually); Growth $1,000, Expansion $2,000, Scale $3,000 per month, billed annually",
        "Pro $69 per seat monthly, $59 billed yearly; Business custom",
        "Starter per seat, up to 5 users, price not shown on the plans page; Enterprise custom",
        "$0.50 per resolved conversation, $1 per recommended lead, plus a HubSpot Professional or Enterprise subscription"]],
      ["Free plan or trial", [SOKO.free,
        "No free plan shown on the pricing page",
        "7-day free trial on Pro",
        "14-day free trial, no card",
        "28-day free trial of Customer and Prospecting Agents for Professional and Enterprise customers"]],
      ["EU hosting", [SOKO.hosting,
        "Not published; SOC 2 report available on request",
        "No. Hosted in the US-East1 and US-East4 regions",
        "Not published on the plans page; GDPR, HIPAA and SOC 2 Type II listed",
        "EU data center in Germany; sub-processors may process data outside it"]],
      ["What is metered", [SOKO.metered,
        "Workflow credits: 20K, 45K, 75K per month by tier",
        "No usage credits shown on the pricing page; Pro includes 2 Brand Voices, 5 Knowledge assets and 3 Audiences",
        "Starter has fixed credit limits; amounts not published",
        "HubSpot Credits: 50 per resolved conversation, 100 per recommended lead"]],
    ],
    pick: [
      ["Stay on Copy.ai", "You're on Chat at $29, five seats cover you, and you don't need workflows. Nothing below is worth a migration for that."],
      ["Jasper", "Writing volume is the job and brand consistency matters more than hosting. Jasper is hosted in US regions, which rules it out for some EU teams before anything else."],
      ["Writer", "You need governance, admin controls and a vendor your procurement team can review. Starter covers up to 5 users; past that, expect an enterprise contract rather than a card payment."],
      ["HubSpot Breeze", "Your CRM is already HubSpot and you want agents switched on rather than built. On top of your HubSpot subscription, you pay per resolved conversation or recommended lead."],
      ["Sokosumi", "You want a finished deliverable rather than a writing tool: a competitor memo, an audience deck, a launch content set. Each seat comes with monthly credits, and every task shows its credit price before it runs."],
    ],
    faq: [
      ["Does Copy.ai have a free plan?", `Copy.ai's pricing page showed no free plan on ${CHECKED}. The cheapest tier is Chat at $29 a month ($24 billed annually) for 5 seats. Pricing pages change, so check before you plan around it.`],
      ["What does the jump from $29 to $1,000 mean for a small team?", "Workflows start on Growth, and there's no tier between Chat and Growth. Growth is $1,000 a month billed annually for 75 seats, so a team of ten that needs workflows pays for a plan sized for 75."],
      ["Does Copy.ai host in the EU?", "Copy.ai doesn't publish a hosting region. Its security page offers a SOC 2 report on request. If EU hosting is a procurement requirement, get it in writing rather than reading it off a trust page."],
      ["Is Sokosumi a replacement for Copy.ai?", "Only if what you want is a finished file. Copy.ai is a tool you write in. Sokosumi is a marketplace where you brief a named coworker and get a deck, report or content set back. If you want to sit and write with AI help, Copy.ai or Jasper is the closer fit."],
    ],
    sources: [
      ["Copy.ai pricing", "https://www.copy.ai/prices"],
      ["Copy.ai security", "https://www.copy.ai/security"],
      ["Copy.ai on Trustpilot", "https://www.trustpilot.com/review/copy.ai"],
      ["Jasper pricing", "https://www.jasper.ai/pricing"],
      ["Jasper security", "https://www.jasper.ai/security"],
      ["Writer plans", "https://writer.com/plans/"],
      ["HubSpot: Customer Agent and Prospecting Agent pricing", "https://www.hubspot.com/company-news/hubspots-customer-agent-and-prospecting-agent-now-you-pay-when-the-task-is-complete"],
      ["HubSpot data hosting FAQ", "https://knowledge.hubspot.com/account-security/hubspot-cloud-infrastructure-and-data-hosting-frequently-asked-questions"],
      SOKO_SOURCE,
    ],
  },
  {
    slug: "alternatives/manus",
    tool: "Manus",
    title: "Manus AI alternatives: 4 compared on price",
    description:
      "Manus alternatives compared: Genspark, Relevance AI, Lindy and Sokosumi side by side on price, credit burn, free plans and where your data is hosted.",
    heroSub:
      "Manus runs long autonomous tasks in a browser and code sandbox. Two things are worth checking before you commit: how predictable credit use is, and where your data is held.",
    intro: [
      "Manus is an autonomous agent with a browser, a code sandbox and file output. Every account gets 300 daily refresh credits, and paid plans add monthly credits on top.",
      "**Credit use is hard to predict.** Manus's own credits page gives example tasks at 200, 360 and 900 credits, and the 900-credit one is an 80-minute complex task. Credits come back only when a verified bug or platform malfunction caused the failure, not when a third-party site breaks or the brief was unclear. The $20 plan's 4,000 monthly credits cover four tasks the size of that 80-minute example.",
      "**The ownership change cost some users their data.** Meta agreed to buy Manus for about $2bn, and in April 2026 Chinese regulators ordered the deal unwound, as CNBC reported. In August 2026 Manus announced it would operate independently again. Its help center says data that certain users generated between 29 December 2025 and 23 August 2026 was deleted on 23 and 24 August 2026. Its trust center lists its cloud subprocessors in the United States, and no EU hosting is published.",
      "If the free plan's 300 daily credits cover your personal research, none of this needs to move you.",
    ],
    columns: ["Sokosumi", "Manus", "Genspark", "Relevance AI", "Lindy"],
    rows: [
      ["Who it is for", [SOKO.who,
        "Individuals and small teams wanting one agent to run long tasks end to end",
        "People who want slides, docs and sheets made by an agent",
        RELEVANCE.who,
        LINDY.who]],
      ["Price", [SOKO.price,
        "Free $0; Pro $20/mo (4,000 credits), $40 (8,000) or $200 (40,000); annual billing saves 17%",
        "Plus from 10,000 credits a month, Pro from 125,000; Team $30 per seat (12,000 credits)",
        RELEVANCE.price,
        LINDY.price]],
      ["Free plan or trial", [SOKO.free,
        "Free plan: 300 daily credits, up to 1,500 a month, Manus 1.6 Lite only in Agent Mode",
        "Free plan: 100 daily credits until a lifetime allowance runs out",
        RELEVANCE.free,
        LINDY.free]],
      ["EU hosting", [SOKO.hosting,
        "Not published. Cloud subprocessors listed in the US; SOC 2 Type 2, ISO 27001 and ISO 27701",
        "Team: US by default. EU or APAC residency on Enterprise",
        RELEVANCE.hosting,
        LINDY.hosting]],
      ["Metering and failed tasks", [SOKO.metered,
        "Credits per task; refunded only when a verified bug or platform malfunction caused a failure",
        "Credits; every failed retry costs credits, and plan credits don't roll over",
        RELEVANCE.metered,
        `${LINDY.metered}; failed-task policy not published`]],
    ],
    pick: [
      ["Stay on Manus", "The free plan's 300 daily credits cover your usage, and long autonomous runs are the job. Manus says it will operate independently again, so ownership alone isn't a reason to move."],
      ["Genspark", "You mainly want slides, docs and sheets made for you. Every failed retry costs credits and plan credits don't roll over, so work out the credit maths before you commit."],
      ["Relevance AI", RELEVANCE.pick],
      ["Lindy", "You want the assistant to live in Slack, email and calendar rather than in its own workspace. There's no free plan, so budget for a paid seat from day one."],
      ["Sokosumi", "You want a specific marketing deliverable rather than a general-purpose agent, and you want to see what a job costs before it runs. Each seat comes with monthly credits, and every task shows its credit price up front."],
    ],
    faq: [
      ["What happened to Manus in 2026?", `Meta agreed to buy Manus for about $2bn. In April 2026 Chinese regulators ordered the deal unwound, as CNBC reported. In August 2026 Manus announced it would operate independently again, and its help center says data that certain users generated between 29 December 2025 and 23 August 2026 was deleted on 23 and 24 August. Checked ${CHECKED}.`],
      ["How fast do Manus credits run out?", "It depends on the task. Manus's own examples run from 200 credits for a 15-minute standard task to 900 for an 80-minute complex one. Credits come back only when a verified bug or platform malfunction caused a failure. The $20 plan includes 4,000 credits a month on top of 300 daily refresh credits."],
      ["Does Manus host data in the EU?", "Manus doesn't publish EU hosting. Its trust center lists its cloud subprocessors (Google Cloud, Microsoft Azure, AWS and Cloudflare) in the United States, and shows SOC 2 Type 2, ISO 27001 and ISO 27701. Of the tools on this page, Relevance AI runs projects in an EU region, and Genspark offers EU data residency on Enterprise."],
      ["Is Sokosumi an autonomous agent like Manus?", "No. Manus is one general agent you point at a task. Sokosumi is a marketplace of named specialists, each with a stated job and a credit price you see before it runs. If you want open-ended autonomy, Manus is the closer fit. If you want a predictable deliverable, Sokosumi is."],
    ],
    sources: [
      ["Manus pricing", "https://manus.im/pricing"],
      ["Manus: current membership pricing", "https://help.manus.im/en/articles/11711111-what-is-the-current-membership-pricing-for-manus"],
      ["Manus: rules for credit consumption", "https://help.manus.im/en/articles/11711097-what-are-the-rules-for-credits-consumption-and-how-can-i-obtain-them"],
      ["Manus: what are credits (task examples)", "https://manus.im/help/credits"],
      ["Manus: credit refund policy", "https://help.manus.im/en/articles/12992237-how-does-our-ai-agent-s-credit-refund-policy-work"],
      ["Manus: service change overview", "https://help.manus.im/en/articles/16147831-service-change-overview-what-s-happening-and-am-i-affected"],
      ["Manus trust center", "https://trust.manus.im"],
      ["CNBC, 27 April 2026: China blocks Meta's takeover of Manus", "https://www.cnbc.com/2026/04/27/meta-manus-china-blocks-acquisition-ai-startup.html"],
      ["CNBC, 11 August 2026: Manus to return as an independent company", "https://www.cnbc.com/2026/08/11/manus-china-meta-acquisition.html"],
      ["Genspark membership plans", "https://www.genspark.ai/helpcenter/membership-plans"],
      ["Genspark Team and Enterprise plans", "https://www.genspark.ai/helpcenter/team-enterprise-plans"],
      ["Genspark credits guide", "https://www.genspark.ai/helpcenter/credits-guide"],
      ...RELEVANCE_SOURCES,
      ...LINDY_SOURCES,
      SOKO_SOURCE,
    ],
  },
  {
    slug: "alternatives/sintra",
    tool: "Sintra",
    title: "Sintra AI alternatives: 4 compared on price",
    description:
      "Compare Sintra AI with Lindy, Motion, Relevance AI and Sokosumi on price, credit limits, free plans and where each one hosts your data.",
    heroSub:
      "Sintra's promotional price is low. Three things are worth checking before you renew.",
    intro: [
      "Sintra sells twelve role-named AI helpers for support, copywriting, SEO, social, email, sales and more, plus Brain AI, which you feed with your business data. It's marketed to entrepreneurs.",
      "**What the credits cover.** Every plan includes 250 credits a month for advanced AI actions, whichever term you pay for. Top-ups cost extra, and unused credits don't roll over.",
      `**The price depends on the promotion.** On ${CHECKED}, the pricing page showed $97 struck through to $48.50 on the 1-month plan. The 3-month plan was $23.60 a month and the 12-month plan $15.60 a month. Check what renewal will cost before you budget.`,
      "**No free plan, and no published EU hosting.** Sintra offers a 14-day money-back guarantee instead of a trial: a full refund if you ask within 14 days of subscribing. The legal entity is playOS, Inc. in Delaware, and the privacy policy says data may be transferred to and processed in the US. No EU data residency is published.",
      "If 250 credits cover your advanced actions and you locked in a good price, staying is reasonable. Here's the field for everyone else.",
    ],
    columns: ["Sokosumi", "Sintra", "Lindy", "Motion", "Relevance AI"],
    rows: [
      ["Who it is for", [SOKO.who,
        "Entrepreneurs who want role-named helpers to chat with",
        LINDY.who,
        "Professionals and small teams that want tasks, calendar, docs and AI in one app",
        RELEVANCE.who]],
      ["Price", [SOKO.price,
        "All 12 helpers: $48.50 monthly (listed as $97), $23.60/mo on a 3-month term, $15.60/mo on a 12-month term; sold only as the all-helpers bundle",
        LINDY.price,
        "Pro AI $19 per seat monthly billed annually ($29 monthly); Business AI $29 annual ($49 monthly)",
        RELEVANCE.price]],
      ["Free plan or trial", [SOKO.free,
        "No free plan; full refund if requested within 14 days",
        LINDY.free,
        "Free trial; no free plan on the pricing page",
        RELEVANCE.free]],
      ["EU hosting", [SOKO.hosting,
        "No. Entity playOS, Inc. (Delaware); data may be processed in the US",
        LINDY.hosting,
        "No. Data stored in Google Cloud's Central-1 region in Iowa; EU-only storage can't be requested",
        RELEVANCE.hosting]],
      ["What is metered", [SOKO.metered,
        "250 credits a month for advanced AI actions on every plan; top-ups extra; no rollover",
        LINDY.metered,
        "AI credits per seat: 7,500 Pro AI, 15,000 Business AI; extra credits sold as top-ups",
        RELEVANCE.metered]],
    ],
    pick: [
      ["Stay on Sintra", "You're one person, 250 credits cover your advanced actions each month, and you locked in a long-term promotional price."],
      ["Lindy", "You want the assistant working inside your inbox, calendar and CRM rather than in its own window. There's no free plan, so budget for a paid seat from day one."],
      ["Motion", "You want project management and AI in one app for a small team. Data is stored only in the US, which rules Motion out for some EU teams before anything else."],
      ["Relevance AI", RELEVANCE.pick],
      ["Sokosumi", "You want a finished deliverable from a named specialist, such as a competitor report, an audience deck or a content set. Each seat comes with monthly credits, and every task shows its credit price before it runs."],
    ],
    faq: [
      ["How much does Sintra AI cost?", `On ${CHECKED}, the all-helpers plan cost $48.50 a month on the 1-month plan (listed as $97), $23.60 a month on a 3-month term and $15.60 a month on a 12-month term. Sintra sells it only as the all-helpers bundle. Every plan includes the same 250 monthly credits. Promotional prices change, so check the current price before you budget.`],
      ["Does Sintra have a free plan?", "No. Sintra offers a 14-day money-back guarantee instead of a trial: a full refund if you ask within 14 days of subscribing. Lindy and Motion have no free plan either, and Relevance AI has closed its free plan to new signups. Sokosumi's free plan includes 250 credits per seat each month."],
      ["How do Sintra's credits work?", "Every plan includes 250 credits a month, used for advanced AI actions. When they run out you can buy top-ups; unused credits reset monthly."],
      ["Does Sintra host data in the EU?", "Sintra's legal entity is playOS, Inc. in Delaware. Its privacy policy says data may be transferred to and processed in the US, with safeguards such as standard contractual clauses, and it doesn't publish an EU residency option. If EU hosting is a requirement, Relevance AI can run your projects in its EU region."],
      ["How does Sokosumi compare to Sintra directly?", "Sintra sells a bundle of helpers on a subscription. Sokosumi is a marketplace where you brief a named specialist for each task. Seats include monthly credits, and you see a task's credit price before it runs. The full side-by-side is at sokosumi.com/compare/sokosumi-vs-sintra."],
    ],
    sources: [
      ["Sintra pricing", "https://sintra.ai/pricing"],
      ["Sintra terms and conditions (refunds)", "https://sintra.ai/legal/terms-and-conditions"],
      ["Sintra money-back guarantee", "https://sintra.ai/legal/money-back-guarantee"],
      ["Sintra privacy policy", "https://sintra.ai/legal/privacy-policy"],
      ...LINDY_SOURCES,
      ["Motion pricing", "https://www.usemotion.com/pricing"],
      ["Motion security (data location)", "https://www.usemotion.com/security"],
      ...RELEVANCE_SOURCES,
      SOKO_SOURCE,
    ],
  },
];

// "Sources (checked 27 September 2026)" plus one link per line, as in
// cms-compare-llms.mjs.
function sourcesMd(sources) {
  return [
    `## Sources (checked ${CHECKED})`,
    "Prices and hosting claims come from each vendor's own pricing, help and trust pages. Review scores and news are credited to their source. Vendors change pricing without notice, so check before you buy.",
    sources.map(([label, url]) => `- [${label}](${url})`).join("\n"),
  ].join("\n\n");
}

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
    { blockType: "faq", heading: `${p.tool} alternatives: common questions`, items: p.faq.map(([question, answer]) => ({ question, answer })) },
    { blockType: "richText", content: lexical(sourcesMd(p.sources)) },
    { blockType: "ctaBand", heading: "Brief a coworker instead.", subheading: "The free plan includes 250 credits per seat each month. Run a real task and compare the output yourself.", ctaLabel: "Sign Up", ctaHref: SIGNUP },
  ];
}

// Refuse to run in draft mode by default: PATCHing _status=draft onto an
// existing published page UNPUBLISHES it (observed 2026-09-12 — copy-ai
// 404'd until the publish run). Drafting is opt-in, not the default.
if (process.env.PUBLISH !== "1" && process.env.FORCE_DRAFT !== "1") {
  console.error("Refusing: a draft run unpublishes live pages. Set PUBLISH=1 (or FORCE_DRAFT=1 if you really mean to draft).");
  process.exit(1);
}
// Reuse the existing block/row/cell/item ids by position, so an update edits
// the blocks in place instead of replacing them (the DE locale shares them).
function keepIds(next, prev) {
  if (Array.isArray(next) && Array.isArray(prev)) {
    next.forEach((n, i) => keepIds(n, prev[i]));
  } else if (next && prev && typeof next === "object" && typeof prev === "object") {
    if (next.blockType && prev.blockType && next.blockType !== prev.blockType) return;
    if (prev.id && next.id === undefined) next.id = prev.id;
    for (const k of Object.keys(next)) if (k !== "content") keepIds(next[k], prev[k]);
  }
  return next;
}

const status = process.env.PUBLISH === "1" ? "published" : "draft";
for (const p of PAGES) {
  const body = { title: p.title, description: p.description, slug: p.slug, site: "sokosumi", layout: layout(p), _status: status };
  const found = await api(`/pages?where[and][0][slug][equals]=${encodeURIComponent(p.slug)}&where[and][1][site][equals]=sokosumi&depth=0&locale=en&draft=true`);
  if (found.docs.length) {
    keepIds(body.layout, found.docs[0].layout);
    await api(`/pages/${found.docs[0].id}?locale=en`, { method: "PATCH", body: JSON.stringify(body) });
    console.log(`updated  ${p.slug}  #${found.docs[0].id}  [${status}]`);
  } else {
    const doc = await api(`/pages?locale=en`, { method: "POST", body: JSON.stringify(body) });
    console.log(`created  ${p.slug}  #${(doc.doc || doc).id}  [${status}]`);
  }
}
console.log(`${PAGES.length} alternatives pages`);
