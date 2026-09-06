/* /tools/utm-builder — client.
 *
 * Everything here is plain string building in the browser. No fetch, no
 * server involved at all — the whole point of this tool is that the URL you
 * type never has to leave your machine to get tagged.
 */
(function () {
  "use strict";

  var form = document.getElementById("ubForm");
  if (!form) return;

  var urlInput = document.getElementById("ubUrl");
  var sourceInput = document.getElementById("ubSource");
  var mediumInput = document.getElementById("ubMedium");
  var campaignInput = document.getElementById("ubCampaign");
  var termInput = document.getElementById("ubTerm");
  var contentInput = document.getElementById("ubContent");
  var errorBox = document.getElementById("ubError");
  var output = document.getElementById("ubOutput");
  var resultInput = document.getElementById("ubResult");
  var copyBtn = document.getElementById("ubCopy");
  var recentSection = document.getElementById("ubRecentSection");
  var recentList = document.getElementById("ubRecentList");
  var clearBtn = document.getElementById("ubClear");

  var STORAGE_KEY = "sokosumi-utm-recent";
  var MAX_RECENT = 8;

  function loadRecent() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function saveRecent(list) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
    } catch (e) {
      /* localStorage unavailable — recent list just won't persist */
    }
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderRecent() {
    var list = loadRecent();
    recentSection.hidden = list.length === 0;
    recentList.innerHTML = list
      .map(function (url, i) {
        return (
          '<li class="ub-recent-item"><span class="ub-recent-url">' +
          esc(url) +
          '</span><button type="button" class="ub-recent-copy" data-url="' +
          esc(url) +
          '">Copy</button></li>'
        );
      })
      .join("");
  }

  function addRecent(url) {
    var list = loadRecent().filter(function (u) {
      return u !== url;
    });
    list.unshift(url);
    saveRecent(list);
    renderRecent();
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    output.hidden = true;
  }

  function slugify(value) {
    return String(value || "").trim().toLowerCase();
  }

  function build() {
    var raw = urlInput.value.trim();
    var source = slugify(sourceInput.value);
    var medium = slugify(mediumInput.value);
    var campaign = slugify(campaignInput.value);
    var term = slugify(termInput.value);
    var content = slugify(contentInput.value);

    if (!raw) {
      errorBox.hidden = true;
      output.hidden = true;
      return;
    }

    var parsed;
    try {
      parsed = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw);
    } catch (e) {
      showError("Enter a valid URL.");
      return;
    }

    if (!source || !medium || !campaign) {
      errorBox.hidden = true;
      output.hidden = true;
      return;
    }

    errorBox.hidden = true;
    parsed.searchParams.set("utm_source", source);
    parsed.searchParams.set("utm_medium", medium);
    parsed.searchParams.set("utm_campaign", campaign);
    if (term) parsed.searchParams.set("utm_term", term);
    if (content) parsed.searchParams.set("utm_content", content);

    resultInput.value = parsed.href;
    output.hidden = false;
    return parsed.href;
  }

  [urlInput, sourceInput, mediumInput, campaignInput, termInput, contentInput].forEach(function (input) {
    input.addEventListener("input", build);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var url = build();
    if (url) addRecent(url);
  });

  copyBtn.addEventListener("click", function () {
    var url = resultInput.value;
    if (!url) return;
    navigator.clipboard.writeText(url).then(
      function () {
        copyBtn.textContent = "Copied";
        addRecent(url);
        setTimeout(function () {
          copyBtn.textContent = "Copy";
        }, 1600);
      },
      function () {
        resultInput.select();
      },
    );
  });

  recentList.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-url]");
    if (!button) return;
    var url = button.getAttribute("data-url");
    navigator.clipboard.writeText(url).then(function () {
      button.textContent = "Copied";
      setTimeout(function () {
        button.textContent = "Copy";
      }, 1600);
    });
  });

  clearBtn.addEventListener("click", function () {
    saveRecent([]);
    renderRecent();
  });

  renderRecent();
})();
