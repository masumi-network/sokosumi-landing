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
    heading: '<path d="M6 12h12"/><path d="M6 20V4"/><path d="M18 20V4"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',
    text: '<line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/>',
    schema: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    canonical: '<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
    device: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
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
  // The site's own favicon, resolved by hostname; falls back to the A/B letter
  // badge if the icon can't load.
  function favicon(hostName, letter) {
    var src = "https://www.google.com/s2/favicons?sz=64&domain=" + encodeURIComponent(hostName);
    return (
      '<span class="cpt-fav"><img src="' + src + '" alt="" width="26" height="26" loading="lazy" ' +
      "onerror=\"this.closest('.cpt-fav').classList.add('is-broken')\"/>" +
      '<span class="cpt-fav-letter">' + letter + "</span></span>"
    );
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
      '<div class="cpt-profile-head">' + favicon(host(site.url), tag) + '<span class="cpt-profile-host">' + tk.esc(host(site.url)) + "</span></div>" +
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

      // Grouped, detailed comparison. num/bool rows count toward the lead
      // tally; info rows (lengths) are shown for context but not scored.
      function numRow(icon, label, av, bv) {
        return { icon: icon, label: label, a: num(av), b: num(bv), cmp: numCmp(av, bv), score: true };
      }
      function boolRow(icon, label, av, bv) {
        return { icon: icon, label: label, a: pill(av), b: pill(bv), cmp: boolCmp(av, bv), score: true };
      }
      function infoRow(icon, label, at, bt) {
        return { icon: icon, label: label, a: tk.esc(at), b: tk.esc(bt), cmp: "", score: false };
      }

      var groups = [
        { title: "Content depth", rows: [
          numRow(ICON.words, "Word count", a.words, b.words),
          numRow(ICON.heading, "H2 sections", a.h2Count, b.h2Count),
          numRow(ICON.image, "Images", a.images, b.images),
          numRow(ICON.links, "Internal links", a.internalLinks, b.internalLinks),
          numRow(ICON.external, "External links", a.externalLinks, b.externalLinks),
        ] },
        { title: "SEO & metadata", rows: [
          infoRow(ICON.type, "Title length", a.titleLen + " chars", b.titleLen + " chars"),
          infoRow(ICON.text, "Meta length", a.descLen + " chars", b.descLen + " chars"),
          boolRow(ICON.schema, "Structured data", a.hasSchema, b.hasSchema),
          boolRow(ICON.canonical, "Canonical URL", a.hasCanonical, b.hasCanonical),
          boolRow(ICON.share, "Open Graph image", a.hasOgImage, b.hasOgImage),
          boolRow(ICON.device, "Mobile viewport", a.hasViewport, b.hasViewport),
        ] },
        { title: "Conversion", rows: [
          boolRow(ICON.cta, "Call to action", a.ctaCount > 0, b.ctaCount > 0),
          boolRow(ICON.pricing, "Pricing shown", a.hasPricing, b.hasPricing),
          boolRow(ICON.proof, "Social proof", a.hasProof, b.hasProof),
        ] },
      ];

      var scoreRows = [];
      groups.forEach(function (g) {
        g.rows.forEach(function (r) { if (r.score) scoreRows.push(r); });
      });
      var total = scoreRows.length;
      var leadA = scoreRows.filter(function (r) { return r.cmp === "a"; }).length;
      var leadB = scoreRows.filter(function (r) { return r.cmp === "b"; }).length;
      var winner = leadA > leadB ? hostA : leadB > leadA ? hostB : null;

      function heroSide(tag, hostName, lead, isWin) {
        return (
          '<div class="cpt-hero-side' + (isWin ? " is-winner" : "") + '">' +
          favicon(hostName, tag) +
          '<span class="cpt-hero-host">' + tk.esc(hostName) + "</span>" +
          '<span class="cpt-hero-score">' + lead + "</span>" +
          '<span class="cpt-hero-sub">of ' + total + " signals</span>" +
          "</div>"
        );
      }

      var hero =
        '<div class="cpt-hero">' +
        heroSide("A", hostA, leadA, winner === hostA) +
        '<div class="cpt-hero-mid"><span class="cpt-hero-vs">VS</span></div>' +
        heroSide("B", hostB, leadB, winner === hostB) +
        "</div>";

      var boardRows =
        '<div class="cpt-row cpt-row-head"><span></span><span>' + tk.esc(hostA) + "</span><span>" + tk.esc(hostB) + "</span></div>" +
        groups
          .map(function (g) {
            return (
              '<div class="cpt-group-label">' + tk.esc(g.title) + "</div>" +
              g.rows.map(function (r) { return boardRow(r.icon, r.label, r.a, r.b, r.cmp); }).join("")
            );
          })
          .join("");

      var board = '<p class="cpt-sec">Signal scoreboard</p><div class="cpt-board">' + boardRows + "</div>";

      tableEl.innerHTML =
        hero +
        '<p class="cpt-sec">How each page positions itself</p>' +
        '<div class="cpt-profiles">' + profileCard(a, "A") + '<div class="cpt-vs-join"><span>VS</span></div>' + profileCard(b, "B") + "</div>" +
        board;

      tk.renderGroups(groupsEl, [
        { title: "Where " + hostA + " has gaps", items: data.gapsA },
        { title: "Where " + hostB + " has gaps", items: data.gapsB },
      ]);
    },
  });
})();
