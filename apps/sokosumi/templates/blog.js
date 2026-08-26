// /blog (index) and /blog/<slug> (detail) — CMS `posts` collection.
// contentHtml is pre-rendered by the CMS at save time.

const shell = require("./shell");
const cms = require("../lib/cms");
const blocks = require("./blocks");
const { t, locale } = require("../lib/i18n");
const { esc, attr, icon, pageStart, pageEnd } = shell;

const CATEGORY_LABELS = {
  articles: "Article",
  announcements: "Announcement",
  "press-releases": "Press release",
};

function fmtDate(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toLocaleDateString(locale() === "de" ? "de-DE" : "en-US", { month: "short", day: "numeric", year: "numeric" });
}

// A post's own cover if the editor set one, otherwise a product render, so a
// card is never a bare block of text next to one that has artwork.
function postImage(p) {
  return cms.mediaUrl(p.coverImage) || shell.shotFor(p.slug || p.title || "").src;
}

function postCard(p) {
  const label = t(CATEGORY_LABELS[p.category] || "Article");
  const meta = [label.toUpperCase(), fmtDate(p.date)].filter(Boolean).join(" · ");
  return `<a class="card has-media" href="/blog/${encodeURIComponent(p.slug)}">
    <div class="card-media"><img src="${attr(postImage(p))}" alt="" loading="lazy" /></div>
    <span class="tag-quiet">${esc(meta)}</span>
    <h2>${esc(p.title)}</h2>
    ${p.description ? `<p>${esc(p.description)}</p>` : ""}
  </a>`;
}

async function index(ctx) {
  const posts = await cms.getPosts({ draft: ctx.preview });

  const cr = [{ label: "Home", href: "/" }, { label: "Blog" }];
  return (
    pageStart({
      title: t("Blog: AI marketing, agents and coworkers | Sokosumi"),
      description: "Articles, announcements, and press from the team behind your AI coworkers \u2014 how the marketplace works, what teams brief, and what shipped recently.",
      path: "/blog",
      breadcrumb: cr,
      jsonld: shell.itemListLd("Sokosumi blog", "/blog", posts.map((p) => ({ name: p.title, path: `/blog/${p.slug}` }))),
    }) +
    `<div class="page-head" data-reveal>
      <h1>${esc(t("The Sokosumi blog"))}</h1>
      <p class="sub">${esc(t("Articles, announcements, and press from the team behind your AI coworkers \u2014 how the marketplace works, what teams brief, and what shipped recently."))}</p>
    </div>` +
    (posts.length
      ? `<div class="page-section flush" data-reveal>
          <div class="${shell.gridCls(posts.length)}">${posts.map(postCard).join("")}</div>
        </div>`
      : `<div class="page-section flush"><p class="muted">${esc(t("Posts are on the way. In the meantime,"))} <a href="/guides" style="text-decoration:underline">${esc(t("read the guides"))}</a>.</p></div>`) +
    shell.logoRow() +
    shell.ctaBand({
      heading: t("Meet the coworkers we write about"),
      subheading: t("Every specialist on the marketplace has a public profile and work you can inspect first."),
      ctaLabel: t("Browse the roster"),
      ctaHref: "/ai-coworkers",
      seed: posts.length,
    }) +
    pageEnd()
  );
}

async function detail(ctx) {
  const p = await cms.getPost(ctx.params.slug, { draft: ctx.preview });
  if (!p) return null;

  const cover = cms.mediaUrl(p.coverImage);
  const label = CATEGORY_LABELS[p.category] ? t(CATEGORY_LABELS[p.category]) : null;
  const eyebrow = [label, fmtDate(p.date), p.author].filter(Boolean).map(esc).join(" · ");

  const coverBlock = `<div class="post-cover" data-reveal>
      <img src="${attr(postImage(p))}" alt="${attr(cover ? p.title : "")}" width="1600" height="900" loading="eager" fetchpriority="high" decoding="async" />
    </div>`;

  const cr = [{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: p.title }];
  return (
    pageStart({
      title: t("{title} | Sokosumi", { title: p.title }),
      description: (p.description || "").slice(0, 155),
      path: `/blog/${p.slug}`,
      og: { type: "article", eyebrow: t("Blog"), title: p.title, sub: p.description || "", img: cover || "" },
      breadcrumb: cr,
      ogImage: cover || undefined,
      article: { published: p.date || undefined, modified: p.updatedAt || p.date || undefined },
      jsonld: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${shell.SITE}/blog/${p.slug}#article`,
        headline: p.title,
        description: p.description || undefined,
        datePublished: p.date || undefined,
        dateModified: p.updatedAt || p.date || undefined,
        // "The Sokosumi team" is a byline, not a person. Typing it as one
        // asserts a human author Google cannot reconcile with anything.
        author: p.author && !/team/i.test(p.author)
          ? { "@type": "Person", name: p.author }
          : { "@type": "Organization", "@id": `${shell.SITE}/#organization` },
        publisher: { "@id": `${shell.SITE}/#organization` },
        image: cover || undefined,
        mainEntityOfPage: { "@type": "WebPage", "@id": `${shell.SITE}/blog/${p.slug}` },
        isPartOf: { "@id": `${shell.SITE}/#website` },
        url: `${shell.SITE}/blog/${p.slug}`,
      },
    }) +
    `<div class="page-head" data-reveal>
      ${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ""}
      <h1>${esc(p.title)}</h1>
      ${p.description ? `<p class="sub">${esc(p.description)}</p>` : ""}
    </div>
    ${coverBlock}
    <article class="page-section flush" data-reveal>
      <div class="prose">${p.contentHtml || ""}</div>
    </article>
    ${blocks.renderBlocks(p.sections)}
    <div class="page-section">
      <a class="muted" href="/blog" style="display:inline-flex;align-items:center;gap:8px;font-size:14px">${icon("arrow-left", 15)} ${esc(t("All posts"))}</a>
    </div>` +
    shell.logoRow() +
    shell.ctaBand({
      heading: t("See it for yourself"),
      subheading: t("Run one real task and judge the output for yourself."),
      ctaLabel: t("Start free"),
      seed: p.title.length,
    }) +
    pageEnd()
  );
}

module.exports = { index, detail };
