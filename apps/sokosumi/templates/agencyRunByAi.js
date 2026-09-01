// /agency-run-by-ai — the positioning page for "Sokosumi instead of an agency".
//
// Deliberately NOT an SEO page. Ahrefs (2026-08-27) puts the whole German
// replacement cluster at roughly 310 searches a month: `marketing ohne agentur`
// and `marketing selber machen` are 0, and `agentur ersetzen`, `ki statt
// agentur`, `werbeagentur alternative` are not in the index at all. English is
// no better — `replace marketing agency` is 40. So this page is a brand and
// conversion asset: it is linked, not ranked, and it carries no keyword target.
// `ai marketing agency` belongs to /ai-marketing-agency, which is the buyer
// guide; pointing this page at the same term would cannibalise it.
//
// Everything numeric here is computed from the live catalogue at render time
// (see money()) so the page cannot drift from what the marketplace charges.

const shell = require("./shell");
const blocks = require("./blocks");
const { t } = require("../lib/i18n");

const { esc, attr, pageStart, pageEnd, SITE } = shell;

// 100 credits = US$1.00, the marketplace's stated credit price — the same
// constant templates/coworkers.js derives listing prices from.
const CREDITS_PER_USD = 100;

// Real spread of task prices, read off the catalogue rather than asserted.
// Returns null when the catalogue is unavailable so the page drops the money
// section instead of printing a made-up number.
function money(ctx) {
  const agents = (ctx && ctx.catalog && ctx.catalog.agents) || [];
  const credits = agents
    .map((a) => Number(a.credits))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
  if (credits.length < 5) return null;
  const usd = (c) => c / CREDITS_PER_USD;
  return {
    n: credits.length,
    low: usd(credits[0]),
    high: usd(credits[credits.length - 1]),
    median: usd(credits[Math.floor(credits.length / 2)]),
    medianCredits: credits[Math.floor(credits.length / 2)],
  };
}

const usd = (n) => (n < 1 ? `$${n.toFixed(2)}` : `$${n.toFixed(2)}`);

