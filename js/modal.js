import { h } from "./ui.js";
// Accessible modal. One at a time: focus moves in, Tab stays inside, Esc / × / backdrop close it,
// focus returns to the opener, and the router or the ⌘K palette can close it via closeModal().
let current = null;
export function closeModal() { current?.(); }
export function isModalOpen() { return !!current; }

export function openModal({ label, content }) {
  closeModal();
  const palette = document.getElementById("palette");
  if (palette && !palette.hidden) palette.hidden = true;
  const opener = document.activeElement;
  const close = () => {
    if (current !== close) return;
    current = null;
    backdrop.remove(); document.body.style.overflow = "";
    document.removeEventListener("keydown", onKey, true);
    if (opener && document.contains(opener)) opener.focus();
  };
  const closeBtn = h("button", { type: "button", class: "modal-close", "aria-label": "Close", onClick: close }, "×");
  const body = h("div", { class: "modal-body" }, content);
  const panel = h("div", { class: "modal", role: "dialog", "aria-modal": "true", "aria-label": label }, closeBtn, body);
  const backdrop = h("div", { class: "modal-backdrop", onClick: (e) => { if (e.target === backdrop) close(); } }, panel);
  const focusables = () => [...panel.querySelectorAll("a[href],button:not([disabled]),[tabindex]:not([tabindex='-1'])")];
  const onKey = (e) => {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (e.key === "Tab") {
      const f = focusables(); if (!f.length) return;
      const inside = panel.contains(document.activeElement);
      if (e.shiftKey && (!inside || document.activeElement === f[0])) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && (!inside || document.activeElement === f.at(-1))) { e.preventDefault(); f[0].focus(); }
    }
  };
  document.addEventListener("keydown", onKey, true);
  document.body.style.overflow = "hidden";
  document.body.append(backdrop);
  current = close;
  closeBtn.focus();
  // Links inside navigate via the router, which calls closeModal() first.
  return close;
}
