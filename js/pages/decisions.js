import { h, link, arrow, eyebrow, metric } from "../ui.js";
import { decisions, blindspots, accountById } from "../data.js";
import { setMeta } from "../app.js";

export default function Decisions() {
  setMeta({ title: "Decisions", description: "Your opportunities and trade-offs, ranked by what matters." });
  return h("div", {},
    h("section", { class: "reveal" }, eyebrow("Decisions"), h("h1", { class: "hero", style: { marginTop: "16px" } }, "What should you do next, given what you know?"),
      h("p", { class: "hero-sub" }, "Four situations where the obvious move and the best move may differ. Each one shows its reasoning.")),
    h("section", { class: "grid grid-2 reveal", style: { marginTop: "48px" } },
      decisions.map(d => link(`/decisions/${d.id}`, h("span", { class: "card clickable", style: { display: "block", height: "100%" } },
        h("span", { class: `tag verb-${d.verb.toLowerCase()}`, style: { display: "block" } }, d.verb),
        h("h3", { style: { marginTop: "14px" } }, d.question),
        h("p", { class: "muted", style: { marginTop: "10px", fontSize: "var(--fs-small)" } }, d.accountId ? accountById[d.accountId].name : d.brandId ? `Brand ${d.brandId}` : ""),
        h("span", { class: "link", style: { marginTop: "22px", display: "inline-flex" } }, "Open decision ", arrow()))))),
    h("section", { class: "section", id: "blindspots" },
      h("div", { class: "section-head reveal" }, h("div", {}, eyebrow("Blindspots"), h("h2", { style: { marginTop: "10px" } }, "Where the obvious metric is misleading.")),
        h("p", { class: "muted", style: { maxWidth: "38ch" } }, "The system continuously searches for situations where one number is up and the number that matters isn't.")),
      h("div", { class: "grid grid-2" }, blindspots.map(b => h("article", { class: "card reveal" },
        h("h3", {}, b.title),
        h("div", { class: "metrics", style: { marginTop: "16px", gridTemplateColumns: "1fr" } }, b.rows.map(([k, v]) => metric(k, v))),
        h("p", { class: "muted", style: { marginTop: "16px", fontSize: "var(--fs-small)" } }, b.read),
        link(`/decisions/${b.decisionId}`, h("span", { class: "link", style: { marginTop: "14px", display: "inline-flex", fontSize: "var(--fs-small)" } }, "Related decision ", arrow())))))),
  );
}
