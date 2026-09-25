import { h, eyebrow, link, arrow, says } from "../ui.js";
import { setMeta } from "../app.js";
import { money, pct } from "../models.js";
import { lessonBySlug } from "../lessons/index.js";
import * as S from "../sim.js";

// Portfolio: run eight brands for a year, on-premise and off-premise. Decide → run the quarter → results → reallocate → review.
// The goal is a score against last year's plan. The hints are there to use or ignore; the ideas behind them are named at the end.

const KEY = "decision-os:sim:v2";
const load = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && Array.isArray(v.plans)) return v; } catch {} return null; };
const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };
const fresh = (vi = 0) => ({ vi, plans: [], draft: S.lastYearPlan(), phase: "decide", note: "", nextScout: null });

const $k = (v) => money(v * 1000);
const signed$ = (v) => `${v >= 0 ? "+" : "−"}${$k(Math.abs(v))}`;
const pts = (v) => (Math.abs(v) < 0.5 ? "0%" : pct(v, 0));
const per$ = (v) => `$${v.toFixed(2)}`;
const delta = (v) => (Math.abs(v) < 0.5 ? "0" : `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(0)}`);
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const tone = (v) => (v > 0.5 ? "good" : v < -0.5 ? "bad" : "");
const tile = (label, value, sub, cls = "") => h("div", { class: "ev-tile" }, h("span", { class: "k" }, label), h("span", { class: `v ${cls}` }, value), sub ? h("span", { class: "sim-sub" }, sub) : null);
const unlocked = (qi, what) => S.QUARTERS.slice(0, qi + 1).some((q) => q.unlock === what);

