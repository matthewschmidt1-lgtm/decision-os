import { h, s, link, arrow, eyebrow, bar, segmented, says, disclose, slider } from "../ui.js";
import { brands, distributors, brandById } from "../data.js";
import { fingerprintWidget } from "../lessons/widgets.js";
import { allocateHours, allocateBudget, allocateByRevenue, tradeGain, quadrant, money, pct } from "../models.js";
import { setMeta } from "../app.js";

/* ---------- Shared helpers ---------- */
const QUAD = {
  invest: { name: "Invest", line: "Growing, and the next dollar returns more than it costs.", act: "Fund it until the next dollar returns about $1, then stop." },
  protect: { name: "Protect margin", line: "Growing, but the next dollar returns less than it costs.", act: "Hold trade flat. Move support to display or distribution, where it isn't paying for volume you'd get anyway." },
  diagnose: { name: "Diagnose first", line: "Declining, and more spending won't fix it.", act: "Spend an hour, not a dollar. Find out whether it's distribution, price, execution, or demand." },
  fix: { name: "Fix and fund", line: "Declining, but it responds when supported.", act: "Find what broke, fix it, then fund it." },
};
const k$ = (v) => money(v * 1000);                      // $K → formatted
const perDollar = (v) => `$${v.toFixed(2)}`;            // return per $1
const perHour = (b) => `$${Math.round(b.mean * 1000).toLocaleString()}`;
const gp = (b) => b.revenue * b.gm / 100;
const totalGP = brands.reduce((a, b) => a + gp(b), 0);
const totalTrade = brands.reduce((a, b) => a + b.tradeK, 0);
const totalHours = brands.reduce((a, b) => a + b.hoursNow, 0);
const jump = (href, t) => h("a", { href, class: "pill", onClick: (e) => { e.preventDefault(); e.stopPropagation(); document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" }); history.replaceState({}, "", href); } }, t);
const sectionHead = (eb, title, sub) => h("div", { class: "section-head reveal" }, h("div", {}, eyebrow(eb), h("h2", { style: { marginTop: "10px" } }, title)), sub ? h("p", { class: "muted", style: { maxWidth: "44ch" } }, sub) : null);

/* ---------- 1. Brand map ---------- */
function brandMap(initial) {
  let selected = initial;
  const W = 640, H = 400, pad = { l: 52, r: 24, t: 28, b: 48 };
  const x0 = -6, x1 = 20, y0 = 0.3, y1 = 2.4;
  const X = v => pad.l + ((v - x0) / (x1 - x0)) * (W - pad.l - pad.r);
  const Y = v => pad.t + ((y1 - v) / (y1 - y0)) * (H - pad.t - pad.b);
  const R = b => 5 + Math.sqrt(b.revenue / 1e6) * 3.6;
  const svg = s("svg", { class: "chart bmap", viewBox: `0 0 ${W} ${H}`, role: "group", "aria-label": "Brand map: sales growth against return on the next trade dollar" });
  // quadrant shading and labels
  svg.append(s("rect", { x: X(0), y: pad.t, width: X(x1) - X(0), height: Y(1) - pad.t, class: "q q-invest" }));
  svg.append(s("line", { class: "axis", x1: X(0), y1: pad.t, x2: X(0), y2: H - pad.b }));
  svg.append(s("line", { class: "breakeven", x1: pad.l, y1: Y(1), x2: W - pad.r, y2: Y(1) }));
  svg.append(s("text", { class: "qlabel", x: W - pad.r - 6, y: pad.t + 16, "text-anchor": "end" }, "Invest"));
  svg.append(s("text", { class: "qlabel", x: W - pad.r - 6, y: H - pad.b - 8, "text-anchor": "end" }, "Protect margin"));
  svg.append(s("text", { class: "qlabel", x: pad.l + 6, y: H - pad.b - 8 }, "Diagnose first"));
  svg.append(s("text", { class: "qlabel", x: pad.l + 6, y: pad.t + 16 }, "Fix and fund"));
  svg.append(s("text", { class: "tick", x: W - pad.r, y: Y(1) - 6, "text-anchor": "end" }, "$1 back for every $1"));
  for (const v of [-5, 0, 5, 10, 15, 20]) svg.append(s("text", { class: "tick", x: X(v), y: H - pad.b + 18, "text-anchor": "middle" }, `${v > 0 ? "+" : ""}${v}%`));
  for (const v of [0.5, 1, 1.5, 2]) svg.append(s("text", { class: "tick", x: pad.l - 8, y: Y(v) + 4, "text-anchor": "end" }, `$${v.toFixed(1)}`));
  svg.append(s("text", { x: W - pad.r, y: H - 8, "text-anchor": "end" }, "Sales growth"));
  svg.append(s("text", { x: pad.l - 44, y: 14 }, "Gross profit from the next trade $"));
  const dots = {};
  for (const b of [...brands].sort((a, c) => c.revenue - a.revenue)) {
    const g = s("g", { class: `bubble ${b.n < 10 ? "uncertain" : ""}`, tabindex: "0", role: "button", "aria-label": `${b.name}: growth ${pct(b.growth, 0)}, next trade dollar returns ${perDollar(b.r0)}` });
    g.append(s("circle", { cx: X(b.growth), cy: Y(b.r0), r: R(b) }), s("text", { x: X(b.growth), y: Y(b.r0) + 4.5, "text-anchor": "middle" }, b.id));
    g.addEventListener("click", () => select(b.id));
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(b.id); } });
    dots[b.id] = g; svg.append(g);
  }
  const chips = h("div", { class: "pill-list", style: { marginTop: "14px" }, role: "group", "aria-label": "Choose a brand" },
    ...brands.map(b => h("button", { type: "button", class: "pill", "aria-pressed": "false", dataset: { id: b.id }, onClick: () => select(b.id) }, b.id)));
  const detail = h("div", { class: "stack", style: { "--gap": "14px" } });
  const tile = (label, value, tone = "") => h("div", { class: "ev-tile" }, h("span", { class: "k" }, label), h("span", { class: `v ${tone}` }, value));
  function select(id) {
    selected = id; const b = brandById[id]; const q = QUAD[quadrant(b)];
    Object.entries(dots).forEach(([k, g]) => g.classList.toggle("on", k === id));
    chips.querySelectorAll("button").forEach(c => c.setAttribute("aria-pressed", String(c.dataset.id === id)));
    const lesson = b.avgRoi > 1 && b.r0 < 1
      ? `On average, ${b.name}'s trade has paid back ${perDollar(b.avgRoi)} per dollar. The next dollar returns ${perDollar(b.r0)}. Average return tells you what worked. Next-dollar return tells you what to do.`
      : b.r0 > b.avgRoi + 0.2
        ? `${b.name} returns more on its next dollar (${perDollar(b.r0)}) than it has on average (${perDollar(b.avgRoi)}). It's under-supported: each extra dollar still has room to work.`
        : b.growth < 0
          ? `${b.name} is down ${Math.abs(b.growth)}%. Before spending to prop it up, find out why. An hour of diagnosis is cheaper than a quarter of promotion.`
          : `${b.name}'s next dollar returns about what its average has: ${perDollar(b.r0)}.`;
    detail.replaceChildren(
      h("div", {}, h("p", { class: "tag" }, `${q.name} · ${b.role}`), h("h3", { style: { marginTop: "6px", fontSize: "var(--fs-h2)" } }, b.name)),
      h("p", { class: "muted" }, q.line),
      h("div", { class: "ev-tiles" },
        tile("Revenue", money(b.revenue)), tile("Growth", pct(b.growth, 0), b.growth > 0 ? "good" : b.growth < 0 ? "bad" : ""),
        tile("Gross margin", `${b.gm}%`), tile("Margin trend", `${b.margin > 0 ? "+" : b.margin < 0 ? "−" : ""}${Math.abs(b.margin).toFixed(1)} pts`, b.margin > 0 ? "good" : b.margin < 0 ? "bad" : ""),
        tile("Trade spend", `${k$(b.tradeK)} · ${Math.round(b.tradeK * 1000 / b.revenue * 100)}%`), tile("Avg return per trade $", perDollar(b.avgRoi), b.avgRoi >= 1 ? "" : "bad"),
        tile("Next trade $ returns", perDollar(b.r0), b.r0 > 1 ? "good" : "bad"), tile("Return per hour", perHour(b))),
      h("p", { class: "says" }, lesson),
      h("p", {}, h("b", { style: { fontWeight: 600 } }, "What to do: "), q.act),
      b.n < 10 ? h("p", { class: "muted", style: { fontSize: "var(--fs-micro)" } }, "Little data yet (dashed outline). These estimates could be well off. A small test is worth more than a big bet.") : null,
    );
  }
  select(selected);
  return h("div", { class: "grid bmap-grid" }, h("div", {}, svg, chips), h("div", { class: "card card-sunk" }, detail));
}

