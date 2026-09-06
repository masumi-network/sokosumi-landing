/* /tools/image-compressor — client.
 *
 * The chosen file's raw bytes are POSTed as the request body (Content-Type
 * set to the file's mime type) rather than wrapped in JSON/multipart — the
 * server reads it as a raw stream, so there's no base64 inflation and no
 * multipart parser needed on either end. The response is the compressed
 * image itself, with the before/after stats riding along as headers.
 */
(function () {
  "use strict";

  var drop = document.getElementById("icDrop");
  if (!drop) return;

  var fileInput = document.getElementById("icFile");
  var controls = document.getElementById("icControls");
  var formatSelect = document.getElementById("icFormat");
  var qualityInput = document.getElementById("icQuality");
  var qualityValue = document.getElementById("icQualityValue");
  var submit = document.getElementById("icSubmit");
  var errorBox = document.getElementById("icError");
  var loading = document.getElementById("icLoading");
  var result = document.getElementById("icResult");
  var beforeImg = document.getElementById("icBeforeImg");
  var beforeStats = document.getElementById("icBeforeStats");
  var afterImg = document.getElementById("icAfterImg");
  var afterStats = document.getElementById("icAfterStats");
  var savings = document.getElementById("icSavings");
  var download = document.getElementById("icDownload");
  var another = document.getElementById("icAnother");

  var MAX_BYTES = 15 * 1024 * 1024;
  var ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

  var currentFile = null;
  var beforeUrl = null;
  var afterUrl = null;

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function clearError() {
    errorBox.hidden = true;
  }

  function setBusy(busy) {
    submit.disabled = busy;
    submit.textContent = busy ? "Compressing…" : "Compress";
    loading.hidden = !busy;
  }

  function formatBytes(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(2) + " MB";
  }

  function revoke(url) {
    if (url) URL.revokeObjectURL(url);
  }

  function pickFile(file) {
    if (!file) return;
    if (ALLOWED.indexOf(file.type) === -1) {
      showError("Choose a JPEG, PNG, WebP, AVIF or GIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      showError("That image is larger than 15MB.");
      return;
    }
    clearError();
    currentFile = file;
    controls.hidden = false;
    result.hidden = true;
  }

  drop.addEventListener("click", function () {
    fileInput.click();
  });
  drop.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileInput.click();
    }
  });
  fileInput.addEventListener("change", function () {
    pickFile(fileInput.files && fileInput.files[0]);
  });

  ["dragenter", "dragover"].forEach(function (evt) {
    drop.addEventListener(evt, function (event) {
      event.preventDefault();
      drop.classList.add("is-dragover");
    });
  });
  ["dragleave", "drop"].forEach(function (evt) {
    drop.addEventListener(evt, function (event) {
      event.preventDefault();
      drop.classList.remove("is-dragover");
    });
  });
  drop.addEventListener("drop", function (event) {
    var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    pickFile(file);
  });

  qualityInput.addEventListener("input", function () {
    qualityValue.textContent = qualityInput.value;
  });

  submit.addEventListener("click", function () {
    if (!currentFile) return;
    clearError();
    result.hidden = true;
    setBusy(true);

    revoke(beforeUrl);
    revoke(afterUrl);
    beforeUrl = URL.createObjectURL(currentFile);

    var params = new URLSearchParams({
      format: formatSelect.value,
      quality: qualityInput.value,
    });

    fetch("/api/image-compress?" + params.toString(), {
      method: "POST",
      headers: { "Content-Type": currentFile.type },
      body: currentFile,
    })
      .then(function (response) {
        if (!response.ok) {
          return response
            .json()
            .catch(function () {
              return { error: "That image could not be compressed. Try again." };
            })
            .then(function (body) {
              throw new Error(body.error || "That image could not be compressed. Try again.");
            });
        }
        var inputBytes = Number(response.headers.get("X-Input-Bytes")) || currentFile.size;
        var outputBytes = Number(response.headers.get("X-Output-Bytes")) || 0;
        var outputFormat = response.headers.get("X-Output-Format") || "";
        var width = response.headers.get("X-Image-Width");
        var height = response.headers.get("X-Image-Height");
        return response.blob().then(function (blob) {
          return { blob: blob, inputBytes: inputBytes, outputBytes: outputBytes, outputFormat: outputFormat, width: width, height: height };
        });
      })
      .then(function (res) {
        afterUrl = URL.createObjectURL(res.blob);
        beforeImg.src = beforeUrl;
        afterImg.src = afterUrl;
        var dims = res.width && res.height ? res.width + "×" + res.height + " · " : "";
        beforeStats.textContent = dims + formatBytes(res.inputBytes);
        afterStats.textContent = dims + formatBytes(res.outputBytes);
        var saved = res.inputBytes > 0 ? Math.round((1 - res.outputBytes / res.inputBytes) * 100) : 0;
        savings.innerHTML =
          saved > 0
            ? "<strong>" + saved + "% smaller</strong> — " + formatBytes(res.inputBytes) + " → " + formatBytes(res.outputBytes)
            : "No size reduction at this quality — try a lower quality or a different format.";
        download.href = afterUrl;
        download.setAttribute("download", "compressed." + (res.outputFormat || "jpg"));
        result.hidden = false;
        result.scrollIntoView({ behavior: "smooth", block: "start" });
      })
      .catch(function (error) {
        showError(error.message || "That image could not be compressed. Try again.");
      })
      .finally(function () {
        setBusy(false);
      });
  });

  another.addEventListener("click", function () {
    currentFile = null;
    fileInput.value = "";
    controls.hidden = true;
    result.hidden = true;
    clearError();
  });
})();
