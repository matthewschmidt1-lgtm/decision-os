// Portfolio simulation: run eight brands for four quarters, on-premise and off-premise.
// Pure and deterministic: the whole year is replayed from the learner's plans, so there is no hidden state.
// Units: money in $K per quarter, time in field days per quarter.
//
// Each brand has a hidden truth (how it really responds in each channel) and a team belief (what the learner is told).
// Trade returns diminish: extra gross profit from x = R·k·(1 − e^(−x/k)), measured before the trade cost, so $1 back per
// $1 is breakeven. Off-premise, the first dollars defend shelf space ("floor"); cut below it and base volume goes.
// On-premise trade and field days build menus and placements, so part of their effect lands next quarter.
// Everything is measured against last year's plan: run that plan and each brand grows at its stated rate.
import { brandById } from "./data.js";

export const BUDGET = { trade: 500, days: 40 };
export const STEP = { trade: 10, days: 1 };
export const SCOUTS = 2;
export const FOCUS = { off: "Off-premise", both: "Both", on: "On-premise" };
const ON_LAG = 0.4; // share of on-premise trade effect that lands next quarter

export const QUARTERS = [
  { id: "Q1", theme: "Discover", months: ["Jan", "Feb", "Mar"], unlock: null, line: "Last year's plan is loaded and every dollar is spent. Some of your team's hunches are wrong." },
  { id: "Q2", theme: "Respond", months: ["Apr", "May", "Jun"], unlock: "focus", line: "Your first results are in. New this quarter: choose where each brand's support goes, on-premise, off-premise, or both." },
  { id: "Q3", theme: "Optimize", months: ["Jul", "Aug", "Sep"], unlock: "days", line: "Your biggest bets are no longer new. New this quarter: your team's field days are yours to place." },
  { id: "Q4", theme: "Defend the year", months: ["Oct", "Nov", "Dec"], unlock: null, line: "One quarter left. On-premise work pays back next year; some offers pay this year and cost you next." },
];

// ---------- The world ----------
// share: on-premise share of revenue. off/on: trade response per channel (R first-dollar return above the floor, k how fast
// it fades). floor/def: off-premise dollars that defend shelf space and what each returns. dp/kd/lag: field days.
const BASE = {
  A: { share: 0.30, off: { R: 0.85, k: 200, floor: 40, def: 1.5 }, on: { R: 1.20, k: 90 }, dp: 5, kd: 6, lag: 0.2 },
  B: { share: 0.25, off: { R: 0.55, k: 150, floor: 40, def: 1.4 }, on: { R: 0.80, k: 60 }, dp: 3, kd: 6, lag: 0.2 },
  C: { share: 0.25, off: { R: 0.45, k: 120, floor: 20, def: 1.3 }, on: { R: 1.10, k: 60 }, dp: 2.5, kd: 6, lag: 0.3 },
  D: { share: 0.45, off: { R: 1.40, k: 120, floor: 0, def: 0 }, on: { R: 2.60, k: 150 }, dp: 7, kd: 6, lag: 0.6 },
  E: { share: 0.20, off: { R: 1.30, k: 250, floor: 20, def: 1.4 }, on: { R: 0.80, k: 40 }, dp: 3, kd: 6, lag: 0.1 },
  F: { share: 0.55, off: { R: 1.10, k: 40, floor: 0, def: 0 }, on: { R: 1.70, k: 60 }, dp: 4, kd: 6, lag: 0.3 },
  G: { share: 0.30, off: { R: 0.70, k: 80, floor: 10, def: 1.2 }, on: { R: 0.60, k: 40 }, dp: 2, kd: 6, lag: 0.2 },
  H: { share: 0.60, off: { R: 1.00, k: 50, floor: 0, def: 0 }, on: { R: 2.40, k: 120 }, dp: 6, kd: 6, lag: 0.6 },
};
const TEAM = {
  A: { b: 1.35, db: 5.5, conf: "Medium", role: "Large and growing", note: "The biggest brand. The team wants to keep feeding it." },
  B: { b: 0.95, db: 3.5, conf: "Medium", role: "Large, slow growth", note: "Big and steady, but it takes more trade every year to hold volume." },
  C: { b: 1.10, db: 3.0, conf: "Low", role: "Declining", note: "Sales are slipping. The team thinks more promotion will turn it." },
  D: { b: 1.60, db: 6.0, conf: "Medium", role: "Small, growing fast", note: "Your team believes D has significant upside." },
  E: { b: 1.15, db: 3.0, conf: "High", role: "Steady cash generator", note: "Predictable. Few surprises either way." },
  F: { b: 1.40, db: 4.0, conf: "Medium", role: "Strong return, small niche", note: "Returns well, but it's a small niche." },
  G: { b: 0.90, db: 2.5, conf: "Medium", role: "Takes a lot of attention", note: "Soaks up a lot of the team's time. Volume is flat." },
  H: { b: 0.90, db: 4.0, conf: "Low", role: "Small and unproven", note: "Too new to read. Could be nothing, could be big." },
};
// Two years with different answers, so a second play isn't a memory test. In each: one brand's chain is broken
// (promotions load the distributor), one brand is a sleeper on-premise, and the team is unsure about exactly those two.
export const VARIANTS = [
  { id: 0, name: "Year one", broken: "C", sleeper: "H", edits: {} },
  { id: 1, name: "Year two", broken: "G", sleeper: "F", edits: {
    C: { off: { R: 0.60, k: 120, floor: 20, def: 1.3 }, on: { R: 0.70, k: 50 }, team: { conf: "Medium", note: "Sales are slipping. The team thinks more promotion will turn it." } },
    G: { off: { R: 0.45, k: 100, floor: 10, def: 1.2 }, team: { conf: "Low", note: "Soaks up a lot of the team's time. Shipments look fine, but nobody can say why volume is flat." } },
    F: { on: { R: 2.60, k: 110 }, team: { b: 1.00, conf: "Low", note: "A small niche brand. Nobody has tested how far it can go." } },
    H: { off: { R: 0.70, k: 50, floor: 0, def: 0 }, on: { R: 0.90, k: 60 }, dp: 2.5, team: { b: 1.40, conf: "Medium", note: "Too new to read. The team is excited about it." } },
  } },
];
const FIXED = { off: { R: 1.30 }, dp: 5 }; // what a broken brand's response becomes once its chain is fixed

