/* /tools/content-decay — client. Uses wireSimple(); builds its own table
 * since the "likely stale" cell needs a colored yes/no, which renderTable's
 * escaping doesn't allow through.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;
  var tk = window.SokosumiToolKit;

  var urlsInput = document.getElementById("cddUrls");
  var noteEl = document.getElementById("cddNote");
  var tableEl = document.getElementById("cddTable");

  function parseUrls(value) {
    return String(value || "")
      .split("\n")
      .map(function (u) { return u.trim(); })
      .filter(Boolean);
  }

  function renderResults(container, pages) {
    var head = "<tr><th>URL</th><th>Age</th><th>Words</th><th>Status</th></tr>";
    var body = pages
      .map(function (p) {
        var age = p.error ? "—" : p.ageDays == null ? "unknown" : p.ageDays + "d";
        var status = p.error
          ? '<span class="no">' + tk.esc(p.error) + "</span>"
          : p.likelyStale
            ? '<span style="color:#8a6100">' + tk.esc(p.flags.join("; ")) + "</span>"
            : '<span class="yes">looks fresh</span>';
        return (
          "<tr><td class=\"is-wrap\">" +
          tk.esc(p.title || p.url) +
          "</td><td>" +
          age +
          "</td><td>" +
          (p.words || "—") +
          '</td><td class="is-wrap">' +
          status +
          "</td></tr>"
        );
      })
      .join("");
    container.innerHTML = '<div class="tk-table-wrap"><table class="tk-table"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>";
  }

  tk.wireSimple({
    formId: "cddForm",
    submitId: "cddSubmit",
    errorId: "cddError",
    loadingId: "cddLoading",
    resultId: "cddResult",
    endpoint: "/api/content-decay-check",
    method: "POST",
    submitLabel: "Check for decay",
    busyLabel: "Checking…",
    isEmpty: function () {
      return !parseUrls(urlsInput.value).length;
    },
    getValue: function () {
      return parseUrls(urlsInput.value);
    },
    buildBody: function (urls) {
      return { urls: urls };
    },
    onData: function (data) {
      noteEl.textContent = "Checked " + data.checked + " URL(s), " + data.staleCount + " likely stale.";
      renderResults(tableEl, data.pages);
    },
  });
})();
