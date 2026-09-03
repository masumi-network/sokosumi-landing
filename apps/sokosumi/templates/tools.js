const shell = require("./shell");

const { esc, attr, icon, pageStart, pageEnd, SITE } = shell;

// Each card shows a miniature of what its tool actually hands back, drawn in
// CSS. The previous version gave both tools the same block of monospace lines
// on a dark panel, which told you nothing about either of them and made two
// unrelated tools look like the same product.

// The llms.txt checker returns a verdict on a file and on the links inside it,
// so the preview is the file's outline with the link tally.
const llmsPreview = () => `
  <span class="tp tp-lt">
    <span class="tp-file">
      <span class="tp-file-name">llms.txt</span>
      <span class="tp-file-line"><b>#</b> Sokosumi</span>
      <span class="tp-file-line is-quote">&gt; AI coworkers that turn a brief into a file.</span>
      <span class="tp-file-line"><b>##</b> Docs<i>6</i></span>
      <span class="tp-file-line"><b>##</b> Optional<i>4</i></span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">10 links OK</span>
      <span class="tp-chip is-warn">1 warning</span>
    </span>
  </span>`;

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

// The SEO.md generator returns a scored spec, so the preview is the file's
// summary lines with a score verdict — the same file/verdict pieces as the
// llms.txt preview, since both tools hand back a scored file.
const seoMdPreview = () => `
  <span class="tp tp-seo">
    <span class="tp-file">
      <span class="tp-file-name">SEO.md</span>
      <span class="tp-file-line"><b>score</b><i>92/100</i></span>
      <span class="tp-file-line"><b>title</b><i>54 chars</i></span>
      <span class="tp-file-line"><b>canonical</b><i>set</i></span>
      <span class="tp-file-line"><b>og:image</b><i>set</i></span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">14 passing</span>
      <span class="tp-chip is-warn">3 warnings</span>
    </span>
  </span>`;

// The Social post checker returns four dimension scores, so the preview is a
// mini scorecard: the dimensions as file-style lines, with an overall verdict
// — the same file/verdict pieces as the llms.txt and SEO.md previews.
const postCheckerPreview = () => `
  <span class="tp tp-psc">
    <span class="tp-file">
      <span class="tp-file-name">Post score</span>
      <span class="tp-file-line"><b>hook</b><i>82/100</i></span>
      <span class="tp-file-line"><b>CTA</b><i>90/100</i></span>
      <span class="tp-file-line"><b>engagement</b><i>75/100</i></span>
      <span class="tp-file-line"><b>timing</b><i>95/100</i></span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">84/100 overall</span>
    </span>
  </span>`;

// The image audit returns a list of flagged images, not a single score, so
// the preview is two rows of the report itself — a missing-alt row and a
// legacy-format row — the same file/verdict shape as the other checkers.
const imageAuditPreview = () => `
  <span class="tp tp-ia">
    <span class="tp-file">
      <span class="tp-file-name">Image audit</span>
      <span class="tp-file-line"><b>hero.jpg</b><i>no alt</i></span>
      <span class="tp-file-line"><b>banner.png</b><i>legacy</i></span>
      <span class="tp-file-line"><b>icon.svg</b><i>ok</i></span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-warn">6 missing alt</span>
      <span class="tp-chip is-warn">14 legacy</span>
    </span>
  </span>`;

const TOOLS = [
  {
    href: "/tools/llms-txt",
    name: "llms.txt checker",
    text: "Validate your llms.txt — and find the links inside it that no longer resolve.",
    meta: "Free · no sign-up",
    preview: llmsPreview,
  },
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
  {
    href: "/tools/seo-md",
    name: "SEO.md generator",
    text: "Turn any website into an AI-readable SEO specification.",
    meta: "Free · no sign-up",
    preview: seoMdPreview,
  },
  {
    href: "/tools/social-post-checker",
    name: "Social post checker",
    text: "Score a post's hook, CTA, formatting and timing before you publish.",
    meta: "Free · no sign-up",
    preview: postCheckerPreview,
  },
  {
    href: "/tools/image-audit",
    name: "Image audit",
    text: "Every image on your site missing alt text, and every one still in a legacy format.",
    meta: "Free · no sign-up",
    preview: imageAuditPreview,
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
