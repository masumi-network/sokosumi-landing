const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/og-checker";

// The reference table is the reason this page is worth reading when the tool
// itself has already told you what is wrong: the numbers are hard to find and
// scattered across six sets of platform docs.
const PLATFORM_SPECS = [
  {
    platform: "Facebook",
    image: "1200×630 · 1.91:1 · under 8 MB",
    title: "~88 characters desktop, ~66 mobile",
    description: "~200 characters desktop, ~110 mobile",
    reads: "og:*, falls back to <title> and meta description",
  },
  {
    platform: "X (Twitter)",
    image: "1200×628 · 1.91:1 · under 5 MB",
    title: "~70 characters",
    description: "Hidden on the large card",
    reads: "twitter:*, falls back to og:*",
  },
  {
    platform: "LinkedIn",
    image: "1200×627 · 1.91:1 · under 5 MB",
    title: "~119 characters, 2 lines shown",
    description: "Not shown in the feed any more",
    reads: "og:* only — it ignores twitter:*",
  },
  {
    platform: "WhatsApp",
    image: "At least 300×200 · under ~600 KB for the large card",
    title: "~65 characters",
    description: "~150 characters",
    reads: "og:*",
  },
  {
    platform: "Slack",
    image: "Any; rendered under the text, max 360px wide",
    title: "Full title shown",
    description: "~3 lines",
    reads: "og:*, uses og:site_name as the eyebrow",
  },
  {
    platform: "Discord",
    image: "1200×630 · under 8 MB",
    title: "256 characters",
    description: "350 characters, ~4 lines shown",
    reads: "og:* plus theme-color for the left rule",
  },
];

const FAQ = [
  {
    question: "What is an Open Graph checker?",
    answer:
      "An Open Graph checker fetches a page the way Facebook, X, LinkedIn, WhatsApp, Slack and Discord fetch it, reads the og: and twitter: meta tags out of the HTML, and shows you the card each platform will build from them. It catches the mistakes you cannot see in a browser: a missing og:image, a relative image URL, an image that is the wrong size, or a description that gets cut mid-sentence.",
  },
  {
    question: "Is this Open Graph checker free?",
    answer:
      "Yes. No account, no sign-up, no credit card, no limit on how many pages you check. It runs on Sokosumi, where our paid product is AI coworkers that do marketing work — this tool is free because it is useful, not because it is a trial.",
  },
  {
    question: "Can I use this instead of the Facebook Sharing Debugger?",
    answer:
      "For checking your tags, yes, and it covers five more platforms in the same pass. There is one thing it cannot do: Facebook caches your card, and only Facebook can clear that cache. When you have fixed your tags here, run the URL through Facebook's own Sharing Debugger once and press Scrape Again so Facebook picks up the new version.",
  },
  {
    question: "Is there still a Twitter card validator?",
    answer:
      "No. X retired the Twitter Card Validator in 2023, which is why so many people end up here. This checker reads twitter:card, twitter:title, twitter:description and twitter:image, applies X's own fallback rules to og: tags where the twitter: ones are missing, and renders both the large and the small card so you can see which one you are actually going to get.",
  },
  {
    question: "How do I fix a LinkedIn preview that shows the old image?",
    answer:
      "LinkedIn caches a URL's preview for about seven days and nothing you change on your page clears it early. Fix the tags, confirm them here, then paste the URL into LinkedIn's own Post Inspector, which forces a re-crawl. If you cannot wait, adding a harmless query string to the URL makes LinkedIn treat it as a new page.",
  },
  {
    question: "What size should an og:image be?",
    answer:
      "1200×630 pixels, which is 1.91:1, under 1 MB, and served as PNG or JPEG over https. That single size works on every platform in the table above. Anything under 600px wide makes Facebook and LinkedIn fall back to a small square thumbnail, and anything under 200px on a side is rejected outright.",
  },
  {
    question: "Why does my link preview not show an image at all?",
    answer:
      "In order of how often it happens: og:image is a relative path rather than a full https:// URL; the image is behind auth or a firewall that blocks crawlers; it is an SVG, which no major platform renders; it is over the 8 MB limit; or the platform cached an older version of the page. This checker tells you which one of those it is.",
  },
  {
    question: "Do I need twitter: tags if I already have og: tags?",
    answer:
      "Only one: twitter:card set to summary_large_image. X reads og:title, og:description and og:image when the twitter: equivalents are missing, but it will not guess that you want the wide card. Everything else is optional and worth adding only when you want X to show something different from the other platforms.",
  },
];

