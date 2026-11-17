/* /tools/re-engagement-builder: client-only. Nothing leaves the browser.
 * Builds a 3-email win-back sequence tailored to the audience (subscribers,
 * customers, or event guests) around the main topic found in the pasted email.
 */
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

  // Capitalised words that are never the topic: pronouns/articles, greetings,
  // and calendar words. Months in particular used to win ("Still thinking about
  // Nov?") because a date line capitalises them.
  var EXCLUDE = {};
  ("The This That These Those We You Your Our Us They It Its I A An And Or But If So As At By In On For With To Of From Up Hi Hey Hello Dear Meet " +
    "January February March April May June July August September October November December " +
    "Jan Feb Mar Apr Jun Jul Aug Sep Sept Oct Nov Dec " +
    "Monday Tuesday Wednesday Thursday Friday Saturday Sunday Mon Tue Wed Thu Fri Sat Sun")
    .split(" ")
    .forEach(function (w) {
      EXCLUDE[w] = 1;
    });

  // Most frequent capitalised word that isn't excluded; ties break toward the
  // longer word, so a real subject beats a short abbreviation. "" if none.
  function findTopic(text) {
    var counts = {};
    (text.match(/\b[A-Z][a-zA-Z]{2,}\b/g) || []).forEach(function (w) {
      if (EXCLUDE[w]) return;
      counts[w] = (counts[w] || 0) + 1;
    });
    var keys = Object.keys(counts);
    if (!keys.length) return "";
    keys.sort(function (a, b) {
      return counts[b] - counts[a] || b.length - a.length;
    });
    return keys[0];
  }

  // Audience-specific sequences. Each handles an empty topic gracefully so the
  // subject never reads "Still thinking about ?" when nothing was detected.
  function sequenceFor(audience, topic) {
    var t = topic || "";
    if (audience === "subscribers") {
      return [
        { day: "Day 1", subject: t ? "Still want our updates on " + t + "?" : "Still want to hear from us?", angle: "Friendly check-in. Remind them what they subscribed for" + (t ? " and why " + t + " is worth their inbox." : " and the value it brings.") },
        { day: "Day 4", subject: "A better reason to stay subscribed", angle: "Give something concrete: a best-of, a guide, or subscriber-only content" + (t ? " on " + t + "." : ".") },
        { day: "Day 8", subject: "Last email, unless you say otherwise", angle: "Ask them to confirm they still want your emails, or you'll ease off. For a newsletter, re-confirm interest: don't threaten to close anything." },
      ];
    }
    if (audience === "guests") {
      return [
        { day: "Day 1", subject: t ? "Thanks for joining " + t : "Thanks for joining us", angle: "Follow up on the event: recap one highlight and point to a clear next step." },
        { day: "Day 4", subject: t ? "The part of " + t + " worth revisiting" : "The part worth revisiting", angle: "Share the recording, slides, or a key takeaway to re-spark interest." },
        { day: "Day 8", subject: "One last invitation", angle: "Final nudge with a deadline: book a demo, register for the next session, or claim an attendee-only offer." },
      ];
    }
    // customers (default): an account/product relationship
    return [
      { day: "Day 1", subject: t ? "Still thinking about " + t + "?" : "Still thinking it over?", angle: "Friendly reminder of the value they signed up for. No pressure." },
      { day: "Day 4", subject: "A little something to come back to", angle: "Offer an incentive (discount, extended trial, bonus feature)" + (t ? " tied to " + t + "." : ".") },
      { day: "Day 8", subject: "Should we close your account?", angle: "Last-chance email with a clear deadline: give a real reason to act now, not just urgency for its own sake." },
    ];
  }

  function currentAudience() {
    var r = form.querySelector('input[name="rebAudience"]:checked');
    return r ? r.value : "subscribers";
  }

  function render() {
    steps.innerHTML = lastSequence
      .map(function (email, i) {
        return (
          '<div class="tk-step"><span class="tk-step-index">' +
          (i + 1) +
          "</span><h3>" +
          tk.esc(email.day) +
          ": " +
          tk.esc(email.subject) +
          "</h3><p>" +
          tk.esc(email.angle) +
          "</p></div>"
        );
      })
      .join("");
  }

  function build() {
    var text = textInput.value.trim();
    if (!text) return false;
    lastSequence = sequenceFor(currentAudience(), findTopic(text));
    render();
    return true;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!build()) return;
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Re-tailor live when the audience changes, but only once there's a result.
  form.addEventListener("change", function (event) {
    if (event.target && event.target.name === "rebAudience" && !result.hidden) build();
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
