// /compare/<a>-vs-<b> — third-party style pages comparing two tools we do not
// sell, with a clearly separated note that Sokosumi is a third option when the
// team wants finished marketing work. Content lives in
// content/compare-pairs/<slug>.json (see _BRIEF.md there): English written
// from primary sources, German added by a copy pass. A pair without German
// serves English on /de and stays out of the German index.

const fs = require("fs");
const path = require("path");
const shell = require("./shell");
const cms = require("../lib/cms");
const blocks = require("./blocks");
const i18n = require("../lib/i18n");
const { t } = i18n;
const { esc, attr, icon, pageStart, pageEnd, SITE } = shell;

const DIR = path.join(__dirname, "..", "content", "compare-pairs");
const CMS_MEDIA = `${cms.CMS_URL}/api/media/file/compare-logo-`;

// Logo files uploaded to the CMS media collection (ids in _logos.json); svg
// for the few that had a vector mark, png for the rest.
const SVG = new Set(["claude", "claude-code", "perplexity", "hubspot"]);
function logoUrl(key) {
  const k = key === "codex" ? "chatgpt" : key;
  return `${CMS_MEDIA}${k}.${SVG.has(k) ? "svg" : "png"}`;
}

let cache = { at: 0, pairs: [] };
function load() {
  if (Date.now() - cache.at < 60_000 && cache.pairs.length) return cache.pairs;
  const pairs = [];
  for (const f of fs.readdirSync(DIR)) {
    if (!f.endsWith(".json") || f.startsWith("_")) continue;
    try {
      const doc = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
      if (doc.slug && doc.a && doc.b && doc.en) pairs.push(doc);
    } catch (e) {
      console.error(`[compare-pairs] ${f}: ${e.message}`);
    }
  }
  cache = { at: Date.now(), pairs: pairs.sort((x, y) => x.slug.localeCompare(y.slug)) };
  return pairs;
}

function all() {
  return load();
}
function get(slug) {
  return load().find((p) => p.slug === slug) || null;
}

// Locale copy: German when the pass has run, English otherwise.
function copy(p) {
  const loc = i18n.locale();
  return { c: loc === "de" && p.de ? p.de : p.en, translated: loc !== "de" || !!p.de };
}

function mark(tool, size) {
  const px = size === "lg" ? 48 : 24;
  return `<span class="cmp-mark cmp-mark-logo"><img${shell.thumbSrc(logoUrl(tool.key), px * 2, "src", 100)} alt="" width="${px}" height="${px}" loading="lazy" decoding="async" /><span>${esc(tool.name)}</span></span>`;
}

function lockup(p, size) {
  return `<div class="cmp-versus${size === "lg" ? " is-lg" : ""}" aria-label="${attr(p.a.name)} vs ${attr(p.b.name)}">
    ${mark(p.a, size)}<em>vs</em>${mark(p.b, size)}
  </div>`;
}

function card(p) {
  const { c } = copy(p);
  return `<a class="card cmp-card" href="/compare/${encodeURIComponent(p.slug)}">
    ${lockup(p)}
    <h3>${esc(c.title)}</h3>
    <p>${esc(c.description || c.intro || "")}</p>
    <div class="card-foot"><span>${esc(t("Read the comparison"))}</span><span class="go">${icon("arrow-up-right", 15)}</span></div>
  </a>`;
}

function pickList(pick, tool) {
  return `<div class="pair-pick">
    <h3>${esc(pick.heading)}</h3>
    <ul>${pick.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
  </div>`;
}

