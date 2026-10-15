// The quarter's debrief (the results screen), in a fixed order:
//  1 landing (the quarter and the year so far against last year's plan, the tier bar, actuals next to forecast)
//  2 where the score came from (attribution(), plus one split the page computes: last quarter's carry landing)
//  3 what happened during the quarter (q.events, shown statically, so reduced-motion players see them too)
//  4 the request's outcome · 5 achievement news · 6 the market outcome · 7 the return table
//  8 scout reports (finding text, and the team's range before → after) · 9 chain cards · 10 what the team learned
//  11 forecast vs actual charts, in a disclosure.
// Everything here is the quarter's own output after it closed; nothing previews a later quarter.
import { h, s as svg, eyebrow, arrow, says } from "../ui.js";
import * as S from "../sim.js";
import { pct } from "../models.js";
import { $k, signed$, pts, per$, delta, tone, verdictOf } from "./fmt.js";
import { rangeShift } from "./recon.js";

// The chain cards a results screen shows: the quarter's biggest bet, and the broken chain if it is still breaking.
// The briefing reads the same rule, so it only quotes a chain card the player has actually been shown.
export const shownChains = (q) => {
  const bigBet = [...q.rows].sort((a, b) => b.x - a.x)[0], broken = q.rows.find((r) => r.chainOff.kind === "break");
  return [bigBet && bigBet.x ? bigBet : null, broken && broken.id !== bigBet?.id ? broken : null].filter(Boolean);
};

const tile = (label, value, sub, cls = "") => h("div", { class: "ev-tile" }, h("span", { class: "k" }, label), h("span", { class: `v ${cls}` }, value), sub ? h("span", { class: "sim-sub" }, sub) : null);

export function tierBar(score, T) {
  const max = T.at(-1).at * 1.2, x = (v) => `${Math.max(0, Math.min(100, (v / max) * 100))}%`;
  return h("div", { class: "sim-tierbar", "aria-label": `Year so far ${signed$(score)}. ${T.map((t) => `${t.name} at ${signed$(t.at)}`).join(", ")}` },
    h("div", { class: "track" }, h("i", { class: score >= 0 ? "" : "neg", style: { width: x(Math.abs(score)) } }), ...T.map((t) => h("span", { class: `mark t-${t.name.toLowerCase()}`, style: { left: x(t.at) } }, t.name))));
}

