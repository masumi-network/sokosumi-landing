const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/blog-to-social-week";

const FAQ = [
  {
    question: "Where does each day's post come from?",
    answer:
      "Directly from the page: the meta description for the announcement post, any numbers/stats found in the text, any quoted text, and the first few H2 sections' opening sentences. Nothing is rewritten or invented — every draft ends with a link back to the source post.",
  },
  {
    question: "Why don't I always get 7 days?",
    answer: "You get one draft per usable signal the page actually has. A post with no stats and no quotes might only produce 4-5 days rather than 7 — that's a reflection of the source content, not a bug.",
  },
  {
    question: "Are these ready to publish as-is?",
    answer: "Treat them as first drafts, not finished posts — they're built mechanically from the page's own text, so they'll usually need a pass to sound like you before going out.",
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
    { label: "Blog to a Week of Social Posts" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Blog to Social Week",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description: "A free tool that turns one blog post URL into up to 7 days of structured social post drafts, built from the post's own stats, quotes and section headlines.",
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
      title: "Blog URL to a Week of Social Posts | Sokosumi",
      description: "Free blog-to-social-week generator. Enter a blog post URL and get up to 7 days of structured post drafts built from the page's own stats, quotes and sections. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: { type: "page", title: "Blog to a Week of Social Posts", sub: "One post in, a week of drafts out." },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up</p>
      <h1>Blog URL to a Week of Social Posts</h1>
      <p class="tk-lede">Enter a blog post URL and get up to 7 days of structured post drafts — built from the post's own stats, quotes and section headlines, not generated from nothing.</p>

      <form class="tk-form" id="btwForm" novalidate>
        <label class="sr-only" for="btwUrl">Blog post URL</label>
        <input id="btwUrl" type="url" placeholder="https://example.com/blog/post" aria-describedby="btwError" required />
        <button class="tk-submit" id="btwSubmit" type="submit">Build the week</button>
      </form>

      <p class="tk-error" id="btwError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="btwLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Reading the post…</span>
    </div>

    <section class="tk-result" id="btwResult" aria-label="Results" hidden>
      <div class="tk-output">
        <div class="tk-output-head"><h2>This week's posts</h2><button class="tk-copy" id="btwCopy" type="button">Copy all</button></div>
        <div class="tk-steps" id="btwSteps"></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="btw-faq">
      <h2 id="btw-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The week is drafted. Someone still has to schedule it.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the copy, the calendar, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/blog-to-social-week.js"], englishOnly: true })
  );
}

module.exports = { render };
