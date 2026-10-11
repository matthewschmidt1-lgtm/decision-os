// The Flight Deck: a midnight band at the top of the Portfolio page. It holds the horizon (the year's score as altitude
// against last year's plan) and the instruments (score, free trade, field days, scouts, run). Flat linear readouts only.
// Nothing here calculates game results: the page passes in numbers from js/sim.js and this module draws them.
import { h, s } from "../ui.js";
import { $k, signed$, tone } from "./fmt.js";

const STOPS = ["Start", "Q1", "Q2", "Q3", "Q4", "Year end"];
const phone = () => matchMedia("(max-width: 759px)").matches;
const narrow = () => matchMedia("(max-width: 1023px)").matches; // where the panel becomes a bottom sheet and room is short

export function createDeck({ onRun }) {
  const horizon = h("div", { class: "fd-horizon" });
  const inst = h("div", { class: "fd-instruments" });
  const coach = h("p", { class: "fd-coach" });
  const run = h("button", { type: "button", class: "fd-run", onClick: () => onRun?.() });
  const el = h("div", { class: "fd-deck" }, horizon, coach, inst);
  let flight = null, drawnW = 0;

  // Sticky offset: under 1024px only the instrument strip stays stuck (the horizon and coach scroll away under the top bar),
  // so the map keeps some room above the bottom sheet.
  const measure = () => {
    const bar = document.getElementById("topbar")?.offsetHeight || 64;
    const away = narrow() && el.classList.contains("is-live") ? inst.offsetTop : 0;
    el.style.setProperty("--fd-stick", `${bar - away}px`);
    el.closest(".fd")?.style.setProperty("--fd-top", `${bar}px`);
    el.closest(".fd")?.style.setProperty("--fd-deck-h", `${el.classList.contains("is-live") ? el.offsetHeight - away : 0}px`);
  };
  const ro = new ResizeObserver(() => { if (flight && Math.round(horizon.clientWidth) !== drawnW) draw(); measure(); });
  ro.observe(el); ro.observe(horizon);

  function draw() {
    if (!flight) return;
    drawnW = Math.round(horizon.clientWidth);
    horizon.replaceChildren(drawHorizon(drawnW || 640, flight, phone()));
  }

  return {
    el, run,
    setLive(live) { el.classList.toggle("is-live", !!live); measure(); },
    // flight: { points: [{ v, mark?, note? }] banked score after each played quarter (index 0 = Start), draft?: { v, air, last },
    //           final?: year-end score, tiers: [{ name, at }], at: index of the current stop,
    //           run?: { v, k, months } the quarter being run: its segment drawn to fraction k of the way to banked score v,
    //           ref?: { points: [v], final, label } a reference path (the year-end benchmark), drawn dashed }
    horizon(f) { flight = f; draw(); },
    coach(text) { coach.textContent = text || ""; coach.hidden = !text; measure(); },
    // Decide phase: the full instrument strip. Other phases: the banked score only.
    instruments(v) {
      // Phones keep only the numbers, under a short key.
      const SHORT = { "Free trade": "Free", "Field days": "Days" };
      const cell = (key, value, sub, cls = "") => h("div", { class: `fd-inst ${cls}` },
        h("span", { class: "k" }, SHORT[key] ? [h("span", { class: "kl" }, key), h("span", { class: "ks", "aria-hidden": "true" }, SHORT[key])] : key), value, sub ? h("span", { class: "s" }, sub) : null);
      if (!v.decide) {
        inst.replaceChildren(...[cell("Score", h("b", { class: `num ${tone(v.soFar / 10)}` }, signed$(v.soFar)), "banked against last year's plan"),
          v.final != null ? cell("Year end", h("b", { class: `num ${tone(v.final / 10)}` }, signed$(v.final)), "counting what carries into next year") : null].filter(Boolean));
        measure(); return;
      }
      const air = Math.abs(v.air) >= 1 ? ` · ${signed$(v.air)} ${v.qi === 3 ? "lands next year" : "in the air"}` : "";
      const pips = s("svg", { class: "fd-pips", viewBox: "0 0 30 12", width: 30, height: 12, role: "img", "aria-label": `${v.scoutsLeft} of ${v.scouts} scouts left` },
        ...Array.from({ length: v.scouts }, (_, i) => s("circle", { cx: 6 + i * 16, cy: 6, r: 4.5, class: i < v.scoutsLeft ? "on" : "off" })));
      run.textContent = `▶ Run ${v.qid}`;
      run.disabled = !!v.needAnswer;
      run.title = v.needAnswer ? "Answer the request first" : "";
      inst.replaceChildren(
        cell("Score", h("b", { class: `num ${tone(v.soFar / 10)}` }, signed$(v.soFar)), `banked · this quarter ≈ ${signed$(v.proj)}${air}`),
        cell("Free trade", h("b", { class: "num" }, $k(v.free)), v.free > 0 ? `keep it: ${signed$(v.free)} to the score` : v.free < 0 ? "over budget" : "all placed", v.free > 0 ? "has" : v.free < 0 ? "over" : ""),
        cell("Field days", h("b", { class: "num" }, v.canDays ? `${v.freeDays} free` : "locked"), v.canDays ? `of ${v.days}` : "unlocks in Q3", v.canDays && v.freeDays > 0 ? "has" : ""),
        cell("Scouts", h("b", { class: "num fd-pipwrap" }, pips, h("span", { class: "sr-only" }, `${v.scoutsLeft} left`)), "for the year"),
        run);
      measure();
    },
  };
}

