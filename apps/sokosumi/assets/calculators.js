// The math for /tools/*-calculator. Each form carries data-calc="<id>"; the
// registry below holds the field keys and the solver. Two shapes:
//   solve  — three fields, exactly one left empty, we compute that one.
//   derive — required inputs in, one or more result rows out.
// The email gate (email-gate.js) intercepts the first submit on document
// capture, then replays it, so nothing here knows the gate exists.
(function () {
  "use strict";

  function money(v) {
    return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function count(v) {
    return Math.round(v).toLocaleString("en-US");
  }
  function pct(v) {
    return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + "%";
  }
  function ratio(v) {
    return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + "×";
  }

  // "1,250", "$3 000", "2.5%" all read as numbers. Zero is a number too —
  // zero clicks is data, not a typo. Division by zero is caught after the
  // math, where the message can say which numbers do not work together.
  function num(raw) {
    var cleaned = String(raw || "").replace(/[$€£%,\s]/g, "").replace(/,/g, "");
    if (!cleaned) return null;
    var v = Number(cleaned);
    return isFinite(v) && v >= 0 ? v : NaN;
  }

  // ── solve-any-direction calculators ────────────────────────────────────
  // keys in display order; solve(a, b) per missing key.
  var SOLVE = {
    cpm: {
      keys: ["cost", "impressions", "cpm"],
      out: {
        cpm: function (v) { return { value: money(v.cost / v.impressions * 1000), label: "CPM", text: "You pay " + money(v.cost / v.impressions * 1000) + " for every 1,000 impressions." }; },
        cost: function (v) { return { value: money(v.cpm * v.impressions / 1000), label: "Ad spend", text: count(v.impressions) + " impressions at " + money(v.cpm) + " CPM cost " + money(v.cpm * v.impressions / 1000) + "." }; },
        impressions: function (v) { return { value: count(v.cost / v.cpm * 1000), label: "Impressions", text: money(v.cost) + " at " + money(v.cpm) + " CPM buys " + count(v.cost / v.cpm * 1000) + " impressions." }; },
      },
    },
    ctr: {
      keys: ["clicks", "impressions", "ctr"],
      out: {
        ctr: function (v) { return { value: pct(v.clicks / v.impressions * 100), label: "CTR", text: count(v.clicks) + " clicks from " + count(v.impressions) + " impressions is a " + pct(v.clicks / v.impressions * 100) + " click-through rate." }; },
        clicks: function (v) { return { value: count(v.impressions * v.ctr / 100), label: "Clicks", text: "A " + pct(v.ctr) + " CTR on " + count(v.impressions) + " impressions is " + count(v.impressions * v.ctr / 100) + " clicks." }; },
        impressions: function (v) { return { value: count(v.clicks / (v.ctr / 100)), label: "Impressions", text: "You need " + count(v.clicks / (v.ctr / 100)) + " impressions for " + count(v.clicks) + " clicks at " + pct(v.ctr) + " CTR." }; },
      },
    },
    cpc: {
      keys: ["cost", "clicks", "cpc"],
      out: {
        cpc: function (v) { return { value: money(v.cost / v.clicks), label: "CPC", text: "Each click cost " + money(v.cost / v.clicks) + "." }; },
        cost: function (v) { return { value: money(v.cpc * v.clicks), label: "Ad spend", text: count(v.clicks) + " clicks at " + money(v.cpc) + " each cost " + money(v.cpc * v.clicks) + "." }; },
        clicks: function (v) { return { value: count(v.cost / v.cpc), label: "Clicks", text: money(v.cost) + " buys " + count(v.cost / v.cpc) + " clicks at " + money(v.cpc) + " CPC." }; },
      },
    },
    cpa: {
      keys: ["cost", "conversions", "cpa"],
      out: {
        cpa: function (v) { return { value: money(v.cost / v.conversions), label: "CPA", text: "Each conversion cost " + money(v.cost / v.conversions) + "." }; },
        cost: function (v) { return { value: money(v.cpa * v.conversions), label: "Ad spend", text: count(v.conversions) + " conversions at " + money(v.cpa) + " each cost " + money(v.cpa * v.conversions) + "." }; },
        conversions: function (v) { return { value: count(v.cost / v.cpa), label: "Conversions", text: money(v.cost) + " buys " + count(v.cost / v.cpa) + " conversions at " + money(v.cpa) + " CPA." }; },
      },
    },
    roas: {
      keys: ["revenue", "spend", "roas"],
      percentToRatio: "roas",
      out: {
        roas: function (v) {
          var r = v.revenue / v.spend;
          return { value: ratio(r), label: "ROAS", text: "Every $1 of ads returned " + money(r) + " of revenue (" + pct(r * 100) + ")." };
        },
        revenue: function (v) { return { value: money(v.roas * v.spend), label: "Revenue", text: "A " + ratio(v.roas) + " ROAS on " + money(v.spend) + " of spend is " + money(v.roas * v.spend) + " in revenue." }; },
        spend: function (v) { return { value: money(v.revenue / v.roas), label: "Ad spend", text: money(v.revenue) + " of revenue at " + ratio(v.roas) + " ROAS means " + money(v.revenue / v.roas) + " of spend." }; },
      },
    },
  };

  // ── derive calculators: inputs in, result rows out ─────────────────────
  var DERIVE = {
    breakeven: {
      required: ["margin"],
      run: function (v) {
        if (v.margin > 100) return { error: "A gross margin above 100% is not a margin." };
        var be = 100 / v.margin;
        return {
          rows: [{ value: ratio(be), label: "Break-even ROAS", text: "At a " + pct(v.margin) + " gross margin, a campaign below " + ratio(be) + " ROAS loses money." }],
        };
      },
    },
    ltv: {
      required: ["aov", "frequency", "years"],
      optional: ["margin"],
      run: function (v) {
        var ltv = v.aov * v.frequency * v.years;
        var rows = [{ value: money(ltv), label: "Customer lifetime value", text: money(v.aov) + " per order × " + v.frequency + " orders a year × " + v.years + " years." }];
        if (v.margin !== null) {
          if (v.margin > 100) return { error: "A gross margin above 100% is not a margin." };
          rows.push({ value: money(ltv * v.margin / 100), label: "Lifetime profit (at " + pct(v.margin) + " margin)", text: "The number to hold your acquisition cost against." });
        }
        return { rows: rows };
      },
    },
    cac: {
      required: ["spend", "customers"],
      optional: ["ltv"],
      run: function (v) {
        var cac = v.spend / v.customers;
        var rows = [{ value: money(cac), label: "CAC", text: "Each new customer cost " + money(cac) + " to win." }];
        if (v.ltv !== null) {
          var r = v.ltv / cac;
          rows.push({ value: ratio(r).replace("×", ":1"), label: "LTV : CAC", text: r >= 3 ? "At or above the common 3:1 benchmark." : "Below the common 3:1 benchmark." });
        }
        return { rows: rows };
      },
    },
    engagement: {
      required: ["engagements", "audience"],
      optional: ["posts"],
      selects: ["basis"],
      run: function (v) {
        var basis = v.basis || "followers";
        // The post average only makes sense against followers: reach and
        // views are already per-post (or already aggregated the same way as
        // the engagements), so dividing by posts again would halve the truth.
        var usePosts = basis === "followers" && v.posts !== null;
        var perPost = usePosts ? v.engagements / v.posts : v.engagements;
        var er = perPost / v.audience * 100;
        var scope = usePosts ? "average per post across " + count(v.posts) + " posts" : "";
        return {
          rows: [{ value: pct(er), label: "Engagement rate (by " + basis + ")", text: count(perPost) + " engagements ÷ " + count(v.audience) + " " + basis + (scope ? ", " + scope : "") + "." }],
        };
      },
    },
  };

  function showError(form, message) {
    var error = form.querySelector(".calc-error");
    error.textContent = message;
    error.hidden = false;
    form.querySelector(".calc-result").hidden = true;
  }

  function showRows(form, rows) {
    var result = form.querySelector(".calc-result");
    result.textContent = "";
    rows.forEach(function (row) {
      var block = document.createElement("div");
      block.className = "calc-result-row";
      var value = document.createElement("strong");
      value.textContent = row.value;
      var label = document.createElement("span");
      label.className = "calc-result-label";
      label.textContent = row.label;
      var text = document.createElement("p");
      text.textContent = row.text;
      block.appendChild(label);
      block.appendChild(value);
      block.appendChild(text);
      result.appendChild(block);
    });
    form.querySelector(".calc-error").hidden = true;
    result.hidden = false;
  }

  function readInputs(form) {
    var values = {};
    var raws = {};
    form.querySelectorAll("input[data-key]").forEach(function (input) {
      values[input.dataset.key] = num(input.value);
      raws[input.dataset.key] = String(input.value || "");
    });
    form.querySelectorAll("select[data-key]").forEach(function (select) {
      values[select.dataset.key] = select.value;
    });
    return { values: values, raws: raws };
  }

  // "400%" in the ROAS field means 4×, not 400×.
  function percentToRatio(values, raws, key) {
    if (values[key] !== null && !isNaN(values[key]) && raws[key].indexOf("%") !== -1) {
      values[key] = values[key] / 100;
    }
  }

  function badResult(rows) {
    return rows.some(function (row) { return /∞|NaN/.test(row.value); });
  }

  function finish(form, rows) {
    if (badResult(rows)) return showError(form, "These numbers divide by zero. Check the inputs.");
    showRows(form, rows);
  }

  function runSolve(form, calc) {
    var read = readInputs(form);
    var values = read.values;
    if (calc.percentToRatio) percentToRatio(values, read.raws, calc.percentToRatio);
    var bad = calc.keys.filter(function (k) { return values[k] !== null && isNaN(values[k]); });
    if (bad.length) return showError(form, "One of the numbers could not be read. Digits only, like 1250 or 4.50.");
    var empty = calc.keys.filter(function (k) { return values[k] === null; });
    if (empty.length === 0) return showError(form, "All three fields are filled. Clear the one you want calculated.");
    if (empty.length > 1) return showError(form, "Fill any two fields, and the third is calculated.");
    finish(form, [calc.out[empty[0]](values)]);
  }

  function runDerive(form, calc) {
    var read = readInputs(form);
    var values = read.values;
    var missing = calc.required.filter(function (k) { return values[k] === null; });
    if (missing.length) return showError(form, "Fill every required field first.");
    var all = calc.required.concat(calc.optional || []);
    var bad = all.filter(function (k) { return values[k] !== null && isNaN(values[k]); });
    if (bad.length) return showError(form, "One of the numbers could not be read. Digits only, like 1250 or 4.50.");
    var out = calc.run(values);
    if (out.error) return showError(form, out.error);
    finish(form, out.rows);
  }

  document.querySelectorAll("form[data-calc]").forEach(function (form) {
    var id = form.dataset.calc;
    var solve = SOLVE[id];
    var derive = DERIVE[id];
    if (!solve && !derive) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (solve) runSolve(form, solve);
      else runDerive(form, derive);
      try {
        if (window.dataLayer) window.dataLayer.push({ event: "tool_run", tool: "calculator", calc: id });
      } catch (err) { /* analytics must never break the math */ }
    });

    var clear = form.querySelector(".calc-clear");
    if (clear) {
      clear.addEventListener("click", function () {
        form.querySelectorAll("input[data-key]").forEach(function (input) { input.value = ""; });
        form.querySelector(".calc-error").hidden = true;
        form.querySelector(".calc-result").hidden = true;
      });
    }
  });
})();
