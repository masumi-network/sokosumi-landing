const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/utm-builder";

const FAQ = [
  {
    question: "What are UTM parameters?",
    answer:
      "Five query-string parameters — utm_source, utm_medium, utm_campaign, and the optional utm_term and utm_content — that Google Analytics and most other analytics tools read to attribute traffic to a specific campaign, channel and link, rather than lumping it in as generic referral or direct traffic.",
  },
  {
    question: "Which fields are required?",
    answer:
      "Source, medium and campaign are the three analytics tools actually key off — source is where the click came from (newsletter, twitter, a partner site), medium is the channel type (email, social, cpc), and campaign is the specific push it belongs to. Term and content are optional, used for paid-search keyword tracking and for distinguishing two links or ad variants inside the same campaign.",
  },
  {
    question: "Does this send my URL anywhere?",
    answer:
      "No. The link is built entirely in your browser with plain string concatenation — nothing is sent to a server, logged, or stored anywhere but your own browser's local storage (for the recent-links list on this page).",
  },
  {
    question: "Why does it lowercase and encode my values?",
    answer:
      "Analytics platforms treat utm_source=Newsletter and utm_source=newsletter as two different sources, which quietly splits your reporting. Lowercasing keeps every campaign's parameters consistent, and encoding spaces and special characters keeps the URL valid.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "UTM / Campaign URL Builder" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi UTM / Campaign URL Builder",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description:
      "A free UTM / campaign URL builder that appends utm_source, utm_medium, utm_campaign, utm_term and utm_content to any link, entirely in the browser — nothing is sent to a server.",
    featureList: [
      "Builds utm_source, utm_medium, utm_campaign, utm_term and utm_content links",
      "Runs entirely client-side — no URL is ever sent to a server",
      "Recent links saved locally for reuse across a session",
      "Copy-to-clipboard output",
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
      title: "Free UTM / Campaign URL Builder | Sokosumi",
      description:
        "Build a UTM-tagged campaign link for free — source, medium, campaign, term and content — entirely in your browser. No sign-up, nothing sent to a server.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "ub-tool-page",
      stylesheets: ["/assets/utm-builder.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "UTM / Campaign URL Builder",
        sub: "Tag a campaign link in seconds — nothing leaves your browser.",
      },
    }) +
    `<section class="ub-head" id="builder">
      <p class="ub-overline">Free · no sign-up</p>
      <h1>UTM / Campaign URL Builder</h1>
      <p class="ub-lede">Fill in the fields and get a properly tagged campaign link back instantly. Runs entirely in your browser — the URL you build here is never sent anywhere.</p>

      <form class="ub-form" id="ubForm" novalidate>
        <div class="ub-field">
          <label for="ubUrl">Website URL <span>*</span></label>
          <input id="ubUrl" type="text" inputmode="url" autocomplete="url" spellcheck="false" placeholder="https://example.com/landing-page" required />
        </div>
        <div class="ub-grid">
          <div class="ub-field">
            <label for="ubSource">Campaign source <span>*</span></label>
            <input id="ubSource" type="text" placeholder="newsletter" required />
          </div>
          <div class="ub-field">
            <label for="ubMedium">Campaign medium <span>*</span></label>
            <input id="ubMedium" type="text" placeholder="email" required />
          </div>
          <div class="ub-field">
            <label for="ubCampaign">Campaign name <span>*</span></label>
            <input id="ubCampaign" type="text" placeholder="spring_sale" required />
          </div>
          <div class="ub-field">
            <label for="ubTerm">Campaign term <span>optional</span></label>
            <input id="ubTerm" type="text" placeholder="ai coworker" />
          </div>
          <div class="ub-field">
            <label for="ubContent">Campaign content <span>optional</span></label>
            <input id="ubContent" type="text" placeholder="header_link" />
          </div>
        </div>
      </form>

      <p class="ub-error" id="ubError" role="alert" hidden></p>

      <div class="ub-output" id="ubOutput" hidden>
        <label class="sr-only" for="ubResult">Generated URL</label>
        <input id="ubResult" type="text" readonly />
        <button class="ub-copy" id="ubCopy" type="button">Copy</button>
      </div>
    </section>

    <section class="ub-recent" id="ubRecentSection" hidden aria-labelledby="ub-recent-h">
      <div class="ub-recent-head">
        <h2 id="ub-recent-h">Recent links</h2>
        <button class="ub-clear" id="ubClear" type="button">Clear</button>
      </div>
      <ul class="ub-recent-list" id="ubRecentList"></ul>
    </section>

    <section class="ub-section" aria-labelledby="ub-how">
      <h2 id="ub-how">What each field does</h2>
      <div class="ub-cards">
        <div class="ub-card"><h3>Source</h3><p>Where the click comes from — newsletter, twitter, a partner's site. Required.</p></div>
        <div class="ub-card"><h3>Medium</h3><p>The channel type — email, social, cpc, referral. Required.</p></div>
        <div class="ub-card"><h3>Campaign</h3><p>The specific push this link belongs to — spring_sale, product_launch. Required.</p></div>
        <div class="ub-card"><h3>Term &amp; content</h3><p>Optional: a paid-search keyword, or a way to tell two link variants in the same campaign apart.</p></div>
      </div>
    </section>

    <section class="ub-section" id="faq" aria-labelledby="ub-faq">
      <h2 id="ub-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The link is tagged. Someone still has to write what's on the other end of it.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the landing page, the email, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/utm-builder.js"], englishOnly: true })
  );
}

module.exports = { render };
