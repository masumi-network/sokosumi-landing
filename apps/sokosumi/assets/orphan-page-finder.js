/* /tools/orphan-pages: client. Uses wireSimple() + renderGroups().
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;
  var tk = window.SokosumiToolKit;

  var urlInput = document.getElementById("opfUrl");
  var noteEl = document.getElementById("opfNote");
  var groupsEl = document.getElementById("opfGroups");
  var nextEl = document.getElementById("opfNext");

  function plural(n, one, many) {
    return n + " " + (n === 1 ? one : many);
  }

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
      var checked = data.sitemapPageCount;
      var total = data.sitemapTotal || checked;
      // Make the cap honest: "Checked 20 of 143 pages" so no one assumes the
      // whole site was covered.
      var checkedLabel = total > checked ? "Checked " + checked + " of " + total + " pages" : "Checked " + plural(checked, "page", "pages");

      if (!data.orphanCount) {
        noteEl.textContent = checkedLabel + ".";
        groupsEl.innerHTML =
          '<div class="tk-empty"><p><strong>No orphan pages found.</strong> Every page in your sitemap has at least one link pointing to it.</p></div>';
        if (nextEl) nextEl.hidden = true;
        return;
      }

      noteEl.textContent = checkedLabel + ", found " + plural(data.orphanCount, "orphan", "orphans") + ".";
      tk.renderGroups(groupsEl, [
        {
          title: "Orphan pages",
          items: data.orphans.map(function (url) { return { level: "warn", title: url }; }),
        },
      ]);
      if (nextEl) nextEl.hidden = false;
    },
  });
})();
