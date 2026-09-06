const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/content-decay";

const FAQ = [
  {
    question: "How does it know a page's age?",
    answer: "It reads the Last-Modified response header if the server sends one, and falls back to date markup on the page itself (article:modified_time, article:published_time, or JSON-LD dateModified/datePublished). If none of those exist, age is reported as unknown rather than guessed.",
  },
  {
    question: "What does \"thin content\" mean here?",
    answer: "A page's word count compared against the average for the batch of URLs you pasted — not an absolute number. A 400-word page in a batch that averages 2,000 words gets flagged; the same page in a batch of short pages might not.",
  },
  {
    question: "How many URLs can I check?",
    answer: "Up to 20 per request, one per line.",
  },
  {
    question: "Is any of this stored?",
    answer: "No. Every page is fetched and checked in memory for that one request only.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Content Decay Detector" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Content Decay Detector",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that checks up to 20 pasted URLs for age (Last-Modified header or on-page date markup) and thin content relative to the batch, flagging likely-stale pages.",
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
      title: "Content Decay Detector | Sokosumi",
      description: "Free content decay detector. Paste up to 20 content URLs and find pages that look stale — old, thin, or both — relative to the rest of the batch. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Content Decay Detector", sub: "Find your content that's losing relevance." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up</p>
      <h1>Content Decay Detector</h1>
      <p class="tk-lede">Paste up to 20 content URLs, one per line, and find the ones that look stale — old, thin relative to the rest of the batch, or both.</p>

      <form class="tk-form is-stacked" id="cddForm" novalidate>
        <label class="sr-only" for="cddUrls">URLs, one per line</label>
        <textarea id="cddUrls" style="min-height:160px" placeholder="https://example.com/blog/post-one&#10;https://example.com/blog/post-two" required></textarea>
        <button class="tk-submit" id="cddSubmit" type="submit">Check for decay</button>
      </form>

      <p class="tk-error" id="cddError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="cddLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Fetching every page…</span>
    </div>

    <section class="tk-result" id="cddResult" aria-label="Results" hidden>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Results</h2></div>
        <p class="tk-sub" id="cddNote" style="margin-bottom:14px"></p>
        <div id="cddTable"></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="cdd-faq">
      <h2 id="cdd-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The stale pages are found. Someone still has to refresh them.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/content-decay.js"], englishOnly: true })
  );
}

module.exports = { render };
