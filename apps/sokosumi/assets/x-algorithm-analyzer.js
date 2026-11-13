/* /tools/x-algorithm-analyzer: client. Thin wiring over
 * SokosumiToolKit.wireScorer(); the server does the scoring. One input: paste
 * post text, or paste a link to a published X post and the server fetches and
 * scores its real text. We detect a pasted X link to tailor the UI (hide the
 * manual media toggle, show a hint), but the server auto-detects either way.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;

  var textInput = document.getElementById("xaaText");
  var mediaInput = document.getElementById("xaaMedia");
  var mediaRow = document.getElementById("xaaMediaRow");
  var linkHint = document.getElementById("xaaLinkHint");

  // A link to an already-published post on x.com / twitter.com. Mirrors the
  // server's X_STATUS_RE so the UI and the scorer agree on what a link is.
  var X_LINK_RE = /^https?:\/\/(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\/[^/]+\/status(?:es)?\/\d+/i;
  function isLink(value) {
    return X_LINK_RE.test(String(value || "").trim());
  }

  // Paste text -> show the media toggle; paste an X link -> hide it (media is
  // detected server-side) and show a hint that we'll fetch the live post.
  function reflect() {
    var link = isLink(textInput && textInput.value);
    if (mediaRow) mediaRow.hidden = link;
    if (linkHint) linkHint.hidden = !link;
  }
  if (textInput) textInput.addEventListener("input", reflect);
  reflect();

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
    scoreLabel: "Post score",
    reportTitle: function (data) {
      return "X Post Analyzer: " + data.overall + "/100";
    },
    getValue: function () {
      return textInput.value;
    },
    setValue: function (value) {
      textInput.value = value;
      reflect();
    },
    buildBody: function (value) {
      // The server fetches and scores a pasted X link; the manual media flag
      // only applies to pasted text.
      return isLink(value) ? { text: value } : { text: value, hasMedia: mediaInput.checked };
    },
    examples: {
      weak: "Check out our new product at https://example.com/product #marketing #sales #growth #startup #b2b #saas #tech",
      strong: "Most teams still copy-paste campaign briefs into five different tools by hand. What's the most tedious part of your setup process: curious what everyone else is stuck doing manually.",
    },
  });
})();
