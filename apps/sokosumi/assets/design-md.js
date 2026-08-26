(function () {
  "use strict";

  var form = document.getElementById("designMdForm");
  if (!form) return;

  var urlInput = document.getElementById("designMdUrl");
  var submit = document.getElementById("designMdSubmit");
  var submitLabel = submit.querySelector(".dm-submit-label");
  var submitLoading = submit.querySelector(".dm-submit-loading");
  var error = document.getElementById("designMdError");
  var progress = document.getElementById("designMdProgress");
  var status = document.getElementById("designMdStatus");
  var result = document.getElementById("designMdResult");
  var source = document.getElementById("designMdSource");
  var preview = document.getElementById("designMdPreview");
  var editor = document.getElementById("designMdEditor");
  var previewTab = document.getElementById("designMdPreviewTab");
  var fileTab = document.getElementById("designMdFileTab");
  var filePanel = document.getElementById("designMdFile");
  var copy = document.getElementById("designMdCopy");
  var download = document.getElementById("designMdDownload");
  var another = document.getElementById("designMdAnother");
  var gallery = document.getElementById("designMdGallery");
  var galleryCount = document.getElementById("designMdGalleryCount");
  var galleryMore = document.getElementById("designMdGalleryMore");
  var archive = [];
  var archiveExpanded = false;
  var submittedUrl = "";
  var pollTimer = null;
  var initialAnalysis = new URLSearchParams(location.search).get("analysis");

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

  function stopPolling() {
    if (pollTimer) window.clearTimeout(pollTimer);
    pollTimer = null;
  }

  function safeColor(value) {
    var color = String(value || "").trim();
    return color && window.CSS && CSS.supports("color", color) ? color : "";
  }

  function safeExternalUrl(value) {
    try {
      var parsed = new URL(String(value || ""));
      return /^https?:$/.test(parsed.protocol) ? parsed.href : "";
    } catch (_error) {
      return "";
    }
  }

  function valuesText(value) {
    if (value === null || value === undefined) return "";
    if (typeof value !== "object") return String(value);
    return Object.entries(value)
      .map(function (entry) {
        return entry[0] + ": " + String(entry[1]);
      })
      .join(" · ");
  }

  function addPreviewBlock(title) {
    var block = el("section", "dm-preview-block");
    block.appendChild(el("h3", "", title));
    preview.appendChild(block);
    return block;
  }

  function renderColors(colors) {
    var entries = Object.entries(colors || {});
    if (!entries.length) return;
    var block = addPreviewBlock("Colors");
    var swatches = el("div", "dm-swatches");
    entries.forEach(function (entry) {
      var item = el("div", "dm-swatch");
      var sample = el("span", "dm-swatch-color");
      var color = safeColor(entry[1]);
      if (color) sample.style.backgroundColor = color;
      item.appendChild(sample);
      item.appendChild(el("strong", "", entry[0]));
      item.appendChild(el("small", "", entry[1]));
      swatches.appendChild(item);
    });
    block.appendChild(swatches);
  }

  function renderType(typography) {
    var entries = Object.entries(typography || {});
    if (!entries.length) return;
    var block = addPreviewBlock("Typography");
    var list = el("dl", "dm-type-list");
    entries.forEach(function (entry) {
      var row = el("div", "dm-type-row");
      row.appendChild(el("dt", "", entry[0]));
      row.appendChild(el("dd", "", valuesText(entry[1])));
      list.appendChild(row);
    });
    block.appendChild(list);
  }

  function appendProseBody(parent, body) {
    var paragraph = [];
    var list = null;

    function flushParagraph() {
      if (!paragraph.length) return;
      parent.appendChild(el("p", "", paragraph.join(" ")));
      paragraph = [];
    }

    String(body || "")
      .split(/\r?\n/)
      .forEach(function (line) {
        var text = line.trim();
        var bullet = /^[-*]\s+(.+)/.exec(text);
        if (bullet) {
          flushParagraph();
          if (!list) {
            list = el("ul");
            parent.appendChild(list);
          }
          list.appendChild(el("li", "", bullet[1]));
          return;
        }
        list = null;
        if (!text) {
          flushParagraph();
          return;
        }
        paragraph.push(text.replace(/^#{1,6}\s+/, ""));
      });
    flushParagraph();
  }

  function renderProse(sections) {
    if (!Array.isArray(sections) || !sections.length) return;
    var block = addPreviewBlock("Design guidance");
    var list = el("div", "dm-prose-sections");
    sections.forEach(function (section) {
      var item = el("section", "dm-prose-section");
      item.appendChild(el("h3", "", section.heading || "Guidance"));
      appendProseBody(item, section.body);
      list.appendChild(item);
    });
    block.appendChild(list);
  }

  function renderResult(data) {
    stopPolling();
    setBusy(false);
    progress.hidden = true;
    clearError();
    preview.replaceChildren();

    var frontmatter = data.frontmatter || {};
    var heading = addPreviewBlock(frontmatter.name || "Extracted design system");
    heading.appendChild(
      el(
        "p",
        "",
        frontmatter.description || "A structured visual system ready to use as repository context.",
      ),
    );
    renderColors(frontmatter.colors);
    renderType(frontmatter.typography);
    renderProse(data.prose);

    editor.value = String(data.designMd || "");
    var resultUrl = safeExternalUrl(data.url || submittedUrl);
    source.href = resultUrl || "#";
    source.textContent = resultUrl || "Saved analysis";
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

  async function poll(jobId, attempt) {
    try {
      var data = await jsonFetch("/api/design-md/jobs/" + encodeURIComponent(jobId));
      if (data.status === "done") {
        renderResult(data);
        loadGallery();
        return;
      }
      if (data.status === "failed") {
        throw new Error(data.error || "The website could not be analyzed.");
      }
      if (attempt >= 120) {
        throw new Error("This analysis is taking longer than expected. Try again in a few minutes.");
      }
      if (data.status === "running" && attempt > 20) {
        setPhase("finishing", "The analysis is nearly ready. We are writing the file.");
      } else if (data.status === "running") {
        setPhase("running", "The page is open. We are reading its visual system now.");
      } else {
        setPhase("queued", "Your analysis is queued. It will start automatically.");
      }
      pollTimer = window.setTimeout(function () {
        poll(jobId, attempt + 1);
      }, 2500);
    } catch (caught) {
      setBusy(false);
      progress.hidden = true;
      showError(caught.message || "The website could not be analyzed.");
    }
  }

  async function submitUrl(value) {
    clearError();
    result.hidden = true;
    stopPolling();
    submittedUrl = normalizeUrl(value);
    history.replaceState(null, "", location.pathname + "#generator");
    initialAnalysis = null;
    urlInput.value = submittedUrl;
    setBusy(true);
    setPhase("queued", "Your analysis is queued. It will start automatically.");

    var data = await jsonFetch("/api/design-md", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: submittedUrl }),
    });
    if (data.status === "done") {
      renderResult(Object.assign({ url: submittedUrl }, data));
      return;
    }
    if (!data.jobId) throw new Error("The analysis service returned an incomplete response.");
    poll(data.jobId, 0);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    submitUrl(urlInput.value).catch(function (caught) {
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
    link.download = "DESIGN.md";
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

  function galleryCard(entry) {
    var button = el("button", "dm-gallery-card");
    button.type = "button";
    button.dataset.entryId = entry.id;
    button.setAttribute("aria-label", "Open the DESIGN.md analysis for " + (entry.name || entry.hostname));
    var shot = el("span", "dm-gallery-shot");
    if (entry.screenshotUrl) {
      var image = document.createElement("img");
      image.src = entry.screenshotUrl;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      shot.appendChild(image);
    }
    var meta = el("span", "dm-gallery-meta");
    meta.appendChild(el("strong", "", entry.name || entry.hostname));
    meta.appendChild(el("small", "", entry.hostname));
    button.appendChild(shot);
    button.appendChild(meta);
    button.addEventListener("click", function () {
      openArchiveEntry(entry.id, button);
    });
    return button;
  }

  function renderGallery() {
    gallery.replaceChildren();
    var shown = archiveExpanded ? archive : archive.slice(0, 12);
    shown.forEach(function (entry) {
      gallery.appendChild(galleryCard(entry));
    });
    galleryCount.textContent = archive.length
      ? archive.length + (archive.length === 1 ? " saved analysis" : " saved analyses")
      : "No saved analyses yet";
    galleryMore.hidden = archive.length <= 12 || archiveExpanded;
  }

  async function openArchiveEntry(id, button) {
    var label = button ? button.querySelector(".dm-gallery-meta strong") : null;
    var original = label ? label.textContent : "";
    if (button) button.disabled = true;
    if (label) label.textContent = "Opening analysis…";
    try {
      var data = await jsonFetch("/api/design-md/extractions/" + encodeURIComponent(id));
      submittedUrl = data.url || "";
      renderResult(data);
      history.replaceState(null, "", "?analysis=" + encodeURIComponent(id) + "#generator");
    } catch (caught) {
      showError(caught.message || "This saved analysis could not be opened.");
      document.getElementById("generator").scrollIntoView({ behavior: "smooth" });
    } finally {
      if (button) button.disabled = false;
      if (label) label.textContent = original;
    }
  }

  async function loadGallery() {
    try {
      var data = await jsonFetch("/api/design-md/gallery");
      archive = Array.isArray(data.entries) ? data.entries : [];
      renderGallery();
      var selected = initialAnalysis;
      if (selected && /^\d+$/.test(selected)) {
        initialAnalysis = null;
        openArchiveEntry(selected, gallery.querySelector('[data-entry-id="' + selected + '"]'));
      }
    } catch (_error) {
      gallery.replaceChildren(el("p", "dm-gallery-empty", "The saved-analysis archive is unavailable right now."));
      galleryCount.textContent = "Archive unavailable";
    }
  }

  galleryMore.addEventListener("click", function () {
    archiveExpanded = true;
    renderGallery();
  });

  loadGallery();
})();

(function () {
  var form = document.getElementById("designMdForm");
  var urlInput = document.getElementById("designMdUrl");
  var output = document.getElementById("designMdOutput");
  var progress = document.getElementById("designMdProgress");
  var result = document.getElementById("designMdResult");
  var example = document.getElementById("designMdExample");
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

  if (example) {
    example.addEventListener("click", function () {
      var card = document.querySelector(".dm-gallery-card");
      if (card) card.click();
    });
  }
})();
