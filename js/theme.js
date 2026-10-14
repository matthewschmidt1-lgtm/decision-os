// Appearance: follows the phone or computer until the sun/moon button in the header is pressed; then that choice is remembered per browser.
// Runs before the first paint (a plain script in <head>), so the page never flashes the wrong scheme.
(function () {
  var KEY = "decision-os:theme";
  var root = document.documentElement;
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  function stored() { try { return localStorage.getItem(KEY) || "auto"; } catch (e) { return "auto"; } }
  function isDark(mode) { return mode === "dark" || (mode === "auto" && mq.matches); }
  function apply(mode) {
    if (mode === "light" || mode === "dark") root.setAttribute("data-theme", mode); else root.removeAttribute("data-theme");
    var dark = isDark(mode);
    var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute("content", dark ? "#1C1C1A" : "#F5F5F0");
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      // The icon shows what a press gives you: a moon while it's light, a sun while it's dark.
      var label = dark ? "Switch to light mode" : "Switch to dark mode";
      btn.setAttribute("aria-label", label); btn.setAttribute("title", label);
      btn.querySelector(".icon-moon").hidden = dark;
      btn.querySelector(".icon-sun").hidden = !dark;
    }
  }
  apply(stored());
  mq.addEventListener("change", function () { apply(stored()); });
  document.addEventListener("DOMContentLoaded", function () {
    apply(stored());
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", function () {
      var next = isDark(stored()) ? "light" : "dark";
      try { localStorage.setItem(KEY, next); } catch (e) {}
      apply(next);
    });
  });
})();
