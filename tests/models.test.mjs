import { test } from "node:test";
import assert from "node:assert/strict";
import * as M from "../js/models.js";
import { brands, accounts, situation } from "../js/data.js";
import * as BI from "../js/brandInsights.js";

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
test("fingerprint: sales compounds volume and price, and bought growth shows negative margin", () => {
  const f = M.fingerprint({ volume: 5, price: 3, tradeSpend: 14 });
  assert.equal(f.sales, 8.2);
  const nw = M.fingerprint({ volume: 3, price: 8, tradeSpend: 21 });
  assert.ok(nw.sales > 10 && nw.margin < 0, `Northwest Market should show sales up, margin down: ${JSON.stringify(nw)}`);
});
test("bayes widget evidence lands above 50% for the Fresh Thyme case", () => {
  const steps = M.bayesUpdate(0.35, [{ name: "a", lr: 2.0 }, { name: "b", lr: 1.8 }, { name: "c", lr: 1.5 }, { name: "d", lr: 0.7 }]);
  assert.ok(steps.at(-1).p > 0.5);
});
test("money formats negatives with the sign first and keeps half-K precision", () => {
  assert.equal(M.money(-450), "−$450");
  assert.equal(M.money(1500), "$1.5K");
  assert.equal(M.money(-4000), "−$4K");
  assert.equal(M.money(21000), "$21K");
});
test("trade allocation: model never funds a dollar that returns less than a dollar, and beats spreading by revenue", () => {
  const model = M.allocateBudget(brands, 250), habit = M.allocateByRevenue(brands, 250);
  assert.ok(model.steps.every(s => s.ret > 1));
  assert.ok(model.net > habit.net);
  assert.ok(model.spent <= 250);
});
test("brand insights: numbers match the budget model and each rule fires only where the economics support it", () => {
  const byId = Object.fromEntries(brands.map(b => [b.id, b]));
  const D = BI.brandEconomics(byId.D);
  assert.ok(Math.abs(D.room - 212.9) < 0.5, `D room ${D.room}`);
  assert.ok(Math.abs(D.roomNet - 111.1) < 0.5, `D net ${D.roomNet}`);
  // Greedy allocation with an unlimited budget should fund D to within one $10K step of its $1 point
  const big = M.allocateBudget(brands, 2000);
  assert.ok(Math.abs(big.x.D - D.room) <= 10, `greedy ${big.x.D} vs room ${D.room}`);
  for (const b of brands) {
    const slugs = BI.brandInsights(b).map(i => i.slug);
    assert.ok(slugs.includes("optimization"));
    assert.equal(slugs.includes("value-of-information"), b.growth < 0);
    assert.equal(slugs.includes("utility-and-trade-offs"), b.growth > 0 && b.margin < 0);
    assert.equal(slugs.includes("prediction-vs-decision"), b.avgRoi >= 1 && b.r0 < 1);
    if (b.r0 <= 1) assert.equal(BI.brandEconomics(b).room, 0);
    const titles = BI.brandInsights(b).map(i => i.title);
    // Never recommend a move worth less than the materiality threshold
    const ec = BI.brandEconomics(b);
    if (titles.some(t => t.includes("fund it to the $1 point"))) assert.ok(ec.roomNet >= BI.MATERIAL_K);
    if (titles.some(t => t.includes("trim the weakest"))) assert.ok(ec.trimNet >= BI.MATERIAL_K);
    // Every number rendered as $K must not round to "$0K"
    for (const i of BI.brandInsights(b)) assert.ok(!/\$0K/.test(i.why), `${b.id}: ${i.why}`);
  }
  // Trimming to the $1 point: k·ln(1/r0) less spend, net k·ln(1/r0) − k(1 − r0)
  const B = BI.brandEconomics(byId.B);
  assert.ok(Math.abs(B.trim - 766.2) < 0.5 && Math.abs(B.trimNet - 166.2) < 0.5, `B trim ${B.trim} / ${B.trimNet}`);
  assert.ok(BI.brandEconomics(byId.B).overFunded && BI.brandEconomics(byId.K).overFunded && !BI.brandEconomics(byId.D).overFunded);
  assert.equal(BI.$k(0.28), "$280");
  assert.equal(BI.$k(2500), "$2.5M");
});

test("accounts roll up to the territory margin trend shown on the home page", () => {
  const simple = accounts.reduce((s, a) => s + a.margin, 0) / accounts.length;
  const weight = accounts.reduce((s, a) => s + a.value, 0);
  const weighted = accounts.reduce((s, a) => s + a.margin * a.value, 0) / weight;
  assert.ok(Math.abs(simple - situation.margin) < 0.1, `simple average ${simple.toFixed(2)}`);
  assert.ok(Math.abs(weighted - situation.margin) < 0.1, `weighted average ${weighted.toFixed(2)}`);
});

test("the Brand B shift range in the decision copy pays back on the model's own curves", () => {
  const [B, D, H] = ["B", "D", "H"].map(id => brands.find(b => b.id === id));
  const net = (x) => { let best = -Infinity; for (let y = 0; y <= x; y++) best = Math.max(best, M.tradeGain(D, y) + M.tradeGain(H, x - y)); return best + M.tradeGain(B, -x); };
  assert.ok(net(300) > 0 && net(500) > 0, "shifting $300–500K from B to D and H should add gross profit");
  assert.ok(net(400) > net(100) && net(400) > net(800), "the gain should peak inside the range");
});

