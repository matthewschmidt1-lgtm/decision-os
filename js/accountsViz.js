// Accounts intro. First the learner spends five visits on a shortlist, seeing only the raw numbers (commit first). Then
// 84 scattered dots (the raw data) come together, first as the two inputs of expected value, then as one ranked line
// with the summary underneath, the learner's five picks ringed throughout.
import { h, s } from "./ui.js";
import { rankByEV, money } from "./models.js";
import { navigate } from "./app.js";

const STEPS = [
  { label: "The data", text: (n) => `${n} accounts, six numbers each: velocity, volume, margin, chance of winning, value and cost. Scattered, it's noise.` },
  { label: "The algorithm", text: () => "Two inputs: up is worth more, right is more likely to win. The algorithm multiplies them and subtracts the cost of trying. Each curve joins accounts worth the same, so a big account you probably won't win can rank below a small one you probably will." },
  { label: "The answer", text: (n, sum) => `One ranked line. The top 20 hold ${sum.topShare}% of the territory's expected value, and ${sum.neg} accounts cost more to pursue than they return.` },
];

export function accountsViz(accounts, { mine = [] } = {}) {
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
    const c = s("circle", { r: mine.includes(r.id) ? R + 2.5 : R, class: `dot ${r.channel}${mine.includes(r.id) ? " mine" : ""}`, "data-tone": tone(r, i), tabindex: "-1" }, s("title", {}, `${r.name}: ${money(r.ev)} expected value (${Math.round(r.probability * 100)}% × ${money(r.value)} − ${money(r.cost)})`));
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
    s("g", { class: "dots" }, ...dots.filter((d) => !d.classList.contains("mine")), ...dots.filter((d) => d.classList.contains("mine"))));

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
    caption, svg, ...(mine.length ? [h("p", { class: "acct-viz-key" }, h("span", { class: "ring", "aria-hidden": "true" }), "Your five visits")] : []), tiles);
  fig.play = play; fig.show = (i) => { stop(); show(i); };
  return fig;
}

function fmt(v, unit = "%") { const r = Math.round(v * 10) / 10; return `${r > 0 ? "+" : r < 0 ? "−" : ""}${Math.abs(r)}${unit}`; }

// ---------- Five visits: commit before the reveal ----------
// A shortlist of 12 built to test the usual instincts: big accounts you probably won't win, fast movers that don't pay,
// and small accounts you probably will. Shown the way reps usually see them, biggest first, without expected value.
export function shortlist(accounts) {
  const rows = rankByEV(accounts), pick = new Map(), add = (list, k) => list.slice(0, k).forEach((r) => pick.size < 12 && pick.set(r.id, r));
  add(rows.filter((r) => r.value < 36000), 3);                                                      // small, likely: the algorithm's picks
  add(rows.slice(0, 6), 2);                                                                         // top of the list
  add([...rows].filter((r) => r.probability < 0.4).sort((a, b) => b.value - a.value), 3);            // big, unlikely
  add([...rows].filter((r) => r.ev < 8000).sort((a, b) => b.velocity - a.velocity), 2);              // fast movers that don't pay
  add([...rows].filter((r) => r.ev < 0).sort((a, b) => b.value - a.value), 1);                       // big and not worth it
  add(rows.slice(20, 40), 12);                                                                       // fill from the middle
  return [...pick.values()].sort((a, b) => b.value - a.value);
}
export function scoreVisits(list, mineIds) {
  const best = [...list].sort((a, b) => b.ev - a.ev).slice(0, 5), mine = list.filter((r) => mineIds.includes(r.id));
  const tot = (xs) => xs.reduce((a, r) => a + r.ev, 0), mean = (xs, k) => xs.reduce((a, r) => a + r[k], 0) / xs.length;
  return { best, mine, you: tot(mine), them: tot(best), same: mine.filter((r) => best.includes(r)).length,
    avg: { mineV: mean(mine, "value"), bestV: mean(best, "value"), mineP: mean(mine, "probability"), bestP: mean(best, "probability"), mineVel: mean(mine, "velocity"), bestVel: mean(best, "velocity") },
    neg: mine.filter((r) => r.ev < 0) };
}

const KEY = "decision-os:visits:v1";
const loadPicks = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) && v.length === 5 ? v : null; } catch { return null; } };
const savePicks = (v) => { try { v ? localStorage.setItem(KEY, JSON.stringify(v)) : localStorage.removeItem(KEY); } catch {} };

