/* /tools/social-post-checker — client.
 *
 * The server does all the scoring (and, in link mode, the fetch that turns a
 * LinkedIn URL into text); this file only renders what comes back, switches
 * between the two input modes, and wires up the two "Try" examples. POSTs a
 * JSON body rather than a GET with a query string — pasted post text runs
 * long, and there's no fetched resource here to make a shareable/cacheable
 * GET worthwhile (see /api/post-check in server.js for the reasoning).
 */
(function () {
  "use strict";

  var form = document.getElementById("pscForm");
  if (!form) return;

  var textInput = document.getElementById("pscText");
  var urlInput = document.getElementById("pscUrl");
  var modeTextBtn = document.getElementById("pscModeText");
  var modeUrlBtn = document.getElementById("pscModeUrl");
  var dayInput = document.getElementById("pscDay");
  var timeInput = document.getElementById("pscTime");
  var submit = document.getElementById("pscSubmit");
  var errorBox = document.getElementById("pscError");
  var loading = document.getElementById("pscLoading");
  var result = document.getElementById("pscResult");
  var summaryScore = document.getElementById("pscSummaryScore");
  var scores = document.getElementById("pscScores");
  var dimsEl = document.getElementById("pscDims");
  var copyBtn = document.getElementById("pscCopy");

  var data = null;
  var filter = "";
  var mode = "text";

  function setMode(next) {
    mode = next;
    modeTextBtn.setAttribute("aria-selected", String(mode === "text"));
    modeUrlBtn.setAttribute("aria-selected", String(mode === "url"));
    textInput.hidden = mode !== "text";
    urlInput.hidden = mode !== "url";
    errorBox.hidden = true;
  }

  var EXAMPLES = {
    weak: {
      text:
        "I'm excited to announce that our team just shipped a huge update to the platform. We've been working on this for months and I'm so proud of everyone involved. This release includes a bunch of new features and improvements across the board. Check it out at https://example.com/release-notes and let us know what you think! #tech #startup #innovation #product #saas #growth #ai #b2b #marketing",
    },
    strong: {
      text:
        "Most SaaS teams ship a feature and hope someone notices.\n\nWe tried something different for our last release: we told 20 customers exactly what was changing before it shipped, and asked one question — \"what would make this useless to you?\"\n\nThree answers changed the release. One killed a feature entirely.\n\nThe update went out last week with zero support tickets about it. That's never happened before.\n\nWhat's one thing you changed after asking customers a blunt question instead of a survey?\n\n#producttalk #saas #customerresearch",
    },
  };

  // ---- helpers ------------------------------------------------------------

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function setBusy(busy) {
    submit.disabled = busy;
    submit.textContent = busy ? "Scoring…" : "Score my post";
    loading.hidden = !busy;
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  // ---- rendering ------------------------------------------------------------

  var MARK = { error: "!", warn: "!", pass: "✓" };

  function bandLabel(score) {
    return score >= 80 ? "Strong" : score >= 50 ? "Needs work" : "Weak";
  }

  // A plain-text version of the report, for the copy button — same content
  // as the on-page cards, but readable pasted into a doc or a chat message.
  function reportText() {
    var lines = ["Social post checker — " + data.overall + "/100 (" + bandLabel(data.overall) + ")", ""];
    data.dimensions.forEach(function (d) {
      lines.push(d.label + ": " + d.score + "/100");
      d.checks.forEach(function (c) {
        lines.push("  [" + c.level + "] " + c.title + " — " + c.detail);
      });
      lines.push("");
    });
    if (data.recommendations && data.recommendations.length) {
      lines.push("Top fixes:");
      data.recommendations.forEach(function (r, i) {
        lines.push(i + 1 + ". " + r);
      });
    }
    return lines.join("\n").trim();
  }

  function renderDim(dim) {
    var checksHtml = dim.checks
      .map(function (check) {
        return (
          '<div class="psc-check is-' +
          check.level +
          '"><span class="psc-check-mark" aria-hidden="true">' +
          MARK[check.level] +
          '</span><p class="psc-check-title">' +
          esc(check.title) +
          '<code class="psc-check-tag">' +
          esc(check.tag) +
          '</code></p><p class="psc-check-detail">' +
          esc(check.detail) +
          "</p></div>"
        );
      })
      .join("");

    return (
      '<div class="psc-dim">' +
      '<div class="psc-dim-head"><h3>' +
      esc(dim.label) +
      '</h3><span class="psc-dim-score is-' +
      bandLabel(dim.score).toLowerCase().replace(" ", "-") +
      '">' +
      dim.score +
      "/100 · " +
      esc(bandLabel(dim.score)) +
      "</span></div>" +
      '<div class="psc-checks">' +
      checksHtml +
      "</div></div>"
    );
  }

  function render() {
    summaryScore.innerHTML =
      "<strong>" + data.overall + "/100</strong>" + esc(bandLabel(data.overall)) + " overall";

    var counts = { error: 0, warn: 0, pass: 0 };
    data.dimensions.forEach(function (d) {
      d.checks.forEach(function (c) {
        counts[c.level] += 1;
      });
    });
    scores.innerHTML = [
      ["error", counts.error, counts.error === 1 ? "problem" : "problems"],
      ["warn", counts.warn, counts.warn === 1 ? "warning" : "warnings"],
      ["pass", counts.pass, "passing"],
    ]
      .map(function (row) {
        return (
          '<button type="button" class="psc-score is-' +
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

    dimsEl.setAttribute("data-filter", filter);
    dimsEl.innerHTML = data.dimensions.map(renderDim).join("");
    result.hidden = false;
  }

  function run(payload, day, timeBucket) {
    var isUrl = mode === "url";
    var value = payload;
    if (!value || !String(value).trim()) return;
    if (isUrl) {
      urlInput.value = value;
    } else {
      textInput.value = value;
    }
    if (day != null) dayInput.value = day;
    if (timeBucket != null) timeInput.value = timeBucket;
    errorBox.hidden = true;
    result.hidden = true;
    setBusy(true);

    var body = { day: dayInput.value || undefined, timeBucket: timeInput.value || undefined };
    if (isUrl) {
      body.url = value;
    } else {
      body.text = value;
    }

    fetch("/api/post-check", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    })
      .then(function (response) {
        return response.json().then(function (body) {
          return { ok: response.ok, body: body };
        });
      })
      .then(function (res) {
        if (!res.ok || res.body.error) throw new Error(res.body.error || "That check did not work. Try again.");
        data = res.body;
        filter = "";
        render();
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
    run(mode === "url" ? urlInput.value : textInput.value, dayInput.value, timeInput.value);
  });

  modeTextBtn.addEventListener("click", function () {
    setMode("text");
  });
  modeUrlBtn.addEventListener("click", function () {
    setMode("url");
  });

  scores.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-level]");
    if (!button) return;
    var level = button.getAttribute("data-level");
    filter = filter === level ? "" : level;
    render();
  });

  copyBtn.addEventListener("click", function () {
    if (!data) return;
    navigator.clipboard.writeText(reportText()).then(
      function () {
        copyBtn.textContent = "Copied";
        setTimeout(function () {
          copyBtn.textContent = "Copy report";
        }, 1600);
      },
      function () {
        copyBtn.textContent = "Press ⌘C";
      },
    );
  });

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-try]");
    if (!button) return;
    var example = EXAMPLES[button.getAttribute("data-try")];
    if (!example) return;
    setMode("text");
    run(example.text, "", "");
  });
})();