function world(vi = 0) {
  const v = VARIANTS[vi] || VARIANTS[0];
  const truth = {}, team = {};
  for (const id of Object.keys(BASE)) {
    const e = v.edits[id] || {};
    truth[id] = { ...BASE[id], off: { ...BASE[id].off, ...(e.off || {}) }, on: { ...BASE[id].on, ...(e.on || {}) }, dp: e.dp ?? BASE[id].dp };
    team[id] = { ...TEAM[id], ...(e.team || {}) };
  }
  return { v, truth, team };
}
const IDS = Object.keys(BASE);
export const brandIds = IDS;
const CONF_W = { Low: 0.6, Medium: 1.5, High: 4 };
export const confidence = (w) => (w < 1.2 ? "Low" : w < 3.5 ? "Medium" : "High");
const SPREAD = { Low: 0.6, Medium: 0.3, High: 0.1 };

export function simBrands(vi = 0) {
  const { truth, team } = world(vi);
  return IDS.map((id) => { const d = brandById[id]; return { id, name: d.name, revenue: d.revenue, growth: d.growth, gm: d.gm, share: truth[id].share, floor: truth[id].off.floor, ...team[id] }; });
}

// ---------- Response curves ----------
const curve = (R, k, x) => (x > 0 ? R * k * (1 - Math.exp(-x / k)) : 0);
const offGain = (c, R, x) => c.def * Math.min(x, c.floor) + curve(R, c.k, Math.max(0, x - c.floor));
const onFrac = (focus, share) => (focus === "off" ? 0 : focus === "on" ? 1 : share);
export const split = (plan, id, share) => { const x = plan.trade[id] || 0, f = onFrac(plan.focus[id] || "both", share); return { on: x * f, off: x * (1 - f) }; };

// Last year's plan: trade spread by revenue, both channels in their usual mix, field time where the team habitually spends it.
export function lastYearPlan() {
  return {
    trade: { A: 140, B: 90, C: 70, D: 50, E: 50, F: 40, G: 30, H: 30 },
    focus: Object.fromEntries(IDS.map((i) => [i, "both"])),
    days: { A: 9, B: 6, C: 5, D: 3, E: 3, F: 3, G: 9, H: 2 },
    scout: [], answer: null,
  };
}
export const clonePlan = (p) => ({ trade: { ...p.trade }, focus: { ...p.focus }, days: { ...p.days }, scout: [...(p.scout || [])], answer: p.answer ?? null });
export function planTotals(p, qi = 0, vi = 0) {
  const d = dilemma(qi, vi), opt = d?.options.find((o) => o.id === p.answer);
  return { trade: IDS.reduce((a, i) => a + (p.trade[i] || 0), 0) + (opt?.cost || 0), days: IDS.reduce((a, i) => a + (p.days[i] || 0), 0) };
}

// ---------- Requests: one real-life dilemma a quarter ----------
export function dilemma(qi, vi = 0) {
  const { v } = world(vi), br = v.broken, sl = v.sleeper;
  return [
    { id: "endcap", who: "Kroger's category buyer", ask: "\"I can give Brand A an end-cap for the spring event. It's $40K from your budget.\"",
      options: [{ id: "take", label: "Take it ($40K on A, off-premise)", cost: 40, extra: { id: "A", ch: "off", x: 40 } }, { id: "pass", label: "Pass, and keep the $40K" }] },
    { id: "allowance", who: "Cascade Beverage, your distributor", ask: `"We're carrying a lot of Brand ${br}. Fund a $20K allowance and we'll keep ordering it."`,
      options: [{ id: "pay", label: "Pay the $20K allowance", cost: 20, extra: { id: br, ch: "off", x: 20 } }, { id: "scout", label: `Send a rep to find out why (uses a scout)`, scout: br }, { id: "pass", label: "Say no" }] },
    { id: "menu", who: "A 40-location restaurant chain", ask: "\"We have one spot on the new cocktail menu for a supplier brand. Which one do you want there?\"",
      options: ["A", "D", sl === "H" ? "H" : "F", sl === "H" ? "F" : "H"].map((id) => ({ id: `menu-${id}`, label: `Brand ${id}`, menu: id })) },
    { id: "loadin", who: "Cascade Beverage, your distributor", ask: "\"Fund $30K and we'll take an extra $300K of product before year-end. Your Q4 will look great.\"",
      options: [{ id: "take", label: "Take the load-in", cost: 30, load: 300 }, { id: "pass", label: "Pass. Ship to demand." }] },
  ][qi] || null;
}

