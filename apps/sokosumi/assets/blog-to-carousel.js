/* /tools/blog-to-carousel — client. Uses wireSimple(); renders the tk-steps
 * list itself since each step needs an index badge.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;
  var tk = window.SokosumiToolKit;

  var urlInput = document.getElementById("btcUrl");
  var stepsEl = document.getElementById("btcSteps");

  var api = tk.wireSimple({
    formId: "btcForm",
    submitId: "btcSubmit",
    errorId: "btcError",
    loadingId: "btcLoading",
    resultId: "btcResult",
    endpoint: "/api/blog-to-carousel-check",
    method: "POST",
    submitLabel: "Build the carousel",
    busyLabel: "Reading the post…",
    getValue: function () {
      return urlInput.value;
    },
    buildBody: function (value) {
      return { url: value };
    },
    onData: function (data) {
      stepsEl.innerHTML = data.slides
        .map(function (slide) {
          return (
            '<div class="tk-step"><span class="tk-step-index">' +
            slide.index +
            "</span><h3>" +
            tk.esc(slide.heading) +
            "</h3><p>" +
            tk.esc(slide.body) +
            "</p></div>"
          );
        })
        .join("");
    },
  });

  tk.copyButton("btcCopy", function () {
    var data = api && api.getData();
    if (!data) return "";
    return data.slides.map(function (s) { return "Slide " + s.index + ": " + s.heading + "\n" + s.body; }).join("\n\n");
  });
})();
