import { h, eyebrow, link, arrow, says } from "../ui.js";
import { setMeta } from "../app.js";
import { money, pct } from "../models.js";
import { lessonBySlug } from "../lessons/index.js";
import * as S from "../sim.js";

// Portfolio: run eight brands for a year. Decide → simulate the quarter → see what happened → reallocate → debrief.
// The decision-support hints (expected return, next $10K) are there to use or ignore; the algorithms are only named at year-end.

const KEY = "decision-os:sim:v1";
const load = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && Array.isArray(v.plans)) return v; } catch {} return null; };
const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };
const fresh = () => ({ plans: [], draft: S.lastYearPlan(), phase: "decide", note: "" });

const $k = (v) => money(v * 1000);                                          // $K → "$1.2M" / "$450K"
const signed$ = (v) => `${v >= 0 ? "+" : "−"}${$k(Math.abs(v))}`;
const pts = (v) => (Math.abs(v) < 0.5 ? "0%" : pct(v, 0));
const per$ = (v) => `$${v.toFixed(2)}`;
const delta = (v) => (Math.abs(v) < 0.5 ? "0" : `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(0)}`);
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const tone = (v) => (v > 0.5 ? "good" : v < -0.5 ? "bad" : "");
const tile = (label, value, sub, cls = "") => h("div", { class: "ev-tile" }, h("span", { class: "k" }, label), h("span", { class: `v ${cls}` }, value), sub ? h("span", { class: "sim-sub" }, sub) : null);