// c: { q (the quarter just played), prev (the quarter before, or null), habitQ (the same quarter under last year's plan),
//      plans (all played plans), vi, soFar, T (tiers), hasNext, onScout(id), onNext() }
export function debriefView(c) {
  const { q, habitQ, vi, T } = c;
  const Q = S.QUARTERS[q.qi], nextQ = S.QUARTERS[q.qi + 1];
  const qScore = q.gp - habitQ.gp, soFar = c.soFar;
  const d = (a, f) => ((a - f) / Math.abs(f)) * 100;
  const later = nextQ ? "next quarter" : "next year";

  // 1 Landing. Banked and in the air are shown separately: carry is next quarter's (or next year's) money, not this one's.
  const air = S.brandIds.reduce((a, id) => a + q.nextState.carry[id] - habitQ.nextState.carry[id], 0);
  const borrowed = q.nextState.borrowed - habitQ.nextState.borrowed;
  const landing = [
    h("div", {}, eyebrow(`${Q.id} results`), h("h2", { style: { marginTop: "10px" }, tabindex: "-1" }, "What actually happened?")),
    h("div", { class: "sim-scorecard" },
      h("div", {}, h("span", { class: "k" }, `${Q.id} vs last year's plan`), h("b", { class: `num ${tone(qScore / 10)}` }, signed$(qScore))),
      h("div", {}, h("span", { class: "k" }, "Year so far, banked"), h("b", { class: `num ${tone(soFar / 10)}` }, signed$(soFar))),
      tierBar(soFar, T),
      Math.abs(air) >= 1 || borrowed ? h("p", { class: "fd-air" }, [
        Math.abs(air) >= 1 ? `In the air: ${signed$(air)} of on-premise work lands ${later}, against last year's plan.` : "",
        borrowed ? ` The load-in took ${$k(borrowed)} from next year.` : ""].join("").trim()) : null),
    h("div", { class: "ev-tiles sim-tiles" },
      tile("Revenue", $k(q.rev), `forecast ${$k(q.revF)} · ${pct(d(q.rev, q.revF), 1)}`, tone(d(q.rev, q.revF))),
      tile("Gross profit after trade", $k(q.gp), `forecast ${$k(q.gpF)} · ${pct(d(q.gp, q.gpF), 1)}`, tone(d(q.gp, q.gpF))),
      tile("On-premise revenue", $k(q.revOn), `forecast ${$k(q.revOnF)} · ${pct(d(q.revOn, q.revOnF), 1)}`, tone(d(q.revOn, q.revOnF))),
      tile("Off-premise revenue", $k(q.revOff), `forecast ${$k(q.revOffF)} · ${pct(d(q.revOff, q.revOffF), 1)}`, tone(d(q.revOff, q.revOffF)))),
  ];

  // 2 Where the score came from: attribution() lines, and the carry split (the only attribution the page adds).
  const A = S.attribution(q, habitQ);
  const top = A.lines.slice(0, 5), rest = A.total - top.reduce((a, l) => a + l.d, 0);
  const name = (l) => `${l.id ? `Brand ${l.id}` : ""}${l.why ? `${l.id ? ": " : ""}${l.why}` : ""}`;
  const carryOf = (l) => (l.id ? q.stateBefore.carry[l.id] - habitQ.stateBefore.carry[l.id] : 0);
  const split = (l) => { const cs = carryOf(l); return Math.abs(cs) >= 1 && l.why !== "last quarter's on-premise work landing" ? h("span", { class: "fd-split-c" }, Math.sign(cs) === Math.sign(l.d) && Math.abs(cs) <= Math.abs(l.d) ? `of which ${signed$(cs)} is last quarter's on-premise work landing` : `including ${signed$(cs)} from last quarter's on-premise work landing`) : null; };
  const headline = top.length ? `${Q.id} came in ${signed$(A.total)} against last year's plan. The biggest piece: ${name(top[0])} (${signed$(top[0].d)})${top[1] ? `, then ${name(top[1])} (${signed$(top[1].d)})` : ""}.` : `${Q.id} landed where last year's plan would have.`;
  const waterfall = h("div", { class: "sim-wf" }, eyebrow("Where the score came from"),
    h("ul", {}, ...top.map((l) => h("li", {}, h("b", { class: `num ${tone(l.d / 10)}` }, signed$(l.d)), h("span", {}, name(l), split(l)))),
      Math.abs(rest) >= 1 ? h("li", { class: "muted" }, h("b", { class: "num" }, signed$(rest)), h("span", {}, "everything else")) : null,
      h("li", { class: "total" }, h("b", { class: `num ${tone(A.total / 10)}` }, signed$(A.total)), h("span", {}, `${Q.id} against last year's plan`))));

  // 3 The quarter's events, in order, with nothing animated.
  const events = h("div", { class: "fd-events" }, eyebrow(`During ${Q.id}`),
    h("ol", { class: "sim-feed is-static" }, q.events.map((e) => h("li", {}, h("span", { class: "wk" }, `${S.QUARTERS[q.qi].months[Math.min(2, Math.floor((e.week - 1) / 4.34))]} · week ${e.week}`), h("span", {}, e.text)))));

  // 5 Achievement news.
  const before = S.achievementStatus(c.plans.slice(0, q.qi), vi), after = S.achievementStatus(c.plans.slice(0, q.qi + 1), vi);
  const changed = after.filter((a, i) => a.status !== before[i].status && a.status !== "open");
  const achLine = changed.length ? h("ul", { class: "sim-achnews" }, changed.map((a) => h("li", { class: a.status }, h("span", { class: "ic", "aria-hidden": "true" }, a.got ? "★" : "–"),
    h("span", {}, h("b", {}, a.got ? `Achievement unlocked: ${a.name}` : `Achievement missed: ${a.name}`), a.got ? "" : `. ${a.note || a.hint}`)))) : null;

  // 6 The market outcome.
  const outs = S.marketOutcome(q);
  const market = outs.length ? h("div", {}, eyebrow("The market"), ...outs.map((m) => h("p", { class: "sim-market-out" }, m.text))) : null;

  // 7 The return table.
  const returns = h("div", { class: "sim-byb" }, eyebrow("What the last $10K returned, by brand and channel"),
    h("p", { class: "muted", style: { marginTop: "8px", fontSize: "var(--fs-small)", maxWidth: "var(--measure)" } }, "The return on the last $10K you spent in each channel. Above $1 there was room to add; below it the money would have done more somewhere else."),
    returnTable(q, c.prev));

  // 8 Reconnaissance reports.
  const findings = q.rows.filter((r) => r.finding);
  const reports = findings.length ? h("div", {}, eyebrow("Your scout reports"), ...findings.map((r) => h("div", { class: "sim-report" }, h("b", {}, `Brand ${r.id}`), h("p", {}, r.finding),
    h("p", { class: "fd-k" }, "The team's range, before → after the report"), rangeShift(r)))) : null;

  // 9 Chain cards.
  const chains = h("div", {}, eyebrow("Follow the chain"), h("div", { class: "sim-chains" }, ...shownChains(q).map((r) => chainView(r, q, c))));

  // 10 What the team learned (scouted brands are covered by their reports).
  const learned = q.rows.map((r) => ({ r, dOn: r.after.on.b - r.before.on.b, dOff: r.after.off.b - r.before.off.b })).filter((x) => !x.r.finding && Math.max(Math.abs(x.dOn), Math.abs(x.dOff)) >= 0.15)
    .sort((a, b) => Math.max(Math.abs(b.dOn), Math.abs(b.dOff)) - Math.max(Math.abs(a.dOn), Math.abs(a.dOff))).slice(0, 3);
  const learnedEl = learned.length ? h("div", {}, eyebrow("What the team learned"), h("ul", { class: "sim-learned" }, learned.map(({ r, dOn, dOff }) => {
    const big = Math.abs(dOn) >= Math.abs(dOff) ? ["on-premise", r.before.on.b, r.after.on.b] : ["off-premise", r.before.off.b, r.after.off.b];
    return h("li", {}, h("b", {}, `Brand ${r.id}`), h("span", {}, `${big[0]}: ${per$(big[1])} → ${per$(big[2])} per $1`), h("span", { class: big[2] > big[1] ? "good" : "bad" }, big[2] > big[1] ? "better than we thought" : "worse than we thought"));
  }))) : null;

  // 11 Forecast vs actual, in a disclosure.
  const charts = forecastCharts(q, vi);

  const next = h("button", { type: "button", class: "btn btn-lg", onClick: () => c.onNext() }, nextQ ? `Plan ${nextQ.id} ` : "See your year ", arrow());
  return h("div", { class: "sim-flow" },
    ...landing,
    h("div", { class: "fd-wfwrap" }, says(q.insight || headline, q.insight ? "warn" : ""), waterfall),
    events,
    q.answer ? requestOutcome(q) : null,
    achLine, market, returns, reports, chains, learnedEl, charts,
    h("div", { class: "sim-go" }, next));
}

