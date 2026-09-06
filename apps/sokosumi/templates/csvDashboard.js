const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/csv-dashboard";

const FAQ = [
  {
    question: "What does it chart?",
    answer:
      "It detects which columns are numeric, which look like dates, and which are plain text. It shows a stat tile per numeric column, a bar chart of your first text column grouped against your first numeric column, and — if a date-like column exists — a line chart of that numeric column over time.",
  },
  {
    question: "Does my file get uploaded anywhere?",
    answer: "No — the CSV is parsed and charted entirely in your browser with the File API. Nothing is sent to our server.",
  },
  {
    question: "What CSV format does it expect?",
    answer: "A standard comma-separated file with a header row. Quoted fields containing commas are supported.",
  },
  {
    question: "How large a file can I use?",
    answer: "It's fine well into the tens of thousands of rows, since it's just parsing and aggregating in memory — but very large files (tens of megabytes) may be slow in the browser.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "CSV to Instant Dashboard" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi CSV to Instant Dashboard",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that turns an uploaded CSV file into an instant dashboard — stat tiles, a bar chart and a time-series chart — entirely in your browser.",
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
      title: "CSV to Instant Dashboard | Sokosumi",
      description: "Free CSV to dashboard tool. Upload a CSV and get stat tiles, a bar chart and a time-series chart, entirely in your browser. No sign-up, no upload.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css", "/assets/csv-dashboard.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "CSV to Instant Dashboard", sub: "Upload a CSV, get a dashboard, in your browser." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up · nothing leaves your browser</p>
      <h1>CSV to Instant Dashboard</h1>
      <p class="tk-lede">Upload a CSV and get stat tiles, a bar chart and — if it has dates — a time-series chart, built entirely in your browser. Nothing is uploaded anywhere.</p>

      <form class="tk-form" id="cdForm" novalidate>
        <input id="cdFile" type="file" accept=".csv,text/csv" required />
        <button class="tk-submit" id="cdSubmit" type="submit">Build the dashboard</button>
      </form>

      <p class="tk-error" id="cdError" role="alert" hidden></p>
    </section>

    <section class="tk-result" id="cdResult" aria-label="Results" hidden>
      <div class="tk-cards" id="cdStats"></div>
      <div class="tk-output" id="cdBarWrap" hidden>
        <div class="tk-output-head"><h2 id="cdBarTitle">By category</h2></div>
        <div id="cdBar"></div>
      </div>
      <div class="tk-output" id="cdLineWrap" hidden>
        <div class="tk-output-head"><h2 id="cdLineTitle">Over time</h2></div>
        <div id="cdLine"></div>
      </div>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Preview (first 20 rows)</h2></div>
        <div id="cdTable"></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="cd-faq">
      <h2 id="cd-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The dashboard is built. Someone still has to act on it.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the report, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/csv-dashboard.js"], englishOnly: true })
  );
}

module.exports = { render };
