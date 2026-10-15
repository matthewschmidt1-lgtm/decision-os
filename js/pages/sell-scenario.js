import { h, link, arrow, eyebrow, evidence, evidenceUsed, says } from "../ui.js";
import { scenarios2, scenario2ById, skills2, tracks2, challengeIds2, qualityScore2, patterns, families, strengths } from "../scenarios2.js";
import { recordResult2, recordReplay2, getResult2, allResults2, getSell, setSell } from "../store.js";
import { milestones, isFixed, nextFor, revisitList } from "../sell-progress.js";
import { disclose } from "../ui.js";
import { setMeta } from "../app.js";
import { nextUnplayed2, nextUnplayedAfter2 } from "./sell.js";

function setFor(setId) {
  if (setId === "challenge") return { title: "5-minute challenge", list: challengeIds2.map(id => scenario2ById[id]) };
  if (setId === "challenge2") { const c = getSell("challenge2"); return c?.list?.length ? { title: "Challenge, round 2", list: c.list.map(id => scenario2ById[id]).filter(Boolean) } : null; }
  if (setId === "revisit") { const ids = getSell("revisit") || []; return ids.length ? { title: "Your Revisits", list: ids.map(id => scenario2ById[id]).filter(Boolean) } : null; }
  const t = tracks2.find(t => t.id === setId);
  return t ? { title: t.title, list: scenarios2.filter(t.filter) } : null;
}

// Resolve each stored result against the current scenario data (by option label), so retagging later still applies to saved picks.
function resolve(results) {
  return Object.entries(results).map(([id, r]) => {
    const sc = scenario2ById[id]; const o = sc?.options.find(x => x.label === r.option);
    return { id, quality: r.quality, skill: sc?.skill || r.skill, pattern: o ? o.pattern : r.pattern, strength: o ? o.strength : r.strength, sc };
  }).filter(r => r.sc);
}
// Tally selling habits by family (most frequent first), plus strengths from best picks.
export function habits(results) {
  const rs = resolve(results); const fam = {}; const st = {}; let tagged = 0;
  rs.forEach(r => {
    const p = r.pattern && patterns[r.pattern]; if (p && p.family) { tagged++; fam[p.family] = fam[p.family] || { n: 0, keys: {} }; fam[p.family].n++; fam[p.family].keys[r.pattern] = (fam[p.family].keys[r.pattern] || 0) + 1; }
    if (r.quality === "best" && r.strength && strengths[r.strength]) st[r.strength] = (st[r.strength] || 0) + 1;
  });
  const list = Object.entries(fam).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => ({ key: k, n: v.n, keys: v.keys, ...families[k] }));
  const strong = Object.entries(st).sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ key: k, n, ...strengths[k] }));
  return Object.assign(list, { strengths: strong, tagged, played: rs.length });
}

