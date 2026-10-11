import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "../js/sim.js";
import * as P from "../js/portfolio/plan.js";
import { $k } from "../js/portfolio/fmt.js";
import { FIXTURES, canon } from "./fixtures.mjs";

// Seeded, so a failure always reproduces.
const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const clone = (x) => structuredClone(x);
// Starting drafts with different budgets: everything spent, money free, the request already paid for, scouts taken.
function drafts() {
  const out = [];
  for (const [name, fx] of Object.entries(FIXTURES)) {
    const plans = fx.plans(), year = S.replay(plans, fx.vi);
    plans.forEach((p, qi) => {
      const state = year.quarters[qi].stateBefore;
      out.push({ name: `${name} Q${qi + 1}`, vi: fx.vi, qi, state, plan: S.clonePlan(p) });
      out.push({ name: `${name} Q${qi + 1} unanswered`, vi: fx.vi, qi, state, plan: { ...S.clonePlan(p), answer: null } });
      out.push({ name: `${name} Q${qi + 1} last year's plan`, vi: fx.vi, qi, state, plan: S.lastYearPlan() });
      out.push({ name: `${name} Q${qi + 1} scouts full`, vi: fx.vi, qi, state, plan: { ...S.lastYearPlan(), scout: S.brandIds.filter((id) => state.scouted[id] === undefined).slice(0, state.scoutsLeft) } });
    });
  }
  return out;
}

// The page's ± buttons, pressed until the target is reached or a limit stops them.
function byButtons(plan, id, target, qi, vi) {
  const goal = Math.round(target / S.STEP.trade) * S.STEP.trade;
  for (let n = 0; n < 200; n++) {
    const was = plan.trade[id];
    if (was < goal) P.stepTrade(plan, id, 1, qi, vi); else if (was > goal) P.stepTrade(plan, id, -1, qi, vi);
    if (plan.trade[id] === was) break;
  }
  return plan;
}

test("plan: setTrade equals pressing ± to the same amount, and never overspends", () => {
  const r = rng(42);
  let n = 0;
  for (const d of drafts()) for (const id of S.brandIds) for (let k = 0; k < 3; k++) {
    const target = Math.floor(r() * 640) - 60; // includes negatives, odd amounts and more than the budget
    const a = P.setTrade(clone(d.plan), id, target, d.qi, d.vi), b = byButtons(clone(d.plan), id, target, d.qi, d.vi);
    assert.equal(canon(a), canon(b), `${d.name} ${id} → ${target}`);
    if (P.freeTrade(d.plan, d.qi, d.vi) >= 0) assert.ok(P.freeTrade(a, d.qi, d.vi) >= 0, `${d.name} ${id} → ${target} overspent`);
    assert.ok(a.trade[id] % S.STEP.trade === 0 && a.trade[id] >= 0);
    n++;
  }
  assert.ok(n > 1000);
});

test("plan: setDays equals pressing ± and stays inside 40 days", () => {
  const r = rng(7);
  for (const d of drafts()) for (const id of S.brandIds) {
    const target = Math.floor(r() * 50) - 5;
    const a = P.setDays(clone(d.plan), id, target, d.qi, d.vi), b = clone(d.plan);
    for (let n = 0; n < 60; n++) { const was = b.days[id]; P.stepDays(b, id, was < target ? 1 : was > target ? -1 : 0, d.qi, d.vi); if (b.days[id] === was) break; }
    assert.equal(canon(a), canon(b), `${d.name} ${id} days → ${target}`);
    if (P.freeDays(d.plan, d.qi, d.vi) >= 0) assert.ok(P.freeDays(a, d.qi, d.vi) >= 0);
  }
});

test("plan: moving $10K keeps the total and needs $10K at the source", () => {
  const p = S.lastYearPlan();
  P.moveTrade(p, "B", "D", 0, 0);
  assert.equal(p.trade.B, 80); assert.equal(p.trade.D, 60); assert.equal(P.freeTrade(p, 0, 0), 0);
  const q = { ...S.lastYearPlan(), trade: { ...S.lastYearPlan().trade, G: 0 } };
  assert.equal(canon(P.moveTrade(clone(q), "G", "A", 0, 0)), canon(q));
});

