/* Standalone fitter for [data-pd-fit] feature cards on pages that do not load
   product-demo.js (the /product/* surface pages). Same scale-as-one-unit
   trick as the demo. */
(function () {
  "use strict";
  if (document.getElementById("pd-app")) return; // product-demo.js owns these
  var els = Array.prototype.slice.call(document.querySelectorAll("[data-pd-fit]"));
  if (!els.length) return;
  function fit() {
    els.forEach(function (sz) {
      var wh = sz.getAttribute("data-pd-fit").split("x");
      var fw = +wh[0], fh = +wh[1];
      var box = sz.parentElement;
      var sc = Math.min(1, box.clientWidth / fw);
      sz.firstElementChild.style.setProperty("--pd-scale", String(sc));
      sz.style.width = Math.round(fw * sc) + "px";
      sz.style.height = Math.round(fh * sc) + "px";
      sz.style.margin = "0 auto";
    });
  }
  fit();
  window.addEventListener("resize", fit);
})();
