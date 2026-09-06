/* /tools/qr-code-generator — client.
 *
 * Builds a GET request to /api/qr-code with the text and options in the
 * query string, and renders whatever image comes back. A GET (not POST) is
 * deliberate: the resulting URL is itself a shareable, cacheable QR-code
 * link — paste it anywhere an <img src> is accepted.
 */
(function () {
  "use strict";

  var form = document.getElementById("qgForm");
  if (!form) return;

  var dataInput = document.getElementById("qgData");
  var formatSelect = document.getElementById("qgFormat");
  var ecSelect = document.getElementById("qgEc");
  var sizeInput = document.getElementById("qgSize");
  var sizeValue = document.getElementById("qgSizeValue");
  var fgInput = document.getElementById("qgFg");
  var bgInput = document.getElementById("qgBg");
  var submit = document.getElementById("qgSubmit");
  var errorBox = document.getElementById("qgError");
  var stage = document.getElementById("qgStage");
  var empty = document.getElementById("qgEmpty");
  var image = document.getElementById("qgImage");
  var loading = document.getElementById("qgLoading");
  var downloadLink = document.getElementById("qgDownload");

  var currentUrl = null;

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function clearError() {
    errorBox.hidden = true;
  }

  function setBusy(busy) {
    submit.disabled = busy;
    submit.textContent = busy ? "Generating…" : "Generate";
    loading.hidden = !busy;
  }

  sizeInput.addEventListener("input", function () {
    sizeValue.textContent = sizeInput.value + "px";
  });

  function buildUrl() {
    var data = dataInput.value.trim();
    if (!data) return null;
    var format = formatSelect.value;
    var params = new URLSearchParams({
      data: data,
      format: format,
      ec: ecSelect.value,
      size: sizeInput.value,
      fg: fgInput.value,
      bg: bgInput.value,
    });
    return { url: "/api/qr-code?" + params.toString(), format: format };
  }

  function generate() {
    var built = buildUrl();
    if (!built) {
      showError("Enter the text or URL to encode.");
      return;
    }
    clearError();
    empty.hidden = true;
    image.hidden = true;
    downloadLink.hidden = true;
    setBusy(true);

    fetch(built.url)
      .then(function (response) {
        if (!response.ok) {
          return response
            .json()
            .catch(function () {
              return { error: "That code could not be generated. Try again." };
            })
            .then(function (body) {
              throw new Error(body.error || "That code could not be generated. Try again.");
            });
        }
        return response.blob();
      })
      .then(function (blob) {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        currentUrl = URL.createObjectURL(blob);
        image.src = currentUrl;
        image.hidden = false;
        downloadLink.href = currentUrl;
        downloadLink.setAttribute("download", "qr-code." + built.format);
        downloadLink.hidden = false;
      })
      .catch(function (error) {
        empty.hidden = false;
        showError(error.message || "That code could not be generated. Try again.");
      })
      .finally(function () {
        setBusy(false);
      });
  }

  submit.addEventListener("click", generate);
  form.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") {
      event.preventDefault();
      generate();
    }
  });
})();
