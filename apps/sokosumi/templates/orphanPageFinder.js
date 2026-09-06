const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/orphan-pages";

const FAQ = [
  {
    question: "What counts as an orphan page?",
    answer:
      "A page listed in the site's sitemap.xml that no other crawled page links to internally. It's reachable if you know the URL (or a search engine indexed it from the sitemap), but a visitor browsing the site normally would never land on it.",
  },
  {
    question: "Why does it need a sitemap.xml?",
    answer: "Orphan detection needs a \"should exist\" list to check against. Without a sitemap there's no reliable way to know which pages are supposed to be reachable, so this tool requires one and won't fall back to guessing.",
  },
  {
    question: "How many pages does it check?",
    answer: "Up to 20 pages from the sitemap. A larger site only gets a sample, not a full audit.",
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
    { label: "Orphan Page Finder" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Orphan Page Finder",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that compares a site's sitemap.xml against the internal links actually found while crawling it, and flags pages no other page links to.",
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
      title: "Orphan Page Finder | Sokosumi",
      description: "Free orphan page finder. Enter a site URL and find sitemap pages that no other page on the site links to. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Orphan Page Finder", sub: "Find pages with no internal links pointing to them." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up</p>
      <h1>Orphan Page Finder</h1>
      <p class="tk-lede">Enter a site URL and find pages listed in its sitemap that no other page on the site links to — reachable by URL, but not by browsing.</p>

      <form class="tk-form" id="opfForm" novalidate>
        <label class="sr-only" for="opfUrl">Site URL</label>
        <input id="opfUrl" type="url" placeholder="https://example.com" aria-describedby="opfError" required />
        <button class="tk-submit" id="opfSubmit" type="submit">Find orphan pages</button>
      </form>

      <p class="tk-error" id="opfError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="opfLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Crawling the sitemap…</span>
    </div>

    <section class="tk-result" id="opfResult" aria-label="Results" hidden>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Orphan pages</h2></div>
        <p class="tk-sub" id="opfNote" style="margin-bottom:14px"></p>
        <div class="tk-groups" id="opfGroups"></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="opf-faq">
      <h2 id="opf-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The orphans are found. Someone still has to link to them.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/orphan-page-finder.js"], englishOnly: true })
  );
}

module.exports = { render };
