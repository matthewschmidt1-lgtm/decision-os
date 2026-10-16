// Password gate for the rendered proposal page the footer's "M" opens. The page is static, so the check runs in the
// browser and the password ships with the code: it keeps casual visitors out; it is not real security.
(function () {
  var PASSWORD = "1530", KEY = "decision-os:unlocked";
  var root = document.documentElement;
  function unlocked() { try { return sessionStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
  function remember() { try { sessionStorage.setItem(KEY, "1"); } catch (e) {} }
  function reveal() { root.classList.remove("locked"); var g = document.getElementById("m-gate"); if (g) g.remove(); }
  root.classList.add("locked");
  document.addEventListener("DOMContentLoaded", function () {
    if (unlocked()) { reveal(); return; }
    var form = document.getElementById("m-gate-form"), input = document.getElementById("m-gate-input"), error = document.getElementById("m-gate-error");
    if (!form) { reveal(); return; }
    input.focus();
    input.addEventListener("input", function () { error.textContent = ""; });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (input.value.trim() === PASSWORD) { remember(); reveal(); return; }
      error.textContent = "That's not it. Please try again.";
      input.value = ""; input.focus();
    });
  });
})();
