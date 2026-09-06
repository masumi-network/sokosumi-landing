/* /tools/hashtag-generator — client-only. Nothing leaves the browser. */
(function () {
  "use strict";
  var tk = window.SokosumiToolKit;
  var form = document.getElementById("hgForm");
  if (!form) return;

  var textInput = document.getElementById("hgText");
  var result = document.getElementById("hgResult");
  var cloud = document.getElementById("hgCloud");
  var copyBtn = document.getElementById("hgCopy");
  var lastTags = [];

  var STOPWORDS = {};
  "a an the and or but if then so of to in on for with at by from up about into over after is are was were be been being this that these those it its your you our we us they them as not no do does did done can could should would will just more most so than very really also has have had get gets".split(" ").forEach(function (w) {
    STOPWORDS[w] = true;
  });

  function pascalCase(phrase) {
    return phrase
      .split(/\s+/)
      .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); })
      .join("");
  }

  function generate(text) {
    var words = (text.toLowerCase().match(/\b[a-z][a-z'-]{2,}\b/g) || []).filter(function (w) {
      return !STOPWORDS[w];
    });
    var counts = {};
    words.forEach(function (w) {
      counts[w] = (counts[w] || 0) + 1;
    });
    var bigramCounts = {};
    for (var i = 0; i < words.length - 1; i++) {
      var phrase = words[i] + " " + words[i + 1];
      bigramCounts[phrase] = (bigramCounts[phrase] || 0) + 1;
    }
    var unigrams = Object.keys(counts).map(function (w) { return { label: "#" + w, count: counts[w] }; });
    var bigrams = Object.keys(bigramCounts)
      .filter(function (p) { return bigramCounts[p] > 1; })
      .map(function (p) { return { label: "#" + pascalCase(p), count: bigramCounts[p] }; });
    return unigrams
      .concat(bigrams)
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, 15);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var text = textInput.value.trim();
    if (!text) return;
    lastTags = generate(text);
    tk.renderCloud(cloud, lastTags.length ? lastTags.map(function (t) { return t.label; }) : ["No strong hashtag candidates found"]);
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  copyBtn.addEventListener("click", function () {
    var text = lastTags.map(function (t) { return t.label; }).join(" ");
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      function () {
        copyBtn.textContent = "Copied";
        setTimeout(function () {
          copyBtn.textContent = "Copy hashtags";
        }, 1600);
      },
      function () {},
    );
  });
})();
