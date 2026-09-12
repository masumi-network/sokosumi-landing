// Client for /tools/ai-visibility. Posts the form to /api/ai-visibility and
// renders the report. All DOM is built with createElement/textContent — the
// brand names in the response come from a model, so nothing is ever
// interpolated into HTML.
(function () {
  "use strict";

  var form = document.getElementById("aivForm");
  if (!form) return;

  var brandInput = document.getElementById("aivBrand");
  var categoryInput = document.getElementById("aivCategory");
  var websiteInput = document.getElementById("aivWebsite");
  var submit = document.getElementById("aivSubmit");
  var submitLabel = submit.querySelector(".dm-submit-label");
  var submitLoading = submit.querySelector(".dm-submit-loading");
  var error = document.getElementById("aivError");
  var output = document.getElementById("aivOutput");

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function setBusy(busy) {
    submit.disabled = busy;
    submitLabel.hidden = busy;
    submitLoading.hidden = !busy;
  }

  function showError(message) {
    error.textContent = message;
    error.hidden = false;
  }

  function verdictLine(data) {
    if (data.mentionedCount === 0) {
      return "The model did not mention " + data.brand + " in any of its " + data.asked + " answers.";
    }
    if (data.mentionedCount === data.asked) {
      return data.brand + " appeared in every answer — best position #" + data.bestRank + ".";
    }
    return data.brand + " appeared in " + data.mentionedCount + " of " + data.asked + " answers — best position #" + data.bestRank + ".";
  }

  function render(data) {
    output.textContent = "";

    var head = el("div", "aiv-verdict" + (data.mentionedCount === 0 ? " is-miss" : data.mentionedCount >= Math.ceil(data.asked * 0.6) ? " is-strong" : " is-partial"));
    head.appendChild(el("strong", "aiv-verdict-score", data.mentionedCount + "/" + data.asked));
    var headCopy = el("div", "aiv-verdict-copy");
    headCopy.appendChild(el("p", "aiv-verdict-line", verdictLine(data)));
    headCopy.appendChild(el("p", "aiv-method", "One model (" + data.model + "), five buyer questions about “" + data.category + "”, asked just now. A sample, not a census."));
    head.appendChild(headCopy);
    output.appendChild(head);

    var list = el("ol", "aiv-prompts");
    data.prompts.forEach(function (p) {
      var item = el("li", "aiv-prompt" + (p.failed ? " is-failed" : p.mentioned ? " is-hit" : " is-miss"));
      item.appendChild(el("p", "aiv-question", "“" + p.question + "”"));
      if (p.failed) {
        item.appendChild(el("p", "aiv-answer-note", "The model did not give a usable answer to this one."));
      } else {
        item.appendChild(el("span", "aiv-chip", p.mentioned ? "Mentioned · #" + p.rank : "Not mentioned"));
        var brands = el("p", "aiv-brands");
        p.brands.forEach(function (name, i) {
          var b = el("span", p.mentioned && i === p.rank - 1 ? "aiv-brand is-you" : "aiv-brand", name);
          brands.appendChild(b);
        });
        item.appendChild(brands);
      }
      list.appendChild(item);
    });
    output.appendChild(list);

    if (data.competitors.length) {
      var comp = el("div", "aiv-competitors");
      comp.appendChild(el("h2", null, "Who the model names instead"));
      var table = el("ol", "aiv-comp-list");
      data.competitors.forEach(function (c) {
        var row = el("li", "aiv-comp-row");
        row.appendChild(el("span", "aiv-comp-name", c.name));
        var bar = el("span", "aiv-comp-bar");
        var fill = el("span", "aiv-comp-fill");
        fill.style.width = Math.round((c.count / c.of) * 100) + "%";
        bar.appendChild(fill);
        row.appendChild(bar);
        row.appendChild(el("span", "aiv-comp-count", c.count + "/" + c.of + " answers"));
        table.appendChild(row);
      });
      comp.appendChild(table);
      output.appendChild(comp);
    }

    var again = el("button", "dm-another", "Check another brand");
    again.type = "button";
    again.addEventListener("click", function () {
      output.hidden = true;
      brandInput.focus();
    });
    output.appendChild(again);

    output.hidden = false;
    output.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    error.hidden = true;

    var brand = brandInput.value.trim();
    var category = categoryInput.value.trim();
    if (!brand) return showError("Add your brand or product name.");
    if (category.length < 3) return showError("Describe your category the way a buyer would say it, like “email marketing tools”.");

    setBusy(true);
    output.hidden = true;

    fetch("/api/ai-visibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand: brand, category: category, website: websiteInput.value.trim() }),
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (out) {
        if (!out.ok) throw new Error(out.data.error || "The check did not work. Try again in a moment.");
        render(out.data);
        try {
          if (window.dataLayer) window.dataLayer.push({ event: "tool_run", tool: "ai-visibility", mentioned: out.data.mentionedCount });
        } catch (err) { /* analytics must never break the tool */ }
      })
      .catch(function (err) {
        showError(err.message || "The check did not work. Try again in a moment.");
      })
      .then(function () {
        setBusy(false);
      });
  });
})();
