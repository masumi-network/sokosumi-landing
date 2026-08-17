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
