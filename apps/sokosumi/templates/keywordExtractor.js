const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/keyword-extractor";

const FAQ = [
  {
    question: "How does it pick keywords?",
    answer:
      "It counts how often each word and two-word phrase appears after stripping common stopwords (\"the\", \"and\", \"of\"…), then ranks by frequency. It's the same word-frequency approach classic keyword-density tools use — not a semantic or topic-modeling read of the text.",
  },
  {
    question: "Does anything leave my browser?",
    answer: "No — the whole extraction runs in JavaScript in your browser. Nothing is sent to our server.",
  },
  {
    question: "Why did it pick a phrase that isn't important?",
    answer: "Frequency isn't the same as importance — a phrase that's repeated often but isn't central to the piece (a recurring product name in an aside, for example) can still rank highly. Treat the list as a starting point, not a final answer.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Keyword Extractor" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Keyword Extractor",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free keyword extractor that pulls the most frequent words and two-word phrases out of a pasted article, entirely in your browser.",
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
      title: "Keyword Extractor — pull keywords from any article | Sokosumi",
      description: "Free keyword extractor. Paste an article and get its most frequent keywords and phrases, ranked by count. Runs entirely in your browser — nothing leaves your browser.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Keyword Extractor", sub: "Pull the most frequent keywords out of any text." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up · nothing leaves your browser</p>
      <h1>Keyword Extractor</h1>
      <p class="tk-lede">Paste an article and get its most frequent keywords and two-word phrases, ranked by count — entirely in your browser.</p>

      <form class="tk-form is-stacked" id="keForm" novalidate>
        <label class="sr-only" for="keText">Article text</label>
        <textarea id="keText" style="min-height:220px" placeholder="Paste your article here…" required></textarea>
        <button class="tk-submit" id="keSubmit" type="submit">Extract keywords</button>
      </form>
    </section>

    <section class="tk-result" id="keResult" aria-label="Results" hidden>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Top keywords</h2><button class="tk-copy" id="keCopy" type="button">Copy list</button></div>
        <div class="tk-cloud" id="keCloud"></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="ke-faq">
      <h2 id="ke-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The keywords are pulled. Someone still has to write around them.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/keyword-extractor.js"], englishOnly: true })
  );
}

module.exports = { render };
