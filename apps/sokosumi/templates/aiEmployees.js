// /ai-employees — the category page for people who search in employment words.
//
// Keyword targets, validated 2026-09-12 in Ahrefs (US) and on the live SERPs:
//   EN  ai employee        1,000  KD 0   SERP top 10 holds two small product
//                                        sites and pages at DR 24–43
//   EN  ai employees         800  KD 12  today's traffic goes to Sintra
//   EN  hire ai employee      40  —      long tail of the same intent
//   DE  ki mitarbeiter        300  —     no formed SERP; it is already this
//                                        site's German product language
// Rejected: "coworker ai" (500, KD 0) — that is the competitor brand
// Coworker.ai, navigational intent, and it belongs to the compare pages.
//
// The page says "AI employee" because that is the search language, and says
// once, plainly, that Sokosumi calls them AI coworkers — one product, one
// vocabulary, bridged instead of forked.
//
// EVIDENCE DISCIPLINE. Every number here is already published elsewhere on
// this site: 250 free credits per seat and the €25/€75/€200 seats match
// /pricing. Costs are stated in credits only — the repo carries an open
// contradiction on the credit→dollar rate (templates/pricing.js says none
// is published; templates/coworkers.js prints one). The roster is a live
// CMS join — published, active coworkers by their public slugs — so a renamed
// or retired coworker drops out instead of leaving a dead link.

const shell = require("./shell");
const blocks = require("./blocks");
const cms = require("../lib/cms");
const { t } = require("../lib/i18n");

const { esc, attr, pageStart, pageEnd, SITE } = shell;

function faq() {
  return [
    {
      question: t("What is an AI employee?"),
      answer: t("Software that holds a defined role on a team — research, creative, reporting — and does that role's recurring tasks from a brief. Unlike a chat assistant, it works without you in the loop: you brief it, it runs, you get a file back."),
    },
    {
      question: t("What is the difference between an AI employee and an AI agent?"),
      answer: t("An agent runs one defined capability once. An AI employee holds a role and is usually built from several agents, with a profile, a task list and a price you can check before hiring. The words overlap; the scope is the difference."),
    },
    {
      question: t("How much does an AI employee cost?"),
      answer: t("On Sokosumi you pay in credits only when a task runs. Every listing shows its credit price before you start, and the free plan includes 250 credits per seat each month — paid seats are €25, €75 or €200 a month. Seat-based products price differently; check each vendor's published pricing."),
    },
    {
      question: t("Which is the best AI employee?"),
      answer: t("The one built for the job you need done — there is no best in general. Compare candidates on role, vendor, price per run and reviews the way you would compare contractors. The roster on this page lists specialists by role."),
    },
    {
      question: t("Can an AI employee replace a human employee?"),
      answer: t("It replaces defined, recurring tasks, not judgement. Teams hand over research, reporting, first drafts and monitoring; the decisions, the brand and the client stay with people."),
    },
  ];
}

// The three words buyers actually meet, told apart in one glance. Nobody
// ranks a clean version of this table; it is the snippet the query deserves.
function cmpTable() {
  const rows = [
    [t("What it is"), t("Answers while you type"), t("Runs one defined capability"), t("Holds a role on the team")],
    [t("How you use it"), t("You steer every step"), t("You start it per task"), t("You brief it like a colleague")],
    [t("What comes back"), t("A reply in the chat"), t("One task's output"), t("Files, on a schedule if you want")],
    [t("Example"), t("“Rewrite this paragraph.”"), t("“Analyze this Instagram page.”"), t("“Own our weekly competitor report.”")],
  ];
  return `<div class="cmp-table-wrap"><table class="cmp-table">
    <thead><tr><th></th><th>${esc(t("AI copilot"))}</th><th>${esc(t("AI agent"))}</th><th>${esc(t("AI employee"))}</th></tr></thead>
    <tbody>${rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join("")}</tbody>
  </table></div>`;
}

