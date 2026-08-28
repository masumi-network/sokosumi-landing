// /european-ai — the trust page.
//
// Design note. The first two versions were six near-identical white card grids
// stacked on grey: badges, run, models, tiers, repos, legal. Every section the
// same shape and the same weight, so the page had no rhythm and nothing to look
// at. This version gives each section its own structure — a spec strip, three
// typeset columns, a name row, a numbered progression, mono repo rows, a link
// list — and alternates paper against the site's own ink bands (.full-bleed +
// .band-dark + --stage-deep, the surfaces the landing page and the CTA already
// use) so the page has a rhythm instead of scrolling flat.
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
// them in", never "every coworker states its model". MODELS lists only names
// that actually appear in profileLlm — the row is a claim about the catalogue,
// so do not add one to make it look fuller.
//
// No ISO 27001, no SOC 2, no "GDPR certified" badge: none exist to show, and a
// procurement reader checks.

const fs = require("fs");
const path = require("path");
const shell = require("./shell");
const blocks = require("./blocks");
const { t } = require("../lib/i18n");

const { esc, attr, icon, pageStart, pageEnd, SITE } = shell;

const EU_AI_ACT = "https://artificialintelligenceact.eu/";

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

// Two repos, not three. There is no plain `masumi` repo in the org, so the
// Masumi side is the payment service; kodosumi (the runtime) is dropped here
// and still reachable from GitHub.
const REPOS = [
  { repo: "sokosumi", licence: "MIT", stars: 12, what: "The marketplace itself — the web app, the roster, the task board." },
  { repo: "masumi-payment-service", licence: "MIT", stars: 14, what: "The Masumi payment layer that settles every agent run." },
];

// Where the software actually runs. Vercel is verifiable from the response
// headers (x-vercel-id: fra1 = Frankfurt); the Neon region is Sokosumi's own
// configuration.
const INFRA = [
  { slug: "vercel", name: "Vercel", role: "Application hosting", where: "EU region — Frankfurt (fra1)" },
  { slug: "neon", name: "Neon", role: "Database", where: "EU region" },
];

const TIERS = [
  { n: "01", key: "Minimal risk", eg: "Spam filters, simple recommender systems.", note: "No specific obligations under the Act." },
  { n: "02", key: "Transparency risk", eg: "Chatbots, biometric categorisation, synthetic media.", note: "Users must be told they are dealing with AI." },
  { n: "03", key: "High risk", eg: "Recruitment, credit scoring, education, law enforcement.", note: "Conformity assessment and documentation required." },
];

// The emblem's 12-star ring, drawn large and faint behind the hero. Same
// construction as assets/logos/eu.svg, inlined so it can take currentColor and
// be sized to the band rather than sitting in an <img> box.
function starRing() {
  const R = 130;
  const ro = 20;
  const ri = (ro * Math.sin(Math.PI / 10)) / Math.sin((3 * Math.PI) / 10);
  const star = (cx, cy) => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = (-90 + i * 36) * (Math.PI / 180);
      const r = i % 2 === 0 ? ro : ri;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
    }
    return `<polygon points="${pts.join(" ")}"/>`;
  };
  let out = "";
  for (let k = 0; k < 12; k++) {
    const a = (-90 + k * 30) * (Math.PI / 180);
    out += star(160 + R * Math.cos(a), 160 + R * Math.sin(a));
  }
  return `<svg class="eu-ring" viewBox="0 0 320 320" aria-hidden="true" focusable="false"><g fill="currentColor">${out}</g></svg>`;
}

