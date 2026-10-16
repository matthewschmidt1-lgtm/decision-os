import { h, link, arrow, eyebrow, evidence, evidenceUsed, reducedMotion, says, disclose } from "../ui.js";
import { scenarios3, scenario3ById, skills3, tracks3, challengeIds3, patterns3, families3, strengths3, values3, themes3, algorithmFor } from "../scenarios3.js";
import { recordResult3, recordReplay3, getResult3, allResults3, getManage, setManage } from "../store.js";
import { isFixed, nextFor, revisitList, nextUnplayed, nextUnplayedAfter, summary, sound, RANK } from "../manage-progress.js";
import { drawPicture } from "../manage-pictures.js";
import { lessonBySlug } from "../lessons/index.js";
import { setMeta } from "../app.js";

function setFor(setId) {
  if (setId === "challenge") { const c = getManage("challenge"); const ids = c?.list?.length ? c.list : challengeIds3; return { title: "5-minute challenge", list: ids.map((id) => scenario3ById[id]).filter(Boolean) }; }
  if (setId === "revisit") { const ids = getManage("revisit") || []; return ids.length ? { title: "Your Revisits", list: ids.map((id) => scenario3ById[id]).filter(Boolean) } : null; }
  const t = tracks3.find((t) => t.id === setId);
  return t ? { title: t.title, list: scenarios3.filter(t.filter) } : null;
}
const HEAD = { best: "A strong way to do it.", good: "Defensible. Here's what it protects, and what it costs.", weak: "A common move under pressure." };

