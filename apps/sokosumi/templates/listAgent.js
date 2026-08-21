// /list-your-agent — the Sokosumi Agent Listing form, rebuilt natively from
// the Tally form at tally.so/r/nPLBaV.
//
// Every label, option and helper line below is verbatim from that form's own
// definition, including its typos: the EU AI Act label really does begin with
// a stray double quote, and "your agents intended purpose" really is missing
// its apostrophe. They are left alone — this is a port, not a rewrite. Where
// the original was ambiguous the deviation is commented.
//
// Submissions go to support@sokosumi.com through the same store-then-notify
// path as the other two forms, so a mail outage cannot lose a listing.
//
// German: the interface copy is translated through lib/i18n, but the EU AI
// Act classification and the confirmation block are NOT. Sokosumi's operator
// is in Munich and those lines are what the vendor legally declares, so they
// stay in the wording they were written in. Fields carrying them are marked
// `noI18n` / `afterEn` below, and German readers get a one-line notice.

const shell = require("./shell");
const leads = require("../lib/leads");
const i18n = require("../lib/i18n");
const { t } = i18n;
const { esc, attr, icon, pageStart, pageEnd } = shell;

const MASUMI_DOCS = "https://docs.masumi.network/";
const MASUMI_HOME = "https://www.masumi.network/";
const EU_AI_ACT = "https://artificialintelligenceact.eu/ai-act-explorer/";

// Grouped as the original groups them, by its three section headings.
const SECTIONS = [
  {
    heading: "Is your agent ready to be listed?",
    intro: "Before submitting your Agent, we want to make sure the following steps are complete:",
    fields: [
      {
        name: "checklist",
        label: "Pre-Listing Checklist",
        type: "checkboxes",
        required: true,
        options: [
          "Agent is deployed on Masumi",
          "Agent is tested successfully on Sokosumi Pre-Prod",
          "Agent handles invalid inputs gracefully",
        ],
      },
      {
        name: "preprodLink",
        label: "Link to Agent Listing on Sokosumi Preprod",
        type: "text",
        required: true,
        // the original renders this as a textarea; a single URL wants one line
        // the two URLs are interpolated at render time so the translatable
        // key stays a sentence rather than a sentence plus two hardcoded links
        help: 'If this feels challenging, please check out the <a href="{docs}" target="_blank" rel="noreferrer">Masumi Docs</a> or contact support right from the <a href="{home}" target="_blank" rel="noreferrer">chat on our homepage</a>.',
        helpVars: { docs: MASUMI_DOCS, home: MASUMI_HOME },
      },
    ],
  },
  {
    heading: "Please introduce your agent!",
    intro: "Share more details about your agent to help us showcase it accurately on the Sokosumi marketplace.",
    fields: [
      { name: "agentName", label: "What is the name of the Agent?", type: "text", required: true },
      { name: "purpose", label: "Please describe your agents intended purpose.", type: "textarea", required: true },
      { name: "description", label: "Please provide your Agent description.", type: "textarea", required: true },
      { name: "features", label: "What are the key features of your agent?", type: "textarea", required: true },
      { name: "limitations", label: "Are there any known limitations we should be aware of?", type: "textarea", required: true },
      { name: "techStack", label: "What’s the Tech Stack?", type: "textarea", required: true },
      {
        name: "riskClass",
        label: "Classify your AI Agent according to the EU AI Act",
        type: "radio",
        required: true,
        // the classification is a legal declaration by the vendor: label,
        // categories and the pointer to the official text stay English
        noI18n: true,
        options: [
          "Minimal Risk (e.g. spam filters, simple recommender systems)",
          "Transparency Risk (e.g. chatbots, biometric categorization, deepfakes)",
          "High Risk (e.g. recruitment tools, credit scoring, educational AI, law enforcement)",
        ],
        help: `More Details about the EU AI Act can be found on the official homepage <a href="${EU_AI_ACT}" target="_blank" rel="noreferrer">${EU_AI_ACT}</a>`,
      },
      {
        name: "termsOfUse",
        label: "Please enter the Terms of Use for your AI agent",
        type: "textarea",
        required: true,
        rows: 8,
        intro: "This should include:",
        bullets: [
          "Purpose and intended use",
          "Limitations or restrictions",
          "User responsibilities",
          "Any disclaimers or warnings",
        ],
        after:
          "These terms will be shown to users interacting with your agent to ensure transparency and compliance with the EU AI Act.",
        // states a compliance purpose under the EU AI Act, so it is not
        // translated
        afterEn: true,
      },
    ],
  },
  {
    heading: "Who are you?",
    fields: [
      { name: "fullName", label: "What is your full name?", type: "text", required: true, autocomplete: "name" },
      { name: "email", label: "What is your email address?", type: "email", required: true, autocomplete: "email" },
      { name: "phone", label: "What is your phone number?", type: "tel", required: true, autocomplete: "tel" },
      { name: "address", label: "What is your address?", type: "textarea", required: true },
      { name: "company", label: "What is the Company name?", type: "text", required: true, autocomplete: "organization" },
      { name: "taxId", label: "Tax Identification Number", type: "text", required: true },
      { name: "registrationNumber", label: "Company Registration Number", type: "text", required: true },
      {
        name: "basedInEu",
        label: "Are you based in the EU?",
        type: "radio",
        required: true,
        options: ["Yes", "No"],
        // the original authored this as checkboxes, so both could be ticked
      },
    ],
  },
];

