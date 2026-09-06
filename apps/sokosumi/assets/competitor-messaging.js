/* /tools/competitor-messaging — client. Uses wireSimple() + renderTable()/
 * renderCloud() since the result is a multi-site comparison, not a score.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;
  var tk = window.SokosumiToolKit;

  var urlsInput = document.getElementById("cmcUrls");
  var tableEl = document.getElementById("cmcTable");
  var sharedEl = document.getElementById("cmcShared");
  var uniqueEl = document.getElementById("cmcUnique");

  function parseUrls(value) {
    return String(value || "")
      .split("\n")
      .map(function (u) { return u.trim(); })
      .filter(Boolean);
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
      tk.renderTable(
        tableEl,
        ["Site", "Tone", "Avg words/sentence", "Power words"],
        data.sites.map(function (s) {
          return [s.title || s.url, s.toneLabel, s.avgSentenceLength, s.powerWordMatches];
        }),
      );
      tk.renderCloud(sharedEl, data.sharedThemes.length ? data.sharedThemes : ["No shared themes found"]);
      uniqueEl.innerHTML = data.uniquePerSite
        .map(function (u) {
          return (
            '<div class="tk-card" style="margin-bottom:12px"><h3>' +
            tk.esc(u.url) +
            '</h3><div class="tk-cloud" style="margin-top:10px">' +
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
