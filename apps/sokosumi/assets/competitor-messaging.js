/* /tools/competitor-messaging — client. Uses wireSimple() + renderTable()/
 * renderCloud() since the result is a multi-site comparison, not a score.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;
  var tk = window.SokosumiToolKit;

  var urlsInput = document.getElementById("cmcUrls");
  var sitesEl = document.getElementById("cmcSites");
  var metricsEl = document.getElementById("cmcMetrics");
  var sharedEl = document.getElementById("cmcShared");
  var uniqueEl = document.getElementById("cmcUnique");

  // One accent per site, reused across the positioning cards, the comparison
  // bars and the unique-vocabulary blocks so a reader can track a site by colour.
  var COLORS = ["#2b5c78", "#b5761b", "#2f6b45", "#7a4ea3", "#b02a2a"];

  function parseUrls(value) {
    return String(value || "")
      .split("\n")
      .map(function (u) { return u.trim(); })
      .filter(Boolean);
  }

  function host(u) {
    try {
      return new URL(u).hostname.replace(/^www\./, "");
    } catch (e) {
      return u;
    }
  }

  tk.wireSimple({
    formId: "cmcForm",
    submitId: "cmcSubmit",
    errorId: "cmcError",
    loadingId: "cmcLoading",
    resultId: "cmcResult",
    endpoint: "/api/competitor-messaging-check",
    method: "POST",
    submitLabel: "Compare",
    busyLabel: "Comparing…",
    isEmpty: function () {
      return parseUrls(urlsInput.value).length < 2;
    },
    getValue: function () {
      return parseUrls(urlsInput.value);
    },
    buildBody: function (urls) {
      return { urls: urls };
    },
    onData: function (data) {
      var sites = data.sites || [];

      // Positioning cards: each site's headline + tone + a couple of stats.
      sitesEl.innerHTML = sites
        .map(function (s, i) {
          var c = COLORS[i % COLORS.length];
          return (
            '<div class="cmc-site" style="--c:' + c + '">' +
            '<div class="cmc-site-head"><span class="cmc-dot"></span><b>' + tk.esc(host(s.url)) + "</b>" +
            '<span class="cmc-tone">' + tk.esc(s.toneLabel) + "</span></div>" +
            '<p class="cmc-headline">' + tk.esc(s.headline || "—") + "</p>" +
            '<div class="cmc-mini">' + tk.esc(s.words) + " words · " + tk.esc(s.avgSentenceLength) + " words/sentence</div>" +
            "</div>"
          );
        })
        .join("");

      // Comparison bars: one group per metric, one bar per site, scaled so the
      // leader is full width (customer focus is already a 0-100 percentage).
      var metrics = [
        { label: "Customer focus", note: "% “you” vs “we”", key: "customerFocus", suffix: "%", pct: true },
        { label: "Power-word density", note: "per 100 words", key: "powerPer100", suffix: "" },
        { label: "Specificity", note: "numbers per 100 words", key: "numbersPer100", suffix: "" },
        { label: "Avg sentence length", note: "words", key: "avgSentenceLength", suffix: "" },
      ];
      metricsEl.innerHTML = metrics
        .map(function (m) {
          var max = m.pct ? 100 : Math.max.apply(null, sites.map(function (s) { return s[m.key] || 0; })) || 1;
          var rows = sites
            .map(function (s, i) {
              var val = s[m.key] || 0;
              var w = Math.max(2, Math.round((val / max) * 100));
              return (
                '<div class="cmc-bar-row"><span class="cmc-bar-name">' + tk.esc(host(s.url)) + "</span>" +
                '<span class="cmc-bar-track"><i style="width:' + w + "%;background:" + COLORS[i % COLORS.length] + '"></i></span>' +
                '<span class="cmc-bar-val">' + tk.esc(val) + m.suffix + "</span></div>"
              );
            })
            .join("");
          return '<div class="cmc-metric"><div class="cmc-metric-label">' + tk.esc(m.label) + " <small>" + tk.esc(m.note) + "</small></div>" + rows + "</div>";
        })
        .join("");

      tk.renderCloud(sharedEl, data.sharedThemes.length ? data.sharedThemes : ["No shared themes found"]);

      uniqueEl.innerHTML = data.uniquePerSite
        .map(function (u, i) {
          var c = COLORS[i % COLORS.length];
          return (
            '<div class="cmc-uniq" style="--c:' + c + '">' +
            '<div class="cmc-uniq-head"><span class="cmc-dot"></span>' + tk.esc(host(u.url)) + "</div>" +
            '<div class="tk-cloud">' +
            (u.words.length
              ? u.words.map(function (w) { return '<span class="tk-tag">' + tk.esc(w.label) + "<b>" + tk.esc(w.count) + "</b></span>"; }).join("")
              : '<span class="tk-tag">No unique vocabulary found</span>') +
            "</div></div>"
          );
        })
        .join("");
    },
  });
})();
