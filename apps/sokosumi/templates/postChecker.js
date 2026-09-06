const shell = require("./shell");

const { esc, attr, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/social-post-checker";

const DAY_OPTIONS = [
  ["mon", "Monday"],
  ["tue", "Tuesday"],
  ["wed", "Wednesday"],
  ["thu", "Thursday"],
  ["fri", "Friday"],
  ["sat", "Saturday"],
  ["sun", "Sunday"],
];

const TIME_OPTIONS = [
  ["6-8", "Early morning (6–8am)"],
  ["8-10", "Mid-morning (8–10am)"],
  ["10-12", "Late morning (10am–12pm)"],
  ["12-14", "Midday (12–2pm)"],
  ["14-16", "Afternoon (2–4pm)"],
  ["16-18", "Late afternoon (4–6pm)"],
  ["18-24", "Evening (6pm–12am)"],
  ["0-6", "Overnight (12–6am)"],
];

const FAQ = [
  {
    question: "What does this social post checker look at?",
    answer:
      "Paste a post — as text, or as a link to one that's already live — and it reads the text for six things: hook quality (does the first line earn a click before \"see more\" cuts it), CTA clarity (is there a specific ask at the end), engagement-shaping formatting (length, paragraph rhythm, outbound links, hashtag count, tone), readability (sentence length, active vs passive voice), specificity and credibility (concrete numbers, cited evidence), and — if you give it a planned day and time — timing against general posting-pattern data.",
  },
  {
    question: "How does the LinkedIn link option work?",
    answer:
      "Paste the URL of a public LinkedIn post — a linkedin.com/posts/... or /feed/update/... link — and we read the post's text server-side, the same way a search engine would, then score it exactly like pasted text. No login, no LinkedIn account connected. It only works on posts LinkedIn serves publicly; a post visible to connections only, or one that's been removed, will fail and you can paste its text instead.",
  },
  {
    question: "Is this actually predicting engagement?",
    answer:
      "No — it isn't a black-box engagement predictor and doesn't claim to know how your specific audience will react. It checks concrete, well-documented signals that correlate with reach on LinkedIn-style feeds: whether the hook survives truncation, whether there's a real call to action, whether the post has an outbound link (a known reach suppressor), formatting rhythm, and hashtag count. Think of it as a linter for your post, not a crystal ball.",
  },
  {
    question: "Does it work for platforms other than LinkedIn?",
    answer:
      "The hook-truncation length and the timing table are tuned for LinkedIn's B2B feed specifically. The rest — a clear CTA, short skimmable paragraphs, not burying the post under hashtags, watching for shouting — applies to short-form posts on most platforms.",
  },
  {
    question: "Where does the timing guidance come from?",
    answer:
      "General, widely observed B2B posting patterns — not your account's actual audience data, which this tool has no access to. Treat the timing score as a reasonable default, not a personalized recommendation. If you have your own analytics on when your audience is active, trust that instead.",
  },
  {
    question: "Is my post text stored anywhere?",
    answer:
      "No. Whether you paste text or a link, the post is scored in memory for that one request and nothing is written to a database or log beyond the standard request logging any web server does.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Social post checker" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Social Post Checker",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description:
      "A free social post checker that scores a pasted LinkedIn-style post — or a link to one that's already live — on hook quality, CTA clarity, engagement-shaping formatting, readability, specificity/credibility, and optional posting-time fit.",
    featureList: [
      "Score a draft by pasting its text, or a live post by pasting its link",
      "Hook quality scoring against LinkedIn's truncation point",
      "Call-to-action detection",
      "Formatting, link and hashtag checks",
      "Readability scoring (sentence length, active vs passive voice)",
      "Specificity and cited-evidence detection",
      "Optional day/time timing score",
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
      title: "Social post checker — score your LinkedIn post before you publish | Sokosumi",
      description:
        "Free social post checker. Paste a LinkedIn-style post — or a link to one already live — and get scores on hook quality, CTA clarity, engagement-shaping formatting, readability, specificity/credibility, and timing. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "psc-tool-page",
      stylesheets: ["/assets/post-checker.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "Social post checker",
        sub: "Score your post's hook, CTA, formatting and timing before you publish.",
      },
    }) +
    `<section class="psc-head" id="checker">
      <p class="psc-overline">Free · no sign-up</p>
      <h1>Social post checker</h1>
      <p class="psc-lede">Paste a draft, or a link to a post that's already live, and get a score on its hook, its call to action, its formatting, and — if you tell us when you're posting — its timing.</p>

      <form class="psc-form" id="pscForm" novalidate>
        <div class="psc-mode" role="tablist" aria-label="How to give us the post">
          <button type="button" role="tab" id="pscModeText" aria-selected="true" data-mode="text">Paste text</button>
          <button type="button" role="tab" id="pscModeUrl" aria-selected="false" data-mode="url">Paste a LinkedIn link</button>
        </div>

        <label class="sr-only" for="pscText">Post text</label>
        <textarea id="pscText" name="text" rows="9" maxlength="5000" placeholder="Paste your post here…" aria-describedby="pscError" required></textarea>

        <label class="sr-only" for="pscUrl">LinkedIn post link</label>
        <input id="pscUrl" name="url" type="text" inputmode="url" autocomplete="url" spellcheck="false" placeholder="https://www.linkedin.com/posts/…" aria-describedby="pscError" hidden />

        <div class="psc-timing-row">
          <div class="psc-field">
            <label for="pscDay">Planned day <span>(optional)</span></label>
            <select id="pscDay" name="day">
              <option value="">— Day —</option>
              ${DAY_OPTIONS.map(([value, label]) => `<option value="${attr(value)}">${esc(label)}</option>`).join("")}
            </select>
          </div>
          <div class="psc-field">
            <label for="pscTime">Planned time <span>(optional)</span></label>
            <select id="pscTime" name="timeBucket">
              <option value="">— Time —</option>
              ${TIME_OPTIONS.map(([value, label]) => `<option value="${attr(value)}">${esc(label)}</option>`).join("")}
            </select>
          </div>
          <button class="psc-submit" id="pscSubmit" type="submit">Score my post</button>
        </div>
      </form>

      <div class="psc-try">
        <span>Try</span>
        <button type="button" data-try="weak">A weak post</button>
        <button type="button" data-try="strong">A strong post</button>
      </div>

      <p class="psc-error" id="pscError" role="alert" hidden></p>
    </section>

    <div class="psc-loading" id="pscLoading" hidden>
      <span class="psc-spin" aria-hidden="true"></span>
      <span>Scoring your post…</span>
    </div>

    <section class="psc-result" id="pscResult" aria-label="Results" hidden>
      <div class="psc-summary">
        <p class="psc-summary-score" id="pscSummaryScore"></p>
        <div class="psc-scores" id="pscScores" role="group" aria-label="Filter checks"></div>
        <button class="psc-copy" id="pscCopy" type="button">Copy report</button>
      </div>
      <div class="psc-dims" id="pscDims" data-filter=""></div>
    </section>

    <section class="psc-section" aria-labelledby="psc-how">
      <h2 id="psc-how">What gets scored</h2>
      <p class="psc-sub">Four dimensions, each built from concrete, checkable signals — not a guess at what a reader will feel.</p>
      <div class="psc-cards">
        <div class="psc-card"><h3>Hook quality</h3><p>Does the first line fit before LinkedIn's "see more" truncation, and does it give a reader a reason to keep reading — a question, a number, a claim — rather than opening with a cliché.</p></div>
        <div class="psc-card"><h3>CTA clarity</h3><p>Is there one clear, specific ask near the end — comment, reply, follow, tag someone — or does the post just stop.</p></div>
        <div class="psc-card"><h3>Engagement potential</h3><p>Length, paragraph rhythm, outbound links in the body, hashtag count, and tone — the formatting signals that shape how far a post travels.</p></div>
        <div class="psc-card"><h3>Readability</h3><p>Sentence length and active-vs-passive voice — how fast the post reads in a scrolling feed.</p></div>
        <div class="psc-card"><h3>Specificity &amp; credibility</h3><p>Does it back its claim with a concrete number or cited evidence, or ask the reader to take it on faith.</p></div>
        <div class="psc-card"><h3>Timing</h3><p>Optional: tell it a planned day and time and it scores that slot against general B2B posting patterns — not your own audience data.</p></div>
      </div>
    </section>

    <section class="psc-section" id="faq" aria-labelledby="psc-faq">
      <h2 id="psc-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The post is scored. Someone still has to write the next ten.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the post, the campaign, the whole content calendar.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/post-checker.js"], englishOnly: true })
  );
}

module.exports = { render };
