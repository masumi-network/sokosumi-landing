// /support — where someone already using Sokosumi goes when something is
// wrong. Distinct from /contact, which routes new enquiries: this page is
// about getting an existing problem resolved.
//
// Everything here is either a route on this site, a real product surface, or
// the support address the contact page already uses. Nothing invents an SLA,
// a phone line, or a status page that does not exist.

const shell = require("./shell");
const leads = require("../lib/leads");
const { t } = require("../lib/i18n");
const { esc, attr, icon, pageStart, pageEnd, APP, SALES_URL, SUPPORT_URL } = shell;

const DEV_DOCS = "https://www.masumi.network/dev/sokosumi/documentation";

const SUPPORT_MAILTO = `mailto:${leads.SUPPORT_TO}?subject=Sokosumi%20Support`;

// What to include so the first reply can be an answer rather than a question.
const INCLUDE = [
  "The link to the task or job, if it is about a specific run",
  "What you expected to get back, and what you actually got",
  "The account or workspace you are working in",
  "A screenshot, if it is something you can see",
];

const SELF_SERVE = [
  {
    href: DEV_DOCS,
    title: "Developer documentation",
    text: "Building on Sokosumi, or listing your own agent? The API reference and integration guides live in the Masumi dev hub.",
    go: "Open the docs",
    external: true,
  },
  {
    href: "/guides",
    title: "Guides",
    text: "How to brief a coworker, what a good task looks like, and the workflows that get the most out of them.",
    go: "Read the guides",
  },
  {
    href: "/pricing",
    title: "Plans and credits",
    text: "What each plan includes, how credits per seat work, and what happens when a task does not complete.",
    go: "See pricing",
  },
  {
    href: "/releases",
    title: "Releases",
    text: "What changed and when. If something behaves differently than it did last week, start here.",
    go: "Read the release notes",
  },
  {
    href: "/tasks",
    title: "Template tasks",
    text: "Every task shows its brief and its deliverable; most include a real sample output before you run it.",
    go: "Browse template tasks",
  },
];

function field(label, inner, hint) {
  return `<label class="field">
    <span class="field-label">${esc(label)}</span>
    ${inner}
    ${hint ? `<span class="field-hint">${esc(hint)}</span>` : ""}
  </label>`;
}

// Plain form POST to /api/support-request, which redirects back with ?sent=1
// or ?error= — so it works with JavaScript disabled, like the sales form.
function supportForm(values, error) {
  const v = values || {};
  const val = (k) => attr(v[k] || "");
  return `<form class="lead-form" method="post" action="/api/support-request" data-reveal>
    ${error ? `<p class="form-error" role="alert">${esc(t(error))}</p>` : ""}

    <div class="field-row">
      ${field(t("Your name"), `<input name="name" type="text" required autocomplete="name" value="${val("name")}" />`)}
      ${field(t("Email"), `<input name="email" type="email" required autocomplete="email" value="${val("email")}" />`)}
    </div>

    ${field(
      t("Task or job link"),
      `<input name="taskLink" type="text" value="${val("taskLink")}" placeholder="https://app.sokosumi.com/…" />`,
      t("Optional, but it is the fastest way for us to see what you saw."),
    )}

    ${field(
      t("What happened?"),
      `<textarea name="message" rows="6" required placeholder="${attr(t("What you expected, what you got instead, and anything you already tried."))}">${esc(v.message || "")}</textarea>`,
    )}

    <div class="hp" aria-hidden="true"><label>Website<input name="website" type="text" tabindex="-1" autocomplete="off" /></label></div>

    <div class="form-actions">
      <button class="btn btn-primary btn-lg" type="submit">${esc(t("Send to support"))}</button>
      <span class="form-note">${esc(t("Goes straight to {email}. We reply within one working day.", { email: leads.SUPPORT_TO }))}</span>
    </div>
  </form>`;
}

