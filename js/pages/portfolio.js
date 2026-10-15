import { h, eyebrow, link, arrow } from "../ui.js";
import { setMeta } from "../app.js";
import { lessonBySlug } from "../lessons/index.js";
import * as S from "../sim.js";
import { $k, signed$, per$, reduced } from "../portfolio/fmt.js";
import { createDeck } from "../portfolio/deck.js";
import { createMap } from "../portfolio/map.js";
import { createPanel } from "../portfolio/panel.js";
import { createFunding } from "../portfolio/funding.js";
import * as P from "../portfolio/plan.js";
import { requestScout } from "../portfolio/recon.js";
import { createBriefing } from "../portfolio/briefing.js";
import { debriefView, tierBar } from "../portfolio/debrief.js";

// Portfolio: run eight brands for a year, on-premise and off-premise. Decide → run the quarter → results → reallocate → review.
// The goal is a score against last year's plan. The hints are there to use or ignore; the ideas behind them are named at the end.

const KEY = "decision-os:sim:v2";
const load = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && Array.isArray(v.plans)) return v; } catch {} return null; };
const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };
const fresh = (vi = 0) => ({ vi, plans: [], draft: S.lastYearPlan(), phase: "decide", note: "", nextScout: null });

const tile = (label, value, sub, cls = "") => h("div", { class: "ev-tile" }, h("span", { class: "k" }, label), h("span", { class: `v ${cls}` }, value), sub ? h("span", { class: "sim-sub" }, sub) : null);
const unlocked = P.unlocked;

