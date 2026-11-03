import { h, eyebrow, link, arrow } from "../ui.js";
import { setMeta } from "../app.js";

const principles = [
  {
    n: "01",
    title: "Turn Better Decisions Into Greater Value",
    lede: "The purpose of an algorithm isn't better analysis. It's learning to make better decisions that lead to better results.",
    body: [
      "When you learn algorithms, you become more than someone who just manages accounts. You become a decision maker who can identify opportunities, evaluate tradeoffs, act on evidence, and create more value for both your customers and your company.",
    ],
    tagline: "Better decisions. Greater impact. More value.",
  },
  {
    n: "02",
    title: "Think in Decisions, Not Data",
    lede: "Great salespeople don't need more data. They need to know what to do with it.",
    body: [
      "Algorithms give you a way to turn mountains of customer, product, pricing, promotion, and market data into a clearer path forward.",
      "Start with the decision, not the data. Define what you're trying to accomplish. Identify what matters and use the right evidence to decide what to do next.",
    ],
    tagline: "Go beyond analysis. Turn data into decisions that create value.",
  },
];

// The loop as a case stack: six cases on a pallet, the top one pointing back to 01.
function loopStack() {
  const img = h("img", { src: "/public/loop-stack.png", width: "1600", height: "1085", loading: "lazy", decoding: "async",
    alt: "Six shipping cases stacked three, two, one on a pallet, printed 01 Recognize, 02 Diagnose, 03 Prioritize, 04 Act, 05 Defend, 06 Lead. A shelf sign on top reads Back to 01, every quarter." });
  return h("section", { class: "section reveal loop-stack", "aria-labelledby": "loop-title" },
    eyebrow("The Learning Loop"),
    h("h2", { id: "loop-title", style: { marginTop: "10px" } }, "Six goals. One loop."),
    h("p", { class: "lede", style: { marginTop: "10px", maxWidth: "var(--measure)" } }, "Make the call, see the evidence, learn the principle."),
    h("figure", { class: "loop-figure" },
      h("picture", {}, h("source", { srcset: "/public/loop-stack.webp", type: "image/webp" }), img),
      h("figcaption", { class: "muted" }, "Every case builds on the one below it. The top one sends you back to the first.")));
}

export default function About() {
  setMeta({ title: "Learning Principles", description: "The rules Decision OS is built on." });
  return h("div", {},
    h("section", { class: "reveal" }, eyebrow("Learning Principles"), h("h1", { class: "hero", style: { marginTop: "16px" } }, "Don't show people algorithms. Let them experience them."),
      h("p", { class: "hero-sub" }, "Decision OS is built on a hard rule: never give a salesperson a recommendation without showing the decision logic. Not the whole model. Enough to answer five questions.")),
    h("section", { class: "section reveal" }, h("div", { class: "card card-sunk" }, h("ol", { style: { margin: 0, paddingLeft: "1.2em", display: "grid", gap: "8px", fontSize: "1.125rem" } }, ["What do they believe?", "Why do they believe it?", "What evidence matters?", "What is uncertain?", "What would change the recommendation?"].map(q => h("li", {}, q))))),
    h("section", { class: "section" }, principles.map(p => h("div", { class: "step reveal principle" },
      h("span", { class: "n" }, p.n),
      h("div", { class: "stack", style: { "--gap": "16px", maxWidth: "var(--measure)" } },
        h("h2", {}, p.title),
        h("p", { class: "lede", style: { fontSize: "1.25rem", color: "var(--ink)" } }, p.lede),
        ...p.body.map(t => h("p", { class: "muted", style: { fontSize: "1.0625rem" } }, t)),
        h("p", { style: { fontWeight: 500, marginTop: "20px" } }, p.tagline))))),
    loopStack(),
    h("section", { class: "section reveal" }, link("/learn", h("span", { class: "btn" }, "Visit the algorithm library ", arrow()))),
  );
}
