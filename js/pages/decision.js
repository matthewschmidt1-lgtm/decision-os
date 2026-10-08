import { h, link, arrow, eyebrow, metrics, says, bar, slider } from "../ui.js";
import { decisions, decisionById, accountById, brandById } from "../data.js";
import { widgetFor } from "../lessons/widgets.js";
import { setMeta } from "../app.js";
import { pct, utilityRank } from "../models.js";
import { tracks, scenarios } from "../scenarios.js";
import { setChoice } from "../store.js";

const lessonFor = { marginal: "optimization", utility: "utility-and-trade-offs", voi: "value-of-information", ev: "expected-value" };
const algoName = { marginal: "Marginal analysis", utility: "Multi-objective utility", voi: "Value of information", ev: "Expected value" };
const KEYS = ["volume", "margin", "revenue", "distribution"];
const LABEL = { volume: "Volume", margin: "Margin", revenue: "Revenue", distribution: "Distribution" };
const pts = (v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v)}`;
// An offer changes the options themselves: the ones that qualify gain its bonus.
const withPrize = (options, prize) => options.map((o) => (prize?.hits.includes(o.name) ? { ...o, ...Object.fromEntries(KEYS.map((k) => [k, Math.round((o[k] + (prize.bonus[k] || 0)) * 10) / 10])) } : o));
const rank = (options, w) => utilityRank(options, w);
const shares = (w) => { const t = KEYS.reduce((a, k) => a + w[k], 0); return Object.fromEntries(KEYS.map((k) => [k, t ? Math.round((w[k] / t) * 100) : 0])); };
const weightBars = (w, tone = "accent") => h("div", { class: "bars" }, KEYS.map((k) => bar(LABEL[k], w[k], 100, { tone: w[k] ? tone : "muted", format: (v) => `${Math.round(v)}%` })));

// "Change the objective": three people change what the decision is for. Each round the learner sets the weights, commits
// to an option, then sees what the words implied and what the model picks under them.
function objectiveRounds(d, onDone) {
  const host = h("div", { class: "obj-rounds" }), picks = [];
  const startRound = (n, from) => {
    const s = d.shifts[n], opts = withPrize(d.options, s.prize), w = { ...(s.prize ? d.objective.w : from) };
    const ranking = h("div", { class: "bars" }), sliders = {}, empty = h("p", { class: "muted obj-empty", hidden: true }, "Give at least one objective some importance before you commit.");
    // Each slider is how much that objective matters, on its own. Shares of 100% are worked out for you, so the learner
    // can reach any mix in any order and nothing moves by itself.
    const draw = () => {
      const on = KEYS.some((k) => w[k] > 0);
      KEYS.forEach((k) => sliders[k].set(w[k]));
      ranking.replaceChildren(...rank(opts, w).map((o, i) => bar(o.name, o.utility, 100, { tone: i === 0 && on ? "accent" : "muted", format: (v) => v.toFixed(0) })));
      empty.hidden = on; commitBtns?.forEach((btn) => { if (!result.hidden) return; btn.disabled = !on; });
    };
    KEYS.forEach((k) => { sliders[k] = slider({ label: LABEL[k], min: 0, max: 100, step: 5, value: w[k], format: () => `${shares(w)[k]}%`, onInput: (v) => { w[k] = v; draw(); } }); });
    const result = h("div", { class: "obj-result", hidden: true });
    const commitBtns = opts.map((o) => h("button", { type: "button", onClick: () => commit(o) }, o.name));
    draw();
    const commit = (o) => {
      commitBtns.forEach((b) => { b.disabled = true; b.setAttribute("aria-pressed", String(b.textContent === o.name)); });
      Object.values(sliders).forEach((sl) => sl.querySelector("input").disabled = true);
      const theirs = rank(opts, s.w), best = theirs[0], mine = theirs.find((x) => x.name === o.name), yours = rank(opts, w)[0], sw = shares(w);
      const gap = KEYS.map((k) => [k, sw[k] - s.w[k]]).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
      const right = o.name === best.name, close = !right && best.utility - mine.utility <= 5;
      const under = s.prize ? "with the offer counted and your plan's objective" : `under what ${s.who.replace(/^Your /, "your ")} said`, Under = under[0].toUpperCase() + under.slice(1);
      // What puts the winner ahead: the objective where it beats the learner's pick by the most, weighted.
      const span = (k) => { const v = opts.map((x) => x[k]); return Math.max(...v) - Math.min(...v) || 1; };
      const edge = KEYS.map((k) => [k, s.w[k] * ((best[k] - mine[k]) / span(k))]).sort((a, b) => b[1] - a[1])[0][0];
      picks.push({ who: s.who, name: best.name });
      const nextBtn = n + 1 < d.shifts.length
        ? h("button", { type: "button", class: "btn", onClick: () => { nextBtn.remove(); startRound(n + 1, { ...w }); } }, `Next: ${d.shifts[n + 1].who} `, arrow())
        : h("button", { type: "button", class: "btn", onClick: () => { nextBtn.remove(); onDone(picks); } }, "See what changed ", arrow());
      result.replaceChildren(
        right ? says(`${o.name}: the same call the model makes ${under}.`, "good")
          : close ? says(`Close call. ${Under}, ${best.name} scores ${best.utility.toFixed(0)} and ${o.name} scores ${mine.utility.toFixed(0)}, so both are defensible. ${best.name} edges ahead on ${edge}.`, "")
          : says(`${Under}, ${best.name} scores highest (${best.utility.toFixed(0)} of 100); ${o.name} scores ${mine.utility.toFixed(0)}.${yours.name === o.name ? ` ${o.name} was the top option under your own weights, so the gap is in ${s.prize ? "how you weighed the offer" : "how you read the objective"}.` : ""}`, "warn"),
        h("div", { class: "grid grid-2 obj-compare" },
          h("div", {}, eyebrow("Your weights"), weightBars(sw, "muted")),
          h("div", {}, eyebrow(s.prize ? "Your plan's objective" : "What their words imply"), weightBars(s.w))),
        ...(Math.abs(gap[1]) >= 20 ? [h("p", { class: "muted obj-gap" }, `Biggest gap: you put ${sw[gap[0]]}% on ${gap[0]}; ${s.prize ? "the plan puts" : "their words point to about"} ${s.w[gap[0]]}%.`)] : []),
        h("p", { class: "obj-lesson" }, s.lesson), nextBtn);
      result.hidden = false;
    };
    const card = h("div", { class: "card obj-round" },
      h("p", { class: "tag" }, `${n + 1} of ${d.shifts.length} · ${s.who}`),
      h("blockquote", { class: "obj-quote" }, `“${s.quote}”`),
      s.prize ? h("div", { class: "obj-prize" }, h("b", {}, "The offer changes the options. "), s.prize.text, h("span", { class: "muted" }, " Your objective is back to the plan's; the options are what's different.")) : null,
      h("p", { class: "obj-ask" }, s.prize ? "What does the offer change? Adjust the weights if you want, then commit." : "What changes? Set the weights to match what they said, then commit to an option."),
      h("div", { class: "grid grid-2 obj-work" },
        h("div", { class: "stack", style: { "--gap": "20px" } }, ...KEYS.map((k) => sliders[k]), h("p", { class: "muted", style: { fontSize: "var(--fs-micro)" } }, "Each slider sets how much that objective matters. The shares of 100% are worked out for you."), empty),
        h("div", {}, eyebrow("Score under your weights"), h("div", { style: { marginTop: "10px" } }, ranking))),
      h("div", { class: "obj-commit" }, h("span", { class: "muted" }, "Commit to:"), ...commitBtns),
      result);
    host.append(card);
    if (n) card.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  host.start = () => startRound(0, { ...d.objective.w });
  return host;
}

// One change per decision that isn't about weights: an offer or a push that changes the payoffs. The learner sees each
// option's parts (and their odds), commits, then sees what each is worth. The arithmetic is the lesson.
const twistHow = { marginal: "judge the extra dollars by everything they bring back.", voi: "compare acting now with finding out first.", ev: "multiply each chance by what it's worth, and add it up." };
const $k = (v) => (v === 0 ? "$0" : `${v < 0 ? "−" : "+"}$${Math.abs(v) % 1 ? Math.abs(v).toFixed(1) : Math.abs(v)}K`);
export const twistValue = (o) => o.lines.reduce((a, l) => a + (l.p ?? 1) * l.value, 0);
function twistRound(d, practiceLink) {
  const t = d.twist, host = h("div", { class: "obj-rounds" });
  host.start = () => {
    const worth = t.options.map((o) => ({ o, v: twistValue(o) })), best = worth.reduce((a, b) => (b.v > a.v ? b : a));
    const cards = t.options.map((o) => h("button", { type: "button", class: "option twist-opt", "aria-pressed": "false", onClick: () => commit(o) },
      h("h4", {}, o.name),
      h("ul", { class: "twist-lines" }, o.lines.map((l) => h("li", {}, h("span", {}, l.label), h("b", {}, l.p != null ? `${Math.round(l.p * 100)}% × ${$k(l.value)}` : $k(l.value))))),
      h("p", { class: "twist-worth" })));
    const result = h("div", { class: "obj-result", hidden: true });
    const commit = (o) => {
      cards.forEach((c, i) => { c.disabled = true; c.setAttribute("aria-pressed", String(t.options[i] === o)); c.classList.toggle("preferred", t.options[i] === best.o);
        c.querySelector(".twist-worth").textContent = `Worth about ${$k(Math.round(worth[i].v))}`; });
      const mine = worth.find((x) => x.o === o).v, right = o === best.o, close = !right && best.v - mine <= 5;
      result.replaceChildren(
        says(right ? `${o.name}: the model's call too, at about ${$k(Math.round(best.v))}.` : close ? `Close call. ${best.o.name} is worth about ${$k(Math.round(best.v))} and ${o.name} about ${$k(Math.round(mine))}; both are defensible.` : `${best.o.name} is worth about ${$k(Math.round(best.v))}; ${o.name} about ${$k(Math.round(mine))}.`, right ? "good" : close ? "" : "warn"),
        h("p", { class: "obj-lesson" }, t.lesson), practiceLink());
      result.hidden = false;
    };
    host.append(h("div", { class: "card obj-round" },
      h("p", { class: "tag" }, t.who), h("blockquote", { class: "obj-quote" }, `“${t.quote}”`),
      h("p", { class: "obj-ask" }, t.ask),
      h("div", { class: "options twist-opts" }, ...cards), result));
  };
  return host;
}

