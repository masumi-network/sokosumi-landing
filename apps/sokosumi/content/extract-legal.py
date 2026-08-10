"""Extract the six sokosumi.com legal documents verbatim.

These are legal texts. Nothing is summarised, rewritten or re-typed by a model:
the static HTML is parsed and only the tags are normalised. Every trap below was
found by inspecting the source, not assumed:

  * terms-of-service holds TWO contracts in two Webflow tab panes; only one has
    w--tab-active. A renderer-based scrape silently drops the second — 62% of
    the document — and still looks complete. Both panes are kept.
  * dpa ships a stale hidden revision in .hide alongside the live list. `.hide`
    is defined only in Webflow's CDN stylesheet, so a visibility check cannot
    see it; it is filtered on the literal class.
  * cookie-policy and privacy-policy carry <style>/<script> INSIDE the body
    (hundreds of words of CSS that a text walker happily returns) and a German
    copy of every table under a `-de` class, hidden only by CSS.
  * Spacer paragraphs whose entire content is U+200D survive .strip().
  * <ol start> carries clause numbering in the Terms; dropping it renumbers a
    contract that cross-references its own clauses.
"""

import html
import json
import re
import sys
from html.parser import HTMLParser

SLUGS = ["imprint", "privacy-policy", "cookie-policy", "terms-of-service", "dpa", "acceptable-use"]

# The source's heading levels do not describe its own outline (see the module
# docstring). Per page, map what the author used onto what the level means.
HEADING_MAP = {
    "imprint": {"h1": None, "h4": "h2", "h5": "h2"},
    "privacy-policy": {"h1": None, "h4": "h2", "h5": "h3"},
    "cookie-policy": {"h1": None, "h4": "h2", "h5": "h3"},
    "acceptable-use": {"h1": None, "h4": "h2", "h5": "h3"},
    "dpa": {"h1": None, "h2": "h2", "h4": "h2", "h5": "h3"},
    "terms-of-service": {"h1": None, "h3": "h2", "h4": "h3", "h5": "h4"},
}

# Pushed onto the tag stack for an element whose text is discarded with its
# tag. Dropping only the tag would leave the text behind — that is how the
# document title ended up printed twice.
MUTE = object()

INLINE = {"strong": "strong", "b": "strong", "em": "em", "i": "em", "u": "em", "sup": "sup"}
BLOCK = {
    "p": "p", "ul": "ul", "ol": "ol", "li": "li", "blockquote": "blockquote",
    "table": "table", "thead": "thead", "tbody": "tbody", "tr": "tr", "th": "th", "td": "td",
}
DROP_SUBTREE = {"style", "script", "noscript"}
ZERO_WIDTH = dict.fromkeys(map(ord, "‍​﻿"), None)


class Extract(HTMLParser):
    """Lift the legal body out of a Webflow page, tags normalised, text verbatim."""

    def __init__(self, slug):
        super().__init__(convert_charrefs=False)
        self.slug = slug
        self.hmap = HEADING_MAP[slug]
        self.out = []
        self.container = 0       # depth inside .legal-apge-contetns
        self.rich = 0            # depth inside a kept .w-richtext
        self.drop = 0            # depth inside a subtree we are discarding
        self.mute = 0            # depth inside an element whose text we discard
        self.stack = []          # tags we emitted, to close them symmetrically
        self.panes = []          # terms-of-service: one entry per tab pane

    # -- helpers ---------------------------------------------------------
    @staticmethod
    def _classes(attrs):
        return dict(attrs).get("class", "").split()

    def _emit(self, s):
        if self.rich and not self.drop:
            self.out.append(s)

    # -- parsing ---------------------------------------------------------
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = self._classes(attrs)

        if self.drop:
            self.drop += 1
            return
        if tag in DROP_SUBTREE:
            self.drop = 1
            return

        if not self.container:
            if "legal-apge-contetns" in cls:
                self.container = 1
            return
        self.container += 1

        # a stale hidden revision (dpa) and the German table copies
        if "hide" in cls or any(c.endswith("-de") for c in cls):
            self.drop = 1
            return

        if not self.rich:
            if "w-richtext" in cls:
                self.rich = 1
                if self.slug == "terms-of-service":
                    self.panes.append(len(self.out))
            return
        self.rich += 1

        if tag == "br":
            self._emit("<br />")
        elif tag == "a":
            href = a.get("href", "")
            if href:
                ext = "" if href.startswith(("/", "#")) else ' target="_blank" rel="noreferrer"'
                self._emit(f'<a href="{html.escape(href, quote=True)}"{ext}>')
                self.stack.append("a")
            else:
                self.stack.append(None)
        elif tag in self.hmap:
            out = self.hmap[tag]
            if out:
                self._emit(f"<{out}>")
                self.stack.append(out)
            else:
                # h1 is dropped: the page template renders the title itself,
                # so its text has to go with the tag or the title prints twice
                self.mute += 1
                self.stack.append(MUTE)
        elif tag in ("h2", "h3", "h4", "h5", "h6"):
            self._emit(f"<{tag}>")
            self.stack.append(tag)
        elif tag in INLINE:
            self._emit(f"<{INLINE[tag]}>")
            self.stack.append(INLINE[tag])
        elif tag in BLOCK:
            # <ol start> carries clause numbering in the Terms
            if tag == "ol" and a.get("start"):
                self._emit(f'<ol start="{html.escape(a["start"], quote=True)}">')
            else:
                self._emit(f"<{BLOCK[tag]}>")
            self.stack.append(BLOCK[tag])
        else:
            self.stack.append(None)

    def handle_endtag(self, tag):
        if self.drop:
            self.drop -= 1
            return
        if not self.container:
            return
        if self.rich:
            if tag != "br":
                closing = self.stack.pop() if self.stack else None
                if closing is MUTE:
                    self.mute -= 1
                elif closing:
                    self._emit(f"</{closing}>")
            self.rich -= 1
            if self.rich == 0:
                self.stack.clear()
                self.mute = 0
        self.container -= 1

    def _text(self, s):
        if not (self.rich and not self.drop and not self.mute):
            return
        s = s.translate(ZERO_WIDTH).replace(" ", " ")
        if s:
            self.out.append(html.escape(s, quote=False).replace("&amp;", "&"))

    def handle_data(self, d):
        self._text(d)

    def handle_entityref(self, name):
        if self.rich and not self.drop and not self.mute:
            self.out.append(f"&{name};")

    def handle_charref(self, name):
        if self.rich and not self.drop and not self.mute:
            self.out.append(f"&#{name};")


