import { h, link, arrow, eyebrow, bar, disclose } from "../ui.js";
import { scenarios, skills, tracks, challengeIds, qualityScore, levels } from "../scenarios.js";
import { allResults } from "../store.js";
import { setMeta, navigate } from "../app.js";

export function progress() {
  const r = allResults();
  const done = Object.keys(r).length;
  const bySkill = Object.fromEntries(Object.keys(skills).map(k => {
    const xs = Object.values(r).filter(x => x.skill === k);
    return [k, { n: xs.length, score: xs.length ? Math.round((xs.reduce((a, x) => a + qualityScore[x.quality], 0) / xs.length) * 100) : null }];
  }));
  const practiced = Object.values(bySkill).filter(s => s.n > 0).length;
  return { done, total: scenarios.length, bySkill, practiced, results: r };
}
// Next scenario not yet played, or null when the list is complete.
export function nextUnplayed(list = scenarios) { const r = allResults(); return list.find(s => !r[s.id]) || null; }
// Next unplayed scenario after `currentId`, wrapping around; null when everything is done.
export function nextUnplayedAfter(currentId, list = scenarios) {
  const r = allResults(); const i = list.findIndex(s => s.id === currentId);
  for (let k = 1; k <= list.length; k++) { const s = list[(i + k) % list.length]; if (!r[s.id] && s.id !== currentId) return s; }
  return null;
}

export default function Practice() {
  setMeta({ title: "Practice", description: "Practice the decisions you make in the field. Short CPG cases, immediate feedback, and the reasoning underneath." });
  const p = progress();
  const next = nextUnplayed();
  const allDone = !next;
  const primary = p.done === 0
    ? { eyebrow: "Start here", title: "5-minute challenge", body: "Five cases: a declining account, a promo request, a distributor loading up, a buyer objection, and where to spend your next hour.", href: `/practice/${challengeIds[0]}?set=challenge&i=0`, cta: "Start" }
    : allDone
      ? { eyebrow: "All done", title: `You've completed all ${p.total} scenarios.`, body: "Replay any of them below. Replays don't change your scores, so use them to rehearse before a real meeting.", href: "/practice/summary", cta: "See your results" }
      : { eyebrow: "Continue", title: next.situation, body: `${next.customer} · ${next.level} · ${skills[next.skill].name}`, href: `/practice/${next.id}`, cta: "Continue" };

  const setCard = (title, blurb, list, href) => {
    const done = list.filter(s => p.results[s.id]).length; const complete = done === list.length;
    return link(href, h("span", { class: "card clickable reveal", style: { display: "flex", flexDirection: "column", height: "100%" } },
      h("h3", {}, title), h("p", { class: "muted", style: { marginTop: "6px", flex: 1 } }, blurb),
      h("p", { class: "tag", style: { marginTop: "16px" } }, complete ? `Complete · ${list.length} of ${list.length}` : `${done} of ${list.length} completed`)));
  };
  const challengeList = challengeIds.map(id => scenarios.find(s => s.id === id));

  return h("div", {},
    h("section", { class: "reveal" }, eyebrow("Practice"), h("h1", { class: "hero", style: { marginTop: "16px" } }, "Practice the decisions you make in the field."),
      h("p", { class: "hero-sub" }, "Short cases with real, imperfect numbers. Two answers usually look right. You choose, then see the reasoning, the principle, and what to do on your next call.")),

    h("section", { class: "section reveal" },
      h("div", { class: "grid grid-2", style: { alignItems: "stretch" } },
        h("div", { class: "card", style: { display: "grid", gap: "12px", alignContent: "space-between" } },
          h("div", { class: "stack", style: { "--gap": "10px" } }, eyebrow(primary.eyebrow), h("h2", { style: { fontSize: "var(--fs-h3)" } }, primary.title), h("p", { class: "muted", style: { fontSize: "var(--fs-small)" } }, primary.body)),
          link(primary.href, h("span", { class: "btn btn-lg", style: { justifySelf: "start" } }, `${primary.cta} `, arrow()))),
        h("div", { class: "card card-sunk stack" },
          eyebrow(p.done ? `${p.done} of ${p.total} completed · ${p.practiced} of ${Object.keys(skills).length} skills practiced` : "Your training"),
          ...Object.entries(skills).map(([k, s]) => { const b = p.bySkill[k]; return bar(s.name, b.score ?? 0, 100, { tone: b.score == null ? "muted" : b.score >= 80 ? "good" : b.score >= 60 ? "" : "warn", format: v => b.score == null ? "—" : `${v}%` }); }),
          h("p", { class: "muted", style: { fontSize: "var(--fs-micro)", marginTop: "6px" } }, "Scores reflect how often you chose the strongest option. They're meant to show you improving, not to rank you.")))),

    h("section", { class: "section" },
      h("div", { class: "section-head reveal" }, h("div", {}, eyebrow("Or pick a set"), h("h2", { style: { marginTop: "10px" } }, "What do you want to get better at?"))),
      h("div", { class: "grid grid-3" },
        p.done ? setCard("5-minute challenge", "One case from each skill. The fastest way to see where you stand.", challengeList, `/practice/${challengeIds[0]}?set=challenge&i=0`) : null,
        ...tracks.map(t => { const list = scenarios.filter(t.filter); const first = nextUnplayed(list) || list[0]; return setCard(t.title, t.blurb, list, `/practice/${first.id}?set=${t.id}&i=${list.indexOf(first)}`); }))),

    h("section", { class: "section reveal" }, disclose(`All ${p.total} scenarios`, h("div", { class: "table-wrap" }, h("table", { class: "table" }, h("thead", {}, h("tr", {}, h("th", {}, "Customer"), h("th", {}, "Situation"), h("th", {}, "Level"), h("th", {}, "Skill"), h("th", { class: "num" }, "Result"))),
        h("tbody", {}, [...scenarios].sort((a, b) => levels.indexOf(a.level) - levels.indexOf(b.level)).map(s => { const r = p.results[s.id]; return h("tr", { class: "clickable", tabindex: "0", onClick: () => navigate(`/practice/${s.id}`), onKeydown: e => { if (e.key === "Enter") navigate(`/practice/${s.id}`); } },
          h("td", {}, h("b", { style: { fontWeight: 500 } }, s.customer)), h("td", { class: "muted" }, s.situation.split(". ")[0] + "."), h("td", {}, h("span", { class: "chip" }, s.level)), h("td", { class: "muted" }, skills[s.skill].name),
          h("td", { class: "num" }, r ? h("span", { class: `chip ${r.quality === "best" ? "chip-good" : r.quality === "good" ? "" : "chip-warn"}` }, r.quality === "best" ? "Strong" : r.quality === "good" ? "Reasonable" : "Revisit") : h("span", { class: "muted" }, "—"))); })))))),
  );
}
