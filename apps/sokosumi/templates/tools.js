const shell = require("./shell");

const { esc, attr, icon, pageStart, pageEnd, SITE } = shell;

const TOOLS = [
  {
    href: "/tools/og-checker",
    name: "Open Graph checker",
    text: "See how any link will look on Facebook, X, LinkedIn, WhatsApp, Slack and Discord.",
    meta: "Free \u00b7 no sign-up",
    preview: ["og:title", "og:description", "og:image", "\u2014", "1200 \u00d7 630", "twitter:card", "summary_large_image"],
  },
  {
    href: "/tools/design-md",
    name: "DESIGN.md generator",
    text: "Turn any website into design context for AI coding agents.",
    meta: "Free · no sign-up",
    preview: ["DESIGN.md", "---", "colors: #2b5c78 · #0f0e0d", "type: Inter · 400 · 1.5", "components: buttons · cards", "---", "## Brand style"],
  },
];

function toolCard(t) {
  return `<a class="card tool-card" href="${attr(t.href)}">
    <span class="tool-card-doc" aria-hidden="true"><span class="tool-card-code">${t.preview.map((l) => `<span>${esc(l)}</span>`).join("")}</span></span>
    <span class="tool-card-copy">
      <span class="eyebrow">${esc(t.meta)}</span>
      <strong>${esc(t.name)}</strong>
      <span>${esc(t.text)}</span>
      <em>Open ${icon("arrow-up-right", 15)}</em>
    </span>
  </a>`;
}

function render() {
  const path = "/tools";
  return (
    pageStart({
      title: "Free tools | Sokosumi",
      description: "Free, no-sign-up tools from Sokosumi for marketing and design work, starting with the DESIGN.md generator that turns any website into design context for AI coding agents.",
      path,
      englishOnly: true,
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Free tools" }],
      mainClass: "tools-page",
      stylesheets: ["/assets/design-md.css"],
      jsonld: [{ "@type": "CollectionPage", "@id": `${SITE}${path}#page`, name: "Free tools", url: `${SITE}${path}` }],
      og: { type: "page", title: "Free tools", sub: "No account. No sign-up." },
    }) +
    // Same page furniture as /guides and /vendors: an eyebrow, a left-aligned
    // h1, a sub, then the collection. The old centred hero and floating card
    // were the only ones of their kind on the site.
    `<div class="page-head" data-reveal>
      <span class="eyebrow">Free tools</span>
      <h1>Tools you can use without an account</h1>
      <p class="sub">Small, single-purpose tools we built for our own marketing and design work. No sign-up, no credits, nothing to install.</p>
    </div>
    <section class="page-section flush" data-reveal aria-label="Tools">
      <div class="${shell.gridCls(TOOLS.length)} tools-list">${TOOLS.map(toolCard).join("")}</div>
    </section>` +
    shell.ctaBand({
      heading: "Give a coworker a task.",
      subheading: "The tools are free. The coworkers turn a brief into a finished file.",
      ctaLabel: "Sign Up",
    }) +
    pageEnd({ englishOnly: true })
  );
}

module.exports = { render };
