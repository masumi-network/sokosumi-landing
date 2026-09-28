(function () {
  var editor = document.getElementById("designMdEditor");
  var copy = document.getElementById("designMdCopy");
  var download = document.getElementById("designMdDownload");
  var previewTab = document.getElementById("designMdPreviewTab");
  var fileTab = document.getElementById("designMdFileTab");
  var preview = document.getElementById("designMdPreview");
  var filePanel = document.getElementById("designMdFile");
  if (!editor) return;

  function switchTab(name) {
    var showPreview = name === "preview";
    previewTab.setAttribute("aria-selected", String(showPreview));
    fileTab.setAttribute("aria-selected", String(!showPreview));
    preview.hidden = !showPreview;
    filePanel.hidden = showPreview;
  }
  previewTab.addEventListener("click", function () { switchTab("preview"); });
  fileTab.addEventListener("click", function () { switchTab("file"); });

  copy.addEventListener("click", async function () {
    try {
      await navigator.clipboard.writeText(editor.value);
      copy.textContent = "Copied";
    } catch (_e) {
      editor.hidden = false;
      switchTab("file");
      editor.select();
      copy.textContent = "Select and copy";
    }
    window.setTimeout(function () { copy.textContent = "Copy"; }, 1600);
  });

  download.addEventListener("click", function () {
    var blob = new Blob([editor.value], { type: "text/markdown;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "DESIGN.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });
})();
