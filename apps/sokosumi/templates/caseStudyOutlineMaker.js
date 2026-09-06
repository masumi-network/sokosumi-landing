const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/case-study-outline";

const FAQ = [
  {
    question: "How does it build the outline?",
    answer:
      "It scans your pasted story for problem-shaped sentences (\"struggled with\", \"before switching\"), solution-shaped sentences (\"implemented\", \"started using\"), result-shaped sentences (numbers, percentages, \"increased\", \"saved\"), and quoted text, then arranges what it finds into a standard Challenge / Solution / Results / Quote structure.",
  },
  {
    question: "Will it write the case study for me?",
    answer: "No — it only rearranges sentences already in your story into a structure. You still need to write the actual case study around this skeleton.",
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
    { label: "Case Study Outline Maker" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Case Study Outline Maker",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that turns a pasted customer win story into a ready-to-write case study outline: challenge, solution, results and quote.",
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
      title: "Case Study Outline Maker | Sokosumi",
      description: "Free case study outline maker. Paste a customer win story and get a ready-to-write outline: challenge, solution, results, quote. Runs entirely in your browser.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Case Study Outline Maker", sub: "Turn a win story into a ready-to-write outline." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up · nothing leaves your browser</p>
      <h1>Case Study Outline Maker</h1>
      <p class="tk-lede">Paste a customer win story — notes from a call, a Slack message, an email — and get a ready-to-write case study outline: challenge, solution, results, and quote.</p>

      <form class="tk-form is-stacked" id="csoForm" novalidate>
        <label class="sr-only" for="csoText">Customer win story</label>
        <textarea id="csoText" style="min-height:220px" placeholder="Before switching to us, [Customer] struggled with slow campaign setup. After implementing our platform, they increased output by 40% and saved 6 hours a week. &quot;This changed how our team works,&quot; said their marketing lead." required></textarea>
        <button class="tk-submit" id="csoSubmit" type="submit">Build the outline</button>
      </form>
    </section>

    <section class="tk-result" id="csoResult" aria-label="Results" hidden>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Outline</h2><button class="tk-copy" id="csoCopy" type="button">Copy outline</button></div>
        <div class="tk-steps" id="csoSteps"></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="cso-faq">
      <h2 id="cso-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The outline is built. Someone still has to write the case study.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the page, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/case-study-outline.js"], englishOnly: true })
  );
}

module.exports = { render };
