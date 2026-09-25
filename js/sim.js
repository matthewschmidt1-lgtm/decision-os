// Portfolio simulation: run eight brands for four quarters with two scarce resources.
// Pure and deterministic: the whole year is replayed from the learner's plans, so there is no hidden state.
// Units: money in $K per quarter, time in selling hours per quarter.
//
// Each brand has a hidden truth (how it really responds) and a team belief (what the learner is told).
// Trade returns diminish: extra gross profit from x more = R·k·(1 − e^(−x/k)), measured before the trade cost,
// so $1 back per $1 is breakeven. Selling hours work the same way, and part of their effect lands next quarter.
// Beliefs update from what each quarter shows; brands you don't fund or look into teach you nothing.
import { brandById } from "./data.js";

export const BUDGET = { trade: 500, hours: 100 };
export const STEP = { trade: 10, hours: 2 };
export const INVESTIGATE_HOURS = 8;

export const QUARTERS = [
  { id: "Q1", theme: "Discover", months: ["Jan", "Feb", "Mar"], line: "Start of the year. You have last year's numbers and your team's hunches. Some of the hunches are wrong.", ask: "Where do your first dollars and hours go?" },
  { id: "Q2", theme: "Respond", months: ["Apr", "May", "Jun"], line: "Your first results are in. Some brands beat the forecast, some missed it.", ask: "What do you do now?" },
  { id: "Q3", theme: "Optimize", months: ["Jul", "Aug", "Sep"], line: "Your biggest bets are no longer new. Watch what the last dollar is buying, not the first.", ask: "What do you do now?" },
  { id: "Q4", theme: "Defend the year", months: ["Oct", "Nov", "Dec"], line: "One quarter left. Some investments pay back this quarter; others only pay back next year.", ask: "How do you finish the year?" },
];

// Hidden truth. R/k: trade response. hp/kh: gross profit per selling hour and how fast it fades. lag: share of the
// hours effect that lands next quarter (distribution takes time). C has a fixable break in its commercial chain.
const TRUTH = {
  A: { R: 1.10, k: 280, hp: 2.0, kh: 30, lag: 0.2 },
  B: { R: 0.62, k: 200, hp: 1.2, kh: 25, lag: 0.2 },
  C: { R: 0.50, k: 150, hp: 0.9, kh: 25, lag: 0.3, fixedR: 1.35, fixedHp: 2.4 },
  D: { R: 2.40, k: 260, hp: 3.0, kh: 30, lag: 0.6 },
  E: { R: 1.25, k: 360, hp: 1.3, kh: 25, lag: 0.1 },
  F: { R: 1.60, k: 70, hp: 1.7, kh: 20, lag: 0.3 },
  G: { R: 0.65, k: 120, hp: 0.7, kh: 25, lag: 0.2 },
  H: { R: 2.00, k: 180, hp: 2.6, kh: 25, lag: 0.6 },
};
// What the team believes at the start of the year: return on the first trade dollar, GP per selling hour, confidence.
const TEAM = {
  A: { b: 1.35, hb: 2.3, conf: "Medium", role: "Large and growing", note: "The biggest brand. The team wants to keep feeding it." },
  B: { b: 0.95, hb: 1.4, conf: "Medium", role: "Large, slow growth", note: "Big and steady, but it takes more trade every year to hold volume." },
  C: { b: 1.10, hb: 1.2, conf: "Low", role: "Declining", note: "Sales are slipping and nobody is sure why. The team thinks more promotion will turn it." },
  D: { b: 1.60, hb: 2.6, conf: "Medium", role: "Small, growing fast", note: "Your team believes D has significant upside." },
  E: { b: 1.15, hb: 1.3, conf: "High", role: "Steady cash generator", note: "Predictable. Few surprises either way." },
  F: { b: 1.40, hb: 1.6, conf: "Medium", role: "Strong return, small niche", note: "Returns well, but it's a small niche." },
  G: { b: 0.90, hb: 1.1, conf: "Medium", role: "Takes a lot of attention", note: "Soaks up a lot of the team's time. Volume is flat." },
  H: { b: 0.90, hb: 1.4, conf: "Low", role: "Tiny and unproven", note: "Too new to read. Could be nothing, could be big." },
};
const IDS = Object.keys(TRUTH);
const CONF_W = { Low: 0.6, Medium: 1.5, High: 4 };
export const confidence = (w) => (w < 1.2 ? "Low" : w < 3.5 ? "Medium" : "High");

