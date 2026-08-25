// Minimal markdown → Payload Lexical converter used by the CMS scripts.
// Supports: ## / ### headings, paragraphs, "- " bullet lists, "1. " numbered
// lists, "> " block quotes (rendered as Prompt/Example cards on the site),
// **bold**, `code`, [label](url).
const txt = (text, format = 0) => ({ type: "text", text, format, style: "", mode: "normal", detail: 0, version: 1 });
export function inline(s) {
  const out = [];
  const re = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(txt(s.slice(last, m.index)));
    if (m[1]) out.push(txt(m[1], 1));
    else if (m[2]) out.push(txt(m[2], 16));
    else out.push({ type: "link", version: 3, fields: { url: m[4], newTab: /^https?:/.test(m[4]), linkType: "custom" }, children: [txt(m[3])] });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(txt(s.slice(last)));
  return out;
}
const node = (type, extra, children) => ({ type, format: "", indent: 0, version: 1, direction: "ltr", ...extra, children });
const P = (s) => node("paragraph", { textFormat: 0 }, inline(s));
const H = (tag, s) => node("heading", { tag }, inline(s));
const LI = (s, i) => node("listitem", { value: i + 1 }, inline(s));
const LIST = (items, ordered) => node("list", { listType: ordered ? "number" : "bullet", tag: ordered ? "ol" : "ul", start: 1 }, items.map(LI));
const QUOTE = (lines) => node("quote", {}, lines.flatMap((l, i) => (i ? [{ type: "linebreak", version: 1 }] : []).concat(inline(l))));

export function lexical(md) {
  const children = [];
  let list = null, ordered = false, quote = null;
  const flush = () => {
    if (list) children.push(LIST(list, ordered)), (list = null);
    if (quote) children.push(QUOTE(quote)), (quote = null);
  };
  for (const raw of md.trim().split(/\n/)) {
    const l = raw.trim();
    if (!l) { flush(); continue; }
    if (l.startsWith("> ") || l === ">") { if (list) flush(); (quote = quote || []).push(l.replace(/^>\s?/, "")); continue; }
    if (quote) flush();
    if (/^- /.test(l)) { if (list && ordered) flush(); ordered = false; (list = list || []).push(l.slice(2)); continue; }
    if (/^\d+\. /.test(l)) { if (list && !ordered) flush(); ordered = true; (list = list || []).push(l.replace(/^\d+\. /, "")); continue; }
    flush();
    if (l.startsWith("### ")) children.push(H("h3", l.slice(4)));
    else if (l.startsWith("## ")) children.push(H("h2", l.slice(3)));
    else children.push(P(l));
  }
  flush();
  return { root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children } };
}