function requestOutcome(q) {
  const o = q.answer, r = o.extra ? q.rows.find((x) => x.id === o.extra.id) : null;
  const text = o.id === "take" && o.extra ? `You took Kroger's end-cap. Brand A's off-premise trade returned ${per$(r.offReturn || 0)} per $1 this quarter.` :
    o.id === "pay" ? `You paid Cascade's allowance. It went into the same channel that's been loading the distributor.` :
    o.id === "scout" ? "You sent a rep instead of money. The report is below." :
    o.menu ? `Brand ${o.menu} got the menu slot.${q.rows.find((x) => x.id === o.menu).xOn ? "" : " It had no other on-premise support this quarter."}` :
    o.load ? "You took the load-in. This quarter looks better; next year starts behind." :
    o.id === "pass" && q.dilemma.id === "endcap" ? "You passed on the end-cap and kept the $40K." : o.id === "pass" && q.dilemma.id === "loadin" ? "You passed on the load-in and shipped to demand." : "You said no.";
  return h("p", { class: "sim-outcome" }, h("b", {}, "The request: "), text);
}

// A plain verdict on each channel's last $10K: room to add, near the top, or past it (and whether it was covering the shelf).
function returnTable(q, prev) {
  const rows = q.rows.flatMap((r) => {
    const p = prev?.rows.find((x) => x.id === r.id);
    return [["off", "Off-premise", r.xOff, r.mOffLast, p?.mOffLast, r.xOff < r.floor && r.floor > 0], ["on", "On-premise", r.xOn, r.mOnLast, p?.mOnLast, false]]
      .filter(([, , x]) => x >= 10).map(([ch, label, x, m, pm, under]) => ({ id: r.id, ch, label, x, m, pm, under, v: verdictOf(m, under) }));
  }).sort((a, b) => (b.m ?? 0) - (a.m ?? 0));
  const trend = (m, pm) => (m == null || pm == null ? "" : m - pm > 0.05 ? "▲" : pm - m > 0.05 ? "▼" : "–");
  return h("div", { class: "table-wrap" }, h("table", { class: "table sim-rt" },
    h("thead", {}, h("tr", {}, h("th", {}, "Brand"), h("th", {}, "Channel"), h("th", { class: "num" }, "Spent"), h("th", { class: "num" }, h("span", { class: "rt-full" }, "Last $10K returned"), h("span", { class: "rt-short" }, "Returned")), h("th", { class: "num" }, "vs last Q"), h("th", {}, "Read"))),
    h("tbody", {}, rows.map((x) => h("tr", {}, h("td", {}, h("b", { style: { fontWeight: 500 } }, h("span", { class: "rt-full" }, "Brand "), x.id)), h("td", { class: "muted" }, h("span", { class: "rt-full" }, x.label), h("span", { class: "rt-short" }, x.ch === "off" ? "Off" : "On")), h("td", { class: "num" }, $k(x.x)),
      h("td", { class: `num ${x.v.cls}` }, x.m == null ? "—" : [per$(x.m), h("span", { class: "rt-full" }, " per $1")]), h("td", { class: "num muted" }, trend(x.m, x.pm)), h("td", {}, h("span", { class: `chip ${x.v.cls === "good" ? "chip-good" : x.v.cls === "bad" ? "chip-warn" : ""}` }, x.v.text)))))));
}

