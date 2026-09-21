/* /tools/x-algorithm-analyzer — client. Thin wiring over
 * SokosumiToolKit.wireScorer(); the server does the scoring. Two input modes:
 * "write" (draft text + media flag) and "link" (a published post URL the
 * server fetches and scores).
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;

  var textInput = document.getElementById("xaaText");
  var urlInput = document.getElementById("xaaUrl");
  var mediaInput = document.getElementById("xaaMedia");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".xaa-tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".xaa-panel"));
  var submitBtn = document.getElementById("xaaSubmit");
  var mode = "write";

  function setMode(m) {
    mode = m;
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-mode") === m;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach(function (p) {
      p.hidden = p.getAttribute("data-mode") !== m;
    });
    if (submitBtn) submitBtn.textContent = m === "link" ? "Get the report" : "Score my post";
  }
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      setMode(t.getAttribute("data-mode"));
    });
  });

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
    busyLabel: mode === "link" ? "Fetching…" : "Scoring…",
    reportTitle: function (data) {
      return "X algorithm analyzer — " + data.overall + "/100";
    },
    getValue: function () {
      return mode === "link" ? urlInput.value : textInput.value;
    },
    setValue: function (value) {
      // Examples always populate the "write" tab.
      setMode("write");
      textInput.value = value;
    },
    buildBody: function (value) {
      return mode === "link" ? { text: value } : { text: value, hasMedia: mediaInput.checked };
    },
    examples: {
      weak: "Check out our new product at https://example.com/product #marketing #sales #growth #startup #b2b #saas #tech",
      strong: "Most teams still copy-paste campaign briefs into five different tools by hand. What's the most tedious part of your setup process — curious what everyone else is stuck doing manually.",
    },
  });
})();
