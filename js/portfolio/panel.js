// The inspection panel: everything about one brand, and its controls. On desktop it sits beside the map, sticky under
// the deck. Under 1024px it is a non-modal bottom sheet with a mini-map rail, prev/next, expand, and Esc to close.
// It never edits the plan itself: every control calls an action the page provides.
import { h, s as svg } from "../ui.js";
import * as S from "../sim.js";
import { money } from "../models.js";
import { $k, per$, pts, tone, verdictOf, gainOf } from "./fmt.js";
import { CHANNELS, readOf, rangeText, rangeBar, confWord, requestScoutNote } from "./recon.js";

const IDS = S.brandIds;
const put = (el, ...kids) => el.replaceChildren(...kids.flat().filter((k) => k != null && k !== false)); // replaceChildren would print "null"
const narrow = () => matchMedia("(max-width: 1023px)").matches;

export function createPanel({ actions, onSelect, onClose, extra }) {
  const rail = h("div", { class: "fd-rail", role: "group", "aria-label": "Switch brand" });
  const chips = Object.fromEntries(IDS.map((id) => [id, h("button", { type: "button", class: "fd-chip", onClick: () => onSelect(id) })]));
  rail.append(...Object.values(chips));
  const prevB = h("button", { type: "button", class: "fd-ctl", "aria-label": "Previous brand", onClick: () => step(-1) }, "‹");
  const nextB = h("button", { type: "button", class: "fd-ctl", "aria-label": "Next brand", onClick: () => step(1) }, "›");
  const tall = h("button", { type: "button", class: "fd-ctl", "aria-label": "Expand", "aria-pressed": "false", onClick: () => { const on = !el.classList.contains("is-tall"); el.classList.toggle("is-tall", on); tall.setAttribute("aria-pressed", String(on)); tall.textContent = on ? "⌄" : "⌃"; } }, "⌃");
  const close = h("button", { type: "button", class: "fd-ctl", "aria-label": "Close", onClick: () => onClose() }, "×");
  const body = h("div", { class: "fd-panel-body" });
  const el = h("section", { class: "fd-panel fd-sheet", id: "fd-panel", role: "region", "aria-label": "Brand details" },
    h("div", { class: "fd-sheet-head" }, rail, h("div", { class: "fd-sheet-ctl" }, prevB, nextB, tall, close)), body);
  let id = null, ui = null;
  const step = (d) => onSelect(IDS[(IDS.indexOf(id) + d + IDS.length) % IDS.length]);
  const onKey = (e) => {
    if (!el.isConnected) { document.removeEventListener("keydown", onKey); return; }
    if (e.key === "Escape" && narrow() && el.classList.contains("is-open")) { e.preventDefault(); onClose(); }
  };
  document.addEventListener("keydown", onKey);

  // Build the brand's controls once, so focus stays put while the numbers update around it.
  function build(b, c) {
    const q = (k, ...kids) => h("span", { class: k }, ...kids);
    const u = {};
    u.title = h("h3", { tabindex: "-1" }, b.name);
    u.note = h("p", { class: "fd-note" });
    u.finding = h("div", { class: "fd-finding", hidden: true });
    u.next = h("div", { class: "fd-next" });
    u.chan = h("div", { class: "fd-chan" });
    u.lastQ = h("p", { class: "fd-lastq", hidden: true });
    u.amt = h("output", { class: "num amt" }); u.was = q("was");
    u.minus = h("button", { type: "button", "aria-label": `Take $10K from ${b.name}`, onClick: () => actions.trade(b.id, -1) }, "−");
    u.plus = h("button", { type: "button", "aria-label": `Give $10K to ${b.name}`, onClick: () => actions.trade(b.id, 1) }, "+");
    u.floorWarn = h("p", { class: "floor-warn", hidden: true });
    u.split = h("p", { class: "fd-split" });
    u.focus = Object.entries(S.FOCUS).map(([k, label]) => h("button", { type: "button", dataset: { k }, onClick: () => actions.focus(b.id, k) }, label));
    u.dOut = h("output", { class: "num" }); u.dHint = q("hint");
    u.dMinus = h("button", { type: "button", "aria-label": `One fewer field day for ${b.name}`, onClick: () => actions.days(b.id, -1) }, "−");
    u.dPlus = h("button", { type: "button", "aria-label": `One more field day for ${b.name}`, onClick: () => actions.days(b.id, 1) }, "+");
    u.scout = h("button", { type: "button", class: "sim-scout", onClick: () => actions.scout(b.id) });
    u.reconK = h("p", { class: "fd-k" });
    u.ranges = h("dl", { class: "fd-ranges" });
    u.pips = h("span", { class: "fd-pipwrap" });
    u.scoutSub = h("p", { class: "fd-scout-sub" });
    u.reqNote = h("p", { class: "fd-scout-sub muted", hidden: true });
    u.details = h("dl", {});
    u.lastLine = h("p", { class: "muted", hidden: true });
    u.extra = h("div", { class: "fd-extra" }); // the funding instrument (stage 4) mounts here
    put(body, 
      h("div", { class: "fd-id" }, u.title, q("fd-cat", b.category), h("span", { class: "chip" }, b.role)),
      u.finding,
      h("div", { class: "fd-block" }, h("p", { class: "fd-k" }, "Next $10K · team forecast"), u.next, u.chan, u.lastQ),
      h("div", { class: "fd-block" }, h("p", { class: "fd-k" }, "Trade this quarter"), u.extra,
        h("div", { class: "sim-alloc fd-alloc" }, u.minus, h("div", { class: "mid" }, u.amt, u.was), u.plus), u.floorWarn, u.split),
      c.canFocus ? h("div", { class: "fd-block" }, h("p", { class: "fd-k", id: `fd-focus-${b.id}` }, "Where its support goes"), h("div", { class: "sim-focus", role: "group", "aria-labelledby": `fd-focus-${b.id}` }, ...u.focus)) : null,
      c.canDays ? h("div", { class: "fd-block sim-days" }, h("span", { class: "k" }, "Field days"), h("div", { class: "ctl" }, u.dMinus, u.dOut, u.dPlus), u.dHint) : null,
      h("div", { class: "fd-block fd-recon" }, u.reconK, u.note, u.ranges, h("div", { class: "fd-scoutrow" }, u.scout, u.pips), u.scoutSub, u.reqNote),
      h("details", { class: "fd-details" }, h("summary", {}, "Details"), u.details, u.lastLine));
    return u;
  }

  // c: { b, r (forecast row), rows, plan, free, freeDays, scoutsLeft, state, last (last quarter's row), qi, canFocus, canDays, finding }
  function update(c) {
    const { b, r, plan, state } = c;
    if (id !== b.id || !ui || ui.canFocus !== c.canFocus || ui.canDays !== c.canDays) { id = b.id; ui = build(b, c); ui.canFocus = c.canFocus; ui.canDays = c.canDays; el.setAttribute("aria-label", `${b.name} details`); }
    // Rail: every brand's letter, a Next $10K mark (shape and colour) and its funding, so the world stays in view.
    for (const row of c.rows) {
      const ch = chips[row.id], g = row.next >= 1.02 ? ["good", "▲", "earns"] : row.next <= 0.98 ? ["bad", "▼", "loses"] : ["even", "–", "breaks even"];
      ch.replaceChildren(h("b", {}, row.id), h("span", { class: `dot ${g[0]}`, "aria-hidden": "true" }, g[1]), h("span", { class: "num" }, $k(plan.trade[row.id] || 0)));
      ch.setAttribute("aria-label", `Brand ${row.id}, ${$k(plan.trade[row.id] || 0)}, next $10K ${g[2]}`);
      ch.setAttribute("aria-current", String(row.id === b.id));
    }
    const scouted = state.scouted[b.id] !== undefined;
    put(ui.note, scouted ? h("span", { class: "scouted" }, `Scouted in ${S.QUARTERS[state.scouted[b.id]].id}. `) : null, b.note);
    ui.finding.hidden = !c.finding;
    if (c.finding) ui.finding.replaceChildren(h("p", { class: "fd-k" }, `Scout report, ${S.QUARTERS[c.finding.q].id}`), h("p", {}, c.finding.text));
    const gain = Math.round((r.next - 1) * 100) / 10;
    put(ui.next, h("b", { class: "num" }, r.conf === "High" ? `≈ ${per$(r.next)} back` : `≈ ${per$(r.nextLo)}–${per$(r.nextHi)} back`),
      h("span", { class: `pill ${r.next >= 1.02 ? "good" : r.next <= 0.98 ? "bad" : ""}` }, Math.abs(gain) < 0.2 ? "breaks even" : gain > 0 ? `earns ${$k(gain)}` : `loses ${$k(-gain)}`),
      r.conf !== "High" ? h("span", { class: "conf" }, r.conf === "Low" ? "unsure: the team's range" : "roughly: the team's range") : null);
    const [offT, offC] = gainOf(r.mOff, $k), [onT, onC] = gainOf(r.mOn, $k);
    ui.chan.replaceChildren(
      h("span", {}, h("b", {}, "Off-premise"), ` ${per$(r.mOff)} back · `, h("span", { class: offC }, offT)),
      h("span", {}, h("b", {}, "On-premise"), ` ${per$(r.mOn)} back · `, h("span", { class: onC }, onT), `, 40% of it lands ${c.qi === 3 ? "next year" : "next quarter"}`));
    const last = c.last;
    ui.lastQ.hidden = !last;
    if (last) ui.lastQ.replaceChildren(`${S.QUARTERS[c.qi - 1].id}: `, ...[["off-premise", last.mOffLast, last.xOff < last.floor], ["on-premise", last.mOnLast, false]].filter(([, m]) => m != null)
      .flatMap(([ch, m, under], i) => [i ? " · " : "", `${ch} `, h("b", { class: verdictOf(m, under).cls }, verdictOf(m, under).text.toLowerCase())]));
    const x = plan.trade[b.id], base = S.lastYearPlan().trade[b.id];
    ui.amt.textContent = $k(x);
    ui.was.textContent = x === base ? "same as last year" : `${x > base ? "+" : "−"}${$k(Math.abs(x - base))} vs last year`;
    ui.plus.disabled = c.free < S.STEP.trade; ui.minus.disabled = x <= 0;
    ui.floorWarn.hidden = !(r.floor && r.xOff < r.floor);
    ui.floorWarn.textContent = `Off-premise gets ${$k(r.xOff)} of the ${$k(x)}, and this brand needs ${$k(r.floor)} off-premise to hold its shelf space${r.floor > b.floor ? " this quarter" : ""}.${c.canFocus ? " Set it to Off-premise, or add $10K." : " Add $10K, or expect to lose some base volume."}`;
    const mix = plan.focus[b.id] || "both";
    ui.split.textContent = x ? `Where ${b.name}'s ${$k(x)} goes: off-premise ${$k(r.xOff)} · on-premise ${$k(r.xOn)}${mix === "both" ? ` (Both = its usual ${Math.round(b.share * 100)}% on-premise mix)` : ""}` : `${b.name} gets nothing this quarter.`;
    ui.focus.forEach((f) => f.setAttribute("aria-pressed", String(f.dataset.k === mix)));
    ui.dOut.textContent = `${plan.days[b.id]} d`; ui.dPlus.disabled = c.freeDays < 1; ui.dMinus.disabled = plan.days[b.id] <= 0;
    ui.dHint.textContent = `next day ≈ ${$k(r.nextDay)}`;
    const on = plan.scout.includes(b.id);
    ui.scout.textContent = scouted ? "Scouted" : on ? "Scouting ✓" : "Send a scout";
    ui.scout.setAttribute("aria-pressed", String(on));
    ui.scout.disabled = scouted || (!on && c.scoutsLeft <= 0);
    ui.scout.title = scouted ? "" : "A rep finds out how this brand really responds, in both channels. Two scouts a year.";
    // What the team doesn't know: the team's range on each channel (belief ± spread, not a truth interval).
    ui.reconK.textContent = scouted ? "What the team knows now" : "What the team doesn't know";
    put(ui.ranges, ...CHANNELS.flatMap(([ch, label]) => {
      const rd = readOf(state.beliefs[b.id], b.id, ch);
      return [h("dt", {}, label), h("dd", {}, rangeBar(rd, ch), h("span", { class: "num" }, rangeText(rd, ch)), h("span", { class: `cw conf-${rd.conf}` }, confWord(rd.conf)))];
    }));
    ui.pips.replaceChildren(svg("svg", { class: "fd-pips", viewBox: `0 0 ${S.SCOUTS * 16 - 2} 12`, width: S.SCOUTS * 16 - 2, height: 12, role: "img", "aria-label": `${Math.max(0, c.scoutsLeft)} of ${S.SCOUTS} scouts left this year` },
      ...Array.from({ length: S.SCOUTS }, (_, i) => svg("circle", { cx: 6 + i * 16, cy: 6, r: 4.5, class: i < c.scoutsLeft ? "on" : "off" }))));
    ui.scoutSub.textContent = scouted ? "The ranges above are the team's read since the rep reported back."
      : on ? "Scout sent. Reports back after the quarter." : c.scoutsLeft > 0 ? "Reports back after the quarter." : "No scouts left this year.";
    ui.reqNote.hidden = !c.reqScout;
    ui.reqNote.textContent = requestScoutNote(c.reqScout) || "";
    const bel = state.beliefs[b.id];
    const row = (k, v, cls) => h("div", {}, h("dt", {}, k), h("dd", { class: cls || null }, v));
    put(ui.details, row("Revenue", money(b.revenue)), row(last ? `Growth in ${S.QUARTERS[c.qi - 1].id}` : "Growth", pts(last ? last.growth : b.growth), tone(last ? last.growth : b.growth)),
      row("Margin", `${b.gm}%`), row("On-premise share", `${Math.round(b.share * 100)}%`), row("Expected return, on / off", `${per$(bel.on.b)} / ${per$(bel.off.b)}`),
      b.floor ? row("Off-premise shelf needs", `${$k(b.floor)} a quarter`) : null);
    ui.lastLine.hidden = !(last && last.x);
    if (last && last.x) ui.lastLine.textContent = `Last quarter: ${per$(last.perDollar)} back per $1 on ${$k(last.x)}${last.onReturn && last.offReturn ? ` (on-premise ${per$(last.onReturn)}, off-premise ${per$(last.offReturn)})` : ""}.`;
    extra?.(ui.extra, c);
  }

  return {
    el, update,
    get id() { return id; },
    open(focus) { el.classList.add("is-open"); if (focus && narrow()) ui?.title.focus({ preventScroll: true }); },
    close() { el.classList.remove("is-open", "is-tall"); tall.setAttribute("aria-pressed", "false"); tall.textContent = "⌃"; },
    focusTitle() { ui?.title.focus({ preventScroll: true }); },
  };
}
