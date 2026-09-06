/* /tools/internal-linking-finder — client. Uses wireSimple() + renderTable().
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;
  var tk = window.SokosumiToolKit;

  var urlInput = document.getElementById("ilfUrl");
  var noteEl = document.getElementById("ilfNote");
  var tableEl = document.getElementById("ilfTable");

  tk.wireSimple({
    formId: "ilfForm",
    submitId: "ilfSubmit",
    errorId: "ilfError",
    loadingId: "ilfLoading",
    resultId: "ilfResult",
    endpoint: "/api/internal-linking-check",
    method: "POST",
    submitLabel: "Find opportunities",
    busyLabel: "Crawling…",
    getValue: function () {
      return urlInput.value;
    },
    buildBody: function (value) {
      return { url: value };
    },
    onData: function (data) {
      noteEl.textContent = "Crawled " + data.pagesCrawled + " page(s), found " + data.suggestions.length + " suggestion(s), ranked by keyword overlap.";
      if (!data.suggestions.length) {
        tableEl.innerHTML = '<p class="tk-empty">No strong linking opportunities found among the crawled pages.</p>';
        return;
      }
      tk.renderTable(
        tableEl,
        ["From", "To", "Overlap", "Suggested anchor"],
        data.suggestions.map(function (s) {
          return [s.fromTitle, s.toTitle, s.similarity + "%", s.anchorSuggestion];
        }),
      );
    },
  });
})();
