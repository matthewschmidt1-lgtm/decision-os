import { h, link, arrow, eyebrow, evidence } from "../ui.js";
import { scenarios, scenarioById, skills, tracks, challengeIds, qualityScore } from "../scenarios.js";
import { lessonBySlug } from "../lessons/index.js";
import { recordResult, getResult, allResults } from "../store.js";
import { setMeta } from "../app.js";
import { nextUnplayedAfter, nextUnplayed } from "./practice.js";

function setFor(setId) {
  if (setId === "challenge") return { title: "5-minute challenge", list: challengeIds.map(id => scenarioById[id]) };
  const t = tracks.find(t => t.id === setId);
  return t ? { title: t.title, list: scenarios.filter(t.filter) } : null;
}

export default async function Scenario({ id, params }) {
  const s = scenarioById[id];
  if (!s) return (await import("./notfound.js")).default();
  setMeta({ title: `${s.customer}: ${s.question}`, description: s.situation });
  const set = setFor(params.get("set")); const i = Number(params.get("i") || 0);
  const nextInSet = set ? set.list[i + 1] : null;
  const isLastInSet = set && !nextInSet;
  const lesson = lessonBySlug[s.algorithm];
  const prior = getResult(s.id);

  // Progressive reveal: choice → feedback → why (evidence → reasoning → principle) → next move
  const feedback = h("div", { hidden: true, class: "stack", style: { "--gap": "14px" } });
  const whyBtn = h("button", { type: "button", class: "btn btn-ghost", hidden: true }, "Why? See the reasoning and the principle ", h("span", { class: "arrow", "aria-hidden": "true" }, "↓"));
  const why = h("div", { hidden: true, class: "stack", style: { "--gap": "14px" } });
  const principle = h("div", { hidden: true, class: "stack", style: { "--gap": "14px" } });
  const nextNav = h("nav", { hidden: true, "aria-label": "Next", style: { display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" } });

  const show = (el) => { el.hidden = false; el.classList.add("reveal"); requestAnimationFrame(() => el.classList.add("in")); el.scrollIntoView({ behavior: "smooth", block: "nearest" }); };
  const best = s.options.find(o => o.quality === "best");

  const choose = (o, el) => {
    optionEls.forEach(b => { b.disabled = true; b.setAttribute("aria-pressed", String(b === el)); b.classList.toggle("preferred", s.options[optionEls.indexOf(b)] === best); });
    if (!prior) recordResult(s.id, { option: o.label, quality: o.quality, skill: s.skill });
    const head = o.quality === "best" ? "Good instinct. Here's why." : o.quality === "good" ? "Reasonable. A strong rep would also notice this." : "A common move. Here's what a strong rep would notice first.";
    feedback.replaceChildren(...[h("p", { class: "muted", style: { fontSize: "var(--fs-small)" } }, `You chose: ${o.label}`), h("h2", { style: { fontSize: "var(--fs-h3)" } }, head), h("p", { class: "lede" }, o.feedback),
      o.quality !== "best" ? h("p", { class: "muted", style: { fontSize: "var(--fs-small)" } }, `Strongest option: ${best.label}.`) : null].filter(Boolean));
    show(feedback); whyBtn.hidden = false;
  };
  whyBtn.addEventListener("click", () => {
    why.replaceChildren(h("div", { class: "layer layer-1" }, eyebrow("Evidence that matters"), h("div", { style: { marginTop: "12px" } }, evidence(s.evidence))),
      h("div", { class: "layer layer-2" }, eyebrow("Reasoning"), h("p", {}, s.reasoning), h("p", { class: "muted", style: { marginTop: "10px", fontSize: "var(--fs-micro)" } }, `The thinking pattern here is what decision scientists call ${lesson.title.toLowerCase()}. You don't need the name to use it.`)));
    whyBtn.hidden = true; why.hidden = false; why.classList.add("reveal", "in");
    principle.replaceChildren(h("div", { class: "card", style: { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" } }, h("p", { class: "eyebrow", style: { color: "rgba(245,245,240,.6)" } }, "The principle"), h("p", { style: { fontSize: "1.375rem", lineHeight: 1.35, marginTop: "8px", letterSpacing: "-0.01em" } }, s.principle)),
      h("div", { class: "layer layer-2" }, eyebrow("Your next move"), h("p", {}, s.nextMove)),
      link(`/learn/${s.algorithm}`, h("span", { class: "link" }, `Learn the algorithm: ${lesson.title} `, arrow())));
    principle.hidden = false; principle.classList.add("reveal", "in");
    const after = nextUnplayedAfter(s.id);
    nextNav.replaceChildren(
      set && nextInSet ? link(`/practice/${nextInSet.id}?set=${params.get("set")}&i=${i + 1}`, h("span", { class: "btn" }, `Next · ${i + 2} of ${set.list.length} `, arrow()))
      : set && isLastInSet ? link(`/practice/summary?set=${params.get("set")}`, h("span", { class: "btn" }, "Finish ", arrow()))
      : after ? link(`/practice/${after.id}`, h("span", { class: "btn" }, "Next challenge ", arrow()))
      : link("/practice/summary", h("span", { class: "btn" }, "You've done them all. See your results ", arrow())),
      link("/practice", h("span", { class: "btn btn-ghost" }, "Back to practice")));
    nextNav.hidden = false; nextNav.classList.add("reveal", "in");
    why.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const optionEls = s.options.map((o, n) => h("button", { type: "button", class: "option choice", "aria-pressed": "false", onClick: e => choose(o, e.currentTarget) },
    h("span", { class: "choice-letter", "aria-hidden": "true" }, "ABCD"[n]), h("span", {}, o.label)));

  return h("article", {},
    h("header", { class: "reveal" },
      h("div", { class: "facts" }, set ? h("span", {}, h("b", {}, `${i + 1} / ${set.list.length}`), set.title) : null, h("span", {}, "Customer", h("b", {}, s.customer)), h("span", {}, "Category", h("b", {}, s.category)), h("span", {}, "Skill", h("b", {}, skills[s.skill].name)), h("span", { class: "chip" }, s.level)),
      // Three steps with one rhythm: the story, the facts (grouped on a panel), then the question and choices.
      h("div", { class: "sc-step" }, eyebrow("The situation"), h("h1", { class: "sc-situation" }, s.situation))),
    h("section", { class: "sc-step reveal" }, eyebrow("What you know"),
      h("div", { class: "card card-sunk sc-facts" }, evidence(s.evidence, { optionTones: false }),
        h("p", { class: "muted", style: { marginTop: "12px", fontSize: "var(--fs-micro)" } }, "Numbers are as messy as they are in the field. Some are lagged, some are estimates."))),
    h("section", { class: "sc-step reveal" }, eyebrow("The decision"), h("h2", { class: "sc-question" }, s.question), h("p", { class: "muted", style: { marginTop: "6px", fontSize: "var(--fs-small)" } }, "Pick one. You'll see the reasoning either way."),
      h("div", { class: "choices", style: { marginTop: "18px" } }, ...optionEls), prior ? h("p", { class: "muted", style: { marginTop: "10px", fontSize: "var(--fs-micro)" } }, `You've played this one before. Replays don't change your score.`) : null),
    h("section", { class: "section", style: { marginTop: "40px" } }, feedback, h("div", { style: { marginTop: "20px" } }, whyBtn)),
    h("section", { style: { marginTop: "24px" } }, why),
    h("section", { style: { marginTop: "24px" } }, principle),
    h("section", { class: "section" }, nextNav),
  );
}

export async function Summary({ params }) {
  const set = setFor(params.get("set")) || { title: "All scenarios", list: scenarios };
  setMeta({ title: "Your results" });
  const r = allResults();
  const done = set.list.filter(s => r[s.id]);
  const strong = done.filter(s => r[s.id].quality === "best").length;
  const practiced = [...new Set(done.map(s => skills[s.skill].name))];
  if (!done.length) return h("div", {}, h("section", { class: "reveal" }, eyebrow(set.title), h("h1", { class: "hero", style: { marginTop: "16px" } }, "Nothing here yet."),
    h("p", { class: "hero-sub" }, "Finish a few scenarios and your results will show up here."), h("div", { style: { marginTop: "28px" } }, link(`/practice/${(nextUnplayed() || scenarios[0]).id}`, h("span", { class: "btn" }, "Start a scenario ", arrow())))));
  const weakest = done.map(s => ({ s, q: qualityScore[r[s.id].quality] })).sort((a, b) => a.q - b.q)[0]?.s || set.list[0];
  return h("div", {},
    h("section", { class: "reveal" }, eyebrow(set.title), h("h1", { class: "hero", style: { marginTop: "16px" } }, "Nice work."),
      h("p", { class: "hero-sub" }, `You practiced ${practiced.join(", ").replace(/, ([^,]*)$/, " and $1")}. ${strong} of ${done.length} choices were the strongest option.`)),
    h("section", { class: "section reveal" }, h("div", { class: "card", style: { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" } }, h("p", { class: "eyebrow", style: { color: "rgba(245,245,240,.6)" } }, "One thing to remember"), h("p", { style: { fontSize: "1.375rem", lineHeight: 1.35, marginTop: "8px" } }, weakest.principle))),
    h("section", { class: "section reveal" }, h("h2", { style: { fontSize: "var(--fs-h3)", marginBottom: "12px" } }, "What you did"),
      done.map(s => link(`/practice/${s.id}`, h("span", { class: "decision-row" }, h("span", { class: `verb ${r[s.id].quality === "best" ? "good" : r[s.id].quality === "good" ? "" : "warn"}` }, r[s.id].quality === "best" ? "Strong" : r[s.id].quality === "good" ? "Reasonable" : "Revisit"), h("span", { class: "body" }, `${s.customer}: ${s.question}`), arrow())))),
    h("section", { class: "section reveal", style: { display: "flex", gap: "12px", flexWrap: "wrap" } }, (() => { const n = nextUnplayed(); return n ? link(`/practice/${n.id}`, h("span", { class: "btn" }, "Next challenge ", arrow())) : link("/practice", h("span", { class: "btn" }, "Back to practice ", arrow())); })(), link("/", h("span", { class: "btn btn-ghost" }, "Home"))),
  );
}
