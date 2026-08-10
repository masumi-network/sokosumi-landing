// /support — where someone already using Sokosumi goes when something is
// wrong. Distinct from /contact, which routes new enquiries: this page is
// about getting an existing problem resolved.
//
// Everything here is either a route on this site, a real product surface, or
// the support address the contact page already uses. Nothing invents an SLA,
// a phone line, or a status page that does not exist.

const shell = require("./shell");
const { esc, attr, icon, pageStart, pageEnd, APP, SALES_URL } = shell;

const SUPPORT_MAILTO = "mailto:support@serviceplan-agents.com?subject=Sokosumi%20Support";

// What to include so the first reply can be an answer rather than a question.
const INCLUDE = [
  "The link to the task or job, if it is about a specific run",
  "What you expected to get back, and what you actually got",
  "The account or workspace you are working in",
  "A screenshot, if it is something you can see",
];

const SELF_SERVE = [
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
    text: "Every task shows its brief, its deliverable, and a real sample output before you run it.",
    go: "Browse template tasks",
  },
];

function row(item) {
  return `<a class="row-item" href="${attr(item.href)}">
    <h3>${esc(item.title)}</h3>
    <p>${esc(item.text)}</p>
    <span class="row-go">${esc(item.go)} ${icon("arrow-up-right", 15)}</span>
  </a>`;
}

async function render(ctx) {
  const cr = [{ label: "Home", href: "/" }, { label: "Support" }];
  return (
    pageStart({
      title: "Support | Sokosumi",
      description:
        "Get help with Sokosumi: email product support, find the guides and release notes, or reach sales about a plan.",
      path: "/support",
      breadcrumb: cr,
      jsonld: {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Sokosumi support",
        description: "Product support for people already working with an AI coworker on Sokosumi.",
        url: `${shell.SITE}/support`,
      },
    }) +
    `<div class="page-head" data-reveal>
      <span class="eyebrow">Support</span>
      <h1>Something not working?</h1>
      <p class="sub">Tell us what happened and we will get back to you. If you are still deciding whether Sokosumi is right for your team, <a href="${attr(SALES_URL)}" style="text-decoration:underline">talk to sales</a> instead.</p>
    </div>

    <section class="page-section flush" data-reveal>
      <div class="card-grid cols-2">
        <div class="card">
          <h3>Email product support</h3>
          <p>Account questions, credits, or a task that did not go the way you expected. This reaches the people who work on the product.</p>
          <div style="margin-top:auto;padding-top:10px">
            <a class="btn btn-primary" href="${SUPPORT_MAILTO}">Email Support</a>
          </div>
        </div>
        <div class="card">
          <h3>Already signed in?</h3>
          <p>Most answers are one click away in the app: every task keeps its brief, its status, and its output, so you can see exactly where a run stopped.</p>
          <div style="margin-top:auto;padding-top:10px">
            <a class="btn btn-outline" href="${APP}">Open the app ${icon("arrow-up-right", 14)}</a>
          </div>
        </div>
      </div>
    </section>

    <section class="page-section" data-reveal>
      <div class="shot-split">
        <div class="copy">
          <h2>What to send us</h2>
          <p>The more of this you include, the more likely the first reply is an answer rather than a question back.</p>
        </div>
        <div class="blk-checklist">
          <ul>${INCLUDE.map((t) => `<li>${icon("check", 15)}<span>${esc(t)}</span></li>`).join("")}</ul>
        </div>
      </div>
    </section>

    <section class="page-section" data-reveal>
      <h2>Answer it yourself, faster</h2>
      <p class="sub">Most of what people write in about is already written down.</p>
      <div class="row-list">${SELF_SERVE.map(row).join("")}</div>
    </section>` +
    shell.ctaBand({
      heading: "Not a support question?",
      subheading: "Rolling Sokosumi out to a team, or listing your own coworkers as a vendor — that one is for sales.",
      ctaLabel: "Talk to Sales",
      ctaHref: SALES_URL,
      seed: 11,
    }) +
    pageEnd()
  );
}

module.exports = { render };