// ---------- State and forecasting ----------
export function initialState(vi = 0) {
  const { team } = world(vi);
  return {
    vi,
    beliefs: Object.fromEntries(IDS.map((i) => [i, { on: { b: team[i].b, w: CONF_W[team[i].conf] }, off: { b: team[i].b, w: CONF_W[team[i].conf] }, d: { b: team[i].db, w: 1.5 } }])),
    carry: Object.fromEntries(IDS.map((i) => [i, 0])),  // gross profit landing this quarter from last quarter's on-premise work
    scouted: {},                                         // id -> quarter index
    scoutsLeft: SCOUTS,
    load: 0,                                             // product the broken brand's promotions have pushed into the distributor
    trend: -3,                                           // the broken brand's underlying trend, worse until fixed
    borrowed: 0,                                         // next year's gross profit already pulled into this year
  };
}
const fixedBefore = (state, qi, id) => id === world(state.vi).v.broken && state.scouted[id] !== undefined && state.scouted[id] < qi;
const trueOff = (state, qi, id) => { const t = world(state.vi).truth[id]; return fixedBefore(state, qi, id) ? { ...t.off, R: FIXED.off.R } : t.off; };
const trueDp = (state, qi, id) => (fixedBefore(state, qi, id) ? FIXED.dp : world(state.vi).truth[id].dp);

// What the team expects, from its beliefs. Revenue and profit are measured against last year's plan.
export function forecastQuarter(state, plan, qi) {
  const { truth } = world(state.vi), ly = lastYearPlan(), d = dilemma(qi, state.vi), opt = d?.options.find((o) => o.id === plan.answer);
  const rows = IDS.map((id) => {
    const b = brandById[id], t = truth[id], bel = state.beliefs[id], gm = b.gm / 100, q = (b.revenue / 1000) / 4;
    const s = split(plan, id, t.share), s0 = split(ly, id, t.share);
    const extra = opt?.extra?.id === id ? opt.extra : null;
    const xOff = s.off + (extra?.ch === "off" ? extra.x : 0), xOn = s.on + (extra?.ch === "on" ? extra.x : 0);
    const gOff = offGain(t.off, bel.off.b, xOff) - offGain(t.off, bel.off.b, s0.off);
    const gOn = (curve(bel.on.b, t.on.k, xOn) - curve(bel.on.b, t.on.k, s0.on)) * (1 - ON_LAG);
    const gD = (curve(bel.d.b, t.kd, plan.days[id] || 0) - curve(bel.d.b, t.kd, ly.days[id])) * (1 - t.lag);
    const inc = gOff + gOn + gD + state.carry[id];
    const base = q * (1 + b.growth / 100);
    const rev = base + inc / gm, spent = xOff + xOn;
    const gp = base * gm + inc - spent;
    const mOff = marginal((x) => offGain(t.off, bel.off.b, x), xOff), mOn = marginal((x) => curve(bel.on.b, t.on.k, x), xOn);
    const f = onFrac(plan.focus[id] || "both", t.share);
    const next = mOn * f + mOff * (1 - f);
    const w = f * bel.on.w + (1 - f) * bel.off.w, conf = confidence(w);
    return { id, x: spent, xOn, xOff, rev, gp, growth: (rev / q - 1) * 100, next, nextLo: Math.max(0, next * (1 - SPREAD[conf])), nextHi: next * (1 + SPREAD[conf]), conf,
      nextDay: marginal((x) => curve(bel.d.b, t.kd, x), plan.days[id] || 0, 1), revOn: base * t.share + (gOn + t.share * (gD + state.carry[id])) / gm, revOff: 0 };
  });
  rows.forEach((r) => { r.revOff = r.rev - r.revOn; });
  const load = opt?.load || 0, fee = opt && !opt.extra ? opt.cost || 0 : 0;
  return { rows, rev: sum(rows, "rev") + load, gp: sum(rows, "gp") + load * 0.4 - fee, revOn: sum(rows, "revOn"), revOff: sum(rows, "revOff") + load };
}
const marginal = (f, x, step = 10) => (f(x + step) - f(x)) / step;
const sum = (rows, k) => rows.reduce((a, r) => a + r[k], 0);

// ---------- Deterministic noise ----------
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const z = (r) => (r() + r() + r() - 1.5) * 2;

