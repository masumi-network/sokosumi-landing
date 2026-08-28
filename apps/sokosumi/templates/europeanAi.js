// /european-ai — the sovereignty page: where the software runs, who picks the
// model, what the EU AI Act actually requires, and what the code licence is.
//
// Keyword targets, validated 2026-08-27 against volume AND live SERPs, because
// KD alone was wrong on every term tested this session:
//
//   DE  europäische ki      1,000  KD 0   TP 600   SERP DR floor 8  (DR 47 ranks)
//   DE  open source ki      1,000  KD 7   TP 250   SERP DR floor 13
//   DE  dsgvo konforme ki     200  KD 0   $3.00    SERP unformed
//   EN  gdpr compliant ai     800  KD 0            SERP unformed
//
// Rejected on SERP evidence, not taste:
//   digitale souveränität (DE 3,000, "KD 4") — DR floor 63, owned by bmds.bund.de
//     (DR 94), Bundesdruckerei, SAP and Bitkom. Government policy topic, and the
//     searcher wants policy, not a marketplace.
//   data sovereignty (US 2,500, "KD 17") — DR floor 88: IBM and AWS.
//   eu ai act (DE 6,500 / US 3,100) — KD 96 / 90.
//
// On claims. The site says "EU hosting available" in six other places, not
// "everything is hosted in Europe", and that precision is correct: vendors run
// their own coworkers and their own infrastructure. This page keeps that line.
// It also does not assert EU AI Act conformity — there is no such certification
// to hold. What it states instead is the thing that is true and checkable: every
// vendor classifies its agent's risk tier at listing time (templates/listAgent.js)
// and the code is public under named licences.

const shell = require("./shell");
const blocks = require("./blocks");
const { t } = require("../lib/i18n");

const { esc, attr, icon, pageStart, pageEnd, SITE } = shell;

const EU_AI_ACT = "https://artificialintelligenceact.eu/";
const REPOS = [
  { name: "masumi-network/sokosumi", licence: "MIT", what: "The marketplace monorepo — the product itself." },
  { name: "masumi-network/kodosumi", licence: "Apache-2.0", what: "The runtime that manages and executes agentic services." },
  { name: "masumi-network/masumi-payment-service", licence: "MIT", what: "The payment layer behind agent runs." },
];

function pillar(ic, title, body) {
  return `<div class="card eu-pillar">
    <span class="eu-pillar-ic" aria-hidden="true">${icon(ic, 18)}</span>
    <strong>${esc(title)}</strong>
    <span>${esc(body)}</span>
  </div>`;
}

