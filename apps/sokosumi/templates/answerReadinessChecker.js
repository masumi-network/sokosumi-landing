const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/answer-readiness";

const FAQ = [
  {
    question: "What does \"answer readiness\" mean?",
    answer:
      "How easily a model answering a question could lift a clean, standalone fact from this specific page: a clear heading outline, direct \"X is Y\" style definitions, FAQ-shaped content, tables and JSON-LD, and paragraphs sized so a chunking pipeline can isolate one idea at a time.",
  },
  {
    question: "Does this test how ChatGPT or any specific model actually answers?",
    answer: "No — it has no access to any AI search engine or model. Every check is a structural signal in the page's own HTML: headings, tables, schema, definition-shaped sentences, paragraph length. It's a proxy for retrieval-friendliness, not a live test against a real model.",
  },
  {
    question: "Why does it care about paragraph length?",
    answer: "Most retrieval pipelines split a page into chunks before a model ever sees it. A 400-word paragraph either gets cut mid-thought or dominates a whole chunk on its own — both make it harder for a clean, single-idea passage to surface.",
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
    { label: "Answer-Readiness Score" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Answer-Readiness Score",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that scores how easily an LLM could lift a clean answer from a page: heading structure, direct definitions and FAQ content, tables and JSON-LD, and paragraph chunk length.",
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
      title: "Answer-Readiness Score | Sokosumi",
      description: "Free answer-readiness score. Enter a URL and see how easily an LLM could lift a clean answer from it: heading structure, definitions, FAQ content, tables and JSON-LD, and chunk length. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Answer-Readiness Score", sub: "How easily can an LLM lift a clean answer from this page?" },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up</p>
      <h1>Answer-Readiness Score</h1>
      <p class="tk-lede">Enter a URL and get a score on how easily an LLM could lift a clean, standalone answer from it — heading structure, direct definitions, FAQ content, tables and structured data, and chunk-friendly paragraph length.</p>

      <form class="tk-form" id="arsForm" novalidate>
        <label class="sr-only" for="arsUrl">Page URL</label>
        <input id="arsUrl" type="url" placeholder="https://example.com/guide" aria-describedby="arsError" required />
        <button class="tk-submit" id="arsSubmit" type="submit">Score this page</button>
      </form>

      <div class="tk-try">
        <span>Try</span>
        <button type="button" data-try="sokosumi">sokosumi.com</button>
      </div>

      <p class="tk-error" id="arsError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="arsLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Fetching and scoring the page…</span>
    </div>

    <section class="tk-result" id="arsResult" aria-label="Results" hidden>
      <div class="tk-summary">
        <p class="tk-summary-score" id="arsSummaryScore"></p>
        <div class="tk-scores" id="arsScores" role="group" aria-label="Filter checks"></div>
        <button class="tk-copy" id="arsCopy" type="button">Copy report</button>
      </div>
      <div class="tk-dims" id="arsDims" data-filter=""></div>
    </section>

    <section class="tk-section" aria-labelledby="ars-how">
      <h2 id="ars-how">What gets scored</h2>
      <div class="tk-cards">
        <div class="tk-card"><h3>Heading structure</h3><p>A single clear H1 and a sequential outline with no skipped levels.</p></div>
        <div class="tk-card"><h3>Definitions &amp; FAQ</h3><p>Direct "X is Y" statements, FAQ schema, expandable Q&amp;A, question-style headings.</p></div>
        <div class="tk-card"><h3>Structured data</h3><p>Tables and JSON-LD — the most unambiguous shapes for a model to lift.</p></div>
        <div class="tk-card"><h3>Chunk length</h3><p>Paragraphs sized so a retrieval pipeline can isolate one idea per chunk.</p></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="ars-faq">
      <h2 id="ars-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The page is scored. Someone still has to rewrite the parts that aren't.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/answer-readiness.js"], englishOnly: true })
  );
}

module.exports = { render };