function sentState() {
  return `<div class="notice" data-reveal data-analytics="generate_lead" data-analytics-on="load" data-analytics-form-name="support_request">
    <span class="eyebrow">${esc(t("Request received"))}</span>
    <h1>${esc(t("Thanks — that is with support."))}</h1>
    <p>${esc(t("We have it and will come back to you within one working day. If it is urgent, write to"))} <a href="mailto:${attr(leads.SUPPORT_TO)}">${esc(leads.SUPPORT_TO)}</a> ${esc(t("and it reaches the same inbox."))}</p>
    <div class="form-actions" style="margin-top:8px">
      <a class="btn btn-primary" href="${APP}">${esc(t("Open the app"))}</a>
      <a class="btn btn-outline" href="/guides">${esc(t("Read the guides"))}</a>
    </div>
  </div>`;
}

function row(item) {
  const ext = item.external ? ' target="_blank" rel="noreferrer"' : "";
  return `<a class="row-item" href="${attr(item.href)}"${ext}>
    <h3>${esc(t(item.title))}</h3>
    <p>${esc(t(item.text))}</p>
    <span class="row-go">${esc(t(item.go))} ${icon("arrow-up-right", 15)}</span>
  </a>`;
}

async function render(ctx) {
  const q = ctx.query || {};
  const get = (k) => (typeof q.get === "function" ? q.get(k) : q[k]) || "";
  const sent = get("sent") === "1";
  const error = get("error");

  const cr = [{ label: "Home", href: "/" }, { label: "Contact", href: "/contact" }, { label: "Support" }];
  return (
    pageStart({
      title: "Support | Sokosumi",
      description:
        "Get help with Sokosumi: email product support, find the guides and release notes, or reach sales about a plan.",
      path: shell.SUPPORT_URL,
      breadcrumb: cr,
      jsonld: {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Sokosumi support",
        description: "Product support for people already working with an AI coworker on Sokosumi.",
        url: `${shell.SITE}${shell.SUPPORT_URL}`,
      },
    }) +
    (sent
      ? sentState()
      : `<div class="page-head" data-reveal>
      <span class="eyebrow">${esc(t("Support"))}</span>
      <h1>${esc(t("Something not working?"))}</h1>
      <p class="sub">${esc(t("Tell us what happened and we will get back to you. If you are still deciding whether Sokosumi is right for your team,"))} <a href="${attr(SALES_URL)}" style="text-decoration:underline">${esc(t("talk to sales"))}</a>${esc(t(" instead."))}</p>
    </div>

    <section class="page-section flush">
      <div class="lead-layout">
        ${supportForm(
          { name: get("name"), email: get("email"), taskLink: get("taskLink"), message: get("message") },
          error,
        )}
        <aside class="lead-aside" data-reveal style="--i:1">
          <h2 class="section-title" style="font-size:20px">${esc(t("What to include"))}</h2>
          <ul class="lead-list">
            ${INCLUDE.map((line) => `<li>${icon("check", 15)}<span>${esc(t(line))}</span></li>`).join("")}
          </ul>
          <div class="lead-aside-foot">
            <p class="muted">${esc(t("Prefer your own mail client?"))}</p>
            <a class="row-go" href="${SUPPORT_MAILTO}">${esc(leads.SUPPORT_TO)} ${icon("arrow-up-right", 15)}</a>
          </div>
        </aside>
      </div>
    </section>`) +
    `<section class="page-section" data-reveal>
      <h2>${esc(t("Answer it yourself, faster"))}</h2>
      <p class="sub">${esc(t("Most of what people write in about is already written down."))}</p>
      <div class="row-list">${SELF_SERVE.map(row).join("")}</div>
    </section>` +
    shell.ctaBand({
      heading: t("Not a support question?"),
      subheading: t("Rolling Sokosumi out to a team, or listing your own coworkers as a vendor — that one is for sales."),
      ctaLabel: t("Talk to Sales"),
      ctaHref: SALES_URL,
      seed: 11,
    }) +
    pageEnd()
  );
}

module.exports = { render };
