/* /tools/landing-page-teardown — client. Thin wiring over
 * SokosumiToolKit.wireScorer(); the server does the fetching and scoring.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;

  var urlInput = document.getElementById("ltcUrl");

  window.SokosumiToolKit.wireScorer({
    formId: "ltcForm",
    submitId: "ltcSubmit",
    errorId: "ltcError",
    loadingId: "ltcLoading",
    resultId: "ltcResult",
    summaryScoreId: "ltcSummaryScore",
    scoresId: "ltcScores",
    dimsId: "ltcDims",
    copyId: "ltcCopy",
    endpoint: "/api/landing-teardown-check",
    method: "POST",
    submitLabel: "Tear it down",
    busyLabel: "Tearing down…",
    reportTitle: function (data) {
      return "Landing page conversion teardown — " + data.url + " — " + data.overall + "/100";
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
