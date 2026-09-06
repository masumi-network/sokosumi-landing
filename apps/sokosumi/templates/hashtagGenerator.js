const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/hashtag-generator";

const FAQ = [
  {
    question: "How does it pick hashtags?",
    answer: "It counts the most frequent meaningful words and two-word phrases in your post (after stripping stopwords), then formats each as a hashtag — single words as-is, two-word phrases in PascalCase.",
  },
  {
    question: "Does anything leave my browser?",
    answer: "No — the whole thing runs in JavaScript in your browser. Nothing is sent to our server.",
  },
  {
    question: "Should I use all of the hashtags it suggests?",
    answer: "No — most platforms perform worse with a wall of tags. Pick the 2-5 most relevant ones for your platform rather than pasting the whole list.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Hashtag Generator" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Hashtag Generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free hashtag generator that pulls relevant hashtags out of a pasted post, entirely in your browser.",
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
      title: "Hashtag Generator — hashtags from your post | Sokosumi",
      description: "Free hashtag generator. Paste a post and get relevant hashtags, ranked by relevance. Runs entirely in your browser.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Hashtag Generator", sub: "Turn a post into a shortlist of hashtags." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up · nothing leaves your browser</p>
      <h1>Hashtag Generator</h1>
      <p class="tk-lede">Paste a post and get a shortlist of relevant hashtags, pulled from the words and phrases you actually used — entirely in your browser.</p>

      <form class="tk-form is-stacked" id="hgForm" novalidate>
        <label class="sr-only" for="hgText">Post text</label>
        <textarea id="hgText" style="min-height:160px" placeholder="Paste your post here…" required></textarea>
        <button class="tk-submit" id="hgSubmit" type="submit">Generate hashtags</button>
      </form>
    </section>

    <section class="tk-result" id="hgResult" aria-label="Results" hidden>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Suggested hashtags</h2><button class="tk-copy" id="hgCopy" type="button">Copy hashtags</button></div>
        <div class="tk-cloud" id="hgCloud"></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="hg-faq">
      <h2 id="hg-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The hashtags are picked. Someone still has to write the next hundred posts.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the post, the caption, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/hashtag-generator.js"], englishOnly: true })
  );
}

module.exports = { render };
