(function () {
  "use strict";

  var form = document.getElementById("seoMdForm");
  if (!form) return;

  var urlInput = document.getElementById("seoMdUrl");
  var submit = document.getElementById("seoMdSubmit");
  var submitLabel = submit.querySelector(".dm-submit-label");
  var submitLoading = submit.querySelector(".dm-submit-loading");
  var error = document.getElementById("seoMdError");
  var progress = document.getElementById("seoMdProgress");
  var status = document.getElementById("seoMdStatus");
  var result = document.getElementById("seoMdResult");
  var source = document.getElementById("seoMdSource");
  var preview = document.getElementById("seoMdPreview");
  var editor = document.getElementById("seoMdEditor");
  var previewTab = document.getElementById("seoMdPreviewTab");
  var fileTab = document.getElementById("seoMdFileTab");
  var filePanel = document.getElementById("seoMdFile");
  var copy = document.getElementById("seoMdCopy");
  var download = document.getElementById("seoMdDownload");
  var another = document.getElementById("seoMdAnother");
  var submittedUrl = "";
  var phaseTimer = null;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function normalizeUrl(value) {
    var input = String(value || "").trim();
    if (!input) throw new Error("Enter the website you want to analyze.");
    if (!/^https?:\/\//i.test(input)) input = "https://" + input;
    var parsed;
    try {
      parsed = new URL(input);
    } catch (_error) {
      throw new Error("Enter a complete public website URL, such as https://example.com.");
    }
    if (!/^https?:$/.test(parsed.protocol) || !parsed.hostname) {
      throw new Error("Enter a public website URL that starts with http:// or https://.");
    }
    return parsed.href;
  }

  async function jsonFetch(url, options) {
    var response = await fetch(url, options);
    var data;
    try {
      data = await response.json();
    } catch (_error) {
      data = {};
    }
    if (!response.ok) {
      throw new Error(data.error || "The analysis service could not complete this request.");
    }
    return data;
  }

  function showError(message) {
    error.textContent = message;
    error.hidden = false;
    urlInput.setAttribute("aria-invalid", "true");
  }

  function clearError() {
    error.textContent = "";
    error.hidden = true;
    urlInput.removeAttribute("aria-invalid");
  }

  function setBusy(busy) {
    submit.disabled = busy;
    urlInput.disabled = busy;
    submitLabel.hidden = busy;
    submitLoading.hidden = !busy;
  }

  function setPhase(phase, message) {
    progress.hidden = false;
    progress.dataset.phase = phase;
    status.textContent = message;
  }

  function stopPhases() {
    if (phaseTimer) {
      phaseTimer.forEach(window.clearTimeout);
      phaseTimer = null;
    }
  }

  // The request is a single round-trip, so we advance the visible phases on a
  // timer to mirror what the server is doing (fetch → parse → score).
  function runPhases() {
    stopPhases();
    setPhase("queued", "Fetching the page…");
    phaseTimer = [
      window.setTimeout(function () {
        setPhase("running", "Reading titles, meta, Open Graph and structured data…");
      }, 1200),
      window.setTimeout(function () {
        setPhase("finishing", "Scoring against the checklist and writing SEO.md…");
      }, 3200),
    ];
  }

  function safeExternalUrl(value) {
    try {
      var parsed = new URL(String(value || ""));
      return /^https?:$/.test(parsed.protocol) ? parsed.href : "";
    } catch (_error) {
      return "";
    }
  }

  function addPreviewBlock(title) {
    var block = el("section", "dm-preview-block");
    if (title) block.appendChild(el("h3", "", title));
    preview.appendChild(block);
    return block;
  }

  function renderScore(data) {
    var block = el("section", "dm-preview-block seo-score-block");
    var scoreClass = data.score >= 80 ? "good" : data.score >= 55 ? "ok" : "bad";
    var ring = el("div", "seo-score seo-score-" + scoreClass);
    ring.appendChild(el("strong", "", data.score));
    ring.appendChild(el("small", "", "/ 100"));
    block.appendChild(ring);
    var meta = el("div", "seo-score-meta");
    meta.appendChild(el("h3", "", data.hostname || "SEO report"));
    var tally = el("p", "seo-tally");
    tally.appendChild(el("span", "seo-pill seo-pill-pass", data.pass + " passed"));
    tally.appendChild(el("span", "seo-pill seo-pill-warn", data.warn + " warnings"));
    tally.appendChild(el("span", "seo-pill seo-pill-fail", data.fail + " failing"));
    meta.appendChild(tally);
    block.appendChild(meta);
    preview.appendChild(block);
  }

  function renderChecks(checks) {
    if (!Array.isArray(checks) || !checks.length) return;
    var block = addPreviewBlock("Checklist");
    var list = el("ul", "seo-checks");
    checks.forEach(function (check) {
      var item = el("li", "seo-check seo-check-" + check.level);
      var mark = el("span", "seo-check-mark", check.level === "pass" ? "✓" : check.level === "warn" ? "!" : "✕");
      mark.setAttribute("aria-hidden", "true");
      item.appendChild(mark);
      var body = el("span", "seo-check-body");
      body.appendChild(el("strong", "", check.label));
      body.appendChild(el("small", "", check.detail));
      item.appendChild(body);
      list.appendChild(item);
    });
    block.appendChild(list);
  }

  function renderFields(title, rows) {
    var present = rows.filter(function (r) {
      return r[1] !== "" && r[1] !== null && r[1] !== undefined;
    });
    if (!present.length) return;
    var block = addPreviewBlock(title);
    var list = el("dl", "dm-type-list");
    present.forEach(function (row) {
      var line = el("div", "dm-type-row");
      line.appendChild(el("dt", "", row[0]));
      line.appendChild(el("dd", "", String(row[1])));
      list.appendChild(line);
    });
    block.appendChild(list);
  }

  function renderRecommendations(recs) {
    if (!Array.isArray(recs) || !recs.length) return;
    var block = addPreviewBlock("Recommendations");
    var list = el("ol", "seo-recs");
    recs.forEach(function (rec) {
      list.appendChild(el("li", "", rec));
    });
    block.appendChild(list);
  }

  function renderResult(data) {
    stopPhases();
    setBusy(false);
    progress.hidden = true;
    clearError();
    preview.replaceChildren();

    renderScore(data);
    renderChecks(data.checks);
    renderFields("Identity", [
      ["Title", data.title],
      ["Title length", data.title ? data.title.length + " chars" : ""],
      ["Meta description", data.description],
      ["Description length", data.description ? data.description.length + " chars" : ""],
      ["Canonical", data.canonical],
      ["Language", data.lang],
      ["Robots meta", data.robotsMeta],
      ["Viewport", data.viewport],
    ]);
    var og = data.og || {};
    var tw = data.twitter || {};
    renderFields("Social", [
      ["og:title", og["og:title"]],
      ["og:description", og["og:description"]],
      ["og:image", og["og:image"]],
      ["og:type", og["og:type"]],
      ["twitter:card", tw["twitter:card"]],
    ]);
    var h = data.headings || { counts: {}, h1: [] };
    var outline = Object.keys(h.counts || {})
      .filter(function (k) { return h.counts[k]; })
      .map(function (k) { return k + "×" + h.counts[k]; })
      .join(" · ");
    renderFields("Structure", [
      ["H1", (h.h1 || []).join(" / ")],
      ["Heading outline", outline],
      ["Word count", data.wordCount],
      ["Images", data.images ? data.images.total + " (" + data.images.missingAlt + " missing alt)" : ""],
      ["Links", data.links ? data.links.internal + " internal · " + data.links.external + " external" : ""],
      ["Structured data", (data.jsonLd || []).join(", ")],
      ["Sitemaps", (data.sitemaps || []).join(", ")],
    ]);
    renderRecommendations(data.recommendations);

    editor.value = String(data.seoMd || "");
    var resultUrl = safeExternalUrl(data.finalUrl || data.url || submittedUrl);
    source.href = resultUrl || "#";
    source.textContent = data.hostname || resultUrl || "Result";
    result.hidden = false;
    switchTab("preview");
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function switchTab(name) {
    var showPreview = name === "preview";
    previewTab.setAttribute("aria-selected", showPreview ? "true" : "false");
    fileTab.setAttribute("aria-selected", showPreview ? "false" : "true");
    preview.hidden = !showPreview;
    filePanel.hidden = showPreview;
  }

  async function submitUrl(value) {
    clearError();
    result.hidden = true;
    submittedUrl = normalizeUrl(value);
    urlInput.value = submittedUrl;
    setBusy(true);
    runPhases();

    var data = await jsonFetch("/api/seo-md", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: submittedUrl }),
    });
    renderResult(data);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    submitUrl(urlInput.value).catch(function (caught) {
      stopPhases();
      setBusy(false);
      progress.hidden = true;
      showError(caught.message || "The website could not be analyzed.");
    });
  });

  previewTab.addEventListener("click", function () {
    switchTab("preview");
  });
  fileTab.addEventListener("click", function () {
    switchTab("file");
    editor.focus();
  });

  copy.addEventListener("click", async function () {
    var original = copy.textContent;
    try {
      await navigator.clipboard.writeText(editor.value);
      copy.textContent = "Copied";
    } catch (_error) {
      editor.select();
      document.execCommand("copy");
      copy.textContent = "Copied";
    }
    window.setTimeout(function () {
      copy.textContent = original;
    }, 2400);
  });

  download.addEventListener("click", function () {
    var blob = new Blob([editor.value], { type: "text/markdown;charset=utf-8" });
    var href = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = href;
    link.download = "SEO.md";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
  });

  another.addEventListener("click", function () {
    result.hidden = true;
    progress.hidden = true;
    clearError();
    urlInput.disabled = false;
    urlInput.value = "";
    urlInput.focus();
  });
})();

(function () {
  var form = document.getElementById("seoMdForm");
  var urlInput = document.getElementById("seoMdUrl");
  var output = document.getElementById("seoMdOutput");
  var progress = document.getElementById("seoMdProgress");
  var result = document.getElementById("seoMdResult");
  if (!form || !output) return;

  function sync() {
    output.dataset.state = !result.hidden ? "result" : !progress.hidden ? "progress" : "empty";
  }
  var observer = new MutationObserver(sync);
  observer.observe(progress, { attributes: true, attributeFilter: ["hidden"] });
  observer.observe(result, { attributes: true, attributeFilter: ["hidden"] });
  sync();

  document.querySelectorAll("[data-try]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      urlInput.value = chip.dataset.try;
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable: true }));
    });
  });
})();
