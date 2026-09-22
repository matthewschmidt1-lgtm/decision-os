import { h, link, arrow, eyebrow, bar } from "../ui.js";
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
export function nextUnplayed(list = scenarios) { const r = allResults(); return list.find(s => !r[s.id]) || list[0]; }

export default function Practice() {
  setMeta({ title: "Practice", description: "Practice the decisions you make in the field. Short CPG cases, immediate feedback, and the reasoning underneath." });
  const p = progress();
  const next = nextUnplayed();
  return h("div", {},
    h("section", { class: "reveal" }, eyebrow("Practice"), h("h1", { class: "hero", style: { marginTop: "16px" } }, "Practice the decisions you make in the field."),
      h("p", { class: "hero-sub" }, "Short cases with real, imperfect numbers. Two answers usually look right. You choose, then see the reasoning, the principle, and what to do on your next call.")),

    h("section", { class: "section reveal" }, h("div", { class: "card", style: { display: "grid", gap: "24px", gridTemplateColumns: "1fr auto", alignItems: "center" } },
      h("div", {}, eyebrow("You've got 5 minutes. Let's practice."), h("h2", { style: { marginTop: "10px" } }, "5-minute challenge"),
        h("p", { class: "muted", style: { marginTop: "8px" } }, "Five cases across diagnosis, trade economics, distributors, a buyer objection, and where to spend your next hour.")),
      link(`/practice/${challengeIds[0]}?set=challenge&i=0`, h("span", { class: "btn btn-lg" }, "Start ", arrow())))),

    h("section", { class: "section" },
      h("div", { class: "section-head reveal" }, h("div", {}, eyebrow("Your training"), h("h2", { style: { marginTop: "10px" } }, p.done ? `${p.done} of ${p.total} scenarios completed` : "Nothing completed yet. That changes in two minutes.")),
        p.done ? h("p", { class: "muted" }, `${p.practiced} of ${Object.keys(skills).length} skills practiced`) : null),
      h("div", { class: "grid grid-2 reveal", style: { alignItems: "start" } },
        h("div", { class: "card card-sunk stack" }, ...Object.entries(skills).map(([k, s]) => { const b = p.bySkill[k]; return bar(s.name, b.score ?? 0, 100, { tone: b.score == null ? "muted" : b.score >= 80 ? "good" : b.score >= 60 ? "" : "warn", format: v => b.score == null ? "—" : `${v}%` }); }),
          h("p", { class: "muted", style: { fontSize: "var(--fs-micro)", marginTop: "6px" } }, "Scores reflect how often you chose the strongest option. They're meant to show you improving, not to rank you.")),
        h("div", { class: "card", style: { display: "grid", gap: "12px" } }, eyebrow("Continue"), h("p", { class: "tag" }, `${next.customer} · ${next.level}`), h("h3", {}, next.situation), h("p", { class: "muted", style: { fontSize: "var(--fs-small)" } }, `Skill: ${skills[next.skill].name}`), link(`/practice/${next.id}`, h("span", { class: "btn" }, "Start ", arrow()))))),

    h("section", { class: "section" },
      h("div", { class: "section-head reveal" }, h("div", {}, eyebrow("Choose a track"), h("h2", { style: { marginTop: "10px" } }, "What do you want to get better at?"))),
      h("div", { class: "grid grid-2" }, tracks.map(t => { const list = scenarios.filter(t.filter); const done = list.filter(s => p.results[s.id]).length; const first = nextUnplayed(list);
        return link(`/practice/${first.id}?set=${t.id}&i=${list.indexOf(first)}`, h("span", { class: "card clickable reveal", style: { display: "block" } }, h("h3", {}, t.title), h("p", { class: "muted", style: { marginTop: "6px" } }, t.blurb), h("p", { class: "tag", style: { marginTop: "16px" } }, `${done} / ${list.length} completed`))); }))),

    h("section", { class: "section" },
      h("div", { class: "section-head reveal" }, h("div", {}, eyebrow("All scenarios"), h("h2", { style: { marginTop: "10px" } }, "From recognizing a pattern to defending a recommendation."))),
      h("div", { class: "table-wrap reveal" }, h("table", { class: "table" }, h("thead", {}, h("tr", {}, h("th", {}, "Customer"), h("th", {}, "Situation"), h("th", {}, "Level"), h("th", {}, "Skill"), h("th", { class: "num" }, "Result"))),
        h("tbody", {}, [...scenarios].sort((a, b) => levels.indexOf(a.level) - levels.indexOf(b.level)).map(s => { const r = p.results[s.id]; return h("tr", { class: "clickable", tabindex: "0", onClick: () => navigate(`/practice/${s.id}`) , onKeydown: e => { if (e.key === "Enter") navigate(`/practice/${s.id}`); } },
          h("td", {}, h("b", { style: { fontWeight: 500 } }, s.customer)), h("td", { class: "muted" }, s.situation.split(". ")[0] + "."), h("td", {}, h("span", { class: "chip" }, s.level)), h("td", { class: "muted" }, skills[s.skill].name),
          h("td", { class: "num" }, r ? h("span", { class: `chip ${r.quality === "best" ? "chip-good" : r.quality === "good" ? "" : "chip-warn"}` }, r.quality === "best" ? "Strong" : r.quality === "good" ? "Reasonable" : "Revisit") : h("span", { class: "muted" }, "—"))); }))))),
  );
}
