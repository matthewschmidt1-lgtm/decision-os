import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "../js/sim.js";

const yearGP = (plans, vi) => S.replay(plans, vi).quarters.reduce((a, q) => a + q.gp, 0);

test("sim: the same decisions always produce the same year", () => {
  assert.equal(yearGP(S.habitPlans(0), 0), yearGP(S.habitPlans(0), 0));
});

test("sim: running last year's plan grows each brand at its stated rate (give or take noise)", () => {
  const q = S.replay(S.habitPlans(0), 0).quarters[0];
  for (const r of q.rows) if (r.id !== "C") assert.ok(Math.abs(r.growthF - S.simBrands(0).find((b) => b.id === r.id).growth) < 0.5, `${r.id} forecast ${r.growthF}`);
});

test("sim: in both years, following the evidence beats last year's plan and stays inside the budgets", () => {
  for (const vi of [0, 1]) {
    const plans = S.evidencePlans(vi);
    plans.forEach((p, qi) => { const t = S.planTotals(p, qi, vi); assert.ok(t.trade <= S.BUDGET.trade && t.days <= S.BUDGET.days, JSON.stringify(t)); });
    assert.ok(yearGP(plans, vi) > yearGP(S.habitPlans(vi), vi) + 400, `year ${vi}: a reassess-every-quarter strategy should find real value`);
    const R = S.review(plans, vi);
    assert.ok(R.tier, `year ${vi}: the evidence strategy should earn a tier`);
  }
});

test("sim: the broken brand's distributor unwind hits in Q3 unless its chain is scouted first", () => {
  for (const vi of [0, 1]) {
    const br = S.VARIANTS[vi].broken;
    const blind = S.replay(S.habitPlans(vi), vi).quarters[2].rows.find((r) => r.id === br);
    assert.ok(blind.unwind > 0, `year ${vi}: funding ${br} blind should end in an inventory unwind`);
    const early = S.habitPlans(vi); early[0] = { ...early[0], scout: [br] };
    assert.equal(S.replay(early, vi).quarters[2].rows.find((r) => r.id === br).unwind, 0, `year ${vi}: scouting ${br} in Q1 avoids the unwind`);
  }
});

test("sim: funding a channel teaches you about it; ignoring it teaches nothing", () => {
  const p = S.lastYearPlan(); p.trade.H = 80; p.trade.A = 90; p.focus.H = "on";
  const q = S.replay([p], 0).quarters[0];
  const H = q.rows.find((r) => r.id === "H");
  assert.ok(H.after.on.b > H.before.on.b + 0.3, "H is far better on-premise than the team thinks, and funding it there shows that");
  assert.equal(H.after.off.b, H.before.off.b, "no off-premise money, no off-premise evidence");
});

test("sim: cutting a big brand below its shelf floor costs base volume", () => {
  const cut = S.lastYearPlan(); cut.trade.B = 0;
  const q = S.replay([cut], 0).quarters[0], base = S.replay([S.lastYearPlan()], 0).quarters[0];
  const b = q.rows.find((r) => r.id === "B"), b0 = base.rows.find((r) => r.id === "B");
  assert.ok(b.rev < b0.rev, "B loses revenue when its shelf support goes");
});

test("sim: the year-end load-in helps this year and costs next year", () => {
  const plans = S.habitPlans(0); plans[3] = { ...plans[3], answer: "take" };
  const R = S.review(plans, 0), H = S.review(S.habitPlans(0), 0);
  assert.ok(R.you.gp > H.you.gp, "the load-in lifts this year's gross profit");
  assert.ok(R.you.borrowed > 0 && R.score < R.you.gp - H.you.gp, "but the score counts what it takes from next year");
});

test("sim: year-end review is complete and never prints undefined", () => {
  for (const vi of [0, 1]) for (const plans of [S.habitPlans(vi), S.evidencePlans(vi)]) {
    const R = S.review(plans, vi);
    assert.equal(R.algorithms.length, 8);
    assert.ok(R.algorithms.every((a) => ["yes", "partly", "no"].includes(a.status) && a.why && !/undefined|NaN/.test(a.why + a.next)));
    assert.ok(R.tendencies.every((t) => !/undefined|NaN/.test(t.text)));
    assert.equal(R.achievements.length, 7);
  }
  assert.equal(S.review(S.habitPlans(0), 0).score, 0);
});
