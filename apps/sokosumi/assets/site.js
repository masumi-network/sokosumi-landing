// Shared sub-page behavior: staggered scroll reveals (IntersectionObserver,
// transform/opacity only, honors prefers-reduced-motion).
(function () {
  var els = [].slice.call(document.querySelectorAll("[data-reveal]"));
  if (!els.length) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function markIn(el) { el.classList.add("in"); }
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(markIn);
    return;
  }
  var io = new IntersectionObserver(
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
  els.forEach(function (el) { io.observe(el); });
})();
