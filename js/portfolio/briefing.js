// The quarter's request as a briefing: Facts, What they say, Team estimate, Open questions, then the answer buttons.
// Facts come from the request itself, the player's own plan, and chain cards the player has already been shown.
// The team estimate is forecastQuarter on the plan as it would stand after each answer (the same pickAnswer the button
// uses, run on a copy), against the plan after passing. For the menu it is only the team's on-premise range (onRead).
// It never shows what the forecast doesn't know (the load-in's cost to next year, what a scout will find) as a number.
import { h } from "../ui.js";
import * as S from "../sim.js";
import * as P from "./plan.js";
import { $k, signed$, per$, pts } from "./fmt.js";
import { requestScout, requestScoutNote } from "./recon.js";
import { shownChains } from "./debrief.js";

const QUESTIONS = {
  endcap: ["Were these shoppers buying anyway?"],
  allowance: ["Why is Cascade carrying so much?"],
  menu: ["Which brand reorders once it's on a menu?"],
  loadin: ["What does it cost next year?"],
};
const CH = { off: "off-premise", on: "on-premise" };
const DOING = { endcap: "Taking the end-cap", allowance: "Paying the allowance", loadin: "Taking the load-in" };
const AGAINST = { endcap: "passing", allowance: "saying no", loadin: "passing" };

