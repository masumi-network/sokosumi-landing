/* /tools/keyword-extractor: client-only. Nothing leaves the browser: word-
 * frequency extraction runs entirely here. Results are split into single-word
 * Keywords and two-word Phrases, with an on-by-default "Hide common words"
 * filler filter, a live word count, and a client-side CSV download.
 */
(function () {
  "use strict";
  var tk = window.SokosumiToolKit;
  var form = document.getElementById("keForm");
  if (!form) return;

  var textInput = document.getElementById("keText");
  var result = document.getElementById("keResult");
  var groupsEl = document.getElementById("keGroups");
  var copyBtn = document.getElementById("keCopy");
  var csvBtn = document.getElementById("keCsv");
  var hideToggle = document.getElementById("keHideCommon");
  var wordCountEl = document.getElementById("keWordCount");

  var lastText = "";
  var lastResult = { keywords: [], phrases: [] };

  // Structural stopwords: always stripped, regardless of the toggle.
  var STOPWORDS = {};
  "a an the and or but if then so of to in on for with at by from up about into over after is are was were be been being this that these those it its your you our we us they them as not no do does did done can could should would will just more most so than very really also has have had get gets which who whom what when where why how there here".split(" ").forEach(function (w) {
    STOPWORDS[w] = true;
  });

  // Common filler / journalistic words that crowd out the real topic terms.
  // Stripped only when "Hide common words" is on (the default), which also
  // removes two-word phrases that lean on one of them (e.g. "shahidi said").
  var COMMON = {};
  "said says say told tells according report reports new entire also one like get got make made way thing things lot much many well back still even now around including per via amid another add adds".split(" ").forEach(function (w) {
    COMMON[w] = true;
  });

  function esc(s) {
    return tk ? tk.esc(s) : String(s);
  }

  function wordCount(text) {
    var m = text.trim().match(/\b[\w'-]+\b/g);
    return m ? m.length : 0;
  }

  function topBy(counts, limit) {
    return Object.keys(counts)
      .map(function (label) {
        return { label: label, count: counts[label] };
      })
      .filter(function (t) {
        return t.count > 1;
      })
      .sort(function (a, b) {
        return b.count - a.count;
      })
      .slice(0, limit);
  }

  function extract(text, hide) {
    var words = (text.toLowerCase().match(/\b[a-z][a-z'-]{2,}\b/g) || []).filter(function (w) {
      if (STOPWORDS[w]) return false;
      if (hide && COMMON[w]) return false;
      return true;
    });
    var wordCounts = {};
    words.forEach(function (w) {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    });
    var phraseCounts = {};
    for (var i = 0; i < words.length - 1; i++) {
      var phrase = words[i] + " " + words[i + 1];
      phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
    }
    return { keywords: topBy(wordCounts, 20), phrases: topBy(phraseCounts, 15) };
  }

  function groupHtml(title, tags) {
    var body = tags.length
      ? '<div class="tk-cloud">' +
        tags
          .map(function (t) {
            return '<span class="tk-tag">' + esc(t.label) + "<b>" + t.count + "</b></span>";
          })
          .join("") +
        "</div>"
      : '<p class="ke-none">None found in this text.</p>';
    return (
      '<div class="tk-group"><div class="tk-group-head"><h3>' +
      title +
      '</h3><span class="tk-group-count">' +
      tags.length +
      "</span></div>" +
      body +
      "</div>"
    );
  }

  function render() {
    lastResult = extract(lastText, hideToggle.checked);
    groupsEl.innerHTML = groupHtml("Keywords", lastResult.keywords) + groupHtml("Phrases", lastResult.phrases);
    result.hidden = false;
  }

  function updateWordCount() {
    var n = wordCount(textInput.value);
    wordCountEl.textContent = n + (n === 1 ? " word" : " words");
  }

  function csvCell(v) {
    v = String(v);
    return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }

  function toCsv() {
    var rows = [["type", "term", "count"]];
    lastResult.keywords.forEach(function (t) {
      rows.push(["keyword", t.label, t.count]);
    });
    lastResult.phrases.forEach(function (t) {
      rows.push(["phrase", t.label, t.count]);
    });
    return rows
      .map(function (r) {
        return r.map(csvCell).join(",");
      })
      .join("\n");
  }

  textInput.addEventListener("input", updateWordCount);
  updateWordCount();

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    lastText = textInput.value.trim();
    if (!lastText) return;
    render();
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  hideToggle.addEventListener("change", function () {
    if (lastText) render();
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      function block(title, tags) {
        return title + ":\n" + tags.map(function (t) { return t.label + " (" + t.count + ")"; }).join("\n");
      }
      var text = [block("Keywords", lastResult.keywords), block("Phrases", lastResult.phrases)].join("\n\n").trim();
      if (!text) return;
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.textContent = "Copied";
        setTimeout(function () {
          copyBtn.textContent = "Copy list";
        }, 1600);
      }, function () {});
    });
  }

  if (csvBtn) {
    csvBtn.addEventListener("click", function () {
      if (!lastResult.keywords.length && !lastResult.phrases.length) return;
      var blob = new Blob([toCsv()], { type: "text/csv" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "keywords.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
    });
  }
})();
