/* /tools/og-checker — client.
 *
 * The server does the fetching and the judging; this file only renders what
 * comes back. Six platform previews plus the HTML tab, and the inspector list.
 *
 * The previews are imitations, not screenshots: same crop, same clamp, same
 * order of information as the real product. That is what makes them useful —
 * you see the sentence that gets cut, not a mockup of a nice card.
 */
(function () {
  "use strict";

  var form = document.getElementById("ogcForm");
  if (!form) return;

  var input = document.getElementById("ogcUrl");
  var submit = document.getElementById("ogcSubmit");
  var errorBox = document.getElementById("ogcError");
  var loading = document.getElementById("ogcLoading");
  var result = document.getElementById("ogcResult");
  var summaryUrl = document.getElementById("ogcSummaryUrl");
  var scores = document.getElementById("ogcScores");
  var tabs = document.getElementById("ogcTabs");
  var stage = document.getElementById("ogcStage");
  var checksList = document.getElementById("ogcChecks");
  var checksCount = document.getElementById("ogcChecksCount");

  var data = null;
  var tab = "facebook";
  var filter = "";

  // ---- helpers ----------------------------------------------------------

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // A bare domain is what people type. Assume https rather than rejecting it.
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

  // ---- previews ---------------------------------------------------------

  function imageHtml(src, alt) {
    if (!src) return '<div class="ogc-noimg">No image</div>';
    return (
      '<img src="' +
      esc(src) +
      '" alt="' +
      esc(alt || "") +
      '" loading="lazy" decoding="async" onerror="this.outerHTML=\'<div class=&quot;ogc-noimg&quot;>Image failed to load</div>\'">'
    );
  }

  var PLATFORMS = {
    facebook: {
      label: "Facebook",
      note: "Facebook crops to 1.91:1 and shows one line of description on desktop, less on mobile.",
      render: function (p) {
        return (
          '<article class="ogc-card ogc-fb">' +
          imageHtml(p.image, p.title) +
          '<div class="ogc-body">' +
          '<div class="ogc-host">' +
          esc(p.host) +
          "</div>" +
          '<div class="ogc-t">' +
          esc(p.title || "Untitled") +
          "</div>" +
          (p.description ? '<div class="ogc-d">' + esc(p.description) + "</div>" : "") +
          "</div></article>"
        );
      },
    },
    x: {
      label: "X",
      note: "",
      render: function (p) {
        var t = p.twitter;
        if (!t.large) {
          return (
            '<article class="ogc-card ogc-x is-small">' +
            imageHtml(t.image, t.title) +
            '<div class="ogc-body">' +
            '<div class="ogc-host">' +
            esc(p.host) +
            "</div>" +
            '<div class="ogc-t">' +
            esc(t.title || "Untitled") +
            "</div>" +
            (t.description ? '<div class="ogc-d">' + esc(t.description) + "</div>" : "") +
            "</div></article>"
          );
        }
        return (
          '<article class="ogc-card ogc-x">' +
          imageHtml(t.image, t.title) +
          '<span class="ogc-host-pill">' +
          esc(p.host) +
          "</span>" +
          '<div class="ogc-body"><div class="ogc-t">' +
          esc(t.title || "Untitled") +
          "</div>" +
          (t.description ? '<div class="ogc-d">' + esc(t.description) + "</div>" : "") +
          "</div></article>"
        );
      },
    },
    linkedin: {
      label: "LinkedIn",
      note: "LinkedIn dropped the description from feed cards — the headline and the image carry the whole post.",
      render: function (p) {
        return (
          '<article class="ogc-card ogc-li">' +
          imageHtml(p.image, p.title) +
          '<div class="ogc-body"><div class="ogc-t">' +
          esc(p.title || "Untitled") +
          "</div>" +
          '<div class="ogc-host">' +
          esc(p.host) +
          "</div></div></article>"
        );
      },
    },
    whatsapp: {
      label: "WhatsApp",
      note: "WhatsApp only shows the large image when og:image is at least 300px wide and under about 600 KB. Below that it falls back to a small square thumbnail.",
      render: function (p) {
        return (
          '<article class="ogc-card ogc-wa"><div class="ogc-inner">' +
          imageHtml(p.image, p.title) +
          '<div class="ogc-body"><div class="ogc-t">' +
          esc(p.title || "Untitled") +
          "</div>" +
          (p.description ? '<div class="ogc-d">' + esc(p.description) + "</div>" : "") +
          '<div class="ogc-host">' +
          esc(p.host) +
          "</div></div></div>" +
          '<div class="ogc-link">' +
          esc(p.url) +
          "</div></article>"
        );
      },
    },
    slack: {
      label: "Slack",
      note: "Slack leads with og:site_name and shows up to three lines of description. The image sits under the text, not above it.",
      render: function (p) {
        return (
          '<article class="ogc-card ogc-sl">' +
          '<div class="ogc-host">' +
          esc(p.siteName || p.host) +
          "</div>" +
          '<div class="ogc-t">' +
          esc(p.title || "Untitled") +
          "</div>" +
          (p.description ? '<div class="ogc-d">' + esc(p.description) + "</div>" : "") +
          imageHtml(p.image, p.title) +
          "</article>"
        );
      },
    },
    discord: {
      label: "Discord",
      note: "Discord shows the most text of any platform — up to four lines — and colours the left rule from og:theme-color when it is set.",
      render: function (p) {
        return (
          '<article class="ogc-card ogc-dc">' +
          '<div class="ogc-host">' +
          esc(p.siteName || p.host) +
          "</div>" +
          '<div class="ogc-t">' +
          esc(p.title || "Untitled") +
          "</div>" +
          (p.description ? '<div class="ogc-d">' + esc(p.description) + "</div>" : "") +
          imageHtml(p.image, p.title) +
          "</article>"
        );
      },
    },
  };

  var TAB_ORDER = ["facebook", "x", "linkedin", "whatsapp", "slack", "discord", "html"];

  // Light syntax colouring, done by hand because the source is our own output
  // and its shape is known: comment lines, then tag / attribute / value.
  function highlight(source) {
    return esc(source)
      .split("\n")
      .map(function (line) {
        if (/^&lt;!--/.test(line)) return '<span class="ogc-cmt">' + line + "</span>";
        return line;
      })
      .join("\n");
  }

  function renderStage() {
    if (!data) return;
    if (tab === "html") {
      stage.innerHTML =
        '<div class="ogc-source"><button class="ogc-copy" type="button" id="ogcCopy">Copy</button><pre>' +
        highlight(data.html || "No meta tags found.") +
        "</pre></div>";
      var copy = document.getElementById("ogcCopy");
      copy.addEventListener("click", function () {
        navigator.clipboard.writeText(data.html || "").then(
          function () {
            copy.textContent = "Copied";
            setTimeout(function () {
              copy.textContent = "Copy";
            }, 1600);
          },
          function () {
            copy.textContent = "Press ⌘C";
          },
        );
      });
      return;
    }

    var platform = PLATFORMS[tab];
    var note = platform.note;
    if (tab === "x") {
      note = data.preview.twitter.large
        ? "twitter:card is summary_large_image, so X renders the wide card below."
        : 'twitter:card is "' +
          data.preview.twitter.card +
          '", so X falls back to this small square card. Set summary_large_image for the wide one.';
    }
    stage.innerHTML =
      platform.render(data.preview) + (note ? '<p class="ogc-stage-note">' + esc(note) + "</p>" : "");
  }

  function renderTabs() {
    tabs.innerHTML = TAB_ORDER.map(function (key) {
      var label = key === "html" ? "HTML tags" : PLATFORMS[key].label;
      return (
        '<button type="button" role="tab" data-tab="' +
        key +
        '" aria-selected="' +
        (key === tab) +
        '">' +
        esc(label) +
        "</button>"
      );
    }).join("");
  }

  // ---- inspector --------------------------------------------------------

  var MARK = { error: "!", warn: "!", pass: "✓" };

  function renderChecks() {
    checksList.setAttribute("data-filter", filter);
    checksList.innerHTML = data.checks
      .map(function (check) {
        return (
          '<div class="ogc-check is-' +
          check.level +
          '"><span class="ogc-check-mark" aria-hidden="true">' +
          MARK[check.level] +
          '</span><p class="ogc-check-title">' +
          esc(check.title) +
          '<code class="ogc-check-tag">' +
          esc(check.tag) +
          '</code></p><p class="ogc-check-detail">' +
          esc(check.detail) +
          "</p></div>"
        );
      })
      .join("");

    var counts = { error: 0, warn: 0, pass: 0 };
    data.checks.forEach(function (c) {
      counts[c.level] += 1;
    });
    checksCount.textContent =
      counts.error + counts.warn + counts.pass + (filter ? " checks, filtered" : " checks");

    scores.innerHTML = [
      ["error", counts.error, counts.error === 1 ? "problem" : "problems"],
      ["warn", counts.warn, counts.warn === 1 ? "warning" : "warnings"],
      ["pass", counts.pass, "passing"],
    ]
      .map(function (row) {
        return (
          '<button type="button" class="ogc-score is-' +
          row[0] +
          (row[1] === 0 ? " is-zero" : "") +
          '" data-level="' +
          row[0] +
          '" aria-pressed="' +
          (filter === row[0]) +
          '"><i aria-hidden="true"></i>' +
          row[1] +
          " " +
          row[2] +
          "</button>"
        );
      })
      .join("");
  }

  // ---- run --------------------------------------------------------------

  function render() {
    summaryUrl.innerHTML =
      "<strong>" +
      esc(data.preview.title || data.finalUrl) +
      "</strong>" +
      esc(data.finalUrl) +
      (data.redirected ? " · redirected" : "");
    renderTabs();
    renderStage();
    renderChecks();
    result.hidden = false;
  }

  function run(rawUrl) {
    var url = normalise(rawUrl);
    if (!url) return;
    input.value = url;
    errorBox.hidden = true;
    result.hidden = true;
    setBusy(true);

    fetch("/api/og-check?url=" + encodeURIComponent(url), { headers: { Accept: "application/json" } })
      .then(function (response) {
        return response.json().then(function (body) {
          return { ok: response.ok, body: body };
        });
      })
      .then(function (res) {
        if (!res.ok || res.body.error) throw new Error(res.body.error || "That check did not work. Try again.");
        data = res.body;
        tab = "facebook";
        filter = "";
        render();
        // Deep-linkable, so a result can be pasted to a colleague.
        var next = "/tools/og-checker?url=" + encodeURIComponent(data.url);
        if (window.history && window.history.replaceState) window.history.replaceState(null, "", next);
        result.scrollIntoView({ behavior: "smooth", block: "start" });
      })
      .catch(function (error) {
        showError(error.message || "That check did not work. Try again.");
      })
      .finally(function () {
        setBusy(false);
      });
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

  // A ?url= in the address bar runs on load, so shared links resolve to the
  // result rather than to an empty form.
  var initial = new URLSearchParams(window.location.search).get("url");
  if (initial) run(initial);
})();
