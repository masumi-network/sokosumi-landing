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

// The SEO Analyzer scores what a page shows up as in search, so the preview
// is the search snippet itself, plus a Lighthouse-style score ring — the way
// the OG checker draws the social card it's actually grading.
const seoMdPreview = () => `
  <span class="tp tp-seo">
    <span class="tp-serp">
      <span class="tp-serp-url">sokosumi.com<i>›</i>product</span>
      <span class="tp-serp-title">AI Coworkers for your marketing team</span>
      <span class="tp-serp-desc">Hire AI coworkers and run template marketing tasks in one place.</span>
    </span>
    <span class="tp-verdict">
      <span class="tp-gauge" style="--score:92"><b>92</b></span>
      <span class="tp-chip is-pass">14 passing</span>
      <span class="tp-chip is-warn">3 warnings</span>
    </span>
  </span>`;

// The LinkedIn post checker scores a LinkedIn post, so the preview is a
// miniature of that post itself, the way the OG checker draws its card.
const postCheckerPreview = () => `
  <span class="tp tp-psc">
    <span class="tp-post">
      <span class="tp-post-head">
        <span class="tp-avatar"></span>
        <span class="tp-post-name"><b>Jordan Reyes</b><i>Marketing Lead</i></span>
      </span>
      <span class="tp-post-body">Most SaaS teams ship a feature and hope someone notices.</span>
      <span class="tp-post-foot"><span>👍 248</span><span>💬 37</span></span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">84/100 overall</span>
    </span>
  </span>`;

// The robots.txt generator hands back a text file, the same shape as the
// llms.txt checker's file card — a genuine match, since both are files a
// crawler reads, rather than a reused shortcut.
const robotsGeneratorPreview = () => `
  <span class="tp tp-rg">
    <span class="tp-file">
      <span class="tp-file-name">robots.txt</span>
      <span class="tp-file-line"><b>User-agent</b><i>*</i></span>
      <span class="tp-file-line"><b>Disallow</b><i>/admin/</i></span>
      <span class="tp-file-line is-quote">User-agent: GPTBot</span>
      <span class="tp-file-line"><b>Disallow</b><i>/</i></span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-warn">3 bots blocked</span>
    </span>
  </span>`;

// The landing page copy analyzer scores pasted copy, so the preview reuses
// the headline analyzer's pull-quote-plus-gauge device on a longer line.
const landingCopyPreview = () => `
  <span class="tp tp-ha">
    <span class="tp-headline">
      <span class="tp-headline-text">You'll cut campaign setup time in half — start your free trial today.</span>
    </span>
    <span class="tp-verdict">
      <span class="tp-gauge" style="--score:81"><b>81</b></span>
      <span class="tp-chip is-pass">3 passing</span>
      <span class="tp-chip is-warn">1 warning</span>
    </span>
  </span>`;

// The X algorithm analyzer scores a short post, so the preview borrows the
// LinkedIn post checker's post mockup, sized like a single-line tweet.
const xAlgorithmPreview = () => `
  <span class="tp tp-psc">
    <span class="tp-post">
      <span class="tp-post-head">
        <span class="tp-avatar"></span>
        <span class="tp-post-name"><b>@jordanreyes</b><i>X post</i></span>
      </span>
      <span class="tp-post-body">What's the most tedious part of your campaign setup — curious what everyone else is stuck doing manually.</span>
      <span class="tp-post-foot"><span>💬 61</span><span>🔁 12</span></span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">86/100 overall</span>
    </span>
  </span>`;

// The conversion teardown returns a site card plus a verdict, matching the
// OG checker's device since both grade a page rather than a text snippet.
const landingTeardownPreview = () => `
  <span class="tp tp-og">
    <span class="tp-card">
      <span class="tp-shot"><span class="tp-pill">example.com/landing</span></span>
      <span class="tp-meta">
        <span class="tp-host">CONVERSION TEARDOWN</span>
        <span class="tp-title">Headline, CTA, proof, trust</span>
        <span class="tp-desc">Four dimensions checked against the page's own markup.</span>
      </span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">2 passing</span>
      <span class="tp-chip is-warn">2 warnings</span>
    </span>
  </span>`;

