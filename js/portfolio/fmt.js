// Number formatting shared by the Portfolio page and its Flight Deck modules. Money is in $K, as in js/sim.js.
import { money, pct } from "../models.js";

export const $k = (v) => money(v * 1000);
export const signed$ = (v) => `${v >= 0 ? "+" : "−"}${$k(Math.abs(v))}`;
export const pts = (v) => (Math.abs(v) < 0.5 ? "0%" : pct(v, 0));
export const per$ = (v) => `$${v.toFixed(2)}`;
export const delta = (v) => (Math.abs(v) < 0.5 ? "0" : `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(0)}`);
export const tone = (v) => (v > 0.5 ? "good" : v < -0.5 ? "bad" : "");
export const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