async function detail(ctx) {
  const p = get(ctx.params.slug);
  if (!p) return null;
  const { c, translated } = copy(p);
  const testimonials = await cms.getTestimonials({ draft: ctx.preview }).catch(() => []);

  const table = {
    blockType: "comparisonTable",
    heading: t("{a} vs {b} at a glance", { a: p.a.name, b: p.b.name }),
    columns: [{ label: p.a.name }, { label: p.b.name }],
    rows: c.glance.map(([label, va, vb]) => ({ label, cells: [{ value: va }, { value: vb }] })),
  };
  const faqs = (c.faq || []).map(([question, answer]) => ({ question, answer }));

  const cr = [
    { label: "Home", href: "/" },
    { label: "Compare", href: "/compare" },
    { label: `${p.a.name} vs ${p.b.name}` },
  ];
  const checked = p.checked
    ? new Intl.DateTimeFormat(i18n.locale() === "de" ? "de-DE" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(p.checked))
    : null;

  return (
    pageStart({
      title: c.metaTitle || c.title,
      description: (c.description || "").slice(0, 155),
      path: `/compare/${p.slug}`,
      breadcrumb: cr,
      noindex: !translated,
      og: { type: "pair", a: p.a.name, b: p.b.name, logoA: logoUrl(p.a.key), logoB: logoUrl(p.b.key), title: c.title, sub: "" },
      // published comes from the file's first commit, checked from the last
      // fact review — the two are genuinely different dates and Google's
      // Article result wants both.
      article: { published: p.published || undefined, modified: p.checked || undefined },
      jsonld: [
        blocks.faqJsonLd(faqs),
        {
          "@type": "Article",
          headline: c.title,
          about: [
            { "@type": "SoftwareApplication", name: p.a.name, url: p.a.url },
            { "@type": "SoftwareApplication", name: p.b.name, url: p.b.url },
          ],
          author: { "@id": `${SITE}/#organization` },
          publisher: { "@id": `${SITE}/#organization` },
          ...(p.checked ? { dateModified: p.checked } : {}),
        },
      ].filter(Boolean),
    }) +
    `<div class="cmp-versus-head" data-reveal>${lockup(p, "lg")}</div>
    <section class="blk blk-hero pair-hero" data-reveal>
      <span class="eyebrow">${esc(t("Compare"))}</span>
      <h1>${esc(c.title)}</h1>
      <p class="sub">${esc(c.intro)}</p>
      ${checked ? `<p class="guide-meta"><span>${esc(t("Checked {date}", { date: checked }))}</span></p>` : ""}
    </section>` +
    blocks.renderBlocks([table]) +
    `<section class="page-section pair-picks" data-reveal>
      ${pickList(c.pickA, p.a)}
      ${pickList(c.pickB, p.b)}
    </section>
    <section class="page-section pair-limits" data-reveal>
      <h2>${esc(t("Where each one falls short"))}</h2>
      <div class="pair-limits-grid">
        <div><h3>${esc(p.a.name)}</h3><ul>${c.limits.a.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <div><h3>${esc(p.b.name)}</h3><ul>${c.limits.b.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
      </div>
    </section>
    <section class="page-section pair-verdict" data-reveal>
      <h2>${esc(t("{a} or {b}: the verdict", { a: p.a.name, b: p.b.name }))}</h2>
      <p class="pair-verdict-text">${esc(c.verdict)}</p>
    </section>
    <section class="page-section pair-bridge" id="want-alternatives" data-reveal>
      <div class="pair-bridge-box">
        <div class="pair-bridge-head"><span class="eyebrow">${esc(t("A third option"))}</span><span class="cmp-mark cmp-mark-logo"><img src="/assets/apple-touch-icon.png" alt="" width="24" height="24">Sokosumi</span></div>
        <h2>${esc(c.bridge.heading)}</h2>
        <p>${esc(c.bridge.text)}</p>
        <ul>${c.bridge.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        <div class="cta-row">
          <a class="btn btn-primary" href="${attr(shell.APP_SIGNUP)}" data-analytics="sign_up_click" data-analytics-location="compare_pair_bridge">${esc(t("Start free"))}</a>
          ${(c.bridge.links || []).map((l) => `<a class="btn btn-outline" href="${attr(l)}">${esc(t("Sokosumi vs {name}", { name: l.includes(p.a.key) || l.includes(p.a.name.toLowerCase()) ? p.a.name : p.b.name }))}</a>`).join("")}
        </div>
      </div>
    </section>` +
    shell.proof(testimonials, p.slug.length, { heading: t("Teams already on Sokosumi") }) +
    (faqs.length
      ? `<section class="blk" data-reveal><div class="blk-head"><h2>${esc(t("{a} vs {b}: questions", { a: p.a.name, b: p.b.name }))}</h2></div><div class="blk-faq">${faqs
          .map((f) => `<details class="faq-item"><summary>${esc(f.question)}<span class="faq-x">+</span></summary><p class="faq-a">${esc(f.answer)}</p></details>`)
          .join("")}</div></section>`
      : "") +
    (p.sources && p.sources.length
      ? `<section class="page-section pair-sources"><h2>${esc(t("Sources"))}</h2><ol>${p.sources.map((s) => `<li><a href="${attr(s)}" rel="noreferrer nofollow" target="_blank">${esc(s.replace(/^https?:\/\//, "").slice(0, 80))}</a></li>`).join("")}</ol><p class="pair-sources-note">${esc(t("Prices and features as published by the vendors on the date checked. Tell us if something changed."))}</p></section>`
      : "") +
    shell.ctaBand({
      heading: t("See the difference on one task"),
      subheading: t("250 free credits per seat. Brief a coworker, get the file back, and compare."),
      ctaLabel: t("Start free"),
      seed: p.slug.length,
    }) +
    pageEnd()
  );
}

module.exports = { all, get, card, detail, lockup, copy, logoUrl };