def words(s):
    return len(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s)).split())


def clean(h):
    for _ in range(3):
        h = re.sub(r"<(p|h2|h3|h4|blockquote|li|strong|em)>\s*</\1>", "", h)
    h = re.sub(r"[ \t]+", " ", h)
    h = re.sub(r">\s+<", "><", h)
    return h.strip()


# A regression guard, not a target. Each count is the extracted body checked
# word-for-word against the live page with an independent reader: the only
# differences are the page title and the site footer, which are chrome. If a
# number moves here, either Legal changed the document or this script broke —
# diff before accepting it.
EXPECTED = {
    "imprint": 94, "privacy-policy": 3174, "cookie-policy": 577,
    "terms-of-service": 8147, "dpa": 126, "acceptable-use": 660,
}


def main(directory):
    out, bad = {}, []
    for slug in SLUGS:
        raw = open(f"{directory}/legal-{slug}.html", encoding="utf-8").read()
        p = Extract(slug)
        p.feed(raw)
        body = clean("".join(p.out))

        # the title lives outside the rich text on dpa and terms-of-service
        title = ""
        for pat in (r"<h1[^>]*>(.*?)</h1>", r'<h2 class="text-rich-text[^"]*">(.*?)</h2>'):
            for m in re.finditer(pat, raw, re.S):
                t = html.unescape(re.sub(r"<[^>]+>", "", m.group(1))).translate(ZERO_WIDTH).strip()
                if t and "hide" not in m.group(0):
                    title = t
                    break
            if title:
                break

        w = words(body)
        exp = EXPECTED[slug]
        # exact, deliberately. A percentage tolerance on an 8000-word contract
        # is wide enough for two whole clauses to disappear without a warning.
        ok = w == exp
        if not ok:
            bad.append(f"{slug}: got {w}, expected {exp} ({w - exp:+d})")
        out[slug] = {
            "slug": slug, "title": title, "html": body, "words": w,
            "headings": [html.unescape(re.sub(r"<[^>]+>", "", x)).strip()
                         for x in re.findall(r"<h2>(.*?)</h2>", body, re.S)],
            "tables": body.count("<table>"), "lists": body.count("<ul>") + body.count("<ol>"),
            "panes": len(p.panes),
        }
        print(f"{'OK ' if ok else '!! '}{slug:18} {w:6} words (expect {exp:5})  "
              f"h2={len(out[slug]['headings']):2} tables={out[slug]['tables']} "
              f"lists={out[slug]['lists']} richtexts={out[slug]['panes'] or '-'}  title={title!r}")

    json.dump(out, open(f"{directory}/legal.json", "w"), ensure_ascii=False)
    print("\n" + ("MISMATCHES: " + "; ".join(bad) if bad else "all six match the source exactly"))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "."))
