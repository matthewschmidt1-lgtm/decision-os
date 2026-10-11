import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "../js/sim.js";
import { FIXTURES, canon } from "./fixtures.mjs";

// channelRead is the one read-only export added to the frozen engine. Its "on" read must be onRead exactly, in every
// state the game can reach; "off" and "days" use the same spread and confidence rules on their own beliefs.
const states = (vi) => {
  const out = [S.initialState(vi)];
  for (const fx of Object.values(FIXTURES)) if (fx.vi === vi) { const y = S.replay(fx.plans(), vi); out.push(...y.quarters.map((q) => q.stateBefore), y.state); }
  return out;
};

test("channelRead: the on-premise read deep-equals onRead for every brand, in both years and every reachable state", () => {
  for (const vi of [0, 1]) for (const st of states(vi)) for (const id of S.brandIds)
    assert.equal(canon(S.channelRead(st, id, "on")), canon(S.onRead(st, id)), `year ${vi}, Brand ${id}`);
});

test("channelRead: off-premise and field days read their own beliefs with the same shape", () => {
  for (const vi of [0, 1]) for (const st of states(vi)) for (const id of S.brandIds) for (const [ch, key] of [["off", "off"], ["days", "d"]]) {
    const r = S.channelRead(st, id, ch), bel = st.beliefs[id][key];
    assert.equal(Object.keys(r).sort().join(","), "b,conf,hi,lo", `${ch} shape`);
    assert.equal(r.b, bel.b, `year ${vi}, Brand ${id} ${ch} b`);
    assert.equal(r.conf, S.confidence(bel.w), `year ${vi}, Brand ${id} ${ch} confidence`);
    assert.ok(r.lo <= r.b && r.b <= r.hi && r.lo >= 0, `year ${vi}, Brand ${id} ${ch} range`);
  }
});

test("channelRead: a scout narrows the range on every channel of the scouted brand", () => {
  for (const vi of [0, 1]) {
    const q = S.replay(S.evidencePlans(vi).slice(0, 1), vi).quarters[0];
    for (const r of q.rows.filter((x) => x.finding)) for (const ch of ["on", "off", "days"]) {
      const a = S.channelRead({ beliefs: { [r.id]: r.before } }, r.id, ch), b = S.channelRead({ beliefs: { [r.id]: r.after } }, r.id, ch);
      assert.ok((b.hi - b.lo) / Math.max(b.b, 1e-9) < (a.hi - a.lo) / Math.max(a.b, 1e-9) + 1e-9, `year ${vi}, Brand ${r.id} ${ch}`);
    }
  }
});
