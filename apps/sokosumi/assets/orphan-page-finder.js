/* /tools/orphan-pages — client. Uses wireSimple() + renderGroups().
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;
  var tk = window.SokosumiToolKit;

  var urlInput = document.getElementById("opfUrl");
  var noteEl = document.getElementById("opfNote");
  var groupsEl = document.getElementById("opfGroups");

  tk.wireSimple({
    formId: "opfForm",
    submitId: "opfSubmit",
    errorId: "opfError",
    loadingId: "opfLoading",
    resultId: "opfResult",
    endpoint: "/api/orphan-pages-check",
    method: "POST",
    submitLabel: "Find orphan pages",
    busyLabel: "Crawling…",
    getValue: function () {
      return urlInput.value;
    },
    buildBody: function (value) {
      return { url: value };
    },
    onData: function (data) {
      noteEl.textContent = "Checked " + data.sitemapPageCount + " sitemap page(s), found " + data.orphanCount + " orphan(s).";
      tk.renderGroups(groupsEl, [
        {
          title: "Orphan pages",
          items: data.orphans.map(function (url) { return { level: "warn", title: url }; }),
        },
      ]);
    },
  });
})();
