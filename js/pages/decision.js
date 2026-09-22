import { h, link, arrow, eyebrow, metrics, says, disclose } from "../ui.js";
import { decisions, decisionById, accountById, brandById } from "../data.js";
import { widgetFor } from "../lessons/widgets.js";
import { setMeta } from "../app.js";
import { pct } from "../models.js";

const lessonFor = { marginal: "optimization", utility: "utility-and-trade-offs", voi: "value-of-information", ev: "expected-value" };
const algoName = { marginal: "Marginal analysis", utility: "Multi-objective utility", voi: "Value of information", ev: "Expected value" };

export default async function Decision({ id }) {
  const d = decisionById[id];
  if (!d) return (await import("./notfound.js")).default();
  setMeta({ title: d.question, description: d.headline });
  const subject = d.accountId ? `Account: ${accountById[d.accountId].name}` : d.brandId ? `Brand: ${brandById[d.brandId].name}` : "Territory";
  const i = decisions.indexOf(d); const next = decisions[(i + 1) % decisions.length];

  const line = says("Pick an option to see what the model expects. Then ask it why.");
  const optionEls = d.options.map(o => h("button", { type: "button", class: "option", "aria-pressed": "false", onClick: (e) => {
    optionEls.forEach(b => b.setAttribute("aria-pressed", "false")); e.currentTarget.setAttribute("aria-pressed", "true");
    const best = d.options.find(o => o.name === d.preferred) || d.options.reduce((a, b) => (b.margin > a.margin ? b : a));
    line.set(o === best ? `${o.name}: the model's preferred option on margin. ${o.note || ""}`.trim() : `${o.name}: expected volume ${pct(o.volume)}, expected margin ${pct(o.margin)}. The model prefers ${best.name} (${pct(best.volume)} volume, ${pct(best.margin)} margin). See why below.`, o === best ? "good" : "warn");
    document.getElementById("why")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } }, h("h4", {}, o.name), h("dl", {}, h("dt", {}, "Expected volume"), h("dd", { class: o.volume >= 0 ? "good" : "bad" }, pct(o.volume)), h("dt", {}, "Expected margin"), h("dd", { class: o.margin >= 0 ? "good" : "bad" }, pct(o.margin))), o.note ? h("p", { class: "muted", style: { marginTop: "12px", fontSize: "var(--fs-micro)" } }, o.note) : null));

  const why = h("details", { class: "disclose", id: "why" },
    h("summary", {}, h("span", {}, "Why is the model showing this?"), h("span", { class: "plus", "aria-hidden": "true" }, "+")),
    h("div", { class: "disclose-body stack", style: { "--gap": "16px" } },
      h("div", { class: "layer layer-1" }, eyebrow("In plain language"), h("p", { style: { fontSize: "1.125rem" } }, d.plain)),
      h("div", { class: "layer layer-2" }, eyebrow(`Algorithm underneath · ${algoName[d.algorithm]}`), h("p", {}, d.technical)),
      h("div", { class: "card", style: { marginTop: "8px" } }, eyebrow("Try it · 30-second experiment"), h("div", { style: { marginTop: "16px" } }, widgetFor[d.algorithm](d))),
      h("div", { class: "grid grid-2" },
        h("div", { class: "layer layer-2" }, eyebrow("What is uncertain"), h("p", { class: "muted" }, d.uncertain)),
        h("div", { class: "layer layer-2" }, eyebrow("What would change the recommendation"), h("p", { class: "muted" }, d.changes))),
      link(`/learn/${lessonFor[d.algorithm]}`, h("span", { class: "link" }, "Learn the algorithm ", arrow()))));

  return h("article", {},
    h("header", { class: "reveal" }, h("p", { class: "tag" }, subject), h("p", { class: `tag verb-${d.verb.toLowerCase()}`, style: { marginTop: "6px" } }, d.verb),
      eyebrow("Question"), h("h1", { class: "hero", style: { marginTop: "12px", maxWidth: "24ch" } }, d.question)),
    h("section", { class: "section reveal", "aria-labelledby": "sees" }, h("h2", { id: "sees", style: { fontSize: "var(--fs-h3)" } }, "What the model sees"), h("div", { style: { marginTop: "16px" } }, metrics(d.sees))),
    h("section", { class: "section reveal" }, h("h2", { style: { fontSize: "var(--fs-h3)" } }, "The trade-off"), h("p", { class: "lede", style: { marginTop: "12px", fontSize: "1.375rem", lineHeight: 1.35 } }, d.tradeoff)),
    h("section", { class: "section reveal" }, h("h2", { style: { fontSize: "var(--fs-h3)", marginBottom: "16px" } }, "Your options"), h("div", { class: "options" }, ...optionEls), h("div", { style: { marginTop: "16px" } }, line)),
    h("section", { class: "section reveal" }, why),
    h("nav", { class: "section", "aria-label": "Next decision", style: { display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" } },
      link("/decisions", h("span", { class: "btn btn-ghost" }, "All decisions")),
      link(`/decisions/${next.id}`, h("span", { class: "btn" }, `Next: ${next.verb} `, arrow()))),
  );
}
