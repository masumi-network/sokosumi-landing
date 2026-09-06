const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/schema-generator";

const FAQ = [
  {
    question: "What schema types does it support?",
    answer: "Article, Product, FAQPage, Organization, LocalBusiness, HowTo, and Review — the types most marketing and content pages actually need.",
  },
  {
    question: "Where do I put the output?",
    answer: 'Paste it into a <script type="application/ld+json"> tag in the page\'s <head> (or anywhere in the body — search engines read it either way).',
  },
  {
    question: "Does anything leave my browser?",
    answer: "No — the JSON-LD is built entirely in JavaScript in your browser from the fields you fill in.",
  },
  {
    question: "Will this guarantee a rich result in search?",
    answer: "No — valid schema is necessary but not sufficient for a rich result. Google and other engines decide independently whether and how to show one, based on content quality and their own eligibility rules.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Schema Markup Generator" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Schema Markup Generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free JSON-LD schema markup generator for Article, Product, FAQPage, Organization, LocalBusiness, HowTo and Review types, built entirely in your browser.",
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

  const field = (id, label, placeholder, type = "text") =>
    `<div class="tk-field"><label for="${id}">${esc(label)}</label><input id="${id}" type="${type}" placeholder="${esc(placeholder)}" /></div>`;
  const area = (id, label, placeholder) =>
    `<div class="tk-field"><label for="${id}">${esc(label)}</label><textarea id="${id}" style="min-height:90px" placeholder="${esc(placeholder)}"></textarea></div>`;

  return (
    pageStart({
      title: "Schema Markup Generator — free JSON-LD builder | Sokosumi",
      description: "Free schema markup generator. Build valid JSON-LD for Article, Product, FAQPage, Organization, LocalBusiness, HowTo and Review pages, entirely in your browser.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Schema Markup Generator", sub: "Build valid JSON-LD in your browser." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up · nothing leaves your browser</p>
      <h1>Schema Markup Generator</h1>
      <p class="tk-lede">Pick a type, fill in the fields, and get valid JSON-LD ready to paste into your page — built entirely in your browser.</p>

      <form class="tk-form is-stacked" id="smgForm" novalidate>
        <div class="tk-field">
          <label for="smgType">Schema type</label>
          <select id="smgType" style="height:44px;border:1px solid var(--border);border-radius:var(--r-md);background:var(--background);color:var(--foreground);font:inherit;font-size:15px;padding:0 12px">
            <option value="Article">Article</option>
            <option value="Product">Product</option>
            <option value="FAQPage">FAQ Page</option>
            <option value="Organization">Organization</option>
            <option value="LocalBusiness">Local Business</option>
            <option value="HowTo">How-To</option>
            <option value="Review">Review</option>
          </select>
        </div>

        <div data-fields="Article">
          ${field("art-headline", "Headline", "7 Free Marketing Tools That Cut Setup Time in Half")}
          ${field("art-author", "Author name", "Jordan Reyes")}
          ${field("art-date", "Date published (YYYY-MM-DD)", "2026-01-15")}
          ${field("art-image", "Image URL", "https://example.com/cover.jpg", "url")}
        </div>
        <div data-fields="Product" hidden>
          ${field("prod-name", "Product name", "Sokosumi Pro Plan")}
          ${area("prod-desc", "Description", "What the product does…")}
          ${field("prod-price", "Price", "49")}
          ${field("prod-currency", "Currency (ISO code)", "EUR")}
          ${field("prod-availability", "Availability", "InStock")}
        </div>
        <div data-fields="FAQPage" hidden>
          ${area("faq-pairs", "Questions and answers", "Q: What does it check?\nA: It checks four things…\n\nQ: Is it free?\nA: Yes, no sign-up required.")}
        </div>
        <div data-fields="Organization" hidden>
          ${field("org-name", "Organization name", "Sokosumi")}
          ${field("org-url", "URL", "https://sokosumi.com", "url")}
          ${field("org-logo", "Logo URL", "https://sokosumi.com/logo.png", "url")}
          ${area("org-sameas", "Social profile URLs, one per line", "https://x.com/sokosumi\nhttps://linkedin.com/company/sokosumi")}
        </div>
        <div data-fields="LocalBusiness" hidden>
          ${field("lb-name", "Business name", "Example Cafe")}
          ${field("lb-address", "Street address", "123 Main St, Berlin, Germany")}
          ${field("lb-phone", "Phone", "+49 30 1234567")}
          ${field("lb-pricerange", "Price range", "€€")}
        </div>
        <div data-fields="HowTo" hidden>
          ${field("how-name", "How-to title", "How to set up a campaign")}
          ${area("how-steps", "Steps, one per line", "Create a new campaign\nAdd your audience\nWrite the copy\nSchedule it")}
        </div>
        <div data-fields="Review" hidden>
          ${field("rev-item", "Item reviewed", "Sokosumi")}
          ${field("rev-author", "Author name", "Jordan Reyes")}
          ${field("rev-rating", "Rating (1-5)", "5")}
          ${area("rev-body", "Review text", "What made this worth reviewing…")}
        </div>

        <button class="tk-submit" id="smgSubmit" type="submit">Generate JSON-LD</button>
      </form>
    </section>

    <section class="tk-result" id="smgResult" aria-label="Results" hidden>
      <div class="tk-output">
        <div class="tk-output-head"><h2>JSON-LD</h2><button class="tk-copy" id="smgCopy" type="button">Copy JSON-LD</button></div>
        <pre id="smgOutput"></pre>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="smg-faq">
      <h2 id="smg-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The markup is generated. Someone still has to build the page around it.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/schema-markup-generator.js"], englishOnly: true })
  );
}

module.exports = { render };
