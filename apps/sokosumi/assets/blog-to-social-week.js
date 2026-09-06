/* /tools/blog-to-social-week — client. Uses wireSimple(); renders the
 * tk-steps list itself since each step needs a day label instead of a number.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;
  var tk = window.SokosumiToolKit;

  var urlInput = document.getElementById("btwUrl");
  var stepsEl = document.getElementById("btwSteps");

  var api = tk.wireSimple({
    formId: "btwForm",
    submitId: "btwSubmit",
    errorId: "btwError",
    loadingId: "btwLoading",
    resultId: "btwResult",
    endpoint: "/api/blog-to-social-week-check",
    method: "POST",
    submitLabel: "Build the week",
    busyLabel: "Reading the post…",
    getValue: function () {
      return urlInput.value;
    },
    buildBody: function (value) {
      return { url: value };
    },
    onData: function (data) {
      if (!data.days.length) {
        stepsEl.innerHTML = '<p class="tk-empty">Couldn\'t find enough stats, quotes or sections on that page to build drafts.</p>';
        return;
      }
      stepsEl.innerHTML = data.days
        .map(function (d, i) {
          return (
            '<div class="tk-step"><span class="tk-step-index">' +
            (i + 1) +
            "</span><h3>" +
            tk.esc(d.day) +
            " — " +
            tk.esc(d.angle) +
            '</h3><p style="white-space:pre-wrap">' +
            tk.esc(d.body) +
            "</p></div>"
          );
        })
        .join("");
    },
  });

  tk.copyButton("btwCopy", function () {
    var data = api && api.getData();
    if (!data) return "";
    return data.days.map(function (d) { return d.day + " (" + d.angle + ")\n" + d.body; }).join("\n\n---\n\n");
  });
})();
