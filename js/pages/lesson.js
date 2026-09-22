import { h, link, arrow, eyebrow } from "../ui.js";
import { lessons, lessonBySlug } from "../lessons/index.js";
import { decisionById } from "../data.js";
import { widgetFor } from "../lessons/widgets.js";
import { setMeta } from "../app.js";

export default async function Lesson({ id }) {
  const l = lessonBySlug[id];
  if (!l) return (await import("./notfound.js")).default();
  setMeta({ title: l.title, description: l.tagline });
  const i = lessons.indexOf(l); const next = lessons[(i + 1) % lessons.length];
  const d = l.decision ? decisionById[l.decision] : null;
  const widget = widgetFor[l.widget](d || {});
  const step = (n, title, body) => h("section", { class: "step reveal", style: { padding: "36px 0" } }, h("span", { class: "n" }, n), h("div", { class: "stack", style: { "--gap": "14px", minWidth: 0 } }, h("h2", { style: { fontSize: "var(--fs-h3)" } }, title), body));
  return h("article", {},
    h("header", { class: "reveal" }, eyebrow(`Algorithm ${String(i + 1).padStart(2, "0")}`), h("h1", { class: "hero", style: { marginTop: "16px" } }, l.title), h("p", { class: "hero-sub" }, l.tagline)),
    h("div", { class: "section" },
      step("01", "Concept", [h("p", { class: "lede" }, l.concept), h("p", { class: "mono muted", style: { fontSize: "var(--fs-small)", padding: "12px 16px", background: "var(--bg-sunk)", borderRadius: "var(--r-sm)", display: "inline-block" } }, l.formula)]),
      step("02", "Try it", [h("p", { class: "muted" }, "Change something. Watch the answer move. That's the whole lesson."), h("div", { class: "card", style: { marginTop: "8px" } }, widget)]),
      step("03", "See it in sales", [h("p", { class: "lede" }, l.sales), d ? link(`/decisions/${d.id}`, h("span", { class: "link" }, `Open the real decision: ${d.verb} ${d.headline} `, arrow())) : null]),
      step("04", "Apply it", h("ul", { style: { margin: 0, paddingLeft: "1.2em", display: "grid", gap: "8px" } }, l.apply.map(a => h("li", {}, a))))),
    h("nav", { class: "section", "aria-label": "Next lesson", style: { display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" } },
      link("/learn", h("span", { class: "btn btn-ghost" }, "All algorithms")), link(`/learn/${next.slug}`, h("span", { class: "btn" }, `Next: ${next.title} `, arrow()))),
  );
}
