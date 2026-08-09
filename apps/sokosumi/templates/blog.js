// /blog (index) and /blog/<slug> (detail) — CMS `posts` collection.
// contentHtml is pre-rendered by the CMS at save time.

const shell = require("./shell");
const cms = require("../lib/cms");
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
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function postCard(p) {
  const cover = cms.mediaUrl(p.coverImage);
  const label = CATEGORY_LABELS[p.category] || "Article";
  const meta = [label.toUpperCase(), fmtDate(p.date)].filter(Boolean).join(" · ");
  const img = cover
    ? `<div style="margin:-22px -22px 6px;border-radius:8px 8px 0 0;overflow:hidden;aspect-ratio:16/9;background:var(--muted)">
        <img src="${attr(cover)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover" />
      </div>`
    : "";
  return `<a class="card" href="/blog/${encodeURIComponent(p.slug)}">
    ${img}
    <span class="tag-quiet">${esc(meta)}</span>
    <h3>${esc(p.title)}</h3>
    ${p.description ? `<p>${esc(p.description)}</p>` : ""}
  </a>`;
}

async function index(ctx) {
  const posts = await cms.getPosts({ draft: ctx.preview });

  const cr = [{ label: "Home", href: "/" }, { label: "Blog" }];
  return (
    pageStart({
      title: "Blog | Sokosumi",
      description: "Articles, announcements, and press from the team behind your AI coworkers.",
      path: "/blog",
      breadcrumb: cr,
    }) +
    `<div class="page-head" data-reveal>
      <h1>The Sokosumi blog</h1>
      <p class="sub">Articles, announcements, and press from the team behind your AI coworkers.</p>
    </div>` +
    (posts.length
      ? `<div class="page-section flush" data-reveal>
          <div class="card-grid">${posts.map(postCard).join("")}</div>
        </div>`
      : `<div class="page-section flush"><p class="muted">Posts are on the way. In the meantime, <a href="/guides" style="text-decoration:underline">read the guides</a>.</p></div>`) +
    pageEnd()
  );
}

async function detail(ctx) {
  const p = await cms.getPost(ctx.params.slug, { draft: ctx.preview });
  if (!p) return null;

  const cover = cms.mediaUrl(p.coverImage);
  const label = CATEGORY_LABELS[p.category];
  const eyebrow = [label, fmtDate(p.date), p.author].filter(Boolean).map(esc).join(" · ");

  const coverBlock = cover
    ? `<div class="blk-image" data-reveal style="margin:0 0 clamp(28px, 4vw, 40px);max-width:820px">
        <div class="img-frame" style="border-radius:var(--r-lg);overflow:hidden;border:1px solid var(--border)">
          <img src="${attr(cover)}" alt="${attr(p.title)}" />
        </div>
      </div>`
    : "";

  const cr = [{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: p.title }];
  return (
    pageStart({
      title: `${p.title} | Sokosumi blog`,
      description: (p.description || "").slice(0, 155),
      path: `/blog/${p.slug}`,
      breadcrumb: cr,
      ogImage: cover || undefined,
      jsonld: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: p.title,
        description: p.description || undefined,
        datePublished: p.date || undefined,
        author: p.author
          ? { "@type": "Person", name: p.author }
          : { "@type": "Organization", name: "Sokosumi" },
        image: cover || undefined,
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
    <div class="page-section">
      <a class="muted" href="/blog" style="display:inline-flex;align-items:center;gap:8px;font-size:14px">${icon("arrow-left", 15)} All posts</a>
    </div>` +
    pageEnd()
  );
}

module.exports = { index, detail };
