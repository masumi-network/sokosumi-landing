const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/blog-to-carousel";

const FAQ = [
  {
    question: "Where does the slide text come from?",
    answer:
      "Directly from the page: the hook slide uses the title and meta description (or the opening sentence), each section slide uses that section's own H2 heading and opening sentence, and the last slide is a fixed CTA linking back to the post. Nothing is rewritten or generated — it's an outline, not finished slide copy.",
  },
  {
    question: "Why does it only use H2 headings?",
    answer: "H2s are the most reliable signal for \"here's a new section\" across different site templates. A post with no H2 structure, or one that renders its content entirely with JavaScript, won't have anything to build slides from.",
  },
  {
    question: "How many slides does it generate?",
    answer: "One hook slide, up to 8 section slides (one per H2, in order), and one closing CTA slide — 10 slides at most, which is roughly LinkedIn's practical carousel length.",
  },
  {
    question: "Is the URL or page content stored anywhere?",
    answer: "No. The page is fetched and processed in memory for that one request only.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Blog to LinkedIn Carousel" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Blog to LinkedIn Carousel Generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that turns a blog post's own heading structure into a slide-by-slide LinkedIn carousel outline: a hook, one slide per H2 section, and a closing CTA.",
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
      title: "Blog to LinkedIn Carousel Generator | Sokosumi",
      description: "Free blog-to-carousel generator. Enter a blog post URL and get a slide-by-slide LinkedIn carousel outline built from the post's own headings. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Blog to LinkedIn Carousel Generator", sub: "Turn a post's own headings into a slide outline." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up</p>
      <h1>Blog to LinkedIn Carousel Generator</h1>
      <p class="tk-lede">Enter a blog post URL and get a slide-by-slide carousel outline built straight from the post's own headings — a hook, one slide per section, and a closing CTA.</p>

      <form class="tk-form" id="btcForm" novalidate>
        <label class="sr-only" for="btcUrl">Blog post URL</label>
        <input id="btcUrl" type="url" placeholder="https://example.com/blog/post" aria-describedby="btcError" required />
        <button class="tk-submit" id="btcSubmit" type="submit">Build the carousel</button>
      </form>

      <p class="tk-error" id="btcError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="btcLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Reading the post…</span>
    </div>

    <section class="tk-result" id="btcResult" aria-label="Results" hidden>
      <div class="tk-output">
        <div class="tk-output-head"><h2>Slides</h2><button class="tk-copy" id="btcCopy" type="button">Copy all slides</button></div>
        <div class="tk-steps" id="btcSteps"></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="btc-faq">
      <h2 id="btc-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The outline is built. Someone still has to design the slides.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the deck, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/blog-to-carousel.js"], englishOnly: true })
  );
}

module.exports = { render };
