const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/core-web-vitals";

const FAQ = [
  {
    question: "Is this real Core Web Vitals data?",
    answer:
      "No. Real Core Web Vitals come from Chrome's field data (CrUX) or a lab tool like Lighthouse running an actual browser — this tool has neither. It fetches the page's HTML document and reads structural signals well-documented to affect LCP, CLS and INP: document weight, render-blocking stylesheets and scripts, images missing explicit dimensions, and a viewport tag. Treat it as a plain-English proxy, not a report card.",
  },
  {
    question: "Why doesn't it measure image or font download time?",
    answer: "It only fetches the HTML document itself, not every image, script and font the page would also load in a browser — that would need a real browser to run. Document weight and render-blocking resource counts are what's actually measurable from markup alone.",
  },
  {
    question: "What should I use instead for real numbers?",
    answer: "PageSpeed Insights or Chrome's own Core Web Vitals report, for real field and lab data. This tool is a quick first pass at obvious structural issues, not a replacement for those.",
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
    { label: "Core Web Vitals Explainer" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Core Web Vitals Explainer",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that reads a page's HTML for structural signals tied to LCP, CLS and INP — document weight, render-blocking resources, image dimensions, viewport tag — and explains them in plain English. A structural proxy, not real CrUX or Lighthouse data.",
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
      title: "Core Web Vitals Explainer | Sokosumi",
      description: "Free Core Web Vitals explainer. Enter a URL and get plain-English fixes for structural signals tied to LCP, CLS and INP. Not real CrUX or Lighthouse data — a fast first pass. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Core Web Vitals Explainer", sub: "Plain-English fixes for LCP, CLS and INP signals." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up</p>
      <h1>Core Web Vitals Explainer</h1>
      <p class="tk-lede">Enter a URL and get plain-English fixes for the structural signals that drive LCP, CLS and INP — not real CrUX or Lighthouse numbers, but a fast first pass.</p>

      <form class="tk-form" id="cwvForm" novalidate>
        <label class="sr-only" for="cwvUrl">Page URL</label>
        <input id="cwvUrl" type="url" placeholder="https://example.com" aria-describedby="cwvError" required />
        <button class="tk-submit" id="cwvSubmit" type="submit">Explain this page</button>
      </form>

      <div class="tk-try">
        <span>Try</span>
        <button type="button" data-try="sokosumi">sokosumi.com</button>
      </div>

      <p class="tk-error" id="cwvError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="cwvLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Fetching the page…</span>
    </div>

    <section class="tk-result" id="cwvResult" aria-label="Results" hidden>
      <div class="tk-summary">
        <p class="tk-summary-score" id="cwvSummaryScore"></p>
        <div class="tk-scores" id="cwvScores" role="group" aria-label="Filter checks"></div>
        <button class="tk-copy" id="cwvCopy" type="button">Copy report</button>
      </div>
      <div class="tk-dims" id="cwvDims" data-filter=""></div>
    </section>

    <section class="tk-section" aria-labelledby="cwv-how">
      <h2 id="cwv-how">What gets checked</h2>
      <div class="tk-cards">
        <div class="tk-card"><h3>LCP (proxy)</h3><p>Document weight and render-blocking stylesheets — both delay first paint.</p></div>
        <div class="tk-card"><h3>CLS (proxy)</h3><p>Images missing explicit dimensions and a missing viewport tag — both cause layout jank.</p></div>
        <div class="tk-card"><h3>INP (proxy)</h3><p>Total script count and parser-blocking scripts in the head — both compete for the main thread.</p></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="cwv-faq">
      <h2 id="cwv-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The signals are explained. Someone still has to ship the fixes.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/core-web-vitals.js"], englishOnly: true })
  );
}

module.exports = { render };