export default function Portfolio() {
  setMeta({ title: "Portfolio", description: "Run eight brands for a year, on-premise and off-premise. Beat last year's plan." });
  let st = load() || fresh(0);
  const stage = h("div", { class: "sim-stage" });
  const track = h("ol", { class: "sim-track", "aria-label": "Your year" });
  const goal = h("p", { class: "sim-goal" });
  const persist = () => save(st);

  const render = ({ scroll = false } = {}) => {
    const year = S.replay(st.plans, st.vi);
    drawTrack(year);
    const T = S.tiers(st.vi);
    goal.replaceChildren(h("b", {}, "Your goal: "), `beat last year's plan. `, ...T.map((t) => h("span", { class: `tier t-${t.name.toLowerCase()}` }, `${t.name} ${signed$(t.at)}`)), ...(st.vi ? [h("span", { class: "muted" }, ` · ${S.VARIANTS[st.vi].name}: new answers`)] : []));
    if (st.phase === "review" && st.plans.length === 4) stage.replaceChildren(reviewView());
    else if (st.phase === "results" && st.plans.length) stage.replaceChildren(resultsView(year.quarters.at(-1)));
    else { st.phase = "decide"; if (!st.draft) st.draft = S.lastYearPlan(); stage.replaceChildren(decideView(year.state, year.quarters.at(-1))); }
    if (scroll) stage.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  };

  function drawTrack(year) {
    const at = st.phase === "review" ? 5 : st.phase === "results" ? st.plans.length : st.plans.length + 1;
    const habit = S.replay(S.habitPlans(st.vi).slice(0, year.quarters.length), st.vi).quarters;
    track.replaceChildren(...["Start", ...S.QUARTERS.map((q) => q.id), "Review"].map((label, i) => {
      const q = year.quarters[i - 1], state = i < at ? "done" : i === at ? "now" : "next";
      const d = q ? q.gp - habit[i - 1].gp : null;
      return h("li", { class: `sim-node is-${state}`, "aria-current": state === "now" ? "step" : null },
        h("span", { class: "dot", "aria-hidden": "true" }), h("span", { class: "lbl" }, label), q ? h("span", { class: `val ${tone(d / 10)}` }, signed$(d)) : null);
    }));
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

    const board = h("div", { class: "sim-board" });
    const coach = h("p", { class: "sim-coach" });
    const go = h("button", { type: "button", class: "btn sim-run", onClick: () => runQuarter() });
    const go2 = h("button", { type: "button", class: "btn btn-lg", onClick: () => runQuarter() });
    const cards = {};
    const soFar = S.scoreSoFar(st.plans, vi);

    const refresh = () => {
      const t = S.planTotals(plan, qi, vi), f = S.forecastQuarter(state, plan, qi);
      const habitPlan = { ...S.lastYearPlan(), answer: qi === 2 ? "menu-A" : "pass" };
      const proj = f.gp - S.forecastQuarter(state, habitPlan, qi).gp;
      const free = S.BUDGET.trade - t.trade, freeDays = S.BUDGET.days - t.days;
      const scoutsLeft = state.scoutsLeft - plan.scout.length;
      board.replaceChildren(
        h("div", { class: "cell" }, h("span", { class: "k" }, "Score"), h("b", { class: `num ${tone(soFar / 10)}` }, signed$(soFar)), h("span", { class: "s" }, `year so far · this quarter ≈ ${signed$(proj)}`)),
        h("div", { class: `cell ${free > 0 ? "has" : ""}` }, h("span", { class: "k" }, "Free trade"), h("b", { class: "num" }, $k(free)), h("span", { class: "s" }, free ? "place it or keep it" : "all placed")),
        h("div", { class: `cell ${canDays && freeDays > 0 ? "has" : ""}` }, h("span", { class: "k" }, "Field days"), h("b", { class: "num" }, canDays ? `${freeDays} free` : "locked"), h("span", { class: "s" }, canDays ? `of ${S.BUDGET.days}` : "unlocks in Q3")),
        h("div", { class: "cell" }, h("span", { class: "k" }, "Scouts"), h("b", { class: "num", "aria-label": `${scoutsLeft} scouts left` }, "●".repeat(Math.max(0, scoutsLeft)) + "○".repeat(Math.max(0, S.SCOUTS - scoutsLeft))), h("span", { class: "s" }, "for the year")),
        go);
      const needAnswer = dil && !plan.answer;
      go.disabled = go2.disabled = needAnswer;
      go.textContent = go2.textContent = `▶ Run ${Q.id}`;
      const worst = f.rows.filter((r) => plan.trade[r.id] > 0 && r.conf !== "Low").sort((a, b) => a.next - b.next)[0]; // never steer toward a brand the team can't read
      const bestR = [...f.rows].sort((a, b) => b.next - a.next)[0];
      coach.textContent = needAnswer ? "First, answer the request above." :
        free >= 10 ? `You have ${$k(free)} to place. Put it where the next $10K returns the most (${bestR ? `right now: Brand ${bestR.id}, about ${per$(bestR.next)} back` : ""}), or keep it: unspent trade stays in the P&L.` :
        qi === 0 && worst && worst.next < 1 ? `Every dollar is spent. Brand ${worst.id}'s next $10K returns about ${per$(worst.next)}, so it loses money. Try pulling $10K off a brand like that.` :
        canDays && freeDays > 0 ? `You have ${freeDays} field days to place. Put them where the next day earns the most.` :
        "Ready when you are. Run the quarter to see what actually happens.";
      f.rows.forEach((r) => cards[r.id]?.update(r, free, freeDays, scoutsLeft));
      persist();
    };

    const brandCard = (b) => {
      const bel = state.beliefs[b.id];
      const last = prev?.rows.find((r) => r.id === b.id);
      const scouted = state.scouted[b.id] !== undefined;
      const amt = h("output", { class: "num amt" }), was = h("span", { class: "was" });
      const next = h("div", { class: "next" }), gauge = h("div", { class: "gauge", "aria-hidden": "true" }, h("i"), h("b"));
      const minus = h("button", { type: "button", "aria-label": `Take $10K from ${b.name}`, onClick: () => { plan.trade[b.id] = Math.max(0, plan.trade[b.id] - S.STEP.trade); refresh(); } }, "−");
      const plus = h("button", { type: "button", "aria-label": `Give $10K to ${b.name}`, onClick: () => { plan.trade[b.id] += S.STEP.trade; refresh(); } }, "+");
      const dOut = h("output", { class: "num" }), dHint = h("span", { class: "hint" });
      const dMinus = h("button", { type: "button", "aria-label": `One fewer field day for ${b.name}`, onClick: () => { plan.days[b.id] = Math.max(0, plan.days[b.id] - 1); refresh(); } }, "−");
      const dPlus = h("button", { type: "button", "aria-label": `One more field day for ${b.name}`, onClick: () => { plan.days[b.id] += 1; refresh(); } }, "+");
      const floorWarn = h("p", { class: "floor-warn", hidden: true });
      const scout = h("button", { type: "button", class: "sim-scout", disabled: scouted, onClick: () => { const i = plan.scout.indexOf(b.id); if (i >= 0) plan.scout.splice(i, 1); else plan.scout.push(b.id); refresh(); } });
      const focusBtns = Object.entries(S.FOCUS).map(([k, label]) => h("button", { type: "button", "aria-pressed": String(plan.focus[b.id] === k), onClick: () => { plan.focus[b.id] = k; focusBtns.forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.k === k))); refresh(); }, dataset: { k } }, label));
      const lastLine = last && last.x ? `Last quarter: ${per$(last.perDollar)} back per $1 on ${$k(last.x)}${last.onReturn && last.offReturn ? ` (on-premise ${per$(last.onReturn)}, off-premise ${per$(last.offReturn)})` : ""}.` : null;
      const card = h("div", { class: `sim-brand ${scouted ? "is-scouted" : ""}` },
        h("div", { class: "sim-brand-head" }, h("h3", {}, b.name), h("span", { class: "chip" }, b.role)),
        h("p", { class: "sim-note" }, scouted ? h("span", { class: "scouted" }, `Scouted in ${S.QUARTERS[state.scouted[b.id]].id}. `) : null, b.note),
        h("div", { class: "sim-next" }, h("span", { class: "k" }, "Next $10K"), next, gauge),
        h("div", { class: "sim-alloc" }, minus, h("div", { class: "mid" }, amt, was), plus),
        floorWarn,
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
        gauge.firstChild.style.width = `${Math.min(100, (r.next / 2.5) * 100)}%`;
        gauge.firstChild.className = Math.abs(gain) < 0.2 ? "even" : r.next >= 1 ? "good" : "bad";
        plus.disabled = free < S.STEP.trade; minus.disabled = x <= 0;
        const off = r.xOff;
        floorWarn.hidden = !(b.floor && off < b.floor);
        floorWarn.textContent = `Off-premise is below the ${$k(b.floor)} this brand needs to hold its shelf space. Expect to lose some base volume.`;
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
      const t = S.planTotals({ ...plan, answer: null }, qi, vi);
      const box = h("div", { class: "sim-request", role: "group", "aria-label": `Request from ${dil.who}` },
        h("p", { class: "who" }, `A request from ${dil.who}`), h("p", { class: "ask" }, dil.ask),
        h("div", { class: "opts" }, ...dil.options.map((o) => {
          const tooMuch = o.cost && S.BUDGET.trade - t.trade < o.cost;
          const noScout = o.scout && (state.scoutsLeft - plan.scout.filter((x) => x !== o.scout).length <= 0 || state.scouted[o.scout] !== undefined);
          return h("button", { type: "button", class: "opt", "aria-pressed": String(plan.answer === o.id), disabled: (tooMuch && plan.answer !== o.id) || noScout,
            onClick: () => { plan.answer = plan.answer === o.id ? null : o.id; stage.replaceChildren(decideView(state, prev)); } },
            o.label, tooMuch && plan.answer !== o.id ? h("span", { class: "why" }, `Free up ${$k(o.cost)} first`) : noScout ? h("span", { class: "why" }, "No scouts left") : null);
        })));
      return box;
    })() : null;

    const setPlan = (p) => { st.draft = { ...S.clonePlan(p), answer: plan.answer }; stage.replaceChildren(decideView(state, prev)); };
    const view = h("div", { class: "sim-flow" },
      h("div", {}, eyebrow(`${Q.id} · ${Q.theme}`), h("h2", { style: { marginTop: "10px" } }, qi ? "What do you do now?" : "Where do your first dollars go?"), h("p", { class: "muted", style: { marginTop: "8px", maxWidth: "var(--measure)" } }, Q.line)),
      request,
      h("div", { class: "sim-bar" }, board), coach,
      h("details", { class: "sim-howto" }, h("summary", {}, "How to play"), h("ul", {},
        h("li", {}, h("b", {}, "The goal: "), "end the year ahead of what last year's plan would have made. Your score counts gross profit after trade."),
        h("li", {}, h("b", {}, "Trade: "), "press − to take $10K off a brand into your free trade, + to give it to another. You can't overspend, and you don't have to spend it all."),
        h("li", {}, h("b", {}, "Next $10K: "), "what the team expects the next $10K to bring back in gross profit. $1 back per $1 breaks even; less loses money. A range means the team isn't sure."),
        h("li", {}, h("b", {}, "Scouts: "), "two a year. A rep finds out how a brand really responds, and reports back after the quarter."),
        h("li", {}, h("b", {}, "Channels (from Q2): "), "choose whether a brand's support goes off-premise (stores), on-premise (bars and restaurants), or both. On-premise builds menus and placements, so part of it pays next quarter."),
        h("li", {}, h("b", {}, "Field days (from Q3): "), "your team's time. It's worth more on some brands than others."))),
      h("div", { class: "sim-brands" }, brands.map(brandCard)),
      h("div", { class: "sim-go" }, h("div", { class: "starts" }, h("span", { class: "muted" }, "Reset to:"),
        qi ? h("button", { type: "button", class: "link", onClick: () => setPlan({ ...st.plans[qi - 1], scout: [] }) }, `your ${S.QUARTERS[qi - 1].id} plan`) : null,
        h("button", { type: "button", class: "link", onClick: () => setPlan(S.lastYearPlan()) }, "last year's plan")), go2));
    refresh();
    return view;
  }

  // ---------- Run the quarter ----------
  function runQuarter() {
    const plan = S.clonePlan(st.draft), qi = st.plans.length, Q = S.QUARTERS[qi];
    const q = S.replay([...st.plans, plan], st.vi).quarters[qi];
    let done = false;
    const finish = () => { if (done) return; done = true; st.plans.push(plan); st.phase = "results"; st.draft = null; persist(); render({ scroll: true }); };
    if (reduced()) return finish();
    const DUR = 3500;
    const fill = h("div", { class: "fill" }), feed = h("ol", { class: "sim-feed", "aria-live": "polite" });
    const revOut = h("b", { class: "num v" }), gpOut = h("b", { class: "num v" });
    stage.replaceChildren(h("div", { class: "sim-flow" },
      h("div", {}, eyebrow(`${Q.id} · ${Q.theme}`), h("h2", { style: { marginTop: "10px" } }, `Running ${Q.id}…`)),
      h("div", { class: "sim-clock" }, h("div", { class: "months" }, Q.months.map((m) => h("span", {}, m))), h("div", { class: "track" }, fill)),
      h("div", { class: "ev-tiles" }, h("div", { class: "ev-tile" }, h("span", { class: "k" }, "Revenue so far"), revOut), h("div", { class: "ev-tile" }, h("span", { class: "k" }, "Gross profit after trade so far"), gpOut)),
      feed, h("button", { type: "button", class: "link", style: { justifySelf: "start" }, onClick: finish }, "Skip to results")));
    stage.scrollIntoView({ behavior: "smooth", block: "start" });
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
    const tbody = h("tbody");
    const drawTable = () => tbody.replaceChildren(...q.rows.map((r) => {
      const f = view === "all" ? r.growthF : view === "on" ? ((r.revOnF / (r.q * S.simBrands(vi).find((b) => b.id === r.id).share)) - 1) * 100 : ((r.revOffF / (r.q * (1 - S.simBrands(vi).find((b) => b.id === r.id).share))) - 1) * 100;
      const share = S.simBrands(vi).find((b) => b.id === r.id).share;
      const a = view === "all" ? r.growth : view === "on" ? (r.revOn / (r.q * share) - 1) * 100 : (r.revOff / (r.q * (1 - share)) - 1) * 100;
      const spend = view === "all" ? r.x : view === "on" ? r.xOn : r.xOff;
      return h("tr", {}, h("td", {}, h("b", { style: { fontWeight: 500 } }, `Brand ${r.id}`)),
        h("td", { class: "num muted" }, `${$k(spend)}${view === "all" && r.focus !== "both" ? ` · ${r.focus === "on" ? "on" : "off"}` : ""}${q.scouts.includes(r.id) ? " · scouted" : ""}`),
        h("td", { class: "num" }, pts(f)), h("td", { class: `num ${tone(a)}` }, pts(a)), h("td", { class: `num ${tone(a - f)}`, style: { fontWeight: 600 } }, delta(a - f)));
    }));
    drawTable();
    const viewBtns = [["all", "All"], ["on", "On-premise"], ["off", "Off-premise"]].map(([k, l]) => h("button", { type: "button", "aria-pressed": String(k === view), onClick: () => { view = k; viewBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === k))); drawTable(); }, dataset: { k } }, l));
    const scoutsLeft = q.nextState.scoutsLeft;
    const next = h("button", { type: "button", class: "btn btn-lg", onClick: () => {
      if (nextQ) { st.phase = "decide"; st.draft = { ...S.clonePlan(q.plan), scout: [], answer: null }; } else st.phase = "review";
      persist(); render({ scroll: true });
    } }, nextQ ? `Plan ${nextQ.id} ` : "See your year ", arrow());
    const requestLine = q.answer ? requestOutcome(q) : null;
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
      says(q.insight, "warn"),
      requestLine,
      h("div", {}, h("div", { class: "sim-tablehead" }, eyebrow("By brand"), h("div", { class: "seg", role: "group", "aria-label": "Channel" }, ...viewBtns)),
        h("div", { class: "table-wrap" }, h("table", { class: "table sim-table" }, h("thead", {}, h("tr", {}, h("th", {}, "Brand"), h("th", { class: "num" }, "Trade"), h("th", { class: "num" }, "Forecast"), h("th", { class: "num" }, "Actual"), h("th", { class: "num" }, "Δ"))), tbody)),
        h("p", { class: "muted", style: { fontSize: "var(--fs-micro)", marginTop: "8px" } }, "Growth against the same quarter last year. Δ is points above or below the forecast.")),
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
  function reviewView() {
    const vi = st.vi, R = S.review(st.plans, vi);
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
      h("div", {}, eyebrow("Achievements"), h("ul", { class: "sim-ach" }, R.achievements.map((a) => h("li", { class: a.got ? "got" : "" }, h("span", { class: "ic", "aria-hidden": "true" }, a.got ? "★" : "☆"), h("div", {}, h("b", {}, a.name), h("span", {}, a.got ? "Unlocked" : a.hint)))))),
      h("div", {}, eyebrow("Against the alternatives"), h("p", { class: "muted", style: { marginTop: "8px", fontSize: "var(--fs-small)" } }, "Value created against running last year's plan all year."),
        h("div", { class: "sim-cmp" }, cmp("You", R.score, "accent"), cmp("Reassess every quarter", R.bestScore, "good"))),
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
  return h("div", {},
    h("section", { class: "reveal" }, eyebrow("Portfolio"), h("h1", { class: "hero", style: { marginTop: "16px" } }, "Run the business for a year."),
      h("p", { class: "hero-sub" }, `Eight brands, two channels, four quarters. ${$k(S.BUDGET.trade)} of trade a quarter, a team with limited time, and a request on your desk every quarter. You can't do everything.`),
      goal),
    h("section", { class: "section reveal", style: { marginTop: "36px" } }, track),
    h("section", { style: { marginTop: "28px" } }, stage));
}
