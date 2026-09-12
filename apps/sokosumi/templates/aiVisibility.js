const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const FAQ = [
  {
    question: "What does this AI visibility checker actually test?",
    answer:
      "It asks an AI model five buyer questions about your category — best, recommended, most popular, shortlist, small budget — and records which brands the model names in each answer. You see whether you appear, where you rank when you do, and which competitors the model reaches for instead.",
  },
  {
    question: "Is this my ranking in ChatGPT?",
    answer:
      "No. It is one model (the page shows which), five questions, at the moment you run the check. Different assistants and different phrasings give different answers. Treat it the way you treat a rank tracker sample: a signal, not a census.",
  },
  {
    question: "Why does an AI assistant not mention my brand?",
    answer:
      "Models recommend brands they saw named, described and compared in their training data and in the sources they retrieve. If the public record of what you sell is thin or contradictory, the model has nothing to hang a recommendation on. Clear category wording on your site, entity pages, comparison pages and an llms.txt file all help.",
  },
  {
    question: "How do I improve my AI visibility?",
    answer:
      "Say plainly, in public, what you are: a one-line category definition on your homepage and about page, consistent naming everywhere, comparison and alternatives pages, and structured data. Then check back — models update on crawl cycles, not on deploys, so changes take time to show up.",
  },
];

function render() {
  const path = "/tools/ai-visibility";
  const crumbs = [{ label: "Home", href: "/" }, { label: "Free tools", href: "/tools" }, { label: "AI visibility checker" }];
  const faqJsonLd = {
    "@type": "FAQPage",
    "@id": `${SITE}${path}#faq`,
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  const appJsonLd = {
    "@type": "WebApplication",
    "@id": `${SITE}${path}#software`,
    name: "Sokosumi AI Visibility Checker",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${SITE}${path}`,
    description:
      "A free AI visibility checker: ask an AI model five buyer questions about your category and see whether it names your brand, where you rank, and which competitors it recommends instead.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    creator: { "@id": `${SITE}/#organization` },
  };

  return (
    pageStart({
      title: "Free AI visibility checker — are you in the AI's answer? | Sokosumi",
      description:
        "Check your AI visibility: we ask an AI model five buyer questions about your category and report whether it names your brand, your rank, and the competitors it recommends instead. Free, no sign-up.",
      path,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "design-tool-page",
      stylesheets: ["/assets/design-md.css", "/assets/ai-visibility.css", "/assets/email-gate.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "AI visibility checker",
        sub: "Are you in the AI's answer when buyers ask?",
      },
    }) +
    `<section class="dm-tool" id="checker">
      <header class="dm-tool-head">
        <div>
          <p class="dm-overline">Tool · Free</p>
          <h1>AI Visibility Checker</h1>
        </div>
        <p class="dm-tool-meta"><span class="dm-live">Live</span></p>
      </header>
      <p class="dm-tool-sub">Buyers now ask assistants "what's the best…" instead of searching. This tool asks an AI model five of those questions about your category and shows whether the answer includes you.</p>

      <form class="aiv-form" id="aivForm" novalidate>
        <div class="aiv-fields">
          <div class="aiv-field">
            <label for="aivBrand">Your brand or product</label>
            <input id="aivBrand" name="brand" type="text" placeholder="Acme CRM" autocomplete="organization" required />
          </div>
          <div class="aiv-field">
            <label for="aivCategory">Your category, as a buyer would say it</label>
            <input id="aivCategory" name="category" type="text" placeholder="CRM software for small businesses" required />
          </div>
          <div class="aiv-field">
            <label for="aivWebsite">Website <span>optional</span></label>
            <input id="aivWebsite" name="website" type="text" inputmode="url" placeholder="acme.com" />
          </div>
        </div>
        <button class="dm-submit btn btn-primary" id="aivSubmit" type="submit">
          <span class="dm-submit-label">Check visibility</span>
          <span class="dm-submit-loading" hidden>Asking the model…</span>
        </button>
      </form>
      <p class="dm-error" id="aivError" role="alert" hidden></p>

      <div class="aiv-output" id="aivOutput" hidden aria-live="polite"></div>
    </section>

    <section class="dm-how" aria-labelledby="aiv-how">
      <p class="dm-overline">How it works</p>
      <h2 id="aiv-how">Five buyer questions, one honest report.</h2>
      <ol>
        <li><span>01</span><h3>Name your category</h3><p>Use the words a buyer would use — "email marketing tools", not your own product language.</p></li>
        <li><span>02</span><h3>The model answers</h3><p>We ask five buying questions — best, recommended, most popular, shortlist, small budget — and record every brand it names.</p></li>
        <li><span>03</span><h3>See where you stand</h3><p>Mentions, your rank in each answer, and the competitors the model reaches for when it does not pick you.</p></li>
      </ol>
    </section>

    <section class="aiv-improve" aria-labelledby="aiv-improve-h">
      <h2 id="aiv-improve-h">Not mentioned? Here is what actually moves it.</h2>
      <p>Models recommend brands whose public information makes the category obvious. Four things you control:</p>
      <ul>
        <li><strong>Say your category in one line.</strong> "Acme is a CRM for small construction firms" on your homepage and about page — in text, not in an image.</li>
        <li><strong>Publish an llms.txt.</strong> A file that tells AI crawlers what your site is and where the important pages are. <a href="/tools/llms-txt">Check yours here</a>.</li>
        <li><strong>Build comparison pages.</strong> Models learn categories from pages that compare products. If nobody compares you to the leaders, do it yourself.</li>
        <li><strong>One spelling, everywhere.</strong> A model cannot merge "Acme", "AcmeCRM" and "Acme Software" into one reputation, so pick a name and hold it.</li>
      </ul>
    </section>

    <section class="dm-faq" id="faq" aria-labelledby="aiv-faq-title">
      <h2 id="aiv-faq-title">Questions</h2>
      <div class="faq-list">
        ${FAQ.map(
          (item) => `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "Want to be the brand the AI names?",
      subheading: "Sokosumi's AI coworkers write the comparison pages and entity pages that get you there.",
      ctaLabel: "Start free",
    }) +
    pageEnd({ scripts: ["/assets/ai-visibility.js", "/assets/email-gate.js"], englishOnly: true })
  );
}

module.exports = { render };
