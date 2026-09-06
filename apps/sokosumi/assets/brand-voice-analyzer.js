/* /tools/brand-voice-analyzer — client. Uses SokosumiToolKit.wireSimple()
 * since the result is a voice spec, not a pass/fail dimension list.
 */
(function () {
  "use strict";
  if (!window.SokosumiToolKit) return;
  var tk = window.SokosumiToolKit;

  var textInput = document.getElementById("bvaText");
  var summaryEl = document.getElementById("bvaSummary");
  var metricsEl = document.getElementById("bvaMetrics");
  var cloudEl = document.getElementById("bvaCloud");
  var specEl = document.getElementById("bvaSpec");

  function metricCard(title, value) {
    return '<div class="tk-card"><h3>' + tk.esc(title) + "</h3><p>" + tk.esc(value) + "</p></div>";
  }

  var api = tk.wireSimple({
    formId: "bvaForm",
    submitId: "bvaSubmit",
    errorId: "bvaError",
    loadingId: "bvaLoading",
    resultId: "bvaResult",
    endpoint: "/api/brand-voice-check",
    method: "POST",
    submitLabel: "Extract my voice",
    busyLabel: "Reading your posts…",
    getValue: function () {
      return textInput.value;
    },
    setValue: function (value) {
      textInput.value = value;
    },
    buildBody: function (value) {
      return { text: value };
    },
    onData: function (data) {
      summaryEl.innerHTML = "<strong>" + data.postCount + " posts</strong> analyzed · " + tk.esc(data.wordCount) + " words total";
      metricsEl.innerHTML = [
        metricCard("Voice", data.personLabel),
        metricCard("Formality", data.formalityLabel),
        metricCard("Sentence style", data.sentenceStyleLabel + " (" + data.avgWordsPerSentence + " words/sentence)"),
        metricCard("Punctuation", data.punctuationLabel),
      ].join("");
      tk.renderCloud(cloudEl, data.topWords);
      specEl.textContent = data.spec;
    },
    examples: {
      sample:
        "You'll spend less time formatting slides and more time actually thinking about the pitch. That's the whole point.\n\n---\n\nWe shipped three things this week: faster exports, a cleaner dashboard, and — finally — dark mode. Your move, competitors.\n\n---\n\nHonestly? Most teams over-engineer their onboarding. You don't need seven emails. You need one that actually gets read.\n\n---\n\nWe're not trying to be everything to everyone. We're trying to be the one thing your marketing team actually opens on a Monday.\n\n---\n\nYou asked, we built it: bulk export is live. Try it and tell us what breaks.",
    },
  });

  tk.copyButton("bvaCopy", function () {
    var data = api && api.getData();
    return data ? data.spec : "";
  });
})();
