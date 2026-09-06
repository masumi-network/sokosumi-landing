/* /tools/competitor-feature-gap — client. Uses wireSimple() + renderTable().
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;
  var tk = window.SokosumiToolKit;

  var urlsInput = document.getElementById("cfgUrls");
  var noteEl = document.getElementById("cfgNote");
  var tableEl = document.getElementById("cfgTable");

  function parseUrls(value) {
    return String(value || "")
      .split("\n")
      .map(function (u) { return u.trim(); })
      .filter(Boolean);
  }

  function mark(has) {
    return has ? '<span class="yes">✓</span>' : '<span class="no">—</span>';
  }

  function renderMatrix(container, sites, rows) {
    var head = "<tr><th>Feature</th>" + sites.map(function (s) { return "<th>" + tk.esc(s.url) + "</th>"; }).join("") + "</tr>";
    var body = rows
      .map(function (row) {
        return (
          '<tr><td class="is-wrap">' +
          tk.esc(row.label) +
          "</td>" +
          row.sites.map(function (has) { return "<td>" + mark(has) + "</td>"; }).join("") +
          "</tr>"
        );
      })
      .join("");
    container.innerHTML = '<div class="tk-table-wrap"><table class="tk-table"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>";
  }

  tk.wireSimple({
    formId: "cfgForm",
    submitId: "cfgSubmit",
    errorId: "cfgError",
    loadingId: "cfgLoading",
    resultId: "cfgResult",
    endpoint: "/api/competitor-feature-gap-check",
    method: "POST",
    submitLabel: "Build the matrix",
    busyLabel: "Building the matrix…",
    isEmpty: function () {
      return parseUrls(urlsInput.value).length < 2;
    },
    getValue: function () {
      return parseUrls(urlsInput.value);
    },
    buildBody: function (urls) {
      return { urls: urls };
    },
    onData: function (data) {
      noteEl.textContent =
        "Found " + data.rows.length + " candidate feature line(s) across " + data.sites.length + " site(s)." +
        (data.truncated ? " Showing the top " + data.rows.length + ", ranked by how many sites share them." : "");
      renderMatrix(tableEl, data.sites, data.rows);
    },
  });
})();
