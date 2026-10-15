// Number formatting shared by the Portfolio page and its Flight Deck modules. Money is in $K, as in js/sim.js.
import { money, pct } from "../models.js";

export const $k = (v) => money(v * 1000);
export const signed$ = (v) => `${v >= 0 ? "+" : "−"}${$k(Math.abs(v))}`;
export const pts = (v) => (Math.abs(v) < 0.5 ? "0%" : pct(v, 0));
export const per$ = (v) => `$${v.toFixed(2)}`;
export const delta = (v) => (Math.abs(v) < 0.5 ? "0" : `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(0)}`);
export const tone = (v) => (v > 0.5 ? "good" : v < -0.5 ? "bad" : "");
export const reduced = () => document.documentElement.dataset.motion === "reduce" || matchMedia("(prefers-reduced-motion: reduce)").matches;
// A plain verdict on a channel's last $10K: room to add, near the top, or past it (and whether it was still covering the shelf).
export const verdictOf = (m, underFloor) => underFloor ? { text: "Below the shelf floor", cls: "bad" } : m == null ? { text: "Nothing spent", cls: "muted" } : m >= 1.1 ? { text: "Room to add", cls: "good" } : m >= 0.95 ? { text: "Near the top", cls: "" } : { text: "Past the top: move it", cls: "bad" };
// What the next $10K earns or loses after its own cost, to the nearest $100.
export const gainOf = (m, $k) => { const g = Math.round((m - 1) * 100) / 10; return Math.abs(g) < 0.2 ? ["breaks even", ""] : g > 0 ? [`earns ${$k(g)}`, "good"] : [`loses ${$k(-g)}`, "bad"]; };
