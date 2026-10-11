// Reconnaissance: what the team doesn't know about a brand, channel by channel, and how a scout's report changed it.
// Every number is the team's belief through S.channelRead (belief ± a spread set by confidence; not a truth interval).
// Nothing here previews what a scout will find: before the quarter closes it shows only the team's current ranges.
import { h } from "../ui.js";
import * as S from "../sim.js";
import { per$ } from "./fmt.js";

export const CHANNELS = [["off", "Off-premise"], ["on", "On-premise"], ["days", "Field days"]];
const WORD = { High: "sure", Medium: "roughly", Low: "unsure" };
// A belief object (state.beliefs[id], or a results row's before/after) read through the engine's own maths.
export const readOf = (bel, id, ch) => S.channelRead({ beliefs: { [id]: bel } }, id, ch);
export const rangeText = (r, ch) => ch === "days" ? `$${r.lo.toFixed(1)}K–$${r.hi.toFixed(1)}K a day` : `${per$(r.lo)}–${per$(r.hi)} per $1`;
export const confWord = (conf) => WORD[conf];

// A range drawn as a bar: wide and amber when the team is unsure, narrow when it is sure. Trade ranges carry a $1 tick.
export function rangeBar(r, ch) {
  const top = ch === "days" ? Math.max(10, r.hi * 1.1) : Math.max(2.5, r.hi * 1.1), x = (v) => `${Math.max(0, Math.min(100, (v / top) * 100))}%`;
  return h("span", { class: `fd-range conf-${r.conf}`, "aria-hidden": "true" },
    h("i", { class: "band", style: { left: x(r.lo), width: `${Math.max(1, Math.min(100, ((r.hi - r.lo) / top) * 100))}%` } }),
    h("i", { class: "mid", style: { left: x(r.b) } }),
    ch === "days" ? null : h("i", { class: "even", style: { left: x(1) } }));
}

// The request's own scout, if the current answer sends one that isn't already on the plan. Readout only: the limit
// rule stays state.scoutsLeft − plan.scout.length; the engine keeps the plan's scouts first and drops the request's.
export function requestScout(plan, state, qi, vi) {
  const o = S.dilemma(qi, vi)?.options.find((x) => x.id === plan.answer);
  if (!o?.scout || state.scouted[o.scout] !== undefined || plan.scout.includes(o.scout)) return null;
  return { id: o.scout, fits: plan.scout.length < state.scoutsLeft };
}
export const requestScoutNote = (rs) => rs && (rs.fits
  ? `Your answer to the request also sends a rep to Brand ${rs.id}. That uses a scout too.`
  : `Your answer to the request also sends a rep to Brand ${rs.id}, but the scouts on your plan already use every scout left, so that rep won't go.`);

// Before → after for a scouted brand in the debrief, from the results row's beliefs.
export function rangeShift(r) {
  return h("dl", { class: "fd-shift" }, ...CHANNELS.flatMap(([ch, label]) => {
    const a = readOf(r.before, r.id, ch), b = readOf(r.after, r.id, ch);
    return [h("dt", {}, label), h("dd", {}, h("span", { class: "was" }, rangeText(a, ch)), h("span", { "aria-hidden": "true" }, " → "), h("span", { class: "sr-only" }, " became "), h("b", {}, rangeText(b, ch)))];
  }));
}
