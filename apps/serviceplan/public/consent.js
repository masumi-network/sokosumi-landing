// Serviceplan-Agents cookie banner + Google Consent Mode bridge.
//
// Port of the Sokosumi banner (apps/sokosumi/assets/consent.js): the RootShell
// <head> snippet sets Consent Mode to denied-by-default and re-applies any
// stored choice before GTM boots. This file draws the banner, records the
// visitor's choice, and flips Consent Mode when they decide. Vanilla JS, no
// dependencies. The GTM container requires ad_storage consent on every Meta
// tag; the base pixel additionally fires on the `consent_decision` event so
// the landing pageview is recorded after a late acceptance.
(function () {
  "use strict";

  var COOKIE = "spa_consent";
  var VERSION = 1;
  var MAX_AGE = 60 * 60 * 24 * 182; // ~6 months, then we ask again

  // Per Pfad statt <html lang>: das lang-Attribut wird clientseitig von der
  // Hydration überschrieben; der /de-Prefix ist die verlässliche Quelle.
  var DE =
    location.pathname === "/de" || location.pathname.indexOf("/de/") === 0;
  function tr(en, de) {
    return DE ? de : en;
  }

  var CATEGORIES = [
    {
      key: "necessary",
      title: tr("Strictly necessary", "Unbedingt erforderlich"),
      body: tr(
        "Required for the site to work — security, and remembering this choice. Always on.",
        "Nötig, damit die Website funktioniert – Sicherheit und das Speichern dieser Auswahl. Immer aktiv."
      ),
      locked: true,
    },
    {
      key: "analytics",
      title: tr("Analytics", "Analyse"),
      body: tr(
        "Usage measurement with Google Analytics, using a pseudonymous ID so we can see which pages help and which do not.",
        "Nutzungsmessung mit Google Analytics über eine pseudonyme ID, damit wir sehen, welche Seiten helfen und welche nicht."
      ),
    },
    {
      key: "marketing",
      title: tr("Marketing", "Marketing"),
      body: tr(
        "Lets us measure ad campaigns and reach people who might find Serviceplan Agents useful.",
        "Erlaubt uns, Werbekampagnen zu messen und Menschen zu erreichen, für die Serviceplan Agents nützlich sein könnte."
      ),
    },
  ];

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  // --- cookie storage -----------------------------------------------------
  function cookieDomain() {
    var h = location.hostname;
    return /(^|\.)serviceplan-agents\.com$/.test(h)
      ? "; domain=.serviceplan-agents.com"
      : "";
  }

  function read() {
    var m = document.cookie.match(/(?:^|; )spa_consent=([^;]+)/);
    if (!m) return null;
    try {
      var parsed = JSON.parse(decodeURIComponent(m[1]));
      if (parsed.v !== VERSION) return null;
      return parsed;
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
      cookieDomain() +
      (location.protocol === "https:" ? "; Secure" : "");
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
    // Fired exactly once per active decision. The GTM container uses it to
    // fire the Meta base pixel after a late acceptance (the All-Pages firing
    // was blocked while ad_storage was still denied).
    window.dataLayer.push({
      event: "consent_decision",
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
      expanded ? { class: "cc-detail" } : { class: "cc-detail", hidden: "" },
      CATEGORIES.map(function (c) {
        var input = h("input", { type: "checkbox", id: "cc-" + c.key });
        input.checked = c.locked ? true : !!stored[c.key];
        if (c.locked) input.disabled = true;
        toggles[c.key] = input;
        return h("label", { class: "cc-row" }, [
          input,
          h("span", {}, [h("strong", {}, [c.title]), h("small", {}, [c.body])]),
        ]);
      })
    );

    function collect() {
      return {
        analytics: toggles.analytics.checked,
        marketing: toggles.marketing.checked,
      };
    }

    var acceptAll = h("button", { class: "cc-btn cc-btn-red", type: "button" }, [
      tr("Accept all", "Alle akzeptieren"),
    ]);
    acceptAll.onclick = function () {
      decide({ analytics: true, marketing: true });
    };
    var rejectAll = h("button", { class: "cc-btn cc-btn-outline", type: "button" }, [
      tr("Reject non-essential", "Nur notwendige"),
    ]);
    rejectAll.onclick = function () {
      decide({ analytics: false, marketing: false });
    };
    var manage = h("button", { class: "cc-link", type: "button" }, [
      tr("Manage preferences", "Einstellungen anpassen"),
    ]);
    manage.onclick = function () {
      render(true);
    };
    var save = h("button", { class: "cc-btn cc-btn-outline", type: "button" }, [
      tr("Save choices", "Auswahl speichern"),
    ]);
    save.onclick = function () {
      decide(collect());
    };

    var actions = expanded ? [acceptAll, rejectAll, save] : [acceptAll, rejectAll, manage];

    root = h(
      "div",
      {
        class: "cc-banner",
        role: "dialog",
        "aria-label": tr("Cookie choices", "Cookie-Auswahl"),
        "aria-live": "polite",
      },
      [
        h("div", { class: "cc-inner" }, [
          h("div", { class: "cc-copy" }, [
            h("strong", {}, [tr("We use cookies", "Wir verwenden Cookies")]),
            h("p", {}, [
              tr(
                "Necessary cookies keep the site working. With your OK we also use analytics and marketing cookies to improve Serviceplan Agents. See our ",
                "Notwendige Cookies halten die Website am Laufen. Mit Ihrem OK nutzen wir zusätzlich Analyse- und Marketing-Cookies, um Serviceplan Agents zu verbessern. Mehr in unserer "
              ),
            ]),
          ]),
          detail,
          h("div", { class: "cc-actions" }, actions),
        ]),
      ]
    );
    var p = root.querySelector(".cc-copy p");
    var a = h(
      "a",
      {
        href: "https://www.sokosumi.com/cookie-policy",
        target: "_blank",
        rel: "noopener",
      },
      [tr("Cookie Policy", "Cookie-Richtlinie")]
    );
    p.appendChild(a);
    p.appendChild(document.createTextNode("."));

    document.body.appendChild(root);
  }

  // Self-contained styles, injected once (same pattern as the Sokosumi
  // banner), in the site's design language: Avenir, brand red, flat buttons.
  function injectStyles() {
    if (document.getElementById("cc-styles")) return;
    var css =
      ".cc-banner{position:fixed;left:0;right:0;bottom:0;z-index:1000;display:flex;justify-content:center;padding:clamp(12px,2vw,20px);font-family:'Avenir normal',Arial,sans-serif;animation:cc-rise .32s ease both;}" +
      "@keyframes cc-rise{from{transform:translateY(16px);opacity:0;}to{transform:none;opacity:1;}}" +
      "@media (prefers-reduced-motion:reduce){.cc-banner{animation:none;}}" +
      ".cc-inner{width:100%;max-width:680px;background:#fff;border:1px solid #dbdbdb;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.16);padding:clamp(16px,2.4vw,22px);display:flex;flex-direction:column;gap:14px;color:#000;}" +
      ".cc-copy strong{display:block;font-size:15px;font-family:AvenirLTProMedium,Arial,sans-serif;margin-bottom:4px;}" +
      ".cc-copy p{font-size:13.5px;line-height:1.6;color:#565656;margin:0;}" +
      ".cc-copy a{color:#000;text-decoration:underline;}" +
      ".cc-detail{display:flex;flex-direction:column;gap:12px;padding-top:2px;}" +
      ".cc-detail[hidden]{display:none;}" +
      ".cc-row{display:grid;grid-template-columns:20px 1fr;gap:12px;align-items:start;cursor:pointer;}" +
      ".cc-row input{margin-top:3px;accent-color:#ff4b4f;width:16px;height:16px;}" +
      ".cc-row input:disabled{opacity:.5;cursor:not-allowed;}" +
      ".cc-row strong{display:block;font-size:13.5px;font-family:AvenirLTProMedium,Arial,sans-serif;}" +
      ".cc-row small{display:block;font-size:12.5px;line-height:1.55;color:#565656;margin-top:2px;}" +
      ".cc-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center;}" +
      ".cc-btn{font-family:AvenirLTProMedium,Arial,sans-serif;font-size:14px;line-height:1;padding:12px 18px;border:0;border-radius:0;cursor:pointer;}" +
      ".cc-btn-red{background:#ff4b4f;color:#fff;}" +
      ".cc-btn-red:hover{opacity:.88;}" +
      ".cc-btn-outline{background:#fff;color:#000;border:1px solid #000;}" +
      ".cc-btn-outline:hover{background:#f5f5f5;}" +
      ".cc-link{background:none;border:0;padding:6px 4px;font:inherit;font-size:13px;color:#565656;text-decoration:underline;cursor:pointer;margin-left:auto;}" +
      ".cc-link:hover{color:#000;}" +
      "@media (max-width:560px){.cc-actions .cc-btn{flex:1;}.cc-link{margin-left:0;width:100%;text-align:center;}}";
    var s = document.createElement("style");
    s.id = "cc-styles";
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }
  injectStyles();

  // --- public API + boot --------------------------------------------------
  window.ServiceplanConsent = {
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
