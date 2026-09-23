import { h, link, arrow, eyebrow, metrics, says, disclose } from "../ui.js";
import { decisions, decisionById, accountById, brandById } from "../data.js";
import { widgetFor } from "../lessons/widgets.js";
import { setMeta } from "../app.js";
import { pct } from "../models.js";
import { getChoice, setChoice } from "../store.js";

const lessonFor = { marginal: "optimization", utility: "utility-and-trade-offs", voi: "value-of-information", ev: "expected-value" };
const algoName = { marginal: "Marginal analysis", utility: "Multi-objective utility", voi: "Value of information", ev: "Expected value" };

export default async function Decision({ id }) {
  const d = decisionById[id];
  if (!d) return (await import("./notfound.js")).default();
  setMeta({ title: d.question, description: d.headline });
  const subject = d.accountId ? `Account: ${accountById[d.accountId].name}` : d.brandId ? `Brand: ${brandById[d.brandId].name}` : "Territory";
  const i = decisions.indexOf(d); const isLast = i === decisions.length - 1; const next = decisions[i + 1];
  const best = d.options.find(o => o.name === d.preferred) || d.options.reduce((a, b) => (b.margin > a.margin ? b : a));
  const prior = getChoice(d.id);

  const line = says(prior ? `Last time you chose ${prior.option}. Pick again, or open the reasoning below.` : "Pick an option to see what the model expects. Then ask it why.");
  const choose = (o, el, { scroll = true } = {}) => {
    optionEls.forEach(b => b.setAttribute("aria-pressed", "false")); el.setAttribute("aria-pressed", "true");
    revealPreferred();
    setChoice(d.id, o.name);
    if (o === best) line.set(`${o.name}: the option the model prefers. ${o.note || ""} Open the reasoning to see what it's assuming.`.replace("  ", " "), "good");
    else {
      const dm = best.margin - o.margin, dv = best.volume - o.volume;
      line.set(`${o.name} is a reasonable instinct. ${best.name} expects ${dm > 0 ? `${dm.toFixed(1)} pts more margin` : `${Math.abs(dm).toFixed(1)} pts less margin`} ${dv >= 0 ? `and ${dv.toFixed(0)} pts more volume` : `for ${Math.abs(dv).toFixed(0)} pts less volume`}. The reasoning below shows why the model weighs it that way.`, "warn");
    }
    why.open = true; if (scroll) why.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // The "Model prefers" badge and the reasoning stay hidden until the user has committed to an answer.
  const revealPreferred = () => { optionEls.forEach((b, n) => b.classList.toggle("preferred", d.options[n] === best)); whySection.hidden = false; whySection.classList.add("in"); };
  const optionEls = d.options.map(o => h("button", { type: "button", class: "option", "aria-pressed": "false", onClick: (e) => choose(o, e.currentTarget) }, h("h4", {}, o.name), h("dl", {}, h("dt", {}, "Expected volume"), h("dd", { class: o.volume >= 0 ? "good" : "bad" }, pct(o.volume)), h("dt", {}, "Expected margin"), h("dd", { class: o.margin >= 0 ? "good" : "bad" }, pct(o.margin))), o.note ? h("p", { class: "muted", style: { marginTop: "12px", fontSize: "var(--fs-micro)" } }, o.note) : null));

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
  // Returning to an answered decision: restore the selection, the badge and the open reasoning.
  const priorIdx = prior ? d.options.findIndex(o => o.name === prior.option) : -1;
  if (priorIdx >= 0) { optionEls[priorIdx].setAttribute("aria-pressed", "true"); revealPreferred(); why.open = true; }
  return h("article", {},
    h("header", { class: "reveal" }, h("p", { class: "tag" }, subject), h("p", { class: `tag verb-${d.verb.toLowerCase()}`, style: { marginTop: "6px" } }, d.verb),
      eyebrow("Question"), h("h1", { class: "hero", style: { marginTop: "12px", maxWidth: "24ch" } }, d.question)),
    h("section", { class: "section reveal", "aria-labelledby": "sees" }, h("h2", { id: "sees", style: { fontSize: "var(--fs-h3)" } }, "What the model sees"), h("div", { style: { marginTop: "16px" } }, metrics(d.sees))),
    h("section", { class: "section reveal" }, h("h2", { style: { fontSize: "var(--fs-h3)" } }, "The trade-off"), h("p", { class: "lede", style: { marginTop: "12px", fontSize: "1.375rem", lineHeight: 1.35 } }, d.tradeoff)),
    h("section", { class: "section reveal" }, h("h2", { style: { fontSize: "var(--fs-h3)", marginBottom: "16px" } }, "Your options"), h("div", { class: "options" }, ...optionEls), h("div", { style: { marginTop: "16px" } }, line)),
    whySection,
    h("nav", { class: "section", "aria-label": "Next decision", style: { display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" } },
      link("/decisions", h("span", { class: "btn btn-ghost" }, "All decisions")),
      isLast ? link("/portfolio#attention", h("span", { class: "btn" }, "You've seen all four. Where do your next 10 hours go? ", arrow()))
             : link(`/decisions/${next.id}`, h("span", { class: "btn" }, `Next: ${next.verb} `, arrow()))),
  );
}
