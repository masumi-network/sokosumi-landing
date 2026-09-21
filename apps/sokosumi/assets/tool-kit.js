/* Shared client helper for the batch of /tools pages built on the "tk-"
 * classes in tool-kit.css. Generalizes the fetch → render-dims → copy-report
 * logic that assets/headline-analyzer.js, assets/post-checker.js and
 * assets/video-script-checker.js each hand-rolled, so a dozen-plus more
 * analyzer-style tools don't each carry another 200-line copy of the same
 * wiring. A tool whose result isn't a pass/fail dimension list (a table, a
 * generated file) still uses esc()/setBusy()/showError() from here and
 * renders its own result markup.
 */
(function (global) {
  "use strict";

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function bandLabel(score) {
    return score >= 80 ? "Strong" : score >= 50 ? "Needs work" : "Weak";
  }

  var MARK = { error: "!", warn: "!", pass: "✓" };

  // "Strong" -> "strong", "Needs work" -> "needs-work" — the band as a CSS
  // modifier class, shared by the gauge, the meters and the dim scores.
  function bandClass(score) {
    return bandLabel(score).toLowerCase().replace(" ", "-");
  }

  // config: {
  //   formId, submitId, errorId, loadingId, resultId,
  //   summaryScoreId, scoresId, dimsId, copyId,          // all optional if renderResult is supplied
  //   endpoint, method ("POST"|"GET"), buildRequest(value) -> {body} or query string,
  //   getValue() -> value passed to buildRequest / examples,
  //   examples: { key: value, ... }, submitLabel, busyLabel,
  //   reportTitle(data) -> string,
  //   onData(data) -> void (optional extra rendering hook)
  // }
  function wireScorer(config) {
    var form = document.getElementById(config.formId);
    if (!form) return null;

    var submit = document.getElementById(config.submitId);
    var errorBox = document.getElementById(config.errorId);
    var loading = config.loadingId ? document.getElementById(config.loadingId) : null;
    var result = document.getElementById(config.resultId);
    var summaryScore = config.summaryScoreId ? document.getElementById(config.summaryScoreId) : null;
    var scores = config.scoresId ? document.getElementById(config.scoresId) : null;
    var dimsEl = config.dimsId ? document.getElementById(config.dimsId) : null;
    var copyBtn = config.copyId ? document.getElementById(config.copyId) : null;

    var data = null;
    var filter = "";

    function setBusy(busy) {
      if (submit) {
        submit.disabled = busy;
        submit.textContent = busy ? config.busyLabel || "Working…" : config.submitLabel || "Run";
      }
      if (loading) loading.hidden = !busy;
    }

    function showError(message) {
      if (!errorBox) return;
      errorBox.textContent = message;
      errorBox.hidden = false;
    }

    function reportText() {
      if (config.reportTitle) {
        var lines = [config.reportTitle(data), ""];
      } else {
        lines = ["Overall: " + data.overall + "/100 (" + bandLabel(data.overall) + ")", ""];
      }
      (data.dimensions || []).forEach(function (d) {
        lines.push(d.label + ": " + d.score + "/100");
        (d.checks || []).forEach(function (c) {
          lines.push("  [" + c.level + "] " + c.title + " — " + c.detail);
          (c.evidence || []).forEach(function (e) {
            lines.push("      • " + e);
          });
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

    // Lucide (ISC) line icons, matched to a dimension by keyword so every
    // score tool's result cards carry a relevant glyph, not just text.
    var DIM_ICONS = {
      text: '<line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/>',
      target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
      gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
      cursor: '<path d="M9 11.5 4.5 3l8.5 4.5-3.5 1.2z"/><path d="m13 13 6 6"/><path d="M16 16v4h4"/>',
      message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
      link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
      image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
      shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
      heading: '<path d="M6 12h12"/><path d="M6 20V4"/><path d="M18 20V4"/>',
      dot: '<circle cx="12" cy="12" r="3.5"/>',
    };
    function dimIcon(label) {
      var l = String(label).toLowerCase();
      if (/clar|clear|read/.test(l)) return DIM_ICONS.text;
      if (/benefit|outcome|value|custom-cent|reader/.test(l)) return DIM_ICONS.target;
      if (/specific|proof|evidence|data|number|detail/.test(l)) return DIM_ICONS.gauge;
      if (/cta|call to action|action|convert/.test(l)) return DIM_ICONS.cursor;
      if (/convers|reply|engage|hook/.test(l)) return DIM_ICONS.message;
      if (/link/.test(l)) return DIM_ICONS.link;
      if (/format|media|native|image|visual/.test(l)) return DIM_ICONS.image;
      if (/spam|trust|safe/.test(l)) return DIM_ICONS.shield;
      if (/headline|title|heading/.test(l)) return DIM_ICONS.heading;
      return DIM_ICONS.dot;
    }
    function dimIconSvg(label) {
      return (
        '<span class="tk-dim-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
        dimIcon(label) +
        "</svg></span>"
      );
    }

    function renderDim(dim) {
      var checksHtml = (dim.checks || [])
        .map(function (check) {
          var evi = "";
          if (check.evidence && check.evidence.length) {
            var n = check.evidence.length;
            var items = check.evidence
              .map(function (e) { return '<li class="tk-evi-item">' + esc(e) + "</li>"; })
              .join("");
            evi =
              '<details class="tk-evi"><summary class="tk-evi-summary">' +
              (check.level === "pass" ? "Show examples" : "Show " + n + " example" + (n > 1 ? "s" : "")) +
              " from the page</summary><ul class=\"tk-evi-list\">" +
              items +
              "</ul></details>";
          }
          return (
            '<div class="tk-check is-' +
            check.level +
            '"><span class="tk-check-mark" aria-hidden="true">' +
            MARK[check.level] +
            '</span><p class="tk-check-title">' +
            esc(check.title) +
            '<code class="tk-check-tag">' +
            esc(check.tag || "") +
            '</code></p><p class="tk-check-detail">' +
            esc(check.detail) +
            "</p>" +
            evi +
            "</div>"
          );
        })
        .join("");

      var pass = (dim.checks || []).filter(function (c) { return c.level === "pass"; }).length;
      var total = (dim.checks || []).length;

      return (
        '<div class="tk-dim">' +
        '<div class="tk-dim-head"><span class="tk-dim-head-l">' +
        dimIconSvg(dim.label) +
        "<h3>" +
        esc(dim.label) +
        '</h3></span><span class="tk-dim-score is-' +
        bandClass(dim.score) +
        '">' +
        dim.score +
        "/100 · " +
        esc(bandLabel(dim.score)) +
        "</span></div>" +
        '<div class="tk-dim-meter"><i class="is-' +
        bandClass(dim.score) +
        '" style="width:' +
        Math.max(0, Math.min(100, dim.score)) +
        '%"></i></div>' +
        '<div class="tk-dim-tally"><span class="tk-dim-tally-pass">' +
        pass +
        " of " +
        total +
        " passing</span></div>" +
        '<div class="tk-checks">' +
        checksHtml +
        "</div></div>"
      );
    }

    function render() {
      if (summaryScore) {
        var overallVal = Math.max(0, Math.min(100, data.overall));
        summaryScore.innerHTML =
          '<span class="tk-gauge is-' +
          bandClass(data.overall) +
          '" style="--tk-val:' +
          (overallVal * 3.6).toFixed(1) +
          'deg" role="img" aria-label="' +
          data.overall +
          ' out of 100"><span class="tk-gauge-inner"><b>' +
          data.overall +
          "</b><i>/100</i></span></span>" +
          '<span class="tk-gauge-label"><strong>' +
          esc(bandLabel(data.overall)) +
          "</strong>overall readiness</span>";
      }

      if (scores) {
        var counts = { error: 0, warn: 0, pass: 0 };
        (data.dimensions || []).forEach(function (d) {
          (d.checks || []).forEach(function (c) {
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
              '<button type="button" class="tk-score is-' +
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

      if (dimsEl) {
        dimsEl.setAttribute("data-filter", filter);
        dimsEl.innerHTML = (data.dimensions || []).map(renderDim).join("");
      }
      if (config.onData) config.onData(data);
      result.hidden = false;
    }

    function run(value) {
      if (config.isEmpty ? config.isEmpty(value) : !value) return;
      if (errorBox) errorBox.hidden = true;
      if (result) result.hidden = true;
      setBusy(true);

      var method = config.method || "POST";
      var url = config.endpoint;
      var init = { method: method, headers: { Accept: "application/json" } };
      if (method === "GET") {
        var qs = config.buildQuery ? config.buildQuery(value) : "";
        url += qs ? "?" + qs : "";
      } else {
        init.headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(config.buildBody ? config.buildBody(value) : value);
      }

      fetch(url, init)
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
          if (result) result.scrollIntoView({ behavior: "smooth", block: "start" });
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
      run(config.getValue());
    });

    if (scores) {
      scores.addEventListener("click", function (event) {
        var button = event.target.closest("button[data-level]");
        if (!button) return;
        var level = button.getAttribute("data-level");
        filter = filter === level ? "" : level;
        render();
      });
    }

    if (copyBtn) {
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
    }

    if (config.examples) {
      document.addEventListener("click", function (event) {
        var button = event.target.closest("[data-try]");
        if (!button) return;
        var example = config.examples[button.getAttribute("data-try")];
        if (example === undefined) return;
        if (config.setValue) config.setValue(example);
        run(example);
      });
    }

    return { run: run, setBusy: setBusy, showError: showError, getData: function () { return data; } };
  }

  // Renders the { groups:[{title, items:[{level,title,detail}]}] } shape used
  // by crawler/list-style tools (404 checker, orphan finder, internal
  // linking, content decay, competitor gap) — a report of flagged rows rather
  // than a pass/fail score.
  function renderGroups(container, groups) {
    container.innerHTML = (groups || [])
      .map(function (group) {
        var rows = (group.items || [])
          .map(function (item) {
            return (
              '<div class="tk-row is-' +
              item.level +
              '"><span class="tk-row-mark" aria-hidden="true">' +
              MARK[item.level] +
              '</span><div><p class="tk-row-title">' +
              esc(item.title) +
              "</p>" +
              (item.detail ? '<p class="tk-row-detail">' + esc(item.detail) + "</p>" : "") +
              "</div></div>"
            );
          })
          .join("");
        return (
          '<div class="tk-group"><div class="tk-group-head"><h3>' +
          esc(group.title) +
          '</h3><span class="tk-group-count">' +
          (group.items ? group.items.length : 0) +
          "</span></div>" +
          (rows || '<p class="tk-empty">Nothing to report here.</p>') +
          "</div>"
        );
      })
      .join("");
  }

  // Renders a list of strings, or {label,count} objects, as a tag cloud
  // (keyword extractor, hashtag generator).
  function renderCloud(container, tags) {
    container.innerHTML = (tags || [])
      .map(function (tag) {
        var label = typeof tag === "string" ? tag : tag.label;
        var count = typeof tag === "object" && tag && tag.count != null ? "<b>" + esc(tag.count) + "</b>" : "";
        return '<span class="tk-tag">' + esc(label) + count + "</span>";
      })
      .join("");
  }

  function renderTable(container, columns, rows) {
    var head = "<tr>" + columns.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr>";
    var body = rows
      .map(function (row) {
        return "<tr>" + row.map(function (cell) { return "<td>" + esc(cell) + "</td>"; }).join("") + "</tr>";
      })
      .join("");
    container.innerHTML = '<div class="tk-table-wrap"><table class="tk-table"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>";
  }

  // Generic fetch → render wiring for tools whose result ISN'T the scorer
  // shape wireScorer() handles — a generated block of text, a tag cloud, a
  // list of report groups, a table. `onData(data, els)` paints the result;
  // `els` exposes the raw resultId element plus any ids listed in
  // config.extraIds so onData can grab them without another lookup.
  function wireSimple(config) {
    var form = document.getElementById(config.formId);
    if (!form) return null;

    var submit = document.getElementById(config.submitId);
    var errorBox = document.getElementById(config.errorId);
    var loading = config.loadingId ? document.getElementById(config.loadingId) : null;
    var result = document.getElementById(config.resultId);
    var els = { result: result };
    (config.extraIds || []).forEach(function (id) {
      els[id] = document.getElementById(id);
    });

    var data = null;

    function setBusy(busy) {
      if (submit) {
        submit.disabled = busy;
        submit.textContent = busy ? config.busyLabel || "Working…" : config.submitLabel || "Run";
      }
      if (loading) loading.hidden = !busy;
    }

    function showError(message) {
      if (!errorBox) return;
      errorBox.textContent = message;
      errorBox.hidden = false;
    }

    function run(value) {
      if (config.isEmpty ? config.isEmpty(value) : !value) return;
      if (errorBox) errorBox.hidden = true;
      if (result) result.hidden = true;
      setBusy(true);

      var method = config.method || "POST";
      var url = config.endpoint;
      var init = { method: method, headers: { Accept: "application/json" } };
      if (method === "GET") {
        var qs = config.buildQuery ? config.buildQuery(value) : "";
        url += qs ? "?" + qs : "";
      } else {
        init.headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(config.buildBody ? config.buildBody(value) : value);
      }

      fetch(url, init)
        .then(function (response) {
          return response.json().then(function (body) {
            return { ok: response.ok, body: body };
          });
        })
        .then(function (res) {
          if (!res.ok || res.body.error) throw new Error(res.body.error || "That request did not work. Try again.");
          data = res.body;
          config.onData(data, els);
          if (result) {
            result.hidden = false;
            result.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        })
        .catch(function (error) {
          showError(error.message || "That request did not work. Try again.");
        })
        .finally(function () {
          setBusy(false);
        });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      run(config.getValue());
    });

    if (config.examples) {
      document.addEventListener("click", function (event) {
        var button = event.target.closest("[data-try]");
        if (!button) return;
        var example = config.examples[button.getAttribute("data-try")];
        if (example === undefined) return;
        if (config.setValue) config.setValue(example);
        run(example);
      });
    }

    return { run: run, setBusy: setBusy, showError: showError, getData: function () { return data; } };
  }

  function copyButton(buttonId, getText) {
    var btn = document.getElementById(buttonId);
    if (!btn) return;
    var label = btn.textContent;
    btn.addEventListener("click", function () {
      var text = getText();
      if (!text) return;
      navigator.clipboard.writeText(text).then(
        function () {
          btn.textContent = "Copied";
          setTimeout(function () {
            btn.textContent = label;
          }, 1600);
        },
        function () {
          btn.textContent = "Press ⌘C";
        },
      );
    });
  }

  global.SokosumiToolKit = {
    esc: esc,
    bandLabel: bandLabel,
    wireScorer: wireScorer,
    wireSimple: wireSimple,
    renderGroups: renderGroups,
    renderCloud: renderCloud,
    renderTable: renderTable,
    copyButton: copyButton,
  };
})(window);
