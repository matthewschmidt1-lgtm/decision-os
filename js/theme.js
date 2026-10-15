// Appearance and display settings. Runs before the first paint (a plain script in <head>), so the page never flashes the wrong scheme or size.
// Theme follows the phone or computer until the sun/moon button (or the Night reading switch) is pressed; text size, reduced motion and
// higher contrast live in the "Display and accessibility" panel. Everything is remembered per browser.
(function () {
  var KEY = "decision-os:theme", DKEY = "decision-os:display";
  var root = document.documentElement;
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  var SCALES = [0.9, 1, 1.1, 1.2, 1.3, 1.4];
  function stored() { try { return localStorage.getItem(KEY) || "auto"; } catch (e) { return "auto"; } }
  function display() { try { return JSON.parse(localStorage.getItem(DKEY) || "{}") || {}; } catch (e) { return {}; } }
  function saveDisplay(d) { try { localStorage.setItem(DKEY, JSON.stringify(d)); } catch (e) {} }
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
    var sw = document.querySelector('.display-panel input[data-setting="theme"]'); if (sw) sw.checked = dark;
  }
  function applyDisplay() {
    var d = display();
    var scale = SCALES.indexOf(d.textScale) >= 0 ? d.textScale : 1;
    if (scale === 1) root.style.removeProperty("--text-scale"); else root.style.setProperty("--text-scale", String(scale));
    if (d.motion === "reduce") root.setAttribute("data-motion", "reduce"); else root.removeAttribute("data-motion");
    if (d.contrast === "high") root.setAttribute("data-contrast", "high"); else root.removeAttribute("data-contrast");
    var panel = document.getElementById("display-panel");
    if (panel) {
      var out = panel.querySelector("#display-scale"); if (out) out.textContent = Math.round(scale * 100) + "%";
      panel.querySelector('[data-scale="-1"]').disabled = scale <= SCALES[0];
      panel.querySelector('[data-scale="1"]').disabled = scale >= SCALES[SCALES.length - 1];
      panel.querySelector('input[data-setting="motion"]').checked = d.motion === "reduce";
      panel.querySelector('input[data-setting="contrast"]').checked = d.contrast === "high";
    }
  }
  apply(stored()); applyDisplay();
  mq.addEventListener("change", function () { apply(stored()); });

  document.addEventListener("DOMContentLoaded", function () {
    apply(stored()); applyDisplay();
    var setTheme = function (next) { try { localStorage.setItem(KEY, next); } catch (e) {} apply(next); };
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", function () { setTheme(isDark(stored()) ? "light" : "dark"); });

    var trigger = document.getElementById("display-trigger"), panel = document.getElementById("display-panel");
    if (!trigger || !panel) return;
    var open = function (yes) {
      panel.hidden = !yes; trigger.setAttribute("aria-expanded", yes ? "true" : "false");
      if (yes) { var first = panel.querySelector("button:not(:disabled), input"); if (first) first.focus(); }
    };
    trigger.addEventListener("click", function () { open(panel.hidden); });
    document.addEventListener("click", function (e) { if (!panel.hidden && !panel.contains(e.target) && !trigger.contains(e.target)) open(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { open(false); trigger.focus(); } });
    panel.querySelectorAll("[data-scale]").forEach(function (b) {
      b.addEventListener("click", function () {
        var d = display(); var i = SCALES.indexOf(d.textScale); if (i < 0) i = 1;
        i = Math.max(0, Math.min(SCALES.length - 1, i + Number(b.dataset.scale)));
        d.textScale = SCALES[i]; saveDisplay(d); applyDisplay();
      });
    });
    panel.querySelector('input[data-setting="theme"]').addEventListener("change", function (e) { setTheme(e.target.checked ? "dark" : "light"); });
    panel.querySelector('input[data-setting="motion"]').addEventListener("change", function (e) { var d = display(); d.motion = e.target.checked ? "reduce" : "auto"; saveDisplay(d); applyDisplay(); });
    panel.querySelector('input[data-setting="contrast"]').addEventListener("change", function (e) { var d = display(); d.contrast = e.target.checked ? "high" : "normal"; saveDisplay(d); applyDisplay(); });
  });
})();
