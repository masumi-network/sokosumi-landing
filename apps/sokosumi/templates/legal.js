// The six legal documents, ported verbatim from sokosumi.com.
//
// The text in content/legal.json is a mechanical extraction of the live
// Webflow pages — see content/extract-legal.py for how, and for the traps it
// avoids (the Terms ship two contracts in two tab panes, the DPA ships a stale
// hidden revision, two pages carry a German copy of every table). Nothing here
// is rewritten: this template only wraps it in the site's chrome.
//
// To refresh after Legal changes something upstream:
//   python3 content/extract-legal.py <dir with the downloaded pages>
// and copy the resulting legal.json over. The script fails loudly if a
// document comes out a different size than the source.

const shell = require("./shell");
const { t } = require("../lib/i18n");
const { esc, attr, icon, pageStart, pageEnd, SITE } = shell;

const DOCS = require("../content/legal.json");

// Route slug → the label the site uses. The document's own title comes from
// the source and is rendered as the h1.
const ORDER = [
  ["terms-of-service", "Terms of Service"],
  ["privacy-policy", "Privacy Policy"],
  ["cookie-policy", "Cookie Policy"],
  ["dpa", "DPA"],
  ["acceptable-use", "Acceptable Use"],
  ["imprint", "Imprint"],
];
const LABEL = Object.fromEntries(ORDER);
const SLUGS = ORDER.map(([s]) => s);

const BLURB = {
  "terms-of-service": "The agreement for using Sokosumi, and for selling agentic services on it.",
  "privacy-policy": "What personal data Sokosumi processes, why, and the rights you have over it.",
  "cookie-policy": "The cookies Sokosumi sets, what each one is for, and how to control them.",
  dpa: "Data processing agreements for the agents on the marketplace, one per agent.",
  "acceptable-use": "What agentic services on Sokosumi may and may not be used for.",
  imprint: "Company details and the legally responsible entity behind Sokosumi.",
};

function isLegal(slug) {
  return Object.prototype.hasOwnProperty.call(DOCS, slug);
}

// Every legal page carries the full set, so a reader who lands on one from a
// search result can reach the others without going back to the footer.
function related(current) {
  return `<nav class="legal-nav" aria-label="${attr(t("Legal documents"))}">
    ${SLUGS.map(
      (s) =>
        `<a href="/legal/${s}"${s === current ? ' aria-current="page"' : ""}>${esc(LABEL[s])}</a>`,
    ).join("")}
  </nav>`;
}

async function index(ctx) {
  const cr = [{ label: "Home", href: "/" }, { label: "Legal" }];
  return (
    pageStart({
      title: "Legal: terms, privacy, DPA and imprint | Sokosumi",
      description:
        "Terms of Service, Privacy Policy, Cookie Policy, data processing agreements, acceptable use, and the imprint for Sokosumi.",
      path: "/legal",
      breadcrumb: cr,
    }) +
    `<div class="page-head" data-reveal>
      <span class="eyebrow">${esc(t("Legal"))}</span>
      <h1>${esc(t("Terms, privacy and the small print"))}</h1>
      <p class="sub">${esc(t("The agreements that govern Sokosumi, published in full."))}</p>
    </div>
    <section class="page-section flush" data-reveal>
      <div class="row-list">
        ${SLUGS.map(
          (s) => `<a class="row-item" href="/legal/${s}">
          <h2>${esc(DOCS[s].title || LABEL[s])}</h2>
          <p>${esc(t(BLURB[s] || ""))}</p>
          <span class="row-go">${esc(t("Read"))} ${icon("arrow-up-right", 15)}</span>
        </a>`,
        ).join("")}
      </div>
    </section>` +
    pageEnd()
  );
}

// No data-reveal on the document body below: this article IS the page.
// Starting a whole legal document at opacity 0 means nothing is readable
// until the deferred site.js has run its observer, which reads as a slow
// load on a document people open to read immediately. Same reasoning as the
// .page-head exemption in assets/styles.css.
async function detail(ctx) {
  const slug = ctx.params.slug;
  if (!isLegal(slug)) return null;
  const doc = DOCS[slug];
  const title = doc.title || LABEL[slug];

  const cr = [
    { label: "Home", href: "/" },
    { label: "Legal", href: "/legal" },
    { label: LABEL[slug] },
  ];
  return (
    pageStart({
      title: `${title} | Sokosumi`,
      description: t(BLURB[slug] || `${title} for Sokosumi.`),
      path: `/legal/${slug}`,
      breadcrumb: cr,
    }) +
    `<div class="page-head" data-reveal>
      <span class="eyebrow">${esc(t("Legal"))}</span>
      <h1>${esc(title)}</h1>
      ${BLURB[slug] ? `<p class="sub">${esc(t(BLURB[slug]))}</p>` : ""}
    </div>
    ${related(slug)}
    <article class="page-section flush legal-doc">
      <div class="prose">${doc.html}</div>
    </article>` +
    pageEnd()
  );
}

module.exports = { index, detail, isLegal, SLUGS, LABEL };