/* ---------- 2. Fair share ---------- */
function fairShare() {
  let mode = "trade";
  const list = h("div", { class: "share-list" });
  const line = says("");
  const render = () => {
    const rows = brands.map(b => {
      const effort = mode === "trade" ? b.tradeK / totalTrade : b.hoursNow / totalHours;
      const ret = gp(b) / totalGP;
      return { b, effort: effort * 100, ret: ret * 100, gap: Math.round((effort - ret) * 100) };
    }).sort((a, c) => c.gap - a.gap);
    const max = Math.max(...rows.map(r => Math.max(r.effort, r.ret)));
    list.replaceChildren(...rows.map(r => h("div", { class: "share-row" },
      h("span", { class: "share-name" }, r.b.name),
      h("div", { class: "share-bars" },
        h("div", { class: "bar-track thin", title: "Share of effort" }, h("div", { class: "bar-fill", style: { width: `${(r.effort / max) * 100}%` } })),
        h("div", { class: "bar-track thin", title: "Share of gross profit" }, h("div", { class: "bar-fill accent", style: { width: `${(r.ret / max) * 100}%` } }))),
      h("span", { class: `share-gap ${r.gap > 3 ? "bad" : r.gap < -3 ? "good" : "muted"}` }, r.gap === 0 ? "even" : `${r.gap > 0 ? "+" : "−"}${Math.abs(r.gap)} ${Math.abs(r.gap) === 1 ? "pt" : "pts"}`))));
    const over = rows[0], under = rows.at(-1);
    const what = mode === "trade" ? "of trade dollars" : "of your selling hours";
    line.set(`${over.b.name} takes ${over.effort.toFixed(0)}% ${what} and earns ${over.ret.toFixed(0)}% of gross profit. ${under.b.name} earns ${under.ret.toFixed(0)}% of gross profit on ${under.effort.toFixed(0)}% ${what}. When effort and return drift this far apart, habit is usually doing the deciding.`, "warn");
  };
  render();
  return h("div", { class: "stack", style: { "--gap": "18px" } },
    h("div", { style: { display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" } },
      segmented([{ value: "trade", label: "Trade dollars" }, { value: "hours", label: "Your hours" }], mode, v => { mode = v; render(); }),
      h("div", { class: "legend" }, h("span", {}, h("i", { class: "key ink" }), "Share of effort"), h("span", {}, h("i", { class: "key accent" }), "Share of gross profit"), h("span", { class: "muted" }, "Gap"))),
    list, line);
}

/* ---------- 3. The next dollar ---------- */
function nextDollarPlanner() {
  let budget = 250, plan = "model", shown = Infinity;
  const rowsEl = h("div", { class: "share-list" });
  const tiles = h("div", { class: "ev-tiles" });
  const line = says("");
  const log = h("p", { class: "muted mono", style: { fontSize: "var(--fs-micro)", minHeight: "1.4em" } });
  const stepBtn = h("button", { type: "button", class: "btn btn-ghost" }, "Allocate the next $10K");
  const allBtn = h("button", { type: "button", class: "link", style: { fontSize: "var(--fs-small)" } }, "Show the full plan");
  const restartBtn = h("button", { type: "button", class: "link", style: { fontSize: "var(--fs-small)" } }, "Watch it from $0");
  const controls = h("div", { style: { display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" } }, stepBtn, allBtn, restartBtn);
  const tile = (label, value, tone = "") => h("div", { class: "ev-tile" }, h("span", { class: "k" }, label), h("span", { class: `v ${tone}` }, value));
  const render = () => {
    const model = allocateBudget(brands, budget), habit = allocateByRevenue(brands, budget);
    let x = plan === "model" ? { ...model.x } : habit.x, steps = model.steps;
    if (plan === "model" && shown < steps.length) {
      x = Object.fromEntries(brands.map(b => [b.id, 0]));
      steps.slice(0, shown).forEach(st => { x[st.id] += st.amount; });
      const last = steps[shown - 1];
      log.textContent = shown === 0 ? "Nothing allocated yet. Each click gives $10K to the brand whose next $10K returns the most." : `Step ${shown}: $10K to ${brandById[last.id].name}, because its next $10K returns ${perDollar(last.ret)} per dollar.`;
    } else if (plan === "model") {
      log.textContent = model.unspent > 0 ? `Stopped after ${steps.length} steps: no brand's next $10K returns more than it costs, so $${model.unspent}K stays in your pocket.` : `All $${budget}K placed in ${steps.length} steps.`;
    } else log.textContent = "Each brand gets a share of the budget equal to its share of revenue.";
    const spent = Object.values(x).reduce((a, v) => a + v, 0);
    const gain = brands.reduce((a, b) => a + tradeGain(b, x[b.id]), 0);
    const max = Math.max(40, ...Object.values(x));
    rowsEl.replaceChildren(...[...brands].sort((a, b) => x[b.id] - x[a.id] || b.r0 - a.r0).map(b => {
      const nd = (tradeGain(b, x[b.id] + 10) - tradeGain(b, x[b.id])) / 10;
      return h("div", { class: "share-row plan-row" },
        h("span", { class: "share-name" }, b.name),
        h("div", { class: "bar-track" }, h("div", { class: `bar-fill ${plan === "model" ? "accent" : ""}`, style: { width: `${(x[b.id] / max) * 100}%` } })),
        h("span", { class: "num", style: { textAlign: "right", fontWeight: 500 } }, x[b.id] ? k$(x[b.id]) : "—"),
        h("span", { class: `num share-gap ${nd > 1.005 ? "good" : x[b.id] ? "muted" : "bad"}`, title: "Gross profit per dollar from the next $10K" }, `next $10K: ${perDollar(nd)}/$`));
    }));
    tiles.replaceChildren(tile("Spent", k$(spent)), tile("Gross profit gained", k$(gain)), tile("Net return", `${gain - spent >= 0 ? "+" : ""}${k$(gain - spent)}`, gain - spent >= 0 ? "good" : "bad"), tile("Left unspent", k$(Math.max(0, Math.round(budget - spent)))));
    const worst = [...brands].sort((a, b) => habit.x[b.id] - habit.x[a.id]).slice(0, 2);
    line.set(`Same $${budget}K. The model's plan nets ${model.net >= 0 ? "+" : ""}${k$(model.net)}${model.unspent > 0 ? ` and leaves $${model.unspent}K unspent` : ""}. Spreading it by revenue nets ${habit.net >= 0 ? "+" : ""}${k$(habit.net)}: ${worst[0].name} and ${worst[1].name} get ${k$(habit.x[worst[0].id] + habit.x[worst[1].id])}, where the next dollar returns ${perDollar(worst[0].r0)} and ${perDollar(worst[1].r0)}.`, model.net > habit.net ? "good" : "");
    controls.hidden = plan !== "model";
    stepBtn.disabled = shown >= steps.length;
  };
  stepBtn.addEventListener("click", () => { const n = allocateBudget(brands, budget).steps.length; shown = Math.min(n, (shown === Infinity ? n : shown) + 1); render(); });
  allBtn.addEventListener("click", () => { shown = Infinity; render(); });
  restartBtn.addEventListener("click", () => { shown = 0; render(); });
  const sl = slider({ label: "Extra trade budget this quarter", min: 50, max: 400, step: 25, value: budget, format: v => `$${v}K`, onInput: v => { budget = v; shown = Infinity; render(); } });
  render();
  return h("div", { class: "stack", style: { "--gap": "20px" } },
    h("div", { class: "grid grid-2", style: { alignItems: "end" } }, sl, segmented([{ value: "model", label: "Highest next-dollar return first" }, { value: "habit", label: "Spread by revenue" }], plan, v => { plan = v; shown = Infinity; render(); })),
    controls, log, rowsEl, tiles, line);
}

/* ---------- 4. The next hour ---------- */
function nextHour() {
  let c = 0.5;
  const rowsEl = h("div", { class: "share-list" });
  const line = says("");
  const label = v => v < 0.25 ? "exploit only" : v < 0.75 ? "balanced" : v < 1.2 ? "curious" : "explore heavily";
  const render = () => {
    const alloc = allocateHours(brands.map(b => ({ id: b.id, name: b.name, mean: b.mean, n: b.n, sd: b.sd })), 10, c);
    const now = Object.fromEntries(brands.map(b => [b.id, b.hoursNow / totalHours * 10]));
    const model = Object.fromEntries(alloc.map(a => [a.id, a.hours]));
    const max = Math.max(...Object.values(now), ...Object.values(model));
    rowsEl.replaceChildren(...[...brands].sort((a, b) => model[b.id] - model[a.id]).map(b => h("div", { class: "share-row" },
      h("span", { class: "share-name" }, b.name),
      h("div", { class: "share-bars" },
        h("div", { class: "bar-track thin" }, h("div", { class: "bar-fill muted", style: { width: `${(now[b.id] / max) * 100}%` } })),
        h("div", { class: "bar-track thin" }, h("div", { class: "bar-fill accent", style: { width: `${(model[b.id] / max) * 100}%` } }))),
      h("span", { class: "share-gap num" }, `${now[b.id].toFixed(1)} → ${model[b.id].toFixed(1)}h`))));
    const shifts = brands.map(b => ({ b, d: model[b.id] - now[b.id] })).sort((a, b) => b.d - a.d);
    const up = shifts[0], down = shifts.at(-1);
    line.set(`The biggest shift: ${up.b.name} goes from ${now[up.b.id].toFixed(1)} to ${model[up.b.id].toFixed(1)} hours, because each hour returns about ${perHour(up.b)} in gross profit. ${down.b.name} drops from ${now[down.b.id].toFixed(1)} to ${model[down.b.id].toFixed(1)}. At "${label(c)}", brands you know little about, like M and O, get ${(model.M + model.O).toFixed(1)} hours so you can find out whether they're real.`);
  };
  const sl = slider({ label: "Appetite for exploration", min: 0, max: 1.5, step: 0.1, value: c, format: label, onInput: v => { c = v; render(); } });
  render();
  return h("div", { class: "stack", style: { "--gap": "18px" } },
    h("div", { class: "legend" }, h("span", {}, h("i", { class: "key muted" }), "How you spend 10 hours today"), h("span", {}, h("i", { class: "key accent" }), "Model's 10 hours")),
    rowsEl, sl, line,
    h("div", { class: "layer layer-2" }, eyebrow("Why is Brand C so low?"), h("p", {}, "Brand C is down 3%, and an hour spent selling it returns little today, so the model pulls time away. But that's not the end of it. The most valuable hour for Brand C is a diagnostic one: find out whether it lost distribution, price, or shelf, before you spend more time or money on it."),
      link("/learn/value-of-information", h("span", { class: "link", style: { marginTop: "8px", display: "inline-flex" } }, "Learn: value of information ", arrow()))),
    h("p", { class: "muted", style: { fontSize: "var(--fs-micro)" } }, "A real bandit picks one option at a time and learns. This is the same idea as a time split: each brand's score is its proven return per hour plus a bonus for how little you know. Figures are illustrative."));
}

/* ---------- Commercial chain (unchanged) ---------- */
const chainMeasures = {
  shipment: { label: "Shipment", desc: "What the company sold into distributors. This is what shows up on the P&L, and it looks like growth.", vals: { cascade: 14, harbor: 6, summit: 9 } },
  inventory: { label: "Distributor inventory", desc: "What is sitting in distributor warehouses. Rising inventory with flat depletion is borrowed growth.", vals: { cascade: 19, harbor: 4, summit: 12 } },
  depletion: { label: "Depletion", desc: "What accounts ordered from the distributor. Depletion is the distributor's warehouse emptying into stores and bars.", vals: { cascade: 1, harbor: 5, summit: 2 } },
  sellthrough: { label: "Sell-through", desc: "What shoppers and guests actually bought from the account. Consumer demand, and the only number that can't be gamed for long.", vals: { cascade: 2, harbor: 4, summit: 2 } },
};
function commercialChain() {
  let measure = "shipment";
  const chainBars = h("div", { class: "bars" });
  const chainSays = says("");
  const chainViz = h("div", { class: "tree", style: { marginBottom: "20px" } });
  const steps = ["Company", "Distributor", "Account", "Consumer"], stepFor = { shipment: 0, inventory: 1, depletion: 2, sellthrough: 3 };
  const render = () => {
    const m = chainMeasures[measure];
    chainBars.replaceChildren(...distributors.map(d => bar(d.name, Math.max(0, m.vals[d.id]), 20, { tone: measure === "inventory" && m.vals[d.id] > 10 ? "warn" : measure === "depletion" && m.vals[d.id] < 3 ? "bad" : "", format: v => pct(v, 0) })));
    const gap = chainMeasures.shipment.vals.cascade - chainMeasures.depletion.vals.cascade;
    chainSays.set(measure === "depletion" ? `${m.desc} Cascade took +14% in shipments but accounts only ordered +1% more: a ${gap}-point gap that will unwind.` : m.desc, measure === "inventory" || measure === "depletion" ? "warn" : "");
    chainViz.replaceChildren(...steps.flatMap((c, i) => [h("div", { class: `node ${stepFor[measure] === i ? "" : "dim"}`, style: { minWidth: "160px" } }, h("span", { class: "n" }, c), h("span", { class: "v", style: { fontSize: "var(--fs-micro)", fontWeight: 500, color: "var(--muted)" } }, ["shipments in", "inventory · depletion out", "orders in · sell-through out", "what people buy"][i])), i < 3 ? h("div", { class: "edge" }) : null].filter(Boolean)));
  };
  render();
  return h("div", {}, h("div", { style: { marginBottom: "20px" } }, segmented(Object.entries(chainMeasures).map(([k, v]) => ({ value: k, label: v.label })), measure, v => { measure = v; render(); })),
    h("div", { class: "grid grid-2", style: { alignItems: "start" } }, chainViz, h("div", { class: "stack" }, chainBars, chainSays)));
}

/* ---------- Page ---------- */
export default function Portfolio({ params }) {
  setMeta({ title: "Portfolio", description: "Fifteen brands, two budgets: your time and your trade dollars. See where each returns the most." });
  const focus = brandById[params.get("brand")] || brandById.D;
  return h("div", {},
    h("section", { class: "reveal" }, eyebrow("Portfolio"), h("h1", { class: "hero", style: { marginTop: "16px" } }, "Two budgets. Fifteen brands."),
      h("p", { class: "hero-sub" }, "Your time and your trade dollars are the only two things you invest. This page shows where each one returns the most, and why that's rarely the biggest brand."),
      h("p", { class: "muted", style: { marginTop: "12px", fontSize: "var(--fs-micro)" } }, "Illustrative portfolio. Brand figures, returns, and hours are generated for practice."),
      h("nav", { "aria-label": "On this page", class: "pill-list", style: { marginTop: "22px" } },
        jump("#map", "Brand map"), jump("#share", "Fair share"), jump("#dollars", "Next dollar"), jump("#attention", "Next hour"), jump("#chain", "Commercial chain"), jump("#fingerprint", "Economic fingerprint"), jump("#brands", "All brands"))),

    h("section", { class: "section", id: "map" },
      sectionHead("Brand map", "Which brands deserve more, and which have had enough?", "Across: is the brand growing? Up: what does the next trade dollar return in gross profit? Above the line, it pays back. Bubble size is revenue."),
      h("div", { class: "reveal" }, brandMap(focus.id))),

    h("section", { class: "section", id: "share" },
      sectionHead("Fair share", "Does your effort follow the return?", "For each brand, the share of your effort it gets against the share of gross profit it earns. Big gaps are where habit, not return, is deciding."),
      h("div", { class: "card reveal" }, fairShare())),

    h("section", { class: "section", id: "dollars" },
      sectionHead("The next dollar", "Where should the next trade dollar go?", "Each brand's returns shrink as it gets more money. The model gives each $10K to the brand whose next $10K returns the most, and stops when nothing returns more than it costs."),
      h("div", { class: "card reveal" }, nextDollarPlanner(),
        h("div", { style: { marginTop: "20px" } }, disclose("How the model decides", h("div", { class: "stack" },
          h("p", {}, "This is marginal analysis done one step at a time. Every brand has a curve: the first dollars of extra support return a lot, later dollars return less. Giving each $10K to whichever brand's next $10K returns the most keeps the returns across brands roughly equal at the end, which is where a budget is working hardest. When no brand's next dollar returns more than a dollar, spending more loses money, so the model stops."),
          h("p", { class: "muted" }, "Average return tells you what past spending achieved. Next-dollar return tells you what the next decision will achieve. Brand A has paid back well on average, and its next dollar still doesn't."),
          link("/learn/optimization", h("span", { class: "link" }, "Learn: optimization and marginal analysis ", arrow()))))))),

    h("section", { class: "section", id: "attention" },
      sectionHead("The next hour", "Where should your next 10 hours go?", "Time works like trade dollars, with one difference: for brands you know little about, some time is worth spending just to find out."),
      h("div", { class: "card reveal" }, nextHour())),

    h("section", { class: "section", id: "chain" },
      sectionHead("The commercial chain", "Where does the growth actually come from?", "Company → Distributor → Account → Consumer. Shipments fill the distributor, depletion fills the account, sell-through is what people actually buy. Start at shipments, then follow the growth down the chain and see where it stops."),
      h("div", { class: "card reveal" }, commercialChain())),

    h("section", { class: "section", id: "fingerprint" },
      sectionHead("Economic fingerprint", "What actually drove the result?", "Northwest Market's last quarter: sales splits into volume and price. Margin and trade spend tell you whether the growth was earned or bought."),
      h("div", { class: "card reveal" }, fingerprintWidget({ volume: 3, price: 8, tradeSpend: 21 }))),

    h("section", { class: "section", id: "brands" },
      sectionHead("All brands", "Growth, margin, and the return on your time and money."),
      h("div", { class: "table-wrap reveal" }, h("table", { class: "table" },
        h("thead", {}, h("tr", {}, h("th", {}, "Brand"), h("th", {}, "Where it sits"), h("th", { class: "num" }, "Revenue"), h("th", { class: "num" }, "Growth"), h("th", { class: "num" }, "Gross margin"), h("th", { class: "num" }, "Trade % of sales"), h("th", { class: "num" }, "Avg return / $"), h("th", { class: "num" }, "Next $ returns"), h("th", { class: "num" }, "Return / hour"))),
        h("tbody", {}, brands.map(b => h("tr", { style: b.id === params.get("brand") ? { background: "var(--accent-soft)" } : null },
          h("td", {}, h("b", { style: { fontWeight: 500 } }, b.name)), h("td", { class: "muted" }, QUAD[quadrant(b)].name), h("td", { class: "num" }, money(b.revenue)),
          h("td", { class: `num ${b.growth > 0 ? "good" : b.growth < 0 ? "bad" : ""}` }, pct(b.growth, 0)),
          h("td", { class: "num" }, `${b.gm}%`, h("span", { class: `muted ${b.margin > 0 ? "good" : b.margin < 0 ? "bad" : ""}`, style: { marginLeft: "6px", fontSize: "var(--fs-micro)" } }, `${b.margin > 0 ? "+" : b.margin < 0 ? "−" : ""}${Math.abs(b.margin).toFixed(1)}`)),
          h("td", { class: `num ${b.tradeK * 1000 / b.revenue > 0.15 ? "bad" : ""}` }, `${Math.round(b.tradeK * 1000 / b.revenue * 100)}%`),
          h("td", { class: "num" }, perDollar(b.avgRoi)), h("td", { class: `num ${b.r0 > 1 ? "good" : "bad"}` }, perDollar(b.r0)),
          h("td", { class: "num" }, perHour(b), b.n < 10 ? h("span", { class: "muted", style: { fontSize: "var(--fs-micro)" } }, " ±") : null))))))),

    h("section", { class: "section reveal" },
      h("div", { class: "card", style: { padding: "clamp(28px,5vw,48px)", display: "grid", gridTemplateColumns: "1fr auto", gap: "24px", alignItems: "center" } },
        h("div", {}, eyebrow("Next"), h("h2", { style: { marginTop: "10px" } }, "Brands compete for your time. Accounts are where you spend it."),
          h("p", { class: "muted", style: { marginTop: "10px", maxWidth: "48ch" } }, "See the 84 accounts ranked by expected value, not by size, and which ones deserve a visit this week.")),
        link("/accounts", h("span", { class: "btn btn-lg" }, "Go to accounts ", arrow())))),
  );
}
