import { h, link, arrow, eyebrow } from "../ui.js";
import { lessons } from "../lessons/index.js";
import { setMeta } from "../app.js";
export default function Learn() {
  setMeta({ title: "Algorithms", description: "How machines make decisions under uncertainty. An interactive library, not a course." });
  return h("div", {},
    h("section", { class: "reveal" }, eyebrow("Algorithms"), h("h1", { class: "hero", style: { marginTop: "16px" } }, "How machines make decisions under uncertainty."),
      h("p", { class: "hero-sub" }, "Nine ideas. Each one is a 30-second experiment, then a sales situation, then something to do differently tomorrow.")),
    h("section", { class: "grid grid-3", style: { marginTop: "48px" } }, lessons.map((l, i) => link(`/learn/${l.slug}`, h("span", { class: "card clickable reveal", style: { display: "flex", flexDirection: "column", height: "100%" } },
      h("span", { class: "tag" }, String(i + 1).padStart(2, "0")), h("h3", { style: { marginTop: "14px" } }, l.title), h("p", { class: "muted", style: { marginTop: "8px", fontSize: "var(--fs-small)", flex: 1 } }, l.tagline),
      h("span", { class: "muted", style: { marginTop: "20px", fontSize: "var(--fs-micro)", letterSpacing: ".02em" } }, "Concept → Try it → See it in sales → Apply it"))))),
  );
}
