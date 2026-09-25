// Interactive "algorithm underneath" experiments. Each returns a DOM node. Shared by decisions and lessons.
import { h, slider, segmented, says, bar, tween, metric } from "../ui.js";
import { lineChart, beforeAfter } from "../charts.js";
import * as M from "../models.js";
import { brands } from "../data.js";

/* Marginal analysis: slide promo change, watch volume/contribution, see curve */
export function marginalWidget({ compact = false } = {}) {
  const base = { spend: 40, vmax: 1200, k: 60, unitMargin: 0.11 };
  const pts = []; for (let sp = 0; sp <= 160; sp += 4) pts.push([sp, M.contributionAt(sp, base)]);
  const mpts = []; for (let sp = 0; sp <= 160; sp += 4) mpts.push([sp, M.marginalContribution(sp, base) * 40]);
  const sc0 = M.promoScenario(0, base);
  const chart = lineChart({ series: [{ pts, cls: "" }], marker: [base.spend, sc0.contribution, "now"], xLabel: "Trade spend ($K)", yLabel: "Incremental contribution ($K)", zeroLine: true, annotate: { aria: "Contribution rises with trade spend, peaks, then falls: diminishing returns." } });
  const ba = beforeAfter([
    { label: "Volume", before: sc0.volume, after: sc0.volume, max: 1200, format: v => `${Math.round(v)} cases` },
    { label: "Contribution", before: sc0.contribution, after: sc0.contribution, max: 90, format: v => `$${v.toFixed(1)}K` },
  ]);
  const line = says("Move the slider. Watch what each extra dollar buys.");
  const opt = M.optimalSpend(base);
  const sl = slider({ label: "Change in promotion spend", min: -40, max: 80, step: 5, value: 0, format: v => `${v > 0 ? "+" : ""}${v}%`, onInput: (v) => {
    const sc = M.promoScenario(v, base);
    chart.setMarker(sc.spend, sc.contribution, `$${sc.spend.toFixed(0)}K`);
    ba.update([sc.volume, sc.contribution]);
    const extra = sc.spend - base.spend;
    if (v === 0) line.set("This is where you are now. Each additional dollar still returns slightly more than it costs.");
    else if (v > 0 && sc.contributionPct < 0) line.set(`The additional $${extra.toFixed(0)}K buys ${M.pct(sc.volumePct)} volume, but lowers expected contribution by ${Math.abs(sc.contributionPct).toFixed(1)}%. The extra spend costs more than the volume it buys.`, "warn");
    else if (v > 0 && sc.spend > opt) line.set(`The additional $${extra.toFixed(0)}K buys ${M.pct(sc.volumePct)} volume and still adds ${M.pct(sc.contributionPct)} contribution overall, but the last dollars are now losing money. You've passed the peak of the curve.`, "warn");
    else if (v < 0) line.set(`Cutting $${Math.abs(extra).toFixed(0)}K loses ${Math.abs(sc.volumePct).toFixed(1)}% of volume and ${sc.contributionPct < 0 ? "lowers" : "raises"} contribution by ${Math.abs(sc.contributionPct).toFixed(1)}%.${sc.contributionPct < 0 ? " At today's spend, the promotion is still paying for itself." : ""}`, sc.contributionPct < 0 ? "warn" : "good");
    else line.set(`The additional $${extra.toFixed(0)}K buys ${M.pct(sc.volumePct)} volume and ${M.pct(sc.contributionPct)} contribution. Still worth it, barely.`, "good");
  } });
  const reset = h("button", { type: "button", class: "link", style: { fontSize: "var(--fs-small)" }, onClick: () => { sl.set(0); sl.querySelector("input").dispatchEvent(new Event("input")); } }, "Reset to today's spend");
  return h("div", { class: "stack", style: { "--gap": "22px" } }, compact ? null : chart, sl, ba, line, h("div", { style: { display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" } }, h("p", { class: "muted", style: { fontSize: "var(--fs-micro)" } }, `The model's optimum is about $${opt.toFixed(0)}K, where the marginal contribution of the next dollar reaches zero.`), reset));
}

/* Utility: adjust objective weights, watch the ranking change */
export function utilityWidget(options, { initial = { volume: 30, revenue: 30, margin: 40 } } = {}) {
  const w = { ...initial };
  const list = h("div", { class: "bars" });
  const line = says("");
  const render = () => {
    const ranked = M.utilityRank(options, w);
    list.replaceChildren(...ranked.map((o, i) => bar(o.name, o.utility, 100, { tone: i === 0 ? "accent" : "muted", format: v => v.toFixed(0) })));
    const top = ranked[0];
    const sorted = Object.entries(w).sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((a, [, v]) => a + v, 0);
    if (total === 0) line.set("No objective is weighted, so every option ties. A model can't rank options until you tell it what matters.", "warn");
    else if (sorted[0][1] === sorted[1][1]) line.set(`${sorted[0][0]} and ${sorted[1][0]} are weighted equally. ${top.name} scores best on that blend. Tip the balance and watch the ranking move.`);
    else line.set(`With ${sorted[0][0]} weighted highest, ${top.name} scores best. The recommendation depends on the objective, not just the data.`);
  };
  const keys = ["volume", "revenue", "margin"];
  const sliders = {};
  const rebalance = (k, v) => {
    const [a, b] = keys.filter(x => x !== k); const rest = w[a] + w[b]; const target = 100 - v;
    w[a] = Math.round((rest > 0 ? (w[a] / rest) * target : target / 2) / 5) * 5;
    w[b] = target - w[a];
    w[k] = v; sliders[a].set(w[a]); sliders[b].set(w[b]); render();
  };
  keys.forEach(k => { sliders[k] = slider({ label: k[0].toUpperCase() + k.slice(1), min: 0, max: 100, step: 5, value: w[k], format: v => `${v}%`, onInput: v => rebalance(k, v) }); });
  render();
  return h("div", { class: "grid grid-2", style: { alignItems: "start" } }, h("div", { class: "stack", style: { "--gap": "14px" } }, ...keys.map(k => sliders[k]), h("p", { class: "muted", style: { fontSize: "var(--fs-micro)" } }, "Weights always total 100%. Move one and the others rebalance.")), h("div", { class: "stack" }, h("p", { class: "eyebrow" }, "Ranking"), list, line));
}

/* Bandit: allocate 10 hours across brands; exploration slider */
const explorationLabel = v => v < 0.25 ? "exploit only" : v < 0.75 ? "balanced" : v < 1.2 ? "curious" : "explore heavily";
export function banditWidget({ hours = 10 } = {}) {
  const arms = brands.map(b => ({ id: b.id, name: b.name, mean: b.mean, n: b.n, sd: b.sd }));
  let c = 0.5, mode = "model";
  const list = h("div", { class: "bars" });
  const line = says("");
  const totalRev = brands.reduce((a, b) => a + b.revenue, 0);
  const byRevenue = brands.map(b => ({ id: b.id, name: b.name, hours: (b.revenue / totalRev) * hours })).sort((a, b) => b.hours - a.hours);
  const render = () => {
    const alloc = M.allocateHours(arms, hours, c);
    if (mode === "revenue") {
      const top = byRevenue.slice(0, 6); const rest = byRevenue.slice(6).reduce((a, x) => a + x.hours, 0);
      list.replaceChildren(...top.map((a) => bar(a.name, a.hours, 4, { tone: "muted", format: M.hours })), bar("Others", rest, 4, { tone: "muted", format: M.hours }));
      const d = alloc.find(a => a.id === "D"), dRev = byRevenue.find(a => a.id === "D");
      line.set(`This is the habit: time follows revenue. Brand A gets ${byRevenue[0].hours.toFixed(1)} hours because it's biggest. Brand D gets ${dRev.hours.toFixed(1)}. The model would give Brand D ${d.hours.toFixed(1)}, because its return on the next hour is the highest in the portfolio.`, "warn");
      return;
    }
    const top = alloc.slice(0, 6); const rest = Math.max(0, Math.round((hours - top.reduce((a, x) => a + x.hours, 0)) * 10) / 10);
    list.replaceChildren(...top.map((a, i) => bar(a.name, a.hours, 4, { tone: i === 0 ? "accent" : "", format: M.hours })), bar("Others", rest, 4, { tone: "muted", format: M.hours }));
    const explore = alloc.filter(a => a.n < 20).reduce((a, x) => a + x.hours, 0);
    const lead = alloc[0];
    const mode_ = explorationLabel(c);
    line.set(mode_ === "exploit only" ? `Pure exploitation. ${lead.name} gets the most time because its proven return is highest. Brands with little data get almost nothing, so you never learn whether they'd work.` : mode_ === "explore heavily" ? `Heavy exploration. ${explore.toFixed(1)} hours go to brands with little evidence. You'll learn a lot, at the cost of known return.` : mode_ === "curious" ? `Curious. ${lead.name} still leads, but ${explore.toFixed(1)} hours now go to brands you know little about. You're paying a little known return to learn faster.` : `Balanced. ${lead.name} leads on proven return, while ${explore.toFixed(1)} hours are spent learning whether Brand M and Brand O are real opportunities.`);
  };
  const sl = slider({ label: "Appetite for exploration", min: 0, max: 1.5, step: 0.1, value: 0.5, format: explorationLabel, onInput: v => { c = v; render(); } });
  render();
  const toggle = segmented([{ value: "model", label: "Model's allocation" }, { value: "revenue", label: "If time followed revenue" }], "model", v => { mode = v; render(); });
  return h("div", { class: "stack", style: { "--gap": "22px" } }, h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" } }, h("p", { class: "eyebrow" }, `Your next ${hours} hours`), toggle), list, sl, line, h("p", { class: "muted", style: { fontSize: "var(--fs-micro)" } }, "A real bandit picks one arm at a time and learns. This is the same idea turned into a time split: each brand's score is proven return plus an uncertainty bonus, and hours follow the scores. Return-per-hour figures are illustrative."));
}

/* Bayesian updating: toggle evidence and watch the belief move */
export function bayesWidget() {
  const prior = 0.35;
  const evidence = [
    { name: "Your first SKU is top third on velocity in her stores", lr: 2.0, on: true },
    { name: "Two nearby competitors added the second SKU last quarter", lr: 1.8, on: true },
    { name: "Buyer emailed: 'send me the data'", lr: 1.5, on: true },
    { name: "Distributor rep (60 brands) says 'don't bother'", lr: 0.7, on: true },
  ];
  const big = h("span", { class: "num", style: { fontSize: "clamp(2.5rem,6vw,4rem)", fontWeight: 500, letterSpacing: "-0.03em" } }, `${Math.round(prior * 100)}%`);
  const trail = h("div", { class: "bars" });
  const line = says("");
  let last = prior;
  const render = () => {
    const steps = M.bayesUpdate(prior, evidence);
    const p = steps.at(-1).p;
    tween(big, last * 100, p * 100, v => `${Math.round(v)}%`); last = p;
    trail.replaceChildren(...steps.map((st, i) => bar(i === 0 ? "Prior" : `After evidence ${i}`, st.p * 100, 100, { tone: i === steps.length - 1 ? "accent" : "muted", format: v => `${v.toFixed(0)}%` })));
    const on = evidence.filter(e => e.on).length;
    const active = evidence.filter(e => e.on);
    const rep = evidence[3];
    const repLine = rep.on ? " The rep's 'don't bother' pulls the estimate down, but only a little: a rep carrying 60 brands says that often." : " With the rep's comment off, the estimate climbs. Notice how little that one opinion was worth.";
    const strongest = [...active].sort((a, b) => b.lr - a.lr)[0];
    line.set(on === 0 ? "No evidence yet. Your belief is just the base rate: about a third of second-SKU asks get a yes." : `${on} ${on === 1 ? "piece" : "pieces"} of evidence moved the estimate from ${Math.round(prior * 100)}% to ${Math.round(p * 100)}%.${strongest && strongest.lr > 1 ? ` The strongest signal: ${strongest.name}.` : ""}${repLine} Likelihood ratios are judgment calls; the habit is weighing each signal by how surprising it would be if you were wrong.`);
  };
  const toggles = evidence.map(e => h("button", { type: "button", class: "pill", "aria-pressed": String(e.on), onClick: (ev) => { e.on = !e.on; ev.currentTarget.setAttribute("aria-pressed", String(e.on)); render(); } }, `${e.name} · ×${e.lr}`));
  render();
  return h("div", { class: "grid grid-2", style: { alignItems: "start" } },
    h("div", { class: "stack" }, h("p", { class: "eyebrow" }, "Probability Fresh Thyme takes the second SKU"), big, h("p", { class: "muted", style: { fontSize: "var(--fs-small)" } }, "Toggle evidence. Each item multiplies the odds by its likelihood ratio."), h("div", { class: "pill-list" }, ...toggles)),
    h("div", { class: "stack" }, h("p", { class: "eyebrow" }, "Prior → evidence → updated belief"), trail, line));
}

/* Expected value: probability × value − cost */
export function evWidget({ p = 0.84, value = 21000, cost = 1500 } = {}) {
  const st = { p, value, cost };
  const big = h("span", { class: "num", style: { fontSize: "clamp(2.5rem,6vw,4rem)", fontWeight: 500, letterSpacing: "-0.03em" } });
  const formula = h("p", { class: "mono muted", style: { fontSize: "var(--fs-small)" } });
  const line = says("");
  const compare = { name: "Large, unlikely account", p: 0.15, value: 95000, cost: 6000 };
  let last = 0;
  const render = () => {
    const ev = M.expectedValue(st); tween(big, last, ev, v => M.money(v)); last = ev;
    formula.textContent = `${Math.round(st.p * 100)}% × ${M.money(st.value)} − ${M.money(st.cost)} = ${M.money(ev)}`;
    const evB = M.expectedValue(compare);
    const atReal = st.p === p && st.value === value && st.cost === cost;
    const long = `the ${M.money(compare.value)} long shot at ${Math.round(compare.p * 100)}% odds`;
    if (ev > evB) line.set(`This small, likely opportunity (${M.money(ev)}) is worth more than ${long} (${M.money(evB)}). Size is not value.`, "good");
    else if (atReal) line.set(ev < 0
      ? `At these numbers, this account costs more to pursue than it's likely to return (${M.money(ev)}). Even ${long} is worth more (${M.money(evB)}). Move the sliders to see what would make it worth a visit.`
      : `At these numbers, ${long} is worth more (${M.money(evB)} vs ${M.money(ev)}). Better odds or a lower cost would change that. Try the sliders.`, "warn");
    else line.set(`Now ${long} wins (${M.money(evB)} vs ${M.money(ev)}).${ev < 0 ? " This one would cost more to pursue than it's likely to return." : ""}`, "warn");
  };
  const sliders = [
    slider({ label: "Probability of success", min: 5, max: 95, step: 1, value: Math.round(st.p * 100), format: v => `${Math.round(v)}%`, onInput: v => { st.p = v / 100; render(); } }),
    slider({ label: "Economic value if won", min: 5000, max: 100000, step: 1000, value: st.value, format: M.money, onInput: v => { st.value = v; render(); } }),
    slider({ label: "Cost of pursuing", min: 0, max: 15000, step: 500, value: st.cost, format: M.money, onInput: v => { st.cost = v; render(); } }),
  ];
  render();
  const reset = h("button", { type: "button", class: "link", style: { fontSize: "var(--fs-small)" }, onClick: () => { Object.assign(st, { p, value, cost }); sliders[0].set(Math.round(p * 100)); sliders[1].set(value); sliders[2].set(cost); render(); } }, "Reset to the real numbers");
  return h("div", { class: "grid grid-2", style: { alignItems: "start" } }, h("div", { class: "stack", style: { "--gap": "14px" } }, ...sliders, reset), h("div", { class: "stack" }, h("p", { class: "eyebrow" }, "Expected value"), big, formula, line));
}

/* Decision tree: change probabilities and payoffs, watch the rolled-back value */
export function treeWidget() {
  const st = { pHigh: 0.55, pDistHigh: 0.6, pDistLow: 0.4 };
  const payoffs = { Expand: 40, List: 18, Diagnose: 8, Exit: -4 };
  const tree = () => ({ label: "Account opportunity", branches: [
    { label: "High velocity", p: st.pHigh, node: { label: "Distribution?", branches: [{ label: "Yes", p: st.pDistHigh, node: { label: "Expand", action: "Expand" } }, { label: "No", p: 1 - st.pDistHigh, node: { label: "List", action: "List" } }] } },
    { label: "Low velocity", p: 1 - st.pHigh, node: { label: "Distribution?", branches: [{ label: "Yes", p: st.pDistLow, node: { label: "Diagnose", action: "Diagnose" } }, { label: "No", p: 1 - st.pDistLow, node: { label: "Exit", action: "Exit" } }] } },
  ] });
  const view = h("div", {});
  const line = says("");
  const node = (n, dim = false) => h("div", { class: `node ${dim ? "dim" : ""}` }, h("span", { class: "n" }, n.label), h("span", { class: `v ${n.value < 0 ? "bad" : ""}` }, `${n.value < 0 ? "−" : ""}$${Math.abs(n.value).toFixed(0)}K`));
  const render = () => {
    const t = M.evaluateTree(tree(), payoffs);
    const contrib = t.branches.map(b => b.p * b.node.value);
    const best = contrib[0] >= contrib[1] ? 0 : 1;
    view.replaceChildren(h("div", { class: "tree" }, node(t), h("div", { class: "edge" }),
      h("div", { class: "branch" }, ...t.branches.map((b, i) => h("div", {}, h("div", { class: "edge" }), h("span", { class: "tag" }, `${b.label} · ${Math.round(b.p * 100)}%`), h("div", { style: { height: "6px" } }), node(b.node, i !== best), h("div", { class: "edge" }),
        h("div", { class: "branch" }, ...b.node.branches.map(l => h("div", {}, h("div", { class: "edge" }), h("span", { class: "tag" }, `${l.label} · ${Math.round(l.p * 100)}%`), h("div", { style: { height: "6px" } }), node(l.node, i !== best)))))))));
    line.set(`Rolling back from the leaves, the opportunity is worth about $${t.value.toFixed(0)}K today. The ${t.branches[best].label.toLowerCase()} path contributes $${contrib[best].toFixed(0)}K of that, against $${contrib[1 - best].toFixed(0)}K from the ${t.branches[1 - best].label.toLowerCase()} path. ${best === 0 ? "Velocity is the fact worth confirming first." : "The downside branch now dominates. Confirm velocity before you invest in distribution."}`, best === 0 ? "" : "warn");
  };
  const sliders = [
    slider({ label: "P(high velocity)", min: 5, max: 95, step: 5, value: 55, format: v => `${v}%`, onInput: v => { st.pHigh = v / 100; render(); } }),
    slider({ label: "P(distribution | high velocity)", min: 5, max: 95, step: 5, value: 60, format: v => `${v}%`, onInput: v => { st.pDistHigh = v / 100; render(); } }),
    slider({ label: "Payoff of Expand", min: 0, max: 80, step: 5, value: 40, format: v => `$${v}K`, onInput: v => { payoffs.Expand = v; render(); } }),
  ];
  render();
  return h("div", { class: "stack", style: { "--gap": "24px" } }, h("div", { style: { overflowX: "auto" } }, view), h("div", { class: "grid grid-3" }, ...sliders), line);
}

/* Value of information: which diagnostic most reduces uncertainty? */
export function voiWidget() {
  const causes = [
    { id: "pricing", name: "Pricing", p: 0.15 }, { id: "distribution", name: "Distribution", p: 0.15 }, { id: "demand", name: "Consumer demand", p: 0.10 },
    { id: "execution", name: "Execution", p: 0.20 }, { id: "promotion", name: "Promotion", p: 0.10 }, { id: "inventory", name: "Distributor inventory", p: 0.30 },
  ];
  const actions = {
    "Keep shipping": { pricing: 2, distribution: 3, demand: 1, execution: 2, promotion: 3, inventory: -12 },
    "Pause and verify": { pricing: 0, distribution: 0, demand: 0, execution: 0, promotion: 0, inventory: 6 },
    "Fix execution": { pricing: -2, distribution: 1, demand: -3, execution: 9, promotion: 0, inventory: -6 },
    "Reprice": { pricing: 8, distribution: -1, demand: -2, execution: -2, promotion: 1, inventory: -8 },
  };
  const diagnostics = [
    { name: "Pull account-level depletion report", resolves: ["inventory"], cost: 0.5 },
    { name: "Store visit: shelf and price check", resolves: ["pricing", "execution"], cost: 1.5 },
    { name: "Distributor call on order pattern", resolves: ["inventory", "distribution"], cost: 0.3 },
    { name: "Consumer panel pull", resolves: ["demand"], cost: 3 },
    { name: "Promo post-mortem", resolves: ["promotion"], cost: 1 },
  ];
  const list = h("div", { class: "bars" });
  const line = says("");
  const beliefs = h("div", { class: "bars" });
  const render = () => {
    const r = M.valueOfInformation(causes, actions, diagnostics);
    const max = Math.max(1, ...r.diagnostics.map(d => d.net));
    list.replaceChildren(...r.diagnostics.map((d, i) => bar(d.name, Math.max(0, d.net), max, { tone: i === 0 ? "accent" : "muted", format: () => `${d.net < 0 ? "−" : ""}$${Math.abs(d.net).toFixed(1)}K` })));
    beliefs.replaceChildren(...causes.map(c => bar(c.name, c.p * 100, 50, { tone: "muted", format: v => `${v.toFixed(0)}%` })));
    const top = r.diagnostics[0];
    line.set(`Acting now, the best move is "${r.now.id}" worth about $${r.now.ev.toFixed(1)}K. Knowing everything would add $${r.evpi}K. The single most valuable thing to learn is "${top.name}" (worth $${top.value}K for a cost of $${top.cost}K, so $${top.net}K net). Bars show value net of what each check costs.`);
  };
  const sl = slider({ label: "How likely is distributor inventory the cause?", min: 5, max: 70, step: 5, value: 30, format: v => `${v}%`, onInput: v => {
    const inv = causes.find(c => c.id === "inventory"); const others = causes.filter(c => c !== inv); const rest = others.reduce((a, c) => a + c.p, 0);
    inv.p = v / 100; others.forEach(c => c.p = (c.p / rest) * (1 - inv.p)); render();
  } });
  render();
  return h("div", { class: "grid grid-2", style: { alignItems: "start" } }, h("div", { class: "stack" }, h("p", { class: "eyebrow" }, "What the model thinks is causing it"), beliefs, sl), h("div", { class: "stack" }, h("p", { class: "eyebrow" }, "What should you learn before you decide?"), list, line));
}

/* Economic fingerprint: sales decomposed */
export function fingerprintWidget({ volume = 5, price = 3, tradeSpend = 14 } = {}) {
  const st = { volume, price, tradeSpend };
  const view = h("div", {});
  const line = says("");
  const node = (n, v, tone) => h("div", { class: "node" }, h("span", { class: "n" }, n), h("span", { class: `v ${tone}` }, `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v)}%`));
  const render = () => {
    const f = M.fingerprint(st);
    view.replaceChildren(h("div", { class: "tree" }, node("Sales", f.sales, f.sales >= 0 ? "good" : "bad"), h("div", { class: "edge" }),
      h("div", { class: "branch" }, h("div", {}, h("div", { class: "edge" }), node("Volume", f.volume, f.volume >= 0 ? "good" : "bad"), h("div", { class: "edge" }), node("Margin", f.margin, f.margin >= 0 ? "good" : "bad"), h("div", { class: "edge" }), node("Trade spend", f.tradeSpend, f.tradeSpend > 8 ? "bad" : "")), h("div", {}, h("div", { class: "edge" }), node("Price", f.price, f.price >= 0 ? "good" : "bad")))));
    line.set(f.margin < 0 && f.sales > 0 ? `Sales are up ${f.sales}% but margin is down ${Math.abs(f.margin)}%. The growth was bought with trade spend, not earned with demand.` : f.margin >= 0 && f.sales > 0 ? `Sales up ${f.sales}% and margin up ${f.margin}%. This is the kind of growth that compounds.` : `Sales are ${f.sales < 0 ? `down ${Math.abs(f.sales)}%` : "flat"}. Look at whether price or volume is doing the damage.`, f.margin < 0 || f.sales <= 0 ? "warn" : "good");
  };
  const sliders = [
    slider({ label: "Volume", min: -10, max: 15, step: 1, value: st.volume, format: v => `${v > 0 ? "+" : ""}${v}%`, onInput: v => { st.volume = v; render(); } }),
    slider({ label: "Price", min: -5, max: 8, step: 1, value: st.price, format: v => `${v > 0 ? "+" : ""}${v}%`, onInput: v => { st.price = v; render(); } }),
    slider({ label: "Trade spend", min: -10, max: 30, step: 1, value: st.tradeSpend, format: v => `${v > 0 ? "+" : ""}${v}%`, onInput: v => { st.tradeSpend = v; render(); } }),
  ];
  render();
  return h("div", { class: "grid grid-2", style: { alignItems: "start" } }, h("div", { class: "stack", style: { "--gap": "14px" } }, ...sliders, h("p", { class: "muted", style: { fontSize: "var(--fs-micro)" } }, "Illustrative margin bridge: net price flows into margin, trade spend erodes it, volume adds a little leverage. Use it for direction, not for your P&L.")), h("div", { class: "stack" }, view, line));
}

export const widgetFor = { marginal: marginalWidget, utility: (d) => utilityWidget(d.options), voi: voiWidget, ev: evWidget, bandit: banditWidget, bayes: bayesWidget, tree: treeWidget, fingerprint: fingerprintWidget };
