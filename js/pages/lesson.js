import { h, link, arrow, eyebrow, says } from "../ui.js";
import { tracks, scenarios } from "../scenarios.js";
import { pictureFor } from "../lessons/pictures.js";
import { lessons, lessonBySlug } from "../lessons/index.js";
import { decisionById } from "../data.js";
import { setMeta } from "../app.js";

export default async function Lesson({ id }) {
  const l = lessonBySlug[id];
  if (!l) return (await import("./notfound.js")).default();
  setMeta({ title: l.title, description: l.tagline });
  const i = lessons.indexOf(l); const next = lessons[i + 1];
  return drillPage(l, l.decision ? decisionById[l.decision] : null, i, next);
}

// One call, one twist, one rule. The learner commits before any number is explained, works one change, and leaves with
// a sentence they can use on Monday. No widget: the arithmetic is the lesson.
const $k = (v) => (v === 0 ? "$0" : `${v < 0 ? "−" : ""}$${Math.abs(v) % 1 ? Math.abs(v).toFixed(1) : Math.abs(v)}K`);
function drillPage(l, d, i, next) {
  const D = l.drill, track = tracks.find((t) => t.id === D.practice), first = track && scenarios.find(track.filter);
  const picks = []; // option ids, round 1 then round 2; the picture marks them
  const round = (r, { onDone, trap, right }) => {
    const best = r.best ? r.options.find((o) => o.id === r.best) : r.options.reduce((a, b) => (b.value > a.value ? b : a));
    const verdict = says(""), after = h("div", { class: "drill-after", hidden: true });
    verdict.hidden = true;
    const val = (o) => o.show ?? (o.value == null ? "" : $k(o.value));
    const btns = r.options.map((o) => h("button", { type: "button", class: "option drill-opt", "aria-pressed": "false", onClick: () => pick(o) },
      h("h4", {}, o.label), o.sub ? h("p", { class: "muted drill-sub" }, o.sub) : null, o.math ? h("p", { class: "drill-math" }, o.math) : null, h("p", { class: "drill-val" })));
    const pick = (o) => {
      picks.push(o.id);
      btns.forEach((b, n) => { const x = r.options[n]; b.disabled = true; b.setAttribute("aria-pressed", String(x === o)); b.classList.toggle("preferred", x === best); b.classList.add("shown");
        b.querySelector(".drill-val").textContent = val(x) ? `= ${val(x)}` : ""; });
      const ok = o === best;
      // Estimate rounds (a number to guess) read differently from choice rounds (options with a value each).
      const miss = r.estimate ? `The numbers put it at ${val(best)}; you said ${o.label.replace(/^About/, "about")}.` : `${best.label}: ${val(best)}. ${o.label}: ${val(o)}.`;
      verdict.set(ok ? `${o.label}: the right call. ${right || ""}`.trim() : `${miss} ${trap || ""}`.trim(), ok ? "good" : "warn");
      verdict.hidden = false; after.hidden = false; after.classList.add("in");
      onDone?.();
    };
    return h("div", { class: "drill-round" }, h("p", { class: "drill-q" }, r.question), h("div", { class: "options drill-opts", dataset: { n: String(r.options.length) } }, ...btns), verdict, after);
  };
  const picHost = h("div", { class: "drill-pic-host" });
  const close = h("div", { class: "drill-close", hidden: true },
    h("div", { class: "card drill-rule" }, eyebrow("The rule"), h("p", { class: "lede" }, D.rule), h("p", { class: "drill-flip" }, h("b", {}, "Flip point: "), D.flip), h("p", { class: "mono muted drill-formula" }, l.formula)),
    picHost,
    h("p", { class: "drill-monday" }, h("b", {}, "Monday: "), D.monday),
    h("div", { class: "drill-links" },
      track && first ? link(`/practice/${first.id}?set=${track.id}&i=0`, h("span", { class: "btn" }, `Get tested on it: ${track.title} `, arrow())) : null,
      d ? link(`/decisions/${d.id}`, h("span", { class: "btn btn-ghost" }, "Use it on a full decision ", arrow())) : null));
  const twist = h("div", { class: "drill-twist", hidden: true }, eyebrow("Then something changes"), h("p", { class: "drill-situation" }, D.twist.text),
    round(D.twist, { trap: D.twist.lesson, right: D.twist.lesson, onDone: () => {
      const pic = pictureFor(l.slug, picks);
      if (pic) picHost.replaceChildren(h("figure", { class: "card drill-pic" }, h("figcaption", {}, eyebrow("The rule in one picture")), h("div", { class: "drill-pic-scroll" }, pic[0]), h("p", { class: "muted drill-pic-cap" }, pic[1])));
      close.hidden = false; close.classList.add("in");
      requestAnimationFrame(() => requestAnimationFrame(() => close.querySelectorAll(".pick").forEach((g) => g.classList.add("in"))));
    } }));
  const first_ = round(D, { trap: D.trap, right: D.right, onDone: () => { twist.hidden = false; twist.classList.add("in"); twist.scrollIntoView({ behavior: "smooth", block: "start" }); } });
  return h("article", { class: "drill" },
    h("header", { class: "reveal" }, eyebrow(`Algorithm ${String(i + 1).padStart(2, "0")}`), h("h1", { class: "hero", style: { marginTop: "16px" } }, l.title), h("p", { class: "hero-sub" }, l.tagline)),
    h("section", { class: "section reveal drill-intro" }, eyebrow("The situation"),
      h("p", { class: "drill-situation lede" }, D.situation.lead ?? D.situation),
      D.situation.points ? h("ul", { class: "drill-points" }, D.situation.points.map((t) => h("li", {}, t))) : null, first_),
    h("section", { class: "section" }, twist),
    h("section", { class: "section" }, close),
    h("nav", { class: "section", "aria-label": "Next lesson", style: { display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" } },
      link("/learn", h("span", { class: "btn btn-ghost" }, "All algorithms")), next ? link(`/learn/${next.slug}`, h("span", { class: "btn" }, `Next: ${next.title} `, arrow())) : link("/portfolio", h("span", { class: "btn" }, "Run the portfolio ", arrow()))));
}