// The positioning teardown compares two sites, so the preview is two mini
// site cards facing off, the same address-bar device the UTM builder uses.
const competitorPositioningPreview = () => `
  <span class="tp tp-ub">
    <span class="tp-urlbar">
      <span class="tp-urlbar-dot"></span>
      <span class="tp-urlbar-text">yoursite.com <b>vs</b> competitor.com</span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-warn">3 gaps found</span>
      <span class="tp-chip is-pass">2 you're ahead on</span>
    </span>
  </span>`;

// The internal linking finder maps which pages should link to each other, so
// the preview is a small node graph with the suggested links dashed in.
const internalLinkingPreview = () => `
  <span class="tp tp-graph">
    <span class="tp-graph-stage">
      <svg viewBox="0 0 220 120" class="tp-graph-svg" preserveAspectRatio="xMidYMid meet">
        <line x1="42" y1="34" x2="110" y2="62"/>
        <line x1="110" y1="62" x2="182" y2="36"/>
        <line x1="110" y1="62" x2="74" y2="102"/>
        <line class="is-suggest" x1="42" y1="34" x2="182" y2="36"/>
        <line class="is-suggest" x1="74" y1="102" x2="182" y2="36"/>
        <circle cx="42" cy="34" r="9"/>
        <circle cx="110" cy="62" r="11"/>
        <circle cx="182" cy="36" r="9"/>
        <circle cx="74" cy="102" r="9"/>
      </svg>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">4 link opportunities</span>
    </span>
  </span>`;

// The keyword extractor ranks a page's own words, so the preview is a tag
// cloud sized by frequency — the shape of the output itself.
const keywordExtractorPreview = () => `
  <span class="tp tp-tags">
    <span class="tp-tagcloud">
      <span class="tp-tag" style="--s:1.35">onboarding<i>24</i></span>
      <span class="tp-tag" style="--s:1.15">marketing team<i>18</i></span>
      <span class="tp-tag" style="--s:1">automation<i>12</i></span>
      <span class="tp-tag" style="--s:.9">workflow<i>9</i></span>
      <span class="tp-tag" style="--s:.8">agents<i>6</i></span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">Nothing leaves your browser</span>
    </span>
  </span>`;

// The orphan finder shows pages nothing links to, so the preview is a linked
// cluster with one lonely node stranded off to the side.
const orphanPageFinderPreview = () => `
  <span class="tp tp-graph">
    <span class="tp-graph-stage">
      <svg viewBox="0 0 220 120" class="tp-graph-svg" preserveAspectRatio="xMidYMid meet">
        <line x1="46" y1="44" x2="96" y2="72"/>
        <line x1="96" y1="72" x2="140" y2="46"/>
        <line x1="96" y1="72" x2="128" y2="100"/>
        <circle cx="46" cy="44" r="9"/>
        <circle cx="96" cy="72" r="10"/>
        <circle cx="140" cy="46" r="9"/>
        <circle cx="128" cy="100" r="9"/>
        <circle class="is-orphan" cx="192" cy="36" r="10"/>
      </svg>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-warn">2 orphans</span>
    </span>
  </span>`;

// Core Web Vitals are three measured signals, so the preview is three labelled
// bars — LCP, CLS, INP — not another search snippet.
const coreWebVitalsPreview = () => `
  <span class="tp tp-vitals">
    <span class="tp-vitalbox">
      <span class="tp-vital"><b>LCP</b><span class="tp-vital-bar"><i class="is-warn" style="width:60%"></i></span><em>2.8s</em></span>
      <span class="tp-vital"><b>CLS</b><span class="tp-vital-bar"><i class="is-pass" style="width:88%"></i></span><em>0.04</em></span>
      <span class="tp-vital"><b>INP</b><span class="tp-vital-bar"><i class="is-warn" style="width:52%"></i></span><em>210ms</em></span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-warn">2 need work</span>
    </span>
  </span>`;

