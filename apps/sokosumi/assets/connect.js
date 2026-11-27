// Copy buttons on /product/cli and /product/mcp (templates/connect.js).
document.addEventListener("click", function (e) {
  var btn = e.target.closest && e.target.closest(".cx-copy");
  if (!btn || !navigator.clipboard) return;
  navigator.clipboard.writeText(btn.getAttribute("data-copy")).then(function () {
    btn.textContent = "Copied";
    setTimeout(function () { btn.textContent = "Copy"; }, 1600);
  });
});