function chainView(r, q, c) {
  const ch = r.chainOff, on = r.chainOn, brk = ch.kind === "break";
  const scoutsLeft = q.nextState.scoutsLeft;
  const lane = (title, steps) => h("div", { class: "lane" }, h("p", { class: "lt" }, title), h("ol", {}, steps.map(([k, v, t]) => h("li", {}, h("span", { class: "k" }, k), h("span", { class: `v ${t}` }, v)))));
  const offSteps = brk
    ? [["Trade", $k(r.xOff), ""], ["Shipments", pts(ch.shipments), "good"], ["Distributor inventory", pts(ch.inventory), "bad"], ["Depletion", pts(ch.depletion), tone(ch.depletion)], ["Sell-through", pts(ch.sellThrough), tone(ch.sellThrough)]]
    : [["Trade", $k(r.xOff), ""], ["Distribution (ACV)", `${ch.acv >= 0 ? "+" : "−"}${Math.abs(ch.acv).toFixed(1)} pts`, tone(ch.acv * 2)], ["Velocity", pts(ch.velocity), tone(ch.velocity)], ["Promotion return", ch.promoReturn ? `${per$(ch.promoReturn)} per $1` : "none", ch.promoReturn ? (ch.promoReturn >= 1 ? "good" : "bad") : ""]];
  const onSteps = [["Trade", $k(r.xOn), ""], ["Placements this quarter", String(on.placements), on.placements ? "good" : ""], ["Pours", pts(on.pours), tone(on.pours)], ["30-day reorder rate", `${on.reorder}%`, on.reorder >= 60 ? "good" : ""]];
  // A brand already scouted can't be scouted again, so the button only appears while it would do something.
  const canSend = brk && scoutsLeft > 0 && c.hasNext && q.nextState.scouted[r.id] === undefined;
  return h("div", { class: `sim-chain ${brk ? "is-break" : ""}` },
    h("p", { class: "ttl" }, `Brand ${r.id} `, brk ? h("span", { class: "chip chip-warn" }, "the off-premise chain breaks here") : null),
    h("div", { class: "lanes" }, lane("Off-premise", offSteps), lane("On-premise", onSteps)),
    canSend ? h("button", { type: "button", class: "sim-scout", onClick: (e) => { c.onScout(r.id); e.currentTarget.textContent = "A scout will look into it next quarter ✓"; e.currentTarget.disabled = true; } }, `Send a scout to find out why (${scoutsLeft} left)`) : null);
}