// The AI-search checker reports which AI crawlers you allow or block, so the
// preview is a bot allow/block list with a visibility score.
const aiSearchVisibilityPreview = () => `
  <span class="tp tp-bots">
    <span class="tp-botlist">
      <span class="tp-bot"><span class="tp-bot-face"></span><b>GPTBot</b><span class="tp-bot-ok">allowed</span></span>
      <span class="tp-bot"><span class="tp-bot-face"></span><b>ClaudeBot</b><span class="tp-bot-ok">allowed</span></span>
      <span class="tp-bot"><span class="tp-bot-face"></span><b>CCBot</b><span class="tp-bot-no">blocked</span></span>
    </span>
    <span class="tp-verdict">
      <span class="tp-gauge" style="--score:67"><b>67</b></span>
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
    href: "/tools/website-analyzer",
    name: "Website Analyzer",
    text: "Turn any website into an AI-readable SEO specification.",
    meta: "Free · no sign-up",
    preview: seoMdPreview,
  },
  {
    href: "/tools/linkedin-post-checker",
    name: "LinkedIn post checker",
    text: "Score a post's hook, CTA and formatting before you publish.",
    meta: "Free · no sign-up",
    preview: postCheckerPreview,
  },
  {
    href: "/tools/robots-txt-generator",
    name: "Robots.txt Generator",
    text: "Custom crawl rules, plus a one-click checklist to block AI-training bots.",
    meta: "Free · no sign-up",
    preview: robotsGeneratorPreview,
  },
  {
    href: "/tools/landing-page-copy-analyzer",
    name: "Landing Page Copy Analyzer",
    text: "Score your hero copy or full page on clarity, benefit focus, specificity and CTA strength.",
    meta: "Free · no sign-up",
    preview: landingCopyPreview,
  },
  {
    href: "/tools/x-algorithm-analyzer",
    name: "X Algorithm Analyzer",
    text: "Score a post against X's own open-sourced ranking signals before you post it.",
    meta: "Free · no sign-up",
    preview: xAlgorithmPreview,
  },
  {
    href: "/tools/landing-page-teardown",
    name: "Landing Page Conversion Teardown",
    text: "Enter a URL and audit its headline, CTA, social proof and trust signals.",
    meta: "Free · no sign-up",
    preview: landingTeardownPreview,
  },
  {
    href: "/tools/competitor-positioning",
    name: "Competitor Positioning Teardown",
    text: "Enter two URLs and see the loopholes each page leaves open against the other.",
    meta: "Free · no sign-up",
    preview: competitorPositioningPreview,
  },
  {
    href: "/tools/internal-linking-finder",
    name: "Internal Linking Opportunity Finder",
    text: "Crawl up to 12 pages and find ones that should link to each other, with anchor text suggestions.",
    meta: "Free · no sign-up",
    preview: internalLinkingPreview,
  },
  {
    href: "/tools/keyword-extractor",
    name: "Keyword Extractor",
    text: "Paste an article and get its most frequent keywords and phrases, ranked by count.",
    meta: "Free · no sign-up",
    preview: keywordExtractorPreview,
  },
  {
    href: "/tools/re-engagement-builder",
    name: "Re-engagement Campaign Builder",
    text: "Paste an old email and get a 3-part re-engagement sequence with subject lines.",
    meta: "Free · no sign-up",
    preview: () => `
      <span class="tp tp-lt">
        <span class="tp-file">
          <span class="tp-file-name">Sequence</span>
          <span class="tp-file-line"><b>Day 1</b><i>Still thinking about…</i></span>
          <span class="tp-file-line"><b>Day 8</b><i>Should we close…</i></span>
        </span>
        <span class="tp-verdict">
          <span class="tp-chip is-pass">Nothing leaves your browser</span>
        </span>
      </span>`,
  },
  {
    href: "/tools/csv-dashboard",
    name: "CSV to Instant Dashboard",
    text: "Upload a CSV and get stat tiles, a bar chart and a time-series chart, in your browser.",
    meta: "Free · no sign-up",
    preview: () => `
      <span class="tp tp-ic">
        <span class="tp-bars">
          <span class="tp-bar">
            <span class="tp-bar-label">Region A</span>
            <span class="tp-bar-track"><i style="width:80%"></i></span>
            <span class="tp-bar-size">1,204</span>
          </span>
          <span class="tp-bar is-after">
            <span class="tp-bar-label">Region B</span>
            <span class="tp-bar-track"><i style="width:45%"></i></span>
            <span class="tp-bar-size">690</span>
          </span>
        </span>
        <span class="tp-verdict">
          <span class="tp-chip is-pass">Nothing leaves your browser</span>
        </span>
      </span>`,
  },
  {
    href: "/tools/orphan-pages",
    name: "Orphan Page Finder",
    text: "Find sitemap pages that no other page on the site actually links to.",
    meta: "Free · no sign-up",
    preview: orphanPageFinderPreview,
  },
  {
    href: "/tools/core-web-vitals",
    name: "Core Web Vitals Explainer",
    text: "Plain-English fixes for structural signals tied to LCP, CLS and INP. Not real CrUX data.",
    meta: "Free · no sign-up",
    preview: coreWebVitalsPreview,
  },
  {
    href: "/tools/ai-search-visibility",
    name: "AI Search Visibility Checker",
    text: "Check whether AI crawlers are blocked and your brand is set up to be disambiguated. Not a live AI search measurement.",
    meta: "Free · no sign-up",
    preview: aiSearchVisibilityPreview,
  },
];

// Filter-tab categories. Order here is the order the tabs render in.
const TOOL_CATEGORIES = ["SEO", "Content", "Conversion", "Dev & Data"];
const CATEGORY_BY_HREF = {
  "/tools/llms-txt": "SEO",
  "/tools/website-analyzer": "SEO",
  "/tools/robots-txt-generator": "SEO",
  "/tools/internal-linking-finder": "SEO",
  "/tools/orphan-pages": "SEO",
  "/tools/core-web-vitals": "SEO",
  "/tools/ai-search-visibility": "SEO",
  "/tools/keyword-extractor": "SEO",
  "/tools/linkedin-post-checker": "Content",
  "/tools/x-algorithm-analyzer": "Content",
  "/tools/re-engagement-builder": "Content",
  "/tools/landing-page-copy-analyzer": "Conversion",
  "/tools/landing-page-teardown": "Conversion",
  "/tools/competitor-positioning": "Conversion",
  "/tools/og-checker": "Conversion",
  "/tools/design-md": "Dev & Data",
  "/tools/csv-dashboard": "Dev & Data",
};
const toolCat = (t) => CATEGORY_BY_HREF[t.href] || "Other";

function toolCard(t) {
  const hay = `${t.name} ${t.text} ${t.meta || ""}`.toLowerCase();
  return `<a class="card tool-card" href="${attr(t.href)}" data-search="${attr(hay)}" data-cat="${attr(toolCat(t))}">
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
      <div class="tools-controls">
        <div class="tools-search">
          <svg class="tools-search-ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" id="toolsSearch" class="tools-search-input" placeholder="Search tools…" aria-label="Search tools" autocomplete="off" spellcheck="false" />
        </div>
        <div class="tools-tabs" id="toolsTabs" role="tablist" aria-label="Filter tools by category">
          <button class="tools-tab is-active" type="button" data-cat="" role="tab" aria-selected="true">All</button>
          ${TOOL_CATEGORIES.map(
            (c) => `<button class="tools-tab" type="button" data-cat="${attr(c)}" role="tab" aria-selected="false">${esc(c)}</button>`,
          ).join("")}
        </div>
      </div>
      <div class="${shell.gridCls(TOOLS.length)} tools-list">${TOOLS.map(toolCard).join("")}</div>
      <p class="tools-search-empty" id="toolsSearchEmpty" hidden>No tools match your search.</p>
    </section>` +
    shell.ctaBand({
      heading: "Give a coworker a task.",
      subheading: "The tools are free. The coworkers turn a brief into a finished file.",
      ctaLabel: "Sign Up",
    }) +
    pageEnd({ englishOnly: true, scripts: ["/assets/tools-search.js"] })
  );
}

module.exports = { render };
