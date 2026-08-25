// Generated Open Graph images: /og.png?type=…&… → 1200×630 PNG.
//
// Rendered with Satori (HTML-ish element tree → SVG) and resvg (SVG → PNG),
// no browser involved, so it runs inside the Vercel function. Layouts use
// the same ingredients as the pages: Inter, ink on paper, the Sokosumi mark,
// competitor logos from the CMS, coworker portraits from the catalog.
//
// Everything is derived from the query string so the CDN can cache each
// image by URL; the process also keeps a small in-memory cache.

const fs = require("fs");
const path = require("path");
const satori = require("satori").default || require("satori");
const { Resvg } = require("@resvg/resvg-js");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const W = 1200;
const H = 630;
const INK = "#0f0e0d";
const PAPER = "#fafaf9";
const MUTED = "#6b6a68";
const HAIR = "rgba(15,14,13,0.14)";
const PURPLE = "#6400ff";

const FONTS = [300, 400, 500].map((weight) => ({
  name: "Inter",
  weight,
  style: "normal",
  data: fs.readFileSync(path.join(root, "assets", "fonts", "og", `inter-${weight}.woff`)),
}));

const MARK = "data:image/png;base64," + fs.readFileSync(path.join(root, "assets", "apple-touch-icon.png")).toString("base64");

// ---- remote images (logos, portraits) as data URIs, cached ----
const imgCache = new Map();
async function dataUri(url) {
  if (!url) return null;
  if (imgCache.has(url)) return imgCache.get(url);
  let out = null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      let type = (res.headers.get("content-type") || "image/png").split(";")[0];
      let buf = Buffer.from(await res.arrayBuffer());
      // Satori/resvg read PNG, JPEG and SVG. Portraits and covers arrive as
      // WebP or AVIF, so anything else is converted (and downsized) here.
      if (!/^image\/(png|jpeg|svg\+xml)$/.test(type)) {
        buf = await sharp(buf).resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true }).png().toBuffer();
        type = "image/png";
      }
      out = `data:${type};base64,${buf.toString("base64")}`;
    }
  } catch {
    out = null;
  }
  if (imgCache.size > 300) imgCache.delete(imgCache.keys().next().value);
  imgCache.set(url, out);
  return out;
}

// ---- tiny element helpers (Satori takes React-shaped objects) ----
const h = (type, style, children, extra) => ({ type, props: { style, ...(extra || {}), children } });
const text = (s, style) => h("div", { display: "flex", ...style }, String(s));

