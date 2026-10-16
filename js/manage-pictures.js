// Module 3 pictures: one small still drawing per case, built after the pick from the case's `picture` spec. Each kind draws
// what its Learn lesson teaches and nothing else: the two values on an axis, a belief moved by evidence, the worth of a check,
// a return that flattens, a day's hours, or an honest read against a commitment. Only the learner's pick and the strongest
// option are ever marked; the other two options are never drawn. Numbers come from the spec, which only carries figures the
// case states. Colour is the site's tokens through the .pic classes in pages.css.
import { s, h, pan } from "./ui.js";
import { values3 } from "./scenarios3.js";

const W = 640, L = 24, R = 24;
const txt = (x, y, t, a = {}) => s("text", { x, y, ...a }, t);
const X = (v, lo = 0, hi = 100) => L + ((v - lo) / (hi - lo)) * (W - L - R);
const svg = (H, aria) => s("svg", { viewBox: `0 0 ${W} ${H}`, class: "pic m3-svg", role: "img", "aria-label": aria });
const ends = (el, y, left, right) => el.append(txt(L, y, left, { class: "cap", "text-anchor": "start" }), txt(W - R, y, right, { class: "cap", "text-anchor": "end" }));
const strongestMark = (el, x, y, label, { dy = -14, anchor = "middle" } = {}) => el.append(s("g", { class: "pick in" }, s("circle", { cx: x, cy: y, r: 7 }), txt(x, y + dy, label, { "text-anchor": anchor })));
const youMark = (el, x, y, label, { dy = 22, anchor = "middle" } = {}) => el.append(s("g", { class: "pick you in" }, s("circle", { cx: x, cy: y, r: 4.5 }), txt(x, y + dy, label, { "text-anchor": anchor })));
// Your pick and the strongest on one line; one mark when they are the same option.
function marksOn(el, xOf, y, youV, bestV, same) {
  if (same && youV != null) { strongestMark(el, xOf(youV), y, "You · strongest"); return; }
  if (bestV != null) strongestMark(el, xOf(bestV), y, "Strongest");
  if (youV != null) youMark(el, xOf(youV), y, "You");
}
const clamp = (v) => Math.max(0, Math.min(100, v));

