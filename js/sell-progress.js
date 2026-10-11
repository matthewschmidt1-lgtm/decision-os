// Module 2 progression: what a rep earns for playing well. First tries are the score; replays can "fix" a case; milestones
// are named for selling behaviors; the level mirrors Portfolio's tiers. Everything is computed from stored results.
import { scenarios2, scenario2ById, skills2, tracks2, challengeIds2, qualityScore2, patterns } from "./scenarios2.js";

export const RANK = { weak: 0, good: 1, best: 2 };
export const isFixed = (r) => !!r && r.quality !== "best" && r.replay === "best";
const byTrack = (id) => scenarios2.filter(tracks2.find((t) => t.id === id).filter);
const bestOn = (list, R) => list.filter((s) => R[s.id]?.quality === "best").length;
const playedOn = (list, R) => list.filter((s) => R[s.id]).length;
const hasComply = (s) => s.options.some((o) => o.pattern === "comply");
const pickedComply = (s, R) => { const r = R[s.id]; return !!r && s.options.find((o) => o.label === r.option)?.pattern === "comply"; };

// How a track went: played, strongest on first try, and whether it is clean or fixed.
export function trackMark(list, R) {
  const done = playedOn(list, R), strongest = bestOn(list, R), fixedN = list.filter((s) => isFixed(R[s.id])).length;
  const complete = done === list.length;
  const text = !complete ? `${done} of ${list.length} completed`
    : strongest === list.length ? "Clean: all strongest on first try"
    : strongest + fixedN === list.length ? "Fixed: all strongest after replay"
    : `Complete · ${strongest} of ${list.length} strongest`;
  return { done, strongest, fixed: fixedN, complete, clean: complete && strongest === list.length, text };
}

// Skill scores from first tries: average quality, with the play count. Strong 80+, Solid 60+, else Watch, once three are played.
export function skillScores(R) {
  const out = {};
  Object.keys(skills2).forEach((k) => { const xs = scenarios2.filter((s) => s.skill === k && R[s.id]); out[k] = { n: xs.length, score: xs.length ? Math.round(xs.reduce((a, s) => a + qualityScore2[R[s.id].quality], 0) / xs.length * 100) : null }; });
  return out;
}
export const label = (b) => (b.score == null ? "—" : b.n < 3 ? "Early" : b.score >= 80 ? "Strong" : b.score >= 60 ? "Solid" : "Watch");
export function weakestSkill(R) {
  const sc = skillScores(R); const ranked = Object.entries(sc).filter(([, v]) => v.n >= 3).sort((a, b) => a[1].score - b[1].score);
  return ranked.length ? ranked[0][0] : null;
}
// The next case worth playing: unplayed in the weakest skill first, then any unplayed, then a Revisit.
export function nextFor(R) {
  const weak = weakestSkill(R);
  return (weak && scenarios2.find((s) => s.skill === weak && !R[s.id])) || scenarios2.find((s) => !R[s.id]) || revisitList(R)[0] || null;
}
export function revisitList(R) {
  return scenarios2.filter((s) => R[s.id] && R[s.id].quality !== "best" && !isFixed(R[s.id])).sort((a, b) => RANK[R[a.id].quality] - RANK[R[b.id].quality]);
}
// Challenge, round 2: five cases from the weakest skill and the named habit, unplayed first, then Revisits.
export function challenge2List(R) {
  const weak = weakestSkill(R), out = [];
  const add = (list) => list.forEach((s) => { if (out.length < 5 && !out.includes(s.id)) out.push(s.id); });
  if (weak) add(scenarios2.filter((s) => s.skill === weak && !R[s.id]));
  add(scenarios2.filter((s) => !R[s.id]));
  add(revisitList(R));
  return out;
}

