/* /tools/landing-page-copy-analyzer — client. Thin wiring over
 * SokosumiToolKit.wireScorer(); the server does the scoring.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;

  var urlInput = document.getElementById("lcaUrl");

  window.SokosumiToolKit.wireScorer({
    formId: "lcaForm",
    submitId: "lcaSubmit",
    errorId: "lcaError",
    loadingId: "lcaLoading",
    resultId: "lcaResult",
    summaryScoreId: "lcaSummaryScore",
    scoresId: "lcaScores",
    dimsId: "lcaDims",
    copyId: "lcaCopy",
    endpoint: "/api/landing-copy-check",
    method: "POST",
    submitLabel: "Analyze copy",
    busyLabel: "Analyzing…",
    reportTitle: function (data) {
      return "Landing page copy analyzer — " + (data.url || "") + " — " + data.overall + "/100";
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
      stripe: "https://stripe.com",
      linear: "https://linear.app",
      vercel: "https://vercel.com",
    },
  });
})();
