/* /tools/robots-txt-generator: client.
 *
 * Plain string assembly in the browser, same as the UTM builder, no fetch,
 * no server. The output updates on every keystroke, with light syntax
 * highlighting on the directive keywords.
 */
(function () {
  "use strict";

  var form = document.getElementById("rgForm");
  if (!form) return;

  var disallowInput = document.getElementById("rgDisallow");
  var allowInput = document.getElementById("rgAllow");
  var sitemapInput = document.getElementById("rgSitemap");
  var crawlDelayInput = document.getElementById("rgCrawlDelay");
  var output = document.getElementById("rgOutput");
  var copyBtn = document.getElementById("rgCopy");
  var downloadBtn = document.getElementById("rgDownload");
  var blockAllBtn = document.getElementById("rgBlockAll");
  var clearBotsBtn = document.getElementById("rgClearBots");
  var botCount = document.getElementById("rgBotCount");
  var quickWrap = document.getElementById("rgQuick");
  var advanced = document.getElementById("rgAdvanced");
  var policyNote = document.getElementById("rgPolicyNote");

  var currentText = "";

  function lines(el) {
    return String(el.value || "")
      .split("\n")
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  function currentPolicy() {
    var r = form.querySelector('input[name="rgPolicy"]:checked');
    return r ? r.value : "except";
  }

  function presetBoxes() {
    return Array.prototype.slice.call(form.querySelectorAll('input[name="rgPreset"]'));
  }

  // Paths from every ticked quick-block preset, de-duplicated so two presets
  // that share a path don't emit it twice.
  function presetPaths() {
    var seen = {};
    var out = [];
    presetBoxes().forEach(function (el) {
      if (!el.checked) return;
      (el.getAttribute("data-paths") || "").split("|").forEach(function (p) {
        if (p && !seen[p]) {
          seen[p] = 1;
          out.push(p);
        }
      });
    });
    return out;
  }

  function dedupe(arr) {
    var seen = {};
    return arr.filter(function (p) {
      if (seen[p]) return false;
      seen[p] = 1;
      return true;
    });
  }

  // Quick blocks and the advanced custom paths only shape the output under the
  // "Allow except" policy; dim and disable them otherwise so the UI can't lie
  // about what will end up in the file.
  function syncPolicyUI() {
    var guided = currentPolicy() === "except";
    if (quickWrap) quickWrap.classList.toggle("is-disabled", !guided);
    presetBoxes().forEach(function (el) {
      el.disabled = !guided;
    });
    if (advanced) {
      advanced.classList.toggle("is-disabled", !guided);
      [disallowInput, allowInput, crawlDelayInput].forEach(function (el) {
        el.disabled = !guided;
      });
    }
    if (policyNote) {
      var p = currentPolicy();
      policyNote.textContent =
        p === "allow"
          ? "Every crawler may read the whole site. Quick blocks are off."
          : p === "block"
            ? "Disallow: / keeps every crawler out: use this for staging only."
            : "Pick the areas below to hide from all crawlers; everything else stays open.";
    }
  }

  function botBoxes() {
    return Array.prototype.slice.call(form.querySelectorAll('input[name="aiBot"]'));
  }

  function checkedBots() {
    return botBoxes()
      .filter(function (el) {
        return el.checked;
      })
      .map(function (el) {
        return el.value;
      });
  }

  function escHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Wrap a leading "Directive:" in a coloured span so the preview reads like a
  // real config file rather than a flat grey block.
  function highlight(text) {
    return text
      .split("\n")
      .map(function (line) {
        var m = /^([A-Za-z-]+):(.*)$/.exec(line);
        if (!m) return escHtml(line);
        return '<span class="tok-key">' + escHtml(m[1]) + ':</span><span class="tok-val">' + escHtml(m[2]) + "</span>";
      })
      .join("\n");
  }

  function updateCount() {
    var n = checkedBots().length;
    if (botCount) botCount.textContent = n === 0 ? "None blocked" : n + (n === 1 ? " bot blocked" : " bots blocked");
  }

  function build() {
    var blocks = [];
    var policy = currentPolicy();

    var mainLines = ["User-agent: *"];
    if (policy === "block") {
      mainLines.push("Disallow: /");
    } else if (policy === "allow") {
      mainLines.push("Disallow:");
    } else {
      var disallow = dedupe(presetPaths().concat(lines(disallowInput)));
      var allow = lines(allowInput);
      disallow.forEach(function (path) {
        mainLines.push("Disallow: " + path);
      });
      allow.forEach(function (path) {
        mainLines.push("Allow: " + path);
      });
      if (disallow.length === 0 && allow.length === 0) mainLines.push("Disallow:");
      var delay = crawlDelayInput.value.trim();
      if (delay && Number(delay) >= 0) mainLines.push("Crawl-delay: " + Number(delay));
    }
    blocks.push(mainLines.join("\n"));

    checkedBots().forEach(function (bot) {
      blocks.push("User-agent: " + bot + "\nDisallow: /");
    });

    var sitemap = sitemapInput.value.trim();
    var text = blocks.join("\n\n");
    if (sitemap) text += "\n\nSitemap: " + sitemap;

    currentText = text + "\n";
    output.innerHTML = highlight(currentText);
    updateCount();
    return currentText;
  }

  [disallowInput, allowInput, sitemapInput, crawlDelayInput].forEach(function (el) {
    el.addEventListener("input", build);
  });
  form.addEventListener("change", function () {
    syncPolicyUI();
    build();
  });

  if (blockAllBtn) {
    blockAllBtn.addEventListener("click", function () {
      botBoxes().forEach(function (el) {
        el.checked = true;
      });
      build();
    });
  }
  if (clearBotsBtn) {
    clearBotsBtn.addEventListener("click", function () {
      botBoxes().forEach(function (el) {
        el.checked = false;
      });
      build();
    });
  }

  copyBtn.addEventListener("click", function () {
    navigator.clipboard.writeText(currentText).then(function () {
      copyBtn.textContent = "Copied";
      setTimeout(function () {
        copyBtn.textContent = "Copy";
      }, 1600);
    });
  });

  downloadBtn.addEventListener("click", function () {
    var blob = new Blob([currentText], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "robots.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  });

  syncPolicyUI();
  build();
})();