export default async function Decision({ id }) {
  const d = decisionById[id];
  if (!d) return (await import("./notfound.js")).default();
  setMeta({ title: d.question, description: d.headline });
  const subject = d.accountId ? `Account: ${accountById[d.accountId].name}` : d.brandId ? `Brand: ${brandById[d.brandId].name}` : "Territory";
  const i = decisions.indexOf(d); const isLast = i === decisions.length - 1; const next = decisions[i + 1];
  const best = d.options.find(o => o.name === d.preferred) || d.options.reduce((a, b) => (b.margin > a.margin ? b : a));

  const planRank = rank(d.options, d.objective.w);
  const fitOf = (o) => planRank.find((r) => r.name === o.name).utility;
  const line = says("Pick the option that best serves the objective above. Then see what the model picks, and why.");
  const choose = (o, el, { scroll = true } = {}) => {
    optionEls.forEach(b => b.setAttribute("aria-pressed", "false")); el.setAttribute("aria-pressed", "true");
    revealPreferred();
    setChoice(d.id, o.name);
    if (o === best) line.set(`${o.name}: the option the model prefers for "${d.objective.short.toLowerCase()}". ${o.note || ""} Open the reasoning to see what it's assuming.`.replace("  ", " "), "good");
    else {
      const dm = best.margin - o.margin, dv = best.volume - o.volume;
      line.set(`${o.name} is a reasonable instinct. ${best.name} expects ${dm > 0 ? `${dm.toFixed(1)} pts more margin` : `${Math.abs(dm).toFixed(1)} pts less margin`} ${dv >= 0 ? `and ${dv.toFixed(0)} pts more volume` : `for ${Math.abs(dv).toFixed(0)} pts less volume`}. The reasoning below shows why the model weighs it that way.`, "warn");
    }
    why.open = true; if (scroll) why.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // The "Model prefers" badge and the reasoning stay hidden until the user has committed to an answer.
  const revealPreferred = () => {
    optionEls.forEach((b, n) => { b.classList.toggle("preferred", d.options[n] === best); b.querySelector(".fit").textContent = `Fit to the objective: ${fitOf(d.options[n]).toFixed(0)} of 100`; });
    whySection.hidden = false; whySection.classList.add("in");
    if (roundsSection.hidden) { roundsSection.hidden = false; roundsSection.classList.add("in"); rounds.start(); }
  };
  const optionEls = d.options.map(o => h("button", { type: "button", class: "option", "aria-pressed": "false", onClick: (e) => choose(o, e.currentTarget) }, h("h4", {}, o.name), h("dl", {}, h("dt", {}, "Expected volume"), h("dd", { class: o.volume >= 0 ? "good" : "bad" }, pct(o.volume)), h("dt", {}, "Expected margin"), h("dd", { class: o.margin >= 0 ? "good" : "bad" }, pct(o.margin)), h("dt", {}, "Expected revenue"), h("dd", { class: o.revenue >= 0 ? "good" : "bad" }, pct(o.revenue)), h("dt", {}, "Distribution"), h("dd", { class: o.distribution > 0 ? "good" : o.distribution < 0 ? "bad" : "" }, `${pts(o.distribution)} pts`)), h("p", { class: "fit" }), o.note ? h("p", { class: "muted", style: { marginTop: "12px", fontSize: "var(--fs-micro)" } }, o.note) : null));

  const why = h("details", { class: "disclose", id: "why" },
    h("summary", {}, h("span", {}, "Why is the model showing this?"), h("span", { class: "plus", "aria-hidden": "true" }, "+")),
    h("div", { class: "disclose-body stack", style: { "--gap": "16px" } },
      h("div", { class: "layer layer-1" }, eyebrow("In plain language"), h("p", { style: { fontSize: "1.125rem" } }, d.plain)),
      h("div", { class: "layer layer-2" }, eyebrow(`Algorithm underneath · ${algoName[d.algorithm]}`), h("p", {}, d.technical)),
      h("div", { class: "card", style: { marginTop: "8px" } }, eyebrow("Try it · 30-second experiment"), h("div", { style: { marginTop: "16px" } }, widgetFor[d.algorithm](d)), h("p", { class: "muted", style: { marginTop: "14px", fontSize: "var(--fs-micro)" } }, "Illustrative model. The shape of the reasoning is real; the constants are teaching values, not fitted to this account.")),
      h("div", { class: "grid grid-2" },
        h("div", { class: "layer layer-2" }, eyebrow("What is uncertain"), h("p", { class: "muted" }, d.uncertain)),
        h("div", { class: "layer layer-2" }, eyebrow("What would change the recommendation"), h("p", { class: "muted" }, d.changes))),
      link(`/learn/${lessonFor[d.algorithm]}`, h("span", { class: "link" }, "Learn the algorithm ", arrow()))));

  const whySection = h("section", { class: "section reveal", hidden: true }, why);
  const track = tracks.find((t) => t.id === d.track), trackFirst = track && scenarios.find(track.filter);
  const practiceLink = () => track ? link(`/practice/${trackFirst.id}?set=${track.id}&i=0`, h("span", { class: "link", style: { marginTop: "12px", display: "inline-flex" } }, `Now get tested on it: ${track.title} `, arrow())) : null;
  const summary = h("div", { class: "obj-summary", hidden: true });
  // One round per decision, built on that decision's own algorithm: weighing objectives only where the lesson is weighing
  // objectives (utility); everywhere else, something changes the payoffs and the learner works the numbers.
  const weighted = d.algorithm === "utility" && d.shifts?.length;
  const rounds = weighted ? objectiveRounds(d, (picks) => {
    const all = [{ who: d.objective.who, name: best.name }, ...picks], distinct = new Set(all.map((p) => p.name)).size;
    summary.replaceChildren(
      eyebrow("What changed"), h("h3", { style: { marginTop: "8px" } }, distinct > 1 ? `Same options. ${distinct} different right answers.` : "Same answer every time, for different reasons."),
      h("ol", { class: "obj-trail" }, all.map((p) => h("li", {}, h("span", {}, p.who), h("b", {}, p.name)))),
      h("p", { class: "lede", style: { marginTop: "14px" } }, "The data didn't change. The objective did. Before you choose, say what you're optimizing for, and ask again when someone changes it."),
      practiceLink());
    summary.hidden = false; summary.scrollIntoView({ behavior: "smooth", block: "start" });
  }) : twistRound(d, practiceLink);
  const roundsSection = h("section", { class: "section reveal", hidden: true, "aria-labelledby": "change-obj" },
    ...(weighted
      ? [eyebrow("Change the objective"), h("h2", { id: "change-obj", style: { marginTop: "10px" } }, "Same decision. Now the objective moves."),
        h("p", { class: "muted", style: { marginTop: "8px", maxWidth: "var(--measure)" } }, "Two people are about to change what this decision is for. Each time, turn what they said into weights, and commit.")]
      : [eyebrow("Then something changes"), h("h2", { id: "change-obj", style: { marginTop: "10px" } }, "Same decision. New numbers."),
        h("p", { class: "muted", style: { marginTop: "8px", maxWidth: "var(--measure)" } }, `Work it the way the model does: ${twistHow[d.algorithm]}`)]),
    h("div", { style: { marginTop: "20px" } }, rounds), summary);
  // Returning to an answered decision starts fresh, like Practice: no hint of the earlier answer, and the badge and reasoning wait for a new choice.
  return h("article", {},
    h("header", { class: "reveal" }, h("div", { class: "tags" }, h("p", { class: "tag" }, subject), h("p", { class: `tag verb-${d.verb.toLowerCase()}` }, d.verb)),
      h("p", { class: "eyebrow", style: { marginTop: "20px" } }, "Question"), h("h1", { class: "hero", style: { marginTop: "12px", maxWidth: "24ch" } }, d.question)),
    h("section", { class: "section reveal", "aria-labelledby": "sees" }, h("h2", { id: "sees", style: { fontSize: "var(--fs-h3)" } }, "What the model sees"), h("div", { style: { marginTop: "16px" } }, metrics(d.sees))),
    h("section", { class: "section reveal", "aria-labelledby": "objective" }, h("div", { class: "card obj-card" },
      h("div", {}, eyebrow("The objective"), h("h2", { id: "objective", style: { fontSize: "var(--fs-h3)", marginTop: "8px" } }, d.objective.text),
        h("p", { class: "muted", style: { marginTop: "8px", fontSize: "var(--fs-small)" } }, `Set by ${d.objective.who.replace(/^Your /, "your ")}. Every recommendation on this page means "best for this objective." Change the objective and the best answer can change.`)),
      weightBars(d.objective.w))),
    h("section", { class: "section reveal" }, h("h2", { style: { fontSize: "var(--fs-h3)" } }, "The trade-off"), h("p", { class: "lede", style: { marginTop: "12px", fontSize: "1.375rem", lineHeight: 1.35 } }, d.tradeoff)),
    h("section", { class: "section reveal" }, h("h2", { style: { fontSize: "var(--fs-h3)", marginBottom: "16px" } }, "Your options"), h("div", { class: "options" }, ...optionEls), h("div", { style: { marginTop: "16px" } }, line)),
    whySection,
    roundsSection,
    h("nav", { class: "section nav-pair", "aria-label": "Next decision" },
      link("/decisions", h("span", { class: "btn btn-ghost" }, "All decisions")),
      isLast ? link("/portfolio", h("span", { class: "btn" }, "You've seen all four. Now run the portfolio for a year ", arrow()))
             : link(`/decisions/${next.id}`, h("span", { class: "btn" }, `Next: ${next.verb} `, arrow()))),
  );
}
