// Shared scroll reveals (IntersectionObserver, transform/opacity only,
// honors prefers-reduced-motion). Both the homepage and every sub-page
// load this file. The homepage catalog injects extra [data-reveal]
// nodes after this has run — window.sokosumiReveal observes those.
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function markIn(el) { el.classList.add("in"); }
  var io = null;
  if (!(reduce || !("IntersectionObserver" in window))) {
    io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            markIn(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 12% 0px" },
    );
  }
  function observe(el) {
    if (!el) return;
    if (!io) markIn(el);
    else io.observe(el);
  }
  [].slice.call(document.querySelectorAll("[data-reveal]")).forEach(observe);
  window.sokosumiReveal = observe;
})();

// Collapse long row lists to their first N rows behind a toggle.
// Progressive enhancement on purpose: the server sends every row and this
// hides the overflow, so a visitor without JS gets the whole list rather than
// a truncated one, and crawlers always see all of it.
(function () {
  "use strict";
  var lists = document.querySelectorAll("[data-collapsible]");
  for (var i = 0; i < lists.length; i++) {
    (function (list) {
      var limit = parseInt(list.getAttribute("data-collapsible"), 10) || 12;
      if (list.children.length <= limit) return;
      var toggle = list.parentNode.querySelector("[data-collapse-toggle]");
      if (!toggle) return;
      var more = toggle.querySelector("[data-more-label]");
      var less = toggle.querySelector("[data-less-label]");
      list.classList.add("is-collapsed");
      toggle.hidden = false;
      toggle.setAttribute("aria-expanded", "false");
      toggle.addEventListener("click", function () {
        var collapsed = list.classList.toggle("is-collapsed");
        toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
        if (more) more.hidden = !collapsed;
        if (less) less.hidden = collapsed;
        // Collapsing from far down the list would otherwise leave the viewport
        // somewhere past the end of the section.
        if (collapsed) {
          var top = list.getBoundingClientRect().top;
          if (top < 0) list.scrollIntoView({ block: "start" });
        }
      });
    })(lists[i]);
  }
})();
