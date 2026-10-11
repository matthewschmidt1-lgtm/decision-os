// Plan fixtures shared by the regression baseline and the plan-editing tests. P() merges over last year's plan.
import * as S from "../js/sim.js";

const LY = S.lastYearPlan();
export const P = (trade = {}, focus = {}, days = {}, scout = [], answer = null) => ({ trade: { ...LY.trade, ...trade }, focus: { ...LY.focus, ...focus }, days: { ...LY.days, ...days }, scout, answer });

const m1 = P({ A: 140, B: 60, C: 70, D: 70, E: 50, F: 40, G: 30, H: 30 }, {}, {}, ["C", "H"], "pass");
const m2 = P({ A: 110, B: 60, C: 40, D: 100, E: 50, F: 40, G: 30, H: 70 }, { D: "on", H: "on" }, {}, [], "pass");
const m3 = P({ ...m2.trade, B: 40 }, m2.focus, { A: 9, B: 6, C: 5, D: 6, E: 3, F: 3, G: 3, H: 5 }, [], "menu-H");
const m4 = P({ ...m3.trade, A: 80 }, m3.focus, m3.days, [], "pass");
const fB = { F: "on", D: "on", B: "off" }, dB = { A: 9, B: 6, C: 5, D: 8, E: 0, F: 8, G: 2, H: 2 };

export const FIXTURES = {
  habit0: { vi: 0, plans: () => S.habitPlans(0) },
  habit1: { vi: 1, plans: () => S.habitPlans(1) },
  evidence0: { vi: 0, plans: () => S.evidencePlans(0) },
  evidence1: { vi: 1, plans: () => S.evidencePlans(1) },
  mine0: { vi: 0, plans: () => [m1, m2, m3, m4] },
  handB1: { vi: 1, plans: () => [P({ A: 100 }, {}, {}, ["F"], "take"), P({ B: 60, H: 0, F: 90, G: 30 }, { F: "on", B: "off", H: "off" }, {}, [], "scout"),
    P({ A: 80, B: 50, F: 120, D: 90, H: 0, G: 20 }, fB, dB, [], "menu-F"), P({ A: 70, B: 40, F: 120, D: 90, H: 0, G: 0, C: 60 }, fB, dB, [], "take")] },
  handC0: { vi: 0, plans: () => [P({ A: 100, B: 30 }, {}, {}, ["D"], "pass"), P({ A: 100, B: 10, C: 70, D: 90 }, { A: "on", C: "off" }, {}, ["E"], "pay"),
    P({ A: 120, B: 90, D: 60 }, { A: "off", B: "on" }, { A: 9, B: 0, C: 5, D: 3, E: 3, F: 3, G: 12, H: 5 }, [], "menu-D"),
    P({ A: 140 }, { H: "on" }, { A: 9, B: 6, C: 5, D: 12, E: 3, F: 3, G: 0, H: 2 }, [], "pass")] },
};

// Key-order-independent JSON, so a plan built by the UI compares equal to a fixture built here.
export const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((key) => [key, x[key]])) : x));