export const simBrands = IDS.map((id) => {
  const d = brandById[id];
  return { id, name: d.name, revenue: d.revenue, growth: d.growth, gm: d.gm, tradeK: d.tradeK, ...TEAM[id], k: TRUTH[id].k, kh: TRUTH[id].kh, lag: TRUTH[id].lag };
});
const byId = Object.fromEntries(simBrands.map((b) => [b.id, b]));

const gain = (R, k, x) => (x > 0 ? R * k * (1 - Math.exp(-x / k)) : 0);
export const nextReturn = (R, k, x, step = 10) => (gain(R, k, x + step) - gain(R, k, x)) / step;

// Deterministic noise, so the same decisions always produce the same year.
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const z = (r) => (r() + r() + r() - 1.5) * 2; // roughly standard normal

// Last year's plan: trade spread by revenue, time where the team habitually spends it.
export function lastYearPlan() {
  return {
    trade: { A: 140, B: 90, C: 70, D: 50, E: 50, F: 40, G: 30, H: 30 },
    hours: { A: 24, B: 14, C: 12, D: 6, E: 8, F: 6, G: 24, H: 6 },
    investigate: [],
  };
}
export const emptyPlan = () => ({ trade: Object.fromEntries(IDS.map((i) => [i, 0])), hours: Object.fromEntries(IDS.map((i) => [i, 0])), investigate: [] });
export const clonePlan = (p) => ({ trade: { ...p.trade }, hours: { ...p.hours }, investigate: [...p.investigate] });
export const planTotals = (p) => ({ trade: IDS.reduce((a, i) => a + (p.trade[i] || 0), 0), hours: IDS.reduce((a, i) => a + (p.hours[i] || 0), 0) + p.investigate.length * INVESTIGATE_HOURS });

export function initialState() {
  return {
    beliefs: Object.fromEntries(IDS.map((i) => [i, { b: TEAM[i].b, hb: TEAM[i].hb, w: CONF_W[TEAM[i].conf], wh: 1.5 }])),
    carry: Object.fromEntries(IDS.map((i) => [i, 0])),   // lagged gross profit from last quarter's selling hours
    investigated: {},                                     // id -> quarter index
    cTrade: 0,                                            // trade put into C before its break was found (loads the distributor)
    cTrend: -3,                                           // C's underlying trend, which worsens until diagnosed
  };
}
const diagnosedBefore = (state, qi) => state.investigated.C !== undefined && state.investigated.C < qi;
const effR = (state, id, qi) => (id === "C" && diagnosedBefore(state, qi) ? TRUTH.C.fixedR : TRUTH[id].R);
const effHp = (state, id, qi) => (id === "C" && diagnosedBefore(state, qi) ? TRUTH.C.fixedHp : TRUTH[id].hp);

// The forecast uses only what the team believes.
export function forecastQuarter(state, plan) {
  const rows = IDS.map((id) => {
    const b = byId[id], bel = state.beliefs[id], x = plan.trade[id] || 0, h = plan.hours[id] || 0, gm = b.gm / 100;
    const ly = (b.revenue / 1000) / 4;
    const base = ly * (1 + b.growth / 100);
    const inc = gain(bel.b, b.k, x) + gain(bel.hb, b.kh, h) * (1 - b.lag) + state.carry[id];
    const rev = base + inc / gm;
    return { id, x, h, ly, rev, growth: (rev / ly - 1) * 100, gp: base * gm + inc - x, next: nextReturn(bel.b, b.k, x), nextHour: nextReturn(bel.hb, b.kh, h, 2) };
  });
  return { rows, rev: sum(rows, "rev"), gp: sum(rows, "gp") };
}
const sum = (rows, k) => rows.reduce((a, r) => a + r[k], 0);

