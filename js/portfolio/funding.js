// The funding instrument for one brand: a throttle (a native range input in $10K steps that can't overspend), the team's
// return curve above it, a live delta against the plan as it stood before this move, keep-or-spend, and "Move $10K from…".
// Every number is the team's forecast (forecastQuarter on a hypothetical plan), labelled as such; nothing here simulates.
import { h, s } from "../ui.js";
import * as S from "../sim.js";
import { $k, signed$, per$ } from "./fmt.js";

const STEP = S.STEP.trade;
const CONF = { High: "the team is sure", Medium: "roughly", Low: "the team is unsure" };
const phone = () => matchMedia("(max-width: 759px)").matches;

export function createFunding({ actions }) {
  let id = null, ui = null, ctx = null, base = null, raf = 0, pending = 0, curveKey = "", curvePts = [], drawnW = 0;
  const ro = new ResizeObserver(() => { if (ui && ctx && Math.round(ui.curve.clientWidth) !== drawnW) drawCurve(); });

  // The trade plan as it stood before this move: taken when a drag or key press starts, or a fine control or move is used.
  const rebase = () => { if (ctx && id) base = { ...ctx.plan.trade }; };
  const hypo = (plan, changes) => ({ ...plan, trade: { ...plan.trade, ...changes } });

  function build(b) {
    const u = {};
    u.amt = h("b", { class: "num fd-amt" });
    u.curve = h("div", { class: "fd-curve" });
    u.range = h("input", { type: "range", min: "0", step: String(STEP), class: "fd-throttle", "aria-label": `Trade for ${b.name} this quarter` });
    u.lo = h("span", {}, "$0"); u.hi = h("span");
    u.delta = h("p", { class: "fd-delta" });
    u.shelf = h("p", { class: "fd-shelf", hidden: true });
    u.keep = h("div", { class: "fd-keep" });
    u.sel = h("select", { class: "fd-select", "aria-label": `Move $10K to ${b.name} from` });
    u.moveOut = h("dl", { class: "fd-move-out" });
    u.moveBtn = h("button", { type: "button", class: "fd-move-btn" }, "Make this move");
    u.range.addEventListener("pointerdown", rebase);
    u.range.addEventListener("keydown", (e) => { if (/^(Arrow|Page|Home|End)/.test(e.key)) rebase(); });
    // Readouts follow the throttle every frame; the plan is written through js/portfolio/plan.js.
    u.range.addEventListener("input", () => { pending = +u.range.value; if (!raf) raf = requestAnimationFrame(() => { raf = 0; actions.setTrade(id, pending); }); });
    // The end of a gesture always lands, even where animation frames are paused (a background tab).
    u.range.addEventListener("change", () => { cancelAnimationFrame(raf); raf = 0; actions.setTrade(id, +u.range.value); });
    u.sel.addEventListener("change", () => { u.src = u.sel.value; if (ctx) update(null, ctx); });
    u.moveBtn.addEventListener("click", () => { if (u.src) { rebase(); actions.move(u.src, id); } });
    u.root = h("div", { class: "fd-funding" },
      h("div", { class: "fd-fund-head" }, u.amt, h("span", { class: "fd-k" }, "Next $10K at each amount · team forecast")),
      u.curve, u.range, h("div", { class: "fd-ends", "aria-hidden": "true" }, u.lo, u.hi), u.shelf, u.delta, u.keep,
      h("div", { class: "fd-move" }, h("label", { class: "fd-k" }, "Move $10K here from", u.sel), u.moveOut, u.moveBtn));
    ro.disconnect(); ro.observe(u.curve);
    return u;
  }

  // c: { b, r, rows, f (the draft's forecast), plan, state, qi, free }
  function update(slot, c) {
    ctx = c;
    if (id !== c.b.id || !ui) { id = c.b.id; ui = build(c.b); base = { ...c.plan.trade }; }
    if (slot && ui.root.parentNode !== slot) slot.replaceChildren(ui.root);
    const { plan, state, qi, r, f } = c, x = plan.trade[id], max = Math.max(x, x + c.free);
    const later = qi === 3 ? "next year" : "next quarter";
    ui.amt.textContent = $k(x);
    ui.range.max = String(max);
    if (+ui.range.value !== x) ui.range.value = String(x);
    ui.hi.textContent = $k(max);
    const nextWords = r.conf === "High" ? `about ${per$(r.next)} back` : `about ${per$(r.nextLo)} to ${per$(r.nextHi)} back, the team's range`;
    ui.range.setAttribute("aria-valuetext", `${$k(x)}. Next $10K ${nextWords}.`);
    ui.range.disabled = max === 0;

    // The return curve: the team's Next $10K at every amount this brand could get, probed on hypothetical plans.
    const key = [id, max, plan.focus[id], plan.days[id], plan.answer, qi].join("|");
    if (key !== curveKey || ui.state !== state) {
      curveKey = key; ui.state = state; curvePts = [];
      for (let v = 0; v <= max; v += STEP) { const row = S.forecastQuarter(state, hypo(plan, { [id]: v }), qi).rows.find((w) => w.id === id); curvePts.push({ x: v, next: row.next, lo: row.nextLo, hi: row.nextHi, xOff: row.xOff, floor: row.floor }); }
    }
    drawCurve();
    ui.shelf.hidden = !(plan.focus[id] === "on" && r.floor > 0 && r.xOff < r.floor);
    ui.shelf.textContent = `The shelf isn't defended: all of ${c.b.name}'s trade goes on-premise, and it needs ${$k(r.floor)} off-premise to hold its shelf space.`;

    // Live delta against the plan before this move, for the brand and for the portfolio.
    const moved = base && S.brandIds.some((k) => base[k] !== plan.trade[k]);
    if (!moved) ui.delta.textContent = "Each step is $10K. Drag, or use the arrow keys.";
    else {
      const fb = S.forecastQuarter(state, { ...plan, trade: base }, qi), rb = fb.rows.find((w) => w.id === id), rn = f.rows.find((w) => w.id === id);
      const bNow = rn.gp - rb.gp, bLater = rn.carryNext - rb.carryNext, pNow = f.gp - fb.gp, pLater = f.carryNext - fb.carryNext;
      const line = (now, lat) => `this quarter ≈ ${signed$(now)}${Math.abs(lat) >= 0.05 ? ` · ${signed$(lat)} lands ${later}` : ""}`;
      ui.delta.replaceChildren(h("span", { class: "fd-k" }, `${c.b.name}: ${$k(base[id])} → ${$k(x)} · team forecast`), h("br"),
        Math.abs(bNow - pNow) < 0.05 && Math.abs(bLater - pLater) < 0.05
          ? `${line(bNow, bLater)}, for ${c.b.name} and for the portfolio (the money comes from, or goes back to, free trade).`
          : `${c.b.name}: ${line(bNow, bLater)}. Portfolio: ${line(pNow, pLater)}.`);
    }

    // Keep or spend: keeping $10K is certain; spending it returns whatever the curve really is.
    const back = (m) => $k(m * STEP);
    ui.keep.replaceChildren(
      h("div", {}, h("span", { class: "fd-k" }, "Keep $10K"), h("b", { class: "num good" }, "+$10K"), h("span", {}, "to the score, for certain")),
      h("div", {}, h("span", { class: "fd-k" }, `Spend it on ${c.b.id} · team forecast`), h("b", { class: "num" }, r.conf === "High" ? `≈ ${back(r.next)}` : `≈ ${back(r.nextLo)}–${back(r.nextHi)}`),
        h("span", {}, r.conf === "High" ? "back, this quarter and later" : "back, this quarter and later (the team's range)")));

    // Move $10K from another brand: the source defaults to the funded brand with the lowest Next $10K.
    const sources = c.rows.filter((w) => w.id !== id && (plan.trade[w.id] || 0) >= STEP).sort((a, b) => a.next - b.next);
    if (!sources.some((w) => w.id === ui.src)) ui.src = sources[0]?.id;
    ui.sel.replaceChildren(...sources.map((w) => h("option", { value: w.id, selected: w.id === ui.src }, `Brand ${w.id} · ${$k(plan.trade[w.id])} · next ≈ ${per$(w.next)}`)));
    ui.sel.disabled = ui.moveBtn.disabled = !sources.length;
    if (!sources.length) { ui.moveOut.replaceChildren(h("dd", {}, "No other brand has $10K to move.")); return; }
    const src = ui.src, f2 = S.forecastQuarter(state, hypo(plan, { [src]: plan.trade[src] - STEP, [id]: x + STEP }), qi);
    const s0 = f.rows.find((w) => w.id === src), s1 = f2.rows.find((w) => w.id === src), t0 = f.rows.find((w) => w.id === id), t1 = f2.rows.find((w) => w.id === id);
    const lostNow = s0.gp - s1.gp + STEP, lostLater = s0.carryNext - s1.carryNext, getNow = t1.gp - t0.gp + STEP, getLater = t1.carryNext - t0.carryNext;
    const extra = (v) => (Math.abs(v) >= 0.05 ? ` (${signed$(v)} ${later})` : "");
    const range = (w) => (w.conf === "High" ? per$(w.next) : `${per$(w.nextLo)}–${per$(w.nextHi)}`);
    const item = (k, v) => [h("dt", {}, k), h("dd", {}, v)];
    ui.moveOut.replaceChildren(
      ...item("What changes", `this quarter ≈ ${signed$(f2.gp - f.gp)}${Math.abs(f2.carryNext - f.carryNext) >= 0.05 ? ` · ${signed$(f2.carryNext - f.carryNext)} lands ${later}` : ""}`),
      ...item("What you give up", `Brand ${src}'s last $10K, ≈ ${$k(lostNow)} back this quarter${extra(lostLater)}`),
      ...item("What you get", `Brand ${id}'s next $10K, ≈ ${$k(getNow)} back this quarter${extra(getLater)}`),
      ...item("What stays uncertain", `Brand ${id}: ${CONF[t0.conf]} (${range(t0)} per $1). Brand ${src}: ${CONF[s0.conf]} (${range(s0)} per $1).`));
  }

  function drawCurve() {
    if (!ui || !ctx) return;
    const W = Math.max(240, Math.round(ui.curve.clientWidth) || 340), H = phone() ? 78 : 96, pad = 11, T = 8, B = 4; drawnW = Math.round(ui.curve.clientWidth);
    const pts = curvePts, max = pts.at(-1)?.x || 0, x = ctx.plan.trade[id];
    const top = Math.max(2, ...pts.map((p) => p.hi)) * 1.05;
    const X = (v) => (max ? pad + (v / max) * (W - 2 * pad) : W / 2), Y = (m) => T + (1 - m / top) * (H - T - B);
    const g = s("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: "fd-curve-svg", role: "img",
      "aria-label": `The team's forecast for the next $10K at every amount from $0 to ${$k(max)}. It is ${per$(pts[0]?.next || 0)} at $0 and ${per$(pts.at(-1)?.next || 0)} at ${$k(max)}; $1 back is breakeven.` });
    if (pts.length > 1) {
      g.append(s("polygon", { class: "band", points: [...pts.map((p) => `${X(p.x)},${Y(p.hi)}`), ...[...pts].reverse().map((p) => `${X(p.x)},${Y(p.lo)}`)].join(" ") }),
        s("polyline", { class: "line", points: pts.map((p) => `${X(p.x)},${Y(p.next)}`).join(" ") }));
    }
    g.append(s("line", { class: "even", x1: pad, x2: W - pad, y1: Y(1), y2: Y(1) }), s("text", { class: "lbl", x: W - pad, y: Y(1) - 4, "text-anchor": "end" }, "$1 back: breakeven"));
    const floor = pts[0]?.floor || 0, at = floor > 0 ? pts.find((p) => p.xOff >= floor) : null;
    if (at) g.append(s("line", { class: "floor", x1: X(at.x), x2: X(at.x), y1: T, y2: H - B }), s("text", { class: "lbl floor-t", x: X(at.x) + 4, y: T + 8 }, "shelf floor"));
    const cur = pts.find((p) => p.x === x);
    if (cur) g.append(s("line", { class: "cur", x1: X(x), x2: X(x), y1: T, y2: H - B }), s("circle", { class: "cur-pt", cx: X(x), cy: Y(cur.next), r: 4 }));
    ui.curve.replaceChildren(g);
  }

  return { update, rebase };
}
