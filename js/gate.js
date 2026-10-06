import { h, disclose } from "./ui.js";
// Password gate for /accounts, /accounts/:id, the /learn library page (lessons stay open) and the Practice "All scenarios" list. This is a soft gate: the site is static, so the check runs in the
// browser and the password ships with the code. It keeps casual visitors out; it is not real security.
const PASSWORD = "1530";
const KEY = "decision-os:unlocked";
let pending = null;

export const isGated = (pathname) => /^\/accounts(\/|$)/.test(pathname) || /^\/learn\/?$/.test(pathname); // the library page, not the lessons
const unlocked = () => { try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; } };
const remember = () => { try { sessionStorage.setItem(KEY, "1"); } catch { /* private mode: asked again next click */ } };

// Resolves true once unlocked (or already unlocked), false if the visitor cancels. `opener` gets focus back afterwards.
export function requestAccess(opener = document.activeElement) {
  if (unlocked()) return Promise.resolve(true);
  if (pending) return pending;
  pending = new Promise((resolve) => {
    const input = h("input", { id: "gate-input", class: "gate-input", type: "password", inputmode: "numeric", autocomplete: "off", spellcheck: "false", "aria-describedby": "gate-error" });
    const error = h("p", { id: "gate-error", class: "gate-error", role: "alert" });
    const cancel = h("button", { type: "button", class: "btn btn-ghost" }, "Cancel");
    const form = h("form", { class: "gate-form", novalidate: true },
      h("label", { class: "gate-label", for: "gate-input" }, "Please enter your password"),
      input, error,
      h("div", { class: "gate-actions" }, cancel, h("button", { type: "submit", class: "btn" }, "Continue")));
    const dlg = h("dialog", { class: "gate", "aria-label": "Please enter your password" }, form);

    let ok = false;
    const finish = () => {
      dlg.close(); dlg.remove(); pending = null;
      document.body.style.overflow = "";
      if (opener && document.contains(opener)) opener.focus();
      resolve(ok);
    };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (input.value.trim() === PASSWORD) { ok = true; remember(); finish(); return; }
      error.textContent = "That's not it. Please try again.";
      input.value = ""; input.focus();
    });
    input.addEventListener("input", () => { error.textContent = ""; });
    cancel.addEventListener("click", finish);
    dlg.addEventListener("cancel", (e) => { e.preventDefault(); finish(); }); // Escape
    dlg.addEventListener("click", (e) => { if (e.target === dlg) finish(); }); // backdrop

    document.body.append(dlg);
    document.body.style.overflow = "hidden";
    dlg.showModal();
    input.focus();
  });
  return pending;
}

// A disclose() whose content is built only after the password passes, so nothing is in the DOM while it is locked.
export function gatedDisclose(title, build) {
  const el = disclose(title, null);
  const summary = el.querySelector("summary"), body = el.querySelector(".disclose-body");
  summary.addEventListener("click", async (e) => {
    e.preventDefault(); // Enter and Space on the summary arrive here as clicks too
    if (el.open) { el.open = false; return; }
    if (!(await requestAccess(summary))) return;
    if (!body.firstChild) body.append(build());
    el.open = true;
  });
  el.addEventListener("toggle", () => { if (el.open && !body.firstChild) el.open = false; });
  return el;
}