export function simulateQuarter(state, plan, qi) {
  const fc = forecastQuarter(state, plan);
  const next = { beliefs: structuredClone(state.beliefs), carry: Object.fromEntries(IDS.map((i) => [i, 0])), investigated: { ...state.investigated }, cTrade: state.cTrade, cTrend: state.cTrend };
  const rows = IDS.map((id, n) => {
    const b = byId[id], t = TRUTH[id], r = rng(1009 * (qi + 1) + 97 * (n + 1)), gm = b.gm / 100;
    const x = plan.trade[id] || 0, h = plan.hours[id] || 0, f = fc.rows[n];
    const ly = (b.revenue / 1000) / 4;
    let organic = b.growth + z(r) * 1.2;
    let unwind = 0, chainBreak = false;
    if (id === "C") {
      if (diagnosedBefore(state, qi)) next.cTrend = Math.min(state.cTrend + 3, 2);
      else { next.cTrend = state.cTrend - 2; chainBreak = true; next.cTrade = state.cTrade + x; }
      organic = next.cTrend + z(r) * 0.8;
      // Curveball: the distributor stops ordering to work down the inventory that promotions built.
      if (qi === 2 && !diagnosedBefore(state, qi)) unwind = ly * (0.06 + 0.0006 * state.cTrade);
    }
    const base = ly * (1 + organic / 100);
    const R = effR(state, id, qi), hp = effHp(state, id, qi);
    const incTrade = gain(R, t.k, x) * (1 + 0.12 * z(r));
    const hoursAll = gain(hp, t.kh, h) * (1 + 0.1 * z(r));
    const hoursNow = hoursAll * (1 - t.lag);
    next.carry[id] = hoursAll * t.lag;
    const inc = incTrade + hoursNow + state.carry[id];
    const rev = base + inc / gm - unwind;
    const gp = base * gm + inc - x - unwind * gm;
    const sell = (rev / ly - 1) * 100;
    const dist = Math.round((h * 0.12 + x * 0.004) * 10) / 10;
    const chain = chainBreak
      ? { kind: "break", shipments: 4 + x * 0.08, inventory: 6 + x * 0.1 + (qi > 0 ? 4 : 0), depletion: organic + 1, sellThrough: sell, gp: incTrade - x }
      : { kind: "flow", distribution: dist, depletion: sell + 0.6, sellThrough: sell, gp: incTrade + hoursNow - x };

    // Learn from what happened. Money and time spent are evidence; nothing spent, nothing learned.
    const bel = next.beliefs[id];
    const before = { b: bel.b, w: bel.w, hb: bel.hb };
    if (x >= 10) { const obs = incTrade / (t.k * (1 - Math.exp(-x / t.k))), wo = Math.min(2.5, x / 60); bel.b = (bel.b * bel.w + obs * wo) / (bel.w + wo); bel.w += wo; }
    if (h >= 2) { const obs = hoursAll / (t.kh * (1 - Math.exp(-h / t.kh))), wo = Math.min(2, h / 10); bel.hb = (bel.hb * bel.wh + obs * wo) / (bel.wh + wo); bel.wh += wo; }
    let finding = null;
    if (plan.investigate.includes(id) && next.investigated[id] === undefined) {
      next.investigated[id] = qi;
      const fixed = id === "C";
      bel.b = fixed ? TRUTH.C.fixedR : t.R; bel.hb = fixed ? TRUTH.C.fixedHp : t.hp; bel.w += 6; bel.wh += 4;
      finding = FINDINGS[id];
    }
    return {
      id, x, h, ly, revF: f.rev, rev, growthF: f.growth, growth: sell, gpF: f.gp, gp, incTrade, hoursAll, unwind,
      perDollar: x ? incTrade / x : null, lastTen: x >= 10 ? (gain(R, t.k, x) - gain(R, t.k, x - 10)) / 10 : null,
      chain, before, after: { b: bel.b, w: bel.w, hb: bel.hb }, finding,
    };
  });
  const out = { qi, rows, rev: sum(rows, "rev"), revF: fc.rev, gp: sum(rows, "gp"), gpF: fc.gp, trade: planTotals(plan).trade, hours: planTotals(plan).hours, nextState: next };
  out.events = quarterEvents(out, plan, state, qi);
  out.insight = quarterInsight(out, state, qi);
  return out;
}

