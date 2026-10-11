import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "../js/sim.js";
import { FIXTURES } from "./fixtures.mjs";

// Regression baseline for the Portfolio engine. Recorded on HEAD (cf2b127) before the Flight Deck work began, and frozen:
// the UI rebuild must never move these numbers. If one changes, the engine changed.
const B = {
  habit0: { gp: [6177.910613, 6227.8464, 6172.800365, 6271.012574], rev: [16704.283485, 16816.465868, 16657.667035, 16901.009464], score: 0, total: 24849.569952, carry: 0, borrowed: 0, tier: "none", ach: "mmmmmmg", alg: "nnnnnnpn", scouted: {}, scoutsLeft: 2 },
  habit1: { gp: [6212.379086, 6289.336211, 6172.324248, 6228.307608], rev: [16772.400737, 16955.864768, 16655.339827, 16825.182985], score: 0, total: 24902.347153, carry: 0, borrowed: 0, tier: "none", ach: "mmmmmmg", alg: "nnnnnnpn", scouted: {}, scoutsLeft: 2 },
  evidence0: { gp: [6214.069846, 6292.7643, 6497.060063, 6557.407874], rev: [16451.394436, 16931.263592, 17425.223397, 17470.144126], score: 816.723072, total: 25666.293024, carry: 104.990941, borrowed: 0, tier: "Gold", ach: "ggggggg", alg: "ynpyyyyy", scouted: { C: 0, H: 0 }, scoutsLeft: 0 },
  evidence1: { gp: [6266.990936, 6349.464697, 6476.31131, 6485.838091], rev: [16600.674794, 17094.019093, 17270.11676, 17377.912763], score: 771.924005, total: 25674.271158, carry: 95.666123, borrowed: 0, tier: "Gold", ach: "ggggggg", alg: "yppyyyyy", scouted: { F: 0, G: 0 }, scoutsLeft: 0 },
  mine0: { gp: [6198.717688, 6300.401551, 6517.226803, 6539.249228], rev: [16717.907157, 16967.322755, 17421.863333, 17384.330733], score: 792.464143, total: 25642.034094, carry: 86.438824, borrowed: 0, tier: "Gold", ach: "ggggmgg", alg: "ynyyypyy", scouted: { C: 0, H: 0 }, scoutsLeft: 0 },
  handB1: { gp: [6214.037059, 6304.795093, 6360.996761, 6539.668843], rev: [16776.348291, 16965.051244, 17071.317042, 17457.619447], score: 467.135683, total: 25369.482836, carry: 89.98508, borrowed: 140, tier: "Silver", ach: "ggggmgm", alg: "pnyyypnp", scouted: { F: 0, G: 1 }, scoutsLeft: 0 },
  handC0: { gp: [6205.240422, 6177.293441, 6160.945918, 6291.516099], rev: [16508.229261, 16508.856067, 16552.250958, 16938.875621], score: 5.536051, total: 24855.106003, carry: 20.110123, borrowed: 0, tier: "none", ach: "mmmmmgg", alg: "nnnnnnyn", scouted: { D: 0, E: 1 }, scoutsLeft: 0 },
};
const near = (a, b, what) => assert.ok(Math.abs(a - b) < 1e-6, `${what}: got ${a}, recorded ${b}`);

for (const [name, fx] of Object.entries(FIXTURES)) {
  test(`baseline: ${name} replays to the recorded year`, () => {
    const plans = fx.plans(), vi = fx.vi, b = B[name];
    const y = S.replay(plans, vi), R = S.review(plans, vi);
    y.quarters.forEach((q, i) => { near(q.gp, b.gp[i], `${name} Q${i + 1} gp`); near(q.rev, b.rev[i], `${name} Q${i + 1} rev`); });
    near(R.score, b.score, `${name} score`); near(R.you.total, b.total, `${name} total`); near(R.you.carry, b.carry, `${name} carry`); near(R.you.borrowed, b.borrowed, `${name} borrowed`);
    assert.equal(R.tier?.name || "none", b.tier, `${name} tier`);
    assert.equal(S.achievementStatus(plans, vi).map((a) => a.status[0]).join(""), b.ach, `${name} achievements`);
    assert.equal(R.algorithms.map((a) => a.status[0]).join(""), b.alg, `${name} algorithms`);
    assert.equal(JSON.stringify(y.state.scouted), JSON.stringify(b.scouted), `${name} scouted`);
    assert.equal(y.state.scoutsLeft, b.scoutsLeft, `${name} scouts left`);
    plans.forEach((p, qi) => { const t = S.planTotals(p, qi, vi); assert.ok(t.trade <= S.BUDGET.trade && t.days <= S.BUDGET.days, `${name} Q${qi + 1} over budget: ${JSON.stringify(t)}`); });
  });
}

test("baseline: tier thresholds are unchanged in both years", () => {
  assert.equal(S.tiers(0).map((t) => t.at).join(","), "250,500,750");
  assert.equal(S.tiers(1).map((t) => t.at).join(","), "250,450,700");
});
