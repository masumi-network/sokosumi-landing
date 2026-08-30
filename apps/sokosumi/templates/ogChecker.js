const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/og-checker";

// Brand glyphs for the six platforms, emitted once as an inline <symbol> sprite
// so the tab strip (built in assets/og-checker.js) and the spec table below can
// both point at them with <use> instead of carrying two copies of the paths.
const PLATFORM_LOGOS = {
  facebook: { label: "Facebook", color: "#0866FF", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  x: { label: "X (Twitter)", color: "#000000", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  linkedin: { label: "LinkedIn", color: "#0A66C2", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  whatsapp: { label: "WhatsApp", color: "#25D366", path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" },
  slack: { label: "Slack", color: "#4A154B", path: "M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" },
  discord: { label: "Discord", color: "#5865F2", path: "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" },
};

const LOGO_SPRITE =
  '<svg class="ogc-sprite" aria-hidden="true" focusable="false"><defs>' +
  Object.entries(PLATFORM_LOGOS)
    .map(([key, v]) => `<symbol id="ogc-logo-${key}" viewBox="0 0 24 24"><path d="${v.path}"/></symbol>`)
    .join("") +
  "</defs></svg>";

const logo = (key, size) =>
  `<svg class="ogc-logo" width="${size || 16}" height="${size || 16}" style="color:${PLATFORM_LOGOS[key].color}" aria-hidden="true"><use href="#ogc-logo-${key}"/></svg>`;
// The table is the one piece of reference copy that earns its place: these
// numbers are scattered across six sets of platform docs and nobody has them
// memorised. Everything else on the page should be the tool.
const PLATFORM_SPECS = [
  {
    key: "facebook",
    platform: "Facebook",
    image: "1200×630 · max 8 MB · under 600px wide drops to a thumbnail",
    title: "~88 desktop, ~66 mobile",
    description: "~200 desktop, ~110 mobile",
    reads: "og:, then <title> and meta description",
  },
  {
    key: "x",
    platform: "X (Twitter)",
    image: "1200×628 · max 5 MB",
    title: "not shown",
    description: "not shown",
    reads: "twitter:, then og:",
  },
  {
    key: "linkedin",
    platform: "LinkedIn",
    image: "1200×627 · max 5 MB · under 401px wide drops to a thumbnail",
    title: "~119, 2 lines shown",
    description: "shown under the title",
    reads: "og: only, ignores twitter:",
  },
  {
    key: "whatsapp",
    platform: "WhatsApp",
    image: "min 300×200 · under ~600 KB for the big card",
    title: "~65",
    description: "~150",
    reads: "og:",
  },
  {
    key: "slack",
    platform: "Slack",
    image: "any, sits under the text at 360px",
    title: "full title",
    description: "~3 lines",
    reads: "og:, plus og:site_name as the eyebrow",
  },
  {
    key: "discord",
    platform: "Discord",
    image: "1200×630 · max 8 MB",
    title: "256",
    description: "350, about 4 lines",
    reads: "og:, plus theme-color",
  },
];

const FAQ = [
  {
    question: "What does an Open Graph tester check?",
    answer:
      "It fetches your page the way a social crawler does, reads the og: and twitter: tags out of the HTML, and draws the card each platform builds from them. Browsers hide these mistakes: a relative og:image path, a 400px image or a description that dies mid-word all look fine until someone shares the link.",
  },
  {
    question: "Is there still a Twitter card validator?",
    answer:
      "Not a working one. Twitter dropped the Card Validator's visual preview in August 2022 and the tool itself stopped working at some point after, which is how most people end up here. This reads twitter:card, twitter:title, twitter:description and twitter:image, applies X's fallback to your og: tags where those are missing, and draws both the wide and the small card. Only twitter:card is worth setting by hand; X reads og: for the rest.",
  },
  {
    question: "Can this replace the Facebook Sharing Debugger?",
    answer:
      "For reading your tags, yes, across five more platforms in one pass. It can't clear Facebook's cache, though. Fix the tags here, then run the URL through Facebook's debugger once and press Scrape Again.",
  },
  {
    question: "Why does LinkedIn still show my old preview?",
    answer:
      "LinkedIn caches a URL's preview and nothing you change on the page clears it. Confirm the tags here, then paste the URL into LinkedIn's Post Inspector to force a re-crawl. Posts already published keep the old card.",
  },
  {
    question: "What size should an og:image be?",
    answer:
      "1200×630, which is 1.91:1, PNG or JPEG over https, and under 1 MB. Facebook drops to a small square thumbnail below 600px wide and LinkedIn below 401px; below 200px on a side Facebook refuses the image outright. File-size ceilings differ, so keep it under 5 MB if one image has to work everywhere.",
  },
  {
    question: "Why is my link preview missing its image?",
    answer:
      "Usually og:image is a relative path rather than a full https:// URL. After that: the image sits behind auth or a bot filter, it's an SVG, or the platform cached an older version of the page. The report above says which.",
  },
];

const SNIPPET = `<span class="ogc-cmt">&lt;!-- Covers every platform in the table --&gt;</span>
&lt;title&gt;Your page title, under 60 characters&lt;/title&gt;
&lt;meta name="description" content="What this page is, in about 150 characters."&gt;

&lt;meta property="og:type" content="website"&gt;
&lt;meta property="og:site_name" content="Your Brand"&gt;
&lt;meta property="og:title" content="Your headline, under 60 characters"&gt;
&lt;meta property="og:description" content="One or two sentences, 50-200 characters."&gt;
&lt;meta property="og:image" content="https://example.com/og.png"&gt;
&lt;meta property="og:image:alt" content="What the image shows."&gt;
&lt;meta property="og:url" content="https://example.com/page"&gt;

&lt;meta name="twitter:card" content="summary_large_image"&gt;`;

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Open Graph checker" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Open Graph Checker",
    alternateName: "OG image checker and social preview tester",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description:
      "A free Open Graph checker that previews how any URL will look when shared on Facebook, X, LinkedIn, WhatsApp, Slack and Discord, and reports every og: and twitter: meta tag problem.",
    featureList: [
      "Open Graph and Twitter card meta tag inspection",
      "Social card previews for Facebook, X, LinkedIn, WhatsApp, Slack and Discord",
      "og:image size, format and file weight validation",
      "Copyable meta tag HTML",
    ],
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    creator: { "@id": `${SITE}/#organization` },
  };

  const faqJsonLd = {
    "@type": "FAQPage",
    "@id": `${SITE}${PATH}#faq`,
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    pageStart({
      title: "Open Graph checker — free OG image and social preview tester | Sokosumi",
      description:
        "Free Open Graph checker. Paste a URL to see how it looks on Facebook, X, LinkedIn, WhatsApp, Slack and Discord, and get every og:image, og:title and twitter:card problem in one report. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "og-tool-page",
      stylesheets: ["/assets/og-checker.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "Open Graph checker",
        sub: "See your link the way Facebook, X, LinkedIn, WhatsApp, Slack and Discord will.",
      },
    }) +
    LOGO_SPRITE +
    `<section class="ogc-head" id="checker">
      <p class="ogc-overline">Free · no sign-up</p>
      <h1>Open Graph checker</h1>
      <p class="ogc-lede">Paste a URL and see the card Facebook, X, LinkedIn, WhatsApp, Slack and Discord will each build from your tags, plus every og: and twitter: problem worth fixing.</p>

      <form class="ogc-bar" id="ogcForm" novalidate>
        <label class="sr-only" for="ogcUrl">URL to check</label>
        <input id="ogcUrl" name="url" type="text" inputmode="url" autocomplete="url" spellcheck="false" placeholder="https://your-site.com/page" aria-describedby="ogcError" required />
        <button class="ogc-submit" id="ogcSubmit" type="submit">Check</button>
      </form>

      <div class="ogc-try">
        <span>Try</span>
        <button type="button" data-try="https://stripe.com">Stripe</button>
        <button type="button" data-try="https://github.com">GitHub</button>
        <button type="button" data-try="https://www.sokosumi.com">Sokosumi</button>
        <button type="button" data-try="https://en.wikipedia.org/wiki/Open_Graph_protocol">Wikipedia</button>
      </div>

      <p class="ogc-error" id="ogcError" role="alert" hidden></p>
    </section>

    <div class="ogc-loading" id="ogcLoading" hidden>
      <span class="ogc-spin" aria-hidden="true"></span>
      <span>Fetching the page and probing the image…</span>
    </div>

    <section class="ogc-result" id="ogcResult" aria-label="Results" hidden>
      <div class="ogc-summary">
        <p class="ogc-summary-url" id="ogcSummaryUrl"></p>
        <div class="ogc-scores" id="ogcScores" role="group" aria-label="Filter checks"></div>
      </div>
      <div class="ogc-grid">
        <div class="ogc-panel">
          <div class="ogc-tabs" id="ogcTabs" role="tablist" aria-label="Platform previews"></div>
          <div class="ogc-stage" id="ogcStage"></div>
        </div>
        <div class="ogc-inspector">
          <div class="ogc-inspector-head">
            <h2>Meta tag report</h2>
            <span id="ogcChecksCount"></span>
          </div>
          <div class="ogc-checks" id="ogcChecks" data-filter=""></div>
        </div>
      </div>
    </section>

    <section class="ogc-section" aria-labelledby="ogc-specs">
      <h2 id="ogc-specs">OG image size and text limits by platform</h2>
      <p class="ogc-sub">One image at 1200×630, PNG or JPEG, under 1 MB over https satisfies every row below.</p>
      <div class="ogc-table-wrap">
        <table class="ogc-table">
          <thead>
            <tr><th scope="col">Platform</th><th scope="col">og:image</th><th scope="col">Title</th><th scope="col">Description</th><th scope="col">Reads</th></tr>
          </thead>
          <tbody>
            ${PLATFORM_SPECS.map(
              (row) =>
                `<tr><td><span class="ogc-plat">${logo(row.key, 17)}${esc(row.platform)}</span></td><td>${esc(row.image)}</td><td>${esc(row.title)}</td><td>${esc(row.description)}</td><td>${esc(row.reads)}</td></tr>`,
            ).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="ogc-section" aria-labelledby="ogc-fix">
      <h2 id="ogc-fix">The tags worth having</h2>
      <p class="ogc-sub">Open Graph has dozens of properties. Almost nobody needs more than these.</p>
      <pre class="ogc-snippet">${SNIPPET}</pre>
    </section>

    <section class="ogc-section" id="faq" aria-labelledby="ogc-faq">
      <h2 id="ogc-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The card is fixed. Someone still has to write the next one.",
      subheading:
        "Sokosumi's AI coworkers turn a brief into a finished file: the launch copy, the social set, the landing page.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/og-checker.js"], englishOnly: true })
  );
}

module.exports = { render };
