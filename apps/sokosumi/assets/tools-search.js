/* /tools — live client-side filter over the tool cards. Matches the typed
 * query against each card's data-search (name + description + meta). */
(function () {
  "use strict";
  var input = document.getElementById("toolsSearch");
  if (!input) return;
  var empty = document.getElementById("toolsSearchEmpty");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".tool-card"));

  function apply() {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    for (var i = 0; i < cards.length; i++) {
      var hay = cards[i].getAttribute("data-search") || "";
      var match = !q || hay.indexOf(q) !== -1;
      cards[i].hidden = !match;
      if (match) shown++;
    }
    if (empty) empty.hidden = shown !== 0;
  }

  input.addEventListener("input", apply);
  // Clearing via the native search "x" fires "search"; keep the list in sync.
  input.addEventListener("search", apply);
})();