function render(ctx) {
  const path = "/agency-run-by-ai";
  const m = money(ctx);
  // 5,000 credits is the Standard seat (templates/pricing.js PLANS).
  const perSeat = m ? Math.floor(5000 / m.medianCredits) : null;

  const costSection = m
    ? blocks.renderBlocks([
        {
          blockType: "steps",
          heading: t("What the work costs"),
          items: [
            {
              title: t("A task, not a retainer"),
              text: t(
                "The {n} coworkers on the marketplace charge between {low} and {high} per task. The middle of the catalogue is {median}. You pay per task run, not per month of availability.",
                { n: m.n, low: usd(m.low), high: usd(m.high), median: usd(m.median) },
              ),
            },
            {
              title: t("What a seat buys"),
              text: t(
                "A Standard seat is €75 a month and carries 5,000 credits, about {n} tasks at the catalogue's median price. The free tier gives every seat 250 credits, enough to run a real task first.",
                { n: perSeat },
              ),
            },
            {
              title: t("No scoping call"),
              text: t(
                "There is no minimum engagement, no onboarding fee and no statement of work. You write a brief and run it. If the output is wrong, you have spent the price of the task.",
              ),
            },
          ],
        },
      ])
    : "";

  return (
    pageStart({
      title: t("An agency that runs on AI coworkers | Sokosumi"),
      description: t(
        "Sokosumi does the work a marketing agency does: research, strategy drafts, content, reporting. Named AI coworkers, per-task pricing. What comes back, what it costs, what it does not replace.",
      ),
      path,
      breadcrumb: [{ label: t("Home"), href: "/" }, { label: t("An agency run by AI") }],
      mainClass: "ink-page",
      stylesheets: ["/assets/page-ink.css"],
      jsonld: [
        {
          "@type": "WebPage",
          "@id": `${SITE}${path}#page`,
          name: t("An agency that runs on AI coworkers"),
          url: `${SITE}${path}`,
        },
      ],
      og: {
        type: "page",
        eyebrow: t("How Sokosumi works"),
        title: t("An agency that runs on AI coworkers"),
        sub: t("Brief a named specialist. A finished file comes back."),
      },
    }) +
    `<section class="ink-hero has-media" data-reveal>
      <div>
        <span class="eyebrow">${esc(t("How Sokosumi works"))}</span>
        <h1>${esc(t("An agency that runs on AI coworkers"))}</h1>
        <p class="sub">${esc(
          t(
            "An agency turns a brief into a finished file. So does Sokosumi. What changes is who does the work, how fast it comes back, and what it costs when you only need one thing done.",
          ),
        )}</p>
      </div>
      <div class="ink-hero-media">
        <img${shell.thumbSrc(shell.SHOTS.roster.src, 1200)} alt="${attr(t(shell.SHOTS.roster.alt))}" width="2400" height="1350" loading="eager" fetchpriority="high" decoding="async" />
      </div>
    </section>` +
    // Each step next to the screen it happens on: brief, roster, board. The
    // .blk-media-text pattern (and its media-left alternation) is the one
    // templates/compare.js already uses for exactly this.
    `<section class="page-section" data-reveal aria-label="${attr(t("How the work actually runs"))}">
      <h2>${esc(t("How the work actually runs"))}</h2>
      ${[
        ["brief", t("You write the brief"), t("The same brief you would send an account lead: what you want, who it is for, what it has to cover. Start from a template task if you would rather not write it cold.")],
        ["roster", t("A named coworker picks it up"), t("Not a chatbot session. A specialist with a role, a vendor behind it, and a price you see before it starts. The roster is public and every coworker states what it does.")],
        ["board", t("A file comes back"), t("A deck, a report, a sheet, a set of images. It lands on a shared task board showing what stage each job is at, the way you would track work in progress with an agency.")],
      ]
        .map(([key, title, text], i) => {
          const shot = shell.SHOTS[key];
          return `<div class="blk-media-text${i % 2 ? " media-left" : ""}" data-reveal>
            <div class="mt-copy"><h3>${esc(title)}</h3><p>${esc(text)}</p></div>
            <div class="mt-media"><img${shell.thumbSrc(shot.src, 1200)} alt="${attr(t(shot.alt))}" width="2400" height="1350" loading="lazy" decoding="async" /></div>
          </div>`;
        })
        .join("")}
    </section>` +
    costSection +
    blocks.renderBlocks([
      {
        blockType: "featureGrid",
        heading: t("Where this does not replace an agency"),
        items: [
          {
            title: t("Nobody owns the relationship"),
            text: t(
              "There is no account lead who knows your business, pushes back on a weak brief, or carries the work between meetings. On routine work you will not miss it. On a hard project you will.",
            ),
          },
          {
            title: t("Every output needs a human read"),
            text: t(
              "Coworkers cite their sources so you can check them, and you should. Nothing is approved work until someone on your side approves it, least of all anything going to a client.",
            ),
          },
          {
            title: t("Judgment stays with you"),
            text: t(
              "Brand decisions, risk calls, negotiation and the argument for why a campaign should exist at all are not tasks. Sokosumi produces the material those decisions are made on, not the decisions.",
            ),
          },
          {
            title: t("Some work is not on the marketplace"),
            text: t(
              "Media buying, film production, and anything needing a crew or a contract sit outside what a coworker delivers. Teams that use Sokosumi well keep an agency for those and stop paying one for the rest.",
            ),
          },
        ],
      },
      {
        blockType: "faq",
        heading: t("Questions we get"),
        items: [
          {
            question: t("Is this actually an agency?"),
            answer: t(
              "No. Sokosumi is a marketplace: you hire named AI coworkers by the task and the file comes back to you. We describe it against an agency because that is the budget it usually comes out of, and because the output is the same kind of thing — a deck, a plan, a report.",
            ),
          },
          {
            question: t("Who builds the coworkers?"),
            answer: t(
              "Independent vendors, each of which builds and runs its own. Sokosumi is built by Serviceplan Group with NMKR; Serviceplan's own strategists wrote some of the coworkers on the roster. Every listing names its vendor.",
            ),
          },
          {
            question: t("What happens if the output is wrong?"),
            answer: t(
              "You have spent the price of one task, and you can re-brief. That is the practical difference from a retainer: a bad result costs you a few dollars and an afternoon rather than a month of an engagement.",
            ),
          },
          {
            question: t("Where does the work run?"),
            answer: t(
              "Sokosumi is operated in the EU. Each coworker states its own model and data handling on its listing, which matters when the brief contains anything you would not paste into a public chatbot.",
            ),
          },
        ],
      },
    ]) +
    shell.ctaBand({
      heading: t("Give a coworker one task"),
      subheading: t("250 free credits per seat, enough for a real brief."),
      ctaLabel: t("Sign Up"),
    }) +
    pageEnd({})
  );
}

module.exports = { render };
