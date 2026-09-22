import { h, link, arrow, eyebrow, metrics, says } from "../ui.js";
import { accountById, decisions, distributors, brandById, channels } from "../data.js";
import { evWidget, fingerprintWidget } from "../lessons/widgets.js";
import { expectedValue, money, pct } from "../models.js";
import { setMeta } from "../app.js";

export default async function Account({ id }) {
  const a = accountById[id];
  if (!a) return (await import("./notfound.js")).default();
  setMeta({ title: a.name, description: `${a.name}: ${channels[a.channel].name} account served by ${distributors.find(d => d.id === a.distributor).name}.` });
  const dist = distributors.find(d => d.id === a.distributor);
  const related = decisions.filter(d => d.accountId === a.id || d.distributorId === a.distributor);
  const ev = expectedValue(a);
  const rows = a.channel === "on"
    ? [["Rate of sale", a.velocity], ["Volume", a.volume], ["Margin", a.margin], ["Placements", a.distribution, ""], ["Menu presence", a.velocity > 5 ? "strong" : "thin", a.velocity > 5 ? "good" : "warn"], ["Distributor relationship", a.probability > 0.5 ? "strong" : "developing", a.probability > 0.5 ? "good" : "warn"]]
    : [["Velocity", a.velocity], ["Volume", a.volume], ["Margin", a.margin], ["Trade spend", a.trade], ["Distribution (SKUs)", a.distribution, ""], ["Distributor inventory", a.distributorInventory ?? dist.inventory, dist.inventory > 10 ? "warn" : ""]];

  return h("article", {},
    h("header", { class: "reveal" }, h("p", { class: "tag" }, `${channels[a.channel].name} · ${dist.name} · ${a.store}`), h("h1", { class: "hero", style: { marginTop: "12px" } }, a.name),
      h("div", { class: "facts", style: { marginTop: "18px" } }, h("span", {}, "Brands", h("b", {}, a.brands.map(b => brandById[b].name).join(", "))), h("span", {}, "Expected value", h("b", {}, money(ev))), h("span", {}, "P(win)", h("b", {}, `${Math.round(a.probability * 100)}%`)))),
    h("section", { class: "section reveal" }, h("h2", { style: { fontSize: "var(--fs-h3)" } }, "What the model sees"), h("div", { style: { marginTop: "16px" } }, metrics(rows))),
    related.length ? h("section", { class: "section reveal" }, h("h2", { style: { fontSize: "var(--fs-h3)", marginBottom: "12px" } }, "Decisions involving this account"),
      related.map(d => link(`/decisions/${d.id}`, h("span", { class: "decision-row" }, h("span", { class: `verb verb-${d.verb.toLowerCase()}` }, d.verb), h("span", { class: "body" }, d.question), arrow())))) : null,
    h("section", { class: "section reveal" }, h("div", { class: "card" }, eyebrow("Is this account worth pursuing?"), h("div", { style: { marginTop: "16px" } }, evWidget({ p: a.probability, value: a.value, cost: a.cost })))),
    h("section", { class: "section reveal" }, h("div", { class: "card" }, eyebrow("Economic fingerprint"), h("div", { style: { marginTop: "16px" } }, fingerprintWidget({ volume: a.volume, price: Math.round(a.margin), tradeSpend: a.trade })))),
    h("nav", { class: "section", style: { display: "flex", gap: "16px" } }, link("/accounts", h("span", { class: "btn btn-ghost" }, "All accounts"))),
  );
}
