const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/re-engagement-builder";

const FAQ = [
  {
    question: "What does it generate?",
    answer: "A 3-email re-engagement sequence structure — a friendly reminder, an incentive email, and a last-chance email — each with a suggested subject line and angle, built around the product or topic name it finds in your pasted email.",
  },
  {
    question: "Will it write the full emails for me?",
    answer: "No — it gives you a subject line and a one-line angle for each of the 3 emails. You still write the actual body copy.",
  },
  {
    question: "Does anything leave my browser?",
    answer: "No — the whole thing runs in JavaScript in your browser.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Re-engagement Campaign Builder" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Re-engagement Campaign Builder",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that turns a pasted old email into a 3-part re-engagement sequence structure with suggested subject lines and angles.",
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
      title: "Re-engagement Campaign Builder | Sokosumi",
      description: "Free re-engagement campaign builder. Paste an old email and get a 3-part re-engagement sequence with suggested subject lines and angles. Runs entirely in your browser.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Re-engagement Campaign Builder", sub: "Turn an old email into a 3-part sequence." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up · nothing leaves your browser</p>
      <h1>Re-engagement Campaign Builder</h1>
      <p class="tk-lede">Paste an old email — a newsletter, a product update, an announcement — and get a 3-part re-engagement sequence with a suggested subject line and angle for each email.</p>

      <form class="tk-form is-stacked" id="rebForm" novalidate>
        <label class="sr-only" for="rebText">Old email</label>
        <textarea id="rebText" style="min-height:180px" placeholder="Paste your old email here…" required></textarea>
        <button class="tk-submit" id="rebSubmit" type="submit">Build the sequence</button>
      </form>
    </section>

    <section class="tk-result" id="rebResult" aria-label="Results" hidden>
      <div class="tk-output">
        <div class="tk-output-head"><h2>3-email sequence</h2><button class="tk-copy" id="rebCopy" type="button">Copy sequence</button></div>
        <div class="tk-steps" id="rebSteps"></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="reb-faq">
      <h2 id="reb-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The sequence is structured. Someone still has to write the emails.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the campaign, the whole sequence.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/re-engagement-builder.js"], englishOnly: true })
  );
}

module.exports = { render };