const FINDINGS = {
  A: "A's promotions mostly move volume that would have sold anyway. The last dollars return less than a dollar.",
  B: "B's trade is buying the same shoppers every event. Little of it is incremental.",
  C: "Found it: C isn't a demand problem. Promotions have been loading the distributor while depletions fall. Fixing orders and shelf gaps makes C respond again.",
  D: "D is real, but it's a small brand: returns fall off quickly once it gets more than about $200K a quarter.",
  E: "E is what it looks like: modest, reliable returns.",
  F: "F returns well on the first $30–40K. Beyond that, the niche runs out.",
  G: "G's volume is flat whatever you do. The hours spent there mostly keep things as they are.",
  H: "H is stronger than anyone thought: early accounts are reordering fast.",
};

function quarterEvents(out, plan, state, qi) {
  const r = Object.fromEntries(out.rows.map((x) => [x.id, x]));
  const ev = [];
  const best = [...out.rows].filter((x) => x.x + x.h > 0).sort((a, c) => (c.growth - c.growthF) - (a.growth - a.growthF))[0];
  if (best && best.growth - best.growthF > 1.5) ev.push({ week: 4, text: `Brand ${best.id} gains distribution in ${best.h >= 8 ? "three" : "two"} new accounts.` });
  if (plan.trade.B >= 60) ev.push({ week: 6, text: "Brand B needs extra trade just to hold volume." });
  if (!diagnosedBefore(state, qi)) {
    if (qi === 1) ev.push({ week: 6, text: "Cascade Beverage is carrying 14 weeks of Brand C." });
    else if (qi === 2) ev.push({ week: 5, text: "Cascade cuts Brand C orders to work down its inventory." });
    else ev.push({ week: 9, text: "Brand C shipments are up, but depletions keep falling." });
  } else if (r.C.x + r.C.h > 0) ev.push({ week: 8, text: "Brand C's reset stores are selling through again." });
  if (r.H.x >= 30 || r.H.h >= 6) ev.push({ week: 10, text: "Brand H reorders come in faster than planned." });
  if (plan.hours.G >= 16) ev.push({ week: 8, text: `${plan.hours.G} hours on Brand G. Volume holds, but doesn't move.` });
  if (plan.investigate.length) ev.push({ week: 11, text: `Findings back on Brand ${plan.investigate.join(" and ")}.` });
  ev.push({ week: 13, text: "Quarter closes." });
  return ev.sort((a, c) => a.week - c.week);
}