// Shown above the submit button, verbatim.
const CONFIRMATIONS = [
  "You have provided accurate information about your AI agent.",
  "You have classified the agent according to the EU AI Act risk categories to the best of your knowledge.",
  "You understand that, depending on your classification, your agent may be subject to additional obligations (e.g. for High-Risk systems).",
  "You take full responsibility for the compliance of your agent with applicable laws and regulations.",
];

// Every control gets a real <label for> — or a <legend>, for the choice
// groups, since one label cannot name several inputs. The surrounding hints
// are attached with aria-describedby instead of being left as loose text.
// Before this, 15 of the 24 controls announced as "edit text, blank".
function field(f, v) {
  const id = `f-${f.name}`;
  const val = attr(v[f.name] || "");
  const req = f.required ? " required" : "";
  const auto = f.autocomplete ? ` autocomplete="${f.autocomplete}"` : "";
  // `noI18n` fields render in English on every locale (see the file header)
  const tr = (s, vars) => (f.noI18n ? s : t(s, vars));
  const labelText = `${esc(tr(f.label))}${f.required ? "" : ` <em class="opt">${esc(t("optional"))}</em>`}`;

  const before = [];
  const after = [];
  if (f.intro) before.push(`<span class="field-hint" id="${id}-intro">${esc(tr(f.intro))}</span>`);
  if (f.bullets)
    before.push(
      `<ul class="field-bullets" id="${id}-list">${f.bullets.map((b) => `<li>${esc(tr(b))}</li>`).join("")}</ul>`,
    );
  if (f.help) after.push(`<span class="field-hint" id="${id}-help">${tr(f.help, f.helpVars)}</span>`);
  if (f.after)
    after.push(`<span class="field-hint" id="${id}-after">${esc(f.afterEn ? f.after : tr(f.after))}</span>`);
  // an English-only field needs to say so on the German page, or it reads as
  // a bug rather than a deliberate choice
  if (f.noI18n && i18n.locale() === "de")
    before.unshift(`<span class="field-hint">${esc(t("This section is in English."))}</span>`);

  const describedIds = [
    f.intro && `${id}-intro`,
    f.bullets && `${id}-list`,
    f.help && `${id}-help`,
    f.after && `${id}-after`,
  ].filter(Boolean);
  const describedBy = describedIds.length ? ` aria-describedby="${describedIds.join(" ")}"` : "";

  if (f.type === "checkboxes" || f.type === "radio") {
    const kind = f.type === "radio" ? "radio" : "checkbox";
    const picked = String(v[f.name] || "").split("|");
    return `<fieldset class="field"${describedBy}>
      <legend class="field-label">${labelText}</legend>
      ${before.join("")}
      <div class="choice-set">${f.options
        .map(
          (o, i) =>
            `<label class="choice"><input type="${kind}" name="${f.name}" id="${id}-${i}" value="${attr(o)}"${
              picked.includes(o) ? " checked" : ""
            }${f.type === "radio" && f.required ? " required" : ""} /><span>${esc(tr(o))}</span></label>`,
        )
        .join("")}</div>
      ${after.join("")}
    </fieldset>`;
  }

  const input =
    f.type === "textarea"
      ? `<textarea name="${f.name}" id="${id}" rows="${f.rows || 4}"${req}${describedBy}>${esc(v[f.name] || "")}</textarea>`
      : `<input name="${f.name}" id="${id}" type="${f.type}"${req}${auto}${describedBy} value="${val}" />`;

  return `<div class="field">
    <label class="field-label" for="${id}">${labelText}</label>
    ${before.join("")}
    ${input}
    ${after.join("")}
  </div>`;
}

