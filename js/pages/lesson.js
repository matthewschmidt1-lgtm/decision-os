import { h, link, arrow, eyebrow, says } from "../ui.js";
import { tracks, scenarios } from "../scenarios.js";
import { lessons, lessonBySlug } from "../lessons/index.js";
import { decisionById } from "../data.js";
import { widgetFor } from "../lessons/widgets.js";
import { setMeta } from "../app.js";

export default async function Lesson({ id }) {
  const l = lessonBySlug[id];
  if (!l) return (await import("./notfound.js")).default();
  setMeta({ title: l.title, description: l.tagline });
  const i = lessons.indexOf(l); const next = lessons[i + 1];
  const d = l.decision ? decisionById[l.decision] : null;
  if (l.drill) return drillPage(l, d, i, next);
  const widget = widgetFor[l.widget](d || {});
  const step = (n, title, body) => h("section", { class: "step reveal", style: { padding: "36px 0" } }, h("span", { class: "n" }, n), h("div", { class: "stack", style: { "--gap": "14px", minWidth: 0 } }, h("h2", { style: { fontSize: "var(--fs-h3)" } }, title), body));
  return h("article", {},
    h("header", { class: "reveal" }, eyebrow(`Algorithm ${String(i + 1).padStart(2, "0")}`), h("h1", { class: "hero", style: { marginTop: "16px" } }, l.title), h("p", { class: "hero-sub" }, l.tagline)),
    h("div", { class: "section" },
      step("01", "Concept", [h("p", { class: "lede" }, l.concept), h("p", { class: "mono muted", style: { fontSize: "var(--fs-small)", padding: "12px 16px", background: "var(--bg-sunk)", borderRadius: "var(--r-sm)", display: "inline-block" } }, l.formula)]),
      step("02", "Try it", [h("p", { class: l.tryIt ? "lede" : "muted", style: l.tryIt ? { fontSize: "1.0625rem", maxWidth: "var(--measure)" } : null }, l.tryIt || "Change something. Watch the answer move. That's the whole lesson."), h("div", { class: "card", style: { marginTop: "8px" } }, widget), h("p", { class: "muted", style: { fontSize: "var(--fs-micro)" } }, "Illustrative model with teaching constants. Learn the shape here; bring your own numbers to the field.")]),
      step("03", "See it in sales", [h("p", { class: "lede" }, l.sales), d ? link(`/decisions/${d.id}`, h("span", { class: "link" }, `Open the real decision: ${d.question} `, arrow())) : null]),
      step("04", "Apply it", h("ul", { style: { margin: 0, paddingLeft: "1.2em", display: "grid", gap: "8px" } }, l.apply.map(a => h("li", {}, a))))),
    h("nav", { class: "section", "aria-label": "Next lesson", style: { display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" } },
      link("/learn", h("span", { class: "btn btn-ghost" }, "All algorithms")), next ? link(`/learn/${next.slug}`, h("span", { class: "btn" }, `Next: ${next.title} `, arrow())) : link("/practice", h("span", { class: "btn" }, `That's all ${lessons.length}. Put them to work in Practice `, arrow()))),
  );
}

// One call, one twist, one rule. The learner commits before any number is explained, works one change, and leaves with
// a sentence they can use on Monday. No widget: the arithmetic is the lesson.
const $k = (v) => (v === 0 ? "$0" : `${v < 0 ? "−" : ""}$${Math.abs(v) % 1 ? Math.abs(v).toFixed(1) : Math.abs(v)}K`);
function drillPage(l, d, i, next) {
  const D = l.drill, track = tracks.find((t) => t.id === D.practice), first = track && scenarios.find(track.filter);
  const round = (r, { onDone, trap, right }) => {
    const best = r.best ? r.options.find((o) => o.id === r.best) : r.options.reduce((a, b) => (b.value > a.value ? b : a));
    const verdict = says(""), after = h("div", { class: "drill-after", hidden: true });
    verdict.hidden = true;
    const btns = r.options.map((o) => h("button", { type: "button", class: "option drill-opt", "aria-pressed": "false", onClick: () => pick(o) },
      h("h4", {}, o.label), o.sub ? h("p", { class: "muted drill-sub" }, o.sub) : null, h("p", { class: "drill-math" }, o.math), h("p", { class: "drill-val" })));
    const pick = (o) => {
      btns.forEach((b, n) => { b.disabled = true; b.setAttribute("aria-pressed", String(r.options[n] === o)); b.classList.toggle("preferred", r.options[n] === best); b.classList.add("shown");
        b.querySelector(".drill-val").textContent = `= ${$k(r.options[n].value)}`; });
      const ok = o === best;
      verdict.set(ok ? `${o.label}: the right call. ${right || ""}`.trim() : `${best.label} is worth ${$k(best.value)}; ${o.label} is worth ${$k(o.value)}. ${trap || ""}`.trim(), ok ? "good" : "warn");
      verdict.hidden = false; after.hidden = false; after.classList.add("in");
      onDone?.();
    };
    return h("div", { class: "drill-round" }, h("p", { class: "drill-q" }, r.question), h("div", { class: "options drill-opts" }, ...btns), verdict, after);
  };
  const close = h("div", { class: "drill-close", hidden: true },
    h("div", { class: "card drill-rule" }, eyebrow("The rule"), h("p", { class: "lede" }, D.rule), h("p", { class: "drill-flip" }, h("b", {}, "Flip point: "), D.flip), h("p", { class: "mono muted drill-formula" }, l.formula)),
    h("p", { class: "drill-monday" }, h("b", {}, "Monday: "), D.monday),
    h("div", { class: "drill-links" },
      track && first ? link(`/practice/${first.id}?set=${track.id}&i=0`, h("span", { class: "btn" }, `Get tested on it: ${track.title} `, arrow())) : null,
      d ? link(`/decisions/${d.id}`, h("span", { class: "btn btn-ghost" }, "Use it on a full decision ", arrow())) : null));
  const twist = h("div", { class: "drill-twist", hidden: true }, eyebrow("Then something changes"), h("p", { class: "drill-situation" }, D.twist.text),
    round(D.twist, { trap: D.twist.lesson, right: D.twist.lesson, onDone: () => { close.hidden = false; close.classList.add("in"); } }));
  const first_ = round(D, { trap: D.trap, right: D.right, onDone: () => { twist.hidden = false; twist.classList.add("in"); twist.scrollIntoView({ behavior: "smooth", block: "start" }); } });
  return h("article", { class: "drill" },
    h("header", { class: "reveal" }, eyebrow(`Algorithm ${String(i + 1).padStart(2, "0")}`), h("h1", { class: "hero", style: { marginTop: "16px" } }, l.title), h("p", { class: "hero-sub" }, l.tagline)),
    h("section", { class: "section reveal" }, eyebrow("The situation"), h("p", { class: "drill-situation lede" }, D.situation), first_),
    h("section", { class: "section" }, twist),
    h("section", { class: "section" }, close),
    h("nav", { class: "section", "aria-label": "Next lesson", style: { display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" } },
      link("/learn", h("span", { class: "btn btn-ghost" }, "All algorithms")), next ? link(`/learn/${next.slug}`, h("span", { class: "btn" }, `Next: ${next.title} `, arrow())) : link("/portfolio", h("span", { class: "btn" }, "Run the portfolio ", arrow()))));
}
