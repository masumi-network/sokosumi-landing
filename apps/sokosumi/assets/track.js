// Declarative event tracking for the marketing site.
//
// Any element carrying `data-analytics="event_name"` pushes that event to the
// dataLayer when clicked; extra `data-analytics-*` attributes become event
// parameters (e.g. data-analytics-location="hero" -> { location: "hero" }).
// GTM turns those dataLayer events into GA4 events — see TRACKING.md.
//
// Page-view-shaped events (view_pricing, page_view) need no code here: GTM
// derives them from the URL. This file only covers interactions.
(function () {
  "use strict";

  function paramsFrom(el) {
    var out = {};
    for (var i = 0; i < el.attributes.length; i++) {
      var a = el.attributes[i];
      if (a.name.indexOf("data-analytics-") === 0) {
        out[a.name.slice("data-analytics-".length).replace(/-/g, "_")] = a.value;
      }
    }
    return out;
  }

  // Some events are outcomes, not clicks. A lead form here is a plain POST that
  // redirects back with ?sent=1, so the honest place to record it is the success
  // state the server rendered — firing on click would also count submissions
  // that failed validation. Mark an element data-analytics-on="load" and it
  // fires once on load instead of on click.
  // A load event only counts once it can actually reach GA4. Consent Mode
  // drops events pushed before the visitor opts in, so pushing (and marking a
  // lead's receipt as spent) on load would lose every lead from a visitor who
  // accepts the banner afterwards. Load events therefore wait for analytics
  // consent: now if it is stored, or when the banner reports a decision.
  function analyticsGranted() {
    var m = document.cookie.match(/(?:^|; )sokosumi_consent=([^;]+)/);
    if (!m) return false;
    try {
      return !!JSON.parse(decodeURIComponent(m[1])).analytics;
    } catch (_e) {
      return false;
    }
  }

  function firePageLoadEvents() {
    if (!analyticsGranted()) return;
    var els = document.querySelectorAll('[data-analytics][data-analytics-on="load"]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var name = el.getAttribute("data-analytics");
      if (!name || el.hasAttribute("data-fired")) continue;
      el.setAttribute("data-fired", "");
      // A lead's success page carries a one-off receipt; remember it so a
      // reload or a back-navigation does not count the same lead again.
      var once = el.getAttribute("data-once");
      if (once) {
        try {
          if (localStorage.getItem("soko-fired:" + once)) continue;
          localStorage.setItem("soko-fired:" + once, "1");
        } catch (_e) {}
      }
      window.dataLayer = window.dataLayer || [];
      var payload = paramsFrom(el);
      // `on` is the trigger switch, not a parameter. The guard attribute is
      // deliberately NOT data-analytics-* so paramsFrom cannot pick it up.
      delete payload.on;
      payload.event = name;
      window.dataLayer.push(payload);
    }
  }
  document.addEventListener("soko:consent", firePageLoadEvents);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", firePageLoadEvents, { once: true });
  } else {
    firePageLoadEvents();
  }


  // Scroll depth as a ladder, not just GA4's built-in 90%: which quarter of a
  // page people give up on is the drop-off question, and 90% alone cannot
  // answer it. One event per threshold per page, on the document's own height.
  (function scrollDepth() {
    var marks = [25, 50, 75, 90];
    var sent = {};
    var ticking = false;
    function measure() {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      var pct = ((window.pageYOffset || doc.scrollTop) / max) * 100;
      for (var i = 0; i < marks.length; i++) {
        if (pct >= marks[i] && !sent[marks[i]]) {
          sent[marks[i]] = true;
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: "scroll_depth", percent: marks[i] });
        }
      }
    }
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(measure);
      },
      { passive: true },
    );
  })();

  document.addEventListener(
    "click",
    function (e) {
      var el = e.target.closest && e.target.closest("[data-analytics]");
      if (!el) return;
      var name = el.getAttribute("data-analytics");
      // Load events are outcomes, not clicks: clicking a lead's success box
      // must not count the lead a second time.
      if (!name || el.getAttribute("data-analytics-on") === "load") return;
      window.dataLayer = window.dataLayer || [];
      var payload = paramsFrom(el);
      payload.event = name;
      window.dataLayer.push(payload);
    },
    true, // capture: fire before a navigation handler can tear the page down
  );
})();
