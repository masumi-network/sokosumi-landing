/* /tools/landing-page-teardown: client. Thin wiring over
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
    submitLabel: "Audit My Page",
    busyLabel: "Auditing…",
    scoreLabel: "Conversion score",
    reportTitle: function (data) {
      return "Landing page conversion audit: " + data.url + ": " + data.overall + "/100";
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
      stripe: "https://stripe.com",
      linear: "https://linear.app",
      vercel: "https://vercel.com",
      notion: "https://notion.so",
      figma: "https://figma.com",
    },
  });
})();
