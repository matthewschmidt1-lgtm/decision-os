import { h } from "./ui.js";
import { brands, accounts, decisions } from "./data.js";
import { rankByEV } from "./models.js";
import { scenarios } from "./scenarios.js";
const roi20 = rankByEV(accounts).filter(a => (a.ev / a.value) * 100 >= 20).length;
import { navigate } from "./app.js";

const canned = [
  { t: "Why is Brand A underperforming?", s: "Brand A is growing +12% but margin is −1.2 pts on +21% trade spend.", k: "answer", href: "/portfolio#chain" },
  { t: "Which accounts should I visit?", s: "Ranked by expected value, not size.", k: "accounts", href: "/accounts?sort=ev" },
  { t: "Where are we overspending?", s: "Brand B holds 32% of trade for 15% of revenue.", k: "decision", href: "/decisions/shift-brand-b" },
  { t: "Show me opportunities with >20% expected ROI", s: `${roi20} accounts qualify.`, k: "accounts", href: "/accounts?roi=20" },
  { t: "Practice a customer meeting", s: "A buyer pushes back. What do you say?", k: "practice", href: "/practice/facings-cut?set=meeting&i=0" },
  { t: "Try a 5-minute challenge", s: "Five cases, immediate feedback.", k: "practice", href: "/practice/kroger-decline?set=challenge&i=0" },
  { t: "Where should I spend my next 10 hours?", s: "Attention allocation across 15 brands.", k: "portfolio", href: "/portfolio#attention" },
  { t: "What should I learn before I decide?", s: "Value of information.", k: "learn", href: "/learn/value-of-information" },
];

export function initPalette() {
  const dlg = document.getElementById("palette");
  const input = document.getElementById("palette-input");
  const list = document.getElementById("palette-results");
  const trigger = document.getElementById("search-trigger");
  let items = [], sel = 0, lastFocus;

  const index = () => [
    ...canned,
    ...decisions.map(d => ({ t: `${d.verb} — ${d.headline}`, s: d.question, k: "decision", href: `/decisions/${d.id}` })),
    ...scenarios.map(s => ({ t: `${s.customer}: ${s.question}`, s: `${s.level} · ${s.category}`, k: "practice", href: `/practice/${s.id}` })),
    ...brands.map(b => ({ t: b.name, s: `${b.role} · ${b.growth > 0 ? "+" : ""}${b.growth}% growth`, k: "brand", href: `/portfolio?brand=${b.id}` })),
    ...accounts.map(a => ({ t: a.name, s: `${a.channel === "on" ? "On-premise" : "Off-premise"} · velocity ${a.velocity > 0 ? "+" : ""}${a.velocity}%`, k: "account", href: `/accounts/${a.id}` })),
    { t: "Algorithm library", s: "How machines make decisions under uncertainty.", k: "learn", href: "/learn" },
  ];

  function render() {
    const q = input.value.trim().toLowerCase();
    const all = index();
    items = q ? all.filter(i => (i.t + " " + i.s).toLowerCase().includes(q)).slice(0, 8) : canned;
    sel = 0;
    list.replaceChildren(...(items.length ? items.map((i, n) => h("li", { role: "option", id: `opt-${n}`, "aria-selected": String(n === sel), onClick: () => go(i), onMousemove: () => { sel = n; paint(); } }, h("div", {}, h("div", { class: "t" }, i.t), h("div", { class: "s" }, i.s)), h("span", { class: "k" }, i.k))) : [h("li", { class: "palette-empty" }, "Nothing matched. Try a brand, account, or question.")]));
    paint();
  }
  function paint() { list.querySelectorAll("li[role=option]").forEach((li, n) => li.setAttribute("aria-selected", String(n === sel))); if (items[sel]) input.setAttribute("aria-activedescendant", `opt-${sel}`); }
  function go(i) { close(); navigate(i.href); }
  function open() { lastFocus = document.activeElement; dlg.hidden = false; input.value = ""; render(); input.focus(); document.body.style.overflow = "hidden"; }
  function close() { dlg.hidden = true; document.body.style.overflow = ""; lastFocus?.focus?.(); }

  trigger.addEventListener("click", open);
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
  input.addEventListener("input", render);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); paint(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); paint(); }
    else if (e.key === "Enter" && items[sel]) go(items[sel]);
  });
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); dlg.hidden ? open() : close(); }
    else if (e.key === "Escape" && !dlg.hidden) close();
  });
  return { open, close };
}
