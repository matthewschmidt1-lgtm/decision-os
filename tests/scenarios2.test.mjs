import { test } from "node:test";
import assert from "node:assert/strict";
import { scenarios2, tracks2, challengeIds2, skills2, stages, patterns, families, strengths } from "../js/scenarios2.js";
import { milestones, tierOf, trackMark, challenge2List, nextFor } from "../js/sell-progress.js";

test("every Module 2 scenario has four options with exactly one best", () => {
  scenarios2.forEach(s => {
    assert.equal(s.options.length, 4, s.id);
    assert.equal(s.options.filter(o => o.quality === "best").length, 1, s.id);
    assert.ok(s.options.every(o => ["best", "good", "weak"].includes(o.quality)), s.id);
    assert.ok(s.options.every(o => !o.pattern || patterns[o.pattern]), s.id + " unknown pattern");
    assert.ok(!s.options.find(o => o.quality === "best").pattern, s.id + " best option carries a habit");
  });
});
test("Module 2 ids are unique and every scenario sits in exactly one track", () => {
  const ids = scenarios2.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length);
  scenarios2.forEach(s => assert.equal(tracks2.filter(t => t.ids.includes(s.id)).length, 1, s.id));
  tracks2.forEach(t => t.ids.forEach(id => assert.ok(ids.includes(id), id)));
  challengeIds2.forEach(id => assert.ok(ids.includes(id), id));
});
test("Module 2 skills and stages are valid and the best answer position is balanced", () => {
  scenarios2.forEach(s => { assert.ok(skills2[s.skill], s.id); assert.ok(stages.includes(s.stage), s.id); });
  const pos = [0, 0, 0, 0];
  scenarios2.forEach(s => pos[s.options.findIndex(o => o.quality === "best")]++);
  assert.ok(Math.max(...pos) - Math.min(...pos) <= 2, "best positions " + pos.join("/"));
});
test("every habit rolls up to a family (except the compliance note) and every best option names a strength", () => {
  Object.entries(patterns).forEach(([k, p]) => { if (k !== "comply") assert.ok(families[p.family], k + " family"); });
  scenarios2.forEach(s => { const b = s.options.find(o => o.quality === "best"); assert.ok(strengths[b.strength], s.id + " strength"); });
  Object.values(skills2).forEach(sk => { assert.ok(sk.strong && sk.watch, sk.name + " behavior lines"); });
});
test("Module 2: compliance options are weak, follow-ons exist, and progression computes from empty and full results", () => {
  scenarios2.forEach(s => { s.options.forEach(o => { if (o.pattern === "comply") assert.equal(o.quality, "weak", s.id); }); assert.ok(s.then, s.id + " then"); if (s.follows) assert.ok(scenarios2.find(x => x.id === s.follows), s.id + " follows"); });
  const empty = milestones({}); assert.equal(empty.length, 9); assert.ok(empty.every(m => !m.earned));
  assert.equal(tierOf({}).name, null);
  const perfect = Object.fromEntries(scenarios2.map(s => [s.id, { option: s.options.find(o => o.quality === "best").label, quality: "best", skill: s.skill, pattern: null, at: 1 }]));
  assert.equal(tierOf(perfect).name, "Gold");
  const got = milestones(perfect).filter(m => m.earned).map(m => m.id);
  ["asks", "hears", "trade", "date", "shelf", "straight", "five"].forEach(id => assert.ok(got.includes(id), id));
  assert.ok(trackMark(scenarios2.filter(tracks2[0].filter), perfect).clean);
  assert.ok(challenge2List({}).length === 5 && nextFor({}));
});
