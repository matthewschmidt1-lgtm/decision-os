// Appearance: Auto follows the phone or computer; Light and Dark override it. Remembered per browser.
// Runs before the first paint (a plain script in <head>), so the page never flashes the wrong scheme.
(function () {
  var KEY = "decision-os:theme";
  var root = document.documentElement;
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  function stored() { try { return localStorage.getItem(KEY) || "auto"; } catch (e) { return "auto"; } }
  function apply(mode) {
    if (mode === "light" || mode === "dark") root.setAttribute("data-theme", mode); else root.removeAttribute("data-theme");
    var dark = mode === "dark" || (mode === "auto" && mq.matches);
    var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute("content", dark ? "#1C1C1A" : "#F5F5F0");
    document.querySelectorAll(".theme-switch button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.theme === mode)); });
  }
  apply(stored());
  mq.addEventListener("change", function () { apply(stored()); });
  document.addEventListener("DOMContentLoaded", function () {
    apply(stored());
    document.querySelectorAll(".theme-switch button").forEach(function (b) {
      b.addEventListener("click", function () { try { localStorage.setItem(KEY, b.dataset.theme); } catch (e) {} apply(b.dataset.theme); });
    });
  });
})();
