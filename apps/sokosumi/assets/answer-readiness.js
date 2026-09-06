/* /tools/answer-readiness — client. Thin wiring over
 * SokosumiToolKit.wireScorer(); the server does the fetching and scoring.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;

  var urlInput = document.getElementById("arsUrl");

  window.SokosumiToolKit.wireScorer({
    formId: "arsForm",
    submitId: "arsSubmit",
    errorId: "arsError",
    loadingId: "arsLoading",
    resultId: "arsResult",
    summaryScoreId: "arsSummaryScore",
    scoresId: "arsScores",
    dimsId: "arsDims",
    copyId: "arsCopy",
    endpoint: "/api/answer-readiness-check",
    method: "POST",
    submitLabel: "Score this page",
    busyLabel: "Scoring…",
    reportTitle: function (data) {
      return "Answer-readiness score — " + data.url + " — " + data.overall + "/100";
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
