// Publishes the scrollbar width so `.full-bleed` can break out of the page
// container to the exact viewport edge. 100vw would include the scrollbar and
// push the band 7–8px past each side.
(function () {
  var root = document.documentElement;
  function measure() {
    root.style.setProperty("--sbw", window.innerWidth - root.clientWidth + "px");
  }
  measure();
  window.addEventListener("resize", measure, { passive: true });
})();

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
