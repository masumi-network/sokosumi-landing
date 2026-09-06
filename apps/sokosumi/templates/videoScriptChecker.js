const shell = require("./shell");

const { esc, pageStart, pageEnd, SITE } = shell;

const PATH = "/tools/video-script-checker";

const FAQ = [
  {
    question: "What does the video script checker look at?",
    answer:
      "Paste a short-form video script — the voiceover or on-screen dialogue for a Reel, TikTok or YouTube Short — and it reads the text for three things: hook quality (does the opening line earn the first two seconds before a thumb swipes past), retention and pacing (runtime at a natural speaking pace, sentence length, filler words, and whether there's a pattern break partway through), and CTA clarity (is there one clear ask at the end).",
  },
  {
    question: "Is this predicting how well my video will actually perform?",
    answer:
      "No — it isn't a black-box virality predictor and has no access to your account, your audience, or the platform's algorithm. It checks concrete, well-documented signals that correlate with short-form retention: a slow-wind-up opener, a runtime that overruns the completion-rate window, filler words, and a missing call to action. Think of it as a script linter, not a crystal ball.",
  },
  {
    question: "Where does the runtime estimate come from?",
    answer:
      "Word count divided by a natural spoken pace of about 2.5 words per second — a reasonable default for narrated short-form video, not a measurement of your actual delivery. If you talk faster or slower than that, treat the estimate as directional.",
  },
  {
    question: "Does it work for any platform?",
    answer:
      "The runtime window (roughly 15–90 seconds) and pattern-break guidance are tuned for Reels, TikTok and YouTube Shorts specifically. The rest — a tight hook, short sentences, few filler words, one clear CTA — applies to short-form video scripts generally.",
  },
  {
    question: "Is my script stored anywhere?",
    answer:
      "No. The script is scored in memory for that one request and nothing is written to a database or log beyond the standard request logging any web server does.",
  },
];

function render() {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Free tools", href: "/tools" },
    { label: "Video Script Checker" },
  ];

  const appJsonLd = {
    "@type": "SoftwareApplication",
    "@id": `${SITE}${PATH}#software`,
    name: "Sokosumi Video Script Checker",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE}${PATH}`,
    description:
      "A free video script checker that scores a pasted short-form video script — Reels, TikTok or YouTube Shorts — on hook quality, retention and pacing, and CTA clarity, with a full breakdown and fixes.",
    featureList: [
      "Hook-quality scoring against the first two seconds of a short-form video",
      "Estimated runtime from a natural speaking pace",
      "Sentence-length, filler-word and pattern-break checks",
      "Call-to-action detection",
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
      title: "Video Script Checker — score your Reels/TikTok/Shorts script | Sokosumi",
      description:
        "Free video script checker. Paste a Reels, TikTok or YouTube Shorts script and get scores on hook quality, retention & pacing, and CTA clarity, plus a ranked list of fixes. No sign-up.",
      path: PATH,
      englishOnly: true,
      breadcrumb: crumbs,
      mainClass: "vsc-tool-page",
      stylesheets: ["/assets/video-script-checker.css"],
      jsonld: [appJsonLd, faqJsonLd],
      og: {
        type: "page",
        title: "Video Script Checker",
        sub: "Score your video script's hook, pacing and CTA before you film.",
      },
    }) +
    `<section class="vsc-head" id="checker">
      <p class="vsc-overline">Free · no sign-up</p>
      <h1>Video Script Checker</h1>
      <p class="vsc-lede">Paste the script for a Reel, TikTok or YouTube Short and get a score on its hook, its pacing, and its call to action — with the exact lines that are costing you retention.</p>

      <form class="vsc-form" id="vscForm" novalidate>
        <label class="sr-only" for="vscText">Video script</label>
        <textarea id="vscText" name="text" rows="9" maxlength="4000" placeholder="Paste your video script here…" aria-describedby="vscError" required></textarea>
        <button class="vsc-submit" id="vscSubmit" type="submit">Score my script</button>
      </form>

      <div class="vsc-try">
        <span>Try</span>
        <button type="button" data-try="weak">A weak script</button>
        <button type="button" data-try="strong">A strong script</button>
      </div>

      <p class="vsc-error" id="vscError" role="alert" hidden></p>
    </section>

    <div class="vsc-loading" id="vscLoading" hidden>
      <span class="vsc-spin" aria-hidden="true"></span>
      <span>Scoring your script…</span>
    </div>

    <section class="vsc-result" id="vscResult" aria-label="Results" hidden>
      <div class="vsc-summary">
        <p class="vsc-summary-score" id="vscSummaryScore"></p>
        <div class="vsc-scores" id="vscScores" role="group" aria-label="Filter checks"></div>
        <button class="vsc-copy" id="vscCopy" type="button">Copy report</button>
      </div>
      <div class="vsc-dims" id="vscDims" data-filter=""></div>
    </section>

    <section class="vsc-section" aria-labelledby="vsc-how">
      <h2 id="vsc-how">What gets scored</h2>
      <p class="vsc-sub">Three dimensions, each built from concrete, checkable signals — not a guess at how an algorithm will treat it.</p>
      <div class="vsc-cards">
        <div class="vsc-card"><h3>Hook quality</h3><p>Does the opening line skip the greeting and channel intro, stay under about 15 words, and give a viewer a reason — a question, a number, a claim — to keep watching past the first beat.</p></div>
        <div class="vsc-card"><h3>Retention &amp; pacing</h3><p>Runtime at a natural speaking pace, sentence length, filler words, and whether there's a pattern break — a cut, twist, or beat change — partway through to reset attention.</p></div>
        <div class="vsc-card"><h3>CTA clarity</h3><p>Is there one clear, specific ask near the end — follow, comment, save, link in bio — or does the script just stop.</p></div>
      </div>
    </section>

    <section class="vsc-section" id="faq" aria-labelledby="vsc-faq">
      <h2 id="vsc-faq">Questions</h2>
      <div class="faq-list" style="margin-top:26px">
        ${FAQ.map(
          (item) =>
            `<details class="faq-item"><summary>${esc(item.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(item.answer)}</p></details>`,
        ).join("")}
      </div>
    </section>` +
    shell.ctaBand({
      heading: "The script is scored. Someone still has to film, cut and post it.",
      subheading: "Sokosumi's AI coworkers turn a brief into a finished file: the script, the shot list, the whole content calendar.",
      ctaLabel: "Sign up free",
    }) +
    pageEnd({ scripts: ["/assets/video-script-checker.js"], englishOnly: true })
  );
}

module.exports = { render };
