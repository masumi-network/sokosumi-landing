/* /tools/internal-linking-finder: client. Uses wireSimple(); renders each
 * suggestion as a row (page to edit -> page to link to + anchor) with a Copy
 * button, plus a Copy all. Empty results explain why and point elsewhere.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;
  var tk = window.SokosumiToolKit;
  var esc = tk.esc;

  var urlInput = document.getElementById("ilfUrl");
  var noteEl = document.getElementById("ilfNote");
  var tableEl = document.getElementById("ilfTable");

  // The HTML an editor pastes into the "from" page to create the link.
  function linkMarkup(s) {
    return '<a href="' + s.toUrl + '">' + s.anchorSuggestion + "</a>";
  }

  function copyWithFeedback(btn, text) {
    var label = btn.getAttribute("data-label") || btn.textContent;
    btn.setAttribute("data-label", label);
    navigator.clipboard.writeText(text).then(
      function () {
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = label; }, 1600);
      },
      function () { btn.textContent = "Press ⌘C"; },
    );
  }

  tk.wireSimple({
    formId: "ilfForm",
    submitId: "ilfSubmit",
    errorId: "ilfError",
    loadingId: "ilfLoading",
    resultId: "ilfResult",
    endpoint: "/api/internal-linking-check",
    method: "POST",
    submitLabel: "Find opportunities",
    busyLabel: "Crawling…",
    getValue: function () {
      return urlInput.value;
    },
    buildBody: function (value) {
      return { url: value };
    },
    onData: function (data) {
      var max = data.maxPages || data.pagesCrawled;
      var crawled = "Crawled " + data.pagesCrawled + " of up to " + max + " pages.";

      if (!data.suggestions.length) {
        noteEl.textContent = crawled;
        tableEl.innerHTML =
          '<div class="ilf-empty">' +
          "<p>No new internal link opportunities among the pages we crawled. That usually means the site is small, or its pages already link to each other well.</p>" +
          '<p>To find pages that nothing on the site links to, try the <a href="/tools/orphan-pages">Orphan Page Finder</a>.</p>' +
          "</div>";
        return;
      }

      noteEl.textContent = crawled + " Found " + data.suggestions.length + " suggestion(s), ranked by keyword overlap.";

      var rows = data.suggestions
        .map(function (s) {
          return (
            '<div class="ilf-row">' +
            '<div class="ilf-cell"><span class="ilf-cell-label">Edit this page</span>' +
            '<a href="' + esc(s.fromUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(s.fromTitle) + "</a></div>" +
            '<div class="ilf-cell"><span class="ilf-cell-label">Link to</span>' +
            '<a href="' + esc(s.toUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(s.toTitle) + "</a></div>" +
            '<div class="ilf-cell ilf-cell-anchor"><span class="ilf-cell-label">Anchor text</span>' +
            '<code class="ilf-anchor">' + esc(s.anchorSuggestion) + "</code></div>" +
            '<button class="ilf-copy" type="button" data-copy="' + esc(linkMarkup(s)) + '">Copy</button>' +
            "</div>"
          );
        })
        .join("");

      tableEl.innerHTML =
        '<div class="ilf-actions"><button class="tk-copy" id="ilfCopyAll" type="button">Copy all</button></div>' +
        '<div class="ilf-list">' + rows + "</div>";

      // Per-row copy: the <a> markup to paste into the page being edited.
      Array.prototype.forEach.call(tableEl.querySelectorAll(".ilf-copy"), function (btn) {
        btn.addEventListener("click", function () {
          copyWithFeedback(btn, btn.getAttribute("data-copy"));
        });
      });

      // Copy all: a worksheet of every suggestion with its context.
      var allText = data.suggestions
        .map(function (s) {
          return 'On "' + s.fromTitle + '", link to "' + s.toTitle + '":\n' + linkMarkup(s);
        })
        .join("\n\n");
      var copyAll = document.getElementById("ilfCopyAll");
      if (copyAll) copyAll.addEventListener("click", function () { copyWithFeedback(copyAll, allText); });
    },
  });
})();