export default function Portfolio() {
  setMeta({ title: "Portfolio", description: "Run eight brands for a year, on-premise and off-premise. Beat last year's plan." });
  let st = load() || fresh(0);
  // The stage changes often; main is a polite live region, so the stage opts out and one status line speaks for it.
  const stage = h("div", { class: "sim-stage", "aria-live": "off" });
  const goal = h("p", { class: "sim-goal" });
  const deck = createDeck({ onRun: () => runQuarter() });
  const deckTop = h("div", { class: "fd-anchor", "aria-hidden": "true" }); // a static point to scroll to: the deck itself may be stuck
  const under = h("div", { class: "fd-under" });
  const status = h("p", { class: "sr-only", role: "status" });
  let statusTimer;
  const announce = (t) => { clearTimeout(statusTimer); statusTimer = setTimeout(() => { status.textContent = t; }, 700); };
  const toTop = () => deckTop.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  const persist = () => save(st);
  let flight = null; // the banked path for the horizon, rebuilt on every render
  let selectedId = "A"; // the brand open in the panel: view state only, never saved
  let sheetOpen = false; // under 1024px the panel is a bottom sheet, closed until a tile is opened
  let yearQs = []; // the played quarters, for scout reports in the panel

  const render = ({ scroll = false } = {}) => {
    const year = S.replay(st.plans, st.vi);
    const T = S.tiers(st.vi);
    goal.replaceChildren(h("b", {}, "Your goal: "), `beat last year's plan. `, ...T.map((t) => h("span", { class: `tier t-${t.name.toLowerCase()}` }, `${t.name} ${signed$(t.at)}`)), ...(st.vi ? [h("span", { class: "muted" }, ` · ${S.VARIANTS[st.vi].name}: new answers`)] : []));
    const R = st.phase === "review" && st.plans.length === 4 ? S.review(st.plans, st.vi) : null;
    if (!R && !(st.phase === "results" && st.plans.length)) { st.phase = "decide"; if (!st.draft) st.draft = S.lastYearPlan(); }
    flight = flightOf(year, R, T);
    yearQs = year.quarters;
    deck.setLive(st.phase === "decide");
    if (st.phase === "decide") {
      under.replaceChildren(achPanel(), howTo());
      stage.replaceChildren(decideView(year.state, year.quarters.at(-1)));
    } else {
      under.replaceChildren();
      deck.instruments({ decide: false, soFar: flight.points.at(-1).v, final: R ? R.score : null, gold: T.at(-1).at });
      deck.coach(R ? `Solid line: your year, ending ${signed$(R.score)}. Dashed: Scout early, then follow the forecast, ending ${signed$(R.bestScore)}. Both count what carries into next year.` : "");
      deck.horizon(flight);
      stage.replaceChildren(R ? reviewView(R) : resultsView(year.quarters.at(-1)));
    }
    if (scroll) toTop();
  };

  // The horizon's flown path: the banked score after each played quarter (the same sum as scoreSoFar), with any real event marked.
  function flightOf(year, R, T) {
    const habit = S.replay(S.habitPlans(st.vi).slice(0, year.quarters.length), st.vi).quarters;
    let acc = 0;
    const points = [{ v: 0 }, ...year.quarters.map((q, i) => {
      acc += q.gp - habit[i].gp;
      const unwind = q.rows.some((r) => r.unwind > 0);
      return { v: acc, note: q.insight, mark: q.insight ? { kind: unwind ? "bad" : "warn", label: unwind ? "Unwind" : q.answer?.load ? "Load-in" : "Event" } : null };
    })];
    const at = st.phase === "review" ? 5 : st.phase === "results" ? year.quarters.length : year.quarters.length + 1;
    // At year end, the benchmark's path on the same scale: the same per-quarter sum, and its year-end score.
    const ref = R ? (() => { const e = S.replay(S.evidencePlans(st.vi), st.vi).quarters; let a = 0; return { points: [0, ...e.map((q, i) => (a += q.gp - habit[i].gp))], final: R.bestScore, label: "Scout early, then follow the forecast" }; })() : null;
    return { points, tiers: T, at, final: R ? R.score : null, ref };
  }

  // ---------- Decide ----------
  function decideView(state, prev) {
    const qi = st.plans.length, Q = S.QUARTERS[qi], plan = st.draft, vi = st.vi;
    const brands = S.simBrands(vi), dil = S.dilemma(qi, vi);
    const canFocus = unlocked(qi, "focus"), canDays = unlocked(qi, "days");
    P.applyLocks(plan, qi);
    P.takeNextScout(plan, st, state);

    const go2 = h("button", { type: "button", class: "btn btn-lg", onClick: () => runQuarter() });
    let nums = null; // the latest forecast and budgets, shared by the map and the panel
    const soFar = flight.points.at(-1).v; // banked so far: the same sum as S.scoreSoFar

    const refresh = (why) => {
      const t = S.planTotals(plan, qi, vi), f = S.forecastQuarter(state, plan, qi);
      const habitPlan = { ...S.lastYearPlan(), answer: qi === 2 ? "menu-A" : "pass" }, hf = S.forecastQuarter(state, habitPlan, qi);
      const proj = f.gp - hf.gp, projNext = f.carryNext - hf.carryNext;
      const free = S.BUDGET.trade - t.trade, freeDays = S.BUDGET.days - t.days;
      const scoutsLeft = state.scoutsLeft - plan.scout.length;
      const needAnswer = dil && !plan.answer;
      deck.instruments({ decide: true, soFar, proj, air: projNext, free, freeDays, canDays, days: S.BUDGET.days, scoutsLeft, scouts: S.SCOUTS, qi, qid: Q.id, needAnswer, gold: S.tiers(vi).at(-1).at });
      go2.disabled = needAnswer;
      go2.textContent = `▶ Run ${Q.id}`;
      const worst = f.rows.filter((r) => plan.trade[r.id] > 0 && r.conf !== "Low").sort((a, b) => a.next - b.next)[0]; // never steer toward a brand the team can't read
      const bestR = [...f.rows].sort((a, b) => b.next - a.next)[0];
      deck.coach(needAnswer ? "First, answer this quarter's request." :
        free >= 10 ? `You have ${$k(free)} to place. Put it where the next $10K returns the most (${bestR ? `right now: Brand ${bestR.id}, about ${per$(bestR.next)} back` : ""}), or keep it: unspent trade stays in the P&L.` :
        qi === 0 && worst && worst.next < 1 ? `Every dollar is spent. Brand ${worst.id}'s next $10K returns about ${per$(worst.next)}, so it loses money. Try pulling $10K off a brand like that.` :
        canDays && freeDays > 0 ? `You have ${freeDays} field days to place. Put them where the next day earns the most.` :
        "Ready when you are. Run the quarter to see what actually happens.");
      deck.horizon({ ...flight, draft: { v: soFar + proj, air: projNext, last: qi === 3 } });
      nums = { f, free, freeDays, scoutsLeft };
      brief?.update(plan);
      showPanel();
      map.update({ brands, rows: f.rows, plan, state, prev, qi, vi, canFocus, canDays });
      persist();
      if (why) announce(`${why} Free trade ${$k(free)}. This quarter ≈ ${signed$(proj)} against last year's plan.`);
    };

    // Plan edits from the panel, all through js/portfolio/plan.js: + needs $10K free, − stops at zero; days likewise.
    const actions = {
      trade: (id, d) => { funding.rebase(); P.stepTrade(plan, id, d, qi, vi); refresh(`Brand ${id} ${$k(plan.trade[id])}.`); },
      setTrade: (id, x) => { const was = plan.trade[id]; P.setTrade(plan, id, x, qi, vi); if (plan.trade[id] !== was) refresh(`Brand ${id} ${$k(plan.trade[id])}.`); },
      move: (from, to) => { P.moveTrade(plan, from, to, qi, vi); refresh(`$10K moved from Brand ${from} to Brand ${to}: ${$k(plan.trade[from])} and ${$k(plan.trade[to])}.`); },
      days: (id, d) => { P.stepDays(plan, id, d, qi, vi); refresh(`Brand ${id} ${plan.days[id]} field days.`); },
      focus: (id, k) => { P.setFocus(plan, id, k); refresh(`Brand ${id}: ${S.FOCUS[k]}.`); },
      scout: (id) => { const had = plan.scout.includes(id); P.toggleScout(plan, id, state); refresh(`Brand ${id}: ${had ? "scout removed" : plan.scout.includes(id) ? "scout sent" : "no scout free"}.`); },
    };
    const funding = createFunding({ actions });
    const findingOf = (id) => { const at = state.scouted[id]; const r = at === undefined ? null : yearQs[at]?.rows.find((x) => x.id === id && x.finding); return r ? { q: at, text: r.finding } : null; };
    const showPanel = () => {
      if (!nums) return;
      const b = brands.find((x) => x.id === selectedId);
      panel.update({ b, r: nums.f.rows.find((x) => x.id === b.id), rows: nums.f.rows, plan, free: nums.free, freeDays: nums.freeDays, scoutsLeft: nums.scoutsLeft, state, last: prev?.rows.find((x) => x.id === b.id), qi, canFocus, canDays, finding: findingOf(b.id), reqScout: requestScout(plan, state, qi, vi) });
    };

    // The request as a briefing; js/portfolio/plan.js funds a paid option from the brands and refunds it on a change.
    // Rebuilding the view would drop keyboard focus, so it goes back to the same control in the new view.
    const rebuild = (sel, i = 0) => { stage.replaceChildren(decideView(state, prev)); stage.querySelectorAll(sel)[i]?.focus({ preventScroll: true }); };
    const pick = (o) => { P.pickAnswer(plan, st, o, state, qi, vi); rebuild(".fd-brief .opt", dil.options.indexOf(o)); };
    const brief = dil ? createBriefing({ dil, plan, st, state, qi, vi, prev, onPick: pick }) : null;

    // The map and the inspection panel (a bottom sheet under 1024px).
    const open = (id, focus) => { selectedId = id; map.select(id); showPanel(); sheetOpen = true; panel.open(focus); };
    const map = createMap({ onSelect: (id) => open(id, true) });
    const panel = createPanel({ actions, extra: (slot, c) => funding.update(slot, { ...c, f: nums.f }), onSelect: (id) => { open(id, false); }, onClose: () => { sheetOpen = false; panel.close(); map.tile(selectedId).focus(); } });
    map.select(selectedId);
    if (sheetOpen) panel.open(false, false); // a re-render keeps the sheet where it was, without sliding it in again

    const setPlan = (p, i) => { st.draft = P.resetTo(plan, p); rebuild(".sim-go .starts .link", i); };
    const view = h("div", { class: "sim-flow" },
      h("div", {}, eyebrow(`${Q.id} · ${Q.theme}`), h("h2", { style: { marginTop: "10px" } }, qi ? "What do you do now?" : "Where do your first dollars go?"), h("p", { class: "muted", style: { marginTop: "8px", maxWidth: "var(--measure)" } }, Q.line)),
      (() => {
        const reads = S.marketRead(vi, qi);
        const market = reads.length ? h("aside", { class: "sim-market" }, eyebrow("The market this quarter"), ...reads.map((m) => h("p", {}, m.text, " ", h("b", {}, m.answer)))) : null;
        return h("div", { class: `fd-briefrow ${market && brief ? "" : "is-one"}` }, brief?.el, market);
      })(),
      h("div", { class: "fd-cockpit" }, map.el, panel.el),
      h("div", { class: "sim-go" }, h("div", { class: "starts" }, h("span", { class: "muted" }, "Reset to:"),
        qi ? h("button", { type: "button", class: "link", onClick: () => setPlan({ ...st.plans[qi - 1], scout: [] }, 0) }, `your ${S.QUARTERS[qi - 1].id} plan`) : null,
        h("button", { type: "button", class: "link", onClick: () => setPlan(S.lastYearPlan(), qi ? 1 : 0) }, "last year's plan")), go2));
    refresh();
    return view;
  }

  // ---------- How to play, a disclosure under the deck ----------
  function howTo() {
    const later = st.plans.length === 3 ? "next year" : "next quarter"; // in Q4, what lands later lands next year
    return h("details", { class: "sim-howto" }, h("summary", {}, "How to play"), h("ul", {},
      h("li", {}, h("b", {}, "The goal: "), "end the year ahead of what last year's plan would have made. Your score counts gross profit after trade."),
      h("li", {}, h("b", {}, "Trade: "), "open a brand and drag its throttle, or press − and +, in $10K steps. Money you take off goes to free trade; you can't overspend, and you don't have to spend it all."),
      h("li", {}, h("b", {}, "Next $10K: "), "what the team expects the next $10K to bring back in gross profit, with the on-premise and off-premise figures underneath. $1 back per $1 breaks even; less loses money. A range means the team isn't sure."),
      h("li", {}, h("b", {}, "Where it goes: "), `Both splits a brand's money in its usual on/off-premise mix, shown in the brand's panel. On-premise work pays 40% of its return ${later}.`),
      h("li", {}, h("b", {}, "Scouts: "), "two a year. A rep finds out how a brand really responds, and reports back after the quarter."),
      h("li", {}, h("b", {}, "Channels (from Q2): "), `choose whether a brand's support goes off-premise (stores), on-premise (bars and restaurants), or both. On-premise builds menus and placements, so part of it pays ${later}.`),
      h("li", {}, h("b", {}, "Field days (from Q3): "), "your team's time. It's worth more on some brands than others."),
    ));
  }

  // ---------- Achievements, visible all year ----------
  function achPanel() {
    const list = S.achievementStatus(st.plans, st.vi), got = list.filter((a) => a.got).length;
    const ic = { got: "★", open: "☆", missed: "–" };
    return h("details", { class: "sim-howto sim-achpanel" }, h("summary", {}, `Achievements · ${got} of ${list.length}`),
      h("ul", { class: "sim-achlist" }, list.map((a) => h("li", { class: a.status },
        h("span", { class: "ic", "aria-hidden": "true" }, ic[a.status]),
        h("div", {}, h("b", {}, a.name), h("span", {}, a.status === "got" ? "Unlocked" : a.status === "missed" ? (a.note || "Missed this year") : a.hint))))));
  }

  // ---------- Run the quarter ----------
  function runQuarter() {
    const plan = S.clonePlan(st.draft), qi = st.plans.length, Q = S.QUARTERS[qi];
    const q = S.replay([...st.plans, plan], st.vi).quarters[qi];
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      st.plans.push(plan); st.phase = "results"; st.draft = null; persist(); render({ scroll: true });
      stage.querySelector("h2")?.focus({ preventScroll: true }); // keyboard and screen reader users land on the debrief
      announce(`${Q.id} closed. Results below.`);
    };
    if (reduced()) return finish(); // no path draw: straight to the debrief, which lists the quarter's events
    // The horizon draws this quarter's segment across its months, from the banked score to where the quarter lands.
    const habitQ = S.replay(S.habitPlans(st.vi).slice(0, qi + 1), st.vi).quarters[qi];
    const v = flight.points.at(-1).v + q.gp - habitQ.gp, base = { ...flight, at: qi + 1 };
    deck.setLive(false); under.replaceChildren(); // the feed sits right under the horizon while the quarter runs
    deck.instruments({ decide: false, soFar: flight.points.at(-1).v, gold: S.tiers(st.vi).at(-1).at });
    deck.coach(`Running ${Q.id}. The line draws the quarter as it closes.`);
    const DUR = 3000;
    const feed = h("ol", { class: "sim-feed", "aria-live": "polite" });
    const revOut = h("b", { class: "num v" }), gpOut = h("b", { class: "num v" });
    const title = h("h2", { style: { marginTop: "10px" }, tabindex: "-1" }, `Running ${Q.id}…`);
    stage.replaceChildren(h("div", { class: "sim-flow" },
      h("div", {}, eyebrow(`${Q.id} · ${Q.theme}`), title),
      h("div", { class: "ev-tiles" }, h("div", { class: "ev-tile" }, h("span", { class: "k" }, "Revenue so far"), revOut), h("div", { class: "ev-tile" }, h("span", { class: "k" }, "Gross profit after trade so far"), gpOut)),
      feed, h("button", { type: "button", class: "link", style: { justifySelf: "start" }, onClick: finish }, "Skip to results")));
    toTop();
    title.focus({ preventScroll: true });
    announce(`Running ${Q.id}.`);
    const t0 = performance.now(); let shown = 0;
    const tick = (t) => {
      if (done) return;
      const k = Math.min(1, (t - t0) / DUR), week = Math.max(1, Math.ceil(k * 13));
      deck.horizon({ ...base, run: { v, k, months: Q.months } });
      revOut.textContent = $k(q.rev * k); gpOut.textContent = $k(q.gp * k);
      while (shown < q.events.length && q.events[shown].week <= week) { const e = q.events[shown++]; feed.append(h("li", {}, h("span", { class: "wk" }, `Week ${e.week}`), e.text)); }
      if (k < 1) requestAnimationFrame(tick); else setTimeout(finish, 900);
    };
    requestAnimationFrame(tick);
    setTimeout(finish, DUR + 2500); // background tabs pause animation frames; the quarter still closes
  }

  // ---------- Results: the debrief (js/portfolio/debrief.js) ----------
  function resultsView(q) {
    const vi = st.vi, nextQ = S.QUARTERS[q.qi + 1];
    const habitQ = S.replay(S.habitPlans(vi).slice(0, q.qi + 1), vi).quarters[q.qi];
    return debriefView({ q, prev: q.qi ? yearQs[q.qi - 1] : null, habitQ, plans: st.plans, vi, soFar: S.scoreSoFar(st.plans, vi), T: S.tiers(vi), hasNext: !!nextQ,
      onScout: (id) => { st.nextScout = id; persist(); },
      onNext: () => { if (nextQ) { st.phase = "decide"; st.draft = P.nextDraft(q); } else st.phase = "review"; persist(); render({ scroll: true }); } });
  }

  // ---------- Year-end review ----------
  function reviewView(R) {
    const vi = st.vi;
    const scale = Math.max(Math.abs(R.score), Math.abs(R.bestScore), 1);
    const cmp = (label, g, cls) => h("div", { class: "sim-cmp-row" }, h("span", { class: "lbl" }, label), h("div", { class: "track" }, h("div", { class: `fill ${g < 0 ? "bad" : cls}`, style: { width: `${(Math.abs(g) / scale) * 100}%` } })), h("b", { class: "num" }, signed$(g)));
    const brandMax = Math.max(...R.quarters.flatMap((q) => Object.values(q.plan.trade)), 1);
    const noteBox = h("textarea", { class: "sim-note-input", rows: "3", placeholder: "One thing you'd do differently next year…", "aria-label": "What did you learn?" });
    noteBox.value = st.note || "";
    noteBox.addEventListener("input", () => { st.note = noteBox.value; persist(); });
    const mark = { yes: ["✓", "Used", "good"], partly: ["△", "Partly", "warn"], no: ["○", "Not yet", "muted"] };
    const onShare = R.you.revOn / (R.you.revOn + R.you.revOff), onShareLY = R.habit.revOn / (R.habit.revOn + R.habit.revOff);
    const other = st.vi ? 0 : 1;
    return h("div", { class: "sim-flow" },
      h("div", {}, eyebrow(`Year-end review · ${R.variant.name}`), h("h2", { style: { marginTop: "10px" } }, R.tier ? `${R.tier.name}. ${signed$(R.score)} against last year's plan.` : `${signed$(R.score)} against last year's plan.`),
        h("p", { class: "lede", style: { marginTop: "10px" } }, R.tier ? (R.tier.name === "Gold" ? "You ran the portfolio on evidence, not habit." : `Next tier: ${R.tiers.find((t) => t.at > R.score)?.name ?? ""} at ${signed$(R.tiers.find((t) => t.at > R.score)?.at ?? 0)}.`) : `Bronze starts at ${signed$(R.tiers[0].at)}. The ideas below show where the value was.`),
        h("div", { style: { marginTop: "14px" } }, tierBar(R.score, R.tiers))),
      h("div", {}, h("div", { class: "ev-tiles sim-tiles" },
        tile("Revenue", $k(R.you.rev)), tile("Gross profit after trade", $k(R.you.gp)),
        tile("On-premise share of revenue", `${Math.round(onShare * 100)}%`, `last year's plan ${Math.round(onShareLY * 100)}%`), tile("Trade spent", $k(R.you.trade), `of ${$k(S.BUDGET.trade * 4)}`)),
        h("p", { class: "muted", style: { marginTop: "10px" } }, `Your score counts next year too: ${R.you.carry > 5 ? `${$k(R.you.carry)} of on-premise work is already paying into next year` : "little is building for next year"}${R.you.borrowed ? `, and the load-in took ${$k(R.you.borrowed)} from it` : ""}.`)),
      h("div", {}, eyebrow("Achievements"), h("ul", { class: "sim-ach" }, R.achievements.map((a) => h("li", { class: a.got ? "got" : "" }, h("span", { class: "ic", "aria-hidden": "true" }, a.got ? "★" : "☆"), h("div", {}, h("b", {}, a.name), h("span", {}, a.got ? "Unlocked" : a.note || a.hint)))))),
      h("div", {}, eyebrow("Against the alternatives"), h("p", { class: "muted", style: { marginTop: "8px", fontSize: "var(--fs-small)" } }, "Value created against running last year's plan all year."),
        h("div", { class: "sim-cmp" }, cmp("You", R.score, "accent"), cmp("Scout early, then follow the forecast", R.bestScore, "good")),
        h("p", { class: "muted", style: { marginTop: "10px", fontSize: "var(--fs-small)", maxWidth: "var(--measure)" } }, "The second line is a specific discipline, not a guess: scout the two brands the team is least sure about in Q1, then every quarter put each $10K where the card's Next $10K is highest and set each brand's channel from what the team has learned. It sees only what you saw, with no hindsight."),
        R.differences.length ? h("div", { style: { marginTop: "12px" } }, eyebrow("Where it differed from you"), h("ul", { class: "sim-diff" }, R.differences.map((t) => h("li", {}, t)))) : null),
      h("div", {}, eyebrow("How you tend to decide"), h("ul", { class: "sim-tend" }, R.tendencies.map((t) => h("li", {}, h("b", {}, t.label), h("span", {}, t.text))))),
      h("div", {}, eyebrow("Where your trade went"), h("div", { class: "sim-migrate" },
        h("div", { class: "hdr" }, h("span", {}), ...S.QUARTERS.map((q) => h("span", {}, q.id))),
        ...S.brandIds.map((id) => h("div", { class: "row" }, h("span", { class: "nm" }, id), ...R.quarters.map((q) => h("div", { class: "cell", title: $k(q.plan.trade[id] || 0) }, q.plan.trade[id] ? h("i", { class: q.plan.focus[id] === "on" ? "on" : q.plan.focus[id] === "off" ? "off" : "", style: { width: `${(q.plan.trade[id] / brandMax) * 75}%` } }) : null, h("span", { class: "amt" }, q.plan.trade[id] ? `${$k(q.plan.trade[id])}${q.plan.focus[id] === "on" ? " on" : q.plan.focus[id] === "off" ? " off" : ""}` : "—"))))))),
      h("div", {}, eyebrow("What your decisions reflected"), h("p", { class: "muted", style: { marginTop: "8px", maxWidth: "var(--measure)" } }, "Every one of these was available to you all year."),
        h("div", { class: "sim-algos" }, R.algorithms.map((a) => h("div", { class: "sim-algo" },
          h("span", { class: `mk ${mark[a.status][2]}`, "aria-hidden": "true" }, mark[a.status][0]),
          h("div", {}, h("p", { class: "idea" }, a.idea, h("span", { class: `st ${mark[a.status][2]}` }, mark[a.status][1])), h("p", { class: "means" }, a.means), h("p", { class: "why" }, a.why),
            a.status !== "yes" ? h("p", { class: "next" }, a.next) : null,
            lessonBySlug[a.slug] ? link(`/learn/${a.slug}`, h("span", { class: "link", style: { fontSize: "var(--fs-small)" } }, `Learn: ${lessonBySlug[a.slug].title} `, arrow())) : null))))),
      h("div", { class: "card", style: { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" } },
        h("p", { style: { fontSize: "1.375rem", lineHeight: 1.35, letterSpacing: "-0.01em" } }, "You don't need to calculate any of these. You just need to make decisions that account for them.")),
      h("div", {}, eyebrow("What did you learn?"), h("div", { style: { marginTop: "10px" } }, noteBox), h("p", { class: "muted", style: { fontSize: "var(--fs-micro)", marginTop: "6px" } }, "Saved on this device only.")),
      h("div", { class: "sim-go", style: { flexDirection: "row", flexWrap: "wrap" } },
        h("button", { type: "button", class: "btn", onClick: () => { st = fresh(other); persist(); render({ scroll: true }); } }, `Play ${S.VARIANTS[other].name.toLowerCase()} `, arrow()),
        h("button", { type: "button", class: "btn btn-ghost", onClick: () => { st = fresh(vi); persist(); render({ scroll: true }); } }, `Replay ${R.variant.name.toLowerCase()}`)),
      h("p", { class: "muted", style: { fontSize: "var(--fs-small)" } }, `${S.VARIANTS[other].name} has the same brands with different answers: a different brand is broken and a different one is the sleeper.`));
  }

  render();
  return h("div", { class: "fd" },
    h("section", { class: "reveal" }, eyebrow("Portfolio"), h("h1", { class: "hero", style: { marginTop: "16px" } }, "Run the business for a year."),
      h("p", { class: "hero-sub" }, `Eight brands, two channels, four quarters. ${$k(S.BUDGET.trade)} of trade a quarter, a team with limited time, and a request on your desk every quarter. You can't do everything.`),
      goal),
    deckTop, deck.el, under,
    h("section", { class: "fd-stagewrap" }, stage),
    status);
}