// Forecast vs actual growth: a scatter and a miss-or-beat column chart, behind a disclosure, with a channel switch.
function forecastCharts(q, vi) {
  let view = "all";
  const NOISE = 2; // points of forecast error the sim's own noise can produce
  const board = h("div", { class: "sim-plots" }), boardNote = h("p", { class: "sim-dots-sum" });
  // Tap or click a brand on either chart and its numbers appear here (native tooltips never show on touch).
  const readoutFor = () => h("p", { class: "sim-readout", role: "status" }, "Tap a brand for its numbers.");
  const select = (g, text) => {
    board.querySelectorAll(".pt.on, .col.on").forEach((el) => el.classList.remove("on")); board.querySelectorAll(`[data-brand="${g.dataset.brand}"]`).forEach((el) => el.classList.add("on"));
    board.querySelectorAll(".sim-readout").forEach((p) => { p.textContent = "Tap a brand for its numbers."; p.classList.remove("on"); });
    const p = g.closest(".sim-fig")?.querySelector(".sim-readout"); if (p) { p.textContent = text; p.classList.add("on"); }
  };
  const drawTable = () => {
    const rows = q.rows.map((r) => {
      const share = S.simBrands(vi).find((b) => b.id === r.id).share;
      const f = view === "all" ? r.growthF : view === "on" ? (r.revOnF / (r.q * share) - 1) * 100 : (r.revOffF / (r.q * (1 - share)) - 1) * 100;
      const a = view === "all" ? r.growth : view === "on" ? (r.revOn / (r.q * share) - 1) * 100 : (r.revOff / (r.q * (1 - share)) - 1) * 100;
      const spend = view === "all" ? r.x : view === "on" ? r.xOn : r.xOff;
      // Both charts use the whole-point figures the labels show, so a dot's distance from the line is exactly its column.
      const fr = Math.round(f) || 0, ar = Math.round(a) || 0, dd = ar - fr;
      return { id: r.id, f: fr, a: ar, dd, spend, t: Math.abs(dd) < NOISE ? "even" : dd > 0 ? "good" : "bad" };
    }).sort((x, y) => x.id.localeCompare(y.id));
    const signal = rows.filter((x) => x.t !== "even");
    const tipText = (x) => `Brand ${x.id}: forecast ${pts(x.f)}, actual ${pts(x.a)} (${x.t === "even" ? "on plan" : `${delta(x.dd)} pts`}) · ${$k(x.spend)} trade`;
    const tip = (x) => svg("title", {}, tipText(x));
    const tappable = (g, x) => { g.dataset.brand = x.id; g.setAttribute("tabindex", "0"); g.setAttribute("role", "button"); g.addEventListener("click", () => select(g, tipText(x))); g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(g, tipText(x)); } }); return g; };
    board.replaceChildren(scatter(rows, tip, tappable), columns(rows, tip, tappable));
    const names = (list) => { const ids = list.map((x) => x.id); return `${ids.length > 1 ? "Brands" : "Brand"} ${ids.length > 1 ? `${ids.slice(0, -1).join(", ")} and ${ids.at(-1)}` : ids[0]}`; };
    const beat = signal.filter((x) => x.dd > 0), missed = signal.filter((x) => x.dd < 0);
    const parts = [beat.length && `${names(beat)} beat forecast`, missed.length && `${names(missed)} missed`].filter(Boolean).join("; ");
    boardNote.textContent = !signal.length ? "Every brand landed within a point of forecast. No signal here this quarter."
      : `${signal.length === 1 ? "1 brand" : `${signal.length} brands`} landed outside the noise: ${parts}. That's the signal; start there.`;
  };
  const ticks = (lo, hi) => { const step = hi - lo > 24 ? 10 : 5, out = []; for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push(v); return out; };
  const scatter = (rows, tip, tappable) => {
    const W = 360, H = 300, L = 56, R = 12, T = 14, B = 46;
    const vals = rows.flatMap((x) => [x.f, x.a]), step = Math.max(...vals) - Math.min(...vals) > 24 ? 10 : 5;
    const lo = Math.floor((Math.min(0, ...vals) - 1) / step) * step, hi = Math.ceil((Math.max(0, ...vals) + 1) / step) * step;
    const X = (v) => L + ((v - lo) / (hi - lo)) * (W - L - R), Y = (v) => H - B - ((v - lo) / (hi - lo)) * (H - T - B), band = NOISE - 0.5;
    const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-plot", role: "img", "aria-label": "Forecast versus actual growth by brand" });
    g.append(svg("polygon", { class: "band", points: [[lo, lo + band], [hi - band, hi], [hi, hi], [hi, hi - band], [lo + band, lo], [lo, lo]].map(([x, y]) => `${X(x)},${Y(y)}`).join(" ") }));
    for (const v of ticks(lo, hi)) g.append(
      svg("line", { class: v === 0 ? "axis" : "grid", x1: L, x2: W - R, y1: Y(v), y2: Y(v) }), svg("line", { class: v === 0 ? "axis" : "grid", y1: T, y2: H - B, x1: X(v), x2: X(v) }),
      svg("text", { x: L - 6, y: Y(v) + 4, "text-anchor": "end" }, pts(v)), svg("text", { x: X(v), y: H - B + 16, "text-anchor": v >= hi ? "end" : v <= lo ? "start" : "middle" }, pts(v)));
    g.append(svg("line", { class: "diag", x1: X(lo), y1: Y(lo), x2: X(hi), y2: Y(hi) }),
      svg("text", { class: "zone good", x: L + 8, y: T + 14 }, "Beat forecast"), svg("text", { class: "zone bad", x: W - R - 8, y: H - B - 8, "text-anchor": "end" }, "Missed forecast"),
      svg("text", { class: "ttl", x: (L + W - R) / 2, y: H - 8, "text-anchor": "middle" }, "Forecast growth →"),
      svg("text", { class: "ttl", x: 12, y: (T + H - B) / 2, "text-anchor": "middle", transform: `rotate(-90 12 ${(T + H - B) / 2})` }, "Actual growth →"));
    // Letters go on the side away from the diagonal (up-left for beats, down-right for misses) unless another label already sits there.
    const placed = rows.map((x) => [X(x.f), Y(x.a)]);
    const spotsFor = (t) => t === "good" ? [[-9, -6, "end"], [0, -10, "middle"], [-9, 4, "end"], [9, -6, "start"], [0, 17, "middle"], [9, 4, "start"]]
      : t === "bad" ? [[9, 12, "start"], [0, 17, "middle"], [9, 4, "start"], [-9, 12, "end"], [0, -10, "middle"], [-9, 4, "end"]]
      : [[8, 4, "start"], [-8, 4, "end"], [0, -9, "middle"], [0, 16, "middle"], [11, -7, "start"], [-11, -7, "end"]];
    const dots = [...rows].sort((a, b) => Math.abs(b.dd) - Math.abs(a.dd)).map((x) => {
      const cx = X(x.f), cy = Y(x.a);
      const spots = spotsFor(x.t);
      const [dx, dy, anchor] = spots.find(([dx, dy]) => placed.every((p) => (p[0] === cx && p[1] === cy) || Math.abs(p[0] - (cx + dx)) > 10 || Math.abs(p[1] - (cy + dy)) > 10)) || spots[0];
      placed.push([cx + dx, cy + dy]);
      return tappable(svg("g", { class: `pt ${x.t}` }, tip(x), svg("circle", { class: "hit", cx, cy, r: 16 }), svg("circle", { cx, cy, r: x.t === "even" ? 5 : 6 }), svg("text", { x: cx + dx, y: cy + dy, "text-anchor": anchor }, x.id)), x);
    });
    g.append(...dots.reverse());
    return h("figure", { class: "sim-fig" }, h("figcaption", {}, h("b", {}, "Forecast vs actual"), h("span", {}, "Above the line beat the forecast. Below it missed.")), g, readoutFor());
  };
  const columns = (rows, tip, tappable) => {
    const W = 360, H = 260, L = 56, R = 12, T = 22, B = 46;
    const top_ = Math.ceil((Math.max(3, ...rows.map((x) => x.dd)) + 2) / 2) * 2, bot = Math.floor((Math.min(-3, ...rows.map((x) => x.dd)) - 2) / 2) * 2;
    const Y = (v) => T + ((top_ - v) / (top_ - bot)) * (H - T - B), bw = (W - L - R) / rows.length, band = NOISE - 0.5;
    const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-plot", role: "img", "aria-label": "Points above or below forecast by brand" });
    g.append(svg("rect", { class: "band", x: L, width: W - L - R, y: Y(band), height: Y(-band) - Y(band) }));
    const stp = top_ - bot > 16 ? 4 : 2;
    for (let v = Math.ceil(bot / stp) * stp; v <= top_; v += stp) g.append(svg("line", { class: v === 0 ? "axis" : "grid", x1: L, x2: W - R, y1: Y(v), y2: Y(v) }), svg("text", { x: L - 6, y: Y(v) + 4, "text-anchor": "end" }, delta(v)));
    rows.forEach((x, i) => {
      const cx = L + bw * (i + 0.5), w = Math.min(26, bw * 0.56), top = Math.min(Y(x.dd), Y(0)), ht = Math.max(2, Math.abs(Y(x.dd) - Y(0)));
      g.append(tappable(svg("g", { class: `col ${x.t}` }, tip(x), svg("rect", { class: "hit", x: cx - bw / 2, width: bw, y: T, height: H - T - B }), svg("rect", { x: cx - w / 2, width: w, y: top, height: ht, rx: 3 }),
        svg("text", { class: "v", x: cx, y: x.dd >= 0 ? top - 5 : top + ht + 13, "text-anchor": "middle" }, x.dd ? delta(x.dd) : "0"),
        svg("text", { class: "id", x: cx, y: H - B + 18, "text-anchor": "middle" }, x.id)), x));
    });
    g.append(svg("text", { class: "ttl", x: (L + W - R) / 2, y: H - 8, "text-anchor": "middle" }, "Brand"),
      svg("text", { class: "ttl", x: 12, y: (T + H - B) / 2, "text-anchor": "middle", transform: `rotate(-90 12 ${(T + H - B) / 2})` }, "Points vs forecast"));
    return h("figure", { class: "sim-fig" }, h("figcaption", {}, h("b", {}, "Miss or beat"), h("span", {}, "Points above or below forecast. The grey band is normal noise.")), g, readoutFor());
  };
  drawTable();
  const viewBtns = [["all", "All"], ["on", "On-premise"], ["off", "Off-premise"]].map(([k, l]) => h("button", { type: "button", "aria-pressed": String(k === view), onClick: () => { view = k; viewBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === k))); drawTable(); }, dataset: { k } }, l));
  return h("details", { class: "sim-howto" }, h("summary", {}, "Forecast vs actual: how far the team's forecast was off"),
    h("div", { class: "sim-tablehead", style: { marginTop: "10px" } }, h("span", { class: "muted", style: { fontSize: "var(--fs-small)" } }, "Growth against the same quarter last year. Green beat the forecast, red missed it, grey landed within a point."), h("div", { class: "seg", role: "group", "aria-label": "Channel" }, ...viewBtns)),
    boardNote, board);
}
