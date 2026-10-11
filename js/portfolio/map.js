// The overview map: eight equal tiles in reading order A–H (revenue order). No connecting lines, no sizing by revenue.
// Each tile is a button in a roving-tabindex group: arrow keys move between tiles, Enter or Space opens the brand.
// The tiles only show what the team's forecast and the player's own plan already say; nothing hidden is drawn.
import { h, s } from "../ui.js";
import * as S from "../sim.js";
import { $k, per$ } from "./fmt.js";

const NOISE = 2; // points of forecast error the sim's own noise can produce (same band as the results charts)
const CONF_WORD = { High: "", Medium: "roughly", Low: "unsure" };

export function createMap({ onSelect }) {
  const el = h("div", { class: "fd-map", role: "group", "aria-label": "Your eight brands. Arrow keys move between them; Enter opens one." });
  const tiles = {};
  let current = null;
  for (const id of S.brandIds) {
    const t = h("button", { type: "button", class: "fd-tile", dataset: { id }, tabindex: "-1", onClick: () => { select(id); onSelect?.(id, t); } });
    tiles[id] = t; el.append(t);
  }
  const cols = () => getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
  el.addEventListener("keydown", (e) => {
    const ids = S.brandIds, i = ids.indexOf(e.target.closest(".fd-tile")?.dataset.id);
    if (i < 0) return;
    const n = cols(), to = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + n, ArrowUp: i - n, Home: 0, End: ids.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const id = ids[Math.max(0, Math.min(ids.length - 1, to))];
    rove(id); tiles[id].focus();
  });
  const rove = (id) => { for (const [k, t] of Object.entries(tiles)) t.tabIndex = k === id ? 0 : -1; };
  function select(id) {
    current = id;
    for (const [k, t] of Object.entries(tiles)) { t.classList.toggle("is-sel", k === id); t.setAttribute("aria-current", String(k === id)); }
    rove(id ?? S.brandIds[0]);
  }
  select(null);

  // v: { brands, rows (forecastQuarter rows for the draft), plan, state, prev (last played quarter or null), qi, vi, canFocus, canDays }
  function update(v) {
    const ly = S.lastYearPlan(), signals = S.marketSignals(v.vi, v.qi).map((m) => m.id);
    const scale = Math.max(200, ...v.rows.map((r) => r.xOff + r.xOn));
    for (const b of v.brands) {
      const r = v.rows.find((x) => x.id === b.id), x = v.plan.trade[b.id] || 0, base = ly.trade[b.id];
      const last = v.prev?.rows.find((p) => p.id === b.id);
      const scoutedAt = v.state.scouted[b.id];
      const market = signals.includes(b.id), under = r.floor > 0 && r.xOff < r.floor;
      const earn = r.next >= 1.02 ? "good" : r.next <= 0.98 ? "bad" : "even";
      const nextText = r.conf === "High" ? `${per$(r.next)} back` : `${per$(r.nextLo)}–${per$(r.nextHi)} back`;
      const dd = last ? Math.round(last.growth) - Math.round(last.growthF) : null;
      const trend = dd === null ? ["none", "–", "no read yet"] : Math.abs(dd) < NOISE ? ["even", "–", "on forecast"] : dd > 0 ? ["good", "▲", "beat forecast"] : ["bad", "▼", "missed forecast"];
      const change = x === base ? "same as last year" : `${x > base ? "+" : "−"}${$k(Math.abs(x - base))} vs last year`;
      const mix = v.plan.focus[b.id] || "both";
      const pct = (k) => `${Math.min(100, (k / scale) * 100)}%`;
      const t = tiles[b.id];
      t.className = `fd-tile ${current === b.id ? "is-sel" : ""} ${under ? "is-under" : ""}`;
      t.setAttribute("aria-label", [`Brand ${b.id}, ${b.category}, ${b.role}.`, `${$k(x)}, ${change}.`,
        `Next $10K, team forecast: about ${nextText}${r.conf !== "High" ? " (the team's range)" : ""}.`,
        market ? "Market signal this quarter." : "", under ? `Below its shelf floor of ${$k(r.floor)} off-premise.` : "",
        scoutedAt !== undefined ? `Scouted in ${S.QUARTERS[scoutedAt].id}.` : "", last ? `Last quarter: ${trend[2]}.` : "",
        v.canDays ? `${v.plan.days[b.id]} field days.` : ""].filter(Boolean).join(" "));
      t.replaceChildren(
        h("span", { class: "t-head" }, h("b", { class: "t-id" }, b.id), h("span", { class: "t-cat" }, b.category),
          h("span", { class: "t-sig" },
            market ? h("span", { class: "sig warn", title: "Market signal this quarter" }, s("svg", { viewBox: "0 0 12 11", width: 12, height: 11, "aria-hidden": "true" }, s("path", { d: "M6 0.8 L11.4 10.2 L0.6 10.2 Z" }), s("rect", { x: 5.4, y: 3.8, width: 1.2, height: 3.4, class: "cut" }), s("rect", { x: 5.4, y: 8, width: 1.2, height: 1.2, class: "cut" })), h("span", { class: "w" }, "Market")) : null,
            under ? h("span", { class: "sig bad", title: "Below the shelf floor" }, h("span", { class: "g", "aria-hidden": "true" }, "!"), h("span", { class: "w" }, "Below floor")) : null)),
        h("span", { class: "t-role" }, `${b.role} · ${$k(b.revenue / 1000)} a year`),
        h("span", { class: "t-fund" }, h("b", { class: "num" }, $k(x)), h("span", { class: "t-chg" }, change)),
        h("span", { class: "t-bar", "aria-hidden": "true" },
          h("i", { class: "off", style: { width: pct(r.xOff) } }), h("i", { class: "on", style: { width: pct(r.xOn) } }),
          r.floor > 0 ? h("i", { class: `floor ${under ? "bad" : ""}`, style: { left: pct(r.floor) } }) : null),
        h("span", { class: "t-mix" }, v.canFocus ? h("b", {}, S.FOCUS[mix]) : null, `off ${$k(r.xOff)} · on ${$k(r.xOn)}`),
        h("span", { class: `t-next conf-${r.conf}` }, h("span", { class: "k" }, "Next $10K ≈"), h("b", { class: `num ${earn}` }, nextText),
          h("span", { class: `t-earn ${earn}` }, earn === "good" ? "earns" : earn === "bad" ? "loses" : "breaks even"),
          r.conf !== "High" ? h("span", { class: "t-conf" }, `${CONF_WORD[r.conf]}, the team's range`) : null),
        h("span", { class: "t-foot" },
          scoutedAt !== undefined ? h("span", { class: "chip chip-good" }, `Scouted ${S.QUARTERS[scoutedAt].id}`) : null,
          h("span", { class: `t-trend ${trend[0]}` }, h("span", { "aria-hidden": "true" }, trend[1]), ` ${trend[2]}`),
          v.canDays ? h("span", { class: "t-days" }, `${v.plan.days[b.id]} field days`) : null));
    }
  }
  return { el, update, select, tile: (id) => tiles[id] };
}