export default async function ManageScenario({ id, params }) {
  const base = scenario3ById[id];
  if (!base) return (await import("./notfound.js")).default();
  let s = base;
  setMeta({ title: `${s.customer}: ${s.question || "What do you do?"}`, description: s.situation });
  const set = setFor(params.get("set")); const i = Number(params.get("i") || 0);
  const nextInSet = set ? set.list[i + 1] : null;
  const isLastInSet = set && !nextInSet;
  const prior = getResult3(s.id);
  // On a replay the options come in a different order each attempt, so it tests judgment rather than memory. The picture keys
  // its marks by option identity, so shuffling never moves a mark.
  if (prior) { let seed = (prior.attempts || 1) * 2654435761 + s.id.length; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }; s = { ...s, options: [...s.options].sort(() => rnd() - 0.5) }; }
  const question = s.question || "What do you do?";

  const feedback = h("div", { hidden: true, class: "stack verdict", style: { "--gap": "14px" } });
  const whyBtn = h("button", { type: "button", class: "btn btn-ghost", hidden: true }, "Why? See the reasoning and the principle ", h("span", { class: "arrow", "aria-hidden": "true" }, "↓"));
  const why = h("div", { hidden: true, class: "stack", style: { "--gap": "14px" } });
  const principle = h("div", { hidden: true, class: "stack", style: { "--gap": "14px" } });
  const nextNav = h("nav", { hidden: true, "aria-label": "Next", class: "nav-stack" });

  const landOn = (el, extra = 0) => { const header = document.querySelector(".topbar")?.offsetHeight || 0; scrollTo({ top: el.getBoundingClientRect().top + scrollY - header - 16 - extra, behavior: "smooth" }); };
  const show = (el) => {
    el.hidden = false; el.classList.add("reveal"); requestAnimationFrame(() => el.classList.add("in"));
    const heading = el.querySelector("h2"); if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    const strongest = document.querySelector(".option.choice.preferred");
    if (strongest) landOn(strongest, 12); else landOn(el, reducedMotion() ? 0 : 14);
  };
  const best = s.options.find((o) => o.quality === "best");
  let picked = null;

  const choose = (o, el) => {
    picked = o;
    optionEls.forEach((b) => { b.disabled = true; b.setAttribute("aria-pressed", String(b === el)); b.classList.toggle("preferred", s.options[optionEls.indexOf(b)] === best); });
    if (!prior) recordResult3(s.id, { option: o.label, quality: o.quality, skill: s.skill, pattern: o.pattern, strength: o.strength, leans: o.leans }); else recordReplay3(s.id, o.quality);
    const habit = o.pattern && patterns3[o.pattern]; const family = habit && families3[habit.family];
    const others = s.options.filter((x) => x !== o);
    const fixedNow = prior && prior.quality === "weak" && sound(o.quality);
    const pic = drawPicture(base, o);
    feedback.replaceChildren(...[h("h2", { style: { fontSize: "var(--fs-h3)" } }, HEAD[o.quality]), h("p", { class: "lede" }, o.feedback),
      o.leans ? h("p", { class: "m3-leans" }, h("b", {}, "This leans on: "), values3[o.leans] || o.leans, o.quality === "good" ? h("span", { class: "muted" }, ` · the strongest leans on ${(values3[best.leans] || best.leans).toLowerCase()} and adds ${strengths3[best.strength]?.name.toLowerCase() || "one more step"}.`) : null) : null,
      pic,
      habit ? h("div", { class: "layer layer-1" }, h("p", { class: "eyebrow" }, "The habit this shows"), h("p", { style: { marginTop: "8px", fontWeight: 500 } }, habit.name), family ? h("p", { class: "muted", style: { marginTop: "4px", fontSize: "var(--fs-small)" } }, family.coach) : null) : null,
      o.cost ? h("p", { class: "muted drill-cost" }, h("b", {}, "What it cost: "), o.cost) : null,
      o.quality !== "best" ? h("p", { class: "sc-strongest" }, h("b", {}, "Strongest: "), best.label) : null,
      fixedNow ? h("p", { class: "sell-fixed" }, "Fixed on replay. Your first try stays the record; this one counts as a rehearsal.") : null,
      disclose("How the other options compare", h("div", { class: "stack sc-others", style: { "--gap": "12px" } }, ...others.map((x) => h("p", {}, h("b", {}, x === best ? "Strongest: " : x.quality === "good" ? "Also sound: " : "Under pressure: "), x.label, " ", h("span", { class: "why" }, x.feedback)))))].filter(Boolean));
    show(feedback); whyBtn.hidden = false;
  };
  whyBtn.addEventListener("click", () => {
    const reasoningEl = h("div", { class: "layer layer-2" }, eyebrow("Reasoning"), h("p", {}, s.reasoning));
    const used = evidenceUsed(s.evidence, `${s.reasoning} ${best.feedback}`);
    const lessons = h("div", { class: "layer layer-1 m3-lessons" }, eyebrow("Two lessons pull here"), h("p", {}, h("b", {}, "The one the strongest move follows: "), s.lens[1]), h("p", {}, h("b", {}, "The one pulling the other way: "), s.tension[1]));
    why.replaceChildren(...(used ? [h("div", { class: "layer layer-1" }, eyebrow("Evidence used"), used)] : []), reasoningEl, lessons);
    whyBtn.hidden = true; why.hidden = false; why.classList.add("reveal", "in");
    const slug = algorithmFor[base.picture?.kind], lesson = slug && lessonBySlug[slug];
    principle.replaceChildren(h("div", { class: "card", style: { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" } }, h("p", { class: "eyebrow", style: { color: "color-mix(in srgb, var(--bg) 60%, transparent)" } }, "The principle"), h("p", { style: { fontSize: "1.375rem", lineHeight: 1.35, marginTop: "8px", letterSpacing: "-0.01em" } }, s.principle)),
      ...(s.then ? [h("div", { class: "layer layer-2" }, eyebrow(picked === best ? "How it plays out" : "If you'd made the strongest move"), h("p", {}, s.then))] : []),
      h("div", { class: "layer layer-2" }, eyebrow("Your next move"), h("p", {}, s.nextMove)),
      lesson ? link(`/learn/${slug}`, h("span", { class: "link" }, `Learn the algorithm behind the picture: ${lesson.title} `, arrow())) : null);
    principle.hidden = false; principle.classList.add("reveal", "in");
    const R = allResults3(); const after = nextUnplayedAfter(s.id, R);
    nextNav.replaceChildren(
      set && nextInSet ? link(`/manage/${nextInSet.id}?set=${params.get("set")}&i=${i + 1}`, h("span", { class: "btn" }, `Next · ${i + 2} of ${set.list.length} `, arrow()))
      : set && isLastInSet ? link(`/manage/summary?set=${params.get("set")}`, h("span", { class: "btn" }, "Finish ", arrow()))
      : after ? link(`/manage/${after.id}`, h("span", { class: "btn" }, "Next case ", arrow()))
      : link("/manage/summary", h("span", { class: "btn" }, "You've done them all. See your read ", arrow())),
      link("/manage", h("span", { class: "btn btn-ghost" }, "Back to Module 3")));
    nextNav.hidden = false; nextNav.classList.add("reveal", "in");
    const target = matchMedia("(max-width: 720px)").matches ? reasoningEl : why;
    const header = document.querySelector(".topbar")?.offsetHeight || 0;
    scrollTo({ top: target.getBoundingClientRect().top + scrollY - header - 16, behavior: "smooth" });
  });

  const optionEls = s.options.map((o, n) => h("button", { type: "button", class: "option choice", "aria-pressed": "false", onClick: (e) => choose(o, e.currentTarget) },
    h("span", { class: "choice-letter", "aria-hidden": "true" }, "ABCD"[n]), h("span", {}, o.label)));

  return h("article", { class: "sell manage has-quote" },
    h("header", { class: "reveal" },
      h("div", { class: "facts" }, set ? h("span", {}, h("b", {}, `${i + 1} / ${set.list.length}`), set.title) : null, h("span", {}, "You", h("b", {}, s.who)), h("span", {}, "With", h("b", {}, s.customer)), h("span", {}, "Skill", h("b", {}, skills3[s.skill].name)), h("span", {}, "Stage", h("b", {}, s.stage))),
      h("div", { class: "sc-step" }, eyebrow("They say"), says(`“${s.voice}”`, "", { live: false })),
      h("div", { class: "sc-step" }, eyebrow("The situation"), h("h1", { class: "sc-situation" }, s.situation))),
    h("section", { class: "sc-step reveal" }, eyebrow("What you know"),
      h("div", { class: "card card-sunk sc-facts" }, evidence(s.evidence.map(([k, v]) => [k, v]), { optionTones: false }),
        h("p", { class: "sc-caveat" }, "Some of this is on paper. Some of it is only in your head."))),
    h("section", { class: "sc-step reveal" }, eyebrow("Before you choose"), h("div", { class: "m3-pause" }, h("span", { class: "k" }, "Ask yourself"), h("span", {}, s.pause))),
    h("section", { class: "sc-step reveal" }, eyebrow("Your call"), h("h2", { class: "sc-question" }, question), h("p", { class: "sc-hint" }, "Pick one. More than one answer here is defensible; you'll see what each protects."),
      h("div", { class: "choices", style: { marginTop: "18px" } }, ...optionEls), prior ? h("p", { class: "muted", style: { marginTop: "10px", fontSize: "var(--fs-micro)" } }, "You've played this one before. Replays don't change your record.") : null),
    h("section", { class: "section", style: { marginTop: "40px" } }, feedback, h("div", { style: { marginTop: "20px" } }, whyBtn)),
    h("section", { style: { marginTop: "24px" } }, why),
    h("section", { style: { marginTop: "24px" } }, principle),
    h("section", { class: "section" }, nextNav),
  );
}

export async function ManageSummary({ params }) {
  const set = setFor(params.get("set")) || { title: "All cases", list: scenarios3 };
  setMeta({ title: "Your read · Module 3" });
  const R = allResults3();
  const done = set.list.filter((s) => R[s.id]);
  const soundN = done.filter((s) => sound(R[s.id].quality)).length, strongest = done.filter((s) => R[s.id].quality === "best").length, fixedN = done.filter((s) => isFixed(R[s.id])).length;
  if (!done.length) return h("div", {}, h("section", { class: "reveal" }, eyebrow(set.title), h("h1", { class: "hero", style: { marginTop: "16px" } }, "Nothing here yet."),
    h("p", { class: "hero-sub" }, "Work through a few cases and your read will show up here."), h("div", { style: { marginTop: "28px" } }, link(`/manage/${(nextUnplayed(scenarios3, R) || scenarios3[0]).id}`, h("span", { class: "btn" }, "Start a case ", arrow())))));
  const lines = summary(R);
  const pool = done.map((s) => ({ s, q: RANK[R[s.id].quality] })).sort((a, b) => a.q - b.q);
  const weakest = pool[0]?.s || set.list[0];
  const practiced = [...new Set(done.map((s) => skills3[s.skill].name))];
  const verb = (r) => r.quality === "best" ? ["Strongest", "good"] : r.quality === "good" ? ["Sound", ""] : isFixed(r) ? ["Fixed", "good"] : ["Revisit", "warn"];
  return h("div", {},
    h("section", { class: "reveal" }, eyebrow(set.title), h("h1", { class: "hero", style: { marginTop: "16px" } }, `${soundN} of ${done.length} sound. ${strongest} strongest.${fixedN ? ` ${fixedN} fixed on replay.` : ""}`),
      h("p", { class: "hero-sub" }, `You practiced ${practiced.join(", ").replace(/, ([^,]*)$/, " and $1")}.${soundN === done.length ? " Every pick was defensible." : " The ones marked Revisit are where pressure chose for you."}`)),
    lines.length ? h("section", { class: "section reveal" }, h("div", { class: "card card-sunk" }, eyebrow("How you lead"), ...lines.map((t) => h("p", { style: { marginTop: "10px" } }, t)))) : null,
    h("section", { class: "section reveal" }, h("div", { class: "card", style: { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" } }, h("p", { class: "eyebrow", style: { color: "color-mix(in srgb, var(--bg) 60%, transparent)" } }, "One thing to remember"), h("p", { style: { fontSize: "1.375rem", lineHeight: 1.35, marginTop: "8px", letterSpacing: "-0.01em" } }, weakest.principle))),
    h("section", { class: "section reveal" }, h("h2", { style: { fontSize: "var(--fs-h3)", marginBottom: "12px" } }, "What you did"),
      done.map((s) => { const [t, cls] = verb(R[s.id]); return link(`/manage/${s.id}`, h("span", { class: "decision-row" }, h("span", { class: `verb ${cls}` }, t), h("span", {}, h("b", { style: { fontWeight: 500 } }, s.customer), h("span", { class: "muted" }, ` · ${themes3[s.theme]}`)), h("span", { class: "arrow", "aria-hidden": "true" }, "→"))); })),
    h("section", { class: "section reveal nav-stack" }, (() => { const n = nextFor(R); return n ? link(`/manage/${n.id}`, h("span", { class: "btn" }, `Next: ${skills3[n.skill].name.toLowerCase()} `, arrow())) : link("/manage", h("span", { class: "btn" }, "Back to Module 3 ", arrow())); })(),
      (() => { const rv = revisitList(R).filter((s) => set.list.includes(s)); if (!rv.length) return null; const a = link(`/manage/${rv[0].id}?set=revisit&i=0`, h("span", { class: "btn btn-ghost" }, `Replay the ${rv.length} marked Revisit `, arrow())); a.addEventListener("click", () => setManage("revisit", rv.map((s) => s.id))); return a; })(),
      link("/", h("span", { class: "btn btn-ghost" }, "Home"))),
  );
}
