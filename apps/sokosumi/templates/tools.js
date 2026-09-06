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

// The Social post checker scores a LinkedIn-style post, so the preview is a
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

// The image audit returns a list of flagged images, so the preview is a mini
// contact sheet — three thumbnails carrying the flags the real list shows.
const imageAuditPreview = () => `
  <span class="tp tp-ia">
    <span class="tp-thumbs">
      <span class="tp-thumb is-flag"><i>no alt</i></span>
      <span class="tp-thumb is-flag"><i>legacy</i></span>
      <span class="tp-thumb is-ok"><i>ok</i></span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-warn">6 missing alt</span>
      <span class="tp-chip is-warn">14 legacy</span>
    </span>
  </span>`;

// The video script checker scores a short-form video script, so the preview
// is a vertical reel frame with a caption — the shape of the thing it's
// actually grading, the way the social post checker draws its post.
const videoScriptPreview = () => `
  <span class="tp tp-vsc">
    <span class="tp-reel">
      <span class="tp-reel-play" aria-hidden="true">▶</span>
      <span class="tp-reel-caption">"Nobody tells you this before your first launch."</span>
      <span class="tp-reel-bar"><i style="width:62%"></i></span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">83/100 overall</span>
    </span>
  </span>`;

// The image compressor's whole point is a smaller file, so the preview is a
// literal before/after size bar rather than a text readout of the same fact.
const imageCompressorPreview = () => `
  <span class="tp tp-ic">
    <span class="tp-bars">
      <span class="tp-bar">
        <span class="tp-bar-label">Before</span>
        <span class="tp-bar-track"><i style="width:100%"></i></span>
        <span class="tp-bar-size">4.8 MB</span>
      </span>
      <span class="tp-bar is-after">
        <span class="tp-bar-label">After</span>
        <span class="tp-bar-track"><i style="width:15%"></i></span>
        <span class="tp-bar-size">720 KB</span>
      </span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">85% smaller</span>
    </span>
  </span>`;

// The UTM builder appends query params to a URL, so the preview is the
// address bar itself with the tagged part picked out in the accent color.
const utmBuilderPreview = () => `
  <span class="tp tp-ub">
    <span class="tp-urlbar">
      <span class="tp-urlbar-dot"></span>
      <span class="tp-urlbar-text">example.com/page<b>?utm_source=newsletter&amp;utm_medium=email</b></span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">source</span>
      <span class="tp-chip is-pass">medium</span>
      <span class="tp-chip is-pass">campaign</span>
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

// The headline analyzer scores the headline itself, so the preview is the
// headline as a pull quote plus a Lighthouse-style score ring — the same
// gauge device the SEO Analyzer uses, since both hand back a single score.
const headlineCheckerPreview = () => `
  <span class="tp tp-ha">
    <span class="tp-headline">
      <span class="tp-headline-text">7 Free Marketing Tools That Cut Setup Time in Half</span>
    </span>
    <span class="tp-verdict">
      <span class="tp-gauge" style="--score:88"><b>88</b></span>
      <span class="tp-chip is-pass">3 passing</span>
      <span class="tp-chip is-warn">1 warning</span>
    </span>
  </span>`;

// The QR code generator's output is the code itself, so the preview is a
// decorative pattern in the same finder-corner shape as a real one.
const QR_PATTERN = [
  [1, 1, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 1, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0],
];
const qrCodeGeneratorPreview = () => `
  <span class="tp tp-qr">
    <span class="tp-qr-code">
      <span class="tp-qr-grid">${QR_PATTERN.flatMap((row) => row.map((cell) => `<i${cell ? ' class="is-on"' : ""}></i>`)).join("")}</span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">PNG</span>
      <span class="tp-chip is-pass">SVG</span>
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
// social post checker's post mockup, sized like a single-line tweet.
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

