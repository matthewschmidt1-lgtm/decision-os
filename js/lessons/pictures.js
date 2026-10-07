// "The rule in one picture": one still SVG per lesson, drawn from the same numbers as its drill. Each marks the flip
// point, rings the two rounds' situations ("Round 1", "Round 2") so the flip is visible, and shows the learner's own
// picks as filled dots. Built after the second round. No controls: the shape is the lesson.
import { s } from "../ui.js";
import * as M from "../models.js";

const W = 640, H = 230, L = 56, R = 16, T = 22, B = 46;
const txt = (x, y, t, a = {}) => s("text", { x, y, ...a }, t);
const fmtK = (v) => `${v < 0 ? "−" : ""}$${Math.abs(v)}K`;

// A plain chart frame: axes, a few gridlines, tick labels, an x-axis caption. Returns the svg and the two scales.
function frame({ xlo, xhi, ylo, yhi, xTicks, yTicks, fx, fy, xLabel, aria, left = L }) {
  const x = (v) => left + ((v - xlo) / (xhi - xlo)) * (W - left - R), y = (v) => H - B - ((v - ylo) / (yhi - ylo)) * (H - T - B);
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "pic", role: "img", "aria-label": aria });
  yTicks.forEach((v) => svg.append(s("line", { class: v === 0 ? "ax" : "grid", x1: left, x2: W - R, y1: y(v), y2: y(v) }), txt(left - 8, y(v) + 4, fy(v), { "text-anchor": "end" })));
  svg.append(s("line", { class: "ax", x1: left, x2: left, y1: T, y2: H - B }));
  xTicks.forEach((v, i) => svg.append(txt(x(v), H - B + 18, fx(v), { "text-anchor": i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle" })));
  if (xLabel) svg.append(txt((left + W - R) / 2, H - 8, xLabel, { "text-anchor": "middle", class: "cap" }));
  return { svg, x, y };
}
const poly = (cls, pts) => s("polyline", { class: cls, points: pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ") });
const flip = (svg, x, label, { y1 = T, y2 = H - B, side = "right", ty = T + 14 } = {}) =>
  svg.append(s("line", { class: "flip", x1: x, x2: x, y1, y2 }), txt(x + (side === "right" ? 6 : -6), ty, label, { class: "l", "text-anchor": side === "right" ? "start" : "end" }));
// A round's situation: ring plus label.
const ring = (svg, cx, cy, label, { dy = 18, anchor = "middle", dx = 0 } = {}) =>
  svg.append(s("g", { class: "pick" }, s("circle", { cx, cy, r: 6 }), txt(cx + dx, cy + dy, label, { "text-anchor": anchor })));
// The learner's own pick: a filled dot, labelled "you".
const you = (svg, cx, cy, { dy = 4, dx = 9, anchor = "start", label = "you" } = {}) =>
  svg.append(s("g", { class: "pick you" }, s("circle", { cx, cy, r: 4.5 }), txt(cx + dx, cy + dy, label, { "text-anchor": anchor })));

const pictures = {
  "expected-value": ([p1, p2]) => {
    const big = (p) => p * 95 - 6, cedar = 16.1;
    const c = frame({ xlo: 5, xhi: 50, ylo: 0, yhi: 42, xTicks: [5, 20, 35, 50], yTicks: [0, 10, 20, 30, 40], fx: (v) => `${v}%`, fy: fmtK,
      xLabel: "Odds of winning the $95K account →", aria: "Expected value of the $95K account rises with its odds and passes Cedar Street's $16.1K at about 23%." });
    c.svg.append(poly("ln mid", [[c.x(5), c.y(cedar)], [c.x(50), c.y(cedar)]]), txt(c.x(50), c.y(cedar) + 16, "Cedar Street · $16.1K whatever the odds", { class: "l", "text-anchor": "end" }));
    c.svg.append(poly("ln acc", [[c.x(5), c.y(big(0.05))], [c.x(50), c.y(big(0.5))]]), txt(c.x(50), c.y(big(0.5)) - 8, "$95K account", { class: "l acc", "text-anchor": "end" }));
    flip(c.svg, c.x(23.3), "Flip point: 23%");
    ring(c.svg, c.x(15), c.y(big(0.15)), "Round 1 · 15% odds = $8.3K", { dy: 22 });
    ring(c.svg, c.x(30), c.y(big(0.3)), "Round 2 · 30% odds = $22.5K", { dy: -14, anchor: "end", dx: 10 });
    // The learner's pick each round: a dot on the line they chose, at that round's odds.
    you(c.svg, c.x(15), c.y(p1 === "cedar" ? cedar : big(0.15)), { dy: -8, dx: 0, anchor: "middle" });
    you(c.svg, c.x(30), c.y(p2 === "cedar" ? cedar : big(0.3)), { dy: p2 === "cedar" ? 16 : -8, dx: 0, anchor: "middle" });
    return [c.svg, "Below 23% odds the sure $16.1K wins; above it the big account does. Round 1 sat left of the flip point, round 2 right of it. Same rule, two answers."];
  },

  "bayesian-updating": ([p1, p2]) => {
    const steps = [["Start: base rate", 35], ["Top-third velocity ×2", 52], ["Competitors added it ×1.8", 66], ["She asked for data ×1.5", 74], ["Rep says don't bother ×0.7", 67]];
    const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "pic", role: "img", "aria-label": "Belief moves from 35% to 52%, 66%, 74%, then back to 67% as each clue is applied. A dashed line marks 50%." });
    const left = L + 150, x = (p) => left + ((p - 20) / 75) * (W - left - R), rowY = (i) => T + 12 + i * 34;
    [20, 40, 60, 80, 95].forEach((p) => svg.append(s("line", { class: "grid", x1: x(p), x2: x(p), y1: T, y2: H - B + 4 }), txt(x(p), H - B + 18, `${p}%`, { "text-anchor": "middle" })));
    svg.append(s("line", { class: "flip", x1: x(50), x2: x(50), y1: T - 4, y2: H - B + 4 }), txt(x(50) + 6, T - 8, "50%: more likely yes than no", { class: "l" }));
    steps.forEach(([label, p], i) => {
      const y = rowY(i), prev = i ? steps[i - 1][1] : null, down = prev != null && p < prev;
      svg.append(txt(left - 8, y + 4, label, { "text-anchor": "end", class: i ? "" : "l" }));
      if (prev != null) svg.append(s("line", { class: `arrow ${down ? "bad" : "acc"}`, x1: x(prev), x2: x(p), y1: y, y2: y }));
      svg.append(s("circle", { class: `dot ${i === 0 ? "" : down ? "bad" : "acc"}`, cx: x(p), cy: y, r: 5 }), txt(x(p) + (down ? -10 : 10), y + 4, `${p}%`, { class: "l", "text-anchor": down ? "end" : "start" }));
    });
    // Your estimates, on the rows they answered.
    const e1 = Number(p1), e2 = Number(p2);
    if (e1) you(svg, x(e1), rowY(3), { label: `you said ${e1}%`, dy: -10, dx: 0, anchor: "middle" });
    if (e2) you(svg, x(e2), rowY(4), { label: `you said ${e2}%`, dy: 18, dx: 0, anchor: "middle" });
    svg.append(txt((left + W - R) / 2, H - 8, "Chance Fresh Thyme takes the second SKU →", { "text-anchor": "middle", class: "cap" }));
    return [svg, "Three decent clues carry you from 35% to 74%. The rep's comment, weak evidence, takes you back only to 67%, still well past 50%. Each clue moves you by its strength, never to certainty."];
  },

  "decision-trees": ([p1, p2]) => {
    // Value today as the odds of high velocity change: p × $31.2K + (1 − p) × $0.8K, against the $10K cost of pursuing.
    const val = (p) => p * 31.2 + (1 - p) * 0.8, cost = 10;
    const c = frame({ xlo: 0, xhi: 100, ylo: 0, yhi: 35, xTicks: [0, 25, 50, 75, 100], yTicks: [0, 10, 20, 30], fx: (v) => `${v}%`, fy: fmtK,
      xLabel: "Chance the account turns out high-velocity →", aria: "The account's value today rises with the odds of high velocity, from $0.8K to $31.2K, and passes the $10K cost of pursuing at about 30%. At 55% it is worth $17.5K." });
    c.svg.append(poly("ln mid", [[c.x(0), c.y(cost)], [c.x(100), c.y(cost)]]), txt(c.x(100), c.y(cost) + 16, "Cost of pursuing · $10K", { class: "l", "text-anchor": "end" }));
    c.svg.append(poly("ln acc", [[c.x(0), c.y(val(0))], [c.x(100), c.y(val(1))]]), txt(c.x(100), c.y(val(1)) - 8, "Value today, rolled back from the endings", { class: "l acc", "text-anchor": "end" }));
    flip(c.svg, c.x(30.3), "Flip point: 30%", { ty: T + 14 });
    ring(c.svg, c.x(55), c.y(val(0.55)), "Round 1 · 55% high velocity = $17.5K", { dy: -14, anchor: "end", dx: -8 });
    const guess = { 8: 8, 17: 17.5, 25: 25, 31: 31 }[p1];
    if (guess && guess !== 17.5) you(c.svg, c.x(55), c.y(guess), { label: `you said ${fmtK(guess)}`, dx: 10 });
    c.svg.append(s("line", { class: "gap", x1: c.x(55), x2: c.x(55), y1: c.y(val(0.55)) + 7, y2: c.y(cost) - 2 }));
    c.svg.append(txt(c.x(55) + 8, c.y((val(0.55) + cost) / 2) - 2, "Round 2 · worth pursuing by $7.5K", { class: "l" }));
    if (p2) c.svg.append(txt(c.x(55) + 8, c.y((val(0.55) + cost) / 2) + 12, `you ${p2 === "go" ? "pursued" : "walked away"}`, { class: "mid" }));
    return [c.svg, "Roll the endings back and the account is worth $17.5K at 55% odds, $7.5K more than it costs to pursue. Drop the odds below 30% and it stops being worth it: velocity is the fact to check first."];
  },

  "multi-armed-bandits": ([p1, p2]) => {
    const meanD = (h) => (34 * 1.12 + 0.7 * h) / (34 + h); // D's running average if every new hour returned $0.70K
    const c = frame({ xlo: 0, xhi: 40, ylo: 0.6, yhi: 1.5, xTicks: [0, 10, 20, 30, 40], yTicks: [0.6, 0.8, 1.0, 1.2, 1.4], fx: (v) => `${v}h`, fy: (v) => `$${v.toFixed(2)}K`,
      xLabel: "Hours on Brand D, each returning $0.70K →", aria: "Brand D's average starts at $1.12K per hour and falls slowly with each $0.70K hour, crossing Brand A's $0.95K after about 23 hours." });
    // The range the drill quotes ($0.80K–$1.40K at 34 hours) narrows as hours accumulate.
    const half = (h) => 0.3 * Math.sqrt(34 / (34 + h));
    const band = []; for (let h = 0; h <= 40; h += 2) band.push([c.x(h), c.y(meanD(h) + half(h))]); for (let h = 40; h >= 0; h -= 2) band.push([c.x(h), c.y(meanD(h) - half(h))]);
    c.svg.append(s("polygon", { class: "band", points: band.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ") }));
    c.svg.append(poly("ln mid", [[c.x(0), c.y(0.95)], [c.x(40), c.y(0.95)]]), txt(c.x(40), c.y(0.95) + 17, "Brand A · $0.95K, proven", { class: "l", "text-anchor": "end" }));
    const line = []; for (let h = 0; h <= 40; h += 2) line.push([c.x(h), c.y(meanD(h))]);
    c.svg.append(poly("ln acc", line), txt(c.x(40), c.y(1.45), "Brand D's average (shaded: the range it could really be)", { class: "l acc", "text-anchor": "end" }));
    flip(c.svg, c.x(23.1), "Flip point: 23 hours (19 more)", { side: "left", ty: H - B - 10 });
    ring(c.svg, c.x(0), c.y(1.12), `Round 1 · D at $1.12K${p1 ? ` (you chose ${p1 === "a" ? "A" : p1 === "d" ? "D" : "two and two"})` : ""}`, { dy: -12, anchor: "start", dx: 8 });
    ring(c.svg, c.x(4), c.y(meanD(4)), `Round 2 · after the bad week, $1.08K${p2 ? ` (you ${p2 === "a" ? "went back to A" : "stayed on D"})` : ""}`, { dy: 36, anchor: "start", dx: 2 });
    return [c.svg, "One bad week barely dents a 34-hour average: D is still ahead at $1.08K. It would take 23 hours at $0.70K before D fell below A. Update the estimate; don't replace it."];
  },

  "value-of-information": ([p1, p2]) => {
    const rows = [["dep", "Depletion report", 1.5, 0], ["call", "Distributor call", 1.2, 0.3], ["store", "Store visit", 1.5, 1.5], ["panel", "Consumer panel", 0.1, 3]];
    const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "pic", role: "img", "aria-label": "Each check's worth against its cost. The depletion report is worth $1.5K and free; the store visit breaks even at $1.5K and would pay at $1K; the consumer panel costs far more than it is worth." });
    const x0 = 196, x = (v) => x0 + (v / 3.2) * (W - x0 - R - 120);
    rows.forEach(([id, name, worth, cost], i) => {
      const y = T + 6 + i * 40, mine = id === p1;
      svg.append(txt(x0 - 10, y + 10, mine ? `${name} (your pick)` : name, { "text-anchor": "end", class: "l" }));
      svg.append(s("rect", { class: "bar acc", x: x0, y, width: Math.max(2, x(worth) - x0), height: 12, rx: 3 }));
      svg.append(s("rect", { class: `bar ${cost > worth ? "bad" : "mid"}`, x: x0, y: y + 15, width: Math.max(0, x(cost) - x0), height: 6, rx: 3 }));
      const net = Math.round((worth - cost) * 10) / 10;
      svg.append(txt(x(Math.max(worth, cost)) + 8, y + 12, net > 0 ? `+${fmtK(net)} after cost` : net === 0 ? "breaks even" : `${fmtK(net)} after cost`, { class: net > 0 ? "l acc" : net < 0 ? "l bad" : "l" }));
      if (id === "store") svg.append(s("line", { class: "flip", x1: x(1), x2: x(1), y1: y - 4, y2: y + 26 }), txt(x(1), y + 36, "flip point: pays at $1K", { class: "l", "text-anchor": "middle" }));
    });
    svg.append(txt(x0, H - 24, `Round 2 · the panel, free but three weeks late: worth $0${p2 ? ` (you ${p2 === "run" ? "ran it" : "skipped it"})` : ""}`, { class: "l" }));
    svg.append(s("rect", { class: "bar acc", x: x0, y: H - 14, width: 12, height: 9, rx: 2 }), txt(x0 + 18, H - 6, "worth: how much better the decision gets"), s("rect", { class: "bar mid", x: x0 + 290, y: H - 12, width: 12, height: 6, rx: 2 }), txt(x0 + 308, H - 6, "cost"));
    return [svg, "Run a check when its worth clears its cost. The depletion report does by $1.5K; the store visit only breaks even unless it gets cheaper; the panel never gets close, and late information is worth nothing."];
  },

  "utility-and-trade-offs": ([p1, p2]) => {
    const opts = [{ name: "Hold", id: "hold", volume: 3, margin: -1.0, revenue: 2.5 }, { name: "Rebalance", id: "rebalance", volume: 5, margin: 1.4, revenue: 3.8 }, { name: "Cut", id: "cut", volume: 1, margin: 2.6, revenue: 0.8 }];
    const score = (name, m) => M.utilityRank(opts, { volume: (100 - m) / 2, margin: m, revenue: (100 - m) / 2 }).find((o) => o.name === name).utility;
    const c = frame({ xlo: 0, xhi: 100, ylo: 0, yhi: 100, xTicks: [0, 25, 50, 75, 100], yTicks: [0, 50, 100], fx: (v) => `${v}%`, fy: (v) => String(v),
      xLabel: "How much margin counts in the objective (the rest split between volume and revenue) →", aria: "Rebalance scores highest until margin carries about 76% of the weight, then Cut does. Hold is never on top." });
    const series = (name, cls) => { const pts = []; for (let m = 0; m <= 100; m += 5) pts.push([c.x(m), c.y(score(name, m))]); c.svg.append(poly(`ln ${cls}`, pts)); return pts; };
    const hold = series("Hold", "mid"), reb = series("Rebalance", "acc"), cut = series("Cut", "bad");
    c.svg.append(txt(c.x(2), hold[0][1] - 8, "Hold", { class: "l mid" }), txt(c.x(2), reb[0][1] - 8, "Rebalance", { class: "l acc" }), txt(c.x(100), cut.at(-1)[1] - 8, "Cut", { class: "l bad", "text-anchor": "end" }));
    let f = 100; for (let m = 0; m <= 100; m += 1) if (score("Cut", m) > score("Rebalance", m)) { f = m; break; }
    flip(c.svg, c.x(f), `Flip point: about ${f}% margin`, { side: "left", ty: H - B - 10 });
    ring(c.svg, c.x(40), c.y(score("Rebalance", 40)), "Round 1 · the plan, 40% margin", { dy: -14 });
    ring(c.svg, c.x(80), c.y(score("Cut", 80)), "Round 2 · the VP, 80%", { dy: -14, anchor: "end", dx: -6 });
    const nameOf = (id) => opts.find((o) => o.id === id)?.name;
    if (nameOf(p1)) you(c.svg, c.x(40), c.y(score(nameOf(p1), 40)), { dy: 18, dx: 0, anchor: "middle" });
    if (nameOf(p2)) you(c.svg, c.x(80), c.y(score(nameOf(p2), 80)), { dy: 18, dx: 0, anchor: "middle" });
    return [c.svg, `Change what you're optimizing for and the winner changes. Rebalance leads until margin carries about ${f}% of the weight; then Cut does. Hold never leads under any weights.`];
  },

  "optimization": ([p1, p2]) => {
    const base = { spend: 40, vmax: 1200, k: 60, unitMargin: 0.11 }, f = (sp) => M.contributionAt(sp, base), opt = M.optimalSpend(base);
    const c = frame({ xlo: 0, xhi: 100, ylo: 0, yhi: 30, xTicks: [0, 20, 40, 60, 80, 100], yTicks: [0, 10, 20, 30], fx: (v) => `$${v}K`, fy: fmtK,
      xLabel: "Promotion spend on Brand A per quarter →", aria: "Contribution rises with spend, peaks near $47K, then falls. The four options sit at $20K, $40K, $60K and $80K." });
    const pts = []; for (let sp = 0; sp <= 100; sp += 2) pts.push([c.x(sp), c.y(f(sp))]);
    c.svg.append(poly("ln acc", pts));
    flip(c.svg, c.x(opt), `Peak: about $${opt.toFixed(0)}K`, { ty: H - B - 12 });
    [20, 60, 80].forEach((sp) => c.svg.append(s("circle", { class: "dot", cx: c.x(sp), cy: c.y(f(sp)), r: 5 }), txt(c.x(sp), c.y(f(sp)) + 20, fmtK(+f(sp).toFixed(1)), { "text-anchor": "middle" })));
    ring(c.svg, c.x(40), c.y(f(40)), "Round 1 · hold at $40K = $24.2K", { dy: -14 });
    const yours = Number(p1); if (yours && yours !== 40) you(c.svg, c.x(yours), c.y(f(yours)), { dy: -8, dx: 0, anchor: "middle" });
    c.svg.append(txt(c.x(78), c.y(6), "Past the peak, each extra dollar loses money", { class: "l bad", "text-anchor": "middle" }));
    c.svg.append(txt(c.x(100), c.y(29), `Round 2 · $20K on Brand D's display earns $10K${p2 ? ` (you ${p2 === "move" ? "moved it" : "kept it on A"})` : ""}`, { class: "l", "text-anchor": "end" }));
    return [c.svg, "Contribution climbs, peaks near $47K, and falls. The last $20K from $40K to $60K buys volume and loses $0.8K; the same $20K on Brand D's display earns $10K."];
  },

  "prediction-vs-decision": ([p1, p2]) => {
    const plans = [["p1", "Plan 1", 8.2, -3.3], ["p2", "Plan 2", 8.1, 3.0], ["p2b", "Plan 2, rerun", 3.9, 2.6]];
    const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "pic", role: "img", "aria-label": "Two panels. Left, what the forecast says: sales up 8.2%, 8.1% and 3.9%. Right, what each plan does to margin: minus 3.3 points, plus 3.0 and plus 2.6." });
    const panel = (x0, title, key, lo, hi, unit, fmt) => {
      const pw = (W - L - R - 30) / 2, y = (v) => H - B - ((v - lo) / (hi - lo)) * (H - T - 20 - B);
      svg.append(txt(x0 + pw / 2, T + 2, title, { class: "l", "text-anchor": "middle" }));
      svg.append(s("line", { class: "ax", x1: x0, x2: x0 + pw, y1: y(0), y2: y(0) }));
      plans.forEach(([id, name, sales, margin], i) => {
        const v = key === "sales" ? sales : margin, bw = 34, bx = x0 + 16 + i * ((pw - 32) / 3) + ((pw - 32) / 3 - bw) / 2;
        const picked = (i === 0 && (p1 === "p1" || p2 === "p1")) || (i === 1 && p1 === "p2") || (i === 2 && p2 === "p2");
        svg.append(s("rect", { class: `bar ${key === "sales" ? "mid" : v < 0 ? "bad" : "acc"}${picked ? " picked" : ""}`, x: bx, y: v < 0 ? y(0) : y(v), width: bw, height: Math.abs(y(v) - y(0)), rx: 2 }));
        svg.append(txt(bx + bw / 2, v < 0 ? y(v) + 14 : y(v) - 6, fmt(v), { class: `l ${key === "sales" ? "" : v < 0 ? "bad" : "acc"}`, "text-anchor": "middle" }));
        svg.append(txt(bx + bw / 2, H - B + 16, name, { "text-anchor": "middle" }));
        if (picked) svg.append(txt(bx + bw / 2, H - B + 30, "your pick", { class: "l", "text-anchor": "middle" }));
      });
      svg.append(txt(x0 + pw, H - B + 44, unit, { "text-anchor": "end", class: "cap" }));
    };
    panel(L, "What the forecast says", "sales", 0, 10, "sales growth next quarter", (v) => `+${v}%`);
    panel(L + (W - L - R - 30) / 2 + 30, "What it does to margin", "margin", -4, 4, "margin, in points", (v) => `${v > 0 ? "+" : "−"}${Math.abs(v)} pts`);
    return [svg, "Two forecasts can look the same and mean opposite things. Plan 1 wins only if a point of growth is worth more than about 1.4 points of margin to you: it buys 4.3 extra points of growth for 5.9 points of margin."];
  },

  "exploration-vs-exploitation": ([p1, p2]) => {
    // Gain against exploiting only (all 40 hours on Brand A), month by month. Exploring costs a little in month one and,
    // with a 56% chance of finding a $1.10K brand, pays about $3.4K a month after that.
    const gain = (first) => { const out = [[0, 0]]; let v = 0; for (let m = 1; m <= 6; m++) { v += m === 1 ? first : 0.56 * 6; out.push([m, v]); } return out; };
    const first = { 0: 0, 8: -2, 24: -6 };
    const c = frame({ xlo: 0, xhi: 6, ylo: -8, yhi: 18, xTicks: [0, 1, 2, 3, 4, 5, 6], yTicks: [-8, 0, 8, 16], fx: (v) => (v ? `month ${v}` : "now"), fy: (v) => (v > 0 ? `+${fmtK(v)}` : fmtK(v)),
      xLabel: "Gain against putting every hour on Brand A →", aria: "Exploring eight hours costs $2K in month one and is ahead by about $15K after six months. Twenty-four hours costs $6K and is ahead by about $11K. Both only pay if you stay." });
    c.svg.append(txt(c.x(6) - 10, c.y(0) + 16, "All 40 hours on Brand A", { class: "l mid", "text-anchor": "end" }));
    const lines = {};
    const draw = (hrs, cls) => { const pts = gain(first[hrs]); lines[hrs] = pts; c.svg.append(poly(`ln ${cls}`, pts.map(([m, v]) => [c.x(m), c.y(v)]))); return pts; };
    const e8 = draw(8, "acc"), e24 = draw(24, "bad");
    c.svg.append(txt(c.x(3.4), c.y(e8[3][1]) - 12, "8 hours exploring", { class: "l acc", "text-anchor": "middle" }));
    c.svg.append(txt(c.x(4.2), c.y(e24[4][1]) + 16, "24 hours exploring", { class: "l bad", "text-anchor": "middle" }), txt(c.x(6) - 10, c.y(e24.at(-1)[1]) + 26, `+${fmtK(Math.round(e24.at(-1)[1]))} by month 6`, { class: "l bad", "text-anchor": "end" }));
    flip(c.svg, c.x(1.6), "Flip point: pays back during month 2", { ty: T + 14 });
    ring(c.svg, c.x(6), c.y(e8.at(-1)[1]), `Round 1 · six months: +${fmtK(Math.round(e8.at(-1)[1]))}`, { dy: -14, anchor: "end", dx: 6 });
    ring(c.svg, c.x(1), c.y(-2), "Round 2 · leaving after month 1: still behind", { dy: -14, anchor: "start", dx: 6 });
    const at = (hrs, m) => (hrs === 0 ? 0 : (lines[hrs] || gain(first[hrs]))[m][1]);
    if (p1 in first) you(c.svg, c.x(6), c.y(at(Number(p1), 6)), { dx: -10, anchor: "end", dy: Number(p1) === 8 ? 16 : 4 });
    if (p2 in first) you(c.svg, c.x(1), c.y(at(Number(p2), 1)), { dx: 8 });
    return [c.svg, "Exploring puts you behind in month one and ahead every month after, if you're still there. Eight hours is enough to learn; twenty-four digs a deeper hole for the same lesson."];
  },
};

export function pictureFor(slug, picks = []) {
  const make = pictures[slug];
  return make ? make(picks) : null;
}
