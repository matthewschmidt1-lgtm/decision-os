// Module 3 progression. Two levels of credit and no headline percent: a best or good pick is "sound", and "strongest"
// counts best only. A replay never changes the first try; a weak first try is "fixed" when a replay is sound. The summary
// speaks in words, each line only when there is enough to say: the values you reach for, the habits that show up under
// pressure, and what the strongest answer added when you picked a good one. Everything is computed from stored results.
import { scenarios3, scenario3ById, skills3, tracks3, challengeIds3, qualityScore3, patterns3, families3, strengths3, values3 } from "./scenarios3.js";

export const RANK = { weak: 0, good: 1, best: 2 };
export const sound = (q) => q === "best" || q === "good";
export const isFixed = (r) => !!r && r.quality === "weak" && sound(r.replay);

// Each stored result against the current data (by option label), so retagging later still applies to saved picks.
export function resolve(R) {
  return Object.entries(R).map(([id, r]) => {
    const sc = scenario3ById[id]; const o = sc?.options.find((x) => x.label === r.option);
    return { id, quality: r.quality, skill: sc?.skill || r.skill, pattern: o ? o.pattern : r.pattern, strength: o ? o.strength : r.strength, leans: o ? o.leans : r.leans, at: r.at || 0, sc, o };
  }).filter((x) => x.sc);
}

// How a track went. Clean: every first try sound. Fixed: every weak first try fixed on replay. Else complete.
export function trackMark(list, R) {
  const done = list.filter((s) => R[s.id]).length, strongest = list.filter((s) => R[s.id]?.quality === "best").length;
  const weak = list.filter((s) => R[s.id]?.quality === "weak"), fixedN = weak.filter((s) => isFixed(R[s.id])).length;
  const complete = done === list.length;
  const text = !complete ? `${done} of ${list.length} completed`
    : weak.length === 0 ? `Clean · ${strongest} of ${list.length} strongest`
    : fixedN === weak.length ? `Fixed · ${strongest} of ${list.length} strongest`
    : `Complete · ${strongest} of ${list.length} strongest`;
  return { done, strongest, fixed: fixedN, complete, clean: complete && weak.length === 0, text };
}

// Per skill: plays and the share of sound first tries.
export function skillRead(R) {
  const out = {};
  Object.keys(skills3).forEach((k) => {
    const xs = scenarios3.filter((s) => s.skill === k && R[s.id]);
    const soundN = xs.filter((s) => sound(R[s.id].quality)).length, strongest = xs.filter((s) => R[s.id].quality === "best").length;
    out[k] = { n: xs.length, sound: soundN, strongest, share: xs.length ? Math.round((soundN / xs.length) * 100) : null };
  });
  return out;
}
export const label = (b) => (b.n === 0 ? "—" : b.n < 3 ? "Early" : `${b.sound} of ${b.n} sound`);
export function weakestSkill(R) {
  const ranked = Object.entries(skillRead(R)).filter(([, v]) => v.n >= 3).sort((a, b) => a[1].share - b[1].share || a[1].strongest - b[1].strongest);
  return ranked.length ? ranked[0][0] : null;
}
export function revisitList(R) { return scenarios3.filter((s) => R[s.id]?.quality === "weak" && !isFixed(R[s.id])); }
// The next case worth playing: unplayed in the weakest skill first, then any unplayed, then a Revisit.
export function nextFor(R) {
  const weak = weakestSkill(R);
  return (weak && scenarios3.find((s) => s.skill === weak && !R[s.id])) || scenarios3.find((s) => !R[s.id]) || revisitList(R)[0] || null;
}
export function nextUnplayed(list = scenarios3, R) { const r = R || {}; return list.find((s) => !r[s.id]) || null; }
export function nextUnplayedAfter(currentId, R, list = scenarios3) {
  const i = list.findIndex((s) => s.id === currentId);
  for (let k = 1; k <= list.length; k++) { const s = list[(i + k) % list.length]; if (!R[s.id] && s.id !== currentId) return s; }
  return null;
}

