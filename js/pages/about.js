import { h, eyebrow, link, arrow } from "../ui.js";
import { setMeta } from "../app.js";
const principles = [
  ["Simplicity", "Every screen has one primary question."],
  ["Restraint", "Lots of whitespace. One strong colour, used for meaning."],
  ["Hierarchy", "One thing is visually dominant."],
  ["Direct manipulation", "Sliders, cards, toggles, comparisons. You move it; it recalculates."],
  ["Teach through use", "The product explains itself as you interact with it."],
  ["Confidence without intimidation", "No walls of numbers. The model shows what it believes, and why."],
];
export default function About() {
  setMeta({ title: "Principles", description: "The rules Decision OS is built on." });
  return h("div", {},
    h("section", { class: "reveal" }, eyebrow("Principles"), h("h1", { class: "hero", style: { marginTop: "16px" } }, "Don't show people algorithms. Let them experience them."),
      h("p", { class: "hero-sub" }, "Decision OS is built on a hard rule: never give a salesperson a recommendation without showing the decision logic. Not the whole model. Enough to answer five questions.")),
    h("section", { class: "section reveal" }, h("div", { class: "card card-sunk" }, h("ol", { style: { margin: 0, paddingLeft: "1.2em", display: "grid", gap: "8px", fontSize: "1.125rem" } }, ["What does it believe?", "Why does it believe it?", "What evidence matters?", "What is uncertain?", "What would change the recommendation?"].map(q => h("li", {}, q))))),
    h("section", { class: "section" }, h("div", { class: "grid grid-2" }, principles.map(([t, d]) => h("div", { class: "card card-quiet reveal" }, h("h3", {}, t), h("p", { class: "muted", style: { marginTop: "8px" } }, d))))),
    h("section", { class: "section reveal" }, link("/learn", h("span", { class: "btn" }, "Visit the algorithm library ", arrow()))),
  );
}
