/* /tools/core-web-vitals: client. Thin wiring over
 * SokosumiToolKit.wireScorer(); the server does the fetching and scoring.
 */
(function () {
  "use strict";
  var tk = window.SokosumiToolKit;
  if (!tk) return;
  var esc = tk.esc;

  var urlInput = document.getElementById("cwvUrl");
  var fixFirstEl = document.getElementById("cwvFixFirst");

  // "Fix first": pull every problem and warning across the three vitals,
  // problems before warnings, so what to do leads instead of being buried
  // under the passing checks.
  function renderFixFirst(data) {
    if (!fixFirstEl) return;
    var issues = [];
    (data.dimensions || []).forEach(function (d) {
      (d.checks || []).forEach(function (c) {
        if (c.level === "error" || c.level === "warn") {
          issues.push({ level: c.level, title: c.title, fix: c.fix });
        }
      });
    });
    issues.sort(function (a, b) {
      var rank = { error: 0, warn: 1 };
      return rank[a.level] - rank[b.level];
    });
    if (!issues.length) {
      fixFirstEl.innerHTML =
        '<div class="cwv-fixfirst is-clear"><h3>Nothing urgent to fix</h3><p>No problems or warnings in the structural signals we can read. See the full breakdown below.</p></div>';
      return;
    }
    fixFirstEl.innerHTML =
      '<div class="cwv-fixfirst"><h3>Fix first</h3><ol class="cwv-fixlist">' +
      issues
        .map(function (i) {
          return (
            '<li class="is-' + i.level + '"><span class="cwv-fix-badge">' +
            (i.level === "error" ? "Problem" : "Warning") +
            "</span><strong>" + esc(i.title) + "</strong>" +
            (i.fix ? '<span class="cwv-fix-how">' + esc(i.fix) + "</span>" : "") +
            "</li>"
          );
        })
        .join("") +
      "</ol></div>";
  }

  tk.wireScorer({
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
    collapsePass: true,
    onData: renderFixFirst,
    reportTitle: function (data) {
      return "Web Vitals Explainer (proxy): " + data.url + ": " + data.overall + "/100";
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
      vercel: "https://vercel.com",
      notion: "https://notion.so",
    },
  });
})();