// The "Still missing: A, B." message is assembled in lib/leads.js from the
// field labels, so it arrives here as one finished sentence. Take it apart,
// translate the parts, put it back together: on English every piece is the
// identity, so the string comes out exactly as it went in.
function errorText(msg) {
  const m = /^Still missing: (.*)\.$/.exec(msg);
  if (!m) return t(msg);
  return t("Still missing: {fields}.", { fields: m[1].split(", ").map((s) => t(s)).join(", ") });
}

function form(values, error) {
  const v = values || {};
  return `<form class="lead-form list-form" method="post" action="/api/agent-listing" data-reveal>
    ${error ? `<p class="form-error" role="alert">${esc(errorText(error))}</p>` : ""}
    ${SECTIONS.map(
      (sec) => `<fieldset class="form-section">
        <legend>${esc(t(sec.heading))}</legend>
        ${sec.intro ? `<p class="form-section-intro">${esc(t(sec.intro))}</p>` : ""}
        ${sec.fields.map((f) => field(f, v)).join("")}
      </fieldset>`,
    ).join("")}

    <div class="form-confirm">
      ${
        i18n.locale() === "de" ? `<p class="field-hint">${esc(t("This section is in English."))}</p>\n      ` : ""
      }<p class="field-label">With the submission of this form, you confirm that:</p>
      <ul>${CONFIRMATIONS.map((c) => `<li>${icon("check", 14)}<span>${esc(c)}</span></li>`).join("")}</ul>
    </div>

    <div class="hp" aria-hidden="true"><label>Website<input name="website" type="text" tabindex="-1" autocomplete="off" /></label></div>

    <div class="form-actions">
      <button class="btn btn-primary btn-lg" type="submit">${esc(t("Submit"))}</button>
      <span class="form-note">${esc(t("Goes to {email}. We come back to you about the listing.", { email: leads.SUPPORT_TO }))}</span>
    </div>
  </form>`;
}

function sentState() {
  return `<div class="notice" data-reveal data-analytics="generate_lead" data-analytics-on="load" data-analytics-form-name="agent_listing">
    <span class="eyebrow">${esc(t("Submission received"))}</span>
    <h1>${esc(t("Thanks — your agent is with the team."))}</h1>
    <p>${esc(t("We will review the listing and come back to you. If you need to add anything, reply to the confirmation or write to"))} <a href="mailto:${attr(leads.SUPPORT_TO)}">${esc(leads.SUPPORT_TO)}</a>.</p>
    <div class="form-actions" style="margin-top:8px">
      <a class="btn btn-primary" href="/ai-coworkers">${esc(t("See who is already listed"))}</a>
      <a class="btn btn-outline" href="${MASUMI_DOCS}" target="_blank" rel="noreferrer">${esc(t("Masumi docs"))} ${icon("arrow-up-right", 14)}</a>
    </div>
  </div>`;
}

async function render(ctx) {
  const q = ctx.query || {};
  const get = (k) => (typeof q.get === "function" ? q.get(k) : q[k]) || "";
  const sent = get("sent") === "1";
  const error = get("error");

  const values = {};
  for (const sec of SECTIONS) for (const f of sec.fields) values[f.name] = get(f.name);

  const cr = [{ label: "Home", href: "/" }, { label: "List your agent" }];
  return (
    pageStart({
      title: "List your agent | Sokosumi",
      description:
        "Submit your agent for listing on the Sokosumi marketplace: deployment checklist, description, EU AI Act classification, and your company details.",
      path: "/list-your-agent",
      breadcrumb: cr,
    }) +
    (sent
      ? sentState()
      : `<div class="page-head" data-reveal>
        <span class="eyebrow">${esc(t("For vendors"))}</span>
        <h1>${esc(t("Sokosumi Agent Listing"))}</h1>
        <p class="sub">${esc(t("Welcome! You’re one step away from getting your Agent featured on Sokosumi. Fill out this form to help us understand your Agent and get it ready for launch. If you need any help along the way, just let us know!"))}</p>
      </div>
      <section class="page-section flush">${form(values, error)}</section>`) +
    shell.logoRow() +
    shell.ctaBand({
      heading: t("Not built it yet?"),
      subheading: t("Build your agent in any framework, deploy it on Masumi, and it can be listed here."),
      ctaLabel: t("Read the Masumi docs"),
      ctaHref: MASUMI_DOCS,
      seed: 17,
    }) +
    pageEnd()
  );
}

module.exports = { render, SECTIONS };
