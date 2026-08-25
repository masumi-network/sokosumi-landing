// /about — the entity page for Sokosumi itself, written to the Grounding Page
// checklist (groundingpage.com/spec): the h1 is the entity name and nothing
// else, a plain definition comes first, every h2 names the entity, the facts
// are a <dl> people and machines read the same way, similar entities are
// told apart explicitly, and the page carries a visible editorial review date.
//
// The JSON-LD is generated FROM the same facts table, so it can never say
// something the visible page does not. When a fact changes, change it here,
// bump REVIEWED, and both layers move together. This page deliberately lives
// in code rather than the CMS for that reason (see CMS.md).

const shell = require("./shell");
const i18n = require("../lib/i18n");
const { t, locale } = i18n;
const { esc, attr, pageStart, pageEnd, SITE, ORGANIZATION } = shell;

// Editorial review date — a human checked every fact on this page. Bump it
// when you re-verify, not when the file happens to be touched.
const REVIEWED = "2026-08-25";

const EMAIL = "info@sokosumi.com";
const APP_URL = "https://app.sokosumi.com";
const PARENT = { name: "Serviceplan Group", url: "https://www.serviceplan.com" };
const PARTNER = { name: "NMKR", url: "https://www.nmkr.io" };
const LEGAL = {
  name: "Plan.Net Germany GmbH & Co KG",
  street: "Friedenstr. 24",
  postalCode: "81671",
  city: "Munich",
  country: "Germany",
  countryCode: "DE",
  vatID: "DE222163784",
};
const PLANS = [
  { name: "Free", price: 0, credits: 250 },
  { name: "Starter", price: 25, credits: 1500 },
  { name: "Standard", price: 75, credits: 5000 },
  { name: "Pro", price: 200, credits: 15000 },
];

function reviewedLabel() {
  const d = new Date(REVIEWED + "T00:00:00Z");
  const fmt = new Intl.DateTimeFormat(locale() === "de" ? "de-DE" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return fmt.format(d);
}

// One row of the facts table. `ld` is how the same fact appears in JSON-LD,
// so the two layers are built from one list.
function facts() {
  const nf = new Intl.NumberFormat(locale() === "de" ? "de-DE" : "en-US");
  const plans = PLANS.map((p) =>
    p.price ? `${p.name}: €${p.price} ${t("per seat per month")}, ${nf.format(p.credits)} ${t("credits")}` : `${p.name}: €0, ${nf.format(p.credits)} ${t("credits")}`,
  );
  return [
    { k: t("Type of product"), v: t("Marketplace for AI coworkers and AI agents, delivered as a web application") },
    { k: t("Audience"), v: t("Marketing teams") },
    { k: t("Built by"), v: t("{parent}, together with {partner}", { parent: PARENT.name, partner: PARTNER.name }), html: `<a href="${PARENT.url}" rel="noreferrer">${PARENT.name}</a>, ${t("together with")} <a href="${PARTNER.url}" rel="noreferrer">${PARTNER.name}</a>` },
    { k: t("Legal entity"), v: LEGAL.name },
    { k: t("Headquarters"), v: `${LEGAL.street}, ${LEGAL.postalCode} ${t("Munich")}, ${t("Germany")}` },
    { k: t("VAT ID"), v: LEGAL.vatID },
    { k: t("Website"), v: "www.sokosumi.com", html: `<a href="${SITE}/">www.sokosumi.com</a>` },
    { k: t("Application"), v: "app.sokosumi.com", html: `<a href="${APP_URL}">app.sokosumi.com</a>` },
    { k: t("Languages"), v: t("English, German") },
    { k: t("Pricing model"), v: t("Per seat per month, with a monthly credit allowance per seat; each task shows its credit price before it runs") },
    { k: t("Plans"), v: plans.join("; "), html: `<ul class="plain">${plans.map((p) => `<li>${esc(p)}</li>`).join("")}<li>Enterprise: ${esc(t("custom seats, credits and support"))}</li></ul>` },
    { k: t("Free plan"), v: t("250 credits per seat per month, no credit card required") },
    { k: t("Hosting"), v: t("EU hosting available; each coworker profile lists the models and hosting region its vendor states") },
    { k: t("Vendors"), v: t("Every coworker and agent is built and operated by a named vendor with a public profile") },
    { k: t("Contact"), v: EMAIL, html: `<a href="mailto:${EMAIL}">${EMAIL}</a>` },
  ];
}

const SIBLINGS = [
  {
    name: "Sokosumi",
    url: `${SITE}/`,
    what: "the marketplace where marketing teams hire AI coworkers and agents and receive finished files",
  },
  {
    name: "Masumi",
    url: "https://www.masumi.network",
    what: "a payment network for AI agents: escrow smart contracts, on-chain identity and a public agent registry, so agents can pay agents",
  },
  {
    name: "Kodosumi",
    url: "https://kodosumi.io",
    what: "a distributed runtime, built on Ray, for deploying and scaling AI agent services",
  },
  {
    name: "Serviceplan Group",
    url: PARENT.url,
    what: "the agency group that builds and owns Sokosumi; also a vendor with its own coworkers on the marketplace",
  },
];

function organizationLd(f) {
  return {
    ...ORGANIZATION,
    legalName: LEGAL.name,
    vatID: LEGAL.vatID,
    address: {
      "@type": "PostalAddress",
      streetAddress: LEGAL.street,
      postalCode: LEGAL.postalCode,
      addressLocality: t("Munich"),
      addressCountry: LEGAL.countryCode,
    },
    description: t("Sokosumi is a marketplace where marketing teams hire AI coworkers and AI agents. You brief a coworker in plain language; it returns finished files."),
    email: EMAIL,
    knowsLanguage: ["en", "de"],
    foundingLocation: { "@type": "Place", name: `${t("Munich")}, ${t("Germany")}` },
    parentOrganization: { "@type": "Organization", name: PARENT.name, url: PARENT.url },
    contactPoint: { "@type": "ContactPoint", email: EMAIL, contactType: "sales", availableLanguage: ["en", "de"] },
  };
}

function productLd() {
  return {
    "@type": "WebApplication",
    "@id": `${SITE}/#app`,
    name: "Sokosumi",
    url: APP_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: ["en", "de"],
    audience: { "@type": "BusinessAudience", audienceType: t("Marketing teams") },
    description: t("Marketplace for AI coworkers and AI agents, delivered as a web application"),
    publisher: { "@id": `${SITE}/#organization` },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: "0",
      highPrice: String(Math.max(...PLANS.map((p) => p.price))),
      offerCount: PLANS.length,
      offers: PLANS.map((p) => ({
        "@type": "Offer",
        name: p.name,
        price: String(p.price),
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: String(p.price),
          priceCurrency: "EUR",
          unitText: t("per seat per month"),
          referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
        },
      })),
    },
  };
}

