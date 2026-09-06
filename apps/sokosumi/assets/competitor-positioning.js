/* /tools/competitor-positioning — client. Uses wireSimple() + renderTable()/
 * renderGroups() since the result is a side-by-side comparison, not a score.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;
  var tk = window.SokosumiToolKit;

  var urlAInput = document.getElementById("cptUrlA");
  var urlBInput = document.getElementById("cptUrlB");
  var tableEl = document.getElementById("cptTable");
  var groupsEl = document.getElementById("cptGroups");

  function yn(bool) {
    return bool ? '<span class="yes">yes</span>' : '<span class="no">no</span>';
  }

  tk.wireSimple({
    formId: "cptForm",
    submitId: "cptSubmit",
    errorId: "cptError",
    loadingId: "cptLoading",
    resultId: "cptResult",
    endpoint: "/api/competitor-positioning-check",
    method: "POST",
    submitLabel: "Compare",
    busyLabel: "Comparing…",
    isEmpty: function () {
      return !urlAInput.value.trim() || !urlBInput.value.trim();
    },
    getValue: function () {
      return { urlA: urlAInput.value, urlB: urlBInput.value };
    },
    buildBody: function (value) {
      return value;
    },
    onData: function (data) {
      var a = data.siteA;
      var b = data.siteB;
      tableEl.innerHTML =
        '<div class="tk-table-wrap"><table class="tk-table"><thead><tr><th></th><th>' +
        tk.esc(a.url) +
        "</th><th>" +
        tk.esc(b.url) +
        "</th></tr></thead><tbody>" +
        [
          ["Title", tk.esc(a.title), tk.esc(b.title)],
          ["Meta description", tk.esc(a.description || "—"), tk.esc(b.description || "—")],
          ["H1", tk.esc(a.h1 || "—"), tk.esc(b.h1 || "—")],
          ["Word count", a.words, b.words],
          ["Has CTA", yn(a.ctaCount > 0), yn(b.ctaCount > 0)],
          ["Shows pricing", yn(a.hasPricing), yn(b.hasPricing)],
          ["Has social proof", yn(a.hasProof), yn(b.hasProof)],
        ]
          .map(function (row) {
            return "<tr><td>" + row[0] + '</td><td class="is-wrap">' + row[1] + '</td><td class="is-wrap">' + row[2] + "</td></tr>";
          })
          .join("") +
        "</tbody></table></div>";

      tk.renderGroups(groupsEl, [
        { title: "Your gaps vs the competitor", items: data.gapsA },
        { title: "Their gaps vs you", items: data.gapsB },
      ]);
    },
  });
})();
