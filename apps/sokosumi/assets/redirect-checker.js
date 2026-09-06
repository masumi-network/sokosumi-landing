/* /tools/redirect-checker — client. Uses wireSimple() + renderTable().
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;
  var tk = window.SokosumiToolKit;

  var urlInput = document.getElementById("rcUrl");
  var noteEl = document.getElementById("rcNote");
  var tableEl = document.getElementById("rcTable");

  tk.wireSimple({
    formId: "rcForm",
    submitId: "rcSubmit",
    errorId: "rcError",
    loadingId: "rcLoading",
    resultId: "rcResult",
    endpoint: "/api/redirect-check",
    method: "POST",
    submitLabel: "Find broken links",
    busyLabel: "Crawling…",
    getValue: function () {
      return urlInput.value;
    },
    buildBody: function (value) {
      return { url: value };
    },
    onData: function (data) {
      noteEl.textContent = "Checked " + data.checked + " link(s), found " + data.brokenCount + " broken.";
      if (!data.broken.length) {
        tableEl.innerHTML = '<p class="tk-empty">No broken links found among the sample checked.</p>';
        return;
      }
      tk.renderTable(
        tableEl,
        ["Broken URL", "Status", "Suggested replacement"],
        data.broken.map(function (b) {
          return [b.url, b.status, b.suggestion || "—"];
        }),
      );
    },
  });
})();
