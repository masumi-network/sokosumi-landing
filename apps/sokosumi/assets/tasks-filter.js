// Client-side filtering for the /tasks browse page. Cards are all server-
// rendered; this just shows/hides by active category + search text, keeps the
// URL (?category=&q=) in sync, and updates the result count.
(function () {
  var grid = document.getElementById("taskGrid");
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".task-hit"));
  var chips = Array.prototype.slice.call(document.querySelectorAll("#catChips .fchip"));
  var search = document.getElementById("taskSearch");
  var countEl = document.getElementById("taskCount");
  var emptyEl = document.getElementById("taskEmpty");
  var clearBtn = document.getElementById("clearFilters");
  var totalText = countEl ? countEl.textContent : "";

  var init = window.__TASK_INIT__ || {};
  var url = new URL(location.href);
  var state = {
    cat: url.searchParams.get("category") || init.category || "",
    q: url.searchParams.get("q") || init.q || "",
  };
  if (search && state.q) search.value = state.q;

  function apply() {
    var q = state.q.trim().toLowerCase();
    var n = 0;
    cards.forEach(function (card) {
      var okCat = !state.cat || card.getAttribute("data-cat") === state.cat;
      var okQ = !q || (card.getAttribute("data-text") || "").indexOf(q) !== -1;
      var show = okCat && okQ;
      card.style.display = show ? "" : "none";
      if (show) n++;
    });
    chips.forEach(function (ch) {
      ch.classList.toggle("active", ch.getAttribute("data-cat") === state.cat);
    });
    if (emptyEl) emptyEl.hidden = n !== 0;
    if (countEl) {
      countEl.textContent =
        state.cat || q
          ? n + " task" + (n === 1 ? "" : "s") + (state.cat ? " in " + state.cat : "") + (q ? ' for "' + state.q.trim() + '"' : "")
          : totalText;
    }
    var u = new URL(location.href);
    if (state.cat) u.searchParams.set("category", state.cat); else u.searchParams.delete("category");
    if (state.q.trim()) u.searchParams.set("q", state.q.trim()); else u.searchParams.delete("q");
    history.replaceState(null, "", u.pathname + (u.search || ""));
  }

  chips.forEach(function (ch) {
    ch.addEventListener("click", function () {
      state.cat = ch.getAttribute("data-cat");
      apply();
    });
  });
  if (search) search.addEventListener("input", function () { state.q = search.value; apply(); });
  var form = document.getElementById("taskSearchForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });
  if (clearBtn)
    clearBtn.addEventListener("click", function () {
      state.cat = "";
      state.q = "";
      if (search) search.value = "";
      apply();
    });

  apply();
})();
