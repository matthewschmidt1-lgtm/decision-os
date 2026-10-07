// "The rule in one picture": one still SVG per lesson, drawn from the same numbers as its drill, with the flip point
// marked and the learner's two picks ringed. Shown after the second round. No controls: the shape is the lesson.
import { s } from "../ui.js";
import * as M from "../models.js";

const W = 640, H = 230, L = 56, R = 16, T = 22, B = 46;
const txt = (x, y, t, a = {}) => s("text", { x, y, ...a }, t);
const fmtK = (v) => `${v < 0 ? "−" : ""}$${Math.abs(v)}K`;

// A plain chart frame: axes, a few gridlines, tick labels, an x-axis caption. Returns the svg and the two scales.
function frame({ xlo, xhi, ylo, yhi, xTicks, yTicks, fx, fy, xLabel, aria }) {
  const x = (v) => L + ((v - xlo) / (xhi - xlo)) * (W - L - R), y = (v) => H - B - ((v - ylo) / (yhi - ylo)) * (H - T - B);
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "pic", role: "img", "aria-label": aria });
  yTicks.forEach((v) => svg.append(s("line", { class: v === 0 ? "ax" : "grid", x1: L, x2: W - R, y1: y(v), y2: y(v) }), txt(L - 8, y(v) + 4, fy(v), { "text-anchor": "end" })));
  svg.append(s("line", { class: "ax", x1: L, x2: L, y1: T, y2: H - B }));
  xTicks.forEach((v, i) => svg.append(txt(x(v), H - B + 18, fx(v), { "text-anchor": i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle" })));
  svg.append(txt((L + W - R) / 2, H - 8, xLabel, { "text-anchor": "middle", class: "cap" }));
  return { svg, x, y };
}
const poly = (cls, pts) => s("polyline", { class: cls, points: pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ") });
const flip = (svg, x, label, { y1 = T, y2 = H - B, side = "right", ty = T + 14 } = {}) =>
  svg.append(s("line", { class: "flip", x1: x, x2: x, y1, y2 }), txt(x + (side === "right" ? 6 : -6), ty, label, { class: "l", "text-anchor": side === "right" ? "start" : "end" }));
const pick = (svg, cx, cy, label, { dy = 18, anchor = "middle", dx = 0 } = {}) =>
  svg.append(s("g", { class: "pick" }, s("circle", { cx, cy, r: 6 }), txt(cx + dx, cy + dy, label, { "text-anchor": anchor })));

const pictures = {
  "expected-value": () => {
    const big = (p) => p * 95 - 6, cedar = 16.1;
    const c = frame({ xlo: 5, xhi: 50, ylo: 0, yhi: 42, xTicks: [5, 20, 35, 50], yTicks: [0, 10, 20, 30, 40], fx: (v) => `${v}%`, fy: fmtK,
      xLabel: "Odds of winning the $95K account →", aria: "Expected value of the $95K account rises with its odds and passes Cedar Street's $16.1K at about 23%." });
    c.svg.append(poly("ln mid", [[c.x(5), c.y(cedar)], [c.x(50), c.y(cedar)]]), txt(c.x(50), c.y(cedar) - 7, "Cedar Street · $16.1K", { class: "l", "text-anchor": "end" }));
    c.svg.append(poly("ln acc", [[c.x(5), c.y(big(0.05))], [c.x(50), c.y(big(0.5))]]), txt(c.x(50), c.y(big(0.5)) - 8, "$95K account", { class: "l acc", "text-anchor": "end" }));
    flip(c.svg, c.x(23.3), "Flip point: 23%");
    pick(c.svg, c.x(15), c.y(big(0.15)), "Round 1 · 15% = $8.3K", { dy: 20 });
    pick(c.svg, c.x(30), c.y(big(0.3)), "Round 2 · 30% = $22.5K", { dy: -12 });
    return [c.svg, "The big account's value climbs with its odds. Below 23% Cedar Street wins; above it the big account does. Same rule, two answers."];
  },

  "bayesian-updating": () => {
    const steps = [["Start: base rate", 35], ["Top-third velocity ×2", 52], ["Competitors added it ×1.8", 66], ["She asked for data ×1.5", 74], ["Rep says don't bother ×0.7", 67]];
    const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "pic", role: "img", "aria-label": "Belief moves from 35% to 52%, 66%, 74%, then back to 67% as each clue is applied." });
    const x = (p) => L + 150 + ((p - 20) / 70) * (W - L - 150 - R), rowY = (i) => T + 14 + i * 36;
    [20, 40, 60, 80, 90].forEach((p) => svg.append(s("line", { class: "grid", x1: x(p), x2: x(p), y1: T, y2: H - B + 4 }), txt(x(p), H - B + 18, `${p}%`, { "text-anchor": "middle" })));
    steps.forEach(([label, p], i) => {
      const y = rowY(i), prev = i ? steps[i - 1][1] : null;
      svg.append(txt(L + 142, y + 4, label, { "text-anchor": "end", class: i ? "" : "l" }));
      if (prev != null) svg.append(s("line", { class: `arrow ${p < prev ? "bad" : "acc"}`, x1: x(prev), x2: x(p), y1: y, y2: y }));
      svg.append(s("circle", { class: i === 3 || i === 4 ? "dot acc" : "dot", cx: x(p), cy: y, r: 5 }), txt(x(p) + (p < prev ? -10 : 10), y + 4, `${p}%`, { class: "l", "text-anchor": p < prev ? "end" : "start" }));
    });
    svg.append(txt((L + W - R) / 2 + 70, H - 8, "Chance Fresh Thyme takes the second SKU →", { "text-anchor": "middle", class: "cap" }));
    return [svg, "Three decent clues carry you from 35% to 74%. The rep's comment, weak evidence, takes you back only to 67%. Each clue moves you by its strength, never to certainty."];
  },

  "decision-trees": () => {
    const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "pic", role: "img", "aria-label": "A tree: 55% high velocity worth $31.2K, 45% low velocity worth $0.8K, rolled back to $17.5K against a $10K cost of pursuing." });
    const box = (x, y, w, title, val, cls = "") => svg.append(s("rect", { class: `node ${cls}`, x: x - w / 2, y: y - 16, width: w, height: 32, rx: 6 }), txt(x, y - 2, title, { class: "l", "text-anchor": "middle" }), txt(x, y + 11, val, { "text-anchor": "middle", class: cls }));
    const edge = (x1, y1, x2, y2, label, cls = "") => svg.append(s("line", { class: `edge ${cls}`, x1, x2, y1, y2 }), label ? txt((x1 + x2) / 2 + 6, (y1 + y2) / 2 - 4, label) : null);
    const r = [120, 112], hi = [330, 56], lo = [330, 170], leaves = [[520, 36, "Expand", "$40K", "60%", "acc"], [520, 80, "List", "$18K", "40%", "acc"], [520, 150, "Diagnose", "$8K", "40%", ""], [520, 194, "Exit", "−$4K", "60%", "bad"]];
    edge(r[0] + 50, r[1], hi[0] - 50, hi[1], "55% high velocity", "acc"); edge(r[0] + 50, r[1], lo[0] - 50, lo[1], "45% low velocity");
    leaves.forEach(([x, y, t, v, p, cls], i) => { const from = i < 2 ? hi : lo; edge(from[0] + 50, from[1], x - 42, y, p, i < 2 ? "acc" : ""); box(x, y, 84, t, v, cls); });
    box(hi[0], hi[1], 100, "High velocity", "$31.2K", "acc"); box(lo[0], lo[1], 100, "Low velocity", "$0.8K");
    box(r[0], r[1], 100, "Today", "$17.5K", "acc");
    svg.append(txt(r[0], r[1] + 34, "Cost of pursuing: $10K", { "text-anchor": "middle" }), txt(r[0], r[1] + 48, "Worth it by $7.5K", { "text-anchor": "middle", class: "l" }));
    return [svg, "Roll the value back from the endings. The high-velocity branch carries $17.2K of the $17.5K, which is why velocity is the first fact to investigate."];
  },

  "multi-armed-bandits": () => {
    const meanD = (h) => (34 * 1.12 + 0.7 * h) / (34 + h); // D's running average if every new hour returned $0.70K
    const c = frame({ xlo: 0, xhi: 40, ylo: 0.6, yhi: 1.5, xTicks: [0, 10, 20, 30, 40], yTicks: [0.6, 0.8, 1.0, 1.2, 1.4], fx: (v) => `${v}h`, fy: (v) => `$${v.toFixed(2)}K`,
      xLabel: "More hours on Brand D, each returning $0.70K →", aria: "Brand D's average starts at $1.12K per hour and falls slowly with each $0.70K hour, crossing Brand A's $0.95K after about 23 hours." });
    const band = []; for (let h = 0; h <= 40; h += 2) band.push([c.x(h), c.y(meanD(h) + 0.9 / Math.sqrt(34 + h))]); for (let h = 40; h >= 0; h -= 2) band.push([c.x(h), c.y(meanD(h) - 0.9 / Math.sqrt(34 + h))]);
    c.svg.append(s("polygon", { class: "band", points: band.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ") }));
    c.svg.append(poly("ln mid", [[c.x(0), c.y(0.95)], [c.x(40), c.y(0.95)]]), txt(c.x(38), c.y(0.95) + 16, "Brand A · $0.95K", { class: "l", "text-anchor": "end" }));
    const line = []; for (let h = 0; h <= 40; h += 2) line.push([c.x(h), c.y(meanD(h))]);
    c.svg.append(poly("ln acc", line), txt(c.x(1), c.y(1.4) - 2, "Brand D's average (shaded: how sure we are)", { class: "l acc" }));
    flip(c.svg, c.x(23.1), "Flip point: 23 hours (19 more)", { side: "left", ty: H - B - 10 });
    pick(c.svg, c.x(4), c.y(meanD(4)), "After the bad week · $1.08K", { dy: 22, anchor: "start", dx: 8 });
    return [c.svg, "One bad week barely dents a 34-hour average. It would take 23 hours at $0.70K before D fell below A. Update the estimate; don't replace it."];
  },

  "value-of-information": () => {
    const rows = [["Depletion report", 1.5, 0], ["Distributor call", 1.2, 0.3], ["Store visit", 1.5, 1.5], ["Consumer panel", 0.1, 3]];
    const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "pic", role: "img", "aria-label": "Each check's worth against its cost. The depletion report is worth $1.5K and free; the store visit breaks even; the consumer panel costs far more than it is worth." });
    const x0 = 200, x = (v) => x0 + (v / 3.2) * (W - x0 - R - 110);
    rows.forEach(([name, worth, cost], i) => {
      const y = T + 10 + i * 42;
      svg.append(txt(x0 - 10, y + 10, name, { "text-anchor": "end", class: "l" }));
      svg.append(s("rect", { class: "bar acc", x: x0, y, width: Math.max(2, x(worth) - x0), height: 12, rx: 3 }));
      svg.append(s("rect", { class: `bar ${cost > worth ? "bad" : "mid"}`, x: x0, y: y + 15, width: Math.max(0, x(cost) - x0), height: 6, rx: 3 }));
      const net = Math.round((worth - cost) * 10) / 10;
      svg.append(txt(x(Math.max(worth, cost)) + 8, y + 12, net > 0 ? `+${fmtK(net)} after cost` : net === 0 ? "breaks even" : `${fmtK(net)} after cost`, { class: net > 0 ? "l acc" : net < 0 ? "l bad" : "l" }));
    });
    svg.append(s("rect", { class: "bar acc", x: x0, y: H - 20, width: 12, height: 10, rx: 2 }), txt(x0 + 18, H - 11, "worth: how much better the decision gets"), s("rect", { class: "bar mid", x: x0 + 300, y: H - 18, width: 12, height: 6, rx: 2 }), txt(x0 + 318, H - 11, "cost"));
    return [svg, "Run a check when its worth clears its cost. The depletion report does by $1.5K; the store visit only breaks even; the panel never gets close."];
  },

  "utility-and-trade-offs": () => {
    const opts = [{ name: "Hold", volume: 3, margin: -1.0, revenue: 2.5 }, { name: "Rebalance", volume: 5, margin: 1.4, revenue: 3.8 }, { name: "Cut", volume: 1, margin: 2.6, revenue: 0.8 }];
    const score = (name, m) => M.utilityRank(opts, { volume: (100 - m) / 2, margin: m, revenue: (100 - m) / 2 }).find((o) => o.name === name).utility;
    const c = frame({ xlo: 0, xhi: 100, ylo: 0, yhi: 100, xTicks: [0, 25, 50, 75, 100], yTicks: [0, 50, 100], fx: (v) => `${v}%`, fy: (v) => String(v),
      xLabel: "Weight on margin (the rest split between volume and revenue) →", aria: "Rebalance scores highest until margin carries about 80% of the weight, then Cut does. Hold is never on top." });
    const series = (name, cls) => { const pts = []; for (let m = 0; m <= 100; m += 5) pts.push([c.x(m), c.y(score(name, m))]); c.svg.append(poly(`ln ${cls}`, pts)); return pts; };
    const hold = series("Hold", "mid"), reb = series("Rebalance", "acc"), cut = series("Cut", "bad");
    c.svg.append(txt(c.x(2), hold[0][1] - 8, "Hold", { class: "l mid" }), txt(c.x(2), reb[0][1] - 8, "Rebalance", { class: "l acc" }), txt(c.x(100), cut.at(-1)[1] - 8, "Cut", { class: "l bad", "text-anchor": "end" }));
    let f = 100; for (let m = 0; m <= 100; m += 1) if (score("Cut", m) > score("Rebalance", m)) { f = m; break; }
    flip(c.svg, c.x(f), `Flip point: about ${f}% margin`, { side: "left", ty: H - B - 10 });
    pick(c.svg, c.x(40), c.y(score("Rebalance", 40)), "Plan · 40% margin", { dy: -12 });
    pick(c.svg, c.x(80), c.y(score("Cut", 80)), "VP · 80% margin", { dy: -12, anchor: "end", dx: 6 });
    return [c.svg, "Change what you're optimizing for and the winner changes. Rebalance leads until margin carries about 80% of the weight; Hold never leads under any weights."];
  },

  "optimization": () => {
    const base = { spend: 40, vmax: 1200, k: 60, unitMargin: 0.11 }, f = (sp) => M.contributionAt(sp, base), opt = M.optimalSpend(base);
    const c = frame({ xlo: 0, xhi: 100, ylo: 0, yhi: 30, xTicks: [0, 20, 40, 60, 80, 100], yTicks: [0, 10, 20, 30], fx: (v) => `$${v}K`, fy: fmtK,
      xLabel: "Promotion spend on Brand A per quarter →", aria: "Contribution rises with spend, peaks near $47K, then falls. The four options sit at $20K, $40K, $60K and $80K." });
    const pts = []; for (let sp = 0; sp <= 100; sp += 2) pts.push([c.x(sp), c.y(f(sp))]);
    c.svg.append(poly("ln acc", pts));
    flip(c.svg, c.x(opt), `Peak: about $${opt.toFixed(0)}K`, { ty: H - B - 12 });
    [20, 40, 60, 80].forEach((sp) => c.svg.append(s("circle", { class: sp === 40 ? "dot acc" : "dot", cx: c.x(sp), cy: c.y(f(sp)), r: 5 }), txt(c.x(sp), c.y(f(sp)) + (sp === 40 ? -12 : 20), fmtK(+f(sp).toFixed(1)), { "text-anchor": "middle", class: sp === 40 ? "l acc" : "" })));
    pick(c.svg, c.x(40), c.y(f(40)), "Round 1 · hold at $40K", { dy: -26 });
    c.svg.append(txt(c.x(80), c.y(7), "Past the peak, each extra dollar loses money", { class: "l bad", "text-anchor": "middle" }));
    return [c.svg, "Contribution climbs, peaks near $47K, and falls. The last $20K from $40K to $60K buys volume and loses $0.8K; the same $20K on Brand D's display earns $10K."];
  },

  "prediction-vs-decision": () => {
    const plans = [["Plan 1", "trade spend +14%", 5, 3, 8.2, -3.3], ["Plan 2", "trade spend +2%", 2, 6, 8.1, 3.0], ["Plan 2, rerun", "trade spend +2%", -2, 6, 3.9, 2.6]];
    const c = frame({ xlo: 0, xhi: 3, ylo: -4, yhi: 14, xTicks: [], yTicks: [-4, 0, 5, 10], fx: () => "", fy: (v) => `${v > 0 ? "+" : ""}${v}`,
      xLabel: "Left: the sales forecast (price blue, volume grey). Right: what it does to margin, in points.", aria: "Plan 1 forecasts sales +8.2% with margin −3.3 points. Plan 2 forecasts +8.1% with margin +3.0. Rerun, Plan 2 forecasts +3.9% with margin +2.6." });
    plans.forEach(([name, trade, vol, price, sales, margin], i) => {
      const cx = c.x(i + 0.5), bw = 30, y0 = c.y(0);
      c.svg.append(txt(cx, T + 2, name, { class: "l", "text-anchor": "middle" }), txt(cx, T + 16, trade, { "text-anchor": "middle" }));
      // forecast: price on the bottom, volume stacked above (or hanging below when negative)
      const xf = cx - bw - 6;
      c.svg.append(s("rect", { class: "bar acc", x: xf, y: c.y(price), width: bw, height: y0 - c.y(price), rx: 2 }));
      if (vol >= 0) c.svg.append(s("rect", { class: "bar mid", x: xf, y: c.y(price + vol), width: bw, height: c.y(price) - c.y(price + vol), rx: 2 }));
      else c.svg.append(s("rect", { class: "bar bad", x: xf, y: c.y(price), width: bw, height: c.y(price + vol) - c.y(price), rx: 2 }));
      c.svg.append(txt(xf + bw / 2, c.y(Math.max(price, price + vol)) - 6, `sales +${sales}%`, { class: "l", "text-anchor": "middle" }));
      // margin result
      const xm = cx + 6;
      c.svg.append(s("rect", { class: `bar ${margin < 0 ? "bad" : "acc"}`, x: xm, y: margin < 0 ? y0 : c.y(margin), width: bw, height: Math.abs(y0 - c.y(margin)), rx: 2 }));
      c.svg.append(txt(xm + bw / 2, margin < 0 ? c.y(margin) + 14 : c.y(margin) - 6, `${margin > 0 ? "+" : "−"}${Math.abs(margin)} pts`, { class: `l ${margin < 0 ? "bad" : "acc"}`, "text-anchor": "middle" }));
    });
    return [c.svg, "Two plans with the same forecast and opposite economics. The headline is the prediction; the margin bar is the decision."];
  },

  "exploration-vs-exploitation": () => {
    // Gain against exploiting only (all 40 hours on Brand A), month by month. Exploring costs a little in month one and,
    // with a 56% chance of finding a $1.10K brand, pays about $3.4K a month after that.
    const gain = (first) => { const out = [[0, 0]]; let v = 0; for (let m = 1; m <= 6; m++) { v += m === 1 ? first : 0.56 * 6; out.push([m, v]); } return out; };
    const c = frame({ xlo: 0, xhi: 6, ylo: -8, yhi: 16, xTicks: [0, 1, 2, 3, 4, 5, 6], yTicks: [-8, 0, 8, 16], fx: (v) => (v ? `month ${v}` : "now"), fy: (v) => (v > 0 ? `+${fmtK(v)}` : fmtK(v)),
      xLabel: "Gain against putting every hour on Brand A →", aria: "Exploring eight hours costs $2K in month one and is ahead by about $15K after six months. Twenty-four hours costs $6K and is ahead by about $11K. Both only pay if you stay." });
    c.svg.append(txt(c.x(6), c.y(0) - 7, "All 40 hours on Brand A", { class: "l mid", "text-anchor": "end" }));
    const draw = (first, cls, label, dy) => { const pts = gain(first); c.svg.append(poly(`ln ${cls}`, pts.map(([m, v]) => [c.x(m), c.y(v)]))); c.svg.append(txt(c.x(6) - 4, c.y(pts.at(-1)[1]) + dy, `${label} · ${pts.at(-1)[1] > 0 ? "+" : ""}${fmtK(Math.round(pts.at(-1)[1]))} by month 6`, { class: `l ${cls}`, "text-anchor": "end" })); return pts; };
    const e8 = draw(-2, "acc", "8 hours exploring", -10), e24 = draw(-6, "bad", "24 hours", 20);
    flip(c.svg, c.x(1.6), "Flip point: pays back during month 2", { ty: T + 14 });
    pick(c.svg, c.x(6), c.y(e8.at(-1)[1]), "Round 1 · six months left", { dy: 34, anchor: "end", dx: 6 });
    pick(c.svg, c.x(1), c.y(e8[1][1]), "Round 2 · leaving after month 1: still behind", { dy: 22, anchor: "start", dx: 8 });
    return [c.svg, "Exploring puts you behind in month one and ahead every month after, if you're still there. Eight hours is enough to learn; twenty-four digs a deeper hole for the same lesson."];
  },
};

export function pictureFor(slug) {
  const make = pictures[slug];
  return make ? make() : null;
}