function render() {
  const here = "/european-ai";
  const FACTS = [
    [t("Operated in the EU"), t("Run from Munich, Germany")],
    [t("Serviceplan Group"), t("One of Europe's largest independent agency groups")],
    [t("Open source"), t("Marketplace, runtime and payments, public on GitHub")],
    [t("GDPR and a DPA"), t("Processed under the GDPR; addendum available")],
  ];
  return (
    pageStart({
      title: t("European AI for marketing: GDPR, AI Act, open source"),
      description: t(
        "A European AI marketplace: operated in the EU, every coworker states its model and hosting region, every vendor classifies its EU AI Act risk tier, and the code is public under MIT and Apache-2.0.",
      ),
      path: here,
      breadcrumb: [{ label: t("Home"), href: "/" }, { label: t("European AI") }],
      stylesheets: ["/assets/european-ai.css"],
      jsonld: [
        { "@type": "WebPage", "@id": `${SITE}${here}#page`, name: t("European AI for marketing teams"), url: `${SITE}${here}` },
      ],
      og: {
        type: "page",
        eyebrow: t("Built in Europe"),
        title: t("European AI, stated plainly"),
        sub: t("Where it runs, which model, whose licence."),
      },
    }) +
    // ── ink hero: statement plus a spec strip, star ring behind ────────────
    `<section class="full-bleed band-dark eu-hero" data-reveal>
      <div class="container-app eu-hero-in">
        ${starRing()}
        <div class="eu-hero-copy">
          <span class="eyebrow">${esc(t("Built in Europe"))}</span>
          <h1>${esc(t("European AI for marketing teams"))}</h1>
          <p>${esc(
            t(
              "Most AI tooling a European marketing team can buy is American, closed, and vague about where your brief ends up. Sokosumi is built the other way round — and this page shows the evidence rather than a badge.",
            ),
          )}</p>
        </div>
        <dl class="eu-spec">
          ${FACTS.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}
        </dl>
      </div>
    </section>

    <!-- ── where it runs: three typeset columns, rules not cards ───────── -->
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

    <!-- ── the stack, with logos ──────────────────────────────────────── -->
    <section class="page-section eu-infra" data-reveal aria-label="${attr(t("Infrastructure"))}">
      <h2>${esc(t("The stack, and where it sits"))}</h2>
      <p class="sub">${esc(t("Two vendors carry the application and the data, and both run in European regions."))}</p>
      <ul class="eu-infra-row">
        ${INFRA.map(
          (i) => `<li class="eu-infra-item">
            <img class="eu-infra-logo" src="/assets/logos/infra/${attr(i.slug)}.svg" alt="${attr(i.name)}" height="28" loading="lazy" decoding="async" />
            <span class="eu-infra-name">${esc(i.name)}</span>
            <span class="eu-infra-role">${esc(t(i.role))}</span>
            <span class="eu-infra-where">${esc(t(i.where))}</span>
          </li>`,
        ).join("")}
      </ul>
    </section>

    <!-- ── models: one rule-bounded row of names ───────────────────────── -->
    <section class="page-section eu-models" data-reveal aria-label="${attr(t("Models"))}">
      <h2>${esc(t("You pick the specialist, so you pick the model"))}</h2>
      <p class="sub">${esc(t("Coworkers on the marketplace name these models today. Hiring a different specialist for the same job is how you change the model behind it."))}</p>
      <ul class="eu-model-row">
        ${MODELS.map(
          // logo AND name: the mark alone left the row reading "Anthropic /
          // Mistral AI / xAI", which are the makers, not the models a coworker
          // names on its listing.
          (m) => `<li class="eu-model">${
            hasLogo(m.slug)
              ? `<img class="eu-model-logo" src="/assets/logos/models/${attr(m.slug)}.svg" alt="" height="22" loading="lazy" decoding="async" />`
              : `<span class="eu-model-logo eu-model-logo-none" aria-hidden="true"></span>`
          }<span class="eu-model-name">${esc(m.name)}</span><span class="eu-model-by">${esc(m.by)}</span></li>`,
        ).join("")}
      </ul>
      <p class="eu-note">${esc(t("Named on coworker listings where the vendor has provided them. Read the listing before you send anything sensitive — that is what it is there for."))}</p>
    </section>

    <!-- ── AI Act: numbered progression, the page's centrepiece ────────── -->
    <section class="page-section eu-tiers" data-reveal aria-label="${attr(t("EU AI Act"))}">
      <h2>${esc(t("Every vendor classifies its risk tier before going live"))}</h2>
      <p class="sub">${esc(t("There is no such thing as an “EU AI Act certificate”. What exists is the classification the Act requires — and on Sokosumi it is part of listing an agent, not an afterthought."))}</p>
      <ol class="eu-tier-track">
        ${TIERS.map(
          (x) => `<li class="eu-tier">
            <span class="eu-tier-n">${esc(x.n)}</span>
            <span class="eu-tier-body">
              <strong>${esc(t(x.key))}</strong>
              <span class="eu-tier-eg">${esc(t(x.eg))}</span>
            </span>
            <span class="eu-tier-note">${esc(t(x.note))}</span>
          </li>`,
        ).join("")}
      </ol>
      <p class="eu-note">${esc(t("Which obligations apply depends on how you use a system, so your own use still needs your own assessment."))} <a href="${attr(EU_AI_ACT)}" target="_blank" rel="noreferrer">${esc(t("Read the EU AI Act"))} ${icon("arrow-up-right", 13)}</a></p>
    </section>

    <!-- ── open source: ink band, mono rows ───────────────────────────── -->
    <section class="full-bleed band-dark eu-oss" data-reveal aria-label="${attr(t("Open source"))}">
      <div class="container-app">
        <span class="eyebrow">${esc(t("Open source"))}</span>
        <h2>${esc(t("Open source, with the licences named"))}</h2>
        <p class="eu-oss-sub">${esc(t("Not a claim you have to take on trust — the repositories are public and the licences are these."))}</p>
        <ul class="eu-repo-list">
          ${REPOS.map(
            (r) => `<li><a href="${attr(`https://github.com/masumi-network/${r.repo}`)}" target="_blank" rel="noreferrer">
              <span class="eu-repo-lic">${esc(r.licence)}</span>
              <code>masumi-network/${esc(r.repo)}</code>
              <span class="eu-repo-what">${esc(t(r.what))}</span>
              <span class="eu-repo-foot">
                <span class="eu-repo-stars">${icon("star", 12)} ${esc(String(r.stars))}</span>
                <span class="eu-repo-go">${esc(t("View on GitHub"))} ${icon("arrow-up-right", 13)}</span>
              </span>
            </a></li>`,
          ).join("")}
        </ul>
      </div>
    </section>

    <!-- ── legal: a plain list, not four cards ────────────────────────── -->
    <section class="page-section eu-legal" data-reveal aria-label="${attr(t("Legal documents"))}">
      <h2>${esc(t("Legal documents"))}</h2>
      <ul class="eu-legal-list">
        ${[
          ["/legal/privacy-policy", t("Privacy policy")],
          ["/legal/dpa", t("Data processing addendum")],
          ["/legal/terms-of-service", t("Terms of service")],
          ["/legal/acceptable-use", t("Acceptable use")],
        ]
          .map(([href, label]) => `<li><a href="${attr(href)}">${esc(label)} ${icon("arrow-up-right", 13)}</a></li>`)
          .join("")}
      </ul>
    </section>` +
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