// ---------- One quarter ----------
export function simulateQuarter(state, plan, qi) {
  const { v, truth } = world(state.vi), ly = lastYearPlan(), fc = forecastQuarter(state, plan, qi);
  const d = dilemma(qi, state.vi), opt = d?.options.find((o) => o.id === plan.answer);
  const next = { ...state, beliefs: structuredClone(state.beliefs), carry: Object.fromEntries(IDS.map((i) => [i, 0])), scouted: { ...state.scouted } };
  const scouts = [...new Set([...(plan.scout || []), ...(opt?.scout ? [opt.scout] : [])])].filter((id) => state.scouted[id] === undefined).slice(0, state.scoutsLeft);
  next.scoutsLeft = state.scoutsLeft - scouts.length;

  const rows = IDS.map((id, n) => {
    const b = brandById[id], t = truth[id], r = rng(7919 * (state.vi + 1) + 1009 * (qi + 1) + 97 * (n + 1)), gm = b.gm / 100, q = (b.revenue / 1000) / 4;
    const s = split(plan, id, t.share), s0 = split(ly, id, t.share);
    const extra = opt?.extra?.id === id ? opt.extra : null;
    const xOff = s.off + (extra?.ch === "off" ? extra.x : 0), xOn = s.on + (extra?.ch === "on" ? extra.x : 0);
    const broken = id === v.broken, fixed = fixedBefore(state, qi, id);
    let growth = b.growth + z(r) * 1.2, loadRev = 0, unwind = 0;
    if (broken) {
      next.trend = fixed ? Math.min(state.trend + 3, 3) : state.trend - 2;
      growth = next.trend + z(r) * 0.8;
      if (!fixed) { loadRev = xOff * 1.6; next.load = state.load + loadRev; }           // promotions push product into the distributor
      if (qi === 2 && !fixed) { unwind = state.load + 120; next.load = 0; }             // curveball: the distributor stops ordering
      if (fixed && qi > 0 && state.load > 0 && state.scouted[id] === qi - 1) next.load = 0;
    }
    const off = trueOff(state, qi, id);
    const nz = 1 + 0.12 * z(r);
    const gOff = (offGain(off, off.R, xOff) - offGain(t.off, t.off.R, s0.off)) * nz;
    const gOnAll = (curve(t.on.R, t.on.k, xOn) - curve(t.on.R, t.on.k, s0.on)) * nz;
    const menuBonus = opt?.menu === id ? t.on.R * 30 : 0;
    const onNow = (gOnAll + menuBonus) * (1 - ON_LAG);
    const dAll = (curve(trueDp(state, qi, id), t.kd, plan.days[id] || 0) - curve(t.dp, t.kd, ly.days[id])) * (1 + 0.1 * z(r));
    const dNow = dAll * (1 - t.lag);
    next.carry[id] = (gOnAll + menuBonus) * ON_LAG + dAll * t.lag;
    const inc = gOff + onNow + dNow + state.carry[id];
    const base = q * (1 + growth / 100);
    const rev = base + inc / gm + loadRev - unwind;
    const spent = xOff + xOn;
    const gp = base * gm + inc - spent + (loadRev - unwind) * gm;
    const revOn = base * t.share + (onNow + t.share * (dNow + state.carry[id])) / gm;
    const revOff = rev - revOn;
    const absOff = offGain(off, off.R, xOff) * nz, absOn = curve(t.on.R, t.on.k, xOn) * nz;
    const sell = (base / q - 1) * 100 + (inc / gm) / q * 100;          // what consumers bought, before any loading
    const chainOn = { placements: Math.round((xOn / 10 + (plan.days[id] || 0) * 0.8 + (opt?.menu === id ? 40 : 0))), pours: sell + (xOn > s0.on ? 2 : 0), reorder: Math.round(Math.min(95, 45 + t.on.R * 12 + z(r) * 4)) };
    const chainOff = broken && !fixed
      ? { kind: "break", shipments: (loadRev / (q * (1 - t.share))) * 100 + 2, inventory: 6 + next.load / 12, depletion: growth + 1, sellThrough: growth }
      : { kind: "flow", acv: Math.round(((xOff - s0.off) / 20 + (xOff < off.floor ? -3 : 0) + ((plan.days[id] || 0) - ly.days[id]) * 0.3) * 10) / 10, velocity: sell - 0.5, promoReturn: xOff ? absOff / xOff : null };

    // Learning: money and time spent are evidence. Nothing spent, nothing learned.
    const bel = next.beliefs[id], before = structuredClone(bel);
    // A quarter's spend reveals the true response, blurred by noise; more spend, clearer read.
    const learn = (key, R, x) => { if (x < 10) return; const obs = R * (1 + 0.15 * z(r)), wo = Math.min(2.5, x / 60); bel[key].b = (bel[key].b * bel[key].w + obs * wo) / (bel[key].w + wo); bel[key].w += wo; };
    learn("off", off.R, Math.max(0, xOff - off.floor));
    learn("on", t.on.R, xOn);
    if ((plan.days[id] || 0) >= 2) { const obs = trueDp(state, qi, id) * (1 + 0.08 * z(r)), wo = Math.min(2, (plan.days[id] || 0) / 4); bel.d.b = (bel.d.b * bel.d.w + obs * wo) / (bel.d.w + wo); bel.d.w += wo; }
    let finding = null;
    if (scouts.includes(id)) {
      next.scouted[id] = qi;
      const fx = broken ? { ...t.off, R: FIXED.off.R } : t.off;
      bel.off = { b: fx.R, w: bel.off.w + 6 }; bel.on = { b: t.on.R, w: bel.on.w + 6 }; bel.d = { b: broken ? FIXED.dp : t.dp, w: bel.d.w + 4 };
      finding = findingFor(id, v, t);
    }
    return { id, x: spent, xOn, xOff, days: plan.days[id] || 0, focus: plan.focus[id] || "both", q, revF: fc.rows[n].rev, rev, growthF: fc.rows[n].growth, growth: (rev / q - 1) * 100,
      gpF: fc.rows[n].gp, gp, revOn, revOff, revOnF: fc.rows[n].revOn, revOffF: fc.rows[n].revOff, gOff, gOn: onNow, loadRev, unwind, sell,
      perDollar: spent ? (absOff + absOn) / spent : null, onReturn: xOn ? absOn / xOn : null, offReturn: xOff ? absOff / xOff : null,
      chainOn, chainOff, before, after: structuredClone(bel), finding };
  });
  let borrowed = 0, loadGP = 0;
  if (opt?.load) { loadGP = opt.load * 0.4; borrowed = opt.load * 0.4 + 20; next.borrowed = state.borrowed + borrowed; }
  const out = { qi, rows, rev: sum(rows, "rev") + (opt?.load || 0), revF: fc.rev, gp: sum(rows, "gp") + loadGP - (opt?.cost && !opt.extra ? opt.cost : 0), gpF: fc.gp,
    revOn: sum(rows, "revOn"), revOff: sum(rows, "revOff") + (opt?.load || 0), revOnF: sum(fc.rows, "revOn"), revOffF: sum(fc.rows, "revOff"),
    trade: planTotals(plan, qi, state.vi).trade, days: planTotals(plan, qi, state.vi).days, dilemma: d, answer: opt || null, scouts, nextState: next };
  out.events = quarterEvents(out, plan, state, qi);
  out.insight = quarterInsight(out, state, qi);
  return out;
}

