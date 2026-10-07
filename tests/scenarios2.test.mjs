import { test } from "node:test";
import assert from "node:assert/strict";
import { scenarios2, tracks2, challengeIds2, skills2, stages, patterns } from "../js/scenarios2.js";

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
