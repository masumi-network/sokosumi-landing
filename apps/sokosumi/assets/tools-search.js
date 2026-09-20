/* /tools — live client-side filtering. Cards show when they match BOTH the
 * active category tab and the typed search query (name + description + meta). */
(function () {
  "use strict";
  var input = document.getElementById("toolsSearch");
  var tabsEl = document.getElementById("toolsTabs");
  if (!input && !tabsEl) return;
  var empty = document.getElementById("toolsSearchEmpty");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".tool-card"));
  var activeCat = "";

  function apply() {
    var q = input ? input.value.trim().toLowerCase() : "";
    var shown = 0;
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var matchQ = !q || (card.getAttribute("data-search") || "").indexOf(q) !== -1;
      var matchCat = !activeCat || card.getAttribute("data-cat") === activeCat;
      var show = matchQ && matchCat;
      card.hidden = !show;
      if (show) shown++;
    }
    if (empty) empty.hidden = shown !== 0;
  }

  if (input) {
    input.addEventListener("input", apply);
    input.addEventListener("search", apply);
  }

  if (tabsEl) {
    var tabs = Array.prototype.slice.call(tabsEl.querySelectorAll(".tools-tab"));
    tabsEl.addEventListener("click", function (event) {
      var btn = event.target.closest(".tools-tab");
      if (!btn) return;
      activeCat = btn.getAttribute("data-cat") || "";
      for (var i = 0; i < tabs.length; i++) {
        var on = tabs[i] === btn;
        tabs[i].classList.toggle("is-active", on);
        tabs[i].setAttribute("aria-selected", on ? "true" : "false");
      }
      apply();
    });
  }
})();
