import { h, s, eyebrow, link, arrow } from "../ui.js";
import { setMeta } from "../app.js";

const principles = [
  {
    n: "01",
    title: "Turn Better Decisions Into Greater Value",
    lede: "The purpose of an algorithm isn't better analysis. It's learning to make better decisions that lead to better results.",
    body: [
      "When you learn algorithms effectively, you become more than someone who just manages accounts. You become a decision maker who can identify opportunities, evaluate trade-offs, act on evidence, and create greater value for both your customers and your company.",
    ],
    tagline: "Better decisions. Greater impact. More value.",
  },
  {
    n: "02",
    title: "Think in Decisions, Not Data",
    lede: "Great salespeople don't need more data. They need better decisions.",
    body: [
      "Algorithms help turn mountains of customer, product, pricing, promotion, and market data into a clearer way to evaluate choices and identify actions that matter the most.",
      "Learn to start with the decision, not the data. Define what you're trying to accomplish, identify the key factors, and use the right information to determine what to do next.",
    ],
    tagline: "Go beyond analysis. Learn to turn data and insight into decisions that create value.",
  },
];

// The Learning Loop: the six practice goals, each asking more than the last. Rendered as rising steps.
const goals = [
  ["Recognize", "Spot the pattern"],
  ["Diagnose", "Find what's really happening"],
  ["Prioritize", "Decide what comes first"],
  ["Act", "Choose with incomplete information"],
  ["Defend", "Make the case to a buyer"],
  ["Lead", "Change how the team works"],
];
const loopIcon = () => s("svg", { viewBox: "0 0 24 24", width: "18", height: "18", fill: "none", stroke: "currentColor", "stroke-width": "1.75", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
  s("path", { d: "M9 14l-4-4 4-4" }), s("path", { d: "M5 10h11a4 4 0 1 1 0 8h-1" }));

function learningLoop() {
  return h("section", { class: "section reveal", "aria-labelledby": "loop-title" },
    eyebrow("The Learning Loop"),
    h("h2", { id: "loop-title", style: { marginTop: "10px" } }, "Six goals. One loop."),
    h("p", { class: "lede", style: { marginTop: "10px", maxWidth: "var(--measure)" } }, "Make the call, see the evidence, keep the principle. Each goal asks more than the last."),
    h("p", { class: "loop-return" }, loopIcon(), "Reach Lead, and the loop starts again at Recognize, one level up."),
    h("ol", { class: "loop-steps" }, goals.map(([name, goal], i) =>
      h("li", { class: `loop-step${i === goals.length - 1 ? " top" : ""}`, dataset: { i: String(i) } },
        h("span", { class: "n" }, String(i + 1).padStart(2, "0")), h("b", {}, name), h("p", {}, goal)))));
}

export default function About() {
  setMeta({ title: "Learning Principles", description: "The rules Decision OS is built on." });
  return h("div", {},
    h("section", { class: "reveal" }, eyebrow("Learning Principles"), h("h1", { class: "hero", style: { marginTop: "16px" } }, "Don't show people algorithms. Let them experience them."),
      h("p", { class: "hero-sub" }, "Decision OS is built on a hard rule: never give a salesperson a recommendation without showing the decision logic. Not the whole model. Enough to answer five questions.")),
    h("section", { class: "section reveal" }, h("div", { class: "card card-sunk" }, h("ol", { style: { margin: 0, paddingLeft: "1.2em", display: "grid", gap: "8px", fontSize: "1.125rem" } }, ["What do they believe?", "Why do they believe it?", "What evidence matters?", "What is uncertain?", "What would change the recommendation?"].map(q => h("li", {}, q))))),
    h("section", { class: "section" }, principles.map(p => h("div", { class: "step reveal", style: { padding: "40px 0" } },
      h("span", { class: "n" }, p.n),
      h("div", { class: "stack", style: { "--gap": "16px", maxWidth: "var(--measure)" } },
        h("h2", {}, p.title),
        h("p", { class: "lede", style: { fontSize: "1.25rem", color: "var(--ink)" } }, p.lede),
        ...p.body.map(t => h("p", { class: "muted", style: { fontSize: "1.0625rem" } }, t)),
        h("p", { style: { fontWeight: 500, marginTop: "6px" } }, p.tagline))))),
    learningLoop(),
    h("section", { class: "section reveal" }, link("/learn", h("span", { class: "btn" }, "Visit the algorithm library ", arrow()))),
  );
}
