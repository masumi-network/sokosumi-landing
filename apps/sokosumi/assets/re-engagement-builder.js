/* /tools/re-engagement-builder — client-only. Nothing leaves the browser. */
(function () {
  "use strict";
  var tk = window.SokosumiToolKit;
  var form = document.getElementById("rebForm");
  if (!form) return;

  var textInput = document.getElementById("rebText");
  var result = document.getElementById("rebResult");
  var steps = document.getElementById("rebSteps");
  var copyBtn = document.getElementById("rebCopy");
  var lastSequence = [];

  var COMMON_STARTERS = { "The": 1, "This": 1, "We": 1, "You": 1, "Our": 1, "It": 1, "I": 1, "A": 1, "An": 1 };

  function findTopic(text) {
    var counts = {};
    (text.match(/\b[A-Z][a-zA-Z]{2,}\b/g) || []).forEach(function (w) {
      if (COMMON_STARTERS[w]) return;
      counts[w] = (counts[w] || 0) + 1;
    });
    var best = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0];
    return best || "it";
  }

  function firstSentence(text) {
    var m = /^[\s\S]{1,220}?[.!?](?:\s|$)/.exec(text.trim());
    return (m ? m[0] : text.trim()).trim();
  }

  function build(text) {
    var topic = findTopic(text);
    var hook = firstSentence(text);
    return [
      {
        day: "Day 1",
        subject: "Still thinking about " + topic + "?",
        angle: "Friendly reminder of the value — reference: \"" + hook + "\"",
      },
      {
        day: "Day 4",
        subject: "A little something for you",
        angle: "Offer an incentive (discount, extended trial, bonus feature) tied to " + topic + ".",
      },
      {
        day: "Day 8",
        subject: "Should we close your account?",
        angle: "Last-chance email with a clear deadline — give a real reason to act now, not just urgency for its own sake.",
      },
    ];
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var text = textInput.value.trim();
    if (!text) return;
    lastSequence = build(text);
    steps.innerHTML = lastSequence
      .map(function (email, i) {
        return (
          '<div class="tk-step"><span class="tk-step-index">' +
          (i + 1) +
          "</span><h3>" +
          tk.esc(email.day) +
          " — " +
          tk.esc(email.subject) +
          "</h3><p>" +
          tk.esc(email.angle) +
          "</p></div>"
        );
      })
      .join("");
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  copyBtn.addEventListener("click", function () {
    var text = lastSequence.map(function (e) { return e.day + ": " + e.subject + "\n" + e.angle; }).join("\n\n");
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      function () {
        copyBtn.textContent = "Copied";
        setTimeout(function () {
          copyBtn.textContent = "Copy sequence";
        }, 1600);
      },
      function () {},
    );
  });
})();