export function drawPicture(sc, picked) {
  const p = sc.picture; if (!p) return null;
  const letters = "ABCD";
  const mk = {}; p.marks.forEach(([k, v, c]) => { mk[k] = { v, c }; });
  const youV = mk[letters[sc.options.indexOf(picked)]]?.v ?? null;
  const bestV = mk[letters[sc.options.findIndex((o) => o.quality === "best")]]?.v ?? null;
  const same = picked.quality === "best";
  const left = p.left || values3[sc.trade[0]] || sc.trade[0], right = p.right || values3[sc.trade[1]] || sc.trade[1];
  let el;
  if (p.kind === "axis" || p.kind === "forecast" || p.kind === "hours") {
    const H = 112, y = 58;
    const nums = p.marks.map(([, v]) => v).filter((v) => typeof v === "number");
    const lo = p.kind === "forecast" && nums.every((v) => v >= 80) ? 80 : 0, hi = 100;
    const xOf = (v) => X(clamp(v), lo, hi);
    el = svg(H, `${left} to ${right}: your pick and the strongest option.`);
    el.append(s("line", { class: "ax", x1: L, x2: W - R, y1: y, y2: y }));
    if (p.kind === "hours" && mk.e1) {
      el.append(s("rect", { class: "band", x: L, y: y - 9, width: xOf(mk.e1.v) - L, height: 18 }));
      // Today's caption sits inside the shaded share, clear of the option marks above and below the line.
      el.append(s("line", { class: "flip", x1: xOf(mk.e1.v), x2: xOf(mk.e1.v), y1: y - 22, y2: y + 22 }), txt(L + 6, y + 4, mk.e1.c || "Today", { class: "l", "text-anchor": "start" }));
    }
    if (p.kind === "forecast") {
      ["e1", "e2"].filter((k) => mk[k]).forEach((k, i) => {
        const x = xOf(mk[k].v);
        el.append(s("line", { class: "flip", x1: x, x2: x, y1: y - 22, y2: y + 22 }), txt(x, y - 28 + (i ? 0 : 0), mk[k].c || "", { class: "l", "text-anchor": i === 0 ? "end" : "start", dx: i === 0 ? -6 : 6 }));
      });
    }
    marksOn(el, xOf, y, youV, bestV, same);
    ends(el, H - 12, left, right);
  } else if (p.kind === "belief") {
    const steps = p.marks.filter(([k]) => k === "start" || /^e\d$/.test(k));
    const row = 26, top = 30, H = top + steps.length * row + 26, x0 = 210;
    const xOf = (v) => x0 + (clamp(v) / 100) * (W - x0 - R);
    el = svg(H, `How the evidence moves what you believe, from ${left} to ${right}.`);
    el.append(txt(x0, 16, left, { class: "cap", "text-anchor": "start" }), txt(W - R, 16, right, { class: "cap", "text-anchor": "end" }));
    const pts = [];
    steps.forEach(([k, v, c], i) => {
      const y = top + i * row + 10, x = xOf(v);
      el.append(txt(x0 - 12, y + 4, c || (k === "start" ? "Where you start" : k), { "text-anchor": "end", class: i === 0 ? "cap" : "" }));
      el.append(s("line", { class: "grid", x1: x0, x2: W - R, y1: y, y2: y }));
      pts.push([x, y]);
      el.append(s("circle", { class: `dot${i === steps.length - 1 ? " acc" : ""}`, cx: x, cy: y, r: i === steps.length - 1 ? 6 : 4 }));
    });
    el.append(s("polyline", { class: "ln mid", points: pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ") }));
    el.append(s("line", { class: "flip", x1: xOf(50), x2: xOf(50), y1: top - 4, y2: top + steps.length * row }));
  } else if (p.kind === "check") {
    const H = 150, barY = [30, 62], lineY = 118, x0 = 150;
    const xOf = (v) => x0 + (clamp(v) / 100) * (W - x0 - R);
    el = svg(H, `What a check is worth against what it costs, and where your pick sits between ${left} and ${right}.`);
    [["worth", "What's at stake"], ["cost", "What a check costs"]].forEach(([k, name], i) => {
      const m = mk[k]; if (!m) return;
      el.append(txt(x0 - 12, barY[i] + 5, name, { "text-anchor": "end", class: "cap" }));
      el.append(s("rect", { class: `bar ${k === "worth" ? "acc" : "mid"}`, x: x0, y: barY[i] - 8, width: Math.max(3, xOf(m.v) - x0), height: 16, rx: 3 }));
      el.append(txt(Math.min(W - R - 2, xOf(m.v) + 8), barY[i] + 5, m.c || "", { class: "l", "text-anchor": k === "worth" ? "end" : "start", dx: k === "worth" ? -16 : 0 }));
    });
    const xLine = (v) => L + (clamp(v) / 100) * (W - L - R);
    el.append(s("line", { class: "ax", x1: L, x2: W - R, y1: lineY, y2: lineY }));
    marksOn(el, xLine, lineY, youV, bestV, same);
    if (youV == null) el.append(txt(W / 2, lineY + 22, "Your pick waits, off this line", { "text-anchor": "middle", class: "mid" }));
    ends(el, H - 6, left, right);
  } else if (p.kind === "curve") {
    const H = 170, T = 18, B = 40, y0 = H - B, k = 3.2;
    const xOf = (v) => X(clamp(v)), f = (v) => 1 - Math.exp(-k * (v / 100)), yOf = (v) => y0 - f(v) * (y0 - T - 10);
    el = svg(H, `A return that flattens as you add more, from ${left} to ${right}.`);
    el.append(s("line", { class: "ax", x1: L, x2: W - R, y1: y0, y2: y0 }), s("line", { class: "ax", x1: L, x2: L, y1: T, y2: y0 }));
    const pts = []; for (let v = 0; v <= 100; v += 2) pts.push([xOf(v), yOf(v)]);
    el.append(s("polyline", { class: "ln acc", points: pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ") }));
    if (mk.bend) el.append(s("line", { class: "flip", x1: xOf(mk.bend.v), x2: xOf(mk.bend.v), y1: T, y2: y0 }), txt(xOf(mk.bend.v) + 6, T + 12, mk.bend.c || "", { class: "l", "text-anchor": "start" }));
    const on = (v) => [xOf(v), yOf(v)];
    // Labels sit under the curve so they never collide with the bend caption at the top.
    if (same && youV != null) strongestMark(el, ...on(youV), "You · strongest", { dy: 24 });
    else { if (bestV != null) strongestMark(el, ...on(bestV), "Strongest", { dy: 24 }); if (youV != null) youMark(el, ...on(youV), "You", { dy: -12 }); }
    ends(el, H - 10, left, right);
  } else return null;
  // On phones the drawing keeps its size and pans sideways, so its labels stay readable.
  return h("figure", { class: "m3-pic" }, pan(el, "Scroll sideways"), p.after ? h("figcaption", {}, p.after) : null);
}
