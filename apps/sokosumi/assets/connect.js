// Copy buttons on /product/cli and /product/mcp (templates/connect.js).
// Where the clipboard is unavailable or refused, select the command instead
// so it can be copied by hand.
document.addEventListener("click", function (e) {
  var btn = e.target.closest && e.target.closest(".cx-copy");
  if (!btn) return;
  var select = function () {
    var pre = btn.parentNode.querySelector("pre");
    var range = document.createRange();
    range.selectNodeContents(pre);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };
  if (!navigator.clipboard) return select();
  navigator.clipboard.writeText(btn.getAttribute("data-copy")).then(function () {
    btn.textContent = "Copied";
    setTimeout(function () { btn.textContent = "Copy"; }, 1600);
  }, select);
});
