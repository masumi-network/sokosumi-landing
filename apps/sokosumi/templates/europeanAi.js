// /european-ai — the trust page: where the software runs, which models the
// coworkers name, what the EU AI Act actually requires, and the code licences.
//
// Keyword targets, validated 2026-08-27 on volume AND live SERPs:
//   DE  europäische ki      1,000  KD 0   TP 600   SERP DR floor 8 (a DR 47 ranks)
//   DE  open source ki      1,000  KD 7   TP 250   SERP DR floor 13
//   DE  dsgvo konforme ki     200  KD 0   $3.00    SERP unformed
//   EN  gdpr compliant ai     800  KD 0            SERP unformed
// Rejected: digitale souveränität (DE 3,000) — DR floor 63, bmds.bund.de at DR 94;
// data sovereignty (US 2,500) — DR floor 88, IBM and AWS; eu ai act — KD 90-96.
//
// EVIDENCE DISCIPLINE. Checked against the CMS on 2026-08-28:
//   profileLlm     9 of 52 active coworkers filled — Claude, Mistral, Grok, OpenAI Codex
//   profileHosting 3 of 52 filled — all "EU · Azure · Frankfurt"
// So this page says models and hosting are stated "where the vendor has filled
// them in", never "every coworker states its model" — the first version of this
// page claimed the latter and it was wrong at 17%. MODELS below lists only names
// that actually appear in profileLlm. Do not add a model here to make the row
// look fuller; the row is a claim about the catalogue.
//
// No ISO 27001, no SOC 2, no "GDPR certified" badge — none exist to show, and a
// procurement reader checks. What is shown is what can be verified: the EU
// emblem for where it runs, Serviceplan Group for who is behind it, the real
// OSS licences, and the customer logo wall the rest of the site already uses.

const fs = require("fs");
const path = require("path");
const shell = require("./shell");
const blocks = require("./blocks");
const { t } = require("../lib/i18n");

const { esc, attr, icon, pageStart, pageEnd, SITE } = shell;

const EU_AI_ACT = "https://artificialintelligenceact.eu/";

// Model names taken from the CMS `profileLlm` field. If a brand SVG is dropped
// into assets/logos/models/<slug>.svg it is used; otherwise the name renders as
// a typographic chip, which is honest and looks deliberate rather than like a
// redrawn trademark.
const MODELS = [
  { slug: "claude", name: "Claude", by: "Anthropic" },
  { slug: "mistral", name: "Mistral", by: "Mistral AI" },
  { slug: "openai", name: "OpenAI", by: "OpenAI" },
  { slug: "grok", name: "Grok", by: "xAI" },
];
const LOGO_DIR = path.join(__dirname, "..", "assets", "logos", "models");
const hasLogo = (slug) => {
  try { return fs.existsSync(path.join(LOGO_DIR, `${slug}.svg`)); } catch { return false; }
};

const REPOS = [
  { repo: "sokosumi", licence: "MIT", stars: 12, what: "The marketplace monorepo — the product itself." },
  { repo: "kodosumi", licence: "Apache-2.0", stars: 42, what: "The runtime that manages and executes agentic services." },
  { repo: "masumi-payment-service", licence: "MIT", stars: 14, what: "The payment layer behind every agent run." },
];

const TIERS = [
  { n: "01", key: "Minimal risk", eg: "Spam filters, simple recommender systems.", note: "No specific obligations under the Act." },
  { n: "02", key: "Transparency risk", eg: "Chatbots, biometric categorisation, synthetic media.", note: "Users must be told they are dealing with AI." },
  { n: "03", key: "High risk", eg: "Recruitment, credit scoring, education, law enforcement.", note: "Conformity assessment and documentation required." },
];

function badge(href, img, alt, label, sub) {
  const inner = `<span class="eu-badge-img">${img}</span>
    <span class="eu-badge-txt"><strong>${esc(label)}</strong><span>${esc(sub)}</span></span>`;
  return href
    ? `<a class="card eu-badge" href="${attr(href)}">${inner}</a>`
    : `<div class="card eu-badge">${inner}</div>`;
}

