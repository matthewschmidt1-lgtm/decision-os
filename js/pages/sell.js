import { h, link, arrow, eyebrow, bar } from "../ui.js";
import { gatedDisclose } from "../gate.js";
import { scenarios2, skills2, tracks2, challengeIds2, qualityScore2, stages } from "../scenarios2.js";
import { allResults2 } from "../store.js";
import { setMeta, navigate } from "../app.js";

export function progress2() {
  const r = allResults2();
  const done = Object.keys(r).filter(id => scenarios2.some(s => s.id === id)).length;
  const bySkill = Object.fromEntries(Object.keys(skills2).map(k => {
    const xs = Object.values(r).filter(x => x.skill === k);
    return [k, { n: xs.length, score: xs.length ? Math.round((xs.reduce((a, x) => a + qualityScore2[x.quality], 0) / xs.length) * 100) : null }];
  }));
  const practiced = Object.values(bySkill).filter(s => s.n > 0).length;
  return { done, total: scenarios2.length, bySkill, practiced, results: r };
}
export function nextUnplayed2(list = scenarios2) { const r = allResults2(); return list.find(s => !r[s.id]) || null; }
export function nextUnplayedAfter2(currentId, list = scenarios2) {
  const r = allResults2(); const i = list.findIndex(s => s.id === currentId);
  for (let k = 1; k <= list.length; k++) { const s = list[(i + k) % list.length]; if (!r[s.id] && s.id !== currentId) return s; }
  return null;
}

