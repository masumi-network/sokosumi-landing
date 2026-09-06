/* /tools/keyword-clusters — client-only. Nothing leaves the browser: greedy
 * token-overlap clustering runs entirely here.
 */
(function () {
  "use strict";
  var tk = window.SokosumiToolKit;
  var form = document.getElementById("kcgForm");
  if (!form) return;

  var textInput = document.getElementById("kcgText");
  var result = document.getElementById("kcgResult");
  var note = document.getElementById("kcgNote");
  var groupsEl = document.getElementById("kcgGroups");

  var MAX_KEYWORDS = 1000;
  var STOPWORDS = {};
  "a an the and or for with best top how to what is are of in on".split(" ").forEach(function (w) {
    STOPWORDS[w] = true;
  });

  function tokens(kw) {
    return (kw.toLowerCase().match(/[a-z0-9]+/g) || []).filter(function (t) {
      return t.length >= 3 && !STOPWORDS[t];
    });
  }

  function titleCase(words) {
    return words.map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(" ");
  }

  function cluster(keywords) {
    var clusters = [];
    var uncategorized = [];
    keywords.forEach(function (kw) {
      var toks = tokens(kw);
      if (!toks.length) {
        uncategorized.push(kw);
        return;
      }
      var found = null;
      for (var i = 0; i < clusters.length; i++) {
        for (var j = 0; j < toks.length; j++) {
          if (clusters[i].tokenCounts[toks[j]]) {
            found = clusters[i];
            break;
          }
        }
        if (found) break;
      }
      if (!found) {
        found = { tokenCounts: {}, keywords: [] };
        clusters.push(found);
      }
      found.keywords.push(kw);
      toks.forEach(function (t) {
        found.tokenCounts[t] = (found.tokenCounts[t] || 0) + 1;
      });
    });
    return { clusters: clusters, uncategorized: uncategorized };
  }

  function labelCluster(c) {
    var top = Object.keys(c.tokenCounts)
      .sort(function (a, b) { return c.tokenCounts[b] - c.tokenCounts[a]; })
      .slice(0, 2);
    return titleCase(top) || "Cluster";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var raw = textInput.value.split(/[\n,]/).map(function (s) { return s.trim(); }).filter(Boolean);
    var keywords = Array.from(new Set(raw)).slice(0, MAX_KEYWORDS);
    if (!keywords.length) return;

    var out = cluster(keywords);
    out.clusters.sort(function (a, b) { return b.keywords.length - a.keywords.length; });

    note.textContent = keywords.length + " keyword(s) grouped into " + out.clusters.length + " cluster(s)" + (out.uncategorized.length ? ", " + out.uncategorized.length + " uncategorized" : "") + ".";

    var groups = out.clusters.map(function (c) {
      return {
        title: labelCluster(c) + " → suggested page: /" + labelCluster(c).toLowerCase().replace(/\s+/g, "-"),
        items: c.keywords.map(function (k) { return { level: "pass", title: k }; }),
      };
    });
    if (out.uncategorized.length) {
      groups.push({ title: "Uncategorized", items: out.uncategorized.map(function (k) { return { level: "warn", title: k }; }) });
    }
    tk.renderGroups(groupsEl, groups);
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
