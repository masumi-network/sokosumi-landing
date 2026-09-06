/* /tools/case-study-outline — client-only. Nothing leaves the browser: the
 * outline is built by classifying the pasted story's own sentences.
 */
(function () {
  "use strict";
  var tk = window.SokosumiToolKit;
  var form = document.getElementById("csoForm");
  if (!form) return;

  var textInput = document.getElementById("csoText");
  var result = document.getElementById("csoResult");
  var steps = document.getElementById("csoSteps");
  var copyBtn = document.getElementById("csoCopy");
  var lastOutline = [];

  var PROBLEM = /\b(struggled?|challenge|before|pain point|frustrat\w*|manual(ly)?|took (hours|days|weeks)|couldn'?t|difficult)\b/i;
  var SOLUTION = /\b(implement\w*|switch\w* to|adopt\w*|start\w* using|after (implementing|switching|adopting)|rolled out|began using)\b/i;
  var RESULT = /\d|%|percent|increas\w*|decreas\w*|reduc\w*|sav\w*|grew|grow\w*|doubled|tripled/i;
  var QUOTE = /"([^"]{10,300})"/;

  function sentences(text) {
    return text.split(/(?<=[.!?])\s+/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function build(text) {
    var sents = sentences(text);
    var challenge = sents.filter(function (s) { return PROBLEM.test(s); });
    var solution = sents.filter(function (s) { return SOLUTION.test(s); });
    var results = sents.filter(function (s) { return RESULT.test(s) && !SOLUTION.test(s); });
    var quoteMatch = QUOTE.exec(text);

    var outline = [];
    outline.push({ heading: "Context / who they are", body: sents[0] || "Add a sentence introducing the customer and their situation." });
    outline.push({ heading: "The challenge", body: challenge.length ? challenge.join(" ") : "No clear problem-shaped sentence found — add one describing what was hard before." });
    outline.push({ heading: "The solution", body: solution.length ? solution.join(" ") : "No clear solution-shaped sentence found — add one describing what changed." });
    outline.push({ heading: "The results", body: results.length ? results.join(" ") : "No clear result-shaped sentence found — add a number or outcome." });
    outline.push({ heading: "Pull quote", body: quoteMatch ? quoteMatch[1] : "No quote found in the pasted text — add one from the customer." });
    return outline;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var text = textInput.value.trim();
    if (!text) return;
    lastOutline = build(text);
    steps.innerHTML = lastOutline
      .map(function (item, i) {
        return (
          '<div class="tk-step"><span class="tk-step-index">' +
          (i + 1) +
          "</span><h3>" +
          tk.esc(item.heading) +
          "</h3><p>" +
          tk.esc(item.body) +
          "</p></div>"
        );
      })
      .join("");
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  copyBtn.addEventListener("click", function () {
    var text = lastOutline.map(function (item) { return item.heading + "\n" + item.body; }).join("\n\n");
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      function () {
        copyBtn.textContent = "Copied";
        setTimeout(function () {
          copyBtn.textContent = "Copy outline";
        }, 1600);
      },
      function () {},
    );
  });
})();
