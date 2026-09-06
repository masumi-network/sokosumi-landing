/* /tools/x-algorithm-analyzer — client. Thin wiring over
 * SokosumiToolKit.wireScorer(); the server does the scoring.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;

  var textInput = document.getElementById("xaaText");
  var mediaInput = document.getElementById("xaaMedia");

  window.SokosumiToolKit.wireScorer({
    formId: "xaaForm",
    submitId: "xaaSubmit",
    errorId: "xaaError",
    loadingId: "xaaLoading",
    resultId: "xaaResult",
    summaryScoreId: "xaaSummaryScore",
    scoresId: "xaaScores",
    dimsId: "xaaDims",
    copyId: "xaaCopy",
    endpoint: "/api/x-algorithm-check",
    method: "POST",
    submitLabel: "Score my post",
    busyLabel: "Scoring…",
    reportTitle: function (data) {
      return "X algorithm analyzer — " + data.overall + "/100";
    },
    getValue: function () {
      return textInput.value;
    },
    setValue: function (value) {
      textInput.value = value;
    },
    buildBody: function (value) {
      return { text: value, hasMedia: mediaInput.checked };
    },
    examples: {
      weak: "Check out our new product at https://example.com/product #marketing #sales #growth #startup #b2b #saas #tech",
      strong: "Most teams still copy-paste campaign briefs into five different tools by hand. What's the most tedious part of your setup process — curious what everyone else is stuck doing manually.",
    },
  });
})();
