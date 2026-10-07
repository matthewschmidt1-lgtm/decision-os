import { h, s, eyebrow, link, arrow } from "../ui.js";
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

// The Learning Loop: the six practice goals, each asking more than the last. Rendered as rising steps.
const goals = [
  ["Recognize", "See the pattern"],
  ["Diagnose", "Understand what’s driving it"],
  ["Prioritize", "Decide what matters most"],
  ["Act", "Choose under uncertainty"],
  ["Defend", "Make the case"],
  ["Lead", "Change how decisions get made"],
];

const LOOP_STEP_MS = 1400;

// "Six goals, one loop": light the steps 01 → 06, send a pulse back along the arrow, repeat.
// Runs only while the section is on screen; under reduced motion it stays still with step 06 lit.
function playLoop(wrap, ol, steps, arc) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let at = -1, timer = null, hold = false;
  const show = (i) => { at = i; wrap.dataset.active = String(i); steps.forEach((el, j) => el.classList.toggle("on", j === i)); };
  const stop = () => { clearInterval(timer); timer = null; };
  const run = () => { stop(); timer = setInterval(() => { if (!ol.isConnected) stop(); else if (!hold && !document.hidden) show((at + 1) % steps.length); }, LOOP_STEP_MS); };

  // The loop-back arrow runs from the top of step 06 to the top of step 01, measured so it follows the layout.
  const draw = () => {
    const w = wrap.getBoundingClientRect(), a = steps[0].getBoundingClientRect(), b = steps[steps.length - 1].getBoundingClientRect();
    const x0 = a.left + a.width / 2 - w.left, y0 = a.top - w.top, x1 = b.left + b.width / 2 - w.left, y1 = b.top - w.top;
    const d = `M${x1},${y1 - 3} C${x1},${y1 - 44} ${x0},${y0 - 70} ${x0},${y0 - 5}`;
    arc.svg.setAttribute("viewBox", `0 0 ${w.width} ${w.height}`);
    arc.line.setAttribute("d", d); arc.pulse.setAttribute("d", d);
    arc.head.setAttribute("d", `M${x0 - 5},${y0 - 11} L${x0},${y0 - 4} L${x0 + 5},${y0 - 11}`);
  };
  requestAnimationFrame(draw);
  if ("ResizeObserver" in window) new ResizeObserver(draw).observe(wrap); else addEventListener("resize", draw);

  if (reduce) { show(steps.length - 1); return; }
  steps.forEach((el, i) => {
    el.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && timer) { hold = true; show(i); } });
    el.addEventListener("pointerleave", () => { if (hold) { hold = false; run(); } });
  });
  if (!("IntersectionObserver" in window)) return;
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return stop();
    wrap.dataset.run = "";
    if (at < 0) show(0);
    run();
  }, { threshold: 0.4 }).observe(wrap);
}

function learningLoop() {
  const steps = goals.map(([name, goal], i) =>
    h("li", { class: `loop-step${i === goals.length - 1 ? " top" : ""}`, dataset: { i: String(i) } },
      h("span", { class: "n" }, String(i + 1).padStart(2, "0")), h("b", {}, name), h("p", {}, goal)));
  const ol = h("ol", { class: "loop-steps" }, steps);
  const arc = { line: s("path", { class: "line", pathLength: "1" }), pulse: s("path", { class: "pulse", pathLength: "1" }), head: s("path", { class: "head" }) };
  arc.svg = s("svg", { class: "loop-arrow", "aria-hidden": "true", focusable: "false" }, arc.line, arc.pulse, arc.head);
  const wrap = h("div", { class: "loop-wrap" }, arc.svg, ol);
  playLoop(wrap, ol, steps, arc);
  return h("section", { class: "section reveal", "aria-labelledby": "loop-title" },
    eyebrow("The Learning Loop"),
    h("h2", { id: "loop-title", style: { marginTop: "10px" } }, "Six goals. One loop."),
    h("p", { class: "lede", style: { marginTop: "10px", maxWidth: "var(--measure)" } }, "Make the call, see the evidence, learn the principle."),
    wrap);
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
