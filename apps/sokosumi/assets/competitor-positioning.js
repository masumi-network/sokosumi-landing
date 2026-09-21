/* /tools/competitor-positioning — client. A head-to-head "VS" comparison:
 * a versus banner with per-side lead counts, then a table that highlights,
 * signal by signal, which site leads and where one has a gap.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;
  var tk = window.SokosumiToolKit;

  var urlAInput = document.getElementById("cptUrlA");
  var urlBInput = document.getElementById("cptUrlB");
  var tableEl = document.getElementById("cptTable");
  var groupsEl = document.getElementById("cptGroups");

  function host(u) {
    try {
      return new URL(u).hostname.replace(/^www\./, "");
    } catch (e) {
      return String(u || "");
    }
  }
  function present(v) {
    return !!(v && String(v).trim());
  }
  function yn(bool) {
    return bool ? '<span class="yes">Yes</span>' : '<span class="no">No</span>';
  }
  // Who leads this row: "a", "b", or "" for a tie.
  function presenceCmp(a, b) {
    if (present(a) === present(b)) return "";
    return present(a) ? "a" : "b";
  }
  function numCmp(a, b) {
    if (a === b) return "";
    return a > b ? "a" : "b";
  }
  function boolCmp(a, b) {
    if (a === b) return "";
    return a ? "a" : "b";
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
      var hostA = host(a.url);
      var hostB = host(b.url);

      var rows = [
        { label: "Title", a: a.title, b: b.title, cmp: presenceCmp(a.title, b.title), gap: true },
        { label: "Meta description", a: a.description, b: b.description, cmp: presenceCmp(a.description, b.description), gap: true },
        { label: "H1 heading", a: a.h1, b: b.h1, cmp: presenceCmp(a.h1, b.h1), gap: true },
        { label: "Word count", a: String(a.words), b: String(b.words), cmp: numCmp(a.words, b.words) },
        { label: "Internal links", a: String(a.internalLinks), b: String(b.internalLinks), cmp: numCmp(a.internalLinks, b.internalLinks) },
        { label: "Call to action", a: yn(a.ctaCount > 0), b: yn(b.ctaCount > 0), cmp: boolCmp(a.ctaCount > 0, b.ctaCount > 0), raw: true },
        { label: "Pricing shown", a: yn(a.hasPricing), b: yn(b.hasPricing), cmp: boolCmp(a.hasPricing, b.hasPricing), raw: true },
        { label: "Social proof", a: yn(a.hasProof), b: yn(b.hasProof), cmp: boolCmp(a.hasProof, b.hasProof), raw: true },
      ];

      var leadA = rows.filter(function (r) { return r.cmp === "a"; }).length;
      var leadB = rows.filter(function (r) { return r.cmp === "b"; }).length;

      function cell(row, side) {
        var val = side === "a" ? row.a : row.b;
        var cls = "is-wrap";
        if (row.cmp === side) cls += " cpt-win";
        var display = row.raw ? val : tk.esc(present(val) ? val : "—");
        if (row.gap && !present(val)) cls += " cpt-gap";
        return '<td class="' + cls + '">' + display + "</td>";
      }

      var body = rows
        .map(function (r) {
          return '<tr><td class="cpt-label">' + tk.esc(r.label) + "</td>" + cell(r, "a") + cell(r, "b") + "</tr>";
        })
        .join("");

      tableEl.innerHTML =
        '<div class="cpt-versus">' +
        '<div class="cpt-vs-side"><span class="cpt-vs-host">' + tk.esc(hostA) + '</span><span class="cpt-vs-lead">leads on ' + leadA + " of " + rows.length + "</span></div>" +
        '<span class="cpt-vs-badge">VS</span>' +
        '<div class="cpt-vs-side cpt-vs-b"><span class="cpt-vs-host">' + tk.esc(hostB) + '</span><span class="cpt-vs-lead">leads on ' + leadB + " of " + rows.length + "</span></div>" +
        "</div>" +
        '<div class="tk-table-wrap"><table class="tk-table cpt-table"><thead><tr><th>Signal</th><th>' +
        tk.esc(hostA) +
        "</th><th>" +
        tk.esc(hostB) +
        "</th></tr></thead><tbody>" +
        body +
        "</tbody></table></div>" +
        '<p class="cpt-legend"><span class="cpt-legend-dot"></span>Green marks the side that leads on that signal.</p>';

      tk.renderGroups(groupsEl, [
        { title: "Where " + hostA + " has gaps", items: data.gapsA },
        { title: "Where " + hostB + " has gaps", items: data.gapsB },
      ]);
    },
  });
})();