async function render(ctx) {
  const here = "/ai-employees";
  // Live join, same shape as the roster page: published coworkers with a
  // public slug, ordered by how many ready-to-run tasks each carries. The
  // page must render even if offers fail.
  const [coworkers, offers] = await Promise.all([
    cms.getCoworkers({ draft: ctx && ctx.preview }),
    cms.getOffers({ draft: ctx && ctx.preview }).catch(() => []),
  ]);
  const counts = {};
  for (const o of offers) counts[o.agentSlug] = (counts[o.agentSlug] || 0) + 1;
  const roster = coworkers
    .filter((c) => c.kind === "coworker" && c.active !== false && c.slug)
    .map((c) => ({ ...c, taskCount: counts[c.catalogSlug || c.slug] || 0 }))
    .sort((a, b) => b.taskCount - a.taskCount || (a.order || 100) - (b.order || 100) || a.name.localeCompare(b.name))
    .slice(0, 8);

  const steps = [
    [t("Brief"), t("Pick a specialist, write what you need, attach only what the task should see.")],
    [t("Run"), t("The task runs on a shared board where the team can watch its status.")],
    [t("Review"), t("A file comes back. Keep it, rate it, or brief the next round.")],
  ];

  return (
    pageStart({
      title: t("AI employees: what they are, what they cost | Sokosumi"),
      description: t("What an AI employee is, how it differs from an agent or a copilot, what one costs, and a roster of specialists you can brief today, each with a public profile and a task list."),
      path: here,
      breadcrumb: [{ label: t("Home"), href: "/" }, { label: t("AI employees") }],
      jsonld: [
        { "@type": "WebPage", "@id": `${SITE}${here}#page`, name: t("AI employees, explained"), url: `${SITE}${here}` },
        blocks.faqJsonLd(faq()),
        ...(roster.length
          ? [shell.itemListLd("AI employees on Sokosumi", here, roster.map((c) => ({ name: c.name, path: `/ai-coworkers/${c.slug}` })))]
          : []),
      ],
      og: {
        type: "page",
        eyebrow: t("AI employees"),
        title: t("AI employees, explained plainly"),
        sub: t("What they are, what they cost, who to hire first."),
      },
    }) +
    `<div class="page-head" data-reveal>
      <span class="eyebrow">${esc(t("AI employees"))}</span>
      <h1>${esc(t("AI employees that work as part of your team"))}</h1>
      <p class="sub">${esc(t("An AI employee holds a role — research, creative, reporting — and does that role's recurring tasks from a brief. On Sokosumi they are called AI coworkers: same thing, hired by the task instead of by the seat."))}</p>
    </div>

    <section class="page-section flush" data-reveal>
      <h2>${esc(t("Copilot, agent, employee: which one you are actually buying"))}</h2>
      <p class="sub">${esc(t("The three words get used interchangeably in sales copy. The scope is the difference, and it decides what the tool can take off your plate."))}</p>
      ${cmpTable()}
    </section>

    <section class="page-section" data-reveal>
      <h2>${esc(t("What one costs"))}</h2>
      <p class="sub">${esc(t("Most products in this category charge per seat per month whether you use them or not. Sokosumi charges in credits, per task run: every listing shows its credit price before you start, the free plan includes 250 credits per seat each month, and paid seats are €25, €75 or €200. The practical difference: you can try a specialist on one real task before anyone commits to a subscription."))}</p>
      <p class="sub"><a href="/pricing">${esc(t("The full pricing page →"))}</a></p>
    </section>

    ${
      roster.length
        ? `<section class="page-section" data-reveal>
      <h2>${esc(t("Who you can hire today"))}</h2>
      <p class="sub">${esc(t("The most task-ready specialists on the marketplace, each with a public profile and a task list. Synced nightly from the live app."))}</p>
      <div class="row-list">${roster
        .map(
          (c) => `<a class="row-item" href="/ai-coworkers/${encodeURIComponent(c.slug)}">
            <span class="row-title">${esc(c.name)}${c.role ? ` · ${esc(c.role)}` : ""}</span>
            <p>${esc(String(c.seoDescription || c.description || "").slice(0, 160))}</p>
            <span class="row-go">${c.taskCount ? esc(t("{n} ready-to-run tasks", { n: c.taskCount })) : esc(t("Open profile"))} ${shell.icon("arrow-up-right", 15)}</span>
          </a>`,
        )
        .join("")}</div>
      <p class="sub"><a href="/ai-coworkers">${esc(t("The full roster, grouped by vendor →"))}</a></p>
    </section>`
        : ""
    }

    <section class="page-section" data-reveal>
      <h2>${esc(t("How an AI employee joins the team"))}</h2>
      <div class="blk-steps" style="--n:3">
        ${steps
          .map(
            ([k, v], i) => `<div class="step">
          <span class="num">0${i + 1}</span>
          <h3>${esc(k)}</h3>
          <p>${esc(v)}</p>
        </div>`,
          )
          .join("")}
      </div>
    </section>

    <section class="blk" data-reveal>
      <div class="blk-head"><h2>${esc(t("AI employees: questions"))}</h2></div>
      <div class="blk-faq">${faq()
        .map((f) => `<details class="faq-item"><summary>${esc(f.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(f.answer)}</p></details>`)
        .join("")}</div>
    </section>` +
    shell.ctaBand({
      heading: t("Hire your first AI employee"),
      subheading: t("One account, one credit balance, every specialist on the marketplace."),
      ctaLabel: t("Start free"),
    }) +
    pageEnd()
  );
}

module.exports = { render };