// Habit broken: a family was named (three or more picks) and the last four tagged picks where it was on offer avoided it.
function habitBroken(R) {
  const rows = Object.entries(R).map(([id, r]) => ({ id, r, sc: scenario2ById[id] })).filter((x) => x.sc).sort((a, b) => (a.r.at || 0) - (b.r.at || 0));
  const fam = {}; rows.forEach(({ r }) => { const f = r.pattern && patterns[r.pattern]?.family; if (f) fam[f] = (fam[f] || 0) + 1; });
  for (const [f, n] of Object.entries(fam)) {
    if (n < 3) continue;
    const offer = rows.filter(({ sc }) => sc.options.some((o) => o.pattern && patterns[o.pattern]?.family === f));
    const last = offer.slice(-4);
    if (last.length === 4 && last.every(({ r }) => !(r.pattern && patterns[r.pattern]?.family === f))) return { family: f, n: offer.length - 4 };
  }
  return null;
}
const familyName = (f) => ({ concede: "Giving without getting", tell: "Telling before asking", noask: "Not asking for the next step", buck: "Passing the problem on", link: "Fixing the wrong link" })[f] || f;

export const MILESTONES = [
  { id: "asks", name: "Asks first", hint: "Strongest move in every Discover conversation.", copy: "You asked before you answered, five meetings running.", test: (R) => trackMark(byTrack("discover"), R).clean },
  { id: "hears", name: "Hears the real objection", hint: "Strongest move in six of the eight Objection conversations.", copy: "You found out what it meant before you answered it.", test: (R) => bestOn(byTrack("objections"), R) >= 6 },
  { id: "trade", name: "Gets something back", hint: "Strongest move in every Give to get conversation.", copy: "Every give bought something you can name.", test: (R) => trackMark(byTrack("negotiate"), R).clean },
  { id: "date", name: "Leaves with a date", hint: "Strongest move in every Close conversation.", copy: "Every meeting ended with a decision or a date.", test: (R) => trackMark(byTrack("close"), R).clean },
  { id: "shelf", name: "Follows it to the shelf", hint: "Strongest move in every Make it happen conversation.", copy: "You didn't count a yes until the stores did.", test: (R) => trackMark(byTrack("execute"), R).clean },
  { id: "straight", name: "Plays it straight", hint: "Play every case with a compliance line, and never cross it.", copy: "You never traded anything for a placement.", test: (R) => { const cs = scenarios2.filter(hasComply); return cs.every((s) => R[s.id]) && cs.every((s) => !pickedComply(s, R)); } },
  { id: "five", name: "Five for five", hint: "The 5-minute challenge, all strongest on first try.", copy: "Five meetings, five strongest moves.", test: (R) => challengeIds2.every((id) => R[id]?.quality === "best") },
  { id: "broken", name: "Habit broken", hint: "Get a habit named, then keep it out of your next four picks where it was on offer.", copy: (R) => { const b = habitBroken(R); return b ? `${familyName(b.family)}: named after ${b.n} conversations, not seen since.` : "Named, then not seen since."; }, test: (R) => !!habitBroken(R) },
  { id: "rehearsed", name: "Rehearsed", hint: "Fix five Revisits on replay.", copy: "Five meetings you'd play differently now.", test: (R) => Object.values(R).filter(isFixed).length >= 5 },
];
export function milestones(R) { return MILESTONES.map((m) => ({ ...m, earned: m.test(R), copy: typeof m.copy === "function" ? m.copy(R) : m.copy })); }

// Your level, on first tries. Bronze: 15 played, half strongest. Silver: 24 played, two-thirds strongest, no skill on Watch.
// Gold: every case, four in five strongest, and no compliance line crossed.
export function tierOf(R) {
  const N = scenarios2.length, played = scenarios2.filter((s) => R[s.id]).length, strongest = bestOn(scenarios2, R);
  const sc = skillScores(R), watch = Object.values(sc).some((b) => b.n >= 3 && b.score < 60);
  const crossed = scenarios2.some((s) => pickedComply(s, R));
  const gold = played === N && strongest >= Math.ceil(N * 0.8) && !crossed;
  const silver = played >= 24 && strongest >= Math.ceil(played * 2 / 3) && !watch;
  const bronze = played >= 15 && strongest >= Math.ceil(played / 2);
  const name = gold ? "Gold" : silver ? "Silver" : bronze ? "Bronze" : null;
  const next = gold ? null : silver ? `Gold needs all ${N}, ${Math.ceil(N * 0.8)} strongest, and no compliance line crossed.` : bronze ? "Silver needs 24 played, two-thirds strongest, and no skill on Watch." : "Bronze needs 15 played, half of them the strongest move.";
  return { name, played, strongest, next, text: `${name ? `${name}. ` : ""}${strongest} of ${played} strongest.${next ? ` ${next}` : ""}` };
}
