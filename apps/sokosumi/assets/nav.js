// Publishes the scrollbar width so `.full-bleed` can break out of the page
// container to the exact viewport edge. 100vw would include the scrollbar and
// push the band 7–8px past each side. Lives here rather than in site.js
// because this file is the one both surfaces load.
// Re-measured on load and on resize, not just once: at parse time the page is
// often still short enough that no scrollbar exists yet, and a stale 0 would
// let the band overshoot by the scrollbar's width. `html { overflow-x: clip }`
// in styles.css makes any residual overshoot harmless either way.
(function () {
  var root = document.documentElement;
  function measure() {
    root.style.setProperty("--sbw", window.innerWidth - root.clientWidth + "px");
  }
  measure();
  window.addEventListener("load", measure);
  window.addEventListener("resize", measure, { passive: true });
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(document.body);
})();

// Dropdown menus. CSS :hover alone opens them, and still does without JS, but
// it closes the instant the pointer leaves the trigger — so moving diagonally
// towards a far column, or clipping the edge on the way down, snaps the panel
// shut. This adds a short grace period on the way out and closes any sibling
// on the way in, which is what makes the menus feel steady.
(function () {
  var drops = [].slice.call(document.querySelectorAll(".nav-drop"));
  if (!drops.length) return;
  var GRACE_MS = 180;
  var timers = new WeakMap();

  // The trigger advertises the panel via aria-controls/aria-haspopup; keep
  // aria-expanded honest as the panel opens and closes.
  function expose(d, isOpen) {
    var trigger = d.querySelector("[aria-expanded]");
    if (trigger) trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  // Portraits in the panel ship as data-src so a page view does not download
  // a menu's worth of images; the first open swaps them in.
  function hydrate(d) {
    [].slice.call(d.querySelectorAll("img[data-src]")).forEach(function (img) {
      img.src = img.getAttribute("data-src");
      img.removeAttribute("data-src");
    });
  }

  function open(d) {
    clearTimeout(timers.get(d));
    drops.forEach(function (other) {
      if (other !== d) close(other, true);
    });
    hydrate(d);
    d.classList.add("open");
    expose(d, true);
  }
  function close(d, now) {
    clearTimeout(timers.get(d));
    if (now) {
      d.classList.remove("open");
      return expose(d, false);
    }
    timers.set(d, setTimeout(function () {
      d.classList.remove("open");
      expose(d, false);
    }, GRACE_MS));
  }

  drops.forEach(function (d) {
    d.addEventListener("pointerenter", function () { open(d); });
    d.addEventListener("pointerleave", function () { close(d); });
    // keyboard users get the same panel without a pointer ever being involved
    d.addEventListener("focusin", function () { open(d); });
    d.addEventListener("focusout", function (e) {
      if (!d.contains(e.relatedTarget)) close(d, true);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") drops.forEach(function (d) { close(d, true); });
  });
})();

// Mobile drawer toggle, shared by the landing page and every sub-page.
// The drawer markup is rendered server-side (templates/shell.js) and inline
// on index.html; this only wires the button.
(function () {
  var btn = document.getElementById("navBurger");
  var panel = document.getElementById("mobileNav");
  if (!btn || !panel) return;
  var bar = btn.closest(".island-nav, .site-header");

  // On the landing page the bar is transparent over the video and its buttons
  // are inverted for it. An open drawer puts paper behind the bar, so it has
  // to take the same `scrolled` state the hero observer normally sets — and
  // give it back on close, since no intersection fires while the page stays put.
  var hero = document.querySelector(".hero");
  function restoreBarState() {
    if (!bar || !hero || !bar.classList.contains("island-nav")) return;
    bar.classList.toggle("scrolled", hero.getBoundingClientRect().bottom <= 72);
  }

  function setOpen(open) {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    panel.hidden = !open;
    document.body.classList.toggle("nav-locked", open);
    if (bar) {
      bar.classList.toggle("nav-open", open);
      if (open) bar.classList.add("scrolled");
      else restoreBarState();
    }
  }

  btn.addEventListener("click", function () {
    setOpen(btn.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      btn.focus();
    }
  });

  // Widening past the breakpoint brings the desktop row back; a drawer left
  // open would then sit over the page with no way to close it.
  window.addEventListener(
    "resize",
    function () {
      if (window.innerWidth > 900 && btn.getAttribute("aria-expanded") === "true") setOpen(false);
    },
    { passive: true },
  );
})();