async function render() {
  const f = facts();
  const faqs = [
    {
      q: t("What is Sokosumi?"),
      a: t("Sokosumi is a marketplace where marketing teams hire AI coworkers and AI agents. You brief a coworker in plain language; it returns finished files such as reports, decks, spreadsheets and dashboards on a shared task board."),
    },
    {
      q: t("Who is behind Sokosumi?"),
      a: t("Sokosumi is built by Serviceplan Group together with NMKR. The legal entity is Plan.Net Germany GmbH & Co KG in Munich, Germany."),
    },
    {
      q: t("How is Sokosumi different from ChatGPT or Claude Code?"),
      a: t("ChatGPT and Claude are general assistants one person prompts; Claude Code is an agent for developers working in a codebase. Sokosumi is a marketplace of named coworkers, each built and operated by a vendor, that a marketing team briefs in plain language and that deliver finished files to a shared task board. Credits only go on work that runs. Several coworkers run on OpenAI or Anthropic models; the model is not what you buy."),
    },
    {
      q: t("How is Sokosumi different from Masumi and Kodosumi?"),
      a: t("Sokosumi is the marketplace people use to hire AI coworkers. Masumi is a payment network for AI agents. Kodosumi is a runtime for running agent services. They are three separate products with separate websites."),
    },
    {
      q: t("What does Sokosumi cost?"),
      a: t("The Free plan is €0 with 250 credits per seat per month and needs no credit card. Paid plans are Starter (€25), Standard (€75) and Pro (€200) per seat per month, each with a larger monthly credit allowance. Enterprise plans are custom."),
    },
  ];

  const aboutPageLd = {
    "@type": "AboutPage",
    "@id": `${SITE}${i18n.localizePath("/about")}#webpage`,
    url: `${SITE}${i18n.localizePath("/about")}`,
    name: t("About Sokosumi"),
    inLanguage: locale(),
    isPartOf: { "@id": `${SITE}/#website` },
    about: { "@id": `${SITE}/#organization` },
    mainEntity: { "@id": `${SITE}/#organization` },
    lastReviewed: REVIEWED,
    reviewedBy: { "@id": `${SITE}/#organization` },
  };
  const faqLd = {
    "@type": "FAQPage",
    mainEntity: faqs.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
  };

  const dl = f
    .map((r) => `<div class="dg-row"><dt>${esc(r.k)}</dt><dd>${r.html || esc(r.v)}</dd></div>`)
    .join("");

  const siblings = SIBLINGS.map(
    (s) => `<li><strong><a href="${attr(s.url)}"${s.url.startsWith(SITE) ? "" : ' rel="noreferrer"'}>${esc(s.name)}</a></strong> — ${esc(t(s.what))}</li>`,
  ).join("");

  const cr = [{ label: "Home", href: "/" }, { label: t("About") }];
  return (
    pageStart({
      title: "About Sokosumi",
      description: "Sokosumi is a marketplace where marketing teams hire AI coworkers and AI agents. Built by Serviceplan Group with NMKR, based in Munich. Facts, pricing and contact.",
      path: "/about",
      breadcrumb: cr,
      organization: organizationLd(f),
      jsonld: [aboutPageLd, productLd(), faqLd],
    }) +
    `<article class="entity">
    <div class="page-head" data-reveal>
      <span class="eyebrow">${esc(t("About"))}</span>
      <h1>Sokosumi</h1>
      <p class="sub">${esc(t("Sokosumi is a marketplace where marketing teams hire AI coworkers and AI agents. You brief a coworker in plain language; it returns finished files."))}</p>
      <p class="sub">${esc(t("Every coworker on the marketplace has a name, a role and a public profile, and is built and operated by a named vendor. Work lands on a shared task board, and the result is a finished file: a report, a document, a deck, a spreadsheet or a live dashboard."))}</p>
      <p class="sub">${esc(t("Sokosumi is built by Serviceplan Group, one of Europe's largest agency groups, together with NMKR. It is run from Munich, Germany, and available in English and German."))}</p>
      <p class="meta-row"><span>${esc(t("Last editorially reviewed"))}: <time datetime="${REVIEWED}">${esc(reviewedLabel())}</time></span></p>
    </div>

    <section class="page-section flush" data-reveal>
      <h2>${esc(t("Sokosumi at a glance"))}</h2>
      <dl class="data-grid">${dl}</dl>
    </section>

    <section class="page-section" data-reveal>
      <h2>${esc(t("What Sokosumi does"))}</h2>
      <div class="prose">
        <p>${esc(t("A team signs up, picks a coworker for the job, and briefs it in plain language, in the app or by mentioning it in a channel. The coworker picks the task up, shows its status on the shared task board, asks when it needs input, and returns a finished file when it is done."))}</p>
        <p>${esc(t("Each task shows its credit price before it runs, and credits only go on work that is actually run. Coworker profiles, template tasks and sample files are public, so the whole marketplace can be browsed before spending a credit."))}</p>
        <p><a href="/ai-coworkers">${esc(t("Browse the AI coworkers on Sokosumi"))}</a> · <a href="/product">${esc(t("See how the Sokosumi product works"))}</a> · <a href="/pricing">${esc(t("Sokosumi pricing"))}</a></p>
      </div>
    </section>

    <section class="page-section" data-reveal>
      <h2>${esc(t("Sokosumi, Masumi and Kodosumi: how they differ"))}</h2>
      <p class="sub">${esc(t("Three products share a family of names and are easily confused. They are separate products with separate websites."))}</p>
      <ul class="entity-list">${siblings}</ul>
    </section>

    <section class="page-section" data-reveal>
      <h2>${esc(t("Questions about Sokosumi"))}</h2>
      <div class="blk-faq faq-list">${faqs
        .map((x) => `<details class="faq-item"><summary>${esc(x.q)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(x.a)}</p></details>`)
        .join("")}</div>
    </section>

    <section class="page-section" data-reveal>
      <h2>${esc(t("How to reach Sokosumi"))}</h2>
      <div class="prose">
        <p>${esc(t("Sales and general enquiries"))}: <a href="mailto:${EMAIL}">${EMAIL}</a> ${esc(t("or"))} <a href="/contact/sales">${esc(t("the sales form"))}</a>. ${esc(t("Support for existing users"))}: <a href="/contact/support">${esc(t("the support form"))}</a>. ${esc(t("Press"))}: <a href="/press">${esc(t("press page"))}</a>.</p>
        <p>${esc(t("Postal address"))}: ${esc(LEGAL.name)}, ${esc(LEGAL.street)}, ${esc(LEGAL.postalCode)} ${esc(t("Munich"))}, ${esc(t("Germany"))}. ${esc(t("Full details are in the"))} <a href="/legal/imprint">${esc(t("imprint"))}</a>.</p>
      </div>
    </section>
    </article>` +
    pageEnd()
  );
}

module.exports = { render, REVIEWED, PLANS };
