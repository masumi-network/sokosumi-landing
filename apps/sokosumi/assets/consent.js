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

  // The banner follows the page language. German pages set <html lang="de">;
  // everything else gets English.
  var DE = document.documentElement.lang === "de";
  function tr(en, de) {
    return DE ? de : en;
  }

  // Categories. `necessary` is always on and cannot be switched off; the other
  // two map onto Consent Mode signals.
  var CATEGORIES = [
    {
      key: "necessary",
      title: tr("Strictly necessary", "Unbedingt erforderlich"),
      body: tr("Required for the site to work — security, and remembering this choice. Always on.", "Nötig, damit die Website funktioniert – Sicherheit und das Speichern dieser Auswahl. Immer aktiv."),
      locked: true,
    },
    {
      key: "analytics",
      title: tr("Analytics", "Analyse"),
      // Not "anonymous": Google Analytics sets a persistent identifier, so the
      // measurement is pseudonymous. The app says the same thing about its
      // signed-in User-ID — keep the two claims consistent.
      body: tr("Usage measurement with Google Analytics, using a pseudonymous ID so we can see which pages help and which do not.", "Nutzungsmessung mit Google Analytics über eine pseudonyme ID, damit wir sehen, welche Seiten helfen und welche nicht."),
    },
    {
      key: "marketing",
      title: tr("Marketing", "Marketing"),
      body: tr("Lets us measure ad campaigns and reach people who might find Sokosumi useful.", "Erlaubt uns, Werbekampagnen zu messen und Menschen zu erreichen, für die Sokosumi nützlich sein könnte."),
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
      var parsed = JSON.parse(decodeURIComponent(m[1]));
      // A choice recorded against an older schema is not a choice about the
      // current categories — ask again. Mirrors readConsent() in the app
      // (apps/web/src/lib/analytics/consent.ts); the two must agree because
      // they read the same .sokosumi.com cookie.
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
      // Without Secure, a plain-HTTP response on the same domain could
      // overwrite this with granted values and switch tracking on.
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
    // The GTM container gates every conversion tag behind a `consent_status`
    // event (its trigger groups require it). Fire it now that the visitor has
    // chosen, so the tags they consented to can fire. Native Consent Mode
    // (the gtag update above) still enforces per-category granularity.
    window.dataLayer.push({
      event: "consent_status",
      consent_analytics: choice.analytics ? "granted" : "denied",
      consent_marketing: choice.marketing ? "granted" : "denied",
    });
    // A SECOND event, fired only from here. `consent_status` is ALSO pushed by
    // the <head> snippet on every load that finds a stored cookie, so a GTM
    // trigger on that would fire the GA4 tag twice for every returning visitor.
    // `consent_decision` comes only from apply(), and apply() is only reached
    // from decide(), which is only reached from the three banner buttons — so
    // it means "the visitor just chose", exactly once per decision.
    //
    // GTM fires the GA4 configuration tag on this. Without it the landing
    // pageview of every session is lost: Consent Mode blocks the tag at
    // gtm.init (wait_for_update is 500ms; nobody reads a banner that fast) and
    // GTM never retries — measured still zero 30 seconds after accepting. A
    // visitor who landed, accepted and left was recorded as nothing at all.
    // Consent Mode still enforces the categories, so someone who rejects fires
    // this event and GA4 still sends nothing.
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

    var acceptAll = h("button", { class: "btn btn-primary btn-sm", type: "button" }, [tr("Accept all", "Alle akzeptieren")]);
    acceptAll.onclick = function () {
      decide({ analytics: true, marketing: true });
    };
    var rejectAll = h("button", { class: "btn btn-outline btn-sm", type: "button" }, [tr("Reject non-essential", "Nur notwendige")]);
    rejectAll.onclick = function () {
      decide({ analytics: false, marketing: false });
    };
    var manage = h("button", { class: "cc-link", type: "button" }, [tr("Manage preferences", "Einstellungen anpassen")]);
    manage.onclick = function () {
      render(true);
    };
    var save = h("button", { class: "btn btn-outline btn-sm", type: "button" }, [tr("Save choices", "Auswahl speichern")]);
    save.onclick = function () {
      decide(collect());
    };

    var actions = expanded
      ? [acceptAll, rejectAll, save]
      : [acceptAll, rejectAll, manage];

    root = h("div", { class: "cc-banner", role: "dialog", "aria-label": tr("Cookie choices", "Cookie-Auswahl"), "aria-live": "polite" }, [
      h("div", { class: "cc-inner" }, [
        h("div", { class: "cc-copy" }, [
          h("strong", {}, [tr("We use cookies", "Wir verwenden Cookies")]),
          h("p", {}, [
            tr("Necessary cookies keep the site working. With your OK we also use analytics and marketing cookies to improve Sokosumi. See our ", "Notwendige Cookies halten die Website am Laufen. Mit Ihrem OK nutzen wir zusätzlich Analyse- und Marketing-Cookies, um Sokosumi zu verbessern. Mehr in unserer "),
          ]),
        ]),
        detail,
        h("div", { class: "cc-actions" }, actions),
      ]),
    ]);
    // link into the copy paragraph
    var p = root.querySelector(".cc-copy p");
    var a = h("a", { href: "/legal/cookie-policy" }, [tr("Cookie Policy", "Cookie-Richtlinie")]);
    p.appendChild(a);
    p.appendChild(document.createTextNode("."));

    document.body.appendChild(root);
  }

  // The banner's own styles, injected once. They travel with this file so
  // a surface that forgets to load styles.css cannot leave the banner
  // unstyled (that is how it used to render on the homepage). Fallbacks
  // on every var are belt-and-braces; both surfaces now load styles.css.
  function injectStyles() {
    if (document.getElementById("cc-styles")) return;
    var css =
      ".cc-banner{position:fixed;left:0;right:0;bottom:0;z-index:1000;display:flex;justify-content:center;padding:clamp(12px,2vw,20px);animation:cc-rise .32s var(--ease,ease) both;}" +
      "@keyframes cc-rise{from{transform:translateY(16px);opacity:0;}to{transform:none;opacity:1;}}" +
      "@media (prefers-reduced-motion:reduce){.cc-banner{animation:none;}}" +
      ".cc-inner{width:100%;max-width:680px;background:var(--card,#fff);border:1px solid var(--border,rgba(15,14,13,.12));border-radius:var(--r-lg,14px);box-shadow:0 12px 40px rgba(15,14,13,.14);padding:clamp(16px,2.4vw,22px);display:flex;flex-direction:column;gap:14px;}" +
      ".cc-copy strong{display:block;font-size:15px;font-weight:500;margin-bottom:4px;}" +
      ".cc-copy p{font-size:13.5px;line-height:1.6;color:var(--muted-foreground,#6b6b6b);margin:0;}" +
      ".cc-copy a{color:var(--foreground,#0f0e0d);text-decoration:underline;}" +
      ".cc-detail{display:flex;flex-direction:column;gap:12px;padding-top:2px;}" +
      ".cc-detail[hidden]{display:none;}" +
      ".cc-row{display:grid;grid-template-columns:20px 1fr;gap:12px;align-items:start;cursor:pointer;}" +
      ".cc-row input{margin-top:3px;accent-color:var(--primary,#6400ff);width:16px;height:16px;}" +
      ".cc-row input:disabled{opacity:.5;cursor:not-allowed;}" +
      ".cc-row strong{display:block;font-size:13.5px;font-weight:500;}" +
      ".cc-row small{display:block;font-size:12.5px;line-height:1.55;color:var(--muted-foreground,#6b6b6b);margin-top:2px;}" +
      ".cc-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center;}" +
      ".cc-link{background:none;border:0;padding:6px 4px;font:inherit;font-size:13px;color:var(--muted-foreground,#6b6b6b);text-decoration:underline;cursor:pointer;margin-left:auto;}" +
      ".cc-link:hover{color:var(--foreground,#0f0e0d);}" +
      "@media (max-width:560px){.cc-actions .btn{flex:1;}.cc-link{margin-left:0;width:100%;text-align:center;}}";
    var s = document.createElement("style");
    s.id = "cc-styles";
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }
  injectStyles();

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
