import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "../js/sim.js";

const totalGP = (plans) => S.replay(plans).quarters.reduce((a, q) => a + q.gp, 0);

test("sim: the same decisions always produce the same year", () => {
  assert.equal(totalGP(S.habitPlans()), totalGP(S.habitPlans()));
});

test("sim: following the evidence beats last year's plan, and stays inside both budgets", () => {
  const plans = S.evidencePlans();
  for (const p of plans) { const t = S.planTotals(p); assert.ok(t.trade <= S.BUDGET.trade && t.hours <= S.BUDGET.hours, JSON.stringify(t)); }
  assert.ok(totalGP(plans) > totalGP(S.habitPlans()) + 500, "a reassess-every-quarter strategy should find real value");
});

test("sim: Brand C's distributor unwind hits in Q3 unless its break was found first", () => {
  const habit = S.replay(S.habitPlans()).quarters[2].rows.find((r) => r.id === "C");
  assert.ok(habit.unwind > 0, "funding C blind should end in an inventory unwind");
  const early = S.habitPlans(); early[0] = { ...early[0], investigate: ["C"], hours: { ...early[0].hours, G: 16 } };
  const c = S.replay(early).quarters[2].rows.find((r) => r.id === "C");
  assert.equal(c.unwind, 0, "diagnosing C in Q1 avoids the unwind");
});

test("sim: funding a brand teaches you about it; ignoring it teaches nothing", () => {
  const p = S.emptyPlan(); p.trade.H = 60;
  const q = S.replay([p]).quarters[0];
  const H = q.rows.find((r) => r.id === "H"), B = q.rows.find((r) => r.id === "B");
  assert.ok(H.after.b > H.before.b + 0.3, "H is better than the team thinks, and funding it shows that");
  assert.ok(H.after.w > H.before.w, "confidence grows with evidence");
  assert.equal(B.after.b, B.before.b, "no money, no evidence");
});

test("sim: forecasts use beliefs, so they can be wrong in both directions", () => {
  const q = S.replay(S.habitPlans()).quarters[0];
  const misses = q.rows.map((r) => r.growth - r.growthF);
  assert.ok(misses.some((m) => m > 3) && misses.some((m) => m < -3), misses.join(", "));
});

test("sim: year-end review names every idea and only uses known statuses", () => {
  for (const plans of [S.habitPlans(), S.evidencePlans()]) {
    const R = S.review(plans);
    assert.equal(R.algorithms.length, 7);
    assert.ok(R.algorithms.every((a) => ["yes", "partly", "no"].includes(a.status) && a.why && !/undefined|NaN/.test(a.why)));
    assert.ok(R.tendencies.length >= 4 && R.tendencies.every((t) => !/undefined|NaN/.test(t.text)));
  }
  assert.equal(S.review(S.habitPlans()).algorithms.find((a) => a.idea === "Root-cause diagnosis").status, "no");
});
