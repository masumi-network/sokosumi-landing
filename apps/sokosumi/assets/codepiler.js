/* /tools/codepiler — client. Uses wireSimple() since the result is a
 * generated system prompt, not a pass/fail score.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;
  var tk = window.SokosumiToolKit;

  var repoInput = document.getElementById("cpRepo");
  var metricsEl = document.getElementById("cpMetrics");
  var promptEl = document.getElementById("cpPrompt");

  function metricCard(title, value) {
    return '<div class="tk-card"><h3>' + tk.esc(title) + "</h3><p>" + tk.esc(value) + "</p></div>";
  }

  var api = tk.wireSimple({
    formId: "cpForm",
    submitId: "cpSubmit",
    errorId: "cpError",
    loadingId: "cpLoading",
    resultId: "cpResult",
    endpoint: "/api/codepiler-check",
    method: "POST",
    submitLabel: "Build the system prompt",
    busyLabel: "Reading the repo…",
    getValue: function () {
      return repoInput.value;
    },
    setValue: function (value) {
      repoInput.value = value;
    },
    buildBody: function (value) {
      return { repo: value };
    },
    onData: function (data) {
      var d = data.detected;
      metricsEl.innerHTML = [
        metricCard("Repo", data.repo),
        metricCard("Languages", data.languages.map(function (l) { return l.name + " " + l.pct + "%"; }).join(", ") || "not detected"),
        metricCard("Package manager", d.packageManager || "not detected"),
        metricCard("Tests", d.testFramework || "not detected"),
        metricCard("Lint / format", d.lintFormat.length ? d.lintFormat.join(", ") : "not detected"),
        metricCard("CI", d.ci || "not detected"),
      ].join("");
      promptEl.textContent = data.systemPrompt;
    },
  });

  tk.copyButton("cpCopy", function () {
    var data = api && api.getData();
    return data ? data.systemPrompt : "";
  });
})();
