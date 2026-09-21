/* /tools/competitor-positioning — client. A head-to-head comparison in three
 * scannable zones: a verdict hero (who leads, big numbers), side-by-side
 * messaging panels (the actual copy), and an icon scoreboard that marks the
 * winner of each measurable signal. Built to be read at a glance, not parsed.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;
  var tk = window.SokosumiToolKit;

  var urlAInput = document.getElementById("cptUrlA");
  var urlBInput = document.getElementById("cptUrlB");
  var tableEl = document.getElementById("cptTable");
  var groupsEl = document.getElementById("cptGroups");

  var ICON = {
    words:
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/>',
    links:
      '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    cta: '<path d="M9 11.5 4.5 3l8.5 4.5-3.5 1.2z"/><path d="m13 13 6 6"/><path d="M16 16v4h4"/>',
    pricing:
      '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.4 2.4 0 0 0 3.42 0l6.58-6.58a2.4 2.4 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1"/>',
    proof:
      '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  };
  function svg(p) {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  }
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
  function num(n) {
    return Number(n).toLocaleString();
  }
  function numCmp(a, b) {
    return a === b ? "" : a > b ? "a" : "b";
  }
  function boolCmp(a, b) {
    return a === b ? "" : a ? "a" : "b";
  }
  function pill(on) {
    return on ? '<span class="cpt-pill is-yes">Yes</span>' : '<span class="cpt-pill is-no">No</span>';
  }
  function field(label, val) {
    var ok = present(val);
    return (
      '<div class="cpt-f"><span class="cpt-f-label">' + tk.esc(label) + "</span>" +
      '<p class="cpt-f-val' + (ok ? "" : " is-empty") + '">' + tk.esc(ok ? val : "Not set") + "</p></div>"
    );
  }
  function profileCard(site, tag) {
    return (
      '<div class="cpt-profile">' +
      '<div class="cpt-profile-head"><span class="cpt-profile-tag">' + tag + '</span><span class="cpt-profile-host">' + tk.esc(host(site.url)) + "</span></div>" +
      field("Title", site.title) +
      field("H1 heading", site.h1) +
      field("Meta description", site.description) +
      "</div>"
    );
  }
  function boardRow(iconPath, label, aHtml, bHtml, cmp) {
    return (
      '<div class="cpt-row">' +
      '<span class="cpt-row-label"><span class="cpt-ico">' + svg(iconPath) + "</span>" + tk.esc(label) + "</span>" +
      '<span class="cpt-cell' + (cmp === "a" ? " is-win" : "") + '">' + aHtml + "</span>" +
      '<span class="cpt-cell' + (cmp === "b" ? " is-win" : "") + '">' + bHtml + "</span>" +
      "</div>"
    );
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

      var signals = [
        { icon: ICON.words, label: "Word count", a: num(a.words), b: num(b.words), cmp: numCmp(a.words, b.words) },
        { icon: ICON.links, label: "Internal links", a: num(a.internalLinks), b: num(b.internalLinks), cmp: numCmp(a.internalLinks, b.internalLinks) },
        { icon: ICON.cta, label: "Call to action", a: pill(a.ctaCount > 0), b: pill(b.ctaCount > 0), cmp: boolCmp(a.ctaCount > 0, b.ctaCount > 0) },
        { icon: ICON.pricing, label: "Pricing shown", a: pill(a.hasPricing), b: pill(b.hasPricing), cmp: boolCmp(a.hasPricing, b.hasPricing) },
        { icon: ICON.proof, label: "Social proof", a: pill(a.hasProof), b: pill(b.hasProof), cmp: boolCmp(a.hasProof, b.hasProof) },
      ];
      // Include the presence of title/meta/H1 in the lead tally, even though the
      // copy itself lives in the messaging panels rather than the scoreboard.
      var presence = [
        boolCmp(present(a.title), present(b.title)),
        boolCmp(present(a.description), present(b.description)),
        boolCmp(present(a.h1), present(b.h1)),
      ];
      var allCmp = signals.map(function (s) { return s.cmp; }).concat(presence);
      var total = allCmp.length;
      var leadA = allCmp.filter(function (c) { return c === "a"; }).length;
      var leadB = allCmp.filter(function (c) { return c === "b"; }).length;
      var winner = leadA > leadB ? hostA : leadB > leadA ? hostB : null;

      function heroSide(tag, hostName, lead, isWin) {
        return (
          '<div class="cpt-hero-side' + (isWin ? " is-winner" : "") + '">' +
          '<span class="cpt-hero-tag">' + tag + "</span>" +
          '<span class="cpt-hero-host">' + tk.esc(hostName) + "</span>" +
          '<span class="cpt-hero-score">' + lead + "</span>" +
          '<span class="cpt-hero-sub">of ' + total + " signals" + (isWin ? " · leads" : "") + "</span>" +
          "</div>"
        );
      }

      var hero =
        '<div class="cpt-hero">' +
        heroSide("A", hostA, leadA, winner === hostA) +
        '<div class="cpt-hero-mid"><span class="cpt-hero-vs">VS</span><span class="cpt-hero-crown">' +
        (winner ? tk.esc(winner) + " leads" : "Even match") +
        "</span></div>" +
        heroSide("B", hostB, leadB, winner === hostB) +
        "</div>";

      var board =
        '<p class="cpt-sec">Signal scoreboard</p>' +
        '<div class="cpt-board">' +
        '<div class="cpt-row cpt-row-head"><span></span><span>' + tk.esc(hostA) + "</span><span>" + tk.esc(hostB) + "</span></div>" +
        signals.map(function (s) { return boardRow(s.icon, s.label, s.a, s.b, s.cmp); }).join("") +
        "</div>";

      tableEl.innerHTML =
        hero +
        '<p class="cpt-sec">How each page positions itself</p>' +
        '<div class="cpt-profiles">' + profileCard(a, "A") + profileCard(b, "B") + "</div>" +
        board;

      tk.renderGroups(groupsEl, [
        { title: "Where " + hostA + " has gaps", items: data.gapsA },
        { title: "Where " + hostB + " has gaps", items: data.gapsB },
      ]);
    },
  });
})();
