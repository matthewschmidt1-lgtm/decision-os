import { h } from "./ui.js";
// Accessible modal: focus moves in, Tab stays inside, Esc or backdrop closes, focus returns to the opener.
export function openModal({ label, content }) {
  const opener = document.activeElement;
  const close = () => { backdrop.remove(); document.body.style.overflow = ""; document.removeEventListener("keydown", onKey, true); opener?.focus?.(); };
  const closeBtn = h("button", { type: "button", class: "modal-close", "aria-label": "Close", onClick: close }, "×");
  const panel = h("div", { class: "modal", role: "dialog", "aria-modal": "true", "aria-label": label, tabindex: "-1" }, closeBtn, content);
  const backdrop = h("div", { class: "modal-backdrop", onClick: (e) => { if (e.target === backdrop) close(); } }, panel);
  const onKey = (e) => {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    if (e.key === "Tab") {
      const f = [...panel.querySelectorAll("a[href],button,[tabindex]:not([tabindex='-1'])")].filter(el => !el.disabled);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  };
  document.addEventListener("keydown", onKey, true);
  document.body.style.overflow = "hidden";
  document.body.append(backdrop);
  panel.focus();
  panel.addEventListener("click", (e) => { if (e.target.closest("a[href]")) close(); });
  return close;
}
