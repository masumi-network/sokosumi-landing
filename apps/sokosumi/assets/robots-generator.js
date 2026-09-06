/* /tools/robots-txt-generator — client.
 *
 * Plain string assembly in the browser, same as the UTM builder — no fetch,
 * no server. The output updates on every keystroke.
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

  function lines(el) {
    return String(el.value || "")
      .split("\n")
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  function checkedBots() {
    return Array.prototype.slice
      .call(form.querySelectorAll('input[name="aiBot"]:checked'))
      .map(function (el) {
        return el.value;
      });
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

    output.textContent = text + "\n";
    return output.textContent;
  }

  [disallowInput, allowInput, sitemapInput, crawlDelayInput].forEach(function (el) {
    el.addEventListener("input", build);
  });
  form.addEventListener("change", build);

  copyBtn.addEventListener("click", function () {
    navigator.clipboard.writeText(output.textContent).then(function () {
      copyBtn.textContent = "Copied";
      setTimeout(function () {
        copyBtn.textContent = "Copy";
      }, 1600);
    });
  });

  downloadBtn.addEventListener("click", function () {
    var blob = new Blob([output.textContent], { type: "text/plain" });
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
