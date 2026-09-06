/* /tools/ai-search-visibility — client. Thin wiring over
 * SokosumiToolKit.wireScorer(); the server does the fetching and scoring.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;

  var urlInput = document.getElementById("asvUrl");

  window.SokosumiToolKit.wireScorer({
    formId: "asvForm",
    submitId: "asvSubmit",
    errorId: "asvError",
    loadingId: "asvLoading",
    resultId: "asvResult",
    summaryScoreId: "asvSummaryScore",
    scoresId: "asvScores",
    dimsId: "asvDims",
    copyId: "asvCopy",
    endpoint: "/api/ai-search-visibility-check",
    method: "POST",
    submitLabel: "Check readiness",
    busyLabel: "Checking…",
    reportTitle: function (data) {
      return "AI search visibility readiness (proxy) — " + data.url + " — " + data.overall + "/100";
    },
    getValue: function () {
      return urlInput.value;
    },
    setValue: function (value) {
      urlInput.value = value;
    },
    buildBody: function (value) {
      return { url: value };
    },
    examples: {
      sokosumi: "https://sokosumi.com",
    },
  });
})();
