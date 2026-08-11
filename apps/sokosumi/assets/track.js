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
