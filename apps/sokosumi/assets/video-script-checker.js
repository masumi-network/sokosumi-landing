/* /tools/video-script-checker — client.
 *
 * The server does all the scoring; this file only renders what comes back
 * and wires up the two "Try" examples. POSTs a JSON body — pasted scripts run
 * long, and there's nothing fetched here to make a shareable GET worthwhile.
 */
(function () {
  "use strict";

  var form = document.getElementById("vscForm");
  if (!form) return;

  var textInput = document.getElementById("vscText");
  var submit = document.getElementById("vscSubmit");
  var errorBox = document.getElementById("vscError");
  var loading = document.getElementById("vscLoading");
  var result = document.getElementById("vscResult");
  var summaryScore = document.getElementById("vscSummaryScore");
  var scores = document.getElementById("vscScores");
  var dimsEl = document.getElementById("vscDims");
  var copyBtn = document.getElementById("vscCopy");

  var data = null;
  var filter = "";

  var EXAMPLES = {
    weak: {
      text:
        "Hi guys, welcome back to my channel. Today I'm going to talk about something that I've been thinking about for a while, which is basically how a lot of people, like, kind of get this wrong. So there's this thing that happens, um, where people just don't really know what to do about it, and I think that's actually a pretty big problem. Anyway that's kind of it for today.",
    },
    strong: {
      text:
        "Nobody tells you this before your first product launch.\n\nYou will spend more time writing the announcement than building the feature.\n\n[cut to] Here's what actually moved the needle: we scrapped the blog post, and sent 40 customers a two-line DM instead — \"this shipped because you asked for it.\"\n\nReplies came back in minutes. Not from a form. From a person who felt seen.\n\nFollow for the next lesson — how we turned those replies into our next roadmap.",
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
    submit.textContent = busy ? "Scoring…" : "Score my script";
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

  function reportText() {
    var lines = ["Video script checker — " + data.overall + "/100 (" + bandLabel(data.overall) + ")", "About " + data.estSeconds + "s at a natural speaking pace (" + data.wordCount + " words)", ""];
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
          '<div class="vsc-check is-' +
          check.level +
          '"><span class="vsc-check-mark" aria-hidden="true">' +
          MARK[check.level] +
          '</span><p class="vsc-check-title">' +
          esc(check.title) +
          '<code class="vsc-check-tag">' +
          esc(check.tag) +
          '</code></p><p class="vsc-check-detail">' +
          esc(check.detail) +
          "</p></div>"
        );
      })
      .join("");

    return (
      '<div class="vsc-dim">' +
      '<div class="vsc-dim-head"><h3>' +
      esc(dim.label) +
      '</h3><span class="vsc-dim-score is-' +
      bandLabel(dim.score).toLowerCase().replace(" ", "-") +
      '">' +
      dim.score +
      "/100 · " +
      esc(bandLabel(dim.score)) +
      "</span></div>" +
      '<div class="vsc-checks">' +
      checksHtml +
      "</div></div>"
    );
  }

  function render() {
    summaryScore.innerHTML =
      "<strong>" +
      data.overall +
      "/100</strong>" +
      esc(bandLabel(data.overall)) +
      " overall · about " +
      data.estSeconds +
      "s (" +
      data.wordCount +
      " words)";

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
          '<button type="button" class="vsc-score is-' +
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

  function run(text) {
    if (!text || !String(text).trim()) return;
    textInput.value = text;
    errorBox.hidden = true;
    result.hidden = true;
    setBusy(true);

    fetch("/api/video-script-check", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ text: text }),
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
    run(textInput.value);
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
    run(example.text);
  });
})();
