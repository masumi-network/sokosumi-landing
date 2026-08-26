// Team-size calculator on /pricing. The server has already rendered every
// figure for the seat count in the URL (?seats=, default 1) — this only
// recomputes the same seats × price and seats × credits in place as the
// number changes, so the page is complete without it. Bases come from the
// data-price / data-credits attributes the template wrote off PLANS; nothing
// is priced here that is not on the card already.
(function () {
  var form = document.getElementById("seatForm");
  if (!form) return;
  var input = document.getElementById("seats");
  var unit = form.querySelector("[data-seat-unit]");
  var status = document.getElementById("seatStatus");
  var submit = form.querySelector(".seat-submit");
  var chips = Array.prototype.slice.call(form.querySelectorAll(".fchip[data-seats]"));
  var count = form.querySelector("[data-seat-count]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".plan-card"));
  var lang = document.documentElement.lang || "en";
  var nf = new Intl.NumberFormat(lang);
  var cf = new Intl.NumberFormat(lang, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  var MAX = 9999;
  var announceTimer;
  var trackTimer;
  var lastTracked = seats();

  // The form only exists for the no-script path; with script the page
  // recomputes as you type, so the submit button has nothing to do.
  if (submit) submit.hidden = true;

  function seats() {
    var n = parseInt(input.value, 10);
    return isFinite(n) && n >= 1 ? Math.min(n, MAX) : 1;
  }

  // The filled part of the track is drawn from the value, so it stays in step
  // with the thumb on every browser rather than only where ::-moz-range-progress
  // exists.
  function paint(n) {
    var lo = Number(input.min) || 1;
    var hi = Number(input.max) || lo;
    var pct = hi > lo ? ((n - lo) / (hi - lo)) * 100 : 0;
    input.style.setProperty("--pct", pct + "%");
  }

  function apply() {
    var n = seats();
    var label = (n === 1 ? form.getAttribute("data-one") : form.getAttribute("data-many")).replace("{n}", nf.format(n));
    var parts = [];
    cards.forEach(function (card) {
      var priceEl = card.querySelector("[data-team-price]");
      var perEl = card.querySelector("[data-team-per]");
      var creditsEl = card.querySelector("[data-team-credits]");
      var creditsUnit = card.querySelector("[data-team-credits-unit]");
      var labelEl = card.querySelector("[data-team-label]");
      var price = Number(priceEl.getAttribute("data-price")) * n;
      var credits = Number(creditsEl.getAttribute("data-credits")) * n;
      labelEl.textContent = label;
      priceEl.textContent = price ? cf.format(price) : form.getAttribute("data-free");
      perEl.hidden = !price;
      creditsEl.textContent = nf.format(credits);
      var name = card.querySelector(".plan-name").firstChild.textContent.trim();
      parts.push(name + ": " + priceEl.textContent + (price ? " " + perEl.textContent : "") + ", " + creditsEl.textContent + " " + creditsUnit.textContent);
    });
    if (unit) unit.textContent = form.getAttribute(n === 1 ? "data-seat" : "data-seats");
    if (count) count.textContent = nf.format(n);
    paint(n);
    chips.forEach(function (chip) {
      var on = Number(chip.getAttribute("data-seats")) === n;
      chip.classList.toggle("active", on);
      if (on) chip.setAttribute("aria-current", "true");
      else chip.removeAttribute("aria-current");
    });
    // One polite announcement per settled change, not one per keystroke and
    // not one per card: the label once, then each plan's figures.
    if (status) {
      clearTimeout(announceTimer);
      announceTimer = setTimeout(function () {
        status.textContent = label + ". " + parts.join(". ") + ".";
      }, 400);
    }
    // The plan CTAs report the seat count they were clicked at, and the
    // calculator itself reports once per settled change (not per keystroke).
    cards.forEach(function (card) {
      var cta = card.querySelector("[data-analytics]");
      if (cta) cta.setAttribute("data-analytics-seats", n);
    });
    if (n !== lastTracked) {
      clearTimeout(trackTimer);
      trackTimer = setTimeout(function () {
        if (n === lastTracked) return;
        lastTracked = n;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "pricing_calculator", seats: n });
      }, 800);
    }
  }

  input.addEventListener("input", apply);
  input.addEventListener("change", function () {
    // Settle the field on blur/enter: blanks and zeros read back as 1.
    input.value = seats();
    apply();
  });
  chips.forEach(function (chip) {
    chip.addEventListener("click", function (e) {
      e.preventDefault();
      input.value = chip.getAttribute("data-seats");
      apply();
    });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    input.value = seats();
    apply();
  });
})();
