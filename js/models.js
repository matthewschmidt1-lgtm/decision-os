// Decision models. Pure functions, no DOM. Numbers are illustrative but internally consistent.

export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export const round = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;

/* ---------- 01 Marginal analysis (trade spend vs contribution) ---------- */
// Volume responds to trade spend with diminishing returns: V(s) = Vmax * (1 - e^(-s/k)).
// Contribution = unit margin * volume - spend. Marginal contribution = dC/ds.
export function volumeAt(spend, { vmax = 1200, k = 60 } = {}) {
  return vmax * (1 - Math.exp(-spend / k));
}
export function contributionAt(spend, p = {}) {
  const { unitMargin = 0.11 } = p;
  return unitMargin * volumeAt(spend, p) - spend;
}
export function marginalContribution(spend, p = {}) {
  const h = 0.5;
  return (contributionAt(spend + h, p) - contributionAt(spend - h, p)) / (2 * h);
}
// Spend where marginal contribution = 0 (optimum): d/ds[m*Vmax(1-e^-s/k)] = 1 → s* = k ln(m Vmax / k)
export function optimalSpend({ vmax = 1200, k = 60, unitMargin = 0.11 } = {}) {
  const v = (unitMargin * vmax) / k;
  return v <= 1 ? 0 : k * Math.log(v);
}
// Scenario used by the promotion decision: compare a % change in promo spend.
export function promoScenario(pctChange, base = { spend: 40, vmax: 1200, k: 60, unitMargin: 0.11 }) {
  const s0 = base.spend, s1 = base.spend * (1 + pctChange / 100);
  const v0 = volumeAt(s0, base), v1 = volumeAt(s1, base);
  const c0 = contributionAt(s0, base), c1 = contributionAt(s1, base);
  return {
    spend: s1,
    volumePct: round(((v1 - v0) / v0) * 100, 1),
    contributionPct: round(((c1 - c0) / Math.abs(c0)) * 100, 1),
    marginal: round(marginalContribution(s1, base), 2),
    volume: v1, contribution: c1,
  };
}

/* ---------- 02 Utility / multi-objective ---------- */
// options: [{name, volume, revenue, margin}] as percentage changes. weights: {volume, revenue, margin} summing to ~1.
export function utilityRank(options, weights) {
  const keys = ["volume", "revenue", "margin"];
  const total = keys.reduce((a, k) => a + (weights[k] || 0), 0) || 1;
  // normalise each objective to 0..1 across options so weights compare like with like
  const ranges = Object.fromEntries(keys.map(k => {
    const vals = options.map(o => o[k]); const lo = Math.min(...vals), hi = Math.max(...vals);
    return [k, { lo, hi: hi === lo ? lo + 1 : hi }];
  }));
  return options.map(o => {
    const u = keys.reduce((acc, k) => acc + ((weights[k] || 0) / total) * ((o[k] - ranges[k].lo) / (ranges[k].hi - ranges[k].lo)), 0);
    return { ...o, utility: round(u * 100, 1) };
  }).sort((a, b) => b.utility - a.utility);
}

/* ---------- 03 Multi-armed bandit (UCB allocation of attention) ---------- */
// arms: [{id, mean (expected return per hour), n (hours of evidence), sd (uncertainty)}]
// Returns allocation of `hours` across arms using an upper-confidence-bound score with exploration weight c.
export function ucbScores(arms, c = 1) {
  const N = arms.reduce((a, x) => a + x.n, 0) + arms.length;
  return arms.map(a => {
    const bonus = c * a.sd * Math.sqrt(Math.log(N) / (a.n + 1));
    return { ...a, bonus, score: a.mean + bonus };
  });
}
export function allocateHours(arms, hours = 10, c = 0.5) {
  const scored = ucbScores(arms, c);
  // softmax over scores → proportional allocation; temperature keeps it legible
  const t = 0.3;
  const max = Math.max(...scored.map(s => s.score));
  const w = scored.map(s => Math.exp((s.score - max) / t));
  const sum = w.reduce((a, b) => a + b, 0);
  return scored.map((s, i) => ({ ...s, hours: round((w[i] / sum) * hours, 1) }))
    .sort((a, b) => b.hours - a.hours);
}

