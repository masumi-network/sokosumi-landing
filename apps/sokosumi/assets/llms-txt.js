/* /tools/llms-txt — client.
 *
 * The server fetches, parses and judges; this renders. Three views: the parsed
 * outline of the file, the link table with each link's status, and the raw
 * source. Plus the report list on the right.
 */
(function () {
  "use strict";

  var form = document.getElementById("ltForm");
  if (!form) return;

  var input = document.getElementById("ltUrl");
  var submit = document.getElementById("ltSubmit");
  var errorBox = document.getElementById("ltError");
  var loading = document.getElementById("ltLoading");
  var result = document.getElementById("ltResult");
  var summaryUrl = document.getElementById("ltSummaryUrl");
  var scores = document.getElementById("ltScores");
  var tabs = document.getElementById("ltTabs");
  var stage = document.getElementById("ltStage");
  var checksList = document.getElementById("ltChecks");
  var checksCount = document.getElementById("ltChecksCount");

  var data = null;
  var tab = "outline";
  var filter = "";

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // People type a bare domain. That is the common case, not the exception.
  function normalise(value) {
    var text = String(value || "").trim();
    if (!text) return "";
    if (!/^https?:\/\//i.test(text)) text = "https://" + text.replace(/^\/+/, "");
    return text;
  }

  function setBusy(busy) {
    submit.disabled = busy;
    submit.textContent = busy ? "Checking…" : "Check";
    loading.hidden = !busy;
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  // ---- views ------------------------------------------------------------

  function viewOutline() {
    var p = data.parsed;
    if (!data.found) {
      return (
        '<div class="lt-empty"><strong>No llms.txt here yet.</strong>' +
        "<span>" +
        esc(data.origin) +
        "/llms.txt returned 404. The starter below is a valid file you can put at that address.</span></div>"
      );
    }
    var out = '<div class="lt-outline">';
    out +=
      '<div class="lt-outline-row"><span class="lt-tag">H1</span><div>' +
      (p.title ? "<strong>" + esc(p.title) + "</strong>" : '<em class="lt-missing">missing — this is the one required part</em>') +
      "</div></div>";
    out +=
      '<div class="lt-outline-row"><span class="lt-tag">&gt;</span><div>' +
      (p.summary ? esc(p.summary) : '<em class="lt-missing">no summary blockquote</em>') +
      "</div></div>";
    if (p.details && p.details.length) {
      out +=
        '<div class="lt-outline-row"><span class="lt-tag">Text</span><div>' +
        esc(p.details.slice(0, 3).join(" ")).slice(0, 300) +
        (p.details.length > 3 ? " …" : "") +
        "</div></div>";
    }
    if (p.sections && p.sections.length) {
      out += '<div class="lt-outline-row"><span class="lt-tag">H2</span><div class="lt-sections">';
      out += p.sections
        .map(function (s) {
          return '<span class="lt-section-chip' + (/^optional$/i.test(s.name) ? " is-optional" : "") + '">' + esc(s.name) + "<b>" + s.count + "</b></span>";
        })
        .join("");
      out += "</div></div>";
    } else {
      out += '<div class="lt-outline-row"><span class="lt-tag">H2</span><div><em class="lt-missing">no sections</em></div></div>';
    }
    return out + "</div>";
  }

  function viewLinks() {
    if (!data.links || !data.links.length) return '<div class="lt-empty"><strong>No links to check.</strong><span>The file has no file-list entries.</span></div>';
    var head =
      data.linkTotal > data.links.length
        ? '<p class="lt-stage-note">Checked the first ' + data.links.length + " of " + data.linkTotal + " links.</p>"
        : '<p class="lt-stage-note">Checked all ' + data.links.length + " links in the file.</p>";
    return (
      head +
      '<div class="lt-links">' +
      data.links
        .map(function (l) {
          var state = l.ok ? "ok" : "bad";
          var label = l.ok ? String(l.status || 200) : l.status ? String(l.status) : esc(l.reason || "failed");
          return (
            '<div class="lt-link is-' + state + '">' +
            '<span class="lt-link-status">' + esc(label) + "</span>" +
            "<div><strong>" + esc(l.name || l.url) + "</strong>" +
            '<a href="' + esc(l.url) + '" rel="noopener noreferrer nofollow" target="_blank">' + esc(l.url) + "</a>" +
            (l.note ? "<span>" + esc(l.note) + "</span>" : "") +
            "</div>" +
            '<span class="lt-link-line">L' + l.line + "</span>" +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function viewSource() {
    if (!data.found || !data.text) return '<div class="lt-empty"><strong>Nothing to show.</strong><span>There is no file at this address.</span></div>';
    return (
      '<div class="lt-source"><button class="lt-copy" type="button" id="ltCopySource">Copy</button><pre>' +
      esc(data.text) +
      "</pre></div>"
    );
  }

  var VIEWS = {
    outline: { label: "Outline", render: viewOutline },
    links: { label: "Links", render: viewLinks },
    source: { label: "Source", render: viewSource },
  };
  var TAB_ORDER = ["outline", "links", "source"];

  function renderTabs() {
    tabs.innerHTML = TAB_ORDER.map(function (key) {
      var extra = key === "links" && data && data.links ? " (" + data.links.length + ")" : "";
      return (
        '<button type="button" role="tab" data-tab="' + key + '" aria-selected="' + (key === tab) + '">' +
        esc(VIEWS[key].label + extra) +
        "</button>"
      );
    }).join("");
  }

  function renderStage() {
    stage.innerHTML = VIEWS[tab].render();
    var copy = document.getElementById("ltCopySource");
    if (copy) bindCopy(copy, function () { return data.text || ""; });
  }

  function bindCopy(button, get) {
    button.addEventListener("click", function () {
      navigator.clipboard.writeText(get()).then(
        function () {
          button.textContent = "Copied";
          setTimeout(function () { button.textContent = "Copy"; }, 1600);
        },
        function () { button.textContent = "Press ⌘C"; },
      );
    });
  }

  // ---- report -----------------------------------------------------------

  var MARK = { error: "!", warn: "!", pass: "✓" };

  function renderChecks() {
    checksList.setAttribute("data-filter", filter);
    checksList.innerHTML = data.checks
      .map(function (c) {
        return (
          '<div class="lt-check is-' + c.level + '"><span class="lt-check-mark" aria-hidden="true">' + MARK[c.level] + "</span>" +
          '<p class="lt-check-title">' + esc(c.title) + '<code class="lt-check-tag">' + esc(c.tag) + "</code></p>" +
          '<p class="lt-check-detail">' + esc(c.detail) + "</p></div>"
        );
      })
      .join("");

    var counts = { error: 0, warn: 0, pass: 0 };
    data.checks.forEach(function (c) { counts[c.level] += 1; });
    checksCount.textContent = counts.error + counts.warn + counts.pass + (filter ? " checks, filtered" : " checks");

    scores.innerHTML = [
      ["error", counts.error, counts.error === 1 ? "problem" : "problems"],
      ["warn", counts.warn, counts.warn === 1 ? "warning" : "warnings"],
      ["pass", counts.pass, "passing"],
    ]
      .map(function (row) {
        return (
          '<button type="button" class="lt-score is-' + row[0] + (row[1] === 0 ? " is-zero" : "") +
          '" data-level="' + row[0] + '" aria-pressed="' + (filter === row[0]) + '">' +
          '<i aria-hidden="true"></i>' + row[1] + " " + row[2] + "</button>"
        );
      })
      .join("");
  }

  function render() {
    summaryUrl.innerHTML =
      "<strong>" + esc(data.parsed.title || data.origin) + "</strong>" + esc(data.finalUrl) +
      (data.found ? "" : " · not found");
    tab = data.found ? "outline" : "outline";
    renderTabs();
    renderStage();
    renderChecks();
    result.hidden = false;
  }

  function run(rawUrl) {
    var url = normalise(rawUrl);
    if (!url) return;
    input.value = url.replace(/^https?:\/\//, "");
    errorBox.hidden = true;
    result.hidden = true;
    setBusy(true);

    fetch("/api/llms-check?url=" + encodeURIComponent(url), { headers: { Accept: "application/json" } })
      .then(function (response) {
        return response.json().then(function (body) { return { ok: response.ok, body: body }; });
      })
      .then(function (res) {
        if (!res.ok || res.body.error) throw new Error(res.body.error || "That check did not work. Try again.");
        data = res.body;
        filter = "";
        render();
        var next = "/tools/llms-txt?url=" + encodeURIComponent(data.origin);
        if (window.history && window.history.replaceState) window.history.replaceState(null, "", next);
        result.scrollIntoView({ behavior: "smooth", block: "start" });
      })
      .catch(function (error) { showError(error.message || "That check did not work. Try again."); })
      .finally(function () { setBusy(false); });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    run(input.value);
  });

  tabs.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-tab]");
    if (!button) return;
    tab = button.getAttribute("data-tab");
    renderTabs();
    renderStage();
  });

  scores.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-level]");
    if (!button) return;
    var level = button.getAttribute("data-level");
    filter = filter === level ? "" : level;
    renderChecks();
  });

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-try]");
    if (!button) return;
    run(button.getAttribute("data-try"));
  });

  var starter = document.getElementById("ltCopyStarter");
  if (starter) {
    bindCopy(starter, function () {
      var pre = document.getElementById("ltStarter");
      return pre ? pre.innerText : "";
    });
  }

  var initial = new URLSearchParams(window.location.search).get("url");
  if (initial) run(initial);
})();
