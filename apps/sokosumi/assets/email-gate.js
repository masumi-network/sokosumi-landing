// Email gate for the free tools. Running a tool (submitting its form, or
// copying/downloading on an analysis page) requires an email address the
// first time: the action is intercepted, the dialog asks for the email,
// and on success the original action is replayed. Subscribing is stored in
// localStorage, so a visitor is only ever asked once — after that every
// tool works directly. Doubling as a spam brake: anonymous drive-by runs
// don't happen any more.
//
// Listeners sit on document in the CAPTURE phase so they run before the
// tool scripts' own handlers on the same elements, whatever the script
// order — stopPropagation there keeps the tool from starting.
(function () {
  var DONE_KEY = "soko-tool-email";
  var CONSENT = "By submitting, you agree to receive marketing emails from Sokosumi. Unsubscribe anytime.";

  // form id → tool name reported to the API
  var FORMS = {
    designMdForm: "design-md",
    seoMdForm: "seo-md",
    ogcForm: "og-checker",
    ltForm: "llms-txt",
    calcForm: "calculators",
    calcBreakevenForm: "calculators",
    aivForm: "ai-visibility",
    mtgForm: "meta-tags",
  };
  // click targets on pages where the tool has no form to intercept
  var BUTTONS = {
    designMdDownload: "design-md",
    designMdCopy: "design-md",
    lifCopy: "linkedin-formatter",
  };

  function subscribed() {
    try { return localStorage.getItem(DONE_KEY) === "done"; } catch (e) { return false; }
  }
  function remember() {
    try { localStorage.setItem(DONE_KEY, "done"); } catch (e) {}
  }

  var open = false;

  // The action that was intercepted, replayed after a successful submit.
  function resume(pending) {
    if (!pending) return;
    if (pending.form) pending.form.requestSubmit ? pending.form.requestSubmit() : pending.form.submit();
    else if (pending.button) pending.button.click();
  }

  function show(tool, pending) {
    if (open) return;
    open = true;

    var overlay = document.createElement("div");
    overlay.className = "eg-overlay";
    overlay.innerHTML =
      '<div class="eg-card" role="dialog" aria-modal="true" aria-labelledby="egTitle">' +
      '<h2 id="egTitle">Enter your email to use the free tools</h2>' +
      "<p>You only do this once. We’ll send you new free tools and product updates from Sokosumi.</p>" +
      '<form class="eg-form" novalidate>' +
      '<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" class="eg-hp">' +
      '<div class="eg-row">' +
      '<label class="sr-only" for="egEmail">Email address</label>' +
      '<input type="email" id="egEmail" name="email" placeholder="you@company.com" autocomplete="email" required>' +
      '<button type="submit" class="btn btn-primary">Continue</button>' +
      "</div>" +
      '<p class="eg-error" hidden></p>' +
      "<p class=\"eg-consent\">" + CONSENT + "</p>" +
      "</form>" +
      "</div>";

    document.body.appendChild(overlay);

    var form = overlay.querySelector(".eg-form");
    var email = overlay.querySelector("#egEmail");
    var error = overlay.querySelector(".eg-error");
    var card = overlay.querySelector(".eg-card");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      error.hidden = true;
      var value = email.value.trim();
      if (!value || value.indexOf("@") < 1) {
        error.textContent = "Please add a valid email address.";
        error.hidden = false;
        return;
      }
      var button = form.querySelector("button[type=submit]");
      button.disabled = true;
      fetch("/api/tool-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: value,
          tool: tool,
          path: location.pathname,
          locale: document.documentElement.lang === "de" ? "de" : "en",
          website: form.elements.website.value,
        }),
      })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (out) {
          if (!out.ok) throw new Error(out.data.error || "That did not work. Try again.");
          remember();
          card.innerHTML = '<h2>Thanks — you’re in.</h2>';
          setTimeout(function () {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            open = false;
            resume(pending);
          }, 900);
        })
        .catch(function (err) {
          button.disabled = false;
          error.textContent = err.message || "That did not work. Try again.";
          error.hidden = false;
        });
    });

    email.focus();
  }

  document.addEventListener(
    "submit",
    function (e) {
      var tool = e.target && e.target.id && FORMS[e.target.id];
      if (!tool || subscribed()) return;
      e.preventDefault();
      e.stopPropagation();
      show(tool, { form: e.target });
    },
    true
  );

  document.addEventListener(
    "click",
    function (e) {
      var el = e.target && e.target.closest ? e.target.closest("button[id]") : null;
      var tool = el && BUTTONS[el.id];
      if (!tool || subscribed()) return;
      e.preventDefault();
      e.stopPropagation();
      show(tool, { button: el });
    },
    true
  );
})();
