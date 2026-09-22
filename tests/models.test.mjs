import { test } from "node:test";
import assert from "node:assert/strict";
import * as M from "../js/models.js";

test("marginal contribution declines with spend and crosses zero at the optimum", () => {
  const p = { vmax: 1200, k: 60, unitMargin: 0.11 };
  const opt = M.optimalSpend(p);
  assert.ok(M.marginalContribution(opt - 10, p) > 0);
  assert.ok(M.marginalContribution(opt + 10, p) < 0);
  assert.ok(Math.abs(M.marginalContribution(opt, p)) < 0.02);
  assert.ok(M.marginalContribution(20, p) > M.marginalContribution(40, p));
});
test("promoScenario: increasing spend raises volume but past optimum lowers contribution", () => {
  const up = M.promoScenario(60);
  assert.ok(up.volumePct > 0);
  assert.ok(up.contributionPct < 0);
});
test("utilityRank respects the objective", () => {
  const opts = [{ name: "Hold", volume: 3, margin: -1, revenue: 2.5 }, { name: "Rebalance", volume: 5, margin: 1.4, revenue: 3.8 }, { name: "Cut", volume: 1, margin: 2.6, revenue: 0.8 }];
  assert.equal(M.utilityRank(opts, { volume: 100, revenue: 0, margin: 0 })[0].name, "Rebalance");
  assert.equal(M.utilityRank(opts, { volume: 0, revenue: 0, margin: 100 })[0].name, "Cut");
});
test("allocateHours sums to the budget and rewards uncertainty when exploring", () => {
  const arms = [{ id: "a", mean: 0.8, n: 100, sd: 0.1 }, { id: "b", mean: 0.6, n: 5, sd: 0.5 }];
  const total = (c) => M.allocateHours(arms, 10, c).reduce((s, x) => s + x.hours, 0);
  assert.ok(Math.abs(total(1) - 10) < 0.2);
  const exploit = M.allocateHours(arms, 10, 0).find(x => x.id === "b").hours;
  const explore = M.allocateHours(arms, 10, 2.5).find(x => x.id === "b").hours;
  assert.ok(explore > exploit);
});
test("bayesUpdate moves belief in the direction of the evidence and ignores toggled-off items", () => {
  const steps = M.bayesUpdate(0.35, [{ name: "e1", lr: 2 }, { name: "e2", lr: 0.5, on: false }]);
  assert.equal(steps.length, 2);
  assert.ok(steps[1].p > 0.35);
  assert.ok(Math.abs(steps[1].p - (0.7 / 1.35)) < 1e-9);
});
test("expected value ranks the likely small over the unlikely large", () => {
  const r = M.rankByEV([{ id: "big", p: 0.18, value: 95000, cost: 6000 }, { id: "small", p: 0.84, value: 21000, cost: 1500 }]);
  assert.equal(r[0].id, "small");
});
test("evaluateTree rolls back expected value", () => {
  const t = M.evaluateTree({ label: "root", branches: [{ p: 0.5, node: { action: "A" } }, { p: 0.5, node: { action: "B" } }] }, { A: 10, B: 0 });
  assert.equal(t.value, 5);
});
test("valueOfInformation: EVPI is non-negative and diagnostics never exceed it", () => {
  const causes = [{ id: "x", p: 0.5 }, { id: "y", p: 0.5 }];
  const actions = { doX: { x: 10, y: -5 }, doY: { x: -5, y: 10 } };
  const r = M.valueOfInformation(causes, actions, [{ name: "learn x", resolves: ["x"], cost: 1 }]);
  assert.equal(r.now.ev, 2.5);
  assert.equal(r.evpi, 7.5);
  assert.ok(r.diagnostics[0].value <= r.evpi + 1e-9);
  assert.equal(r.diagnostics[0].value, 7.5);
});
test("fingerprint: sales compounds volume and price", () => {
  const f = M.fingerprint({ volume: 5, price: 3, tradeSpend: 14 });
  assert.equal(f.sales, 8.2);
});
