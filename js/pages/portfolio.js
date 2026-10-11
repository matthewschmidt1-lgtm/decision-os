import { h, s as svg, eyebrow, link, arrow, says } from "../ui.js";
import { setMeta } from "../app.js";
import { money, pct } from "../models.js";
import { lessonBySlug } from "../lessons/index.js";
import * as S from "../sim.js";
import { $k, signed$, pts, per$, delta, tone, reduced } from "../portfolio/fmt.js";
import { createDeck } from "../portfolio/deck.js";

// Portfolio: run eight brands for a year, on-premise and off-premise. Decide → run the quarter → results → reallocate → review.
// The goal is a score against last year's plan. The hints are there to use or ignore; the ideas behind them are named at the end.

const KEY = "decision-os:sim:v2";
const load = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && Array.isArray(v.plans)) return v; } catch {} return null; };
const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };
const fresh = (vi = 0) => ({ vi, plans: [], draft: S.lastYearPlan(), phase: "decide", note: "", nextScout: null });

const tile = (label, value, sub, cls = "") => h("div", { class: "ev-tile" }, h("span", { class: "k" }, label), h("span", { class: `v ${cls}` }, value), sub ? h("span", { class: "sim-sub" }, sub) : null);
const unlocked = (qi, what) => S.QUARTERS.slice(0, qi + 1).some((q) => q.unlock === what);

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

  const render = ({ scroll = false } = {}) => {
    const year = S.replay(st.plans, st.vi);
    const T = S.tiers(st.vi);
    goal.replaceChildren(h("b", {}, "Your goal: "), `beat last year's plan. `, ...T.map((t) => h("span", { class: `tier t-${t.name.toLowerCase()}` }, `${t.name} ${signed$(t.at)}`)), ...(st.vi ? [h("span", { class: "muted" }, ` · ${S.VARIANTS[st.vi].name}: new answers`)] : []));
    const R = st.phase === "review" && st.plans.length === 4 ? S.review(st.plans, st.vi) : null;
    if (!R && !(st.phase === "results" && st.plans.length)) { st.phase = "decide"; if (!st.draft) st.draft = S.lastYearPlan(); }
    flight = flightOf(year, R, T);
    deck.setLive(st.phase === "decide");
    if (st.phase === "decide") {
      under.replaceChildren(achPanel(), howTo());
      stage.replaceChildren(decideView(year.state, year.quarters.at(-1)));
    } else {
      under.replaceChildren();
      deck.instruments({ decide: false, soFar: flight.points.at(-1).v, final: R ? R.score : null });
      deck.coach("");
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
    return { points, tiers: T, at, final: R ? R.score : null };
  }

  // ---------- Decide ----------
  function decideView(state, prev) {
    const qi = st.plans.length, Q = S.QUARTERS[qi], plan = st.draft, vi = st.vi;
    const brands = S.simBrands(vi), dil = S.dilemma(qi, vi);
    const canFocus = unlocked(qi, "focus"), canDays = unlocked(qi, "days");
    if (!canDays) plan.days = { ...S.lastYearPlan().days };
    if (!canFocus) plan.focus = { ...S.lastYearPlan().focus };
    if (st.nextScout && !plan.scout.includes(st.nextScout) && state.scouted[st.nextScout] === undefined && state.scoutsLeft > plan.scout.length) plan.scout.push(st.nextScout);
    st.nextScout = null;

    const go2 = h("button", { type: "button", class: "btn btn-lg", onClick: () => runQuarter() });
    const cards = {};
    const soFar = flight.points.at(-1).v; // banked so far: the same sum as S.scoreSoFar

    const refresh = (why) => {
      const t = S.planTotals(plan, qi, vi), f = S.forecastQuarter(state, plan, qi);
      const habitPlan = { ...S.lastYearPlan(), answer: qi === 2 ? "menu-A" : "pass" }, hf = S.forecastQuarter(state, habitPlan, qi);
      const proj = f.gp - hf.gp, projNext = f.carryNext - hf.carryNext;
      const free = S.BUDGET.trade - t.trade, freeDays = S.BUDGET.days - t.days;
      const scoutsLeft = state.scoutsLeft - plan.scout.length;
      const needAnswer = dil && !plan.answer;
      deck.instruments({ decide: true, soFar, proj, air: projNext, free, freeDays, canDays, days: S.BUDGET.days, scoutsLeft, scouts: S.SCOUTS, qi, qid: Q.id, needAnswer });
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
      f.rows.forEach((r) => cards[r.id]?.update(r, free, freeDays, scoutsLeft));
      persist();
      if (why) announce(`${why} Free trade ${$k(free)}. This quarter ≈ ${signed$(proj)} against last year's plan.`);
    };

    const brandCard = (b) => {
      const bel = state.beliefs[b.id];
      const last = prev?.rows.find((r) => r.id === b.id);
      const scouted = state.scouted[b.id] !== undefined;
      const amt = h("output", { class: "num amt" }), was = h("span", { class: "was" });
      const next = h("div", { class: "next" }), gauge = h("div", { class: "gauge", "aria-hidden": "true" }, h("i"), h("b"));
      const chan = h("div", { class: "sim-chan" }), splitLine = h("p", { class: "sim-split" });
      const lastQ = last ? h("p", { class: "sim-lastq" }, `${S.QUARTERS[qi - 1].id}: `, ...[["off-premise", last.mOffLast, last.xOff < last.floor], ["on-premise", last.mOnLast, false]].filter(([, m]) => m != null).flatMap(([ch, m, under], i) => [i ? " · " : "", `${ch} `, h("b", { class: verdictOf(m, under).cls }, verdictOf(m, under).text.toLowerCase())])) : null;
      const minus = h("button", { type: "button", "aria-label": `Take $10K from ${b.name}`, onClick: () => { plan.trade[b.id] = Math.max(0, plan.trade[b.id] - S.STEP.trade); refresh(`${b.name} ${$k(plan.trade[b.id])}.`); } }, "−");
      const plus = h("button", { type: "button", "aria-label": `Give $10K to ${b.name}`, onClick: () => { plan.trade[b.id] += S.STEP.trade; refresh(`${b.name} ${$k(plan.trade[b.id])}.`); } }, "+");
      const dOut = h("output", { class: "num" }), dHint = h("span", { class: "hint" });
      const dMinus = h("button", { type: "button", "aria-label": `One fewer field day for ${b.name}`, onClick: () => { plan.days[b.id] = Math.max(0, plan.days[b.id] - 1); refresh(`${b.name} ${plan.days[b.id]} field days.`); } }, "−");
      const dPlus = h("button", { type: "button", "aria-label": `One more field day for ${b.name}`, onClick: () => { plan.days[b.id] += 1; refresh(`${b.name} ${plan.days[b.id]} field days.`); } }, "+");
      const floorWarn = h("p", { class: "floor-warn", hidden: true });
      const scout = h("button", { type: "button", class: "sim-scout", disabled: scouted, onClick: () => { const i = plan.scout.indexOf(b.id); if (i >= 0) plan.scout.splice(i, 1); else plan.scout.push(b.id); refresh(`${b.name}: ${i >= 0 ? "scout removed" : "scout sent"}.`); } });
      const focusBtns = Object.entries(S.FOCUS).map(([k, label]) => h("button", { type: "button", "aria-pressed": String(plan.focus[b.id] === k), onClick: () => { plan.focus[b.id] = k; focusBtns.forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.k === k))); refresh(`${b.name}: ${label}.`); }, dataset: { k } }, label));
      const lastLine = last && last.x ? `Last quarter: ${per$(last.perDollar)} back per $1 on ${$k(last.x)}${last.onReturn && last.offReturn ? ` (on-premise ${per$(last.onReturn)}, off-premise ${per$(last.offReturn)})` : ""}.` : null;
      const card = h("div", { class: `sim-brand ${scouted ? "is-scouted" : ""}` },
        h("div", { class: "sim-brand-head" }, h("h3", {}, b.name), h("span", { class: "chip" }, b.role)),
        h("p", { class: "sim-note" }, scouted ? h("span", { class: "scouted" }, `Scouted in ${S.QUARTERS[state.scouted[b.id]].id}. `) : null, b.note),
        h("div", { class: "sim-next" }, h("span", { class: "k" }, "Next $10K"), next, gauge, chan, lastQ),
        h("div", { class: "sim-alloc" }, minus, h("div", { class: "mid" }, amt, was), plus),
        floorWarn,
        splitLine,
        canFocus ? h("div", { class: "sim-focus", role: "group", "aria-label": `Where ${b.name}'s support goes` }, ...focusBtns) : null,
        canDays ? h("div", { class: "sim-days" }, h("span", { class: "k" }, "Field days"), h("div", { class: "ctl" }, dMinus, dOut, dPlus), dHint) : null,
        h("div", { class: "sim-card-foot" }, scout,
          h("details", { class: "sim-details" }, h("summary", {}, "Details"),
            h("dl", {}, h("div", {}, h("dt", {}, "Revenue"), h("dd", {}, money(b.revenue))), h("div", {}, h("dt", {}, last ? `Growth in ${S.QUARTERS[qi - 1].id}` : "Growth"), h("dd", { class: tone(last ? last.growth : b.growth) }, pts(last ? last.growth : b.growth))),
              h("div", {}, h("dt", {}, "Margin"), h("dd", {}, `${b.gm}%`)), h("div", {}, h("dt", {}, "On-premise share"), h("dd", {}, `${Math.round(b.share * 100)}%`)),
              h("div", {}, h("dt", {}, "Expected return, on / off"), h("dd", {}, `${per$(bel.on.b)} / ${per$(bel.off.b)}`)),
              b.floor ? h("div", {}, h("dt", {}, "Off-premise shelf needs"), h("dd", {}, `${$k(b.floor)} a quarter`)) : null),
            lastLine ? h("p", { class: "muted" }, lastLine) : null)));
      card.update = (r, free, freeDays, scoutsLeft) => {
        const x = plan.trade[b.id];
        amt.textContent = $k(x);
        const base = S.lastYearPlan().trade[b.id];
        was.textContent = x === base ? "same as last year" : `${x > base ? "+" : "−"}${$k(Math.abs(x - base))} vs last year`;
        const gain = Math.round((r.next - 1) * 100) / 10; // $K per $10K, to the nearest $100
        next.replaceChildren(r.conf === "High" ? h("b", {}, `${per$(r.next)} back`) : h("b", {}, `${per$(r.nextLo)}–${per$(r.nextHi)} back`),
          h("span", { class: `pill ${r.next >= 1.02 ? "good" : r.next <= 0.98 ? "bad" : ""}` }, Math.abs(gain) < 0.2 ? "breaks even" : gain > 0 ? `earns ${$k(gain)}` : `loses ${$k(-gain)}`),
          ...(r.conf !== "High" ? [h("span", { class: "conf", title: "How sure the team is" }, r.conf === "Low" ? "? unsure" : "roughly")] : []));
        const gainOf = (m) => { const g = Math.round((m - 1) * 100) / 10; return Math.abs(g) < 0.2 ? ["breaks even", ""] : g > 0 ? [`earns ${$k(g)}`, "good"] : [`loses ${$k(-g)}`, "bad"]; };
        const [offT, offC] = gainOf(r.mOff), [onT, onC] = gainOf(r.mOn);
        chan.replaceChildren(
          h("span", {}, h("b", {}, "Off-premise"), ` ${per$(r.mOff)} back · `, h("span", { class: offC }, offT)),
          h("span", {}, h("b", {}, "On-premise"), ` ${per$(r.mOn)} back · `, h("span", { class: onC }, onT), ", 40% of it lands next quarter"));
        const mix = plan.focus[b.id] || "both";
        splitLine.textContent = x ? `Where ${b.name}'s ${$k(x)} goes: off-premise ${$k(r.xOff)} · on-premise ${$k(r.xOn)}${mix === "both" ? ` (Both = its usual ${Math.round(b.share * 100)}% on-premise mix)` : ""}` : `${b.name} gets nothing this quarter.`;
        gauge.firstChild.style.width = `${Math.min(100, (r.next / 2.5) * 100)}%`;
        gauge.firstChild.className = Math.abs(gain) < 0.2 ? "even" : r.next >= 1 ? "good" : "bad";
        plus.disabled = free < S.STEP.trade; minus.disabled = x <= 0;
        const off = r.xOff, floorNow = r.floor;
        floorWarn.hidden = !(floorNow && off < floorNow);
        floorWarn.textContent = `Off-premise gets ${$k(off)} of the ${$k(x)}, and this brand needs ${$k(floorNow)} off-premise to hold its shelf space${floorNow > b.floor ? " this quarter" : ""}.${canFocus ? " Set it to Off-premise, or add $10K." : " Add $10K, or expect to lose some base volume."}`;
        dOut.textContent = `${plan.days[b.id]} d`; dPlus.disabled = freeDays < 1; dMinus.disabled = plan.days[b.id] <= 0;
        dHint.textContent = `next day ≈ ${$k(r.nextDay)}`;
        const on = plan.scout.includes(b.id);
        scout.textContent = scouted ? "Scouted" : on ? "Scouting ✓" : "Send a scout";
        scout.setAttribute("aria-pressed", String(on));
        scout.disabled = scouted || (!on && scoutsLeft <= 0);
        scout.title = scouted ? "" : "A rep finds out how this brand really responds, in both channels. Two scouts a year.";
      };
      cards[b.id] = card;
      return card;
    };

    const request = dil ? (() => {
      // Every option is clickable. If a choice costs money you haven't freed up, it's funded for you (first from the brand the
      // request is about, then from the brands whose next $10K returns least) and the card says what moved.
      const fund = (o) => {
        let need = o.cost - (S.BUDGET.trade - S.planTotals({ ...plan, answer: null }, qi, vi).trade);
        const moved = {};
        const f = S.forecastQuarter(state, plan, qi).rows;
        const order = [o.extra?.id, ...[...f].sort((x, y) => x.next - y.next).map((r) => r.id)].filter(Boolean);
        for (const id of order) { while (need > 0 && plan.trade[id] >= S.STEP.trade) { plan.trade[id] -= S.STEP.trade; need -= S.STEP.trade; moved[id] = (moved[id] || 0) + S.STEP.trade; } if (need <= 0) break; }
        const list = Object.entries(moved).map(([id, x]) => `${$k(x)} from Brand ${id}`);
        st.fundNote = list.length ? `To fund it, ${list.join(" and ")} moved into the request.` : null;
        st.funded = list.length ? moved : null;
      };
      // Changing or clearing the answer gives back whatever the earlier choice pulled out of the brands.
      const refund = () => { if (st.funded) { for (const [id, x] of Object.entries(st.funded)) plan.trade[id] = (plan.trade[id] || 0) + x; st.funded = null; } };
      const pick = (o) => {
        st.fundNote = null; refund();
        if (plan.answer === o.id) plan.answer = null;
        else {
          if (o.cost) fund(o);
          if (o.scout) { const free = state.scoutsLeft - plan.scout.length; if (free <= 0 && plan.scout.length) { const dropped = plan.scout.pop(); st.fundNote = `Your scout on Brand ${dropped} goes here instead.`; } }
          plan.answer = o.id;
        }
        stage.replaceChildren(decideView(state, prev));
      };
      const box = h("div", { class: "sim-request", role: "group", "aria-label": `Request from ${dil.who}` },
        h("p", { class: "who" }, `A request from ${dil.who}`), h("p", { class: "ask" }, dil.ask),
        h("div", { class: "opts" }, ...dil.options.map((o) => {
          const used = o.scout && state.scouted[o.scout] !== undefined, none = o.scout && state.scoutsLeft <= 0;
          const read = o.menu ? S.onRead(state, o.menu) : null;
          const readText = read ? `On-premise: ${read.conf === "High" ? per$(read.b) : `${per$(read.lo)}–${per$(read.hi)}`} per $1 · ${read.conf} confidence` : null;
          return h("button", { type: "button", class: "opt", "aria-pressed": String(plan.answer === o.id), disabled: used || none, onClick: () => pick(o) },
            o.label, ...(used ? [h("span", { class: "why" }, "Already scouted")] : none ? [h("span", { class: "why" }, "You've used both scouts this year")] : readText ? [h("span", { class: "why" }, readText)] : []));
        })),
        ...(dil.id === "menu" ? [h("p", { class: "note" }, "The team's current read on each brand's on-premise return, updated by everything you've funded and scouted so far. A range means they aren't sure.")] : []),
        ...(st.fundNote && plan.answer ? [h("p", { class: "note" }, st.fundNote)] : []));
      return box;
    })() : null;

    const setPlan = (p) => { st.draft = { ...S.clonePlan(p), answer: plan.answer }; stage.replaceChildren(decideView(state, prev)); };
    const view = h("div", { class: "sim-flow" },
      h("div", {}, eyebrow(`${Q.id} · ${Q.theme}`), h("h2", { style: { marginTop: "10px" } }, qi ? "What do you do now?" : "Where do your first dollars go?"), h("p", { class: "muted", style: { marginTop: "8px", maxWidth: "var(--measure)" } }, Q.line)),
      request,
      (() => { const reads = S.marketRead(vi, qi); return reads.length ? h("div", { class: "sim-market" }, eyebrow("The market this quarter"), ...reads.map((m) => h("p", {}, m.text, " ", h("b", {}, m.answer)))) : null; })(),
      h("div", { class: "sim-brands" }, brands.map(brandCard)),
      h("div", { class: "sim-go" }, h("div", { class: "starts" }, h("span", { class: "muted" }, "Reset to:"),
        qi ? h("button", { type: "button", class: "link", onClick: () => setPlan({ ...st.plans[qi - 1], scout: [] }) }, `your ${S.QUARTERS[qi - 1].id} plan`) : null,
        h("button", { type: "button", class: "link", onClick: () => setPlan(S.lastYearPlan()) }, "last year's plan")), go2));
    refresh();
    return view;
  }

  // ---------- How to play, a disclosure under the deck ----------
  function howTo() {
    return h("details", { class: "sim-howto" }, h("summary", {}, "How to play"), h("ul", {},
      h("li", {}, h("b", {}, "The goal: "), "end the year ahead of what last year's plan would have made. Your score counts gross profit after trade."),
      h("li", {}, h("b", {}, "Trade: "), "press − to take $10K off a brand into your free trade, + to give it to another. You can't overspend, and you don't have to spend it all."),
      h("li", {}, h("b", {}, "Next $10K: "), "what the team expects the next $10K to bring back in gross profit, with the on-premise and off-premise figures underneath. $1 back per $1 breaks even; less loses money. A range means the team isn't sure."),
      h("li", {}, h("b", {}, "Where it goes: "), "Both splits a brand's money in its usual on/off-premise mix, shown on the card. On-premise work pays 40% of its return next quarter."),
      h("li", {}, h("b", {}, "Scouts: "), "two a year. A rep finds out how a brand really responds, and reports back after the quarter."),
      h("li", {}, h("b", {}, "Channels (from Q2): "), "choose whether a brand's support goes off-premise (stores), on-premise (bars and restaurants), or both. On-premise builds menus and placements, so part of it pays next quarter."),
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
    const finish = () => { if (done) return; done = true; st.plans.push(plan); st.phase = "results"; st.draft = null; persist(); render({ scroll: true }); };
    if (reduced()) return finish();
    deck.setLive(false); deck.run.disabled = true;
    const DUR = 3500;
    const fill = h("div", { class: "fill" }), feed = h("ol", { class: "sim-feed", "aria-live": "polite" });
    const revOut = h("b", { class: "num v" }), gpOut = h("b", { class: "num v" });
    stage.replaceChildren(h("div", { class: "sim-flow" },
      h("div", {}, eyebrow(`${Q.id} · ${Q.theme}`), h("h2", { style: { marginTop: "10px" } }, `Running ${Q.id}…`)),
      h("div", { class: "sim-clock" }, h("div", { class: "months" }, Q.months.map((m) => h("span", {}, m))), h("div", { class: "track" }, fill)),
      h("div", { class: "ev-tiles" }, h("div", { class: "ev-tile" }, h("span", { class: "k" }, "Revenue so far"), revOut), h("div", { class: "ev-tile" }, h("span", { class: "k" }, "Gross profit after trade so far"), gpOut)),
      feed, h("button", { type: "button", class: "link", style: { justifySelf: "start" }, onClick: finish }, "Skip to results")));
    toTop();
    const t0 = performance.now(); let shown = 0;
    const tick = (t) => {
      if (done) return;
      const k = Math.min(1, (t - t0) / DUR), week = Math.max(1, Math.ceil(k * 13));
      fill.style.width = `${k * 100}%`; revOut.textContent = $k(q.rev * k); gpOut.textContent = $k(q.gp * k);
      while (shown < q.events.length && q.events[shown].week <= week) { const e = q.events[shown++]; feed.append(h("li", {}, h("span", { class: "wk" }, `Week ${e.week}`), e.text)); }
      if (k < 1) requestAnimationFrame(tick); else setTimeout(finish, 900);
    };
    requestAnimationFrame(tick);
    setTimeout(finish, DUR + 2500); // background tabs pause animation frames; the quarter still closes
  }

  // ---------- Results ----------
  // A plain verdict on a channel's last $10K: room to add, near the top, or past it (and whether it was still covering the shelf).
  const verdictOf = (m, underFloor) => underFloor ? { text: "Below the shelf floor", cls: "bad" } : m == null ? { text: "Nothing spent", cls: "muted" } : m >= 1.1 ? { text: "Room to add", cls: "good" } : m >= 0.95 ? { text: "Near the top", cls: "" } : { text: "Past the top: move it", cls: "bad" };
  function returnTable(q) {
    const prev = q.qi ? S.replay(st.plans.slice(0, q.qi), st.vi).quarters.at(-1) : null;
    const rows = q.rows.flatMap((r) => {
      const p = prev?.rows.find((x) => x.id === r.id);
      return [["off", "Off-premise", r.xOff, r.mOffLast, p?.mOffLast, r.xOff < r.floor && r.floor > 0], ["on", "On-premise", r.xOn, r.mOnLast, p?.mOnLast, false]]
        .filter(([, , x]) => x >= 10).map(([ch, label, x, m, pm, under]) => ({ id: r.id, ch, label, x, m, pm, under, v: verdictOf(m, under) }));
    }).sort((a, b) => (b.m ?? 0) - (a.m ?? 0));
    const trend = (m, pm) => (m == null || pm == null ? "" : m - pm > 0.05 ? "▲" : pm - m > 0.05 ? "▼" : "–");
    return h("div", { class: "table-wrap" }, h("table", { class: "table sim-rt" },
      h("thead", {}, h("tr", {}, h("th", {}, "Brand"), h("th", {}, "Channel"), h("th", { class: "num" }, "Spent"), h("th", { class: "num" }, "Last $10K returned"), h("th", { class: "num" }, "vs last Q"), h("th", {}, "Read"))),
      h("tbody", {}, rows.map((x) => h("tr", {}, h("td", {}, h("b", { style: { fontWeight: 500 } }, `Brand ${x.id}`)), h("td", { class: "muted" }, x.label), h("td", { class: "num" }, $k(x.x)),
        h("td", { class: `num ${x.v.cls}` }, x.m == null ? "—" : `${per$(x.m)} per $1`), h("td", { class: "num muted" }, trend(x.m, x.pm)), h("td", {}, h("span", { class: `chip ${x.v.cls === "good" ? "chip-good" : x.v.cls === "bad" ? "chip-warn" : ""}` }, x.v.text)))))));
  }
  function resultsView(q) {
    const Q = S.QUARTERS[q.qi], nextQ = S.QUARTERS[q.qi + 1], vi = st.vi;
    const habitQ = S.replay(S.habitPlans(vi).slice(0, q.qi + 1), vi).quarters[q.qi];
    const qScore = q.gp - habitQ.gp, soFar = S.scoreSoFar(st.plans, vi), T = S.tiers(vi);
    const d = (a, f) => ((a - f) / Math.abs(f)) * 100;
    const findings = q.rows.filter((r) => r.finding);
    const broken = q.rows.find((r) => r.chainOff.kind === "break");
    const bigBet = [...q.rows].sort((a, b) => b.x - a.x)[0];
    const learned = q.rows.map((r) => ({ r, dOn: r.after.on.b - r.before.on.b, dOff: r.after.off.b - r.before.off.b })).filter((x) => !x.r.finding && Math.max(Math.abs(x.dOn), Math.abs(x.dOff)) >= 0.15)
      .sort((a, b) => Math.max(Math.abs(b.dOn), Math.abs(b.dOff)) - Math.max(Math.abs(a.dOn), Math.abs(a.dOff))).slice(0, 3);
    let view = "all";
    const NOISE = 2; // points of forecast error the sim's own noise can produce
    const board = h("div", { class: "sim-plots" }), boardNote = h("p", { class: "sim-dots-sum" });
    // Tap or click a brand on either chart and its numbers appear here (native tooltips never show on touch).
    const readoutFor = () => h("p", { class: "sim-readout", role: "status" }, "Tap a brand for its numbers.");
    const select = (g, text) => {
      board.querySelectorAll(".pt.on, .col.on").forEach((el) => el.classList.remove("on")); board.querySelectorAll(`[data-brand="${g.dataset.brand}"]`).forEach((el) => el.classList.add("on"));
      board.querySelectorAll(".sim-readout").forEach((p) => { p.textContent = "Tap a brand for its numbers."; p.classList.remove("on"); });
      const p = g.closest(".sim-fig")?.querySelector(".sim-readout"); if (p) { p.textContent = text; p.classList.add("on"); }
    };
    const drawTable = () => {
      const rows = q.rows.map((r) => {
        const share = S.simBrands(vi).find((b) => b.id === r.id).share;
        const f = view === "all" ? r.growthF : view === "on" ? (r.revOnF / (r.q * share) - 1) * 100 : (r.revOffF / (r.q * (1 - share)) - 1) * 100;
        const a = view === "all" ? r.growth : view === "on" ? (r.revOn / (r.q * share) - 1) * 100 : (r.revOff / (r.q * (1 - share)) - 1) * 100;
        const spend = view === "all" ? r.x : view === "on" ? r.xOn : r.xOff;
        // Both charts use the whole-point figures the labels show, so a dot's distance from the line is exactly its column.
        const fr = Math.round(f) || 0, ar = Math.round(a) || 0, dd = ar - fr;
        return { id: r.id, f: fr, a: ar, dd, spend, t: Math.abs(dd) < NOISE ? "even" : dd > 0 ? "good" : "bad" };
      }).sort((x, y) => x.id.localeCompare(y.id));
      const signal = rows.filter((x) => x.t !== "even");
      const tipText = (x) => `Brand ${x.id}: forecast ${pts(x.f)}, actual ${pts(x.a)} (${x.t === "even" ? "on plan" : `${delta(x.dd)} pts`}) · ${$k(x.spend)} trade`;
      const tip = (x) => svg("title", {}, tipText(x));
      const tappable = (g, x) => { g.dataset.brand = x.id; g.setAttribute("tabindex", "0"); g.setAttribute("role", "button"); g.addEventListener("click", () => select(g, tipText(x))); g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(g, tipText(x)); } }); return g; };
      board.replaceChildren(scatter(rows, tip, tappable), columns(rows, tip, tappable));
      const names = (list) => { const ids = list.map((x) => x.id); return `${ids.length > 1 ? "Brands" : "Brand"} ${ids.length > 1 ? `${ids.slice(0, -1).join(", ")} and ${ids.at(-1)}` : ids[0]}`; };
      const beat = signal.filter((x) => x.dd > 0), missed = signal.filter((x) => x.dd < 0);
      const parts = [beat.length && `${names(beat)} beat forecast`, missed.length && `${names(missed)} missed`].filter(Boolean).join("; ");
      boardNote.textContent = !signal.length ? "Every brand landed within a point of forecast. No signal here this quarter."
        : `${signal.length === 1 ? "1 brand" : `${signal.length} brands`} landed outside the noise: ${parts}. That's the signal; start there.`;
    };
    const ticks = (lo, hi) => { const step = hi - lo > 24 ? 10 : 5, out = []; for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push(v); return out; };
    const scatter = (rows, tip, tappable) => {
      const W = 360, H = 300, L = 56, R = 12, T = 14, B = 46;
      const vals = rows.flatMap((x) => [x.f, x.a]), step = Math.max(...vals) - Math.min(...vals) > 24 ? 10 : 5;
      const lo = Math.floor((Math.min(0, ...vals) - 1) / step) * step, hi = Math.ceil((Math.max(0, ...vals) + 1) / step) * step;
      const X = (v) => L + ((v - lo) / (hi - lo)) * (W - L - R), Y = (v) => H - B - ((v - lo) / (hi - lo)) * (H - T - B), band = NOISE - 0.5;
      const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-plot", role: "img", "aria-label": "Forecast versus actual growth by brand" });
      g.append(svg("polygon", { class: "band", points: [[lo, lo + band], [hi - band, hi], [hi, hi], [hi, hi - band], [lo + band, lo], [lo, lo]].map(([x, y]) => `${X(x)},${Y(y)}`).join(" ") }));
      for (const v of ticks(lo, hi)) g.append(
        svg("line", { class: v === 0 ? "axis" : "grid", x1: L, x2: W - R, y1: Y(v), y2: Y(v) }), svg("line", { class: v === 0 ? "axis" : "grid", y1: T, y2: H - B, x1: X(v), x2: X(v) }),
        svg("text", { x: L - 6, y: Y(v) + 4, "text-anchor": "end" }, pts(v)), svg("text", { x: X(v), y: H - B + 16, "text-anchor": v >= hi ? "end" : v <= lo ? "start" : "middle" }, pts(v)));
      g.append(svg("line", { class: "diag", x1: X(lo), y1: Y(lo), x2: X(hi), y2: Y(hi) }),
        svg("text", { class: "zone good", x: L + 8, y: T + 14 }, "Beat forecast"), svg("text", { class: "zone bad", x: W - R - 8, y: H - B - 8, "text-anchor": "end" }, "Missed forecast"),
        svg("text", { class: "ttl", x: (L + W - R) / 2, y: H - 8, "text-anchor": "middle" }, "Forecast growth →"),
        svg("text", { class: "ttl", x: 12, y: (T + H - B) / 2, "text-anchor": "middle", transform: `rotate(-90 12 ${(T + H - B) / 2})` }, "Actual growth →"));
      // Letters go on the side away from the diagonal (up-left for beats, down-right for misses) unless another label already sits there.
      const placed = rows.map((x) => [X(x.f), Y(x.a)]);
      const spotsFor = (t) => t === "good" ? [[-9, -6, "end"], [0, -10, "middle"], [-9, 4, "end"], [9, -6, "start"], [0, 17, "middle"], [9, 4, "start"]]
        : t === "bad" ? [[9, 12, "start"], [0, 17, "middle"], [9, 4, "start"], [-9, 12, "end"], [0, -10, "middle"], [-9, 4, "end"]]
        : [[8, 4, "start"], [-8, 4, "end"], [0, -9, "middle"], [0, 16, "middle"], [11, -7, "start"], [-11, -7, "end"]];
      const dots = [...rows].sort((a, b) => Math.abs(b.dd) - Math.abs(a.dd)).map((x) => {
        const cx = X(x.f), cy = Y(x.a);
        const spots = spotsFor(x.t);
        const [dx, dy, anchor] = spots.find(([dx, dy]) => placed.every((p) => (p[0] === cx && p[1] === cy) || Math.abs(p[0] - (cx + dx)) > 10 || Math.abs(p[1] - (cy + dy)) > 10)) || spots[0];
        placed.push([cx + dx, cy + dy]);
        return tappable(svg("g", { class: `pt ${x.t}` }, tip(x), svg("circle", { class: "hit", cx, cy, r: 16 }), svg("circle", { cx, cy, r: x.t === "even" ? 5 : 6 }), svg("text", { x: cx + dx, y: cy + dy, "text-anchor": anchor }, x.id)), x);
      });
      g.append(...dots.reverse());
      return h("figure", { class: "sim-fig" }, h("figcaption", {}, h("b", {}, "Forecast vs actual"), h("span", {}, "Above the line beat the forecast. Below it missed.")), g, readoutFor());
    };
    const columns = (rows, tip, tappable) => {
      const W = 360, H = 260, L = 56, R = 12, T = 22, B = 46;
      const top_ = Math.ceil((Math.max(3, ...rows.map((x) => x.dd)) + 2) / 2) * 2, bot = Math.floor((Math.min(-3, ...rows.map((x) => x.dd)) - 2) / 2) * 2;
      const Y = (v) => T + ((top_ - v) / (top_ - bot)) * (H - T - B), bw = (W - L - R) / rows.length, band = NOISE - 0.5;
      const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-plot", role: "img", "aria-label": "Points above or below forecast by brand" });
      g.append(svg("rect", { class: "band", x: L, width: W - L - R, y: Y(band), height: Y(-band) - Y(band) }));
      const stp = top_ - bot > 16 ? 4 : 2;
      for (let v = Math.ceil(bot / stp) * stp; v <= top_; v += stp) g.append(svg("line", { class: v === 0 ? "axis" : "grid", x1: L, x2: W - R, y1: Y(v), y2: Y(v) }), svg("text", { x: L - 6, y: Y(v) + 4, "text-anchor": "end" }, delta(v)));
      rows.forEach((x, i) => {
        const cx = L + bw * (i + 0.5), w = Math.min(26, bw * 0.56), top = Math.min(Y(x.dd), Y(0)), ht = Math.max(2, Math.abs(Y(x.dd) - Y(0)));
        g.append(tappable(svg("g", { class: `col ${x.t}` }, tip(x), svg("rect", { class: "hit", x: cx - bw / 2, width: bw, y: T, height: H - T - B }), svg("rect", { x: cx - w / 2, width: w, y: top, height: ht, rx: 3 }),
          svg("text", { class: "v", x: cx, y: x.dd >= 0 ? top - 5 : top + ht + 13, "text-anchor": "middle" }, x.dd ? delta(x.dd) : "0"),
          svg("text", { class: "id", x: cx, y: H - B + 18, "text-anchor": "middle" }, x.id)), x));
      });
      g.append(svg("text", { class: "ttl", x: (L + W - R) / 2, y: H - 8, "text-anchor": "middle" }, "Brand"),
        svg("text", { class: "ttl", x: 12, y: (T + H - B) / 2, "text-anchor": "middle", transform: `rotate(-90 12 ${(T + H - B) / 2})` }, "Points vs forecast"));
      return h("figure", { class: "sim-fig" }, h("figcaption", {}, h("b", {}, "Miss or beat"), h("span", {}, "Points above or below forecast. The grey band is normal noise.")), g, readoutFor());
    };
    drawTable();
    const viewBtns = [["all", "All"], ["on", "On-premise"], ["off", "Off-premise"]].map(([k, l]) => h("button", { type: "button", "aria-pressed": String(k === view), onClick: () => { view = k; viewBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === k))); drawTable(); }, dataset: { k } }, l));
    const scoutsLeft = q.nextState.scoutsLeft;
    const next = h("button", { type: "button", class: "btn btn-lg", onClick: () => {
      if (nextQ) { st.phase = "decide"; st.draft = { ...S.clonePlan(q.plan), scout: [], answer: null }; } else st.phase = "review";
      persist(); render({ scroll: true });
    } }, nextQ ? `Plan ${nextQ.id} ` : "See your year ", arrow());
    const requestLine = q.answer ? requestOutcome(q) : null;
    const before = S.achievementStatus(st.plans.slice(0, q.qi), vi), after = S.achievementStatus(st.plans.slice(0, q.qi + 1), vi);
    const changed = after.filter((a, i) => a.status !== before[i].status && a.status !== "open");
    const achLine = changed.length ? h("ul", { class: "sim-achnews" }, changed.map((a) => h("li", { class: a.status }, h("span", { class: "ic", "aria-hidden": "true" }, a.got ? "★" : "–"),
      h("span", {}, h("b", {}, a.got ? `Achievement unlocked: ${a.name}` : `Achievement missed: ${a.name}`), a.got ? "" : `. ${a.note || a.hint}`)))) : null;
    const A = S.attribution(q, habitQ);
    const top = A.lines.slice(0, 5), rest = A.total - top.reduce((a, l) => a + l.d, 0);
    const name = (l) => `${l.id ? `Brand ${l.id}` : ""}${l.why ? `${l.id ? ": " : ""}${l.why}` : ""}`;
    const headline = top.length ? `${Q.id} came in ${signed$(A.total)} against last year's plan. The biggest piece: ${name(top[0])} (${signed$(top[0].d)})${top[1] ? `, then ${name(top[1])} (${signed$(top[1].d)})` : ""}.` : `${Q.id} landed where last year's plan would have.`;
    const waterfall = h("div", { class: "sim-wf" }, eyebrow("Where the score came from"),
      h("ul", {}, ...top.map((l) => h("li", {}, h("b", { class: `num ${tone(l.d / 10)}` }, signed$(l.d)), h("span", {}, name(l)))),
        Math.abs(rest) >= 1 ? h("li", { class: "muted" }, h("b", { class: "num" }, signed$(rest)), h("span", {}, "everything else")) : null,
        h("li", { class: "total" }, h("b", { class: `num ${tone(A.total / 10)}` }, signed$(A.total)), h("span", {}, `${Q.id} against last year's plan`))));
    const blocks = [
      h("div", {}, eyebrow(`${Q.id} results`), h("h2", { style: { marginTop: "10px" } }, "What actually happened?")),
      h("div", { class: "sim-scorecard" },
        h("div", {}, h("span", { class: "k" }, `${Q.id} vs last year's plan`), h("b", { class: `num ${tone(qScore / 10)}` }, signed$(qScore))),
        h("div", {}, h("span", { class: "k" }, "Year so far"), h("b", { class: `num ${tone(soFar / 10)}` }, signed$(soFar))),
        tierBar(soFar, T)),
      h("div", { class: "ev-tiles sim-tiles" },
        tile("Revenue", $k(q.rev), `forecast ${$k(q.revF)} · ${pct(d(q.rev, q.revF), 1)}`, tone(d(q.rev, q.revF))),
        tile("Gross profit after trade", $k(q.gp), `forecast ${$k(q.gpF)} · ${pct(d(q.gp, q.gpF), 1)}`, tone(d(q.gp, q.gpF))),
        tile("On-premise revenue", $k(q.revOn), `forecast ${$k(q.revOnF)} · ${pct(d(q.revOn, q.revOnF), 1)}`, tone(d(q.revOn, q.revOnF))),
        tile("Off-premise revenue", $k(q.revOff), `forecast ${$k(q.revOffF)} · ${pct(d(q.revOff, q.revOffF), 1)}`, tone(d(q.revOff, q.revOffF)))),
      says(q.insight || headline, q.insight ? "warn" : ""),
      waterfall,
      requestLine,
      achLine,
      (() => { const outs = S.marketOutcome(q); return outs.length ? h("div", {}, eyebrow("The market"), ...outs.map((m) => h("p", { class: "sim-market-out" }, m.text))) : null; })(),
      h("div", { class: "sim-byb" }, eyebrow("What the last $10K returned, by brand and channel"),
        h("p", { class: "muted", style: { marginTop: "8px", fontSize: "var(--fs-small)", maxWidth: "var(--measure)" } }, "The return on the last $10K you spent in each channel. Above $1 there was room to add; below it the money would have done more somewhere else."),
        returnTable(q),
        h("details", { class: "sim-howto", style: { marginTop: "14px" } }, h("summary", {}, "Forecast vs actual: how far the team's forecast was off"),
          h("div", { class: "sim-tablehead", style: { marginTop: "10px" } }, h("span", { class: "muted", style: { fontSize: "var(--fs-small)" } }, "Growth against the same quarter last year. Green beat the forecast, red missed it, grey landed within a point."), h("div", { class: "seg", role: "group", "aria-label": "Channel" }, ...viewBtns)),
          boardNote, board)),
      h("div", {}, eyebrow("Follow the chain"), h("div", { class: "sim-chains" }, ...[bigBet && bigBet.x ? bigBet : null, broken && broken.id !== bigBet?.id ? broken : null].filter(Boolean).map((r) => chainView(r, scoutsLeft)))),
    ];
    if (findings.length) blocks.push(h("div", {}, eyebrow("Your scout reports"), ...findings.map((r) => h("div", { class: "sim-report" }, h("b", {}, `Brand ${r.id}`), h("p", {}, r.finding)))));
    if (learned.length) blocks.push(h("div", {}, eyebrow("What the team learned"), h("ul", { class: "sim-learned" }, learned.map(({ r, dOn, dOff }) => {
      const big = Math.abs(dOn) >= Math.abs(dOff) ? ["on-premise", r.before.on.b, r.after.on.b] : ["off-premise", r.before.off.b, r.after.off.b];
      return h("li", {}, h("b", {}, `Brand ${r.id}`), h("span", {}, `${big[0]}: ${per$(big[1])} → ${per$(big[2])} per $1`), h("span", { class: big[2] > big[1] ? "good" : "bad" }, big[2] > big[1] ? "better than we thought" : "worse than we thought"));
    }))));
    blocks.push(h("div", { class: "sim-go" }, next));
    return h("div", { class: "sim-flow" }, ...blocks);
  }

  function requestOutcome(q) {
    const o = q.answer, r = o.extra ? q.rows.find((x) => x.id === o.extra.id) : null;
    const text = o.id === "take" && o.extra ? `You took Kroger's end-cap. Brand A's off-premise trade returned ${per$(r.offReturn || 0)} per $1 this quarter.` :
      o.id === "pay" ? `You paid Cascade's allowance. It went into the same channel that's been loading the distributor.` :
      o.id === "scout" ? "You sent a rep instead of money. The report is below." :
      o.menu ? `Brand ${o.menu} got the menu slot.${q.rows.find((x) => x.id === o.menu).xOn ? "" : " It had no other on-premise support this quarter."}` :
      o.load ? "You took the load-in. This quarter looks better; next year starts behind." :
      o.id === "pass" && q.dilemma.id === "endcap" ? "You passed on the end-cap and kept the $40K." : o.id === "pass" && q.dilemma.id === "loadin" ? "You passed on the load-in and shipped to demand." : "You said no.";
    return h("p", { class: "sim-outcome" }, h("b", {}, "The request: "), text);
  }

  function tierBar(score, T) {
    const max = T.at(-1).at * 1.2, x = (v) => `${Math.max(0, Math.min(100, (v / max) * 100))}%`;
    return h("div", { class: "sim-tierbar", "aria-label": `Year so far ${signed$(score)}. ${T.map((t) => `${t.name} at ${signed$(t.at)}`).join(", ")}` },
      h("div", { class: "track" }, h("i", { class: score >= 0 ? "" : "neg", style: { width: x(Math.abs(score)) } }), ...T.map((t) => h("span", { class: `mark t-${t.name.toLowerCase()}`, style: { left: x(t.at) } }, t.name))));
  }

  function chainView(r, scoutsLeft) {
    const c = r.chainOff, on = r.chainOn, brk = c.kind === "break";
    const lane = (title, steps) => h("div", { class: "lane" }, h("p", { class: "lt" }, title), h("ol", {}, steps.map(([k, v, t]) => h("li", {}, h("span", { class: "k" }, k), h("span", { class: `v ${t}` }, v)))));
    const offSteps = brk
      ? [["Trade", $k(r.xOff), ""], ["Shipments", pts(c.shipments), "good"], ["Distributor inventory", pts(c.inventory), "bad"], ["Depletion", pts(c.depletion), tone(c.depletion)], ["Sell-through", pts(c.sellThrough), tone(c.sellThrough)]]
      : [["Trade", $k(r.xOff), ""], ["Distribution (ACV)", `${c.acv >= 0 ? "+" : "−"}${Math.abs(c.acv).toFixed(1)} pts`, tone(c.acv * 2)], ["Velocity", pts(c.velocity), tone(c.velocity)], ["Promotion return", c.promoReturn ? `${per$(c.promoReturn)} per $1` : "none", c.promoReturn ? (c.promoReturn >= 1 ? "good" : "bad") : ""]];
    const onSteps = [["Trade", $k(r.xOn), ""], ["Placements this quarter", String(on.placements), on.placements ? "good" : ""], ["Pours", pts(on.pours), tone(on.pours)], ["30-day reorder rate", `${on.reorder}%`, on.reorder >= 60 ? "good" : ""]];
    const canSend = brk && scoutsLeft > 0 && S.QUARTERS[st.plans.length];
    return h("div", { class: `sim-chain ${brk ? "is-break" : ""}` },
      h("p", { class: "ttl" }, `Brand ${r.id} `, brk ? h("span", { class: "chip chip-warn" }, "the off-premise chain breaks here") : null),
      h("div", { class: "lanes" }, lane("Off-premise", offSteps), lane("On-premise", onSteps)),
      canSend ? h("button", { type: "button", class: "sim-scout", onClick: (e) => { st.nextScout = r.id; persist(); e.currentTarget.textContent = "A scout will look into it next quarter ✓"; e.currentTarget.disabled = true; } }, `Send a scout to find out why (${scoutsLeft} left)`) : null);
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
    return h("div", { class: "sim-flow", style: { gap: "34px" } },
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
