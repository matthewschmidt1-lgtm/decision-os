// Manual UI check: plays the mine0 fixture through the Flight Deck controls (tiles, throttle, focus, days, scouts,
// requests, Run) and checks that the saved plans equal the fixture exactly. Not part of run.html: it drives the live page.
// Use on http://localhost:4173/portfolio, in the browser console:
//   const d = await import("/tests/drive-mine0.js");
//   d.reset();          // backs up your game, starts year one fresh, reloads
//   await d.run();      // after the reload; resolves to { ok, plans, expected }
//   d.restore();        // puts your game back and removes the backup
import * as S from "../js/sim.js";
import { FIXTURES } from "./fixtures.mjs";

const KEY = "decision-os:sim:v2", BACKUP = "decision-os:sim:drive-backup";
const wait = (ms = 30) => new Promise((r) => setTimeout(r, ms));
const $ = (sel, root = document) => root.querySelector(sel);
const draft = () => JSON.parse(localStorage.getItem(KEY)).draft;

export function reset() {
  if (localStorage.getItem(BACKUP) === null) localStorage.setItem(BACKUP, localStorage.getItem(KEY) || "");
  localStorage.setItem(KEY, JSON.stringify({ vi: 0, plans: [], draft: S.lastYearPlan(), phase: "decide", note: "", nextScout: null }));
  location.reload();
}
export function restore() {
  const b = localStorage.getItem(BACKUP);
  if (b === null) return;
  if (b) localStorage.setItem(KEY, b); else localStorage.removeItem(KEY);
  localStorage.removeItem(BACKUP);
  location.reload();
}

async function open(id) { $(`.fd-tile[data-id="${id}"]`).click(); await wait(); }
async function setTrade(id, x) {
  await open(id);
  const r = $(".fd-panel .fd-throttle");
  r.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  r.value = String(x); r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true }));
  await wait();
  if (draft().trade[id] !== x) throw new Error(`Brand ${id}: throttle gave ${draft().trade[id]}, wanted ${x}`);
}
async function trades(target) {
  const now = draft().trade, ids = S.brandIds.filter((id) => now[id] !== target[id]);
  for (const id of ids.filter((i) => target[i] < now[i])) await setTrade(id, target[id]); // free money first
  for (const id of ids.filter((i) => target[i] > now[i])) await setTrade(id, target[id]);
}
async function focus(target) {
  for (const id of S.brandIds) if ((draft().focus[id] || "both") !== target[id]) {
    await open(id);
    [...document.querySelectorAll(".fd-panel .sim-focus button")].find((b) => b.dataset.k === target[id]).click(); await wait();
  }
}
async function days(target) {
  const now = draft().days, order = S.brandIds.filter((i) => target[i] < now[i]).concat(S.brandIds.filter((i) => target[i] > now[i]));
  for (const id of order) {
    await open(id);
    for (let n = 0; n < 50 && draft().days[id] !== target[id]; n++) { $(`.fd-panel button[aria-label="${draft().days[id] < target[id] ? "One more" : "One fewer"} field day for Brand ${id}"]`).click(); await wait(5); }
  }
}
async function scouts(list) {
  for (const id of list) { await open(id); const b = $(".fd-panel .sim-scout"); if (b.getAttribute("aria-pressed") !== "true") b.click(); await wait(); }
}
async function answer(qi, id) {
  const o = S.dilemma(qi, 0).options.find((x) => x.id === id);
  const btn = [...document.querySelectorAll(".sim-request .opt")].find((b) => b.firstChild.textContent === o.label);
  if (btn.getAttribute("aria-pressed") !== "true") btn.click();
  await wait();
}
async function runQuarter(qi) {
  $(".fd-run").click(); await wait(50);
  const skip = [...document.querySelectorAll(".sim-stage button")].find((b) => b.textContent === "Skip to results");
  if (skip) skip.click();
  await wait(100);
  if (qi < 3) { [...document.querySelectorAll(".sim-go .btn")].find((b) => /^Plan Q/.test(b.textContent)).click(); await wait(100); }
}

export async function run() {
  const st = JSON.parse(localStorage.getItem(KEY));
  if (st.plans.length || st.vi !== 0) throw new Error("Call reset() first: this needs a fresh year one.");
  const want = FIXTURES.mine0.plans();
  for (let qi = 0; qi < 4; qi++) {
    const p = want[qi];
    await answer(qi, p.answer);
    await trades(p.trade);
    if (qi >= 1) await focus(p.focus);
    if (qi >= 2) await days(p.days);
    await scouts(p.scout);
    await runQuarter(qi);
  }
  const plans = JSON.parse(localStorage.getItem(KEY)).plans;
  const ok = JSON.stringify(plans) === JSON.stringify(want);
  console[ok ? "log" : "error"](ok ? "mine0 drive: saved plans equal the fixture exactly." : "mine0 drive: plans differ from the fixture.", { plans, expected: want });
  return { ok, plans, expected: want };
}
