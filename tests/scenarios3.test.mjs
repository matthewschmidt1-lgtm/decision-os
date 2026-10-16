import { test } from "node:test";
import assert from "node:assert/strict";
import { scenarios3, tracks3, challengeIds3, skills3, stages3, patterns3, families3, strengths3, values3, themes3, algorithmFor, books3, beforeQuestions } from "../js/scenarios3.js";
import { trackMark, summary, nextFor, valueReads } from "../js/manage-progress.js";

test("every Module 3 case has four options, one best, at least one good, and sound picks lean on a trade value", () => {
  scenarios3.forEach(s => {
    assert.equal(s.options.length, 4, s.id);
    assert.equal(s.options.filter(o => o.quality === "best").length, 1, s.id);
    assert.ok(s.options.some(o => o.quality === "good"), s.id + " needs a good option");
    assert.ok(s.options.every(o => ["best", "good", "weak"].includes(o.quality)), s.id);
    assert.ok(s.options.every(o => !o.pattern || patterns3[o.pattern]), s.id + " unknown pattern");
    assert.ok(s.options.every(o => !o.strength || strengths3[o.strength]), s.id + " unknown strength");
    assert.ok(Object.values(patterns3).every(p => families3[p.family]), "pattern family");
    assert.equal(s.trade.length, 2, s.id); s.trade.forEach(v => assert.ok(values3[v], `${s.id} value ${v}`));
    s.options.filter(o => o.quality !== "weak").forEach(o => assert.ok(s.trade.includes(o.leans), `${s.id} leans ${o.leans}`));
    assert.ok(s.options.some(o => o.quality === "weak" && o.cost), s.id + " one weak option carries a cost line");
    assert.ok(s.options.every(o => o.label.length <= 90), s.id + " label length");
    assert.ok(s.options.find(o => o.quality === "best").label.length <= 60, s.id + " strongest under 60");
    assert.ok(skills3[s.skill] && stages3.includes(s.stage) && themes3[s.theme], s.id + " skill/stage/theme");
    assert.ok(books3[s.lens[0]] && books3[s.tension[0]], s.id + " lens books");
    assert.ok(s.evidence.length >= 3 && s.evidence.length <= 4, s.id + " evidence rows");
    assert.ok(s.pause && s.voice && s.principle && s.then && s.nextMove, s.id + " fields");
  });
});

test("Module 3 pictures are drawable and point at a Learn lesson", () => {
  scenarios3.forEach(s => {
    const p = s.picture; assert.ok(p && algorithmFor[p.kind], s.id + " picture kind");
    const keys = p.marks.map(m => m[0]);
    if (p.kind !== "belief") ["A", "B", "C", "D"].forEach(k => assert.ok(keys.includes(k), `${s.id} mark ${k}`));
    else assert.ok(keys.includes("start") && keys.includes("e1"), s.id + " belief steps");
    p.marks.forEach(([k, v]) => assert.ok(v === null || (typeof v === "number" && v >= 0 && v <= 100), `${s.id} mark ${k} in range`));
    if (p.kind === "belief") { const last = p.marks.filter(([k]) => /^e\d$/.test(k)).at(-1); assert.ok(last[1] >= 40 && last[1] <= 60, s.id + " belief ends in the middle"); }
    assert.ok(p.after && p.after.split(" ").length <= 20, s.id + " after caption");
  });
});

test("Module 3: the five before-the-meeting questions each sit on at least three cases", () => {
  assert.equal(beforeQuestions.length, 5);
  const withQ = scenarios3.filter(s => s.before);
  withQ.forEach(s => assert.ok(Number.isInteger(s.before) && s.before >= 1 && s.before <= 5, s.id + " before"));
  for (let n = 1; n <= 5; n++) assert.ok(withQ.filter(s => s.before === n).length >= 3, `question ${n} on 3+ cases`);
  assert.ok(withQ.length >= 12 && withQ.length <= 20, "about half the cases");
});

test("Module 3 tracks cover every case exactly once and the challenge resolves", () => {
  const ids = scenarios3.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length, "unique ids");
  ids.forEach(id => assert.equal(tracks3.filter(t => t.ids.includes(id)).length, 1, id + " in one track"));
  tracks3.forEach(t => t.ids.forEach(id => assert.ok(ids.includes(id), `${t.id} lists ${id}`)));
  tracks3.forEach(t => assert.ok(t.blurb, t.id + " blurb"));
  challengeIds3.forEach(id => assert.ok(ids.includes(id), "challenge " + id));
  Object.keys(families3).forEach(f => assert.ok(scenarios3.filter(s => s.options.some(o => o.pattern && patterns3[o.pattern].family === f)).length >= 3, f + " on offer in 3+ cases"));
});

test("Module 3 progress: two levels of credit, values read from sound picks, and the summary says less with less", () => {
  const R = {};
  assert.equal(summary(R).length, 0);
  const list = tracks3[0].ids.map(id => scenarios3.find(s => s.id === id));
  list.forEach((s, i) => { const o = s.options.find(x => x.quality === (i === 0 ? "weak" : i === 1 ? "good" : "best")); R[s.id] = { option: o.label, quality: o.quality, skill: s.skill, pattern: o.pattern, strength: o.strength, leans: o.leans, at: i }; });
  const m = trackMark(list, R);
  assert.ok(m.complete && !m.clean && /Complete/.test(m.text), m.text);
  assert.ok(/^Early read/.test(summary(R)[0]));
  assert.ok(nextFor(R) && !R[nextFor(R).id], "next is unplayed");
  const reads = valueReads(R);
  assert.ok(reads.every(v => v.leaned <= v.onTable && v.onTable >= 1));
  // a weak pick never counts toward a value
  assert.equal(reads.reduce((a, v) => a + v.onTable, 0), 2 * list.filter(s => R[s.id].quality !== "weak").length);
});