const SNIPPET = `<span class="ogc-cmt">&lt;!-- The eight tags that cover every platform --&gt;</span>
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
    alternateName: "OG image checker and social preview tool",
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
        "Free Open Graph checker. Paste a URL to see how it will look on Facebook, X, LinkedIn, WhatsApp, Slack and Discord, and get every og:image, og:title and twitter:card problem in one report. No sign-up.",
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
      <p class="ogc-overline">Free tool · no sign-up</p>
      <h1>See your link before anyone else does</h1>
      <p class="ogc-lede">Paste a URL. We fetch it the way a social crawler does, read every Open Graph and Twitter card tag, and show you the card that Facebook, X, LinkedIn, WhatsApp, Slack and Discord will each build from it — plus everything that is missing, mis-sized or about to get truncated.</p>

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

    <section class="ogc-section" aria-labelledby="ogc-how">
      <h2 id="ogc-how">What the checker actually does</h2>
      <p class="ogc-sub">Not a screenshot service. It requests your page from a server, so it sees exactly what a crawler sees — including the tags your JavaScript adds after load, if your server renders them, and the ones it does not.</p>
      <ol class="ogc-steps">
        <li><span>01</span><h3>Fetches the page</h3><p>Follows every redirect, stops at the first non-HTML response, and reads the <code>&lt;head&gt;</code> — so a tag hidden behind a 301 chain still gets found.</p></li>
        <li><span>02</span><h3>Probes the image</h3><p>Downloads the first bytes of your <code>og:image</code> to read its real format, pixel dimensions and file weight from the file header, not from what the tags claim.</p></li>
        <li><span>03</span><h3>Renders six cards</h3><p>Applies each platform's own crop, clamp and fallback rules, so you see the sentence that gets cut rather than a generic mockup.</p></li>
      </ol>
    </section>

    <section class="ogc-section" aria-labelledby="ogc-specs">
      <h2 id="ogc-specs">What each platform reads, and where it cuts</h2>
      <p class="ogc-sub">The same URL becomes six different cards. These are the limits the previews above are built on — the recommended og:image size, the character counts, and which set of tags each platform trusts.</p>
      <div class="ogc-table-wrap">
        <table class="ogc-table">
          <thead>
            <tr><th scope="col">Platform</th><th scope="col">og:image</th><th scope="col">Title</th><th scope="col">Description</th><th scope="col">Tags it reads</th></tr>
          </thead>
          <tbody>
            ${PLATFORM_SPECS.map(
              (row) =>
                `<tr><td>${esc(row.platform)}</td><td>${esc(row.image)}</td><td>${esc(row.title)}</td><td>${esc(row.description)}</td><td>${esc(row.reads)}</td></tr>`,
            ).join("")}
          </tbody>
        </table>
      </div>
      <p class="ogc-sub" style="margin-top:18px">One image at <strong>1200×630</strong>, PNG or JPEG, under 1 MB, served over https, satisfies every row. Everything else is a variation on that.</p>
    </section>

    <section class="ogc-section" aria-labelledby="ogc-fix">
      <h2 id="ogc-fix">The tags worth having</h2>
      <p class="ogc-sub">There are dozens of Open Graph properties and almost nobody needs more than these. Paste them into your <code>&lt;head&gt;</code>, fill in your values, and run the page back through the checker.</p>
      <pre class="ogc-snippet">${SNIPPET}</pre>
      <div class="ogc-ref">
        <div>
          <h3>og:image is the whole ballgame</h3>
          <p>It is the only tag that changes the size of your link in someone's feed. A card with a 1200×630 image occupies several times the space of one without, and a relative path — <code>/og.png</code> instead of <code>https://…/og.png</code> — is the single most common reason an image never appears.</p>
        </div>
        <div>
          <h3>twitter:card is the only X tag you need</h3>
          <p>X reads your og: tags for everything else. Without <code>summary_large_image</code> it renders the small square card, which looks like an afterthought next to every other post in the timeline.</p>
        </div>
        <div>
          <h3>Caches are the reason your fix "did not work"</h3>
          <p>Facebook, LinkedIn and Slack all cache a URL's preview for days. Correct tags here plus an old card there means the tags are fine and the cache is stale — re-scrape the URL in that platform's own tool.</p>
        </div>
        <div>
          <h3>Write the description for mobile</h3>
          <p>Every desktop limit is generous and every mobile limit is not. Around 110 characters survives everywhere; past 200 you are writing for a feed nobody is reading on.</p>
        </div>
      </div>
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
      heading: "The card is fixed. Now someone has to write the next one.",
      subheading:
        "Sokosumi is a marketplace of AI coworkers who take a brief and hand back a finished file — the launch copy, the social set, the landing page. The tools here are free; the coworkers are what we actually sell.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/og-checker.js"], englishOnly: true })
  );
}

module.exports = { render };
