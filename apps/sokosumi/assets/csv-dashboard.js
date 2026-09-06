/* /tools/csv-dashboard — client-only. Nothing leaves the browser: the file
 * is read, parsed and charted entirely here with the File API.
 */
(function () {
  "use strict";
  var tk = window.SokosumiToolKit;
  var form = document.getElementById("cdForm");
  if (!form) return;

  var fileInput = document.getElementById("cdFile");
  var errorBox = document.getElementById("cdError");
  var result = document.getElementById("cdResult");
  var statsEl = document.getElementById("cdStats");
  var barWrap = document.getElementById("cdBarWrap");
  var barTitle = document.getElementById("cdBarTitle");
  var barEl = document.getElementById("cdBar");
  var lineWrap = document.getElementById("cdLineWrap");
  var lineTitle = document.getElementById("cdLineTitle");
  var lineEl = document.getElementById("cdLine");
  var tableEl = document.getElementById("cdTable");

  function esc(s) {
    return tk ? tk.esc(s) : String(s);
  }

  // ---- CSV parsing: handles quoted fields containing commas/newlines. ----
  function parseCsv(text) {
    var rows = [];
    var row = [];
    var field = "";
    var inQuotes = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += c;
        }
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += c;
      }
    }
    if (field.length || row.length) {
      row.push(field);
      rows.push(row);
    }
    return rows.filter(function (r) { return r.length > 1 || (r.length === 1 && r[0] !== ""); });
  }

  function isNumeric(v) {
    return v !== "" && v != null && !isNaN(Number(v));
  }
  function isDateLike(v) {
    if (!v || isNumeric(v)) return false;
    var t = Date.parse(v);
    return !isNaN(t);
  }

  function detectColumns(headers, rows) {
    return headers.map(function (name, i) {
      var values = rows.map(function (r) { return r[i]; }).filter(function (v) { return v != null && v !== ""; });
      var sample = values.slice(0, 200);
      var numericRatio = sample.length ? sample.filter(isNumeric).length / sample.length : 0;
      var dateRatio = sample.length ? sample.filter(isDateLike).length / sample.length : 0;
      var type = numericRatio > 0.8 ? "numeric" : dateRatio > 0.8 ? "date" : "text";
      return { name: name, index: i, type: type };
    });
  }

  function fmtNumber(n) {
    return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  function renderStats(columns, rows) {
    var numericCols = columns.filter(function (c) { return c.type === "numeric"; }).slice(0, 6);
    statsEl.innerHTML = numericCols
      .map(function (col) {
        var values = rows.map(function (r) { return Number(r[col.index]); }).filter(function (v) { return !isNaN(v); });
        var sum = values.reduce(function (a, b) { return a + b; }, 0);
        var avg = values.length ? sum / values.length : 0;
        return (
          '<div class="tk-card cd-stat"><div class="cd-stat-label">' +
          esc(col.name) +
          '</div><div class="cd-stat-value">' +
          fmtNumber(sum) +
          '</div><div class="cd-stat-sub">avg ' +
          fmtNumber(avg) +
          " · " + values.length + " rows</div></div>"
        );
      })
      .join("");
  }

  function renderBar(columns, rows) {
    var textCol = columns.find(function (c) { return c.type === "text"; });
    var numCol = columns.find(function (c) { return c.type === "numeric"; });
    if (!textCol || !numCol) {
      barWrap.hidden = true;
      return;
    }
    var totals = {};
    rows.forEach(function (r) {
      var key = r[textCol.index] || "(blank)";
      var val = Number(r[numCol.index]);
      if (isNaN(val)) return;
      totals[key] = (totals[key] || 0) + val;
    });
    var entries = Object.keys(totals)
      .map(function (k) { return { label: k, value: totals[k] }; })
      .sort(function (a, b) { return b.value - a.value; })
      .slice(0, 10);
    if (!entries.length) {
      barWrap.hidden = true;
      return;
    }
    barTitle.textContent = numCol.name + " by " + textCol.name;
    var max = Math.max.apply(null, entries.map(function (e) { return e.value; })) || 1;
    barEl.innerHTML =
      '<div class="cd-bars">' +
      entries
        .map(function (e) {
          var pct = Math.max(2, Math.round((e.value / max) * 100));
          return (
            '<div class="cd-bar-row"><span class="cd-bar-label" title="' +
            esc(e.label) +
            '">' +
            esc(e.label) +
            '</span><span class="cd-bar-track"><span class="cd-bar-fill" style="width:' +
            pct +
            '%"></span></span><span class="cd-bar-value">' +
            fmtNumber(e.value) +
            "</span></div>"
          );
        })
        .join("") +
      "</div>";
    barWrap.hidden = false;
  }

  function renderLine(columns, rows) {
    var dateCol = columns.find(function (c) { return c.type === "date"; });
    var numCol = columns.find(function (c) { return c.type === "numeric"; });
    if (!dateCol || !numCol) {
      lineWrap.hidden = true;
      return;
    }
    var points = rows
      .map(function (r) { return { t: Date.parse(r[dateCol.index]), v: Number(r[numCol.index]) }; })
      .filter(function (p) { return !isNaN(p.t) && !isNaN(p.v); })
      .sort(function (a, b) { return a.t - b.t; });
    if (points.length < 2) {
      lineWrap.hidden = true;
      return;
    }
    lineTitle.textContent = numCol.name + " over time (" + dateCol.name + ")";

    var W = 720;
    var H = 220;
    var pad = 30;
    var minT = points[0].t;
    var maxT = points[points.length - 1].t;
    var minV = Math.min.apply(null, points.map(function (p) { return p.v; }));
    var maxV = Math.max.apply(null, points.map(function (p) { return p.v; }));
    if (minV === maxV) {
      minV -= 1;
      maxV += 1;
    }
    var x = function (t) { return pad + ((t - minT) / (maxT - minT || 1)) * (W - pad * 2); };
    var y = function (v) { return H - pad - ((v - minV) / (maxV - minV || 1)) * (H - pad * 2); };

    var path = points.map(function (p, i) { return (i === 0 ? "M" : "L") + x(p.t).toFixed(1) + "," + y(p.v).toFixed(1); }).join(" ");
    var gridY = [0, 0.5, 1].map(function (f) { return pad + f * (H - pad * 2); });

    lineEl.innerHTML =
      '<div class="cd-line-wrap"><svg class="cd-line-svg" viewBox="0 0 ' +
      W +
      " " +
      H +
      '" id="cdLineSvg">' +
      gridY.map(function (gy) { return '<line class="cd-line-grid" x1="' + pad + '" x2="' + (W - pad) + '" y1="' + gy.toFixed(1) + '" y2="' + gy.toFixed(1) + '"/>'; }).join("") +
      '<path class="cd-line-path" d="' + path + '"/>' +
      points.map(function (p) { return '<circle class="cd-line-dot" r="3" cx="' + x(p.t).toFixed(1) + '" cy="' + y(p.v).toFixed(1) + '"/>'; }).join("") +
      '<circle id="cdHoverDot" r="4.5" fill="var(--primary)" opacity="0"></circle>' +
      "</svg>" +
      '<div class="cd-line-tooltip" id="cdTooltip"></div>' +
      "</div>";

    var svg = document.getElementById("cdLineSvg");
    var hoverDot = document.getElementById("cdHoverDot");
    var tooltip = document.getElementById("cdTooltip");

    svg.addEventListener("mousemove", function (event) {
      var rect = svg.getBoundingClientRect();
      var svgX = ((event.clientX - rect.left) / rect.width) * W;
      var t = minT + ((svgX - pad) / (W - pad * 2)) * (maxT - minT);
      var nearest = points.reduce(function (best, p) {
        return Math.abs(p.t - t) < Math.abs(best.t - t) ? p : best;
      }, points[0]);
      var px = x(nearest.t);
      var py = y(nearest.v);
      hoverDot.setAttribute("cx", px.toFixed(1));
      hoverDot.setAttribute("cy", py.toFixed(1));
      hoverDot.setAttribute("opacity", "1");
      tooltip.textContent = new Date(nearest.t).toLocaleDateString() + ": " + fmtNumber(nearest.v);
      tooltip.style.left = (px / W) * 100 + "%";
      tooltip.style.top = (py / H) * 100 + "%";
      tooltip.classList.add("is-visible");
    });
    svg.addEventListener("mouseleave", function () {
      hoverDot.setAttribute("opacity", "0");
      tooltip.classList.remove("is-visible");
    });

    lineWrap.hidden = false;
  }

  function renderPreview(headers, rows) {
    tk.renderTable(tableEl, headers, rows.slice(0, 20));
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    errorBox.hidden = true;
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var rows = parseCsv(String(reader.result || ""));
      if (rows.length < 2) {
        errorBox.textContent = "Couldn't find a header row and at least one data row in that file.";
        errorBox.hidden = false;
        return;
      }
      var headers = rows[0];
      var data = rows.slice(1);
      var columns = detectColumns(headers, data);
      renderStats(columns, data);
      renderBar(columns, data);
      renderLine(columns, data);
      renderPreview(headers, data);
      result.hidden = false;
      result.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    reader.onerror = function () {
      errorBox.textContent = "Could not read that file.";
      errorBox.hidden = false;
    };
    reader.readAsText(file);
  });
})();