// ---------- The oracle: the request code exactly as it stood in js/pages/portfolio.js before the move ----------
function oraclePick(plan, st, o, state, qi, vi) {
  const fund = (o) => {
    let need = o.cost - (S.BUDGET.trade - S.planTotals({ ...plan, answer: null }, qi, vi).trade);
    const moved = {};
    const f = S.forecastQuarter(state, plan, qi).rows;
    const order = [o.extra?.id, ...[...f].sort((x, y) => x.next - y.next).map((r) => r.id)].filter(Boolean);
    for (const id of order) { while (need > 0 && plan.trade[id] >= S.STEP.trade) { plan.trade[id] -= S.STEP.trade; need -= S.STEP.trade; moved[id] = (moved[id] || 0) + S.STEP.trade; } if (need <= 0) break; }
    const list = Object.entries(moved).map(([id, x]) => `${$k(x)} from Brand ${id}`);
    st.fundNote = list.length ? `To fund it, ${list.join(" and ")} moved into the request.` : null;
    st.funded = list.length ? moved : null;
  };
  const refund = () => { if (st.funded) { for (const [id, x] of Object.entries(st.funded)) plan.trade[id] = (plan.trade[id] || 0) + x; st.funded = null; } };
  const pick = (o) => {
    st.fundNote = null; refund();
    if (plan.answer === o.id) plan.answer = null;
    else {
      if (o.cost) fund(o);
      if (o.scout) { const free = state.scoutsLeft - plan.scout.length; if (free <= 0 && plan.scout.length) { const dropped = plan.scout.pop(); st.fundNote = `Your scout on Brand ${dropped} goes here instead.`; } }
      plan.answer = o.id;
    }
  };
  pick(o);
}

test("plan: pickAnswer matches the old fund/refund/pick code for every option, every quarter, and in sequences", () => {
  let n = 0;
  for (const d of drafts()) {
    const opts = S.dilemma(d.qi, d.vi).options;
    const seqs = [...opts.map((o) => [o]), ...opts.map((o) => [o, o]), ...opts.flatMap((a) => opts.filter((b) => b !== a).map((b) => [a, b, a])), opts];
    for (const seq of seqs) {
      const pa = clone(d.plan), sa = { funded: null, fundNote: null }, pb = clone(d.plan), sb = { funded: null, fundNote: null };
      for (const o of seq) { P.pickAnswer(pa, sa, o, d.state, d.qi, d.vi); oraclePick(pb, sb, o, d.state, d.qi, d.vi); }
      const label = `${d.name}: ${seq.map((o) => o.id).join(" → ")}`;
      assert.equal(canon(pa), canon(pb), `${label} plan`);
      assert.equal(canon(sa), canon(sb), `${label} funded/note`);
      n++;
    }
  }
  assert.ok(n > 500);
});

test("plan: a paid request never overspends a fully spent plan, and passing gives the money back", () => {
  const state = S.initialState(0), p = S.lastYearPlan(), st = {}, take = S.dilemma(0, 0).options[0];
  P.pickAnswer(p, st, take, state, 0, 0);
  assert.equal(P.freeTrade(p, 0, 0), 0); assert.equal(p.trade.A, 100); assert.equal(st.funded.A, 40);
  P.pickAnswer(p, st, S.dilemma(0, 0).options[1], state, 0, 0);
  assert.equal(canon(p), canon({ ...S.lastYearPlan(), answer: "pass" }));
});

test("plan: locks force last year's focus before Q2 and last year's days before Q3", () => {
  const ly = S.lastYearPlan(), edited = () => ({ ...ly, focus: { ...ly.focus, D: "on", B: "off" }, days: { ...ly.days, G: 0, D: 12 } });
  const q1 = P.applyLocks(edited(), 0), q2 = P.applyLocks(edited(), 1), q3 = P.applyLocks(edited(), 2), q4 = P.applyLocks(edited(), 3);
  assert.equal(canon(q1.focus), canon(ly.focus)); assert.equal(canon(q1.days), canon(ly.days));
  assert.equal(q2.focus.D, "on"); assert.equal(canon(q2.days), canon(ly.days));
  assert.equal(q3.focus.D, "on"); assert.equal(q3.days.D, 12);
  assert.equal(q4.focus.B, "off"); assert.equal(q4.days.G, 0);
});

test("plan: next quarter's draft, Reset to, and the chain card's scout behave as before", () => {
  const year = S.replay(FIXTURES.mine0.plans(), 0), q = year.quarters[0];
  assert.equal(canon(P.nextDraft(q)), canon({ ...S.clonePlan(q.plan), scout: [], answer: null }));
  assert.equal(canon(P.resetTo({ ...S.lastYearPlan(), answer: "pass" }, q.plan)), canon({ ...S.clonePlan(q.plan), answer: "pass" }));
  const st = { nextScout: "D" }, p = S.lastYearPlan();
  P.takeNextScout(p, st, year.quarters[1].stateBefore); // both scouts were used in Q1
  assert.equal(p.scout.length, 0); assert.equal(st.nextScout, null);
  const st2 = { nextScout: "D" }, p2 = S.lastYearPlan();
  P.takeNextScout(p2, st2, S.initialState(0));
  assert.equal(p2.scout.join(), "D");
  const p3 = S.lastYearPlan(); P.toggleScout(p3, "C", year.quarters[1].stateBefore);
  assert.equal(p3.scout.length, 0, "C is already scouted");
});
