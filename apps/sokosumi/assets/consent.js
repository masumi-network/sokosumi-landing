// Sokosumi cookie banner + Google Consent Mode bridge (marketing site).
//
// The <head> snippet in templates/shell.js already set Consent Mode to its
// denied-by-default state and re-applied any stored choice. This file draws
// the banner, records the visitor's choice, and flips Consent Mode when they
// choose. Nothing here loads a third-party service — it is ~150 lines of
// vanilla JS, no dependencies.
//
// The choice is stored in one cookie, `sokosumi_consent`, scoped to
// `.sokosumi.com` so a single decision covers both this site and
// app.sokosumi.com. The app ships an identical cookie contract (apps/web) —
// keep the shape below in sync with it.
(function () {
  "use strict";

  var COOKIE = "sokosumi_consent";
  var VERSION = 1;
  var MAX_AGE = 60 * 60 * 24 * 182; // ~6 months, then we ask again

  // Categories. `necessary` is always on and cannot be switched off; the other
  // two map onto Consent Mode signals.
  var CATEGORIES = [
    {
      key: "necessary",
      title: "Strictly necessary",
      body: "Required for the site to work — security, and remembering this choice. Always on.",
      locked: true,
    },
    {
      key: "analytics",
      title: "Analytics",
      body: "Anonymous usage measurement (Google Analytics) so we can see which pages help and which do not.",
    },
    {
      key: "marketing",
      title: "Marketing",
      body: "Lets us measure ad campaigns and reach people who might find Sokosumi useful.",
    },
  ];

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  // --- cookie storage -----------------------------------------------------
  function cookieDomain() {
    // Share one decision across sokosumi.com + app.sokosumi.com. On any other
    // host (localhost, a Railway preview) fall back to a host-only cookie.
    var h = location.hostname;
    return /(^|\.)sokosumi\.com$/.test(h) ? "; domain=.sokosumi.com" : "";
  }

  function read() {
    var m = document.cookie.match(/(?:^|; )sokosumi_consent=([^;]+)/);
    if (!m) return null;
    try {
      return JSON.parse(decodeURIComponent(m[1]));
    } catch (e) {
      return null;
    }
  }

  function write(choice) {
    var value = {
      necessary: true,
      analytics: !!choice.analytics,
      marketing: !!choice.marketing,
      ts: Date.now(),
      v: VERSION,
    };
    document.cookie =
      COOKIE +
      "=" +
      encodeURIComponent(JSON.stringify(value)) +
      "; Max-Age=" +
      MAX_AGE +
      "; Path=/; SameSite=Lax" +
      cookieDomain();
    return value;
  }

  // --- apply a decision to Consent Mode + GTM -----------------------------
  function apply(choice) {
    gtag("consent", "update", {
      analytics_storage: choice.analytics ? "granted" : "denied",
      ad_storage: choice.marketing ? "granted" : "denied",
      ad_user_data: choice.marketing ? "granted" : "denied",
      ad_personalization: choice.marketing ? "granted" : "denied",
    });
    // A plain-language event GTM/GA can key off, and a signal any listening
    // tag can use to (re)fire now that consent exists.
    window.dataLayer.push({
      event: "consent_update",
      consent_analytics: choice.analytics ? "granted" : "denied",
      consent_marketing: choice.marketing ? "granted" : "denied",
    });
  }

  function decide(choice) {
    var stored = write(choice);
    apply(stored);
    close();
  }

  // --- UI -----------------------------------------------------------------
  var root = null;

  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs)
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") el.className = attrs[k];
        else if (k === "html") el.innerHTML = attrs[k];
        else el.setAttribute(k, attrs[k]);
      });
    (kids || []).forEach(function (kid) {
      el.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
    });
    return el;
  }

  function close() {
    if (root) {
      root.remove();
      root = null;
    }
  }

  function render(expanded) {
    close();
    var stored = read() || { analytics: false, marketing: false };

    var toggles = {};
    var detail = h(
      "div",
      { class: "cc-detail", hidden: expanded ? null : "" },
      CATEGORIES.map(function (c) {
        var input = h("input", {
          type: "checkbox",
          id: "cc-" + c.key,
        });
        input.checked = c.locked ? true : !!stored[c.key];
        if (c.locked) input.disabled = true;
        toggles[c.key] = input;
        return h("label", { class: "cc-row" }, [
          input,
          h("span", {}, [
            h("strong", {}, [c.title]),
            h("small", {}, [c.body]),
          ]),
        ]);
      }),
    );

    function collect() {
      return { analytics: toggles.analytics.checked, marketing: toggles.marketing.checked };
    }

    var acceptAll = h("button", { class: "btn btn-primary btn-sm", type: "button" }, ["Accept all"]);
    acceptAll.onclick = function () {
      decide({ analytics: true, marketing: true });
    };
    var rejectAll = h("button", { class: "btn btn-outline btn-sm", type: "button" }, ["Reject non-essential"]);
    rejectAll.onclick = function () {
      decide({ analytics: false, marketing: false });
    };
    var manage = h("button", { class: "cc-link", type: "button" }, ["Manage preferences"]);
    manage.onclick = function () {
      render(true);
    };
    var save = h("button", { class: "btn btn-outline btn-sm", type: "button" }, ["Save choices"]);
    save.onclick = function () {
      decide(collect());
    };

    var actions = expanded
      ? [acceptAll, rejectAll, save]
      : [acceptAll, rejectAll, manage];

    root = h("div", { class: "cc-banner", role: "dialog", "aria-label": "Cookie choices", "aria-live": "polite" }, [
      h("div", { class: "cc-inner" }, [
        h("div", { class: "cc-copy" }, [
          h("strong", {}, ["We use cookies"]),
          h("p", {}, [
            "Necessary cookies keep the site working. With your OK we also use analytics and marketing cookies to improve Sokosumi. See our ",
          ]),
        ]),
        detail,
        h("div", { class: "cc-actions" }, actions),
      ]),
    ]);
    // link into the copy paragraph
    var p = root.querySelector(".cc-copy p");
    var a = h("a", { href: "/legal/cookie-policy" }, ["Cookie Policy"]);
    p.appendChild(a);
    p.appendChild(document.createTextNode("."));

    document.body.appendChild(root);
  }

  // --- public API + boot --------------------------------------------------
  window.SokosumiConsent = {
    open: function () {
      render(true);
    },
    get: read,
  };

  // Any element with data-cc-open (e.g. a footer "Cookie settings" link)
  // reopens the preferences panel.
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-cc-open]");
    if (t) {
      e.preventDefault();
      render(true);
    }
  });

  // Show the banner on the first visit (no stored decision).
  if (!read()) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        render(false);
      });
    } else {
      render(false);
    }
  }
})();