function findingFor(id, v, t) {
  if (id === v.broken) return `Found it. Brand ${id}'s off-premise promotions have been loading Cascade's warehouse while shoppers bought less. Pay on depletions, not shipments, and fix the shelf gaps, and ${id} responds again. Its on-premise business is fine.`;
  if (id === v.sleeper) return `Brand ${id} is much stronger than anyone thought, on-premise: bars that add it reorder within 30 days. Off-premise it's ordinary.`;
  if (t.on.R > t.off.R * 1.4) return `Brand ${id} works best on-premise. Off-premise, extra money buys little.`;
  if (t.off.R > t.on.R * 1.4) return `Brand ${id} is an off-premise brand. On-premise support barely moves it.`;
  if (t.off.floor >= 40) return `Brand ${id} needs about $${t.off.floor}K a quarter off-premise to hold its shelf space. Beyond that, promotions mostly buy volume shoppers were buying anyway.`;
  return `Brand ${id} is what it looks like: modest, reliable returns in both channels.`;
}

function quarterEvents(out, plan, state, qi) {
  const { v } = world(state.vi), r = Object.fromEntries(out.rows.map((x) => [x.id, x])), ev = [], br = v.broken, sl = v.sleeper;
  const fixed = fixedBefore(state, qi, br);
  if (out.answer?.extra?.id === "A") ev.push({ week: 3, text: "Brand A's end-cap goes up at Kroger. Most buyers were regulars anyway." });
  const onBig = [...out.rows].sort((a, c) => c.xOn - a.xOn)[0];
  if (onBig && onBig.xOn >= 30) ev.push({ week: 4, text: `Staff trainings for Brand ${onBig.id} in ${Math.round(onBig.xOn / 3)} bars and restaurants.` });
  if (r.B.xOff >= 50) ev.push({ week: 6, text: "Brand B's price promotion runs. The lift comes mostly from shoppers who buy it every week." });
  if (!fixed) {
    if (qi === 0) ev.push({ week: 9, text: `Brand ${br} shipments are up, but depletions are falling.` });
    else if (qi === 1) ev.push({ week: 6, text: `Cascade is carrying 14 weeks of Brand ${br}. Normal is about 5.` });
    else if (qi === 2) ev.push({ week: 5, text: `Cascade stops ordering Brand ${br} to work down its inventory.` });
    else ev.push({ week: 8, text: `Brand ${br} depletions are still falling.` });
  } else if (r[br].x > 0) ev.push({ week: 8, text: `Brand ${br}'s fixed stores are selling through again.` });
  if (r[sl].xOn >= 20 || out.answer?.menu === sl) ev.push({ week: 10, text: `Brand ${sl}: new bars are reordering within 30 days.` });
  if ((plan.days.G || 0) >= 8) ev.push({ week: 8, text: `${plan.days.G} field days on Brand G. Volume holds, but doesn't move.` });
  if (out.answer?.menu) ev.push({ week: 7, text: `Brand ${out.answer.menu} lands the restaurant chain's cocktail menu.` });
  if (out.answer?.load) ev.push({ week: 12, text: "Cascade takes the year-end load-in. Q4 shipments jump." });
  if (out.scouts.length) ev.push({ week: 11, text: `Your rep reports back on Brand ${out.scouts.join(" and ")}.` });
  ev.push({ week: 13, text: "Quarter closes." });
  return ev.sort((a, c) => a.week - c.week).slice(-6);
}

