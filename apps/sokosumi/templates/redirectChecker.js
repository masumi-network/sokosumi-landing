const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/redirect-checker";

const FAQ = [
  {
    question: "How does it find links to check?",
    answer:
      "It discovers up to 6 seed pages (via sitemap.xml, falling back to your homepage's own links), fetches each, and collects every internal link found on them — up to 40 unique URLs — then checks each one's final status.",
  },
  {
    question: "Why does it only flag \"true\" broken links, not redirects?",
    answer: "Every fetch follows redirects by hand and re-validates each hop, so a link that 301s to a working page ends up looking fine here — what's left broken is a genuine dead end, not just a redirect chain.",
  },
  {
    question: "How does it suggest a replacement?",
    answer: "It compares the broken URL's path words against every known-good URL found during the crawl and picks the one with the most overlapping words — a heuristic, not a guarantee of the right destination.",
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
    { label: "404 & Redirect Checker" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi 404 & Redirect Checker",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that crawls a sample of a site's internal links, finds the ones that are truly broken, and suggests the most relevant known-good page as a replacement.",
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
      title: "404 & Redirect Checker | Sokosumi",
      description: "Free 404 and redirect checker. Enter a site URL and find broken internal links, with a suggested replacement page for each. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "404 & Redirect Checker", sub: "Find broken links and their best replacement." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up</p>
      <h1>404 &amp; Redirect Checker</h1>
      <p class="tk-lede">Enter a site URL and find the internal links that are truly broken — with a suggested replacement page for each, based on the site's own known-good URLs.</p>

      <form class="tk-form" id="rcForm" novalidate>
        <label class="sr-only" for="rcUrl">Site URL</label>
        <input id="rcUrl" type="url" placeholder="https://example.com" aria-describedby="rcError" required />
        <button class="tk-submit" id="rcSubmit" type="submit">Find broken links</button>
      </form>

      <p class="tk-error" id="rcError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="rcLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Crawling and checking links…</span>
    </div>

    <section class="tk-result" id="rcResult" aria-label="Results" hidden>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Broken links</h2></div>
        <p class="tk-sub" id="rcNote" style="margin-bottom:14px"></p>
        <div id="rcTable"></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="rc-faq">
      <h2 id="rc-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The broken links are found. Someone still has to fix them.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/redirect-checker.js"], englishOnly: true })
  );
}

module.exports = { render };