export default function Portfolio() {
  setMeta({ title: "Portfolio", description: "Run eight brands for a year. Two budgets, four quarters, and a year-end review of how you decide." });
  let st = load() || fresh();
  const stage = h("div", { class: "sim-stage" });
  const track = h("ol", { class: "sim-track", "aria-label": "Your year" });
  const persist = () => save(st);

  const render = ({ scroll = false } = {}) => {
    const year = S.replay(st.plans);
    drawTrack(year);
    if (st.phase === "review" && st.plans.length === 4) stage.replaceChildren(reviewView());
    else if (st.phase === "results" && st.plans.length) stage.replaceChildren(resultsView(year.quarters.at(-1)));
    else { st.phase = "decide"; if (!st.draft) st.draft = S.lastYearPlan(); stage.replaceChildren(decideView(year.state, year.quarters.at(-1))); }
    if (scroll) stage.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  };

  function drawTrack(year) {
    const at = st.phase === "review" ? 5 : st.phase === "results" ? st.plans.length : st.plans.length + 1;
    const steps = ["Start", ...S.QUARTERS.map((q) => q.id), "Review"];
    track.replaceChildren(...steps.map((label, i) => {
      const q = year.quarters[i - 1];
      const state = i < at ? "done" : i === at ? "now" : "next";
      return h("li", { class: `sim-node is-${state}`, "aria-current": state === "now" ? "step" : null },
        h("span", { class: "dot", "aria-hidden": "true" }), h("span", { class: "lbl" }, label),
        q ? h("span", { class: "val" }, $k(q.gp)) : null);
    }));
  }

  // ---------- Decide ----------
  function decideView(state, prev) {
    const qi = st.plans.length, Q = S.QUARTERS[qi], plan = st.draft;
    const totals = h("div", { class: "sim-meters" });
    const fc = h("p", { class: "sim-forecast" });
    const go = h("button", { type: "button", class: "btn btn-lg" });
    const warn = h("p", { class: "sim-warn", role: "status" });
    const cards = {};

    const refresh = () => {
      const t = S.planTotals(plan), f = S.forecastQuarter(state, plan);
      const overT = t.trade - S.BUDGET.trade, overH = t.hours - S.BUDGET.hours;
      totals.replaceChildren(
        meter("Trade", `${$k(t.trade)} of ${$k(S.BUDGET.trade)}`, t.trade / S.BUDGET.trade, overT > 0),
        meter("Selling hours", `${t.hours} of ${S.BUDGET.hours}`, t.hours / S.BUDGET.hours, overH > 0));
      fc.replaceChildren("Your team's forecast for this plan: revenue ", h("b", {}, $k(f.rev)), ", gross profit after trade ", h("b", {}, $k(f.gp)), ".");
      warn.textContent = overT > 0 ? `Over the trade budget by ${$k(overT)}. Something has to give.` : overH > 0 ? `Over the time budget by ${overH} hours. Something has to give.` : t.trade < S.BUDGET.trade ? `${$k(S.BUDGET.trade - t.trade)} of trade unspent. Unspent trade stays in the P&L.` : "";
      warn.className = `sim-warn ${overT > 0 || overH > 0 ? "bad" : ""}`;
      go.disabled = overT > 0 || overH > 0;
      go.textContent = `▶ Simulate ${Q.id}`;
      f.rows.forEach((r) => cards[r.id]?.update(r));
      st.draft = plan; persist();
    };

    const brandCard = (b) => {
      const bel = state.beliefs[b.id], conf = S.confidence(bel.w);
      const last = prev?.rows.find((r) => r.id === b.id);
      const investigated = state.investigated[b.id] !== undefined;
      const tradeOut = h("output", { class: "num" }), hoursOut = h("output", { class: "num" });
      const tradeHint = h("span", { class: "hint" }), hoursHint = h("span", { class: "hint" });
      const probeLabel = () => investigated ? `Looked into in ${S.QUARTERS[state.investigated[b.id]].id}` : plan.investigate.includes(b.id) ? `Looking into it · ${S.INVESTIGATE_HOURS} hrs ✓` : `Look into it · ${S.INVESTIGATE_HOURS} hrs`;
      const probe = h("button", { type: "button", class: "sim-probe", "aria-pressed": String(plan.investigate.includes(b.id)), disabled: investigated,
        onClick: () => { const i = plan.investigate.indexOf(b.id); if (i >= 0) plan.investigate.splice(i, 1); else plan.investigate.push(b.id); probe.setAttribute("aria-pressed", String(i < 0)); probe.textContent = probeLabel(); refresh(); } });
      probe.textContent = probeLabel();
      const step = (key, d) => () => { plan[key][b.id] = Math.max(0, (plan[key][b.id] || 0) + d); refresh(); };
      const stepper = (key, out, hint, unit) => h("div", { class: "sim-stepper" },
        h("span", { class: "lab" }, key === "trade" ? "Trade" : "Hours"),
        h("div", { class: "ctl" },
          h("button", { type: "button", "aria-label": `Less ${unit} for ${b.name}`, onClick: step(key, -S.STEP[key]) }, "−"), out,
          h("button", { type: "button", "aria-label": `More ${unit} for ${b.name}`, onClick: step(key, S.STEP[key]) }, "+")),
        hint);
      const card = h("div", { class: "sim-brand" },
        h("div", { class: "sim-brand-head" }, h("h3", {}, b.name), h("span", { class: "chip" }, b.role)),
        h("p", { class: "sim-note" }, b.note),
        h("dl", { class: "sim-facts" },
          h("div", {}, h("dt", {}, "Revenue"), h("dd", {}, money(b.revenue))),
          h("div", {}, h("dt", {}, last ? `Growth in ${S.QUARTERS[qi - 1].id}` : "Growth"), h("dd", { class: tone(last ? last.growth : b.growth) }, pts(last ? last.growth : b.growth))),
          h("div", {}, h("dt", {}, "Margin"), h("dd", {}, `${b.gm}%`)),
          h("div", {}, h("dt", {}, "Return, first $"), h("dd", {}, `${per$(bel.b)} per $1 `, h("span", { class: `conf conf-${conf.toLowerCase()}` }, conf)))),
        last && last.x ? h("p", { class: "sim-last" }, `Last quarter: ${per$(last.perDollar)} back per $1 on ${$k(last.x)}.`) : null,
        h("div", { class: "sim-controls" }, stepper("trade", tradeOut, tradeHint, "trade"), stepper("hours", hoursOut, hoursHint, "selling time")),
        probe);
      card.update = (r) => {
        tradeOut.textContent = $k(plan.trade[b.id] || 0);
        hoursOut.textContent = `${plan.hours[b.id] || 0} h`;
        tradeHint.textContent = `next $10K ≈ ${per$(r.next)} back`;
        tradeHint.className = `hint ${r.next >= 1.05 ? "good" : r.next < 0.95 ? "bad" : ""}`;
        hoursHint.textContent = `next 2 hrs ≈ ${$k(r.nextHour * 2)}`;
      };
      cards[b.id] = card;
      return card;
    };

    const setPlan = (p) => { st.draft = S.clonePlan(p); stage.replaceChildren(decideView(state, prev)); };
    const starts = h("div", { class: "sim-starts" }, h("span", { class: "muted" }, "Start from:"),
      qi ? h("button", { type: "button", class: "link", onClick: () => setPlan({ ...st.plans[qi - 1], investigate: [] }) }, `your ${S.QUARTERS[qi - 1].id} plan`) : null,
      h("button", { type: "button", class: "link", onClick: () => setPlan(S.lastYearPlan()) }, "last year's plan"),
      h("button", { type: "button", class: "link", onClick: () => setPlan(S.emptyPlan()) }, "nothing"));

    go.addEventListener("click", () => runQuarter());
    const view = h("div", { class: "sim-flow" },
      h("div", {}, eyebrow(`${Q.id} · ${Q.theme}`), h("h2", { style: { marginTop: "10px" } }, Q.ask), h("p", { class: "muted", style: { marginTop: "8px", maxWidth: "var(--measure)" } }, Q.line)),
      h("div", { class: "sim-bar" }, totals, starts),
      h("div", { class: "sim-brands" }, S.simBrands.map(brandCard)),
      h("div", { class: "sim-go" }, fc, warn, go));
    refresh();
    return view;
  }

  function meter(label, text, frac, over) {
    return h("div", { class: `sim-meter ${over ? "over" : ""}` }, h("div", { class: "top" }, h("span", {}, label), h("b", { class: "num" }, text)),
      h("div", { class: "track" }, h("div", { class: "fill", style: { width: `${Math.min(100, frac * 100)}%` } })));
  }

  // ---------- Simulate ----------
  function runQuarter() {
    const plan = S.clonePlan(st.draft);
    const qi = st.plans.length, Q = S.QUARTERS[qi];
    const q = S.replay([...st.plans, plan]).quarters[qi];
    let done = false;
    const finish = () => { if (done) return; done = true; st.plans.push(plan); st.phase = "results"; st.draft = null; persist(); render({ scroll: true }); };
    if (reduced()) return finish();

    const DUR = 6000;
    const fill = h("div", { class: "fill" });
    const feed = h("ol", { class: "sim-feed", "aria-live": "polite" });
    const revOut = h("b", { class: "num v" }), gpOut = h("b", { class: "num v" });
    stage.replaceChildren(h("div", { class: "sim-flow" },
      h("div", {}, eyebrow(`${Q.id} · ${Q.theme}`), h("h2", { style: { marginTop: "10px" } }, `Running ${Q.id}…`)),
      h("div", { class: "sim-clock" },
        h("div", { class: "months" }, Q.months.map((m) => h("span", {}, m))),
        h("div", { class: "track" }, fill),
        h("div", { class: "lanes" }, h("span", {}, "Trade events"), h("span", {}, "Account meetings"), h("span", {}, "Consumer response"))),
      h("div", { class: "ev-tiles" }, h("div", { class: "ev-tile" }, h("span", { class: "k" }, "Revenue so far"), revOut), h("div", { class: "ev-tile" }, h("span", { class: "k" }, "Gross profit after trade so far"), gpOut)),
      feed,
      h("button", { type: "button", class: "link", style: { justifySelf: "start" }, onClick: finish }, "Skip to results")));
    stage.scrollIntoView({ behavior: "smooth", block: "start" });
    const t0 = performance.now(); let shown = 0;
    const tick = (t) => {
      if (done) return;
      const k = Math.min(1, (t - t0) / DUR), week = Math.max(1, Math.ceil(k * 13));
      fill.style.width = `${k * 100}%`;
      revOut.textContent = $k(q.rev * k); gpOut.textContent = $k(q.gp * k);
      while (shown < q.events.length && q.events[shown].week <= week) { const e = q.events[shown++]; feed.append(h("li", {}, h("span", { class: "wk" }, `Week ${e.week}`), e.text)); }
      if (k < 1) requestAnimationFrame(tick); else setTimeout(finish, 800);
    };
    requestAnimationFrame(tick);
    setTimeout(finish, DUR + 2500); // background tabs pause animation frames; the quarter still closes
  }

  // ---------- Results ----------
  function resultsView(q) {
    const Q = S.QUARTERS[q.qi], nextQ = S.QUARTERS[q.qi + 1];
    const d = (a, f) => ((a - f) / Math.abs(f)) * 100;
    const learned = q.rows.filter((r) => Math.abs(r.after.b - r.before.b) >= 0.15 || S.confidence(r.after.w) !== S.confidence(r.before.w));
    const findings = q.rows.filter((r) => r.finding);
    const chainIds = chainPicks(q);
    const next = h("button", { type: "button", class: "btn btn-lg", onClick: () => {
      if (nextQ) { st.phase = "decide"; st.draft = { ...S.clonePlan(q.plan), investigate: [] }; } else st.phase = "review";
      persist(); render({ scroll: true });
    } }, nextQ ? `Plan ${nextQ.id} ` : "See your year ", arrow());
    const blocks = [
      h("div", {}, eyebrow(`${Q.id} results`), h("h2", { style: { marginTop: "10px" } }, "What actually happened?")),
      h("div", { class: "ev-tiles sim-tiles" },
        tile("Revenue", $k(q.rev), `forecast ${$k(q.revF)} · ${pct(d(q.rev, q.revF), 1)}`, tone(d(q.rev, q.revF))),
        tile("Gross profit after trade", $k(q.gp), `forecast ${$k(q.gpF)} · ${pct(d(q.gp, q.gpF), 1)}`, tone(d(q.gp, q.gpF))),
        tile("Trade spent", $k(q.trade), `of ${$k(S.BUDGET.trade)}`),
        tile("Selling hours", String(q.hours), `of ${S.BUDGET.hours}`)),
      says(q.insight, "warn"),
      h("div", {}, h("div", { class: "table-wrap" }, h("table", { class: "table sim-table" },
        h("thead", {}, h("tr", {}, h("th", {}, "Brand"), h("th", { class: "num" }, "Your plan"), h("th", { class: "num" }, "Forecast"), h("th", { class: "num" }, "Actual"), h("th", { class: "num" }, "Δ"))),
        h("tbody", {}, q.rows.map((r) => h("tr", {},
          h("td", {}, h("b", { style: { fontWeight: 500 } }, `Brand ${r.id}`)),
          h("td", { class: "num muted" }, `${$k(r.x)} · ${r.h}h${q.plan.investigate.includes(r.id) ? " · looked into" : ""}`),
          h("td", { class: "num" }, pts(r.growthF)), h("td", { class: `num ${tone(r.growth)}` }, pts(r.growth)),
          h("td", { class: `num ${tone(r.growth - r.growthF)}`, style: { fontWeight: 600 } }, delta(r.growth - r.growthF))))))),
        h("p", { class: "muted", style: { fontSize: "var(--fs-micro)", marginTop: "8px" } }, "Growth is this quarter against the same quarter last year. Δ is points above or below the forecast.")),
    ];
    if (chainIds.length) blocks.push(h("div", {}, eyebrow("Follow the chain"), h("div", { class: "sim-chains" }, chainIds.map((id) => chainView(q.rows.find((r) => r.id === id))))));
    if (findings.length) blocks.push(h("div", {}, eyebrow("What you found"), ...findings.map((r) => h("div", { class: "layer layer-2", style: { marginTop: "10px" } }, h("b", {}, `Brand ${r.id}. `), r.finding))));
    if (learned.length) blocks.push(h("div", {}, eyebrow("What the evidence changed"), h("ul", { class: "sim-learned" }, learned.map((r) => {
      const up = r.after.b > r.before.b + 0.05, down = r.after.b < r.before.b - 0.05;
      return h("li", {}, h("b", {}, `Brand ${r.id}`), h("span", {}, `Expected return ${per$(r.before.b)} → ${per$(r.after.b)} per $1`), h("span", { class: "muted" }, `Confidence ${S.confidence(r.before.w)} → ${S.confidence(r.after.w)}`),
        h("span", { class: r.finding ? "good" : up ? "good" : down ? "bad" : "muted" }, r.finding ? "You looked into it. Now we know." : up ? `We underestimated ${r.id}.` : down ? `We overestimated ${r.id}.` : "About as expected. Now we're surer."));
    }))));
    blocks.push(h("div", { class: "sim-go" }, next));
    return h("div", { class: "sim-flow" }, ...blocks);
  }

  // The two chains most worth seeing: the biggest bet, and any brand whose chain is broken.
  function chainPicks(q) {
    const big = [...q.rows].sort((a, b) => (b.x + b.h * 5) - (a.x + a.h * 5))[0];
    const broken = q.rows.find((r) => r.chain.kind === "break" && r.x + r.h > 0);
    return [...new Set([big && big.x + big.h > 0 ? big.id : null, broken?.id].filter(Boolean))];
  }
  function chainView(r) {
    const c = r.chain;
    const steps = [["Your decision", `${$k(r.x)} trade${r.h ? ` + ${r.h} hrs` : ""}`, ""]];
    if (c.kind === "break") steps.push(["Shipments", pts(c.shipments), "good"], ["Distributor inventory", pts(c.inventory), "bad"], ["Depletion", pts(c.depletion), tone(c.depletion)], ["Sell-through", pts(c.sellThrough), tone(c.sellThrough)]);
    else steps.push(["Distribution", `+${c.distribution.toFixed(1)} pts`, c.distribution > 0 ? "good" : ""], ["Depletion", pts(c.depletion), tone(c.depletion)], ["Sell-through", pts(c.sellThrough), tone(c.sellThrough)]);
    steps.push(["Gross profit after trade", signed$(c.gp), c.gp >= 0 ? "good" : "bad"]);
    return h("div", { class: `sim-chain ${c.kind === "break" ? "is-break" : ""}` },
      h("p", { class: "ttl" }, `Brand ${r.id} `, c.kind === "break" ? h("span", { class: "chip chip-warn" }, "the chain breaks here") : null),
      h("ol", {}, steps.map(([k, v, t]) => h("li", {}, h("span", { class: "k" }, k), h("span", { class: `v ${t}` }, v)))));
  }

  // ---------- Year-end review ----------
  function reviewView() {
    const R = S.review(st.plans);
    // Bars show the gain over running last year's plan all year, from zero, so a 5% difference looks like one.
    const gYou = R.you.gp - R.habit.gp, gBest = R.best.gp - R.habit.gp, scale = Math.max(Math.abs(gYou), Math.abs(gBest), 1);
    const cmp = (label, g, cls) => h("div", { class: "sim-cmp-row" }, h("span", { class: "lbl" }, label), h("div", { class: "track" }, h("div", { class: `fill ${g < 0 ? "bad" : cls}`, style: { width: `${(Math.abs(g) / scale) * 100}%` } })), h("b", { class: "num" }, signed$(g)));
    const gapLine = R.gap > 20 ? `That's ${$k(R.gap)} of unrealized opportunity. Here's where it went.` : "You matched a strategy that reassessed every quarter. Here's how you got there.";
    const brandMax = Math.max(...R.quarters.flatMap((q) => Object.values(q.plan.trade)), 1);
    const noteBox = h("textarea", { class: "sim-note-input", rows: "3", placeholder: "One thing you'd do differently next year…", "aria-label": "What did you learn?" });
    noteBox.value = st.note || "";
    noteBox.addEventListener("input", () => { st.note = noteBox.value; persist(); });
    const mark = { yes: ["✓", "Used", "good"], partly: ["△", "Partly", "warn"], no: ["—", "Missed", "bad"] };
    return h("div", { class: "sim-flow" },
      h("div", {}, eyebrow("Year-end review"), h("h2", { style: { marginTop: "10px" } }, "Your year")),
      h("div", {}, h("div", { class: "ev-tiles sim-tiles" },
        tile("Revenue", $k(R.you.rev)), tile("Gross profit after trade", $k(R.you.gp)),
        tile("Trade spent", $k(R.you.trade), `of ${$k(S.BUDGET.trade * 4)}`), tile("Selling hours", String(R.you.hours), `of ${S.BUDGET.hours * 4}`)),
        R.you.carry > 5 ? h("p", { class: "muted", style: { marginTop: "10px" } }, `Plus about ${$k(R.you.carry)} of gross profit already building for next year from Q4's selling time.`) : null),
      h("div", {}, eyebrow("Against the alternatives"),
        h("p", { class: "muted", style: { marginTop: "8px", fontSize: "var(--fs-small)" } }, `Gross profit after trade, against running last year's plan all year (${$k(R.habit.gp)}).`),
        h("div", { class: "sim-cmp" }, cmp("You", gYou, "accent"), cmp("Reassess every quarter", gBest, "good")),
        h("p", { class: "lede", style: { marginTop: "14px" } }, `A strategy that reassessed the next dollar every quarter, and looked into the unknowns early, made ${$k(R.best.gp)}. You made ${$k(R.you.gp)}. ${gapLine}`)),
      h("div", {}, eyebrow("How you tend to decide"), h("ul", { class: "sim-tend" }, R.tendencies.map((t) => h("li", {}, h("b", {}, t.label), h("span", {}, t.text))))),
      h("div", {}, eyebrow("Where your trade went"), h("div", { class: "sim-migrate" },
        h("div", { class: "hdr" }, h("span", {}), ...S.QUARTERS.map((q) => h("span", {}, q.id))),
        ...S.simBrands.map((b) => h("div", { class: "row" }, h("span", { class: "nm" }, b.id), ...R.quarters.map((q) => h("div", { class: "cell", title: $k(q.plan.trade[b.id] || 0) }, q.plan.trade[b.id] ? h("i", { style: { width: `${(q.plan.trade[b.id] / brandMax) * 75}%` } }) : null, h("span", { class: "amt" }, q.plan.trade[b.id] ? $k(q.plan.trade[b.id]) : "—"))))))),
      h("div", {}, eyebrow("What your decisions reflected"), h("p", { class: "muted", style: { marginTop: "8px", maxWidth: "var(--measure)" } }, "Every one of these was available to you all year. Here's which ones your decisions used."),
        h("div", { class: "sim-algos" }, R.algorithms.map((a) => h("div", { class: "sim-algo" },
          h("span", { class: `mk ${mark[a.status][2]}`, "aria-hidden": "true" }, mark[a.status][0]),
          h("div", {}, h("p", { class: "idea" }, a.idea, h("span", { class: `st ${mark[a.status][2]}` }, mark[a.status][1])), h("p", { class: "means" }, a.means), h("p", { class: "why" }, a.why),
            lessonBySlug[a.slug] ? link(`/learn/${a.slug}`, h("span", { class: "link", style: { fontSize: "var(--fs-small)" } }, `Learn: ${lessonBySlug[a.slug].title} `, arrow())) : null))))),
      h("div", { class: "card", style: { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" } },
        h("p", { style: { fontSize: "1.375rem", lineHeight: 1.35, letterSpacing: "-0.01em" } }, "You don't need to calculate any of these. You just need to make decisions that account for them.")),
      h("div", {}, eyebrow("What did you learn?"), h("div", { style: { marginTop: "10px" } }, noteBox), h("p", { class: "muted", style: { fontSize: "var(--fs-micro)", marginTop: "6px" } }, "Saved on this device only.")),
      h("div", { class: "sim-go", style: { justifyContent: "flex-start" } },
        h("button", { type: "button", class: "btn", onClick: () => { st = fresh(); persist(); render({ scroll: true }); } }, "Play the year again"),
        link("/accounts", h("span", { class: "btn btn-ghost" }, "Go to accounts ", arrow()))));
  }

  render();
  return h("div", {},
    h("section", { class: "reveal" }, eyebrow("Portfolio"), h("h1", { class: "hero", style: { marginTop: "16px" } }, "Run the business for a year."),
      h("p", { class: "hero-sub" }, `Eight brands. ${$k(S.BUDGET.trade)} of trade and ${S.BUDGET.hours} selling hours a quarter. You can't do everything: every decision means something else doesn't get done.`),
      h("p", { class: "muted", style: { marginTop: "12px", fontSize: "var(--fs-micro)" } }, "Illustrative business. Forecasts come from what your team believes, and some of it is wrong. Your progress is saved on this device.")),
    h("section", { class: "section reveal", style: { marginTop: "40px" } }, track),
    h("section", { style: { marginTop: "28px" } }, stage));
}
