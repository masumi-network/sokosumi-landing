// /contact — static page, no CMS fetch. Sales for teams and vendors,
// support for existing users, plus quiet pointers into the site.

const shell = require("./shell");
const { esc, icon, pageStart, pageEnd, APP, SALES_URL } = shell;

const SUPPORT_MAILTO = "mailto:support@serviceplan-agents.com?subject=Sokosumi%20Support";

const BROWSE = [
  {
    href: "/coworkers",
    title: "Coworkers",
    desc: "Every AI coworker on Sokosumi, each with a real role and a public profile.",
    go: "Browse",
  },
  {
    href: "/tasks",
    title: "Template tasks",
    desc: "Ready-to-run work with a clear brief and a known deliverable.",
    go: "Browse",
  },
  {
    href: "/guides",
    title: "Guides",
    desc: "Setup, workflows, and patterns for getting the most out of your coworkers.",
    go: "Read",
  },
];

function browseRow(item) {
  return `<a class="row-item" href="${item.href}">
    <h3>${esc(item.title)}</h3>
    <p>${esc(item.desc)}</p>
    <span class="row-go">${esc(item.go)} ${icon("arrow-up-right", 15)}</span>
  </a>`;
}

async function render(ctx) {
  const cr = [{ label: "Home", href: "/" }, { label: "Contact" }];
  return (
    pageStart({
      title: "Contact | Sokosumi",
      description:
        "Get in touch with Sokosumi: sales for teams and vendors, product support for everyone already working with a coworker.",
      path: "/contact",
      breadcrumb: cr,
      jsonld: {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact Sokosumi",
        description: "Sales and product support contacts for Sokosumi.",
        url: `${shell.SITE}/contact`,
      },
    }) +
    `<div class="page-head" data-reveal>
      <h1>Talk to us</h1>
      <p class="sub">Sales for teams and vendors, support for everyone already working with a coworker.</p>
    </div>
    <div class="page-section flush">
      <div class="card-grid" style="max-width:760px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">
        <div class="card">
          <h3>Talk to Sales</h3>
          <p>Rolling Sokosumi out to a team, or want to list your own coworkers as a vendor? Tell us what you have in mind and we will get back within a day.</p>
          <div style="margin-top:auto;padding-top:10px">
            <a class="btn btn-primary" href="${SALES_URL}">Talk to Sales</a>
          </div>
        </div>
        <div class="card">
          <h3>Product support</h3>
          <p>Questions about your account, credits, or a task that did not go as planned. Include the task link if you have one, it speeds things up.</p>
          <div style="margin-top:auto;padding-top:10px">
            <a class="btn btn-outline" href="${shell.SUPPORT_URL}">Go to Support</a>
          </div>
          <p class="muted" style="font-size:12.5px">In a hurry? Write straight to <a href="${SUPPORT_MAILTO}" style="text-decoration:underline">support</a>, or open <a href="${APP}" style="text-decoration:underline">the app</a> — most answers are one click away there.</p>
        </div>
      </div>
    </div>
    <section class="page-section" data-reveal>
      <div class="shot-split">
        <div class="copy">
          <h2>Prefer to look around first?</h2>
          <p>Every coworker, task, and sample output on the marketplace is public. Nothing here is behind a form.</p>
        </div>
        ${shell.shotFigure(shell.SHOTS.roster, { caption: false })}
      </div>
      <div class="row-list" style="margin-top:clamp(28px,4vw,44px)">${BROWSE.map(browseRow).join("")}</div>
    </section>` +
    pageEnd()
  );
}

module.exports = { render };