function render() {
  const path_ = "/european-ai";
  return (
    pageStart({
      title: t("European AI for marketing teams: GDPR, the AI Act and open source | Sokosumi"),
      description: t(
        "A European AI marketplace: operated in the EU from Munich, models and hosting named on the listing, every vendor classifies its EU AI Act risk tier, and the code is public under MIT and Apache-2.0.",
      ),
      path: path_,
      breadcrumb: [{ label: t("Home"), href: "/" }, { label: t("European AI") }],
      stylesheets: ["/assets/european-ai.css"],
      jsonld: [
        { "@type": "WebPage", "@id": `${SITE}${path_}#page`, name: t("European AI for marketing teams"), url: `${SITE}${path_}` },
      ],
      og: {
        type: "page",
        eyebrow: t("Built in Europe"),
        title: t("European AI, stated plainly"),
        sub: t("Where it runs, which model, whose licence."),
      },
    }) +
    // ── hero ───────────────────────────────────────────────────────────────
    `<div class="page-head eu-head" data-reveal>
      <span class="eyebrow">${esc(t("Built in Europe"))}</span>
      <h1>${esc(t("European AI for marketing teams"))}</h1>
      <p class="sub">${esc(
        t(
          "Most AI tooling a European marketing team can buy is American, closed, and vague about where your brief ends up. Sokosumi is built the other way round — and this page shows the evidence rather than a badge.",
        ),
      )}</p>
    </div>

    <section class="page-section flush" data-reveal aria-label="${attr(t("At a glance"))}">
      <div class="eu-badges">
        ${badge(null, `<img src="/assets/logos/eu.svg" alt="" width="44" height="30" loading="lazy" decoding="async" />`,
          t("Operated in the EU"), t("Run from Munich, Germany"))}
        ${badge("/about", `<img class="logo-ink" src="/assets/logos/serviceplan-group.svg" alt="" height="26" loading="lazy" decoding="async" />`,
          t("Serviceplan Group"), t("One of Europe's largest independent agency groups"))}
        ${badge("https://github.com/masumi-network", `<span class="eu-lic-chip">MIT</span><span class="eu-lic-chip">Apache-2.0</span>`,
          t("Open source"), t("Marketplace, runtime and payments, public on GitHub"))}
        ${badge("/legal/dpa", `<span class="eu-badge-glyph">${icon("check", 22)}</span>`,
          t("GDPR and a DPA"), t("Processed under the GDPR; addendum available"))}
      </div>
    </section>

    <!-- ── where it runs ──────────────────────────────────────────────── -->
    <section class="page-section eu-run" data-reveal aria-label="${attr(t("Where your work runs"))}">
      <h2>${esc(t("Where your work actually runs"))}</h2>
      <div class="eu-run-grid">
        <div class="eu-run-item">
          <span class="eu-run-k">${esc(t("The marketplace"))}</span>
          <p>${esc(t("Operated in the EU and run from Munich by Plan.Net Germany GmbH & Co KG, Friedenstr. 24, 81671 Munich — part of Serviceplan Group."))}</p>
        </div>
        <div class="eu-run-item">
          <span class="eu-run-k">${esc(t("The coworkers"))}</span>
          <p>${esc(t("Each coworker is built and run by an independent vendor. Where the vendor has filled it in, the listing names the models it uses and the hosting region — the ones that state a region today say EU · Azure · Frankfurt."))}</p>
        </div>
        <div class="eu-run-item">
          <span class="eu-run-k">${esc(t("Your brief"))}</span>
          <p>${esc(t("Nothing is attached to a task unless you attach it, and the run history shows what was sent and what came back."))}</p>
        </div>
      </div>
    </section>

    <!-- ── models ─────────────────────────────────────────────────────── -->
    <section class="page-section eu-models" data-reveal aria-label="${attr(t("Models"))}">
      <h2>${esc(t("You pick the specialist, so you pick the model"))}</h2>
      <p class="sub">${esc(t("Coworkers on the marketplace name these models today. Hiring a different specialist for the same job is how you change the model behind it."))}</p>
      <div class="eu-model-row">
        ${MODELS.map(
          (m) => `<div class="eu-model">${
            hasLogo(m.slug)
              ? `<img src="/assets/logos/models/${attr(m.slug)}.svg" alt="${attr(m.name)}" height="22" loading="lazy" decoding="async" />`
              : `<span class="eu-model-name">${esc(m.name)}</span>`
          }<span class="eu-model-by">${esc(m.by)}</span></div>`,
        ).join("")}
      </div>
      <p class="eu-note">${esc(t("Named on coworker listings where the vendor has provided them. Read the listing before you send anything sensitive — that is what it is there for."))}</p>
    </section>

    <!-- ── EU AI Act risk tiers ───────────────────────────────────────── -->
    <section class="page-section eu-tiers" data-reveal aria-label="${attr(t("EU AI Act"))}">
      <h2>${esc(t("Every vendor classifies its risk tier before going live"))}</h2>
      <p class="sub">${esc(t("There is no such thing as an “EU AI Act certificate”. What exists is the classification the Act requires — and on Sokosumi it is part of listing an agent, not an afterthought."))}</p>
      <div class="eu-tier-grid">
        ${TIERS.map(
          (x) => `<div class="eu-tier">
            <span class="eu-tier-n">${esc(x.n)}</span>
            <strong>${esc(t(x.key))}</strong>
            <span class="eu-tier-eg">${esc(t(x.eg))}</span>
            <span class="eu-tier-note">${esc(t(x.note))}</span>
          </div>`,
        ).join("")}
      </div>
      <p class="eu-note">${esc(t("Which obligations apply depends on how you use a system, so your own use still needs your own assessment."))} <a href="${attr(EU_AI_ACT)}" target="_blank" rel="noreferrer">${esc(t("Read the EU AI Act"))} ${icon("arrow-up-right", 13)}</a></p>
    </section>

    <!-- ── open source ────────────────────────────────────────────────── -->
    <section class="page-section eu-oss" data-reveal aria-label="${attr(t("Open source"))}">
      <h2>${esc(t("Open source, with the licences named"))}</h2>
      <p class="sub">${esc(t("Not a claim you have to take on trust — the repositories are public and the licences are these."))}</p>
      <div class="eu-repo-grid">
        ${REPOS.map(
          (r) => `<a class="card eu-repo" href="${attr(`https://github.com/masumi-network/${r.repo}`)}" target="_blank" rel="noreferrer">
            <span class="eu-repo-top"><span class="eu-lic-chip">${esc(r.licence)}</span><span class="eu-repo-stars">${icon("star", 12)} ${esc(String(r.stars))}</span></span>
            <strong>${esc(r.repo)}</strong>
            <span>${esc(t(r.what))}</span>
            <em>${esc(t("View on GitHub"))} ${icon("arrow-up-right", 13)}</em>
          </a>`,
        ).join("")}
      </div>
    </section>

    <!-- ── legal documents ────────────────────────────────────────────── -->
    <section class="page-section eu-legal" data-reveal aria-label="${attr(t("Legal documents"))}">
      <h2>${esc(t("Legal documents"))}</h2>
      <div class="eu-legal-grid">
        ${[
          ["/legal/privacy-policy", t("Privacy policy")],
          ["/legal/dpa", t("Data processing addendum")],
          ["/legal/terms-of-service", t("Terms of service")],
          ["/legal/acceptable-use", t("Acceptable use")],
        ]
          .map(
            ([href, label]) => `<a class="card eu-legal-card" href="${attr(href)}">
              <strong>${esc(label)}</strong><em>${esc(t("View document"))} ${icon("arrow-up-right", 13)}</em>
            </a>`,
          )
          .join("")}
      </div>
    </section>` +
    shell.logoRow() +
    blocks.renderBlocks([
      {
        blockType: "faq",
        heading: t("European AI: common questions"),
        items: [
          {
            question: t("Is Sokosumi GDPR compliant?"),
            answer: t(
              "Sokosumi processes personal data in accordance with the GDPR and applicable national data protection laws; the detail is in the privacy policy and the DPA. Worth knowing: GDPR is a regulation, not a certification scheme. There is no badge to hold, so any vendor showing you a “GDPR certified” logo made it themselves.",
            ),
          },
          {
            question: t("Does Sokosumi hold ISO 27001 or SOC 2?"),
            answer: t(
              "No. Neither certification is held today, and we would rather say so here than let a procurement process discover it later. If your review needs one, tell us what it needs and we will tell you where we stand.",
            ),
          },
          {
            question: t("Is Sokosumi EU AI Act compliant?"),
            answer: t(
              "“EU AI Act certified” is not a thing that exists to be claimed. What Sokosumi does is concrete: every vendor classifies its agent's risk tier before the listing goes live, and the terms shown to users are there to meet the Act's transparency requirements. Obligations follow from how a system is used, so your own use still needs your own assessment.",
            ),
          },
          {
            question: t("Is everything hosted in Europe?"),
            answer: t(
              "The marketplace is operated in the EU. The coworkers are not all ours — independent vendors build and run them — so each listing states its own hosting region rather than us making a promise on someone else's behalf. The listings that state a region today say EU · Azure · Frankfurt, and the listing is where you check it.",
            ),
          },
          {
            question: t("Which models do the coworkers use?"),
            answer: t(
              "Claude, Mistral, OpenAI and Grok appear across the coworker listings that name a model. Not every vendor has filled that field in yet, so treat the listing as the source of truth for the coworker you are about to brief rather than assuming a house model.",
            ),
          },
          {
            question: t("What exactly is open source?"),
            answer: t(
              "The marketplace monorepo and the payment service are MIT licensed; the Kodosumi runtime that executes agentic services is Apache-2.0. All three are public on GitHub under the masumi-network organisation. The individual coworkers belong to their vendors and are licensed by them.",
            ),
          },
          {
            question: t("Why does European AI matter for a marketing team?"),
            answer: t(
              "Mostly it is procurement. Where data is processed, which model saw the brief, and who is accountable are the questions a legal or security review asks before a tool is approved. Being able to answer them from a listing rather than a sales call is the practical benefit.",
            ),
          },
        ],
      },
    ]) +
    shell.ctaBand({
      heading: t("Run one task and read the listing."),
      subheading: t("The free plan carries 250 credits per seat. Every listing shows what the vendor has stated before you brief it."),
      ctaLabel: t("Sign Up"),
    }) +
    pageEnd({})
  );
}

module.exports = { render };