function render() {
  const path = "/european-ai";
  return (
    pageStart({
      title: t("European AI for marketing teams: GDPR, the AI Act and open source | Sokosumi"),
      description: t(
        "A European AI marketplace: operated in the EU, every coworker states its model and hosting region, every vendor classifies its EU AI Act risk tier, and the code is public under MIT and Apache-2.0.",
      ),
      path,
      breadcrumb: [{ label: t("Home"), href: "/" }, { label: t("European AI") }],
      jsonld: [
        {
          "@type": "WebPage",
          "@id": `${SITE}${path}#page`,
          name: t("European AI for marketing teams"),
          url: `${SITE}${path}`,
        },
      ],
      og: {
        type: "page",
        eyebrow: t("Built in Europe"),
        title: t("European AI, stated plainly"),
        sub: t("Where it runs, which model, whose licence."),
      },
    }) +
    `<div class="page-head" data-reveal>
      <span class="eyebrow">${esc(t("Built in Europe"))}</span>
      <h1>${esc(t("European AI for marketing teams"))}</h1>
      <p class="sub">${esc(
        t(
          "Most AI tooling a European marketing team can buy is American, closed, and vague about where your brief ends up. Sokosumi is built the other way round — and this page states exactly what that does and does not mean.",
        ),
      )}</p>
    </div>
    <section class="page-section flush" data-reveal aria-label="${attr(t("What that means"))}">
      <div class="${shell.gridCls(4)} eu-pillars">
        ${pillar("building", t("Operated in the EU"), t("Sokosumi is run from Munich by Plan.Net Germany GmbH & Co KG, part of Serviceplan Group."))}
        ${pillar("layers", t("You choose the model"), t("Every coworker states the model it runs on. You pick the specialist, so you pick the model."))}
        ${pillar("list", t("Risk tier on every listing"), t("Vendors classify their agent under the EU AI Act before it goes live on the marketplace."))}
        ${pillar("folder", t("Open source"), t("The marketplace, the runtime and the payment service are public under MIT and Apache-2.0."))}
      </div>
    </section>` +
    blocks.renderBlocks([
      {
        blockType: "featureGrid",
        heading: t("Where your work actually runs"),
        items: [
          {
            title: t("The marketplace"),
            text: t(
              "Sokosumi itself is operated in the EU and run from Munich. The company behind it is Plan.Net Germany GmbH & Co KG, Friedenstr. 24, 81671 Munich — part of Serviceplan Group, one of Europe's largest independent agency groups.",
            ),
          },
          {
            title: t("The coworkers"),
            text: t(
              "Each coworker is built and operated by its own vendor, and each listing states the models it uses and the hosting region the vendor provides. EU hosting is available. Read the listing before you send it anything sensitive — that is what it is there for.",
            ),
          },
          {
            title: t("Your brief"),
            text: t(
              "You decide what goes into a task. Nothing is attached to a run unless you attach it, and the run history shows what was sent and what came back.",
            ),
          },
        ],
      },
      {
        blockType: "featureGrid",
        heading: t("Model choice is the point, not a setting"),
        items: [
          {
            title: t("One tool, one model, no say"),
            text: t(
              "Most AI suites decide the model for you and change it when their vendor contract changes. You find out in a changelog, if at all.",
            ),
          },
          {
            title: t("A marketplace works differently"),
            text: t(
              "You hire a named specialist for a task. Its listing states the model and the hosting region, and you can pick a different coworker for the same job if you do not like the answer.",
            ),
          },
          {
            title: t("Which matters most for sensitive work"),
            text: t(
              "A market briefing on public sources and a brief containing unreleased positioning are not the same risk. Being able to route them to different coworkers is the practical form of model choice.",
            ),
          },
        ],
      },
    ]) +
    `<section class="page-section" data-reveal aria-label="${attr(t("Open source"))}">
      <h2 class="sec-h">${esc(t("Open source, with the licences named"))}</h2>
      <p class="sub">${esc(t("Not a claim you have to take on trust — the repositories are public and the licences are the ones below."))}</p>
      <div class="${shell.gridCls(REPOS.length)}">
        ${REPOS.map(
          (r) => `<a class="card eu-repo" href="${attr(`https://github.com/${r.name}`)}" target="_blank" rel="noreferrer">
            <strong>${esc(r.name.split("/")[1])}</strong>
            <span class="eu-lic">${esc(r.licence)}</span>
            <span>${esc(t(r.what))}</span>
            <em>${esc(t("View on GitHub"))} ${icon("arrow-up-right", 14)}</em>
          </a>`,
        ).join("")}
      </div>
    </section>` +
    blocks.renderBlocks([
      {
        blockType: "faq",
        heading: t("European AI: common questions"),
        items: [
          {
            question: t("Is Sokosumi GDPR compliant?"),
            answer: t(
              "Sokosumi processes personal data in accordance with the GDPR and applicable national data protection laws; the detail is in the privacy policy and the DPA. Note that GDPR is a regulation, not a certification scheme — there is no badge to hold, and any vendor showing you a \"GDPR certified\" logo is showing you something they made themselves.",
            ),
          },
          {
            question: t("Is Sokosumi EU AI Act compliant?"),
            answer: t(
              "The honest answer is that \"EU AI Act certified\" is not a thing that exists to be claimed. What Sokosumi does is concrete: every vendor classifies its agent's risk tier — minimal, transparency, or high risk — before the listing goes live, and the terms shown to users are there to meet the Act's transparency requirements. Obligations depend on how you use a system, so your own use still needs your own assessment.",
            ),
          },
          {
            question: t("Is everything hosted in Europe?"),
            answer: t(
              "The marketplace is operated in the EU. The coworkers are not all ours — independent vendors build and run them — so each listing states its own hosting region rather than us making a promise on their behalf. EU hosting is available, and the listing is where you check it.",
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
              "Mostly it is procurement. Where data is processed, which model saw the brief, and who is accountable are questions a legal or security review will ask before a tool gets approved. Being able to answer them from a listing rather than a sales call is the practical benefit.",
            ),
          },
        ],
      },
    ]) +
    `<section class="page-section" data-reveal aria-label="${attr(t("What we do not claim"))}">
      <h2 class="sec-h">${esc(t("What we do not claim"))}</h2>
      <ul class="entity-list eu-nots">
        <li>${esc(t("No ISO 27001 or SOC 2 certification. If a procurement process needs one, ask us rather than assuming."))}</li>
        <li>${esc(t("No blanket promise that every vendor hosts in the EU. Each listing states its own region."))}</li>
        <li>${esc(t("No claim to be \"EU AI Act certified\". No such certificate exists; the risk classification on each listing is the real mechanism."))}</li>
        <li>${esc(t("No claim that European hosting alone makes a model safe. It answers where, not how well."))}</li>
      </ul>
      <p class="sub">${esc(t("The full text of the Act is published by the EU."))} <a href="${attr(EU_AI_ACT)}" target="_blank" rel="noreferrer">${esc(t("Read the EU AI Act"))}</a></p>
    </section>` +
    shell.ctaBand({
      heading: t("Run one task and read the listing."),
      subheading: t("The free plan carries 250 credits per seat. Every coworker states its model and hosting region before you brief it."),
      ctaLabel: t("Sign Up"),
    }) +
    pageEnd({})
  );
}

module.exports = { render };