// The values you reach for: for each value, the sound picks in cases where it was on the table, and how often you leaned on it.
export function valueReads(R) {
  const rs = resolve(R).filter((x) => sound(x.quality) && x.o);
  const tally = {};
  rs.forEach((x) => x.sc.trade.forEach((v) => { tally[v] = tally[v] || { onTable: 0, leaned: 0 }; tally[v].onTable++; if (x.leans === v) tally[v].leaned++; }));
  return Object.entries(tally).map(([v, t]) => ({ key: v, name: values3[v] || v, ...t, share: t.leaned / t.onTable })).sort((a, b) => b.share - a.share || b.onTable - a.onTable);
}
// Habits under pressure: families of weak picks, most frequent first.
export function habits(R) {
  const rs = resolve(R); const fam = {}; let tagged = 0;
  rs.forEach((x) => { const p = x.pattern && patterns3[x.pattern]; if (p && p.family) { tagged++; fam[p.family] = fam[p.family] || { n: 0 }; fam[p.family].n++; } });
  const list = Object.entries(fam).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => ({ key: k, n: v.n, ...families3[k] }));
  return Object.assign(list, { tagged, played: rs.length });
}
// What the strongest added: in cases where you picked a good option, the best option's strength.
export function strongestAdds(R) {
  const st = {};
  resolve(R).filter((x) => x.quality === "good").forEach((x) => { const b = x.sc.options.find((o) => o.quality === "best"); if (b?.strength) st[b.strength] = (st[b.strength] || 0) + 1; });
  return Object.entries(st).sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ key: k, n, ...strengths3[k] }));
}

const MIN_PLAYED = 5, MIN_VALUE = 3, MIN_HABIT = 3, HABIT_SHARE = 0.3, HABIT_LEAD = 1, MIN_ADD = 3;
const lc = (t) => t.charAt(0).toLowerCase() + t.slice(1);
export function summary(R) {
  const rs = resolve(R); const played = rs.length;
  if (!played) return [];
  if (played < MIN_PLAYED) return [`Early read: ${played} of ${MIN_PLAYED} cases. After five, this panel names the values you reach for.`];
  const lines = [];
  const vals = valueReads(R).filter((v) => v.onTable >= MIN_VALUE);
  if (vals.length >= 2 && vals[0].share > vals[vals.length - 1].share) {
    const hi = vals[0], lo = vals[vals.length - 1];
    lines.push(`When ${lc(hi.name)} was on the table you chose it in ${hi.leaned} of ${hi.onTable}; ${lc(lo.name)} in ${lo.leaned} of ${lo.onTable}.`);
  } else if (vals.length >= 1) lines.push(`When ${lc(vals[0].name)} was on the table you chose it in ${vals[0].leaned} of ${vals[0].onTable}.`);
  const hb = habits(R); const top = hb[0], second = hb[1];
  const qualifies = top && top.n >= MIN_HABIT && top.n >= hb.tagged * HABIT_SHARE;
  if (qualifies && second && second.n === top.n) lines.push(`Under pressure, two habits tie: ${lc(top.name)} and ${lc(second.name)}, ${top.n} times each. ${top.coach}`);
  else if (qualifies && (!second || top.n - second.n >= HABIT_LEAD)) lines.push(`Under pressure, the habit that shows up most: ${lc(top.name)}, ${top.n} times. ${top.coach}`);
  const adds = strongestAdds(R);
  if (adds.length && adds[0].n >= MIN_ADD) lines.push(`When you picked a good answer, the strongest usually added: ${lc(adds[0].name)}.`);
  if (lines.length === 0) lines.push("No single value or habit stands out yet. Keep going; the read sharpens with every case.");
  return lines;
}

// Challenge: the five named cases, then unplayed, then Revisits.
export function challengeList(R) {
  const out = [];
  const add = (ids) => ids.forEach((id) => { if (out.length < 5 && !out.includes(id)) out.push(id); });
  add(challengeIds3.filter((id) => !R[id])); add(scenarios3.filter((s) => !R[s.id]).map((s) => s.id)); add(revisitList(R).map((s) => s.id));
  return out;
}
export { qualityScore3, tracks3 };
