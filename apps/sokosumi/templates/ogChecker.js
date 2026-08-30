const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/og-checker";

// The table is the one piece of reference copy that earns its place: these
// numbers are scattered across six sets of platform docs and nobody has them
// memorised. Everything else on the page should be the tool.
const PLATFORM_SPECS = [
  {
    platform: "Facebook",
    image: "1200×630 · max 8 MB",
    title: "~88 desktop, ~66 mobile",
    description: "~200 desktop, ~110 mobile",
    reads: "og:, then <title> and meta description",
  },
  {
    platform: "X (Twitter)",
    image: "1200×628 · max 5 MB",
    title: "~70",
    description: "hidden on the large card",
    reads: "twitter:, then og:",
  },
  {
    platform: "LinkedIn",
    image: "1200×627 · max 5 MB",
    title: "~119, 2 lines shown",
    description: "not shown in the feed",
    reads: "og: only, ignores twitter:",
  },
  {
    platform: "WhatsApp",
    image: "min 300×200 · under ~600 KB for the big card",
    title: "~65",
    description: "~150",
    reads: "og:",
  },
  {
    platform: "Slack",
    image: "any, sits under the text at 360px",
    title: "full title",
    description: "~3 lines",
    reads: "og:, plus og:site_name as the eyebrow",
  },
  {
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
      "1200×630, which is 1.91:1, PNG or JPEG over https, and under 1 MB. Below 600px wide Facebook and LinkedIn drop to a small square thumbnail; below 200px on a side Facebook refuses it. File-size ceilings differ, so keep it under 5 MB if one image has to work everywhere.",
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
                `<tr><td>${esc(row.platform)}</td><td>${esc(row.image)}</td><td>${esc(row.title)}</td><td>${esc(row.description)}</td><td>${esc(row.reads)}</td></tr>`,
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