// c: { dil, plan, st, state, qi, vi, prev (last played quarter or null), onPick(o) }
export function createBriefing(c) {
  const { dil, st, state, qi, vi } = c;
  const later = qi === 3 ? "next year" : "next quarter";
  const facts = h("ul", { class: "fd-facts" });
  const est = h("div", { class: "fd-est" });
  const fund = h("p", { class: "note", hidden: true });
  const opts = dil.options.map((o) => {
    const used = o.scout && state.scouted[o.scout] !== undefined, none = o.scout && state.scoutsLeft <= 0;
    return h("button", { type: "button", class: "opt", disabled: used || none, onClick: () => c.onPick(o) },
      o.label, ...(used ? [h("span", { class: "why" }, "Already scouted")] : none ? [h("span", { class: "why" }, "You've used both scouts this year")] : []));
  });
  const part = (label, ...kids) => h("div", { class: "fd-brief-part" }, h("p", { class: "fd-brief-k" }, label), ...kids);
  const el = h("section", { class: "fd-brief", role: "group", "aria-label": `Request from ${dil.who}` },
    h("p", { class: "fd-brief-who" }, `A request from ${dil.who}`),
    part("What they say", h("blockquote", { class: "fd-quote" }, h("p", {}, dil.ask), h("footer", {}, `${dil.who}`))),
    part("Facts", facts),
    part("Team estimate", est),
    part("Open questions", h("ul", { class: "fd-questions" }, ...(QUESTIONS[dil.id] || []).map((t) => h("li", {}, t)))),
    part("Your answer", h("div", { class: "opts" }, ...opts), fund));

  // The plan as it would stand after choosing o: the same pickAnswer the button runs, on copies.
  const planIf = (plan, o) => {
    if (plan.answer === o.id) return plan;
    const p = S.clonePlan(plan), s = { funded: c.st.funded ? { ...c.st.funded } : null, fundNote: null };
    P.pickAnswer(p, s, o, state, qi, vi);
    return p;
  };

  function update(plan) {
    el.classList.toggle("is-open", !plan.answer);
    opts.forEach((b, i) => b.setAttribute("aria-pressed", String(plan.answer === dil.options[i].id)));
    const free = S.BUDGET.trade - S.planTotals({ ...plan, answer: null }, qi, vi).trade;
    const left = state.scoutsLeft - plan.scout.length;
    const list = [];
    for (const o of dil.options) {
      const money = o.cost && plan.answer !== o.id ? (free >= o.cost ? ` You have ${$k(free)} free, so it can come from free trade.` : ` You have ${$k(Math.max(0, free))} free, so ${free > 0 ? "the rest" : "it"} moves out of your brands: ${o.extra ? `Brand ${o.extra.id} first, then ` : ""}the brands whose next $10K returns least.`) : "";
      if (o.extra) list.push(`${DOING[dil.id]} costs ${$k(o.cost)}, spent on Brand ${o.extra.id}, ${CH[o.extra.ch]}.${money}`);
      else if (o.load) list.push(`${DOING[dil.id]} costs ${$k(o.cost)}, paid to the distributor rather than spent on a brand. Cascade takes an extra ${$k(o.load)} of product before year-end.${money}`);
      else if (o.scout) list.push(`Sending a rep costs no money and uses a scout. You have ${state.scoutsLeft} left this year${plan.scout.length ? `, ${Math.max(0, left)} after the scout${plan.scout.length > 1 ? "s" : ""} already on your plan` : ""}.`);
    }
    if (dil.id === "menu") list.push("No cost. The slot goes to one brand, on-premise, across 40 restaurants.");
    if (dil.id === "allowance") {
      // Only what the player has already seen on a chain card in last quarter's results.
      const br = dil.options.find((o) => o.extra)?.extra.id, row = c.prev && shownChains(c.prev).find((r) => r.id === br && r.chainOff.kind === "break");
      if (row) list.push(`Your ${S.QUARTERS[c.prev.qi].id} chain card for Brand ${br}: shipments ${pts(row.chainOff.shipments)}, distributor inventory ${pts(row.chainOff.inventory)}, depletion ${pts(row.chainOff.depletion)}.`);
    }
    const rs = requestScoutNote(requestScout(plan, state, qi, vi));
    if (rs) list.push(rs);
    facts.replaceChildren(...list.map((t) => h("li", {}, t)));

    if (dil.id === "menu") {
      est.replaceChildren(h("p", { class: "fd-est-k" }, "Each brand's on-premise return, first dollar · the team's range"),
        h("dl", { class: "fd-est-menu" }, ...dil.options.flatMap((o) => {
          const r = S.onRead(state, o.menu);
          return [h("dt", {}, `Brand ${o.menu}`), h("dd", {}, h("b", { class: "num" }, r.conf === "High" ? `≈ ${per$(r.b)}` : `${per$(r.lo)}–${per$(r.hi)}`), ` per $1 · ${r.conf} confidence`)];
        })),
        h("p", { class: "fd-est-note" }, "Updated by everything you've funded and scouted so far. A range means the team isn't sure."));
    } else {
      const pass = dil.options.find((o) => o.id === "pass"), f0 = S.forecastQuarter(state, planIf(plan, pass), qi);
      const rows = dil.options.filter((o) => o !== pass).map((o) => {
        const f = S.forecastQuarter(state, planIf(plan, o), qi), now = f.gp - f0.gp, lat = f.carryNext - f0.carryNext;
        const nowCell = h("td", { class: "num" }, `≈ ${signed$(now)}`);
        const latCell = o.load ? h("td", { class: "fd-est-q" }, "Not in the forecast. Open question: what does it cost next year?")
          : h("td", { class: "num" }, `≈ ${signed$(lat)}`);
        return h("tr", {}, h("th", { scope: "row" }, o.label), nowCell, latCell);
      });
      est.replaceChildren(h("p", { class: "fd-est-k" }, `Against ${AGAINST[dil.id]}, with the rest of your plan as it stands · team forecast`),
        h("div", { class: "table-wrap" }, h("table", { class: "fd-est-t" },
          h("thead", {}, h("tr", {}, h("th", {}, "Answer"), h("th", { class: "num" }, "This quarter"), h("th", { class: "num" }, later === "next year" ? "Next year" : "Next quarter"))),
          h("tbody", {}, ...rows))),
        ...(dil.options.some((o) => o.scout) ? [h("p", { class: "fd-est-note" }, "The forecast can't price what a rep will find: it only knows what the team believes today.")] : []));
    }
    fund.hidden = !(st.fundNote && plan.answer);
    fund.textContent = st.fundNote && plan.answer ? st.fundNote : "";
  }
  update(c.plan);
  return { el, update };
}