export default async function Sell() {
  setMeta({ title: "Module 2 · Conversation", description: "Practice the selling conversation: discover, handle the objection, make the case, negotiate, close, and make it happen." });
  const { habitSummary } = await import("./sell-scenario.js");
  const p = progress2();
  const next = nextUnplayed2();
  const allDone = !next;
  const primary = p.done === 0
    ? { eyebrow: "Start here", title: "5-minute challenge", body: "Five conversations: a buyer who says you're not moving, one who says you're too expensive, an offer of ten stores for more trade, a 'send me the information', and an authorization that never reached the shelf.", href: `/sell/${challengeIds2[0]}?set=challenge&i=0`, cta: "Start" }
    : allDone
      ? { eyebrow: "All done", title: `You've completed all ${p.total} conversations.`, body: "Replay any of them below. Replays don't change your scores, so use them to rehearse before a real meeting.", href: "/sell/summary", cta: "See your results" }
      : { eyebrow: "Continue", title: next.buyer ? `“${next.buyer}”` : next.situation, body: `${next.customer} · ${next.stage} · ${skills2[next.skill].name}`, href: `/sell/${next.id}`, cta: "Continue" };

  const setCard = (title, blurb, list, href) => {
    const done = list.filter(s => p.results[s.id]).length; const complete = done === list.length;
    return link(href, h("span", { class: "card clickable reveal", style: { display: "flex", flexDirection: "column", height: "100%" } },
      h("h3", {}, title), h("p", { class: "muted", style: { marginTop: "6px", flex: 1 } }, blurb),
      h("p", { class: "tag", style: { marginTop: "16px" } }, complete ? `Complete · ${list.length} of ${list.length}` : `${done} of ${list.length} completed`)));
  };
  const challengeList = challengeIds2.map(id => scenarios2.find(s => s.id === id));
  const lines = habitSummary(p.results);

  return h("div", {},
    h("section", { class: "reveal" }, eyebrow("Practice · Module 2 · Conversation"), h("h1", { class: "hero", style: { marginTop: "16px" } }, "You know the right call. Now get the customer to act on it."),
      h("p", { class: "hero-sub" }, "Module 1 trained the judgment: what should I do? This module trains the conversation: what do I say, what do I ask, what do I give, and what do I get. Same short cases. This time the buyer talks back."),
      h("p", { style: { marginTop: "14px" } }, link("/practice", h("span", { class: "link" }, "Module 1 · Judgment ", arrow())))),

    h("section", { class: "section reveal" },
      h("div", { class: "grid grid-2", style: { alignItems: "stretch" } },
        h("div", { class: "card", style: { display: "grid", gap: "12px", alignContent: "space-between" } },
          h("div", { class: "stack", style: { "--gap": "10px" } }, eyebrow(primary.eyebrow), h("h2", { style: { fontSize: "var(--fs-h3)" } }, primary.title), h("p", { class: "muted", style: { fontSize: "var(--fs-small)" } }, primary.body)),
          link(primary.href, h("span", { class: "btn btn-lg", style: { justifySelf: "start" } }, `${primary.cta} `, arrow()))),
        h("div", { class: "card card-sunk stack" },
          eyebrow(p.done ? `${p.done} of ${p.total} completed · ${p.practiced} of ${Object.keys(skills2).length} skills practiced` : "Your selling"),
          ...Object.entries(skills2).map(([k, s]) => { const b = p.bySkill[k]; return bar(s.name, b.score ?? 0, 100, { tone: b.score == null ? "muted" : b.score >= 80 ? "good" : b.score >= 60 ? "" : "warn", format: v => b.score == null ? "—" : `${v}%` }); }),
          lines.length ? h("div", { style: { marginTop: "10px", paddingTop: "12px", borderTop: "1px solid var(--line)" } }, eyebrow("How you sell"), ...lines.map(t => h("p", { class: "muted", style: { marginTop: "8px", fontSize: "var(--fs-small)" } }, t)))
            : h("p", { class: "muted", style: { fontSize: "var(--fs-micro)", marginTop: "6px" } }, "Scores show how often you chose the strongest move. After a few conversations, this panel also names the selling habits your choices reveal.")))),

    h("section", { class: "section" },
      h("div", { class: "section-head reveal" }, h("div", {}, eyebrow("Or pick a set"), h("h2", { style: { marginTop: "10px" } }, "Where does the conversation go wrong for you?"))),
      h("div", { class: "grid grid-3" },
        p.done ? setCard("5-minute challenge", "One conversation from each stage. The fastest way to see where you stand.", challengeList, `/sell/${challengeIds2[0]}?set=challenge&i=0`) : null,
        ...tracks2.map(t => { const list = scenarios2.filter(t.filter); const first = nextUnplayed2(list) || list[0]; return setCard(t.title, t.blurb, list, `/sell/${first.id}?set=${t.id}&i=${list.indexOf(first)}`); }))),

    h("section", { class: "section reveal" }, gatedDisclose(`All ${p.total} conversations`, () => h("div", { class: "table-wrap" }, h("table", { class: "table" }, h("thead", {}, h("tr", {}, h("th", {}, "Customer"), h("th", {}, "Situation"), h("th", {}, "Stage"), h("th", {}, "Skill"), h("th", { class: "num" }, "Result"))),
        h("tbody", {}, [...scenarios2].sort((a, b) => stages.indexOf(a.stage) - stages.indexOf(b.stage)).map(s => { const r = p.results[s.id]; return h("tr", { class: "clickable", tabindex: "0", onClick: () => navigate(`/sell/${s.id}`), onKeydown: e => { if (e.key === "Enter") navigate(`/sell/${s.id}`); } },
          h("td", {}, h("b", { style: { fontWeight: 500 } }, s.customer)), h("td", { class: "muted" }, (s.buyer ? `“${s.buyer}”` : s.situation).split(". ")[0].replace(/\.?$/, s.buyer ? "" : ".")), h("td", {}, h("span", { class: "chip" }, s.stage)), h("td", { class: "muted" }, skills2[s.skill].name),
          h("td", { class: "num" }, r ? h("span", { class: `chip ${r.quality === "best" ? "chip-good" : r.quality === "good" ? "" : "chip-warn"}` }, r.quality === "best" ? "Strong" : r.quality === "good" ? "Reasonable" : "Revisit") : h("span", { class: "muted" }, "—"))); })))))),
  );
}
