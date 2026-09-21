/* /tools/robots-txt-generator — client.
 *
 * Plain string assembly in the browser, same as the UTM builder — no fetch,
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

  var currentText = "";

  function lines(el) {
    return String(el.value || "")
      .split("\n")
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
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
    var disallow = lines(disallowInput);
    var allow = lines(allowInput);

    var mainLines = ["User-agent: *"];
    disallow.forEach(function (path) {
      mainLines.push("Disallow: " + path);
    });
    allow.forEach(function (path) {
      mainLines.push("Allow: " + path);
    });
    if (disallow.length === 0 && allow.length === 0) mainLines.push("Disallow:");
    var delay = crawlDelayInput.value.trim();
    if (delay && Number(delay) >= 0) mainLines.push("Crawl-delay: " + Number(delay));
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
  form.addEventListener("change", build);

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

  build();
})();
