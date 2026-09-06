/* /tools/core-web-vitals — client. Thin wiring over
 * SokosumiToolKit.wireScorer(); the server does the fetching and scoring.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;

  var urlInput = document.getElementById("cwvUrl");

  window.SokosumiToolKit.wireScorer({
    formId: "cwvForm",
    submitId: "cwvSubmit",
    errorId: "cwvError",
    loadingId: "cwvLoading",
    resultId: "cwvResult",
    summaryScoreId: "cwvSummaryScore",
    scoresId: "cwvScores",
    dimsId: "cwvDims",
    copyId: "cwvCopy",
    endpoint: "/api/core-web-vitals-check",
    method: "POST",
    submitLabel: "Explain this page",
    busyLabel: "Fetching…",
    reportTitle: function (data) {
      return "Core Web Vitals explainer (proxy) — " + data.url + " — " + data.overall + "/100";
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
