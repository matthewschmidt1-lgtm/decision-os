// Accounts intro: 84 scattered dots (the raw data) come together, first as the two inputs of expected value, then as one
// ranked line with the summary underneath. Plays once on arrival; each step can be revisited or replayed.
import { h, s } from "./ui.js";
import { rankByEV, money } from "./models.js";
import { navigate } from "./app.js";

const STEPS = [
  { label: "The data", text: (n) => `${n} accounts, six numbers each: velocity, volume, margin, chance of winning, value and cost. Scattered, it's noise.` },
  { label: "The algorithm", text: () => "Two inputs: up is worth more, right is more likely to win. The algorithm multiplies them and subtracts the cost of trying. Each curve joins accounts worth the same, so a big account you probably won't win can rank below a small one you probably will." },
  { label: "The answer", text: (n, sum) => `One ranked line. The top 20 hold ${sum.topShare}% of the territory's expected value, and ${sum.neg} accounts cost more to pursue than they return.` },
];

export function accountsViz(accounts) {
  const rows = rankByEV(accounts), n = rows.length;
  const narrow = matchMedia("(max-width: 720px)").matches, still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const W = narrow ? 400 : 1000, H = narrow ? 300 : 320, R = narrow ? 4 : 5.5, P = { l: narrow ? 20 : 40, r: narrow ? 20 : 40, t: 44, b: 40 };
  const total = rows.reduce((a, r) => a + Math.max(0, r.ev), 0);
  const avg = (k) => rows.reduce((a, r) => a + r[k], 0) / n;
  const sum = { total, topShare: Math.round((rows.slice(0, 20).reduce((a, r) => a + Math.max(0, r.ev), 0) / total) * 100), neg: rows.filter((r) => r.ev < 0).length, on: rows.filter((r) => r.channel === "on").length };

  // Step 1: a deterministic scatter, so the "noise" looks the same on every visit.
  const hash = (i, k) => { const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
  const scatter = rows.map((_, i) => [P.l + hash(i, 1) * (W - P.l - P.r), P.t + hash(i, 2) * (H - P.t - P.b)]);
  // Step 2: the two inputs. Right = more likely, up = worth more.
  const pr = rows.map((r) => r.probability), vr = rows.map((r) => r.value);
  const px = (p) => P.l + ((p - Math.min(...pr)) / (Math.max(...pr) - Math.min(...pr))) * (W - P.l - P.r);
  const vy = (v) => H - P.b - ((v - Math.min(...vr)) / (Math.max(...vr) - Math.min(...vr))) * (H - P.t - P.b);
  const inputs = rows.map((r) => [px(r.probability), vy(r.value)]);
  // Lines of equal expected value (at the average cost of trying): where chance × value is the same.
  const avgCost = rows.reduce((a, r) => a + r.cost, 0) / n, pMin = Math.min(...pr), pMax = Math.max(...pr), vMin = Math.min(...vr), vMax = Math.max(...vr);
  const iso = (ev) => { const pts = []; for (let k = 0; k <= 40; k++) { const p = pMin + ((pMax - pMin) * k) / 40, v = (ev + avgCost) / p; if (v >= vMin && v <= vMax) pts.push(`${px(p).toFixed(1)},${vy(v).toFixed(1)}`); } return pts; };
  const isoLines = [10000, 25000].map((ev) => { const pts = iso(ev); const [lx, ly] = (pts.at(-1) || "0,0").split(",").map(Number);
    return s("g", { class: "iso" }, s("polyline", { points: pts.join(" ") }), s("text", { x: lx - 4, y: ly - 6, "text-anchor": "end" }, `EV ${money(ev)}`)); });
  // Step 3: a beeswarm along expected value. Each dot takes the nearest free spot to the centre line.
  const lo = Math.min(...rows.map((r) => r.ev)), hi = Math.max(...rows.map((r) => r.ev));
  const ex = (v) => P.l + ((v - lo) / (hi - lo)) * (W - P.l - P.r), mid = (P.t + H - P.b) / 2 + 6, gap = R * 2 + 1.2;
  const placed = [];
  const swarm = rows.map((r) => {
    const x = ex(r.ev);
    for (let k = 0; ; k++) {
      const y = mid + (k % 2 ? -1 : 1) * Math.ceil(k / 2) * gap * 0.9;
      if (placed.every(([px2, py]) => (px2 - x) ** 2 + (py - y) ** 2 >= gap * gap)) { placed.push([x, y]); return [x, y]; }
    }
  });
  const layouts = [scatter, inputs, swarm];

  const tone = (r, i) => (r.ev < 0 ? "neg" : i < 20 ? "top" : "mid");
  const dots = rows.map((r, i) => {
    const c = s("circle", { r: R, class: `dot ${r.channel}`, "data-tone": tone(r, i), tabindex: "-1" }, s("title", {}, `${r.name}: ${money(r.ev)} expected value (${Math.round(r.probability * 100)}% × ${money(r.value)} − ${money(r.cost)})`));
    c.style.transitionDelay = still ? "0s" : `${(hash(i, 3) * 0.45).toFixed(2)}s`;
    c.addEventListener("click", () => navigate(`/accounts/${r.id}`));
    return c;
  });

  const zero = ex(0), best = rows[0];
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "acct-viz-svg", role: "img", "aria-label": `${n} accounts ranked by expected value. ${best.name} ranks first at ${money(best.ev)}. The top 20 hold ${sum.topShare}% of expected value; ${sum.neg} are negative.` },
    // step 2 axes
    s("g", { class: "ax ax-2" },
      s("line", { x1: P.l, x2: W - P.r, y1: H - P.b + 10, y2: H - P.b + 10 }), s("line", { x1: P.l - 10, x2: P.l - 10, y1: P.t, y2: H - P.b }),
      s("text", { x: W - P.r, y: H - P.b + 28, "text-anchor": "end" }, "More likely to win →"),
      s("text", { x: P.l - 4, y: P.t - 12 }, "↑ Worth more"),
      s("text", { class: "formula", x: W / 2, y: 22, "text-anchor": "middle" }, narrow ? "EV = chance × value − cost" : "Expected value = chance of winning × value − cost of trying"), ...isoLines),
    // step 3 axis
    s("g", { class: "ax ax-3" },
      s("line", { class: "zero", x1: zero, x2: zero, y1: P.t - 6, y2: H - P.b + 6 }),
      s("text", { x: P.l, y: H - P.b + 24 }, "← Costs more than it returns"),
      s("text", { x: W - P.r, y: H - P.b + 24, "text-anchor": "end" }, "Worth pursuing →"),
      s("text", { class: "best", x: ex(best.ev), y: P.t - 12, "text-anchor": "end" }, `${best.name} · ${money(best.ev)}`)),
    s("g", { class: "dots" }, ...dots));

  const caption = h("p", { class: "acct-viz-caption", "aria-live": "polite" });
  const stepBtns = STEPS.map((st, i) => h("button", { type: "button", onClick: () => { stop(); show(i); } }, h("span", { class: "n" }, String(i + 1)), st.label));
  const tile = (k, v, sub) => h("div", { class: "ev-tile" }, h("span", { class: "k" }, k), h("span", { class: "v" }, v), h("span", { class: "sim-sub" }, sub));
  const tiles = h("div", { class: "ev-tiles acct-viz-tiles" },
    tile("Expected value in play", money(total), `across ${n} accounts, ${sum.on} on-premise`),
    tile("Top 20 accounts", `${sum.topShare}%`, "of all expected value"),
    tile("Not worth the visit", String(sum.neg), "accounts cost more than they return"),
    tile("Velocity trend", fmt(avg("velocity")), `volume ${fmt(avg("volume"))} · margin ${fmt(avg("margin"), " pts")}`));

  let step = -1, timers = [];
  const stop = () => { timers.forEach(clearTimeout); timers = []; };
  const show = (i) => {
    step = i; svg.dataset.step = String(i + 1); tiles.classList.toggle("in", i === 2);
    dots.forEach((d, j) => { const [x, y] = layouts[i][j]; d.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`; });
    caption.textContent = STEPS[i].text(n, sum);
    stepBtns.forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
  };
  const play = () => { stop(); show(0); if (still) return show(2); timers = [setTimeout(() => show(1), 2200), setTimeout(() => show(2), 5000)]; };
  const replay = h("button", { type: "button", class: "link", onClick: play }, "Replay");

  const fig = h("figure", { class: "acct-viz" },
    h("div", { class: "acct-viz-head" }, h("div", { class: "acct-viz-steps", role: "group", "aria-label": "Steps" }, ...stepBtns), replay),
    caption, svg, tiles);
  requestAnimationFrame(() => play());
  setTimeout(() => { if (step < 0) play(); }, 300); // hidden tabs skip animation frames
  return fig;
}

function fmt(v, unit = "%") { const r = Math.round(v * 10) / 10; return `${r > 0 ? "+" : r < 0 ? "−" : ""}${Math.abs(r)}${unit}`; }
