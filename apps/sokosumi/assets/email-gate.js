// Email popup for the free tools. The first time a visitor actually runs a
// tool (submits its form, or copies/downloads on an analysis page), a small
// dialog asks for their email for marketing updates. Submitting stores the
// address via /api/tool-email; declining is remembered for the session,
// subscribing forever. The tool itself is never blocked — it keeps running
// underneath.
(function () {
  var DONE_KEY = "soko-tool-email";
  var SKIP_KEY = "soko-tool-email-skip";
  var CONSENT = "By submitting, you agree to receive marketing emails from Sokosumi. Unsubscribe anytime.";

  // form id → tool name reported to the API
  var FORMS = [
    ["designMdForm", "design-md"],
    ["seoMdForm", "seo-md"],
    ["ogcForm", "og-checker"],
    ["ltForm", "llms-txt"],
  ];
  // click targets on the analysis pages, where there is no form
  var BUTTONS = [
    ["designMdDownload", "design-md"],
    ["designMdCopy", "design-md"],
  ];

  function storageGet(store, key) {
    try { return store.getItem(key); } catch (e) { return null; }
  }
  function storageSet(store, key, value) {
    try { store.setItem(key, value); } catch (e) {}
  }

  function seen() {
    return storageGet(localStorage, DONE_KEY) === "done" || storageGet(sessionStorage, SKIP_KEY) === "1";
  }

  var open = false;
  var lastFocus = null;

  function close(overlay) {
    if (!overlay.parentNode) return;
    overlay.parentNode.removeChild(overlay);
    open = false;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function show(tool) {
    if (open || seen()) return;
    open = true;
    lastFocus = document.activeElement;

    var overlay = document.createElement("div");
    overlay.className = "eg-overlay";
    overlay.innerHTML =
      '<div class="eg-card" role="dialog" aria-modal="true" aria-labelledby="egTitle">' +
      '<h2 id="egTitle">Enjoying the free tools?</h2>' +
      "<p>Leave your email and we’ll send you new free tools and product updates from Sokosumi.</p>" +
      '<form class="eg-form" novalidate>' +
      '<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" class="eg-hp">' +
      '<div class="eg-row">' +
      '<label class="sr-only" for="egEmail">Email address</label>' +
      '<input type="email" id="egEmail" name="email" placeholder="you@company.com" autocomplete="email" required>' +
      '<button type="submit" class="btn btn-primary">Send me updates</button>' +
      "</div>" +
      '<p class="eg-error" hidden></p>' +
      "<p class=\"eg-consent\">" + CONSENT + "</p>" +
      "</form>" +
      '<button type="button" class="eg-skip">No thanks</button>' +
      "</div>";

    document.body.appendChild(overlay);

    var form = overlay.querySelector(".eg-form");
    var email = overlay.querySelector("#egEmail");
    var error = overlay.querySelector(".eg-error");
    var card = overlay.querySelector(".eg-card");

    function skip() {
      storageSet(sessionStorage, SKIP_KEY, "1");
      close(overlay);
    }

    overlay.addEventListener("click", function (e) {
      if (!card.contains(e.target)) skip();
    });
    overlay.querySelector(".eg-skip").addEventListener("click", skip);
    document.addEventListener("keydown", function onKey(e) {
      if (e.key === "Escape" && overlay.parentNode) {
        document.removeEventListener("keydown", onKey);
        skip();
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
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
          storageSet(localStorage, DONE_KEY, "done");
          card.innerHTML = '<h2>Thanks — you’re on the list.</h2>';
          setTimeout(function () { close(overlay); }, 1200);
        })
        .catch(function (err) {
          button.disabled = false;
          error.textContent = err.message || "That did not work. Try again.";
          error.hidden = false;
        });
    });

    email.focus();
  }

  // Let the click's own effect land first (progress bar, copied state) so
  // the dialog reads as an aside, not as the tool's response.
  function trigger(tool) {
    if (seen()) return;
    setTimeout(function () { show(tool); }, 600);
  }

  FORMS.forEach(function (pair) {
    var form = document.getElementById(pair[0]);
    if (form) form.addEventListener("submit", function () { trigger(pair[1]); });
  });
  BUTTONS.forEach(function (pair) {
    var el = document.getElementById(pair[0]);
    if (el) el.addEventListener("click", function () { trigger(pair[1]); });
  });
})();
