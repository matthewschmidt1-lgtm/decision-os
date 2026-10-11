// Plan edits for the Portfolio decide screen. Pure: it imports only the engine and the money formatter, never the DOM or
// the router, so tests/plan.test.mjs can check it against the code it replaced. Each function edits the plan (and, for
// request answers, the saved page state) it is given in place, as the page always has, and returns the plan.
import * as S from "../sim.js";
import { $k } from "./fmt.js";

export const unlocked = (qi, what) => S.QUARTERS.slice(0, qi + 1).some((q) => q.unlock === what);
export const freeTrade = (plan, qi, vi) => S.BUDGET.trade - S.planTotals(plan, qi, vi).trade;
export const freeDays = (plan, qi, vi) => S.BUDGET.days - S.planTotals(plan, qi, vi).days;

// + takes $10K from free trade (only if $10K is free); − puts $10K back (never below zero). Overspending is impossible.
export function stepTrade(plan, id, dir, qi, vi) {
  if (dir > 0) { if (freeTrade(plan, qi, vi) >= S.STEP.trade) plan.trade[id] += S.STEP.trade; }
  else if (dir < 0) plan.trade[id] = Math.max(0, plan.trade[id] - S.STEP.trade);
  return plan;
}
// Jump straight to an amount: snapped to $10K and clamped to what the brand has plus what is free. Same result as
// pressing ± until the amount is reached or a limit stops it.
export function setTrade(plan, id, x, qi, vi) {
  const max = plan.trade[id] + Math.max(0, freeTrade(plan, qi, vi));
  plan.trade[id] = Math.max(0, Math.min(max, Math.round(x / S.STEP.trade) * S.STEP.trade));
  return plan;
}
// Move $10K from one brand to another; nothing happens if the source has less than $10K.
export function moveTrade(plan, from, to, qi, vi) {
  if (from === to || plan.trade[from] < S.STEP.trade) return plan;
  stepTrade(plan, from, -1, qi, vi);
  return stepTrade(plan, to, 1, qi, vi);
}
export function stepDays(plan, id, dir, qi, vi) {
  if (dir > 0) { if (freeDays(plan, qi, vi) >= S.STEP.days) plan.days[id] += S.STEP.days; }
  else if (dir < 0) plan.days[id] = Math.max(0, plan.days[id] - S.STEP.days);
  return plan;
}
export function setDays(plan, id, d, qi, vi) {
  const max = plan.days[id] + Math.max(0, freeDays(plan, qi, vi));
  plan.days[id] = Math.max(0, Math.min(max, Math.round(d)));
  return plan;
}
export function setFocus(plan, id, k) { if (k in S.FOCUS) plan.focus[id] = k; return plan; }
// A scout can be added only to a brand not yet scouted, and only while one is free this year.
export function toggleScout(plan, id, state) {
  const i = plan.scout.indexOf(id);
  if (i >= 0) plan.scout.splice(i, 1);
  else if (state.scouted[id] === undefined && state.scoutsLeft - plan.scout.length > 0) plan.scout.push(id);
  return plan;
}

// The quarter's request. Every option is clickable. If a choice costs money you haven't freed up, it's funded for you
// (first from the brand the request is about, then from the brands whose next $10K returns least) and st.fundNote says
// what moved; st.funded records it so changing or clearing the answer gives it back. Moved verbatim from the page.
function fund(plan, st, o, state, qi, vi) {
  let need = o.cost - (S.BUDGET.trade - S.planTotals({ ...plan, answer: null }, qi, vi).trade);
  const moved = {};
  const f = S.forecastQuarter(state, plan, qi).rows;
  const order = [o.extra?.id, ...[...f].sort((x, y) => x.next - y.next).map((r) => r.id)].filter(Boolean);
  for (const id of order) { while (need > 0 && plan.trade[id] >= S.STEP.trade) { plan.trade[id] -= S.STEP.trade; need -= S.STEP.trade; moved[id] = (moved[id] || 0) + S.STEP.trade; } if (need <= 0) break; }
  const list = Object.entries(moved).map(([id, x]) => `${$k(x)} from Brand ${id}`);
  st.fundNote = list.length ? `To fund it, ${list.join(" and ")} moved into the request.` : null;
  st.funded = list.length ? moved : null;
}
function refund(plan, st) { if (st.funded) { for (const [id, x] of Object.entries(st.funded)) plan.trade[id] = (plan.trade[id] || 0) + x; st.funded = null; } }
export function pickAnswer(plan, st, o, state, qi, vi) {
  st.fundNote = null; refund(plan, st);
  if (plan.answer === o.id) plan.answer = null;
  else {
    if (o.cost) fund(plan, st, o, state, qi, vi);
    // Choosing the request's scout option with no scout free takes the last scout off the plan.
    if (o.scout) { const free = state.scoutsLeft - plan.scout.length; if (free <= 0 && plan.scout.length) { const dropped = plan.scout.pop(); st.fundNote = `Your scout on Brand ${dropped} goes here instead.`; } }
    plan.answer = o.id;
  }
  return plan;
}

// One lever unlocks per quarter: until then it stays at last year's setting (focus before Q2, field days before Q3).
export function applyLocks(plan, qi) {
  if (!unlocked(qi, "days")) plan.days = { ...S.lastYearPlan().days };
  if (!unlocked(qi, "focus")) plan.focus = { ...S.lastYearPlan().focus };
  return plan;
}
// A scout asked for from a results chain card joins the next draft if the brand is unscouted and a scout is free.
export function takeNextScout(plan, st, state) {
  if (st.nextScout && !plan.scout.includes(st.nextScout) && state.scouted[st.nextScout] === undefined && state.scoutsLeft > plan.scout.length) plan.scout.push(st.nextScout);
  st.nextScout = null;
  return plan;
}
// Next quarter starts from this quarter's plan, with no scouts and no answer.
export const nextDraft = (q) => ({ ...S.clonePlan(q.plan), scout: [], answer: null });
// "Reset to" a plan keeps the current answer.
export const resetTo = (plan, p) => ({ ...S.clonePlan(p), answer: plan.answer });