// The one piece of line art: altitude is the score against last year's plan, the ground is zero, the tiers are contours.
function drawHorizon(W, f, compact) {
  const H = compact ? 90 : 116, L = compact ? 10 : 14, R = compact ? 44 : 92, T = 12, B = 20;
  const vals = [0, ...f.points.map((p) => p.v), ...(f.draft ? [f.draft.v, f.draft.v + f.draft.air] : []), ...(f.final != null ? [f.final] : []),
    ...(f.run ? [f.run.v] : []), ...(f.ref ? [...f.ref.points, f.ref.final] : [])];
  const top = Math.max(f.tiers.at(-1).at * 1.12, ...vals), hi = top;
  const lo = Math.min(-0.2 * hi, Math.min(...vals) * 1.15);
  const X = (i) => L + (i * (W - L - R)) / (STOPS.length - 1), Y = (v) => T + ((hi - v) / (hi - lo)) * (H - T - B);
  const g = s("svg", { class: "fd-hz", viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img", "aria-label": summary(f) });
  g.append(s("defs", {}, s("pattern", { id: "fd-hatch", width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, s("line", { x1: 0, y1: 0, x2: 0, y2: 6, class: "hatch" }))));
  // Ground and terrain below it: losing ground against last year's plan.
  g.append(s("rect", { class: "terrain", x: L, y: Y(0), width: W - L - R, height: Math.max(0, H - B - Y(0)) }), s("line", { class: "ground", x1: L, x2: W - R, y1: Y(0), y2: Y(0) }));
  if (!compact) g.append(s("text", { class: "lbl ground-t", x: L + 4, y: Y(0) + 12 }, "Last year's plan"));
  for (const t of f.tiers) g.append(s("line", { class: `contour t-${t.name.toLowerCase()}`, x1: L, x2: W - R, y1: Y(t.at), y2: Y(t.at) }),
    s("text", { class: "lbl contour-t", x: W - 4, y: Y(t.at) + 3, "text-anchor": "end" }, compact ? t.name : `${t.name} ${signed$(t.at)}`));
  STOPS.forEach((label, i) => g.append(s("text", { class: `lbl stop ${i === f.at ? "now" : ""}`, x: X(i), y: H - 5, "text-anchor": i === 0 ? "start" : i === STOPS.length - 1 ? "end" : "middle" }, compact && i === 5 ? "End" : label)));
  // The year-end benchmark, dashed under your own path so the two can be compared quarter by quarter.
  if (f.ref) {
    const rp = f.ref.points.map((v, i) => [X(i), Y(v)]);
    if (f.ref.final != null) rp.push([X(5), Y(f.ref.final)]);
    g.append(s("polyline", { class: "ref", points: rp.map((p) => p.join(",")).join(" ") }));
    rp.forEach(([x, y], i) => i && g.append(s("rect", { class: "ref-pt", x: x - 2.5, y: y - 2.5, width: 5, height: 5 })));
  }
  // The flown path: banked score after each quarter that has been played.
  const path = f.points.map((p, i) => [X(i), Y(p.v)]);
  if (f.final != null) path.push([X(5), Y(f.final)]);
  if (path.length > 1) g.append(s("polyline", { class: "flown", points: path.map((p) => p.join(",")).join(" ") }));
  path.forEach(([x, y], i) => i && g.append(s("circle", { class: "pt", cx: x, cy: y, r: 3 })));
  // Past dips appear only after they happen, labelled from the quarter's insight.
  f.points.forEach((p, i) => {
    if (!p.mark) return;
    const x = X(i), y = Y(p.v);
    g.append(s("g", { class: `dip ${p.mark.kind}` }, s("title", {}, p.note || p.mark.label), s("path", { d: `M${x - 5},${y - 13} L${x + 5},${y - 13} L${x},${y - 6} Z` }),
      s("text", { class: "lbl", x, y: y - 17, "text-anchor": "middle" }, p.mark.label)));
  });
  // The quarter being run: its segment drawn across the months, ending at the banked result once the quarter closes.
  if (f.run) {
    const i0 = f.points.length - 1, v0 = f.points[i0].v, k = Math.max(0, Math.min(1, f.run.k));
    const x0 = X(i0), y0 = Y(v0), x1 = X(i0 + k), y1 = Y(v0 + (f.run.v - v0) * k);
    (f.run.months || []).forEach((m, j) => g.append(s("text", { class: `lbl month ${k >= (j + 0.5) / 3 ? "now" : ""}`, x: X(i0 + (j + 0.5) / 3), y: Y(0) - 6, "text-anchor": "middle" }, compact ? m[0] : m)));
    g.append(s("line", { class: "run", x1: x0, y1: y0, x2: x1, y2: y1 }), s("circle", { class: "run-pt", cx: x1, cy: y1, r: 3.5 }));
  }
  // This quarter's team forecast: a dashed line to where the draft would land, and a hollow marker for what lands later.
  if (f.draft && !f.run) {
    const i0 = f.points.length - 1, x0 = X(i0), x1 = X(i0 + 1), y0 = Y(f.points[i0].v), y1 = Y(f.draft.v);
    g.append(s("line", { class: "draft", x1: x0, y1: y0, x2: x1, y2: y1 }), s("circle", { class: "draft-pt", cx: x1, cy: y1, r: 3.5 }));
    if (Math.abs(f.draft.air) >= 1) {
      const xa = f.draft.last ? X(5) : x1, ya = Y(f.draft.v + f.draft.air);
      g.append(s("line", { class: "air-link", x1, y1, x2: xa, y2: ya }), s("circle", { class: "air", cx: xa, cy: ya, r: 4.5 }));
    }
  }
  return g;
}
function summary(f) {
  const n = f.points.length - 1, now = f.points[n].v;
  const parts = [n ? `Banked after ${STOPS[n]}: ${signed$(now)} against last year's plan.` : "The year hasn't started: you are level with last year's plan."];
  if (f.draft) parts.push(`This quarter's team forecast: about ${signed$(f.draft.v - now)}${Math.abs(f.draft.air) >= 1 ? `, with ${signed$(f.draft.air)} landing ${f.draft.last ? "next year" : "next quarter"}` : ""}.`);
  if (f.final != null) parts.push(`Year end, counting next year: ${signed$(f.final)}.`);
  if (f.ref) parts.push(`${f.ref.label}, dashed: ${f.ref.points.slice(1).map((v, i) => `${STOPS[i + 1]} ${signed$(v)}`).join(", ")}${f.ref.final != null ? `, year end ${signed$(f.ref.final)}` : ""}.`);
  f.points.forEach((p, i) => p.mark && parts.push(`${STOPS[i]}: ${p.note || p.mark.label}`));
  parts.push(f.tiers.map((t) => `${t.name} at ${signed$(t.at)}`).join(", ") + ".");
  return parts.join(" ");
}
