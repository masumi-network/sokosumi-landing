const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/internal-linking-finder";

const FAQ = [
  {
    question: "How does it find pages to compare?",
    answer:
      "It tries /sitemap.xml first (following one level into a sitemap index if needed), and falls back to the links found on your homepage if no sitemap exists. Either way it caps the crawl at 12 pages, so a large site only gets a sample, not a full audit.",
  },
  {
    question: "How does it decide two pages should link to each other?",
    answer:
      "Each page's top 20 non-stopword keywords are compared against every other page's using a Jaccard overlap — the more keywords two pages share, the higher the similarity. Anything over 15% overlap, where the source page doesn't already link to the target, is surfaced as a suggestion.",
  },
  {
    question: "Is this reading the pages with an LLM?",
    answer: "No — similarity is a set overlap on word frequency, not a semantic read. Two pages that use different words for the same topic won't be recognized as related.",
  },
  {
    question: "Is any of this stored?",
    answer: "No. Every page is fetched and analyzed in memory for that one request only.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Internal Linking Opportunity Finder" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Internal Linking Opportunity Finder",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that crawls up to 12 pages of a site (via sitemap.xml or the homepage's own links) and suggests internal links between pages that share vocabulary but don't yet link to each other.",
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
      title: "Internal Linking Opportunity Finder | Sokosumi",
      description: "Free internal linking opportunity finder. Enter a site URL and get suggested internal links, with anchor text, between pages that share vocabulary but don't yet link to each other. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Internal Linking Opportunity Finder", sub: "Find pages that should link to each other." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up</p>
      <h1>Internal Linking Opportunity Finder</h1>
      <p class="tk-lede">Enter a site URL and get suggested internal links — pages that share a lot of vocabulary but don't yet link to each other — with a suggested anchor text for each.</p>

      <form class="tk-form" id="ilfForm" novalidate>
        <label class="sr-only" for="ilfUrl">Site URL</label>
        <input id="ilfUrl" type="url" placeholder="https://example.com" aria-describedby="ilfError" required />
        <button class="tk-submit" id="ilfSubmit" type="submit">Find opportunities</button>
      </form>

      <p class="tk-error" id="ilfError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="ilfLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Crawling up to 12 pages…</span>
    </div>

    <section class="tk-result" id="ilfResult" aria-label="Results" hidden>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Suggested links</h2></div>
        <p class="tk-sub" id="ilfNote" style="margin-bottom:14px"></p>
        <div id="ilfTable"></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="ilf-faq">
      <h2 id="ilf-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The opportunities are found. Someone still has to add the links.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/internal-linking-finder.js"], englishOnly: true })
  );
}

module.exports = { render };