function clamp(s, n) {
  s = String(s || "").trim();
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

function frame(children, opts) {
  const o = opts || {};
  return h(
    "div",
    { width: W, height: H, display: "flex", flexDirection: "column", background: PAPER, color: INK, fontFamily: "Inter", padding: "56px 72px 120px", position: "relative" },
    [
      h("div", { display: "flex", flexDirection: "column", justifyContent: "center", flexGrow: 1 }, children),
      // footer: mark + domain, hairline above
      h("div", { position: "absolute", left: 72, right: 72, bottom: 48, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${HAIR}`, paddingTop: 22 }, [
        h("div", { display: "flex", alignItems: "center", gap: 14 }, [
          h("img", { width: 36, height: 36, borderRadius: 9 }, null, { src: MARK }),
          text("Sokosumi", { fontSize: 22, fontWeight: 500 }),
        ]),
        text(o.right || "sokosumi.com", { fontSize: 20, color: MUTED }),
      ]),
    ],
  );
}

function tile(src, name, size) {
  const s = size || 96;
  return h("div", { display: "flex", alignItems: "center", gap: 20 }, [
    src
      ? h("img", { width: s, height: s, borderRadius: s * 0.22, border: `1px solid ${HAIR}`, background: "#fff", objectFit: "contain", padding: s * 0.12 }, null, { src })
      : h("div", { width: s, height: s, borderRadius: s * 0.22, border: `1px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: s * 0.4, fontWeight: 500 }, String(name || "?").slice(0, 1)),
    text(name, { fontSize: 40, fontWeight: 500, letterSpacing: -0.5 }),
  ]);
}

const vsPill = () =>
  h("div", { display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 18px", borderRadius: 999, border: `1px solid ${HAIR}`, fontSize: 18, fontWeight: 500, letterSpacing: 2, color: MUTED }, "VS");

// ---- layouts ----
async function layoutCompare(q) {
  // Sokosumi vs <competitor>
  const logo = await dataUri(q.logo);
  return frame([
    h("div", { display: "flex", alignItems: "center", gap: 28 }, [tile(MARK, "Sokosumi"), vsPill(), tile(logo, q.b || "")]),
    text(clamp(q.title, 90), { fontSize: q.title && q.title.length > 60 ? 60 : 70, fontWeight: 300, lineHeight: 1.08, letterSpacing: -2.4, marginTop: 52, maxWidth: 1040 }),
    q.sub ? text(clamp(q.sub, 120), { fontSize: 24, color: MUTED, marginTop: 22, lineHeight: 1.4, maxWidth: 900 }) : null,
  ].filter(Boolean), { right: "sokosumi.com/compare" });
}

async function layoutPair(q) {
  const [la, lb] = await Promise.all([dataUri(q.logoA), dataUri(q.logoB)]);
  return frame([
    h("div", { display: "flex", alignItems: "center", gap: 28 }, [tile(la, q.a || ""), vsPill(), tile(lb, q.b || "")]),
    text(clamp(q.title, 90), { fontSize: q.title && q.title.length > 60 ? 60 : 70, fontWeight: 300, lineHeight: 1.08, letterSpacing: -2.4, marginTop: 52, maxWidth: 1040 }),
    q.sub ? text(clamp(q.sub, 120), { fontSize: 24, color: MUTED, marginTop: 22, lineHeight: 1.4, maxWidth: 900 }) : null,
  ].filter(Boolean), { right: "sokosumi.com/compare" });
}

async function layoutArticle(q) {
  const cover = await dataUri(q.img);
  const wide = !cover;
  return frame([
    h("div", { display: "flex", gap: 48, alignItems: "flex-start" }, [
      h("div", { display: "flex", flexDirection: "column", width: wide ? 1056 : 640 }, [
        q.eyebrow ? text(q.eyebrow, { fontSize: 22, color: PURPLE, marginBottom: 22, fontWeight: 500 }) : null,
        text(clamp(q.title, 110), { fontSize: q.title && q.title.length > 50 ? 52 : 60, fontWeight: 300, lineHeight: 1.1, letterSpacing: -1.8 }),
        q.sub ? text(clamp(q.sub, 150), { fontSize: 24, color: MUTED, marginTop: 24, lineHeight: 1.4 }) : null,
      ].filter(Boolean)),
      cover ? h("img", { width: 360, height: 360, borderRadius: 20, objectFit: "cover", border: `1px solid ${HAIR}` }, null, { src: cover }) : null,
    ].filter(Boolean)),
  ], { right: q.right || "sokosumi.com" });
}

async function layoutCoworker(q) {
  const portrait = await dataUri(q.img);
  return frame([
    h("div", { display: "flex", gap: 56, alignItems: "center", marginTop: 20 }, [
      portrait
        ? h("img", { width: 300, height: 300, borderRadius: 150, objectFit: "cover", border: `1px solid ${HAIR}` }, null, { src: portrait })
        : h("div", { width: 300, height: 300, borderRadius: 150, border: `1px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, fontWeight: 300 }, String(q.title || "?").slice(0, 1)),
      h("div", { display: "flex", flexDirection: "column", width: 640 }, [
        text(q.eyebrow || "AI coworker on Sokosumi", { fontSize: 22, color: MUTED, marginBottom: 18 }),
        text(clamp(q.title, 40), { fontSize: 88, fontWeight: 300, lineHeight: 1, letterSpacing: -3 }),
        q.sub ? text(clamp(q.sub, 80), { fontSize: 32, marginTop: 18, color: INK, fontWeight: 400 }) : null,
        q.meta ? text(clamp(q.meta, 90), { fontSize: 22, marginTop: 14, color: MUTED }) : null,
      ].filter(Boolean)),
    ]),
  ], { right: "sokosumi.com/ai-coworkers" });
}

async function layoutPage(q) {
  return frame([
    q.eyebrow ? text(q.eyebrow, { fontSize: 22, color: PURPLE, marginBottom: 22, fontWeight: 500 }) : null,
    text(clamp(q.title, 100), { fontSize: q.title && q.title.length > 50 ? 62 : 78, fontWeight: 300, lineHeight: 1.06, letterSpacing: -2.6, maxWidth: 1040 }),
    q.sub ? text(clamp(q.sub, 160), { fontSize: 28, color: MUTED, marginTop: 28, lineHeight: 1.4, maxWidth: 960 }) : null,
  ].filter(Boolean), { right: q.right || "sokosumi.com" });
}

const LAYOUTS = { compare: layoutCompare, pair: layoutPair, article: layoutArticle, coworker: layoutCoworker, page: layoutPage };

// ---- render + cache ----
const pngCache = new Map();
async function render(query) {
  const key = JSON.stringify(query);
  if (pngCache.has(key)) return pngCache.get(key);
  const layout = LAYOUTS[query.type] || layoutPage;
  const tree = await layout(query);
  const svg = await satori(tree, { width: W, height: H, fonts: FONTS });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng();
  if (pngCache.size > 200) pngCache.delete(pngCache.keys().next().value);
  pngCache.set(key, png);
  return png;
}

// Build the /og.png URL for a page. Only short, public strings go in.
function url(site, q) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) if (v != null && v !== "") params.set(k, String(v).slice(0, 200));
  return `${site}/og.png?${params.toString()}`;
}

module.exports = { render, url, W, H };
