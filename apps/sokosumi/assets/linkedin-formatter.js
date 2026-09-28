// LinkedIn text formatter. Bold and italic are Unicode Mathematical
// Alphanumeric characters (there is no styling in a LinkedIn post, only
// different characters), applied to the textarea selection. The preview
// mirrors the feed: text up to the ~210-character desktop fold, then
// "…see more".
(function () {
  "use strict";

  var input = document.getElementById("lifInput");
  if (!input) return;

  var count = document.getElementById("lifCount");
  var previewText = document.getElementById("lifPreviewText");
  var seeMore = document.getElementById("lifSeeMore");
  var copy = document.getElementById("lifCopy");

  var POST_LIMIT = 3000;
  var FOLD_DESKTOP = 210;

  // Code-point offsets into the Mathematical Alphanumeric block, per style.
  // [A-Z base, a-z base, 0-9 base]; null where the block has no digits.
  var STYLES = {
    bold: [0x1d5d4, 0x1d5ee, 0x1d7ec], // sans-serif bold
    italic: [0x1d608, 0x1d622, null], // sans-serif italic
    boldItalic: [0x1d63c, 0x1d656, null], // sans-serif bold italic
  };

  function apply(style, text) {
    var map = STYLES[style];
    var out = "";
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      if (c >= 65 && c <= 90) out += String.fromCodePoint(map[0] + (c - 65));
      else if (c >= 97 && c <= 122) out += String.fromCodePoint(map[1] + (c - 97));
      else if (c >= 48 && c <= 57 && map[2]) out += String.fromCodePoint(map[2] + (c - 48));
      else out += text[i];
    }
    return out;
  }

  // Map any mathematical-alphanumeric character back to plain ASCII.
  function plain(text) {
    var out = "";
    for (var ch of text) {
      var cp = ch.codePointAt(0);
      var mapped = ch;
      for (var key in STYLES) {
        var m = STYLES[key];
        if (cp >= m[0] && cp < m[0] + 26) mapped = String.fromCharCode(65 + (cp - m[0]));
        else if (cp >= m[1] && cp < m[1] + 26) mapped = String.fromCharCode(97 + (cp - m[1]));
        else if (m[2] && cp >= m[2] && cp < m[2] + 10) mapped = String.fromCharCode(48 + (cp - m[2]));
        else continue;
        break;
      }
      out += mapped;
    }
    return out;
  }

  function bulletLines(text) {
    return text
      .split("\n")
      .map(function (line) {
        var trimmed = line.replace(/^[•\-\*]\s*/, "");
        return trimmed.trim() ? "• " + trimmed : line;
      })
      .join("\n");
  }

  function replaceSelection(transform) {
    var start = input.selectionStart;
    var end = input.selectionEnd;
    if (start === end) {
      // Nothing selected: transform the whole text, keep the caret usable.
      input.value = transform(input.value);
    } else {
      var value = input.value;
      var replaced = transform(value.slice(start, end));
      input.value = value.slice(0, start) + replaced + value.slice(end);
      input.setSelectionRange(start, start + replaced.length);
    }
    input.focus();
    update();
  }

  function charCount(text) {
    return Array.from(text).length;
  }

  function update() {
    var text = input.value;
    var n = charCount(text);
    count.textContent = n.toLocaleString("en-US") + " / 3,000 characters";
    count.classList.toggle("is-over", n > POST_LIMIT);

    var points = Array.from(text);
    if (points.length > FOLD_DESKTOP) {
      previewText.textContent = points.slice(0, FOLD_DESKTOP).join("").replace(/\s+$/, "");
      seeMore.hidden = false;
    } else {
      previewText.textContent = text;
      seeMore.hidden = true;
    }
    if (!text) previewText.textContent = "Your post shows up here as you type.";
  }

  document.getElementById("lifBold").addEventListener("click", function () { replaceSelection(function (t) { return apply("bold", plain(t)); }); });
  document.getElementById("lifItalic").addEventListener("click", function () { replaceSelection(function (t) { return apply("italic", plain(t)); }); });
  document.getElementById("lifBoldItalic").addEventListener("click", function () { replaceSelection(function (t) { return apply("boldItalic", plain(t)); }); });
  document.getElementById("lifPlain").addEventListener("click", function () { replaceSelection(plain); });
  document.getElementById("lifBullet").addEventListener("click", function () { replaceSelection(bulletLines); });

  seeMore.addEventListener("click", function () {
    previewText.textContent = input.value;
    seeMore.hidden = true;
  });

  copy.addEventListener("click", function () {
    var text = input.value;
    if (!text.trim()) {
      input.focus();
      return;
    }
    var done = function () {
      var old = copy.textContent;
      copy.textContent = "Copied — paste it into LinkedIn";
      setTimeout(function () { copy.textContent = old; }, 1600);
      try {
        if (window.dataLayer) window.dataLayer.push({ event: "tool_run", tool: "linkedin-formatter" });
      } catch (err) { /* analytics must never break the copy */ }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  });

  function fallbackCopy(text) {
    input.focus();
    input.select();
    try { document.execCommand("copy"); } catch (err) { /* nothing left to try */ }
  }

  input.addEventListener("input", update);
  update();
})();
