const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/landing-page-teardown";

const FAQ = [
  {
    question: "What does the conversion teardown check?",
    answer:
      "Enter a landing page URL and it fetches the page and audits four things from the real markup: headline clarity (a single clear H1, sequential heading levels), CTA presence and how early it appears, social proof (testimonials, customer counts, press mentions), and trust signals (guarantees, security language, form length).",
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
      <div class="tk-dims" id="ltcDims" data-filter=""></div>
    </section>

    <section class="tk-section" aria-labelledby="ltc-how">
      <h2 id="ltc-how">What gets checked</h2>
      <p class="tk-sub">Four dimensions pulled from the page's actual markup.</p>
      <div class="tk-cards">
        <div class="tk-card"><h3>Headline clarity</h3><p>A single clear H1 and a heading outline with no skipped levels.</p></div>
        <div class="tk-card"><h3>Call to action</h3><p>Whether a CTA exists, and how early it appears in the page.</p></div>
        <div class="tk-card"><h3>Social proof</h3><p>Testimonials, customer counts, or press mentions.</p></div>
        <div class="tk-card"><h3>Trust signals</h3><p>Guarantees, security language, and form length.</p></div>
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
