import { h, link, arrow, eyebrow, bar, disclose } from "../ui.js";
import { scenarios3, skills3, tracks3, challengeIds3, stages3, themes3 } from "../scenarios3.js";
import { allResults3, setManage } from "../store.js";
import { trackMark, skillRead, label as skillLabel, nextFor, weakestSkill, summary, valueReads, challengeList, nextUnplayed, isFixed } from "../manage-progress.js";
import { setMeta, navigate } from "../app.js";

export default async function Manage() {
  setMeta({ title: "Module 3 · Manage", description: "Thirty management calls where two good values pull against each other: your people, your partners, your boss and yourself." });
  const R = allResults3();
  const done = scenarios3.filter((s) => R[s.id]).length, total = scenarios3.length;
  const reads = skillRead(R), practiced = Object.values(reads).filter((b) => b.n > 0).length;
  const next = nextFor(R);
  const allDone = !scenarios3.some((s) => !R[s.id]);
  const weak = weakestSkill(R);
  const lines = summary(R);
  const vals = valueReads(R).filter((v) => v.onTable >= 3);
  const missed = scenarios3.filter((s) => R[s.id]?.quality === "weak"), fixedN = missed.filter((s) => isFixed(R[s.id])).length;
  const primary = done === 0
    ? { eyebrow: "Start here", title: "5-minute challenge", body: "Five calls a manager makes: a rep buyers love who misses the number, the process you keep rescuing, your own Q4, a number you can't hit, and a question you'd rather answer.", href: `/manage/${challengeIds3[0]}?set=challenge&i=0`, cta: "Start" }
    : allDone
      ? { eyebrow: "All done", title: `You've worked through all ${total} cases.`, body: "Replay the ones marked Revisit. Your first try stays the record; a sound answer on replay counts as fixed.", href: "/manage/summary", cta: "See your read" }
      : { eyebrow: weak && next.skill === weak ? `Continue · most room in ${skills3[next.skill].name.toLowerCase()}` : "Continue", title: next.voice ? `“${next.voice}”` : next.situation, body: `${next.who} · ${next.customer}`, href: `/manage/${next.id}`, cta: "Continue" };

  const setCard = (title, blurb, list, href, n) => {
    const m = trackMark(list, R);
    return link(href, h("span", { class: `card clickable reveal${m.clean ? " is-clean" : ""}`, style: { display: "flex", flexDirection: "column", height: "100%" } },
      n ? h("span", { class: "eyebrow", style: { marginBottom: "8px" } }, String(n).padStart(2, "0")) : null,
      h("h3", {}, title), h("p", { class: "muted", style: { marginTop: "6px", flex: 1 } }, blurb),
      h("p", { class: `tag${m.clean ? " good" : ""}`, style: { marginTop: "16px" } }, m.text)));
  };
  const challenge = challengeIds3.map((id) => scenarios3.find((s) => s.id === id));

  return h("div", {},
    h("section", { class: "reveal" }, eyebrow("Practice · Module 3 · Manage"), h("h1", { class: "hero", style: { marginTop: "16px" } }, "You can decide, and you can sell. Now lead the people who do."),
      h("p", { class: "hero-sub" }, "Module 3 is about the person who manages: what you owe your people, your partners, your boss and yourself. Several answers here are defensible. We show which values each leans on, and what the strongest one adds."),
      h("div", { class: "mod-steps" },
        link("/practice", h("span", { class: "mod" }, h("b", {}, "Module 1 · Judgment"), "What should I do?")),
        h("span", { class: "arrow", "aria-hidden": "true" }, "→"),
        link("/sell", h("span", { class: "mod" }, h("b", {}, "Module 2 · Conversation"), "How do I move it forward?")),
        h("span", { class: "arrow", "aria-hidden": "true" }, "→"),
        h("span", { class: "mod current", "aria-current": "page" }, h("b", {}, "Module 3 · Manage"), "What do I owe the people around me?"))),

    h("section", { class: "section reveal" },
      h("div", { class: "grid grid-2", style: { alignItems: "stretch" } },
        h("div", { class: "card", style: { display: "grid", gap: "12px", alignContent: "space-between" } },
          h("div", { class: "stack", style: { "--gap": "10px" } }, eyebrow(primary.eyebrow), h("h2", { style: { fontSize: "var(--fs-h3)" } }, primary.title), h("p", { class: "muted", style: { fontSize: "var(--fs-small)" } }, primary.body)),
          link(primary.href, h("span", { class: "btn btn-lg", style: { justifySelf: "start" } }, `${primary.cta} `, arrow()))),
        h("div", { class: "card card-sunk stack" },
          eyebrow(done ? `${done} of ${total} completed · ${practiced} of ${Object.keys(skills3).length} skills practiced` : "How you lead"),
          ...Object.entries(skills3).map(([k, s]) => { const b = reads[k]; return bar(s.name, b.share ?? 0, 100, { tone: b.n < 3 ? "muted" : b.share >= 80 ? "good" : b.share >= 60 ? "" : "warn", format: () => skillLabel(b) }); }),
          missed.length ? h("p", { class: "m3-note", style: { marginTop: "10px" } }, `Fixed on replay: ${fixedN} of ${missed.length} marked Revisit.`) : null,
          lines.length ? h("div", { style: { marginTop: "10px", paddingTop: "12px", borderTop: "1px solid var(--line)" } }, eyebrow("How you lead"), ...lines.map((t) => h("p", { class: "muted", style: { marginTop: "8px", fontSize: "var(--fs-small)" } }, t)),
            vals.length >= 2 ? h("ul", { class: "m3-values", "aria-label": "Values you reach for" }, ...vals.map((v) => h("li", {}, h("span", {}, v.name), h("span", { class: "track" }, h("i", { style: { width: `${Math.round(v.share * 100)}%` } })), h("span", { class: "n" }, `${v.leaned} of ${v.onTable}`)))) : null)
            : h("p", { class: "m3-note", style: { marginTop: "16px" } }, "No score out of a hundred here. A sound answer is a sound answer. After five cases this panel names the values you reach for, and after three in a skill it says how many of your picks were sound.")))),

    h("section", { class: "section" },
      h("div", { class: "section-head reveal" }, h("div", {}, eyebrow("Or pick a set"), h("h2", { style: { marginTop: "12px" } }, "Where does managing get hard for you?"))),
      h("div", { class: "grid grid-3" },
        done ? (() => { const a = setCard("5-minute challenge", "Five calls across the seven skills. See which values you reach for under pressure.", challenge, `/manage/${challengeIds3[0]}?set=challenge&i=0`); a.addEventListener("click", () => setManage("challenge", { list: challengeList(R) })); return a; })() : null,
        ...tracks3.map((t, k) => { const list = scenarios3.filter(t.filter); const first = nextUnplayed(list, R) || list[0]; return setCard(t.title, t.blurb, list, `/manage/${first.id}?set=${t.id}&i=${list.indexOf(first)}`, k + 1); }))),

    h("section", { class: "section reveal" }, disclose(`All ${total} cases`, h("div", { class: "table-wrap" }, h("table", { class: "table" }, h("thead", {}, h("tr", {}, h("th", {}, "Who"), h("th", {}, "The line"), h("th", {}, "Stage"), h("th", {}, "Theme"), h("th", { class: "num" }, "Your pick"))),
      h("tbody", {}, [...scenarios3].sort((a, b) => stages3.indexOf(a.stage) - stages3.indexOf(b.stage)).map((s) => { const r = R[s.id]; return h("tr", { class: "clickable", tabindex: "0", onClick: () => navigate(`/manage/${s.id}`), onKeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/manage/${s.id}`); } } },
        h("td", {}, h("b", { style: { fontWeight: 500 } }, s.customer)), h("td", { class: "muted" }, `“${s.voice}”`), h("td", {}, h("span", { class: "chip" }, s.stage)), h("td", { class: "muted" }, themes3[s.theme]),
        h("td", { class: "num" }, r ? h("span", { class: `chip ${r.quality === "best" ? "chip-good" : r.quality === "good" ? "" : "chip-warn"}` }, r.quality === "best" ? "Strongest" : r.quality === "good" ? "Sound" : isFixed(r) ? "Fixed" : "Revisit") : h("span", { class: "muted" }, "—"))); }))))))
  );
}
