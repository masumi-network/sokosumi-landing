// Client for /tools/meta-description-generator. Posts to /api/meta-tags,
// renders the options with character and pixel measurements, and previews
// the selected pair as a search result. Pixel limits are Google's observed
// truncation widths: ~580px for titles (rendered ~20px Arial) and ~990px
// for descriptions (~14px Arial). Canvas measureText gives a close match.
(function () {
  "use strict";

  var form = document.getElementById("mtgForm");
  if (!form) return;

  var urlInput = document.getElementById("mtgUrl");
  var topicInput = document.getElementById("mtgTopic");
  var keywordInput = document.getElementById("mtgKeyword");
  var brandInput = document.getElementById("mtgBrand");
  var submit = document.getElementById("mtgSubmit");
  var submitLabel = submit.querySelector(".dm-submit-label");
  var submitLoading = submit.querySelector(".dm-submit-loading");
  var error = document.getElementById("mtgError");
  var output = document.getElementById("mtgOutput");
  var serpUrl = document.getElementById("mtgSerpUrl");
  var serpTitle = document.getElementById("mtgSerpTitle");
  var serpDesc = document.getElementById("mtgSerpDesc");
  var titlesList = document.getElementById("mtgTitles");
  var descsList = document.getElementById("mtgDescs");
  var htmlOut = document.getElementById("mtgHtml");
  var copyHtml = document.getElementById("mtgCopyHtml");
  var modelNote = document.getElementById("mtgModelNote");

  var TITLE_PX = 580;
  var DESC_PX = 990;
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");

  var selected = { title: "", description: "" };

  function width(text, font) {
    ctx.font = font;
    return Math.round(ctx.measureText(text).width);
  }

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

  function updateSerp() {
    serpTitle.textContent = selected.title || "Pick a title below";
    serpDesc.textContent = selected.description || "Pick a description below.";
    var html =
      "<title>" + escapeHtml(selected.title) + "</title>\n" +
      '<meta name="description" content="' + escapeHtml(selected.description) + '" />';
    htmlOut.textContent = html;
  }

  function escapeHtml(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function option(kind, text, list) {
    var isTitle = kind === "title";
    var px = width(text, isTitle ? "20px arial" : "14px arial");
    var limit = isTitle ? TITLE_PX : DESC_PX;
    var over = px > limit;

    var item = el("li", "mtg-option" + (over ? " is-over" : ""));
    var button = el("button", "mtg-option-pick");
    button.type = "button";
    button.appendChild(el("span", "mtg-option-text", text));
    var meta = el("span", "mtg-option-meta");
    meta.appendChild(el("span", null, text.length + " chars"));
    meta.appendChild(el("span", over ? "is-over" : "is-ok", px + "px / " + limit + "px" + (over ? " — will be cut" : "")));
    button.appendChild(meta);
    button.addEventListener("click", function () {
      selected[isTitle ? "title" : "description"] = text;
      list.querySelectorAll(".mtg-option").forEach(function (node) { node.classList.remove("is-selected"); });
      item.classList.add("is-selected");
      updateSerp();
    });

    var copyBtn = el("button", "mtg-option-copy", "Copy");
    copyBtn.type = "button";
    copyBtn.addEventListener("click", function () {
      navigator.clipboard && navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied";
      setTimeout(function () { copyBtn.textContent = "Copy"; }, 1400);
    });

    item.appendChild(button);
    item.appendChild(copyBtn);
    return item;
  }

  function render(data) {
    titlesList.textContent = "";
    descsList.textContent = "";
    data.titles.forEach(function (t) { titlesList.appendChild(option("title", t, titlesList)); });
    data.descriptions.forEach(function (d) { descsList.appendChild(option("description", d, descsList)); });

    selected.title = data.titles[0];
    selected.description = data.descriptions[0];
    titlesList.firstChild.classList.add("is-selected");
    descsList.firstChild.classList.add("is-selected");

    var host = "your-site.com";
    if (data.current && data.current.url) {
      try { host = new URL(data.current.url).hostname; } catch (err) { /* keep the placeholder */ }
    }
    serpUrl.textContent = host;
    modelNote.textContent = "Written by " + data.model + " from " + (data.current ? "the live page content" : "your description") + ". Read every option before you ship one — you know the page, the model only read it.";
    updateSerp();

    output.hidden = false;
    output.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  copyHtml.addEventListener("click", function () {
    navigator.clipboard && navigator.clipboard.writeText(htmlOut.textContent);
    copyHtml.textContent = "Copied";
    setTimeout(function () { copyHtml.textContent = "Copy HTML"; }, 1400);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    error.hidden = true;

    var url = urlInput.value.trim();
    var topic = topicInput.value.trim();
    if (!url && !topic) return showError("Add a page URL, or describe the page.");
    if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;

    setBusy(true);
    output.hidden = true;

    fetch("/api/meta-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url || undefined, topic: topic, keyword: keywordInput.value.trim(), brand: brandInput.value.trim() }),
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (out) {
        if (!out.ok) throw new Error(out.data.error || "The generator did not work. Try again in a moment.");
        render(out.data);
        try {
          if (window.dataLayer) window.dataLayer.push({ event: "tool_run", tool: "meta-tags" });
        } catch (err) { /* analytics must never break the tool */ }
      })
      .catch(function (err) {
        showError(err.message || "The generator did not work. Try again in a moment.");
      })
      .then(function () {
        setBusy(false);
      });
  });
})();
