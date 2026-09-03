/* /tools/image-audit — client.
 *
 * The server does the crawl and the parsing; this file only renders what
 * comes back and wires up the tab/copy/download controls over the image
 * list. Same POST-a-JSON-body, render-what-comes-back shape as the other
 * checkers (see assets/post-checker.js).
 */
(function () {
  "use strict";

  var form = document.getElementById("iaForm");
  if (!form) return;

  var urlInput = document.getElementById("iaUrl");
  var submit = document.getElementById("iaSubmit");
  var errorBox = document.getElementById("iaError");
  var loading = document.getElementById("iaLoading");
  var result = document.getElementById("iaResult");
  var summaryEl = document.getElementById("iaSummary");
  var checksEl = document.getElementById("iaChecks");
  var imagesEl = document.getElementById("iaImages");
  var tabsEl = document.getElementById("iaTabs");
  var searchInput = document.getElementById("iaSearch");
  var tableBody = document.getElementById("iaTableBody");
  var tableEmpty = document.getElementById("iaTableEmpty");
  var copyBtn = document.getElementById("iaCopy");
  var downloadBtn = document.getElementById("iaDownload");
  var paginationEl = document.getElementById("iaPagination");
  var pageStatusEl = document.getElementById("iaPageStatus");
  var prevBtn = document.getElementById("iaPrev");
  var nextBtn = document.getElementById("iaNext");

  var data = null;
  var tab = "missingAlt";
  var query = "";
  var sortKey = null;
  var sortDir = 1;
  var page = 1;
  var PAGE_SIZE = 50;

  var MARK = { error: "!", warn: "!", pass: "✓" };
  var ALT_LABEL = { absent: "Missing", empty: "Empty", present: "Present" };
  var ALT_LEVEL = { absent: "error", empty: "warn", present: "pass" };
  var ALT_RANK = { absent: 0, empty: 1, present: 2 };
  var FORMAT_RANK = { avif: 0, webp: 1, svg: 2, jpeg: 3, png: 3, gif: 3, unknown: 4 };

  function formatBytes(bytes) {
    if (bytes == null) return null;
    if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  // ---- helpers --------------------------------------------------------------

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pathOf(url) {
    try {
      var u = new URL(url);
      return u.pathname + u.search || "/";
    } catch (_error) {
      return url;
    }
  }

  function normalizeUrl(value) {
    var input = String(value || "").trim();
    if (!input) throw new Error("Enter the site you want to audit.");
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

  function setBusy(busy) {
    submit.disabled = busy;
    submit.textContent = busy ? "Auditing…" : "Audit images";
    loading.hidden = !busy;
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  // ---- rendering --------------------------------------------------------------

  function renderSummary() {
    var host = "";
    try {
      host = new URL(data.origin).hostname;
    } catch (_error) {
      host = data.origin;
    }
    var pills =
      '<span class="ia-pill is-error">' + data.missingAltCount + " missing alt text</span>" +
      '<span class="ia-pill is-warn">' + data.legacyCount + " legacy format</span>" +
      '<span class="ia-pill is-pass">' + data.modernCount + " AVIF/WebP</span>" +
      '<span class="ia-pill is-warn">' + data.missingDimensionsCount + " missing dimensions</span>" +
      '<span class="ia-pill is-warn">' + data.notLazyCount + " not lazy-loaded</span>";
    if (data.estimatedSavingsBytes > 0) {
      pills += '<span class="ia-pill is-warn">~' + esc(formatBytes(data.estimatedSavingsBytes)) + " potential savings</span>";
    }
    summaryEl.innerHTML =
      '<p class="ia-summary-line"><strong>' +
      esc(host) +
      "</strong> — " +
      data.pagesCrawled +
      (data.pagesCrawled === 1 ? " page" : " pages") +
      " crawled, " +
      data.imagesTotal +
      (data.imagesTotal === 1 ? " image" : " images") +
      " found</p>" +
      '<div class="ia-pills">' + pills + "</div>";
  }

  function renderChecks() {
    checksEl.innerHTML = (data.checks || [])
      .map(function (check) {
        return (
          '<div class="ia-check is-' +
          check.level +
          '"><span class="ia-check-mark" aria-hidden="true">' +
          MARK[check.level] +
          '</span><div><p class="ia-check-title">' +
          esc(check.title) +
          (check.tag ? '<code class="ia-check-tag">' + esc(check.tag) + "</code>" : "") +
          "</p>" +
          (check.detail ? '<p class="ia-check-detail">' + esc(check.detail) + "</p>" : "") +
          "</div></div>"
        );
      })
      .join("");
  }

  function listFor(name) {
    if (name === "missingAlt") return data.missingAlt || [];
    if (name === "legacy") return data.legacy || [];
    if (name === "missingDimensions") return data.missingDimensions || [];
    if (name === "notLazy") return data.notLazy || [];
    return data.images || [];
  }

  // Search + sort operate on whatever tab is active, then pagination slices
  // the result — in that order, so "page 2" always means page 2 of the
  // filtered, sorted set the person is actually looking at.
  function visibleList() {
    var list = listFor(tab).slice();
    var q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(function (img) {
        if (img.url.toLowerCase().indexOf(q) !== -1) return true;
        return img.pages.some(function (p) {
          return p.toLowerCase().indexOf(q) !== -1;
        });
      });
    }
    if (sortKey) {
      list.sort(function (a, b) {
        var cmp = 0;
        if (sortKey === "url") cmp = a.url.localeCompare(b.url);
        else if (sortKey === "format") cmp = FORMAT_RANK[a.format] - FORMAT_RANK[b.format];
        else if (sortKey === "size") cmp = (a.bytes || 0) - (b.bytes || 0);
        else if (sortKey === "alt") cmp = ALT_RANK[a.altStatus] - ALT_RANK[b.altStatus];
        else if (sortKey === "pages") cmp = a.pages.length - b.pages.length;
        return cmp * sortDir;
      });
    }
    return list;
  }

  function renderTabs() {
    var tabs = [
      ["missingAlt", "Missing alt text", (data.missingAlt || []).length],
      ["legacy", "Legacy format", (data.legacy || []).length],
      ["missingDimensions", "Missing dimensions", (data.missingDimensions || []).length],
      ["notLazy", "Not lazy-loaded", (data.notLazy || []).length],
      ["all", "All images", (data.images || []).length],
    ];
    tabsEl.innerHTML = tabs
      .map(function (t) {
        return (
          '<button type="button" role="tab" data-tab="' +
          t[0] +
          '" aria-selected="' +
          (tab === t[0]) +
          '">' +
          esc(t[1]) +
          " (" +
          t[2] +
          ")</button>"
        );
      })
      .join("");
  }

  function renderSortHeaders() {
    tableBody.parentNode
      .querySelectorAll("thead .ia-sort")
      .forEach(function (btn) {
        var key = btn.getAttribute("data-sort");
        var active = key === sortKey;
        btn.classList.toggle("is-active", active);
        btn.querySelector(".ia-sort-arrow").textContent = active ? (sortDir === 1 ? "↑" : "↓") : "";
      });
  }

  function thumbCell(img) {
    return (
      '<img class="ia-thumb" src="' +
      esc(img.url) +
      '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.classList.add(\'is-broken\')" />'
    );
  }

  function sizeCell(img) {
    var size = formatBytes(img.bytes);
    if (!size) return '<span aria-hidden="true">—</span>';
    var savings = img.estimatedSavingsBytes > 0 ? '<span class="ia-savings">save ~' + esc(formatBytes(img.estimatedSavingsBytes)) + "</span>" : "";
    return esc(size) + savings;
  }

  function renderTable() {
    var filtered = visibleList();
    var totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > totalPages) page = totalPages;
    var start = (page - 1) * PAGE_SIZE;
    var list = filtered.slice(start, start + PAGE_SIZE);

    tableEmpty.hidden = filtered.length > 0;
    paginationEl.hidden = filtered.length <= PAGE_SIZE;
    if (!paginationEl.hidden) {
      pageStatusEl.textContent = "Page " + page + " of " + totalPages + " (" + filtered.length + ")";
      prevBtn.disabled = page <= 1;
      nextBtn.disabled = page >= totalPages;
    }

    renderSortHeaders();

    tableBody.innerHTML = list
      .map(function (img) {
        var pageCount = img.pages.length;
        var pagesTitle = img.pages.map(pathOf).join(", ");
        var pagesText = pageCount === 1 ? pathOf(img.pages[0]) : pageCount + " pages";
        return (
          "<tr>" +
          '<td class="ia-cell-thumb">' +
          thumbCell(img) +
          "</td>" +
          '<td class="ia-cell-image"><a href="' +
          esc(img.url) +
          '" target="_blank" rel="noopener noreferrer nofollow" title="' +
          esc(img.url) +
          '">' +
          esc(pathOf(img.url)) +
          "</a></td>" +
          '<td><span class="ia-badge ia-format-' +
          esc(img.format) +
          '">' +
          esc(img.format.toUpperCase()) +
          "</span></td>" +
          '<td class="ia-cell-size">' +
          sizeCell(img) +
          "</td>" +
          '<td><span class="ia-badge is-' +
          ALT_LEVEL[img.altStatus] +
          '">' +
          ALT_LABEL[img.altStatus] +
          "</span></td>" +
          '<td class="ia-cell-pages" title="' +
          esc(pagesTitle) +
          '">' +
          esc(pagesText) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function defaultTab() {
    if ((data.missingAlt || []).length) return "missingAlt";
    if ((data.legacy || []).length) return "legacy";
    if ((data.missingDimensions || []).length) return "missingDimensions";
    if ((data.notLazy || []).length) return "notLazy";
    return "all";
  }

  function render() {
    renderSummary();
    renderChecks();
    tab = defaultTab();
    query = "";
    searchInput.value = "";
    sortKey = null;
    page = 1;
    imagesEl.hidden = !(data.images || []).length;
    renderTabs();
    renderTable();
    result.hidden = false;
  }

  function listText() {
    var list = visibleList();
    return list
      .map(function (img) {
        var size = formatBytes(img.bytes);
        var sizePart = size ? ", " + size + (img.estimatedSavingsBytes > 0 ? " (save ~" + formatBytes(img.estimatedSavingsBytes) + ")" : "") : "";
        return img.url + "  —  " + img.format.toUpperCase() + sizePart + ", alt: " + ALT_LABEL[img.altStatus] + "  —  found on: " + img.pages.join(", ");
      })
      .join("\n");
  }

  function run(value) {
    var target;
    try {
      target = normalizeUrl(value);
    } catch (error) {
      showError(error.message);
      return;
    }
    urlInput.value = target;
    errorBox.hidden = true;
    result.hidden = true;
    setBusy(true);

    fetch("/api/image-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ url: target }),
    })
      .then(function (response) {
        return response.json().then(function (body) {
          return { ok: response.ok, body: body };
        });
      })
      .then(function (res) {
        if (!res.ok || res.body.error) throw new Error(res.body.error || "That site could not be audited. Try again.");
        data = res.body;
        render();
        result.scrollIntoView({ behavior: "smooth", block: "start" });
      })
      .catch(function (error) {
        showError(error.message || "That site could not be audited. Try again.");
      })
      .finally(function () {
        setBusy(false);
      });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    run(urlInput.value);
  });

  tabsEl.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-tab]");
    if (!button || !data) return;
    tab = button.getAttribute("data-tab");
    page = 1;
    renderTabs();
    renderTable();
  });

  var searchDebounce;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(function () {
      if (!data) return;
      query = searchInput.value;
      page = 1;
      renderTable();
    }, 120);
  });

  document.getElementById("iaTableBody").parentNode.addEventListener("click", function (event) {
    var button = event.target.closest("button.ia-sort");
    if (!button || !data) return;
    var key = button.getAttribute("data-sort");
    if (sortKey === key) {
      sortDir = -sortDir;
    } else {
      sortKey = key;
      sortDir = 1;
    }
    page = 1;
    renderTable();
  });

  prevBtn.addEventListener("click", function () {
    if (page <= 1) return;
    page -= 1;
    renderTable();
  });

  nextBtn.addEventListener("click", function () {
    page += 1;
    renderTable();
  });

  copyBtn.addEventListener("click", function () {
    if (!data) return;
    navigator.clipboard.writeText(listText()).then(
      function () {
        copyBtn.textContent = "Copied";
        setTimeout(function () {
          copyBtn.textContent = "Copy list";
        }, 1600);
      },
      function () {
        copyBtn.textContent = "Press ⌘C";
      },
    );
  });

  downloadBtn.addEventListener("click", function () {
    if (!data) return;
    var host = "site";
    try {
      host = new URL(data.origin).hostname;
    } catch (_error) {
      /* keep default */
    }
    var blob = new Blob([listText()], { type: "text/plain;charset=utf-8" });
    var href = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = href;
    link.download = "image-audit-" + tab + "-" + host + ".txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
  });

  document.querySelectorAll("[data-try]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      run(chip.getAttribute("data-try"));
    });
  });
})();
