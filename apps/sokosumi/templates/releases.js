// /releases (index) and /releases/<slug> (detail) — CMS `releases`
// collection. A quiet timeline of product updates; contentHtml is
// pre-rendered by the CMS at save time.

const shell = require("./shell");
const cms = require("../lib/cms");
const blocks = require("./blocks");
const { t, locale } = require("../lib/i18n");
const { esc, attr, icon, pageStart, pageEnd } = shell;

function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString(locale() === "de" ? "de-DE" : "en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtVersion(v) {
  const s = String(v || "").trim();
  if (!s) return "";
  return /^v/i.test(s) ? s : `v${s}`;
}

function highlightTag(tag) {
  return esc(String(tag || "").toUpperCase());
}

function releaseRow(r) {
  const date = fmtDate(r.date);
  const version = fmtVersion(r.version);
  const when = `<div>
    ${date ? `<div>${esc(date)}</div>` : ""}
    ${version ? `<div class="tag-quiet" style="margin-top:4px">${esc(version)}</div>` : ""}
  </div>`;

  const highlights = (r.highlights || [])
    .filter((h) => h && h.text)
    .map(
      (h) =>
        `<p style="margin-top:8px"><span class="chip" style="margin-right:6px">${highlightTag(h.tag)}</span>${esc(h.text)}</p>`,
    )
    .join("");

  const body = `<div>
    <span class="row-title">${esc(r.title)}</span>
    ${highlights}
    ${r.description ? `<p style="margin-top:10px">${esc(r.description)}</p>` : ""}
  </div>`;

  if (r.contentHtml) {
    return `<a class="row-item" href="/releases/${encodeURIComponent(r.slug)}">
      ${when}
      ${body}
      <span class="row-go">${esc(t("Details"))} ${icon("arrow-up-right", 15)}</span>
    </a>`;
  }
  return `<div class="row-item">
    ${when}
    ${body}
  </div>`;
}

async function index(ctx) {
  const releases = await cms.getReleases({ draft: ctx.preview });

  const cr = [{ label: "Home", href: "/" }, { label: "Releases" }];
  return (
    pageStart({
      title: "Releases | Sokosumi",
      description: "Every Sokosumi release in order: new capabilities, improvements and fixes, with the date each one shipped and what changed for your coworkers.",
      path: "/releases",
      breadcrumb: cr,
      jsonld: shell.itemListLd("Sokosumi releases", "/releases", releases.map((r) => ({ name: r.title, path: `/releases/${r.slug}` }))),
    }) +
    `<div class="page-head" data-reveal>
      <h1>${esc(t("What's new in Sokosumi"))}</h1>
      <p class="sub">${esc(t("New capabilities, improvements, and fixes, straight from the team."))}</p>
    </div>` +
    (releases.length
      ? `<div class="page-section flush">
          <div class="row-list">${releases.map(releaseRow).join("")}</div>
        </div>`
      : `<div class="page-section flush"><p class="muted">${esc(t("Release notes are on the way. In the meantime,"))} <a href="/blog" style="text-decoration:underline">${esc(t("read the blog"))}</a>.</p></div>`) +
    shell.ctaBand({
      heading: t("Every release lands in your account"),
      subheading: t("Nothing to install and nothing to upgrade."),
      ctaLabel: t("Start free"),
      seed: releases.length,
    }) +
    pageEnd()
  );
}

async function detail(ctx) {
  const r = await cms.getRelease(ctx.params.slug, { draft: ctx.preview });
  if (!r) return null;

  const date = fmtDate(r.date);
  const version = fmtVersion(r.version);
  const eyebrow = [esc(date), esc(version)].filter(Boolean).join(" &middot; ");

  const highlights = (r.highlights || []).filter((h) => h && h.text);
  const coverUrl = cms.mediaUrl(r.coverImage);
  const coverBlock = coverUrl
    ? `<div class="post-cover" data-reveal><img src="${attr(coverUrl)}" alt="${attr(r.title)}" width="1600" height="900" loading="eager" fetchpriority="high" decoding="async" /></div>`
    : "";
  const highlightsSection = highlights.length
    ? `<section class="page-section flush blk-checklist" data-reveal>
        <h2>${esc(t("Highlights"))}</h2>
        <ul>${highlights
          .map((h) => `<li><span class="chip">${highlightTag(h.tag)}</span><span>${esc(h.text)}</span></li>`)
          .join("")}</ul>
      </section>`
    : "";

  const proseSection = r.contentHtml
    ? `<article class="page-section${highlights.length ? "" : " flush"}" data-reveal>
        <div class="prose">${r.contentHtml}</div>
      </article>`
    : "";

  const cr = [{ label: "Home", href: "/" }, { label: "Releases", href: "/releases" }, { label: r.title }];
  return (
    pageStart({
      title: t("{title} | Sokosumi releases", { title: r.title }),
      description: (r.description || "").slice(0, 155),
      path: `/releases/${r.slug}`,
      breadcrumb: cr,
      article: { published: r.date || undefined, modified: r.updatedAt || r.date || undefined },
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${shell.SITE}/releases/${r.slug}#article`,
        headline: r.title,
        description: r.description || undefined,
        datePublished: r.date || undefined,
        dateModified: r.updatedAt || r.date || undefined,
        author: { "@id": `${shell.SITE}/#organization` },
        publisher: { "@id": `${shell.SITE}/#organization` },
        image: coverUrl || undefined,
        mainEntityOfPage: { "@type": "WebPage", "@id": `${shell.SITE}/releases/${r.slug}` },
        isPartOf: { "@id": `${shell.SITE}/#website` },
        url: `${shell.SITE}/releases/${r.slug}`,
      },
    }) +
    `<div class="page-head" data-reveal>
      ${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ""}
      <h1>${esc(r.title)}</h1>
      ${r.description ? `<p class="sub">${esc(r.description)}</p>` : ""}
    </div>` +
    coverBlock +
    highlightsSection +
    proseSection +
    blocks.renderBlocks(r.sections) +
    shell.ctaBand({
      heading: t("Try it in your account"),
      subheading: t("Every release is already live in the product."),
      ctaLabel: t("Start free"),
      seed: r.title.length,
    }) +
    pageEnd()
  );
}

module.exports = { index, detail };
