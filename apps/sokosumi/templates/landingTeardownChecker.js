const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/landing-page-teardown";

const FAQ = [
  {
    question: "What does the conversion teardown check?",
    answer:
      "Enter a landing page URL and it fetches the page and audits four conversion dimensions from the real markup. Headline clarity: a single, concise H1, a supporting subheadline, and a sequential heading outline. Call to action: whether a real button exists, how early the CTA appears, and whether it's repeated. Social proof: testimonials, customer counts, case studies, press mentions, and star ratings. Trust signals: risk-reversal language (guarantees, no-credit-card, cancel-anytime), HTTPS, privacy/terms links, and form length.",
  },
  {
    question: "Does it actually see the rendered page, like a screenshot?",
    answer:
      "No — it has no headless browser and doesn't render JavaScript or CSS. \"Appears early\" is approximated by position in the raw HTML, which is usually a good proxy but isn't the same as true above-the-fold layout. For a client-side app that renders everything with JavaScript, this will under-report what's actually visible.",
  },
  {
    question: "Why does it flag long forms?",
    answer: "Every additional form field is a well-documented drop-off point before submission. It isn't a hard rule — a form for a $50,000 enterprise deal can justify more fields than a newsletter signup — so treat it as a flag to double-check, not a verdict.",
  },
  {
    question: "Is the URL or page content stored anywhere?",
    answer: "No. The page is fetched and analyzed in memory for that one request only.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Landing Page Conversion Teardown" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Landing Page Conversion Teardown",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description:
      "A free landing page conversion teardown that audits a URL's headline clarity, CTA presence, social proof, and trust signals, with a full breakdown and fixes.",
    featureList: [
      "Headline and heading-outline checks",
      "CTA presence and position detection",
      "Social proof detection",
      "Trust-signal and form-length checks",
      "Prioritized, ranked list of fixes",
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
      title: "Landing Page Conversion Teardown | Sokosumi",
      description:
        "Free landing page conversion teardown. Enter a URL and get scores on headline clarity, CTA presence, social proof, and trust signals, plus a ranked list of fixes. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "Landing Page Conversion Teardown",
        sub: "Audit a landing page's headline, CTA, social proof and trust signals.",
      },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up</p>
      <h1>Landing Page Conversion Teardown</h1>
      <p class="tk-lede">Enter a landing page URL and get a teardown of its headline clarity, its CTA, its social proof, and its trust signals — with the exact things costing you conversions.</p>

      <form class="tk-form" id="ltcForm" novalidate>
        <label class="sr-only" for="ltcUrl">Landing page URL</label>
        <input id="ltcUrl" name="url" type="url" placeholder="https://example.com/landing-page" aria-describedby="ltcError" required />
        <button class="tk-submit" id="ltcSubmit" type="submit">Tear it down</button>
      </form>

      <div class="tk-try">
        <span>Try</span>
        <button type="button" data-try="sokosumi">sokosumi.com</button>
      </div>

      <p class="tk-error" id="ltcError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="ltcLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Fetching and tearing down the page…</span>
    </div>

    <section class="tk-result" id="ltcResult" aria-label="Results" hidden>
      <div class="tk-summary">
        <p class="tk-summary-score" id="ltcSummaryScore"></p>
        <div class="tk-scores" id="ltcScores" role="group" aria-label="Filter checks"></div>
        <button class="tk-copy" id="ltcCopy" type="button">Copy report</button>
      </div>
      <div class="tk-dims tk-dims-notag" id="ltcDims" data-filter=""></div>
    </section>

    <section class="tk-section" aria-labelledby="ltc-how">
      <h2 id="ltc-how">What gets checked</h2>
      <p class="tk-sub">Four conversion dimensions, each pulled from the page's actual markup.</p>
      <div class="tk-cards">
        <div class="tk-card">
          <span class="tk-card-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V5h16v2"/><path d="M9 20h6"/><path d="M12 5v15"/></svg></span>
          <h3>Headline clarity</h3>
          <p>A single, concise H1, a supporting subheadline, and a heading outline with no skipped levels.</p>
        </div>
        <div class="tk-card">
          <span class="tk-card-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span>
          <h3>Call to action</h3>
          <p>Whether a real CTA button exists, how early it appears, and whether it's repeated down the page.</p>
        </div>
        <div class="tk-card">
          <span class="tk-card-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17.75l-6.172 3.245 1.179-6.873-4.993-4.867 6.9-1.002L12 2l3.086 6.253 6.9 1.002-4.993 4.867 1.179 6.873z"/></svg></span>
          <h3>Social proof</h3>
          <p>Testimonials, customer counts, case studies, press mentions, and star ratings or review counts.</p>
        </div>
        <div class="tk-card">
          <span class="tk-card-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg></span>
          <h3>Trust signals</h3>
          <p>Risk-reversal language, HTTPS, privacy/terms links, and how long the form is.</p>
        </div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="ltc-faq">
      <h2 id="ltc-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The teardown is done. Someone still has to rebuild the page.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/landing-teardown.js"], englishOnly: true })
  );
}

module.exports = { render };