function quarterInsight(out, state, qi) {
  const rows = [...out.rows].sort((a, c) => Math.abs(c.growth - c.growthF) - Math.abs(a.growth - a.growthF));
  const top = rows[0];
  const c = out.rows.find((x) => x.id === "C");
  if (qi === 2 && c.unwind > 0) return "The distributor stopped ordering Brand C to work down inventory the promotions had built. The trade on C was funding the symptom.";
  const dir = top.growth > top.growthF ? "better" : "worse";
  const why = top.growth > top.growthF
    ? (top.x + top.h > 0 ? "It responded to your support more than the team expected." : "It grew without any extra support.")
    : top.id === "C" ? "More support didn't help, which suggests the problem is somewhere else in the chain." : "Your support bought less than the team expected.";
  return `Brand ${top.id} did ${dir} than forecast (${fmtPts(top.growthF)} expected, ${fmtPts(top.growth)} actual). ${why}`;
}
const fmtPts = (v) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(0)}%`;

// Replay the year from the plans made so far.
export function replay(plans) {
  let state = initialState();
  const quarters = [];
  plans.forEach((p, qi) => { const q = simulateQuarter(state, p, qi); quarters.push({ ...q, plan: p, stateBefore: state }); state = q.nextState; });
  return { quarters, state };
}

// Two reference strategies, run through the same simulation with the same luck.
export const habitPlans = () => [0, 1, 2, 3].map(() => lastYearPlan());
export function evidencePlans() {
  // Reassess every quarter: fund the best expected next dollar until it returns less than $1, put hours where the
  // next hour returns most, and look into the two uncertain brands early.
  const plans = []; let state = initialState();
  for (let qi = 0; qi < 4; qi++) {
    const p = emptyPlan();
    if (qi === 0) p.investigate = ["C", "H"];
    greedyFill(p.trade, BUDGET.trade, STEP.trade, (id, x) => nextReturn(state.beliefs[id].b, byId[id].k, x), 1);
    const hoursLeft = BUDGET.hours - p.investigate.length * INVESTIGATE_HOURS;
    greedyFill(p.hours, hoursLeft, STEP.hours, (id, h) => nextReturn(state.beliefs[id].hb, byId[id].kh, h, 2) * (qi === 3 ? 1 - byId[id].lag : 1), 0);
    plans.push(p);
    state = simulateQuarter(state, p, qi).nextState;
  }
  return plans;
}
function greedyFill(alloc, budget, step, marginal, floor) {
  let left = budget;
  while (left >= step) {
    let best = null, bestM = floor;
    for (const id of IDS) { const m = marginal(id, alloc[id]); if (m > bestM) { bestM = m; best = id; } }
    if (!best) break;
    alloc[best] += step; left -= step;
  }
}

const yearTotals = (quarters, state) => ({
  rev: sum(quarters, "rev"), gp: sum(quarters, "gp"), trade: sum(quarters, "trade"), hours: sum(quarters, "hours"),
  carry: IDS.reduce((a, i) => a + state.carry[i], 0),
});

// Year-end: what happened, how it compares, and how the learner tends to decide.
export function review(plans) {
  const you = replay(plans), habit = replay(habitPlans()), best = replay(evidencePlans());
  const Y = yearTotals(you.quarters, you.state), Hb = yearTotals(habit.quarters, habit.state), Bs = yearTotals(best.quarters, best.state);
  const qs = you.quarters;
  const tradeYear = qs.reduce((a, q) => a + q.trade, 0) || 1;

  const scale = qs.reduce((a, q) => a + q.plan.trade.A + q.plan.trade.B, 0) / tradeYear;
  const lowShare = (q) => (q.plan.trade.B + q.plan.trade.G + (diagnosedBefore(q.stateBefore, q.qi) ? 0 : q.plan.trade.C)) / (q.trade || 1);
  const lowQ1 = lowShare(qs[0]), lowQ4 = lowShare(qs[3]);

  // Responding: did the first quarter's biggest positive surprise get more support in Q2?
  const q1 = qs[0];
  const surprise = [...q1.rows].sort((a, c) => (c.growth - c.growthF) - (a.growth - a.growthF))[0];
  const moveAt = [1, 2, 3].find((i) => qs[i].plan.trade[surprise.id] - q1.plan.trade[surprise.id] >= 20 || qs[i].plan.hours[surprise.id] - q1.plan.hours[surprise.id] >= 4);
  const react = moveAt === 1 ? "fast" : moveAt ? "slow" : "none";

  // Exploring: time spent looking into brands, or on brands the team knew little about.
  const hoursYear = qs.reduce((a, q) => a + q.hours, 0) || 1;
  const exploreHours = qs.reduce((a, q) => a + q.plan.investigate.length * INVESTIGATE_HOURS + IDS.filter((i) => confidence(q.stateBefore.beliefs[i].w) === "Low").reduce((s, i) => s + q.plan.hours[i], 0), 0);
  const explore = exploreHours / hoursYear;
  const hAt = [you.state.investigated.H, [0, 1, 2, 3].find((i) => qs[i].plan.trade.H >= 40 || qs[i].plan.hours.H >= 10)].filter((v) => v !== undefined).sort()[0];
  const probed = Object.keys(you.state.investigated).length;

  // Diagnosing: when was C's break found, and what went into C before then?
  const cAt = you.state.investigated.C;
  const cSpentBlind = qs.filter((q) => !diagnosedBefore(q.stateBefore, q.qi)).reduce((a, q) => a + q.plan.trade.C, 0);

  // Diminishing returns: money left on a brand whose last $10K returned little while another brand still had room.
  const flags = [];
  qs.forEach((q) => {
    const m = Object.fromEntries(IDS.map((i) => [i, nextReturn(effR(q.stateBefore, i, q.qi), TRUTH[i].k, Math.max(0, q.plan.trade[i] - 10))]));
    const bestOther = (i) => IDS.filter((j) => j !== i).sort((a, c) => m[c] - m[a])[0];
    IDS.forEach((i) => { const o = bestOther(i); if (q.plan.trade[i] >= 40 && m[i] < 0.9 && m[o] >= 1.3) flags.push({ q: q.qi, id: i, spent: q.plan.trade[i], last: m[i], other: o, otherNext: m[o] }); });
  });
  const worst = flags.sort((a, c) => (c.otherNext - c.last) * c.spent - (a.otherNext - a.last) * a.spent)[0];
  const winnerOver = flags.find((f) => f.id === "D" || f.id === "H");

  // Updating: when a brand's expected return moved, did the next plan move the same way?
  let moves = 0, aligned = 0;
  for (let i = 1; i < qs.length; i++) IDS.forEach((id) => {
    const d = qs[i - 1].rows.find((r) => r.id === id); const db = d.after.b - d.before.b;
    if (Math.abs(db) < 0.15) return; moves++;
    const dt = qs[i].plan.trade[id] - qs[i - 1].plan.trade[id];
    if (Math.sign(dt) === Math.sign(db)) aligned++;
  });
  const updating = moves ? aligned / moves : null;

  const room = Bs.gp - Hb.gp;
  const captured = room > 0 ? (Y.gp - Hb.gp) / room : 1;

  const mark = (ok, partly) => (ok ? "yes" : partly ? "partly" : "no");
  const algorithms = [
    { idea: "Marginal allocation", means: "Put the next dollar where it creates the most value.", slug: "optimization", status: mark(captured >= 0.7, captured >= 0.35),
      why: captured >= 0.7 ? "You kept moving money toward the brands that returned the most." : captured >= 0.35 ? "You moved some money toward the best returns, but less than the evidence supported." : "Most of your money stayed where last year's plan put it." },
    { idea: "Diminishing returns", means: "More investment eventually buys less.", slug: "optimization", status: mark(!flags.length, flags.length <= 2),
      why: !worst ? "You never kept feeding a brand after its returns had flattened." : `In ${QUARTERS[worst.q].id}, Brand ${worst.id}'s last $10K returned about $${worst.last.toFixed(2)} while Brand ${worst.other}'s next $10K would have returned about $${worst.otherNext.toFixed(2)}.` },
    { idea: "Opportunity cost", means: "Every dollar you place is a dollar you can't place elsewhere.", slug: "optimization", status: mark(lowQ4 <= lowQ1 * 0.5, lowQ4 < lowQ1),
      why: `Brands returning less than $1 took ${pct(lowQ1)} of your trade in Q1 and ${pct(lowQ4)} in Q4.` },
    { idea: "Exploration", means: "Spend a little to learn what you don't know.", slug: "exploration-vs-exploitation", status: mark(hAt !== undefined && hAt <= 1, hAt !== undefined || probed > 0),
      why: hAt === undefined ? `You never tested Brand H, the brand nobody could read. ${probed ? `You looked into ${probed} brand${probed > 1 ? "s" : ""} in total.` : "You never looked into any brand."}` : `You tested Brand H in ${QUARTERS[hAt].id} and found out what it could do.` },
    { idea: "Root-cause diagnosis", means: "Find where the commercial chain breaks before you fund it.", slug: "value-of-information", status: mark(cAt !== undefined && cAt <= 1, cAt !== undefined),
      why: cAt === undefined ? `You never looked into Brand C, and put $${Math.round(cSpentBlind)}K of trade into the symptom.` : `You found C's break in ${QUARTERS[cAt].id}${cSpentBlind ? `, after $${Math.round(cSpentBlind)}K of trade had gone into it` : ""}.` },
    { idea: "Forecast updating", means: "Change your expectations when the evidence changes.", slug: "bayesian-updating", status: updating === null ? "partly" : mark(updating >= 0.65, updating >= 0.4),
      why: updating === null ? "Your beliefs barely moved, because little of your plan tested them." : `When a brand's expected return moved, your next plan followed it ${Math.round(updating * 100)}% of the time.` },
    { idea: "Portfolio optimization", means: "Balance every brand and both budgets at once.", slug: "multi-armed-bandits", status: mark(captured >= 0.8, captured >= 0.45),
      why: `You captured ${pct(Math.max(0, Math.min(1.2, captured)))} of the improvement a reassess-every-quarter strategy found over last year's plan.` },
  ];

  const tendencies = [
    scale >= 0.35 ? { label: "Favor scale", text: `You put ${pct(scale)} of your trade into the two largest brands. Last year's plan put 46% there.` }
      : { label: "Follow return, not size", text: `Only ${pct(scale)} of your trade went to the two largest brands, against 46% in last year's plan.` },
    react === "fast" ? { label: "React quickly", text: `Brand ${surprise.id} beat its Q1 forecast, and you backed it in Q2.` }
      : react === "slow" ? { label: "React slowly", text: `Brand ${surprise.id} beat its Q1 forecast, but you waited until ${QUARTERS[moveAt].id} to back it.` }
      : { label: "Hold course", text: `Brand ${surprise.id} beat its Q1 forecast, and you never moved more behind it.` },
    hAt !== undefined && hAt <= 1 ? { label: "Explore early", text: `You tested the brand nobody could read (H) in ${QUARTERS[hAt].id}. ${pct(explore)} of your selling time went to learning about uncertain brands.` }
      : { label: "Under-explore", text: `${hAt === undefined ? "You never tested Brand H, the brand nobody could read." : `You didn't test Brand H until ${QUARTERS[hAt].id}.`} ${pct(explore)} of your selling time went to learning about uncertain brands.` },
    cAt !== undefined && cAt <= 1 ? { label: "Diagnose well", text: `You found the break in Brand C's chain in ${QUARTERS[cAt].id}, before the distributor cut orders.` }
      : cAt !== undefined ? { label: "Diagnose late", text: `You found Brand C's break in ${QUARTERS[cAt].id}, after the distributor had already cut orders.` }
      : { label: "Fund the symptom", text: `You kept funding Brand C ($${Math.round(cSpentBlind)}K of trade) without finding why it was declining.` },
  ];
  if (winnerOver) tendencies.push({ label: "Overfeed winners", text: `You kept adding to Brand ${winnerOver.id} in ${QUARTERS[winnerOver.q].id} after its returns had started to flatten.` });

  return { you: Y, habit: Hb, best: Bs, gap: Bs.gp - Y.gp, captured, quarters: qs, algorithms, tendencies, plans };
}
const pct = (v) => `${Math.round(v * 100)}%`;
