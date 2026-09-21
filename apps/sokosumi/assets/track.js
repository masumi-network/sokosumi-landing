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
  function firePageLoadEvents() {
    var els = document.querySelectorAll('[data-analytics][data-analytics-on="load"]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var name = el.getAttribute("data-analytics");
      if (!name || el.hasAttribute("data-fired")) continue;
      window.dataLayer = window.dataLayer || [];
      var payload = paramsFrom(el);
      // `on` is the trigger switch, not a parameter. The guard attribute is
      // deliberately NOT data-analytics-* so paramsFrom cannot pick it up.
      delete payload.on;
      el.setAttribute("data-fired", "");
      payload.event = name;
      window.dataLayer.push(payload);
    }
  }
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
      if (!name) return;
      window.dataLayer = window.dataLayer || [];
      var payload = paramsFrom(el);
      payload.event = name;
      window.dataLayer.push(payload);
    },
    true, // capture: fire before a navigation handler can tear the page down
  );
})();
