// /enterprise — the buying path for a marketing department.
//
// Before this page an enterprise buyer met one line on /pricing ("custom
// seats, credits and support") and had to assemble the rest from /european-ai,
// /legal/dpa and the about page. This page puts the procurement answers in one
// place and ends in a sales conversation.
//
// Keyword targets (Ahrefs, 2026-09-27): DE "ki plattform unternehmen" 150;
// EN "ai for marketing teams" 30. Small, but these are the buyers.
//
// EVIDENCE DISCIPLINE, same rules as templates/europeanAi.js: every fact here
// is already published on /european-ai, /about, /pricing or /legal. Nothing
// that is not published (certifications, SSO, retention terms) is claimed; the
// page says so and offers a written answer instead.

const shell = require("./shell");
const blocks = require("./blocks");
const { t } = require("../lib/i18n");

const { esc, pageStart, pageEnd, SITE } = shell;

function faq() {
  return [
    {
      question: t("How is the Enterprise plan priced?"),
      answer: t("Seats and credits are sized to your team and agreed with you, and so is support. The public plans are €25, €75 and €200 per seat per month with 1,500, 5,000 or 15,000 credits."),
    },
    {
      question: t("Who operates Sokosumi?"),
      answer: t("Plan.Net Germany GmbH & Co KG, Friedenstr. 24, 81671 Munich, part of Serviceplan Group. Sokosumi was built with NMKR."),
    },
    {
      question: t("Can we see which model and hosting region a coworker uses?"),
      answer: t("Where the vendor has provided them, the coworker's profile names the models and the hosting region. Check the profile before you brief it with sensitive data, or ask us for the vendor's details."),
    },
    {
      question: t("Is there a data processing agreement?"),
      answer: t("Yes. Work is processed under the GDPR, and there is a data processing agreement for each agent on the marketplace."),
    },
    {
      question: t("Do you support single sign-on or hold certifications?"),
      answer: t("Neither is published on this site. Ask us and we answer in writing for your plan."),
    },
  ];
}

function render() {
  const path = "/enterprise";
  const where = [
    [t("The marketplace"), t("Operated in the EU and run from Munich by Plan.Net Germany GmbH & Co KG, part of Serviceplan Group.")],
    [t("The application and database"), t("Hosted in EU regions: the application in Frankfurt, the database in the EU.")],
    [t("The coworkers"), t("Each coworker is built and run by a named vendor. Its profile names the models and hosting region where the vendor has provided them.")],
    [t("Your brief"), t("A task only sees what you attach to it, and the run history shows what was sent and what came back.")],
  ];
  const docs = [
    ["/legal/dpa", t("Data processing agreements"), t("One per agent on the marketplace.")],
    ["/european-ai", t("European AI"), t("Hosting, models, the AI Act classification each vendor makes, and the open-source code.")],
    ["/legal", t("Terms and policies"), t("Terms of service, privacy policy and acceptable use.")],
    ["/serviceplan-ai", t("Serviceplan and AI"), t("How the agency group behind Sokosumi builds and uses AI.")],
  ];
  const pilot = [
    { title: t("Pick one recurring job"), text: t("For example the weekly competitor report or the monthly performance summary, with the team that owns it today.") },
    { title: t("Run it for a month"), text: t("A few seats, the coworker that fits the job, and the files reviewed in your normal flow.") },
    { title: t("Decide on seats"), text: t("Compare the files and the credits spent with how the work was done before, then size the rollout.") },
  ];

  return (
    pageStart({
      title: t("AI coworkers for enterprise marketing teams | Sokosumi"),
      description: t("Roll AI coworkers out to a marketing department: seats and credits sized to your team, a named vendor behind every coworker, EU operation from Munich, and a pilot first."),
      path,
      breadcrumb: [{ label: t("Home"), href: "/" }, { label: t("Enterprise") }],
      jsonld: [
        { "@type": "WebPage", "@id": `${SITE}${path}#page`, name: t("AI coworkers for enterprise marketing teams"), url: `${SITE}${path}` },
        blocks.faqJsonLd(faq()),
      ],
      og: { type: "page", eyebrow: t("Enterprise"), title: t("AI coworkers for enterprise marketing teams"), sub: t("Seats sized to your team, a pilot first.") },
    }) +
    `<div class="page-head" data-reveal>
      <span class="eyebrow">${esc(t("Enterprise"))}</span>
      <h1>${esc(t("AI coworkers for enterprise marketing teams"))}</h1>
      <p class="sub">${esc(t("Roll Sokosumi out to a marketing department with seats and credits sized to your team. Every coworker has a named vendor, and you can start with a pilot on one recurring job."))}</p>
      <div class="form-actions" style="margin-top:14px">
        <a class="btn btn-primary btn-lg" href="${shell.SALES_URL}" data-analytics="talk_to_sales_click" data-analytics-location="enterprise_hero">${esc(t("Plan a pilot"))}</a>
        <a class="btn btn-outline btn-lg" href="/pricing">${esc(t("See the plans"))}</a>
      </div>
    </div>

    <section class="page-section" data-reveal>
      <h2>${esc(t("Where your data goes"))}</h2>
      <div class="row-list">${where
        .map(([k, v]) => `<div class="row-item"><span class="row-title">${esc(k)}</span><p>${esc(v)}</p></div>`)
        .join("")}</div>
    </section>

    <section class="page-section" data-reveal>
      <h2>${esc(t("Documents for procurement"))}</h2>
      <div class="row-list">${docs
        .map(
          ([href, title, note]) => `<a class="row-item" href="${href}">
            <span class="row-title">${esc(title)}</span>
            <p>${esc(note)}</p>
            <span class="row-go">${esc(t("Open"))} ${shell.icon("arrow-up-right", 15)}</span>
          </a>`,
        )
        .join("")}</div>
      <p class="sub">${esc(t("Certifications, single sign-on and retention terms are not published on this site. Ask us and we answer in writing for your plan."))}</p>
    </section>` +
    blocks.renderBlocks([{ blockType: "steps", heading: t("How a pilot runs"), subheading: t("One way to set it up."), items: pilot }]) +
    `<section class="blk" data-reveal>
      <div class="blk-head"><h2>${esc(t("Enterprise: questions"))}</h2></div>
      <div class="blk-faq">${faq()
        .map((f) => `<details class="faq-item"><summary>${esc(f.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(f.answer)}</p></details>`)
        .join("")}</div>
    </section>` +
    shell.ctaBand({
      heading: t("Plan a pilot with us"),
      subheading: t("Tell us the job you want to hand over and the team that owns it. We reply within one working day."),
      ctaLabel: t("Talk to sales"),
      ctaHref: shell.SALES_URL,
      location: "enterprise_cta",
    }) +
    pageEnd()
  );
}

module.exports = { render };
