const shell = require("./shell");

const { esc, attr, icon, pageStart, pageEnd, SITE } = shell;

// Each card shows a miniature of what its tool actually hands back, drawn in
// CSS. The previous version gave both tools the same block of monospace lines
// on a dark panel, which told you nothing about either of them and made two
// unrelated tools look like the same product.

// The OG checker returns a social card and a verdict, so the card is the card.
const ogPreview = () => `
  <span class="tp tp-og">
    <span class="tp-card">
      <span class="tp-shot"><span class="tp-pill">sokosumi.com</span></span>
      <span class="tp-meta">
        <span class="tp-host">SOKOSUMI.COM</span>
        <span class="tp-title">AI Coworkers for your marketing team</span>
        <span class="tp-desc">Hire AI coworkers and run template marketing tasks.</span>
      </span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">12 passing</span>
      <span class="tp-chip is-warn">2 warnings</span>
    </span>
  </span>`;

// The DESIGN.md generator returns a spec, so the preview is a spec sheet:
// the palette it pulled, the face it found, and one row of tokens.
// A ramp with one accent, which is what an extracted palette actually looks
// like. Five unrelated hues read as a colour picker, not as a brand.
const DM_SWATCHES = ["#0f1c25", "#2b5c78", "#7d8f9b", "#d9dee2", "#00a4fa"];

const designMdPreview = () => `
  <span class="tp tp-dm">
    <span class="tp-swatches">${DM_SWATCHES.map(
      (c) => `<span style="background:${attr(c)}"></span>`,
    ).join("")}</span>
    <span class="tp-type">
      <span class="tp-aa">Aa</span>
      <span class="tp-type-meta"><b>Inter</b><i>300 · 400 · 500</i></span>
    </span>
    <span class="tp-tokens">
      <span><b>radius</b>10px</span>
      <span><b>space</b>8px</span>
      <span><b>ratio</b>1.5</span>
    </span>
  </span>`;

const TOOLS = [
  {
    href: "/tools/og-checker",
    name: "Open Graph checker",
    text: "See how any link will look on Facebook, X, LinkedIn, WhatsApp, Slack and Discord.",
    meta: "Free · no sign-up",
    preview: ogPreview,
  },
  {
    href: "/tools/design-md",
    name: "DESIGN.md generator",
    text: "Turn any website into design context for AI coding agents.",
    meta: "Free · no sign-up",
    preview: designMdPreview,
  },
];

function toolCard(t) {
  return `<a class="card tool-card" href="${attr(t.href)}">
    <span class="tool-card-doc" aria-hidden="true">${t.preview()}</span>
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