export default async function SellScenario({ id, params }) {
  let s = scenario2ById[id];
  if (!s) return (await import("./notfound.js")).default();
  setMeta({ title: `${s.customer}: ${s.question}`, description: s.situation });
  const set = setFor(params.get("set")); const i = Number(params.get("i") || 0);
  const nextInSet = set ? set.list[i + 1] : null;
  const isLastInSet = set && !nextInSet;
  const prior = getResult2(s.id);
  // On a replay the options come in a different order each attempt, so it tests judgment rather than memory.
  if (prior) { let seed = (prior.attempts || 1) * 2654435761 + s.id.length; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }; s = { ...s, options: [...s.options].sort(() => rnd() - 0.5) }; }
  const earnedBefore = new Set(milestones(allResults2()).filter(m => m.earned).map(m => m.id));

  const feedback = h("div", { hidden: true, class: "stack verdict", style: { "--gap": "14px" } });
  const whyBtn = h("button", { type: "button", class: "btn btn-ghost", hidden: true }, "Why? See the reasoning and the principle ", h("span", { class: "arrow", "aria-hidden": "true" }, "↓"));
  const why = h("div", { hidden: true, class: "stack", style: { "--gap": "14px" } });
  const principle = h("div", { hidden: true, class: "stack", style: { "--gap": "14px" } });
  const nextNav = h("nav", { hidden: true, "aria-label": "Next", class: "nav-stack" });

  // Land the verdict just under the sticky header and move focus to its heading, so keyboard and screen-reader users arrive with the mouse users.
  const landOn = (el, extra = 0) => { const header = document.querySelector(".topbar")?.offsetHeight || 0; scrollTo({ top: el.getBoundingClientRect().top + scrollY - header - 16 - extra, behavior: "smooth" }); };
  const show = (el) => {
    el.hidden = false; el.classList.add("reveal"); requestAnimationFrame(() => el.classList.add("in"));
    const heading = el.querySelector("h2"); if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    // Land on the strongest move (its badge sits 9px above the card), so the answer stays in view with the verdict right under it.
    const strongest = document.querySelector(".option.choice.preferred");
    if (strongest) landOn(strongest, 12); else landOn(el, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 14); // .reveal starts 14px low
  };
  const best = s.options.find(o => o.quality === "best");
  let picked = null;

  const choose = (o, el) => {
    picked = o;
    optionEls.forEach(b => { b.disabled = true; b.setAttribute("aria-pressed", String(b === el)); b.classList.toggle("preferred", s.options[optionEls.indexOf(b)] === best); });
    if (!prior) recordResult2(s.id, { option: o.label, quality: o.quality, skill: s.skill, pattern: o.pattern, strength: o.strength }); else recordReplay2(s.id, o.quality);
    const comply = o.pattern === "comply";
    const head = comply ? "Not allowed. Here's what is." : o.quality === "best" ? "That's the move." : o.quality === "good" ? "Close. One more step." : "A common move. Here's a better one.";
    const habit = o.pattern && patterns[o.pattern];
    const now = milestones(allResults2()); const newly = now.filter(m => m.earned && !earnedBefore.has(m.id));
    const others = s.options.filter(x => x !== o);
    const fixedNow = prior && prior.quality !== "best" && o.quality === "best";
    feedback.replaceChildren(...[h("h2", { style: { fontSize: "var(--fs-h3)" } }, head), h("p", { class: "lede" }, o.feedback),
      habit ? h("div", { class: "layer layer-1" }, h("p", { class: "eyebrow" }, "The habit this reveals"), h("p", { style: { marginTop: "8px", fontWeight: 500 } }, habit.name), h("p", { class: "muted", style: { marginTop: "4px", fontSize: "var(--fs-small)" } }, habit.coach)) : null,
      o.cost ? h("p", { class: "muted drill-cost" }, h("b", {}, "What it cost: "), o.cost) : null,
      o.quality !== "best" ? h("p", { class: "sc-strongest" }, h("b", {}, "Strongest option: "), best.label) : null,
      fixedNow ? h("p", { class: "sell-fixed" }, "Fixed on replay. Your first try stays the score; this one counts as a rehearsal.") : null,
      ...newly.map(m => h("ul", { class: "sim-achnews" }, h("li", { class: "got" }, h("span", { class: "ic", "aria-hidden": "true" }, "★"), h("span", {}, h("b", {}, `Milestone: ${m.name}`), ` ${m.copy}`)))),
      disclose("Why the other options were weaker", h("div", { class: "stack sc-others", style: { "--gap": "12px" } }, ...others.map(x => h("p", {}, h("b", {}, x === best ? "Strongest: " : `${x.quality === "good" ? "Close: " : "Weak: "}`), x.label, " ", h("span", { class: "why" }, x.feedback)))))].filter(Boolean));
    show(feedback); whyBtn.hidden = false;
  };
  whyBtn.addEventListener("click", () => {
    const reasoningEl = h("div", { class: "layer layer-2" }, eyebrow("Reasoning"), h("p", {}, s.reasoning));
    const used = evidenceUsed(s.evidence, `${s.reasoning} ${best.feedback}`);
    why.replaceChildren(...(used ? [h("div", { class: "layer layer-1" }, eyebrow("Evidence used"), used)] : []), reasoningEl);
    whyBtn.hidden = true; why.hidden = false; why.classList.add("reveal", "in");
    principle.replaceChildren(h("div", { class: "card", style: { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" } }, h("p", { class: "eyebrow", style: { color: "color-mix(in srgb, var(--bg) 60%, transparent)" } }, "The principle"), h("p", { style: { fontSize: "1.375rem", lineHeight: 1.35, marginTop: "8px", letterSpacing: "-0.01em" } }, s.principle)),
      ...(s.then ? [h("div", { class: "layer layer-2" }, eyebrow(picked === best ? "How the conversation goes from here" : "If you'd made the strongest move"), h("p", {}, s.then))] : []),
      h("div", { class: "layer layer-2" }, eyebrow("Your next move"), h("p", {}, s.nextMove)),
      ...(s.follows ? [] : (() => { const r2 = scenarios2.find(x => x.follows === s.id); return r2 ? [link(`/sell/${r2.id}`, h("span", { class: "link" }, "Round two: the buyer pushes back ", arrow()))] : []; })()));
    principle.hidden = false; principle.classList.add("reveal", "in");
    const after = nextUnplayedAfter2(s.id);
    nextNav.replaceChildren(
      set && nextInSet ? link(`/sell/${nextInSet.id}?set=${params.get("set")}&i=${i + 1}`, h("span", { class: "btn" }, `Next · ${i + 2} of ${set.list.length} `, arrow()))
      : set && isLastInSet ? link(`/sell/summary?set=${params.get("set")}`, h("span", { class: "btn" }, "Finish ", arrow()))
      : after ? link(`/sell/${after.id}`, h("span", { class: "btn" }, "Next conversation ", arrow()))
      : link("/sell/summary", h("span", { class: "btn" }, "You've done them all. See your results ", arrow())),
      link("/sell", h("span", { class: "btn btn-ghost" }, "Back to Module 2")));
    nextNav.hidden = false; nextNav.classList.add("reveal", "in");
    const target = matchMedia("(max-width: 720px)").matches ? reasoningEl : why;
    const header = document.querySelector(".topbar")?.offsetHeight || 0;
    scrollTo({ top: target.getBoundingClientRect().top + scrollY - header - 16, behavior: "smooth" });
  });

  const optionEls = s.options.map((o, n) => h("button", { type: "button", class: "option choice", "aria-pressed": "false", onClick: e => choose(o, e.currentTarget) },
    h("span", { class: "choice-letter", "aria-hidden": "true" }, "ABCD"[n]), h("span", {}, o.label)));

  return h("article", { class: `sell${s.buyer ? " has-quote" : ""}` },
    h("header", { class: "reveal" },
      h("div", { class: "facts" }, set ? h("span", {}, h("b", {}, `${i + 1} / ${set.list.length}`), set.title) : null, h("span", {}, "Customer", h("b", {}, s.customer)), h("span", {}, "Category", h("b", {}, s.category)), h("span", {}, "Skill", h("b", {}, skills2[s.skill].name)), h("span", {}, "Stage", h("b", {}, s.stage))),
      s.buyer ? h("div", { class: "sc-step" }, eyebrow("The buyer says"), says(`“${s.buyer}”`, "", { live: false })) : null,
      h("div", { class: "sc-step" }, eyebrow("The situation"), h("h1", { class: "sc-situation" }, s.situation))),
    h("section", { class: "sc-step reveal" }, eyebrow("What you know"),
      h("div", { class: "card card-sunk sc-facts" }, evidence(s.evidence.map(([k, v]) => [k, v]), { optionTones: false }),
        h("p", { class: "sc-caveat" }, "Some of this you'd know walking in. Some you'd only learn by asking."))),
    h("section", { class: "sc-step reveal" }, eyebrow("Your move"), h("h2", { class: "sc-question" }, s.question), h("p", { class: "sc-hint" }, "Pick one. You'll see the reasoning either way."),
      h("div", { class: "choices", style: { marginTop: "18px" } }, ...optionEls), prior ? h("p", { class: "muted", style: { marginTop: "10px", fontSize: "var(--fs-micro)" } }, "You've played this one before. Replays don't change your score.") : null),
    h("section", { class: "section", style: { marginTop: "40px" } }, feedback, h("div", { style: { marginTop: "20px" } }, whyBtn)),
    h("section", { style: { marginTop: "24px" } }, why),
    h("section", { style: { marginTop: "24px" } }, principle),
    h("section", { class: "section" }, nextNav),
  );
}

// Turn results into two or three plain sentences about how this person sells. Always reads all played results, never one set,
// so the hub and every summary page agree. Says less when there's less to go on.
const MIN_PLAYED = 5, MIN_SKILL = 3, MIN_HABIT = 3, HABIT_SHARE = 0.3, HABIT_LEAD = 1, SKILL_GAP = 15;
export function habitSummary(results) {
  const rs = resolve(results); const played = rs.length;
  if (!played) return [];
  if (played < MIN_PLAYED) return [`Early read: ${played} of ${MIN_PLAYED} conversations. After five, this panel names the habits your choices reveal.`];
  const lines = [];
  // Skills: by average score, only with three or more plays each and a real gap between top and bottom.
  const bySkill = {};
  rs.forEach(r => { bySkill[r.skill] = bySkill[r.skill] || { n: 0, sum: 0 }; bySkill[r.skill].n++; bySkill[r.skill].sum += qualityScore2[r.quality] || 0; });
  const ranked = Object.entries(bySkill).filter(([, v]) => v.n >= MIN_SKILL).map(([k, v]) => ({ k, score: Math.round(v.sum / v.n * 100) })).sort((a, b) => b.score - a.score);
  if (ranked.length >= 2 && ranked[0].score - ranked[ranked.length - 1].score >= SKILL_GAP) {
    const hi = skills2[ranked[0].k], lo = skills2[ranked[ranked.length - 1].k]; const lc = t => t.charAt(0).toLowerCase() + t.slice(1);
    lines.push(`${ranked[0].score >= 80 ? "Strongest" : "Best so far"} at ${hi.name.toLowerCase()}: ${lc(hi.strong)} Most room in ${lo.name.toLowerCase()}: ${lc(lo.watch)}`);
  }
  const h = habits(results);
  // What you do well: the most frequent strength, once it has three best picks behind it.
  if (h.strengths.length && h.strengths[0].n >= 3) lines.push(`What you do well: ${h.strengths[0].name.toLowerCase()}, ${h.strengths[0].n} times.`);
  // The habit: needs four tagged picks, over a third of all tagged picks, and a lead of two over the next family. Ties are named as ties.
  const top = h[0], second = h[1];
  const qualifies = top && top.n >= MIN_HABIT && top.n >= h.tagged * HABIT_SHARE;
  if (qualifies && second && second.n === top.n) lines.push(`Two habits tie: ${top.name.toLowerCase()} and ${second.name.toLowerCase()}, ${top.n} times each. ${top.coach}`);
  else if (qualifies && (!second || top.n - second.n >= HABIT_LEAD)) lines.push(`The habit that shows up most: ${top.name.toLowerCase()}, ${top.n} times. ${top.coach}`);
  else {
    const goodShare = rs.filter(r => r.quality === "good").length / played;
    if (goodShare > 0.6 && top && top.key === "noask") lines.push("You usually find the right question and stop one step short of the ask. Next time, put a number, a date, or a named next step in the same sentence.");
    else if (goodShare > 0.6) lines.push("Most of your moves were close: the right direction, one step short of the strongest one. Read the 'why the other options were weaker' note after each pick; the step is usually there.");
    else if (h.tagged === 0) lines.push("No habit stands out. Keep asking before you answer, and keep asking for the next step.");
    else lines.push("No single habit stands out yet. Keep asking before you answer, and keep asking for the next step.");
  }
  return lines;
}

export async function SellSummary({ params }) {
  const set = setFor(params.get("set")) || { title: "All conversations", list: scenarios2 };
  setMeta({ title: "Your results · Module 2" });
  const r = allResults2();
  const done = set.list.filter(s => r[s.id]);
  const strong = done.filter(s => r[s.id].quality === "best").length, fixedN = done.filter(s => isFixed(r[s.id])).length;
  const c2 = params.get("set") === "challenge2" ? getSell("challenge2") : null;
  if (c2 && !c2.recorded) setSell("challenge2", { ...c2, recorded: true, runs: [...(c2.runs || []), strong] });
  if (!done.length) return h("div", {}, h("section", { class: "reveal" }, eyebrow(set.title), h("h1", { class: "hero", style: { marginTop: "16px" } }, "Nothing here yet."),
    h("p", { class: "hero-sub" }, "Finish a few conversations and your results will show up here."), h("div", { style: { marginTop: "28px" } }, link(`/sell/${(nextUnplayed2() || scenarios2[0]).id}`, h("span", { class: "btn" }, "Start a conversation ", arrow())))));
  const lines = habitSummary(r);
  // "One thing to remember": the principle from a played scenario that showed the dominant habit, weakest pick first; else the weakest pick overall.
  const top = habits(r)[0]; const played = resolve(r);
  const inFam = top ? played.filter(x => x.pattern && patterns[x.pattern]?.family === top.key).map(x => x.sc) : [];
  const pool = (inFam.length ? inFam : done).map(s => ({ s, q: qualityScore2[r[s.id].quality] })).sort((a, b) => a.q - b.q);
  const weakest = pool[0]?.s || set.list[0];
  const practiced = [...new Set(done.map(s => skills2[s.skill].name))];
  return h("div", {},
    h("section", { class: "reveal" }, eyebrow(set.title), h("h1", { class: "hero", style: { marginTop: "16px" } }, `${strong} of ${done.length} strongest.${fixedN ? ` ${fixedN} fixed on replay.` : ""}`),
      h("p", { class: "hero-sub" }, `You practiced ${practiced.join(", ").replace(/, ([^,]*)$/, " and $1")}.${strong === done.length ? " Every one was the strongest move." : strong / done.length >= 0.6 ? " Most of your moves were the strongest ones." : " The ones marked Revisit are where the habit shows."}`)),
    lines.length ? h("section", { class: "section reveal" }, h("div", { class: "card card-sunk" }, eyebrow("How you sell"), ...lines.map(t => h("p", { style: { marginTop: "10px" } }, t)))) : null,
    h("section", { class: "section reveal" }, h("div", { class: "card", style: { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" } }, h("p", { class: "eyebrow", style: { color: "color-mix(in srgb, var(--bg) 60%, transparent)" } }, "One thing to remember"), h("p", { style: { fontSize: "1.375rem", lineHeight: 1.35, marginTop: "8px" } }, weakest.principle))),
    h("section", { class: "section reveal" }, h("h2", { style: { fontSize: "var(--fs-h3)", marginBottom: "12px" } }, "What you did"),
      done.map(s => link(`/sell/${s.id}`, h("span", { class: "decision-row" }, h("span", { class: `verb ${r[s.id].quality === "best" || isFixed(r[s.id]) ? "good" : r[s.id].quality === "good" ? "" : "warn"}` }, r[s.id].quality === "best" ? "Strong" : isFixed(r[s.id]) ? "Fixed" : r[s.id].quality === "good" ? "Close" : "Revisit"), h("span", { class: "body" }, `${s.customer}: ${s.buyer ? `“${s.buyer}”` : s.question}`), arrow())))),
    h("section", { class: "section reveal nav-stack" }, (() => { const n = nextFor(r); return n ? link(`/sell/${n.id}`, h("span", { class: "btn" }, `Next: ${skills2[n.skill].name.toLowerCase()} `, arrow())) : link("/sell", h("span", { class: "btn" }, "Back to Module 2 ", arrow())); })(),
      (() => { const rv = revisitList(r).filter(s => set.list.includes(s)); if (!rv.length) return null; const a = link(`/sell/${rv[0].id}?set=revisit&i=0`, h("span", { class: "btn btn-ghost" }, `Replay the ${rv.length} marked Revisit `, arrow())); a.addEventListener("click", () => setSell("revisit", rv.map(s => s.id))); return a; })(),
      link("/", h("span", { class: "btn btn-ghost" }, "Home"))),
  );
}