// The brand voice analyzer returns a spec, not a score, so the preview is a
// small tag cloud plus the top-line voice label it extracted.
const brandVoicePreview = () => `
  <span class="tp tp-lt">
    <span class="tp-file">
      <span class="tp-file-name">Voice spec</span>
      <span class="tp-file-line"><b>Voice</b><i>Reader-directed</i></span>
      <span class="tp-file-line"><b>Style</b><i>Short and punchy</i></span>
      <span class="tp-file-line is-quote">Ships, dashboard, onboarding, teams…</span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">8 posts read</span>
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

// The messaging comparison spans several sites, so the preview is a row of
// small tags — the shared-vs-unique vocabulary the real tool surfaces.
const competitorMessagingPreview = () => `
  <span class="tp tp-lt">
    <span class="tp-file">
      <span class="tp-file-name">Messaging comparison</span>
      <span class="tp-file-line"><b>Shared</b><i>onboarding, teams</i></span>
      <span class="tp-file-line is-quote">yoursite.com → "workflow"</span>
      <span class="tp-file-line is-quote">competitor.com → "enterprise"</span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">3 sites compared</span>
    </span>
  </span>`;

// The feature gap tool's output is a yes/no matrix, so the preview mimics
// that grid directly rather than borrowing another tool's device.
const competitorFeatureGapPreview = () => `
  <span class="tp tp-lt">
    <span class="tp-file">
      <span class="tp-file-name">Feature matrix</span>
      <span class="tp-file-line"><b>API access</b><i>✓ ✓ —</i></span>
      <span class="tp-file-line"><b>SSO</b><i>✓ — —</i></span>
      <span class="tp-file-line"><b>Free tier</b><i>— ✓ ✓</i></span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-warn">1 gap found</span>
    </span>
  </span>`;

// Answer-readiness scores the page itself, so the preview reuses the
// SEO analyzer's search-snippet-plus-gauge device.
const answerReadinessPreview = () => `
  <span class="tp tp-seo">
    <span class="tp-serp">
      <span class="tp-serp-url">example.com<i>›</i>guide</span>
      <span class="tp-serp-title">A clear H1, a table, three FAQ blocks</span>
      <span class="tp-serp-desc">Chunk-friendly paragraphs and JSON-LD, checked directly against the markup.</span>
    </span>
    <span class="tp-verdict">
      <span class="tp-gauge" style="--score:74"><b>74</b></span>
      <span class="tp-chip is-pass">3 passing</span>
      <span class="tp-chip is-warn">1 warning</span>
    </span>
  </span>`;

// The internal linking finder hands back a list of page pairs, so the
// preview is a small file-style listing of suggested link rows.
const internalLinkingPreview = () => `
  <span class="tp tp-lt">
    <span class="tp-file">
      <span class="tp-file-name">Suggested links</span>
      <span class="tp-file-line"><b>Pricing</b><i>→ Guides</i></span>
      <span class="tp-file-line is-quote">78% keyword overlap</span>
      <span class="tp-file-line"><b>Blog post</b><i>→ Use cases</i></span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">9 pages crawled</span>
    </span>
  </span>`;

// The carousel generator's output is a stack of slides, so the preview is a
// tiny deck peeking out from behind itself.
const blogToCarouselPreview = () => `
  <span class="tp tp-lt">
    <span class="tp-file">
      <span class="tp-file-name">Carousel outline</span>
      <span class="tp-file-line"><b>1</b><i>Hook</i></span>
      <span class="tp-file-line"><b>2</b><i>Section one</i></span>
      <span class="tp-file-line is-quote">… 6 more slides</span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">8 slides built</span>
    </span>
  </span>`;

// The social-week tool hands back seven day-labeled drafts, matching the
// carousel's file-listing device but with days instead of slide numbers.
const blogToSocialWeekPreview = () => `
  <span class="tp tp-lt">
    <span class="tp-file">
      <span class="tp-file-name">This week's posts</span>
      <span class="tp-file-line"><b>Mon</b><i>Announce</i></span>
      <span class="tp-file-line"><b>Wed</b><i>Lead with a stat</i></span>
      <span class="tp-file-line is-quote">… 4 more days</span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">6 drafts built</span>
    </span>
  </span>`;

// Client-only generators (keyword extractor, hashtag generator, keyword
// clusters, schema markup, case study outline, re-engagement builder, CSV
// dashboard) reuse the UTM builder's tag-cloud-ish device: the output itself.
const keywordExtractorPreview = () => `
  <span class="tp tp-lt">
    <span class="tp-file">
      <span class="tp-file-name">Top keywords</span>
      <span class="tp-file-line"><b>onboarding</b><i>×14</i></span>
      <span class="tp-file-line"><b>marketing team</b><i>×9</i></span>
      <span class="tp-file-line is-quote">…23 more</span>
    </span>
    <span class="tp-verdict">
      <span class="tp-chip is-pass">Nothing leaves your browser</span>
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
    name: "Website SEO Analyzer",
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
    href: "/tools/video-script-checker",
    name: "Video Script Checker",
    text: "Score a Reels, TikTok or Shorts script's hook, pacing and CTA before you film.",
    meta: "Free · no sign-up",
    preview: videoScriptPreview,
  },
  {
    href: "/tools/image-compressor",
    name: "Image Compressor",
    text: "Shrink a JPEG, PNG, WebP or AVIF, with a real before/after size comparison.",
    meta: "Free · no sign-up",
    preview: imageCompressorPreview,
  },
  {
    href: "/tools/image-audit",
    name: "Image audit",
    text: "Every image on your site missing alt text, and every one still in a legacy format.",
    meta: "Free · no sign-up",
    preview: imageAuditPreview,
  },
  {
    href: "/tools/utm-builder",
    name: "UTM / Campaign URL Builder",
    text: "Tag a campaign link in seconds — nothing leaves your browser.",
    meta: "Free · no sign-up",
    preview: utmBuilderPreview,
  },
  {
    href: "/tools/headline-analyzer",
    name: "Headline Analyzer",
    text: "Score a headline or ad line's length, emotional pull, specificity and clarity.",
    meta: "Free · no sign-up",
    preview: headlineCheckerPreview,
  },
  {
    href: "/tools/qr-code-generator",
    name: "QR Code Generator",
    text: "Turn any URL or text into a scannable PNG or SVG QR code.",
    meta: "Free · no sign-up",
    preview: qrCodeGeneratorPreview,
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
    href: "/tools/brand-voice-analyzer",
    name: "Brand Voice Analyzer",
    text: "Paste 5-10 posts and get a reusable voice spec: sentence style, pronoun balance, vocabulary.",
    meta: "Free · no sign-up",
    preview: brandVoicePreview,
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
    href: "/tools/competitor-messaging",
    name: "Competitor Messaging Comparison",
    text: "Paste 2-5 competitor URLs and compare tone, sentence style and shared vs unique vocabulary.",
    meta: "Free · no sign-up",
    preview: competitorMessagingPreview,
  },
  {
    href: "/tools/competitor-feature-gap",
    name: "Competitor Feature Gap",
    text: "Paste 2-5 competitor URLs and get a yes/no feature matrix built from their own list items.",
    meta: "Free · no sign-up",
    preview: competitorFeatureGapPreview,
  },
  {
    href: "/tools/answer-readiness",
    name: "Answer-Readiness Score",
    text: "Score how easily an LLM could lift a clean answer from a page — headings, FAQ, tables, chunk length.",
    meta: "Free · no sign-up",
    preview: answerReadinessPreview,
  },
  {
    href: "/tools/internal-linking-finder",
    name: "Internal Linking Opportunity Finder",
    text: "Crawl up to 12 pages and find ones that should link to each other, with anchor text suggestions.",
    meta: "Free · no sign-up",
    preview: internalLinkingPreview,
  },
  {
    href: "/tools/blog-to-carousel",
    name: "Blog to LinkedIn Carousel",
    text: "Turn a blog post's own headings into a slide-by-slide carousel outline.",
    meta: "Free · no sign-up",
    preview: blogToCarouselPreview,
  },
  {
    href: "/tools/blog-to-social-week",
    name: "Blog to a Week of Social Posts",
    text: "Turn one blog post into up to 7 days of post drafts, built from its own stats and quotes.",
    meta: "Free · no sign-up",
    preview: blogToSocialWeekPreview,
  },
  {
    href: "/tools/keyword-extractor",
    name: "Keyword Extractor",
    text: "Paste an article and get its most frequent keywords and phrases, ranked by count.",
    meta: "Free · no sign-up",
    preview: keywordExtractorPreview,
  },
  {
    href: "/tools/hashtag-generator",
    name: "Hashtag Generator",
    text: "Paste a post and get a shortlist of relevant hashtags, pulled from your own words.",
    meta: "Free · no sign-up",
    preview: () => `
      <span class="tp tp-lt">
        <span class="tp-file">
          <span class="tp-file-name">Suggested hashtags</span>
          <span class="tp-file-line is-quote">#marketing #AiCoworkers #onboarding</span>
        </span>
        <span class="tp-verdict">
          <span class="tp-chip is-pass">Nothing leaves your browser</span>
        </span>
      </span>`,
  },
  {
    href: "/tools/keyword-clusters",
    name: "Keyword Cluster Generator",
    text: "Paste up to 1,000 keywords and get them grouped into topical clusters with a suggested page each.",
    meta: "Free · no sign-up",
    preview: () => `
      <span class="tp tp-lt">
        <span class="tp-file">
          <span class="tp-file-name">Clusters</span>
          <span class="tp-file-line"><b>Email Marketing</b><i>×14</i></span>
          <span class="tp-file-line"><b>Social Scheduling</b><i>×9</i></span>
        </span>
        <span class="tp-verdict">
          <span class="tp-chip is-pass">Nothing leaves your browser</span>
        </span>
      </span>`,
  },
  {
    href: "/tools/schema-generator",
    name: "Schema Markup Generator",
    text: "Build valid JSON-LD for Article, Product, FAQ, Organization, LocalBusiness, HowTo and Review.",
    meta: "Free · no sign-up",
    preview: () => `
      <span class="tp tp-lt">
        <span class="tp-file">
          <span class="tp-file-name">schema.json</span>
          <span class="tp-file-line"><b>@type</b><i>Article</i></span>
          <span class="tp-file-line is-quote">"headline": "…"</span>
        </span>
        <span class="tp-verdict">
          <span class="tp-chip is-pass">Nothing leaves your browser</span>
        </span>
      </span>`,
  },
  {
    href: "/tools/case-study-outline",
    name: "Case Study Outline Maker",
    text: "Paste a customer win story and get a ready-to-write challenge/solution/results outline.",
    meta: "Free · no sign-up",
    preview: () => `
      <span class="tp tp-lt">
        <span class="tp-file">
          <span class="tp-file-name">Outline</span>
          <span class="tp-file-line"><b>1</b><i>The challenge</i></span>
          <span class="tp-file-line"><b>3</b><i>The results</i></span>
        </span>
        <span class="tp-verdict">
          <span class="tp-chip is-pass">Nothing leaves your browser</span>
        </span>
      </span>`,
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