/* ---------- 04 Bayesian updating ---------- */
// prior: probability of hypothesis H (e.g. "account will accept the placement").
// evidence: {name, lr} where lr = P(E|H) / P(E|¬H). Returns trajectory of posteriors.
export function bayesUpdate(prior, evidence) {
  let odds = prior / (1 - prior);
  const steps = [{ name: "Prior", p: prior }];
  for (const e of evidence) {
    if (e.on === false) continue;
    odds *= e.lr;
    steps.push({ name: e.name, p: odds / (1 + odds), lr: e.lr });
  }
  return steps;
}

/* ---------- 05 Expected value ---------- */
export function expectedValue({ p, probability, value, cost }) {
  return (p ?? probability) * value - cost;
}
export function rankByEV(opps) {
  return opps.map(o => ({ ...o, ev: expectedValue(o) })).sort((a, b) => b.ev - a.ev);
}

/* ---------- 06 Decision tree ---------- */
// A tiny tree evaluator. node = {label, action?} | {label, branches:[{label, p, node}]}
export function evaluateTree(node, payoffs) {
  if (!node.branches) return { ...node, value: payoffs[node.action] ?? 0 };
  const branches = node.branches.map(b => ({ ...b, node: evaluateTree(b.node, payoffs) }));
  const value = branches.reduce((a, b) => a + b.p * b.node.value, 0);
  return { ...node, branches, value };
}

/* ---------- 07 Value of information ---------- */
// causes: [{id, name, p}] beliefs about why an account underperforms.
// actions: {actionId: {causeId: payoff}} payoff of each action under each cause.
// Returns EV of acting now, EV with perfect information, and per-diagnostic value.
export function valueOfInformation(causes, actions, diagnostics) {
  const evAction = (probs) => Object.entries(actions).map(([id, pay]) =>
    ({ id, ev: causes.reduce((a, c) => a + (probs[c.id] ?? c.p) * (pay[c.id] ?? 0), 0) }));
  const now = evAction({}).sort((a, b) => b.ev - a.ev)[0];
  // EVPI: learn the true cause, then choose the best action for it
  const evpi = causes.reduce((a, c) => a + c.p * Math.max(...Object.values(actions).map(pay => pay[c.id] ?? 0)), 0) - now.ev;
  // Each diagnostic resolves a subset of causes (tells you if the cause is in the set or not)
  const diag = diagnostics.map(d => {
    const inSet = causes.filter(c => d.resolves.includes(c.id));
    const pIn = inSet.reduce((a, c) => a + c.p, 0);
    const cond = (subset, pSub) => Object.fromEntries(causes.map(c => [c.id, subset.includes(c) ? c.p / pSub : 0]));
    const evIn = pIn > 0 ? evAction(cond(inSet, pIn)).sort((a, b) => b.ev - a.ev)[0].ev : 0;
    const out = causes.filter(c => !inSet.includes(c)); const pOut = 1 - pIn;
    const evOut = pOut > 0 ? evAction(cond(out, pOut)).sort((a, b) => b.ev - a.ev)[0].ev : 0;
    const value = pIn * evIn + pOut * evOut - now.ev;
    return { ...d, value: round(Math.max(0, value), 1), net: round(Math.max(0, value) - d.cost, 1) };
  }).sort((a, b) => b.net - a.net);
  return { now, evpi: round(evpi, 1), diagnostics: diag };
}

/* ---------- 08 Economic fingerprint ---------- */
// Decompose a sales change into volume and price, then show margin and trade spend.
export function fingerprint({ volume, price, tradeSpend, marginRate = 0.32 }) {
  const sales = (1 + volume / 100) * (1 + price / 100) - 1;
  // Illustrative margin bridge (percentage points): net price flows into margin, trade spend erodes it,
  // volume adds a little operating leverage. Coefficients are teaching constants, not fitted.
  const margin = price * 0.6 - tradeSpend * 0.4 + volume * 0.1;
  return { sales: round(sales * 100, 1), volume, price, margin: round(margin, 1), tradeSpend };
}

/* ---------- Formatting helpers ---------- */
export const pct = (x, d = 1) => `${x > 0 ? "+" : x < 0 ? "−" : ""}${Math.abs(x).toFixed(d)}%`;
export const money = (x) => x >= 1e6 ? `$${(x / 1e6).toFixed(1)}M` : x >= 1e3 ? `$${Math.round(x / 1e3)}K` : `$${Math.round(x)}`;
export const hours = (h) => `${h.toFixed(1)}h`;
