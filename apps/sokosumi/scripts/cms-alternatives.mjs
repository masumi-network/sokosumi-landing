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

// Relevance AI appears on two pages. Pricing from its docs
// (relevanceai.com/docs/get-started/pricing); the marketing pricing page now
// shows Enterprise only. Regions from relevanceai.com/docs/sdk/authentication.
const RELEVANCE = {
  who: "Ops and go-to-market teams that want to build their own agents",
  price: "Pro $19/mo annual or $29 monthly; Team $234 annual or $349 monthly; Enterprise custom",
  free: "Free plan closed to new signups",
  hosting: "Each project runs in a US, EU or Australian region",
  metered: "Actions: 2,500 (Pro) or 7,000 (Team) a month, plus vendor credits",
  pick: "You want to build and run your own agents and need your data in an EU region. Relevance AI runs each project in a US, EU or Australian region. The free plan is closed to new signups, so start on Pro.",
};

const PAGES = [
  {
    slug: "alternatives/copy-ai",
    tool: "Copy.ai",
    title: "Copy.ai alternatives: 5 options compared on price",
    description:
      "Copy.ai alternatives compared: Jasper, Writer, HubSpot Breeze and Sokosumi side by side on price, free plans, EU hosting and what each tool meters.",
    heroSub:
      "Most people who leave Copy.ai aren't unhappy with the output. They leave over the jump from $29 to $1,000 and the credit maths. Here's the field, with prices as we checked them.",
    intro: [
      "Copy.ai sells chat across OpenAI, Anthropic and Gemini models, plus workflows. It suits sales and marketing ops teams that build repeatable processes. Two things send people looking.",
      "**The price step.** Chat costs $29 a month ($24 billed annually) and covers 5 seats. The next tier, Growth, is $1,000 a month for 75 seats, with nothing in between. A ten-person team that wants workflows ends up paying for a plan sized for 75. The pricing page shows no free plan.",
      `**The credit maths.** Workflows are metered at 20,000, 45,000 or 75,000 credits a month depending on the tier. On ${CHECKED}, Copy.ai's Trustpilot score was 1.8 out of 5 from 196 reviews. Support runs through a help center, a contact form and email, and no live chat is listed.`,
      "If neither of those bothers you, staying put is a fair choice. Switching has a cost, and Copy.ai does its job well.",
    ],
    columns: ["Sokosumi", "Copy.ai", "Jasper", "Writer", "HubSpot Breeze"],
    rows: [
      ["Who it is for", [SOKO.who,
        "Sales and marketing ops teams building repeatable workflows",
        "Marketing teams that write daily and want on-brand output",
        "Enterprises rolling out governed AI across departments",
        "SMB and mid-market teams already on HubSpot"]],
      ["Price", [SOKO.price,
        "Chat $29/mo for 5 seats ($24 annual); Growth $1,000, Expansion $2,000, Scale $3,000 per month",
        "Pro $69 per seat monthly, $59 annual; Business custom",
        "Starter per seat, up to 5 users, price not shown on the plans page; Enterprise custom",
        "Per outcome: $0.50 per resolved conversation, $1 per recommended lead; Data Agent $0.10 per answer"]],
      ["Free plan or trial", [SOKO.free,
        "No free plan shown on the pricing page",
        "7-day free trial on Pro",
        "14-day free trial, no card",
        "28-day trial of Customer and Prospecting Agents on Pro and Enterprise"]],
      ["EU hosting", [SOKO.hosting,
        "Not published; SOC 2 Type II report available",
        "No. Customer data hosted in US data centers",
        "Not published; dedicated private cloud deployment offered",
        "CRM data in Frankfurt on the EU data center; AI sub-processors may process data outside it"]],
      ["What is metered", [SOKO.metered,
        "Workflow credits: 20K, 45K, 75K per month by tier",
        "Chat and Canvas unmetered; Agents and GEO Hub use credits on Business",
        "Starter has fixed credit limits; amounts not published",
        "HubSpot credits: 50 per resolved conversation, 100 per recommended lead"]],
    ],
    pick: [
      ["Stay on Copy.ai", "You're on Chat at $29, five seats cover you, and you aren't hitting workflow credit limits. Nothing below is worth a migration for that."],
      ["Jasper", "Writing volume is the job and brand consistency matters more than hosting. Customer data sits in US data centers, which rules Jasper out for some EU teams before anything else."],
      ["Writer", "You need governance, a private cloud option and a vendor your procurement team can review. Expect an enterprise contract rather than a card payment."],
      ["HubSpot Breeze", "Your CRM is already HubSpot and you want agents switched on rather than built. You pay per resolved conversation or recommended lead instead of per seat, so the bill is easy to read."],
      ["Sokosumi", "You want a finished deliverable rather than a writing tool: a competitor memo, an audience deck, a launch content set. Each seat comes with monthly credits, and every task shows its credit price before it runs."],
    ],
    faq: [
      ["Does Copy.ai have a free plan?", `Copy.ai's pricing page showed no free plan on ${CHECKED}. The cheapest tier is Chat at $29 a month ($24 billed annually) for 5 seats. Pricing pages change, so check before you plan around it.`],
      ["Why is the jump from $29 to $1,000 such a problem?", "Workflows, the reason most teams pick Copy.ai, start on Growth. There's no mid-priced tier, so a team of ten that needs workflows pays for a plan sized for 75 seats. That gap is what sends most teams looking."],
      ["Does Copy.ai host in the EU?", "Copy.ai doesn't publish a hosting region. Its security page offers a SOC 2 Type II report. If EU hosting is a procurement requirement, get it in writing rather than reading it off a trust page."],
      ["Is Sokosumi a replacement for Copy.ai?", "Only if what you want is a finished file. Copy.ai is a tool you write in. Sokosumi is a marketplace where you brief a named coworker and get a deck, report or content set back. If you want to sit and write with AI help, Copy.ai or Jasper is the closer fit."],
    ],
  },
  {
    slug: "alternatives/manus",
    tool: "Manus",
    title: "Manus alternatives: 5 autonomous agents compared",
    description:
      "Manus alternatives compared: Genspark, Relevance AI, Lindy and Sokosumi side by side on price, credit burn, free plans and where your data is hosted.",
    heroSub:
      "Manus runs long autonomous tasks well. People start looking when credit burn gets hard to predict, or when the ownership news makes them wonder where their data goes.",
    intro: [
      "Manus is an autonomous agent with a browser, a code sandbox and file output. It's aimed at solo operators and small teams who want one agent to run a task end to end. Every plan, including the free one, gets 300 daily refresh credits.",
      "**Credit burn is hard to predict.** Manus's own credits page gives example tasks at 200, 360 and 900 credits, and the 900-credit one is an 80-minute complex task. Credits come back only when a verified platform bug caused the failure, not when a third-party site breaks or the brief was unclear. On the $20 plan's 4,000 monthly credits, a few failed long runs can use up most of the month.",
      "**The ownership change cost some users their data.** Meta agreed to buy Manus for about $2bn, and by April 2026 Chinese regulators had blocked it, as SCMP and The Next Web reported. Manus separated from Meta and on 23–24 August 2026 deleted data that certain users had created on or after 29 December 2025. It announced on 1 September 2026 that it had resumed independent operations. Its trust center puts data in the US and Singapore, and no EU hosting is published.",
      "If you run personal research and the free tier's 300 daily credits are enough, none of this needs to move you.",
    ],
    columns: ["Sokosumi", "Manus", "Genspark", "Relevance AI", "Lindy"],
    rows: [
      ["Who it is for", [SOKO.who,
        "Solo operators and small teams wanting one agent to run long tasks end to end",
        "People who want finished slides, docs and sheets fast",
        RELEVANCE.who,
        "Individuals wanting a ready assistant in Slack, email and calendar"]],
      ["Price", [SOKO.price,
        "Free $0; Pro $20/mo (4,000 credits), $40 (8,000) or $200 (40,000); annual billing saves 17%",
        "Plus from 10,000 credits a month, Pro from 125,000; Team $30 per seat (12,000 credits)",
        RELEVANCE.price,
        "Plus $29.99, Pro $99.99, Max $199.99 per user monthly; Enterprise custom"]],
      ["Free plan or trial", [SOKO.free,
        "Free plan: 300 daily credits, capped at 1,500 a month, Lite model only",
        "Free plan: 100 daily credits until a lifetime allowance runs out",
        RELEVANCE.free,
        "No free plan; 7-day trial only for teammates joining via Slack"]],
      ["EU hosting", [SOKO.hosting,
        "Not published. Data in the US and Singapore; SOC 2 Type 2, ISO 27001 and ISO 27701",
        "Enterprise only: US, EU or APAC data residency; other plans not published",
        RELEVANCE.hosting,
        "Not published. SOC 2 Type II and GDPR listed; HIPAA on Enterprise"]],
      ["Metering and failed tasks", [SOKO.metered,
        "Credits per task; refunded only when a verified platform bug caused a failure",
        "Credits; every failed retry costs credits, and Team credits don't roll over",
        RELEVANCE.metered,
        "Credits per user: 3,000 / 15,000 / 35,000 a month; failed-task policy not published"]],
    ],
    pick: [
      ["Stay on Manus", "The free tier's 300 daily credits cover your usage, and long autonomous runs are exactly the job. The separation from Meta is done, so ownership alone isn't a reason to move."],
      ["Genspark", "You mainly want finished slides and docs fast. Every retry of a failed task costs credits and Team credits don't roll over, so work out the credit maths before you commit."],
      ["Relevance AI", RELEVANCE.pick],
      ["Lindy", "You want the assistant to live in Slack, email and calendar rather than in its own workspace. There's no free plan, so budget for a paid seat from day one."],
      ["Sokosumi", "You want a specific marketing deliverable rather than a general-purpose agent, and you want to see what a job costs before it runs. Each seat comes with monthly credits, and every task shows its credit price up front."],
    ],
    faq: [
      ["What happened to Manus in 2026?", `Meta agreed to buy Manus for about $2bn. By April 2026 Chinese regulators had blocked it, as SCMP and The Next Web reported. Manus then separated from Meta and on 23–24 August 2026 deleted data that certain users had created on or after 29 December 2025. On 1 September 2026 it announced it had resumed independent operations. Checked ${CHECKED}.`],
      ["Why do people say Manus credits run out quickly?", "Credit use grows with the task and is hard to forecast. Manus's own examples run from 200 credits for a standard task to 900 for an 80-minute complex one. Credits come back only when a verified platform bug caused a failure. The $20 plan includes 4,000 credits a month on top of 300 daily refresh credits."],
      ["Does Manus host data in the EU?", "Manus doesn't publish EU hosting. Its trust center lists data locations in the US and Singapore, with EU standard contractual clauses for transfers, and it holds SOC 2 Type 2, ISO 27001 and ISO 27701. Of the tools on this page, Relevance AI deploys projects to an EU region, and Genspark offers EU data residency on Enterprise."],
      ["Is Sokosumi an autonomous agent like Manus?", "No. Manus is one general agent you point at a task. Sokosumi is a marketplace of named specialists, each with a stated job and a credit price you see before it runs. If you want open-ended autonomy, Manus is the closer fit. If you want a predictable deliverable, Sokosumi is."],
    ],
  },
  {
    slug: "alternatives/sintra",
    tool: "Sintra",
    title: "Sintra AI alternatives: 5 options compared on price",
    description:
      "Compare Sintra AI with Lindy, Motion, Relevance AI and Sokosumi on real price, the 250-credit monthly cap, free plans and where each one hosts your data.",
    heroSub:
      "Sintra's helpers are likeable and the promotional price is low. People start looking when they hit the 250-credit monthly cap, or when they notice the price depends on which sale they caught.",
    intro: [
      "Sintra sells twelve role-named AI helpers for support, copywriting, SEO, social, email, sales and more, plus a shared Brain you feed with your business data. It's built for solo founders and very small businesses. Three things push people to compare.",
      "**The credit cap.** Every plan includes 250 credits a month, whichever term you pay for, and the helpers stop when the credits run out. Top-ups cost extra, and unused credits don't roll over.",
      `**The price depends on the promotion.** On ${CHECKED}, the pricing page showed $97 struck through to $48.50 on the monthly plan. The 3-month plan was $23.60 a month and the 12-month plan $15.60 a month. Check what renewal will cost before you budget.`,
      "**No free plan, and no EU hosting.** Sintra offers a 14-day money-back guarantee instead of a trial, and its terms attach conditions to refunds. The legal entity is playOS, Inc. in Delaware, and the privacy policy says data may be processed in the US. No EU data residency is published.",
      "If you're a solo founder who stays inside the credit cap and locked in a good price, staying is reasonable. Here's the field for everyone else.",
    ],
    columns: ["Sokosumi", "Sintra", "Lindy", "Motion", "Relevance AI"],
    rows: [
      ["Who it is for", [SOKO.who,
        "Solo founders and very small businesses that want role-named helpers to chat with",
        "Individuals and small teams that want an assistant acting in inbox, calendar and CRM",
        "Small teams that want tasks, calendar, docs and AI agents in one app",
        RELEVANCE.who]],
      ["Price", [SOKO.price,
        "All 12 helpers: $48.50 monthly (listed as $97), $23.60/mo on a 3-month term, $15.60/mo on a 12-month term; single helpers no longer sold",
        "Plus $29.99, Pro $99.99, Max $199.99 per user monthly; Enterprise custom",
        "Pro AI $19 per seat monthly billed annually ($29 monthly); Business AI $29 annual ($49 monthly)",
        RELEVANCE.price]],
      ["Free plan or trial", [SOKO.free,
        "No free plan; 14-day money-back guarantee, with conditions in the terms",
        "No free plan; 7-day trial only for teammates joining via Slack",
        "Free trial with a $1 card hold; no free plan",
        RELEVANCE.free]],
      ["EU hosting", [SOKO.hosting,
        "No. Entity playOS, Inc. (Delaware); data may be processed in the US",
        "Not published. SOC 2 Type II and GDPR listed; HIPAA on Enterprise",
        "No. Data stored in Google's us-central1 region (Iowa); EU-only storage can't be requested",
        RELEVANCE.hosting]],
      ["What is metered", [SOKO.metered,
        "250 credits a month on every plan; helpers stop at zero; no rollover",
        "Credits per user: 3,000 / 15,000 / 35,000 a month",
        "AI credits per seat: 7,500 Pro AI, 15,000 Business AI; extra credits $0.25 or $0.19 per 100",
        RELEVANCE.metered]],
    ],
    pick: [
      ["Stay on Sintra", "You're one person, 250 credits cover your month, and you locked in a long-term promotional price. The helpers handle short marketing tasks well."],
      ["Lindy", "You want the assistant working inside your inbox, calendar and CRM rather than in its own window. There's no free plan, so budget for a paid seat from day one."],
      ["Motion", "You want project management and AI in one app for a small team. Data is stored only in the US, which rules Motion out for some EU teams before anything else."],
      ["Relevance AI", RELEVANCE.pick],
      ["Sokosumi", "You want a finished deliverable from a named specialist, such as a competitor report, an audience deck or a content set. Each seat comes with monthly credits, and every task shows its credit price before it runs."],
    ],
    faq: [
      ["How much does Sintra AI cost?", `On ${CHECKED}, the all-helpers plan cost $48.50 a month on the monthly plan (listed as $97), $23.60 a month on a 3-month term and $15.60 a month on a 12-month term. Single-helper plans are no longer sold. Every plan includes the same 250 monthly credits. Promotional prices change, so check the current price before you budget.`],
      ["Does Sintra have a free plan?", "No. Sintra offers a 14-day money-back guarantee instead of a trial, and its terms attach conditions to refunds. Lindy and Motion have no free plan either, and Relevance AI has closed its free plan to new signups. Sokosumi's free plan includes 250 credits per seat each month."],
      ["Why do Sintra's credits run out?", "Every plan includes 250 credits a month, whatever you pay. Helpers stop when the credits are gone, and unused credits don't roll over. Heavier users buy top-ups or move to a tool whose allowance fits their volume."],
      ["Is Sintra GDPR-compliant with EU hosting?", "Sintra's legal entity is playOS, Inc. in Delaware, with a Lithuanian affiliate. Its privacy policy says data may be processed in the US under standard contractual clauses, and it doesn't publish an EU residency option. If EU hosting is a requirement, Relevance AI can run your projects in its EU region."],
      ["How does Sokosumi compare to Sintra directly?", "Sintra sells a bundle of helpers on a subscription. Sokosumi is a marketplace where you brief a named specialist for each task. Seats include monthly credits, and you see a task's credit price before it runs. The full side-by-side is at sokosumi.com/compare/sokosumi-vs-sintra."],
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
    { blockType: "richText", content: lexical(`We checked every price and hosting claim on this page against each vendor's own pricing, help and trust pages on ${CHECKED}. Review scores and news are dated and credited to their source. Vendors change pricing without notice, so check before you buy.`) },
    { blockType: "faq", heading: `${p.tool} alternatives: common questions`, items: p.faq.map(([question, answer]) => ({ question, answer })) },
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
