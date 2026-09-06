/* /tools/landing-page-copy-analyzer — client. Thin wiring over
 * SokosumiToolKit.wireScorer(); the server does the scoring.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;

  var textInput = document.getElementById("lcaText");

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
    submitLabel: "Score my copy",
    busyLabel: "Scoring…",
    reportTitle: function (data) {
      return "Landing page copy analyzer — " + data.overall + "/100";
    },
    getValue: function () {
      return textInput.value;
    },
    setValue: function (value) {
      textInput.value = value;
    },
    buildBody: function (value) {
      return { text: value };
    },
    examples: {
      weak: "We are a leading provider of innovative, best-in-class solutions. Our platform leverages cutting-edge technology to deliver a seamless, holistic experience. Various industries rely on our robust ecosystem. Learn more about what we do.",
      strong: "You'll cut campaign setup time in half. Most teams save 6 hours a week once they hand the busywork to an AI coworker — no new software to learn, no migration. Start your free trial and ship your first campaign today.",
    },
  });
})();
