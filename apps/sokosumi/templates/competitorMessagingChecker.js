const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/competitor-messaging";

const FAQ = [
  {
    question: "How many sites can I compare?",
    answer: "Between 2 and 5. Paste one URL per line.",
  },
  {
    question: "What does \"tone\" mean here?",
    answer: "A contraction-rate-based label (Casual, Neutral, or Formal), plus average sentence length and how many well-known copywriting \"power words\" (free, proven, guaranteed…) show up. It's a proxy built from word counts, not a subjective read.",
  },
  {
    question: "What are \"shared themes\" vs \"unique vocabulary\"?",
    answer: "Shared themes are words that show up in every site's top keywords — the vocabulary the whole category has converged on. Unique vocabulary is words that show up in exactly one site's top keywords and none of the others' — the angle that site alone is taking.",
  },
  {
    question: "Is any of this stored?",
    answer: "No. Each page is fetched and analyzed in memory for that one request only.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Competitor Messaging Comparison" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Competitor Messaging Comparison",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that compares 2-5 competitor URLs' tone, sentence length, and recurring vocabulary — shared themes and each site's unique angle.",
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
      title: "Competitor Messaging Comparison | Sokosumi",
      description: "Free competitor messaging comparison. Paste 2-5 URLs and compare tone, sentence length, shared themes and each site's unique vocabulary. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Competitor Messaging Comparison", sub: "Compare tone and vocabulary across competitors." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up</p>
      <h1>Competitor Messaging Comparison</h1>
      <p class="tk-lede">Paste 2-5 competitor URLs, one per line, and see how their tone, sentence length and vocabulary compare — the themes the whole category shares, and the angle each one is taking alone.</p>

      <form class="tk-form is-stacked" id="cmcForm" novalidate>
        <label class="sr-only" for="cmcUrls">URLs, one per line</label>
        <textarea id="cmcUrls" style="min-height:120px" placeholder="https://yoursite.com&#10;https://competitor-one.com&#10;https://competitor-two.com" required></textarea>
        <button class="tk-submit" id="cmcSubmit" type="submit">Compare</button>
      </form>

      <p class="tk-error" id="cmcError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="cmcLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Fetching every page…</span>
    </div>

    <section class="tk-result" id="cmcResult" aria-label="Results" hidden>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Tone and sentence style</h2></div>
        <div id="cmcTable"></div>
      </div>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Shared themes</h2></div>
        <div class="tk-cloud" id="cmcShared"></div>
      </div>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Each site's unique vocabulary</h2></div>
        <div id="cmcUnique"></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="cmc-faq">
      <h2 id="cmc-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The angles are mapped. Someone still has to write yours.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/competitor-messaging.js"], englishOnly: true })
  );
}

module.exports = { render };
