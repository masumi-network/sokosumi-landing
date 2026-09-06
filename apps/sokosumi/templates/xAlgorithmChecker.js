const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/x-algorithm-analyzer";

const FAQ = [
  {
    question: "What is this checking against?",
    answer:
      "X (formerly Twitter) open-sourced the core of its recommendation algorithm in March 2023 (\"the-algorithm\" on GitHub). This scores a pasted post against the signals that code, and reporting on it since, documents: a penalty on off-platform links, a boost for native media, a boost for posts that generate reply conversation, and a penalty on spam-shaped formatting.",
  },
  {
    question: "Can it see my actual reach or impressions?",
    answer: "No — it has no access to X's API or your account. It reads the text you paste (plus whether you say the post has media attached) and checks it against publicly documented ranking signals. It cannot see engagement, follower count, or account history, all of which also affect reach.",
  },
  {
    question: "Why does it penalize links?",
    answer:
      "X's ranking model is documented to favor posts that keep readers on-platform. A post with an outbound link is a well-known case where reach drops — putting the link in the first reply instead is a common workaround.",
  },
  {
    question: "Is my post stored anywhere?",
    answer: "No. It's scored in memory for that one request only.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "X Algorithm Analyzer" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi X Algorithm Analyzer",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description:
      "A free X (Twitter) post analyzer that scores a pasted post against the ranking signals documented in X's open-sourced recommendation algorithm: reply conversation, off-platform links, native media, and spam formatting.",
    featureList: [
      "Reply-conversation hook detection",
      "Off-platform link penalty detection",
      "Native media and length checks",
      "Hashtag / mention / shouting spam checks",
      "Prioritized, ranked list of fixes",
    ],
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
      title: "X Algorithm Analyzer — score a post before you post it | Sokosumi",
      description:
        "Free X (Twitter) post analyzer. Paste a post and get scores against the ranking signals documented in X's open-sourced algorithm: reply hooks, off-platform links, native media and spam formatting. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "tk-tool-page",
      stylesheets: ["/assets/tool-kit.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "X Algorithm Analyzer",
        sub: "Score a post against X's documented ranking signals.",
      },
    }) +
    `<section class="tk-head" id="analyzer">
      <p class="tk-overline">Free · no sign-up</p>
      <h1>X Algorithm Analyzer</h1>
      <p class="tk-lede">Paste a post and get a score against the ranking signals documented in X's open-sourced recommendation algorithm — reply hooks, off-platform links, native media, and spam-shaped formatting.</p>

      <form class="tk-form is-stacked" id="xaaForm" novalidate>
        <label class="sr-only" for="xaaText">Post text</label>
        <textarea id="xaaText" name="text" maxlength="2000" placeholder="Paste your post here…" aria-describedby="xaaError" required></textarea>
        <label style="display:flex;align-items:center;gap:8px;font-size:13.5px;color:var(--muted-foreground)">
          <input type="checkbox" id="xaaMedia" style="width:auto" /> This post has an image, GIF or video attached
        </label>
        <button class="tk-submit" id="xaaSubmit" type="submit">Score my post</button>
      </form>

      <div class="tk-try">
        <span>Try</span>
        <button type="button" data-try="weak">A weak post</button>
        <button type="button" data-try="strong">A strong post</button>
      </div>

      <p class="tk-error" id="xaaError" role="alert" hidden></p>
    </section>

    <div class="tk-loading" id="xaaLoading" hidden>
      <span class="tk-spin" aria-hidden="true"></span>
      <span>Scoring your post…</span>
    </div>

    <section class="tk-result" id="xaaResult" aria-label="Results" hidden>
      <div class="tk-summary">
        <p class="tk-summary-score" id="xaaSummaryScore"></p>
        <div class="tk-scores" id="xaaScores" role="group" aria-label="Filter checks"></div>
        <button class="tk-copy" id="xaaCopy" type="button">Copy report</button>
      </div>
      <div class="tk-dims" id="xaaDims" data-filter=""></div>
    </section>

    <section class="tk-section" aria-labelledby="xaa-how">
      <h2 id="xaa-how">What gets scored</h2>
      <p class="tk-sub">Four dimensions, drawn from the signals X's own open-sourced ranking code — and reporting since — documents.</p>
      <div class="tk-cards">
        <div class="tk-card"><h3>Conversation prompt</h3><p>Does it invite a reply? Reply engagement is weighted well above likes or reposts.</p></div>
        <div class="tk-card"><h3>Off-platform links</h3><p>A raw link in the post text is a documented reach penalty — the first reply is the workaround.</p></div>
        <div class="tk-card"><h3>Native format</h3><p>Photos and video get preference over text-only posts, and length matters too.</p></div>
        <div class="tk-card"><h3>Spam signals</h3><p>Hashtag stuffing, mention sprees, and shouting all read as spam to the model and to readers.</p></div>
      </div>
    </section>

    <section class="tk-section" id="faq" aria-labelledby="xaa-faq">
      <h2 id="xaa-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The post is scored. Someone still has to write the next twenty.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the post, the thread, the whole campaign.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/tool-kit.js", "/assets/x-algorithm-analyzer.js"], englishOnly: true })
  );
}

module.exports = { render };