export function visitChallenge(accounts, { onDone } = {}) {
  const list = shortlist(accounts), host = h("div", { class: "visits" });
  const pct = (p) => `${Math.round(p * 100)}%`, signed = (v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Math.round(v))}%`;

  const ask = () => {
    const chosen = new Set();
    const count = h("span", { class: "visits-count" }), go = h("button", { type: "button", class: "btn", disabled: true, onClick: () => { savePicks([...chosen]); reveal([...chosen], true); } }, "Rank my five ");
    const sync = () => { count.textContent = `${chosen.size} of 5 visits planned`; go.disabled = chosen.size !== 5; rowEls.forEach((b) => { const on = chosen.has(b.dataset.id); b.setAttribute("aria-pressed", String(on)); b.disabled = !on && chosen.size >= 5; }); };
    const rowEls = list.map((r) => h("button", { type: "button", class: "visit", dataset: { id: r.id }, onClick: () => { chosen.has(r.id) ? chosen.delete(r.id) : chosen.add(r.id); sync(); } },
      h("span", { class: "tick", "aria-hidden": "true" }),
      h("span", { class: "who" }, h("b", {}, r.name), h("span", {}, r.channel === "on" ? "On-premise" : "Off-premise")),
      h("span", { class: "num" }, money(r.value), h("small", {}, "if won")),
      h("span", { class: "num" }, pct(r.probability), h("small", {}, "chance")),
      h("span", { class: "num" }, money(r.cost), h("small", {}, "to pursue")),
      h("span", { class: `num ${r.velocity > 0 ? "good" : r.velocity < 0 ? "bad" : ""}` }, signed(r.velocity), h("small", {}, "velocity"))));
    sync();
    host.replaceChildren(h("div", { class: "card visits-ask" },
      h("p", { class: "eyebrow" }, "Before the answer"),
      h("h2", { class: "visits-q" }, "You have five visits this week. Which accounts get them?"),
      h("p", { class: "muted" }, "Twelve accounts on your list, biggest first, the way most reports show them. Pick five. Then see how the algorithm ranks them."),
      h("div", { class: "visits-list", role: "group", "aria-label": "Accounts to visit" }, ...rowEls),
      h("div", { class: "visits-go" }, count, go, h("button", { type: "button", class: "link", onClick: () => { onDone?.(); host.replaceChildren(accountsVizWith([])); } }, "Skip to the ranking"))));
  };

  const accountsVizWith = (mine, animate = true) => { const v = accountsViz(accounts, { mine }); requestAnimationFrame(() => (animate ? v.play() : v.show(2))); setTimeout(() => { if (!v.querySelector("svg").dataset.step) animate ? v.play() : v.show(2); }, 300); return v; };

  const reveal = (ids, animate) => {
    const sc = scoreVisits(list, ids), gap = sc.them - sc.you;
    const why = [];
    if (sc.avg.mineV > sc.avg.bestV * 1.1 && sc.avg.mineP < sc.avg.bestP - 0.08) why.push(`You leaned toward size: your picks averaged ${money(sc.avg.mineV)} if won at a ${pct(sc.avg.mineP)} chance. The algorithm's averaged ${money(sc.avg.bestV)} at ${pct(sc.avg.bestP)}.`);
    if (sc.avg.mineVel > sc.avg.bestVel + 5) why.push(`You followed velocity: your picks averaged ${signed(sc.avg.mineVel)}. Fast-moving accounts aren't always the ones likely to say yes.`);
    if (sc.neg.length) why.push(`${sc.neg.map((r) => r.name).join(" and ")} ${sc.neg.length === 1 ? "costs" : "cost"} more to pursue than ${sc.neg.length === 1 ? "it's" : "they're"} likely to return.`);
    if (!why.length && gap > 0) why.push("Close. The difference is in how much the chance of winning should count against the size of the prize.");
    const col = (title, xs, cls) => h("div", { class: `visits-col ${cls}` }, h("p", { class: "eyebrow" }, title),
      h("ol", {}, xs.map((r) => h("li", { class: sc.best.includes(r) && sc.mine.includes(r) ? "both" : "" }, h("span", {}, r.name), h("b", { class: r.ev < 0 ? "bad" : "" }, money(r.ev))))),
      h("p", { class: "visits-total" }, `Expected value ${money(title === "Your five" ? sc.you : sc.them)}`));
    const result = h("div", { class: "card visits-result" },
      h("p", { class: "eyebrow" }, "Your five visits"),
      h("h2", { class: "visits-q" }, gap <= 0 ? `Your five match the algorithm's: ${money(sc.you)} of expected value.` : `Your five are worth ${money(sc.you)}. The algorithm's five are worth ${money(sc.them)}.`),
      h("p", { class: "lede" }, gap <= 0 ? "You weighed the chance of winning against the size of the prize, which is exactly what expected value does." : `You picked ${sc.same} of the same accounts. ${why.join(" ")}`),
      h("div", { class: "grid grid-2 visits-cols" }, col("Your five", sc.mine.sort((a, b) => b.ev - a.ev), "mine"), col("The algorithm's five", sc.best, "best")),
      h("div", { class: "visits-go" }, h("span", { class: "muted" }, "Below: all 84 accounts, with your five ringed."), h("button", { type: "button", class: "link", onClick: () => { savePicks(null); onDone?.(false); ask(); } }, "Try again")));
    host.replaceChildren(result, accountsVizWith(ids, animate));
    onDone?.(true);
    if (animate) result.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const saved = loadPicks();
  saved && saved.every((id) => list.some((r) => r.id === id)) ? reveal(saved, false) : ask();
  return host;
}
