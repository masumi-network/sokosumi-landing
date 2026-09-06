/* /tools/keyword-extractor — client-only. Nothing leaves the browser: word-
 * frequency extraction runs entirely here.
 */
(function () {
  "use strict";
  var tk = window.SokosumiToolKit;
  var form = document.getElementById("keForm");
  if (!form) return;

  var textInput = document.getElementById("keText");
  var result = document.getElementById("keResult");
  var cloud = document.getElementById("keCloud");
  var copyBtn = document.getElementById("keCopy");
  var lastTags = [];

  var STOPWORDS = {};
  "a an the and or but if then so of to in in on for with at by from up about into over after is are was were be been being this that these those it its your you our we us they them as not no do does did done can could should would will just more most so than very really also has have had get gets which who whom what when where why how there here".split(" ").forEach(function (w) {
    STOPWORDS[w] = true;
  });

  function esc(s) {
    return tk ? tk.esc(s) : String(s);
  }

  function extract(text) {
    var words = (text.toLowerCase().match(/\b[a-z][a-z'-]{2,}\b/g) || []).filter(function (w) {
      return !STOPWORDS[w];
    });
    var counts = {};
    words.forEach(function (w) {
      counts[w] = (counts[w] || 0) + 1;
    });
    for (var i = 0; i < words.length - 1; i++) {
      var phrase = words[i] + " " + words[i + 1];
      counts[phrase] = (counts[phrase] || 0) + 1;
    }
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
      .slice(0, 25);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var text = textInput.value.trim();
    if (!text) return;
    lastTags = extract(text);
    if (tk) {
      tk.renderCloud(cloud, lastTags.length ? lastTags : ["No repeated keywords found"]);
    } else {
      cloud.innerHTML = lastTags.map(function (t) { return '<span class="tk-tag">' + esc(t.label) + "<b>" + t.count + "</b></span>"; }).join("");
    }
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = lastTags.map(function (t) { return t.label + " (" + t.count + ")"; }).join("\n");
      if (!text) return;
      navigator.clipboard.writeText(text).then(
        function () {
          copyBtn.textContent = "Copied";
          setTimeout(function () {
            copyBtn.textContent = "Copy list";
          }, 1600);
        },
        function () {},
      );
    });
  }
})();
