const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/keyword-clusters";

const FAQ = [
  {
    question: "How does it group keywords?",
    answer:
      "Each keyword is split into words, then keywords that share at least one significant word are grouped together, greedily — the way \"email marketing tips\" and \"email marketing software\" both land in a cluster anchored on \"email marketing\". It's a token-overlap heuristic, not semantic clustering, so synonyms (\"email\" vs \"newsletter\") won't be recognized as related.",
  },
  {
    question: "How many keywords can I paste?",
    answer: "Up to 1,000, one per line (or comma-separated). Everything runs in your browser, so a very large list may take a moment.",
  },
  {
    question: "Does anything leave my browser?",
    answer: "No — clustering runs entirely in JavaScript in your browser. Nothing is sent to our server.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Keyword Cluster Generator" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Keyword Cluster Generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that groups up to 1,000 keywords into topical clusters by shared vocabulary, entirely in your browser, and suggests a page per cluster.",
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
      title: "Keyword Cluster Generator | Sokosumi",
      description: "Free keyword cluster generator. Paste up to 1,000 keywords and get them grouped into topical clusters with a suggested page per cluster. Runs entirely in your browser.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Keyword Cluster Generator", sub: "Group keywords into topical clusters." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up · nothing leaves your browser</p>
      <h1>Keyword Cluster Generator</h1>
      <p class="tk-lede">Paste up to 1,000 keywords, one per line, and get them grouped into topical clusters by shared vocabulary — with a suggested page for each cluster.</p>

      <form class="tk-form is-stacked" id="kcgForm" novalidate>
        <label class="sr-only" for="kcgText">Keywords, one per line</label>
        <textarea id="kcgText" style="min-height:220px" placeholder="email marketing tips&#10;email marketing software&#10;social media scheduling&#10;best social media scheduler" required></textarea>
        <button class="tk-submit" id="kcgSubmit" type="submit">Cluster keywords</button>
      </form>
    </section>

    <section class="tk-result" id="kcgResult" aria-label="Results" hidden>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Clusters</h2></div>
        <p class="tk-sub" id="kcgNote" style="margin-bottom:14px"></p>
        <div class="tk-groups" id="kcgGroups"></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="kcg-faq">
      <h2 id="kcg-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The clusters are built. Someone still has to write the pages.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/keyword-cluster-generator.js"], englishOnly: true })
  );
}

module.exports = { render };