function quarterInsight(out, state, qi) {
  const { v } = world(state.vi), br = out.rows.find((x) => x.id === v.broken);
  if (br.unwind > 0) return `Cascade stopped ordering Brand ${v.broken} to work down the inventory its promotions had built. The trade on ${v.broken} was funding the symptom.`;
  if (out.answer?.load) return "The load-in made Q4's shipments look strong. That product will sit in Cascade's warehouse into next year.";
  const rows = [...out.rows].sort((a, c) => Math.abs(c.growth - c.growthF) - Math.abs(a.growth - a.growthF)), top = rows[0];
  if (Math.abs(top.growth - top.growthF) < 3) return out.scouts.length ? "The quarter landed close to the team's forecast. The real news is in your scout reports and the chain below." : "The quarter landed close to the team's forecast. Look at the chain below: what the numbers don't show yet is where next quarter's surprises start.";
  const better = top.growth > top.growthF;
  const why = better ? (top.xOn > top.xOff ? "Its on-premise support worked harder than the team expected." : "It responded to your support more than the team expected.")
    : top.id === v.broken ? "More money didn't help, which suggests the problem is somewhere else in the chain." : "Your support bought less than the team expected.";
  return `Brand ${top.id} did ${better ? "better" : "worse"} than forecast (${pts(top.growthF)} expected, ${pts(top.growth)} actual). ${why}`;
}
const pts = (v) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(0)}%`;

// ---------- The year ----------
export function replay(plans, vi = 0) {
  let state = initialState(vi);
  const quarters = [];
  plans.forEach((p, qi) => { const q = simulateQuarter(state, p, qi); quarters.push({ ...q, plan: p, stateBefore: state }); state = q.nextState; });
  return { quarters, state };
}

const defaultAnswer = (qi, vi) => ({ 0: "pass", 1: "pass", 2: "menu-A", 3: "pass" }[qi]);
export const habitPlans = (vi = 0) => [0, 1, 2, 3].map((qi) => ({ ...lastYearPlan(), answer: qi === 2 ? "menu-A" : "pass" }));

// A strategy that reassesses every quarter: scout the two brands the team is least sure about, put each brand's support in
// the channel it believes works best, fund the best expected next dollar until it returns less than $1, and turn down
// offers that pay this year by costing next year.
export function evidencePlans(vi = 0) {
  const plans = []; let state = initialState(vi);
  const { truth, team } = world(vi);
  for (let qi = 0; qi < 4; qi++) {
    const p = { ...lastYearPlan(), trade: Object.fromEntries(IDS.map((i) => [i, 0])) };
    if (qi === 0) p.scout = IDS.filter((i) => team[i].conf === "Low").slice(0, SCOUTS);
    if (qi >= 1) IDS.forEach((i) => { const bo = state.beliefs[i].on.b, bf = state.beliefs[i].off.b; p.focus[i] = bo > bf * 1.25 && truth[i].off.floor === 0 ? "on" : bf > bo * 1.25 ? "off" : "both"; });
    const byBelief = [...IDS].sort((a, c) => state.beliefs[c].on.b - state.beliefs[a].on.b);
    p.answer = qi === 2 ? `menu-${byBelief.find((i) => ["A", "D", "F", "H"].includes(i))}` : "pass";
    let left = BUDGET.trade;
    while (left >= STEP.trade) {
      let best = null, bestM = 1;
      const rows = forecastQuarter(state, p, qi).rows;
      for (const r of rows) if (r.next > bestM) { bestM = r.next; best = r.id; }
      if (!best) break;
      p.trade[best] += STEP.trade; left -= STEP.trade;
    }
    if (qi >= 2) {
      p.days = Object.fromEntries(IDS.map((i) => [i, 0])); let dl = BUDGET.days;
      while (dl > 0) { let best = null, bestM = -1; for (const id of IDS) { const m = marginal((x) => curve(state.beliefs[id].d.b, truth[id].kd, x), p.days[id], 1) * (qi === 3 ? 1 - truth[id].lag : 1); if (m > bestM) { bestM = m; best = id; } } p.days[best] += 1; dl -= 1; }
    }
    plans.push(p);
    state = simulateQuarter(state, p, qi).nextState;
  }
  return plans;
}

const yearTotals = (quarters, state) => {
  const carry = IDS.reduce((a, i) => a + state.carry[i], 0);
  const gp = sum(quarters, "gp");
  return { rev: sum(quarters, "rev"), gp, trade: sum(quarters, "trade"), days: sum(quarters, "days"), carry, borrowed: state.borrowed, total: gp + carry - state.borrowed,
    gpOn: quarters.reduce((a, q) => a + q.rows.reduce((s, r) => s + r.revOn * (brandById[r.id].gm / 100), 0), 0), revOn: sum(quarters, "revOn"), revOff: sum(quarters, "revOff") };
};

// The score: value created against running last year's plan all year, counting what you set up for (or took from) next year.
export function scoreSoFar(plans, vi = 0) {
  const you = replay(plans, vi).quarters, habit = replay(habitPlans(vi).slice(0, plans.length), vi).quarters;
  return you.reduce((a, q, i) => a + q.gp - habit[i].gp, 0);
}
const tierCache = {};
export function tiers(vi = 0) {
  if (tierCache[vi]) return tierCache[vi];
  const e = replay(evidencePlans(vi), vi), hb = replay(habitPlans(vi), vi);
  const b = yearTotals(e.quarters, e.state).total - yearTotals(hb.quarters, hb.state).total;
  const round = (v) => Math.round(v / 50) * 50;
  return (tierCache[vi] = [{ name: "Bronze", at: round(b * 0.3) }, { name: "Silver", at: round(b * 0.6) }, { name: "Gold", at: round(b * 0.9) }]);
}

// ---------- Year-end review ----------
export function review(plans, vi = 0) {
  const { v, truth } = world(vi);
  const you = replay(plans, vi), habit = replay(habitPlans(vi), vi), best = replay(evidencePlans(vi), vi);
  const Y = yearTotals(you.quarters, you.state), Hb = yearTotals(habit.quarters, habit.state), Bs = yearTotals(best.quarters, best.state);
  const qs = you.quarters, br = v.broken, sl = v.sleeper;
  const tradeYear = qs.reduce((a, q) => a + q.trade, 0) || 1;
  const score = Y.total - Hb.total, bestScore = Bs.total - Hb.total;
  const tier = [...tiers(vi)].reverse().find((t) => score >= t.at) || null;

  const scale = qs.reduce((a, q) => a + q.plan.trade.A + q.plan.trade.B, 0) / tradeYear;
  const lowShare = (q) => (q.plan.trade.B + q.plan.trade.G + (fixedBefore(q.stateBefore, q.qi, br) ? 0 : q.plan.trade[br])) / (q.trade || 1);
  const lowQ1 = lowShare(qs[0]), lowQ4 = lowShare(qs[3]);
  const q1 = qs[0];
  const surprise = [...q1.rows].sort((a, c) => (c.growth - c.growthF) - (a.growth - a.growthF))[0];
  const moveAt = [1, 2, 3].find((i) => qs[i].plan.trade[surprise.id] - q1.plan.trade[surprise.id] >= 20 || (qs[i].plan.focus[surprise.id] === "on" && q1.plan.focus[surprise.id] !== "on"));
  const react = moveAt === 1 ? "fast" : moveAt ? "slow" : "none";
  const brAt = you.state.scouted[br];
  const brBlind = qs.filter((q) => !fixedBefore(q.stateBefore, q.qi, br)).reduce((a, q) => a + q.plan.trade[br] + (q.answer?.extra?.id === br ? q.answer.extra.x : 0), 0);
  const slAt = [you.state.scouted[sl], [0, 1, 2, 3].find((i) => { const s = split(qs[i].plan, sl, truth[sl].share); return s.on >= 40 || qs[i].answer?.menu === sl; })].filter((x) => x !== undefined).sort()[0];
  const onShift = (id) => qs.slice(1).some((q) => q.plan.focus[id] === "on");
  const channelFit = [sl, "D"].filter(onShift).length + (qs.slice(1).some((q) => ["A", "B", "E"].some((id) => q.plan.focus[id] === "on")) ? -1 : 0);
  const gDays = qs.slice(2).reduce((a, q) => a + (q.plan.days.G || 0), 0);

  const flags = [];
  qs.forEach((q) => IDS.forEach((id) => {
    const t = truth[id], s = split(q.plan, id, t.share), off = trueOff(q.stateBefore, q.qi, id);
    const mOff = s.off > off.floor ? off.R * Math.exp(-(s.off - off.floor - 10) / off.k) : 9, mOn = s.on > 0 ? t.on.R * Math.exp(-(s.on - 10) / t.on.k) : 9;
    const worst = Math.min(s.off >= off.floor + 30 ? mOff : 9, s.on >= 30 ? mOn : 9);
    if (worst < 0.9) flags.push({ q: q.qi, id, last: worst, spent: q.plan.trade[id] });
  }));
  const worst = flags.sort((a, c) => c.spent * (1 - c.last) - a.spent * (1 - a.last))[0];

  let moves = 0, aligned = 0;
  for (let i = 1; i < qs.length; i++) IDS.forEach((id) => {
    const r = qs[i - 1].rows.find((x) => x.id === id), db = (r.after.on.b + r.after.off.b - r.before.on.b - r.before.off.b) / 2;
    if (Math.abs(db) < 0.15) return; moves++;
    if (Math.sign(qs[i].plan.trade[id] - qs[i - 1].plan.trade[id]) === Math.sign(db)) aligned++;
  });
  const updating = moves ? aligned / moves : null;
  const captured = bestScore > 0 ? score / bestScore : 1;
  const loadIn = qs[3].answer?.load;
  const menuPick = qs[2].answer?.menu;

  const mark = (ok, partly) => (ok ? "yes" : partly ? "partly" : "no");
  const algorithms = [
    { idea: "Marginal allocation", means: "Put the next dollar where it creates the most value.", slug: "optimization", status: mark(captured >= 0.7, captured >= 0.35),
      why: captured >= 0.7 ? "You kept moving money toward the brands that returned the most." : captured >= 0.35 ? "You moved some money toward the best returns, but less than the evidence supported." : "Most of your money stayed close to last year's plan.", next: "Next time: compare every brand's next $10K and move money until they're roughly level." },
    { idea: "Diminishing returns", means: "More investment eventually buys less.", slug: "optimization", status: mark(!flags.length, flags.length <= 2),
      why: !worst ? "You never kept feeding a brand after its returns had flattened." : `In ${QUARTERS[worst.q].id}, Brand ${worst.id}'s last $10K returned about $${worst.last.toFixed(2)}.`, next: "Next time: when a brand's next $10K drops below $1, stop adding to it." },
    { idea: "Opportunity cost", means: "Every dollar you place is a dollar you can't place elsewhere.", slug: "optimization", status: mark(lowQ4 <= lowQ1 * 0.5, lowQ4 < lowQ1),
      why: `Brands returning less than $1 took ${pct(lowQ1)} of your trade in Q1 and ${pct(lowQ4)} in Q4.`, next: "Next time: fund the weakest brands only to their shelf floor, and move the rest." },
    { idea: "Exploration", means: "Spend a little to learn what you don't know.", slug: "exploration-vs-exploitation", status: mark(slAt !== undefined && slAt <= 1, slAt !== undefined),
      why: slAt === undefined ? `You never tested Brand ${sl}, which turned out to be the year's sleeper.` : `You found out what Brand ${sl} could do in ${QUARTERS[slAt].id}.`, next: "Next time: scout or test the brands the team is least sure about, early." },
    { idea: "Root-cause diagnosis", means: "Find where the commercial chain breaks before you fund it.", slug: "value-of-information", status: mark(brAt !== undefined && brAt <= 1, brAt !== undefined),
      why: brAt === undefined ? `You never looked into Brand ${br}, and put $${Math.round(brBlind)}K of trade into the symptom.` : `You found Brand ${br}'s break in ${QUARTERS[brAt].id}${brBlind ? `, after $${Math.round(brBlind)}K had gone into it` : ""}.`, next: "Next time: when shipments and depletions disagree, send a rep before you send money." },
    { idea: "Forecast updating", means: "Change your expectations when the evidence changes.", slug: "bayesian-updating", status: updating === null ? "partly" : mark(updating >= 0.65, updating >= 0.4),
      why: updating === null ? "Your beliefs barely moved, because little of your plan tested them." : `When a brand's expected return moved, your next plan followed it ${Math.round(updating * 100)}% of the time.`, next: "Next time: after each quarter, move money toward the brands that beat their forecast." },
    { idea: "Time horizon", means: "Some moves pay this year; some pay next.", slug: "decision-trees", status: mark(!loadIn && Y.carry > Hb.carry, !loadIn),
      why: loadIn ? "You took the year-end load-in: it lifted Q4 and left next year starting behind." : Y.carry > Hb.carry ? `You turned down the load-in and left ${$k(Y.carry)} of on-premise work paying into next year.` : "You turned down the load-in, but left little building for next year.", next: "Next time: count what a move does to next year, not just this quarter." },
    { idea: "Portfolio optimization", means: "Balance brands, channels and both budgets at once.", slug: "multi-armed-bandits", status: mark(captured >= 0.8, captured >= 0.45),
      why: `You captured ${pct(Math.max(0, Math.min(1.2, captured)))} of the value a reassess-every-quarter strategy found.`, next: "Next time: reassess every brand every quarter, not just the ones that surprised you." },
  ];

  const achievements = [
    { name: "Found the leak", got: brAt !== undefined && brAt <= 1, hint: "One brand's chain is broken. Find it before Q3." },
    { name: "Spotted the sleeper", got: slAt !== undefined && slAt <= 1, hint: "One small brand is far better than the team thinks. Test it early." },
    { name: "Right brand, right channel", got: channelFit >= 2, hint: "Two brands belong on-premise. Put their support there." },
    { name: "Stopped feeding the giant", got: qs[3].plan.trade.A + qs[3].plan.trade.B <= 130, hint: "The two biggest brands take more than they return. Cut them to what holds the shelf." },
    { name: "Knew when to stop", got: flags.length === 0, hint: "Never leave a brand funded past the point its next $10K returns $1." },
    { name: "Won the menu slot", got: menuPick === sl || menuPick === "D", hint: "Give the one menu spot to the brand that wins on-premise." },
    { name: "Didn't borrow from next year", got: !loadIn, hint: "A load-in makes this year look better and next year worse." },
  ];

  const tendencies = [
    scale >= 0.35 ? { label: "Favor scale", text: `You put ${pct(scale)} of your trade into the two largest brands. Last year's plan put 46% there.` }
      : { label: "Follow return, not size", text: `${pct(scale)} of your trade went to the two largest brands, against 46% in last year's plan.` },
    react === "fast" ? { label: "React quickly", text: `Brand ${surprise.id} beat its Q1 forecast, and you backed it in Q2.` }
      : react === "slow" ? { label: "React slowly", text: `Brand ${surprise.id} beat its Q1 forecast, but you waited until ${QUARTERS[moveAt].id} to back it.` }
      : { label: "Hold course", text: `Brand ${surprise.id} beat its Q1 forecast, and you never moved more behind it.` },
    slAt !== undefined && slAt <= 1 ? { label: "Explore early", text: `You tested the uncertain brands early and found Brand ${sl}.` } : { label: "Under-explore", text: `${slAt === undefined ? `You never tested Brand ${sl}.` : `You didn't test Brand ${sl} until ${QUARTERS[slAt].id}.`} The biggest surprises were in the brands the team was least sure about.` },
    brAt !== undefined && brAt <= 1 ? { label: "Diagnose well", text: `You found the break in Brand ${br}'s chain in ${QUARTERS[brAt].id}, before the distributor stopped ordering.` }
      : brAt !== undefined ? { label: "Diagnose late", text: `You found Brand ${br}'s break in ${QUARTERS[brAt].id}, after the distributor had already stopped ordering.` }
      : { label: "Fund the symptom", text: `You kept funding Brand ${br} ($${Math.round(brBlind)}K) without finding why it was declining.` },
  ];
  if (gDays >= 12) tendencies.push({ label: "Time follows habit", text: `${gDays} field days went to Brand G in Q3 and Q4, the brand where time returns least.` });

  return { variant: v, you: Y, habit: Hb, best: Bs, score, bestScore, tier, tiers: tiers(vi), captured, quarters: qs, algorithms, achievements, tendencies, plans };
}
const pct = (v) => `${Math.round(v * 100)}%`;
const $k = (v) => (Math.abs(v) >= 1000 ? `$${(v / 1000).toFixed(1)}M` : `$${Math.round(v)}K`);
