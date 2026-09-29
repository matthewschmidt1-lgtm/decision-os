// Accounts intro. First the learner picks the rule that should decide where their visits go (commit first). Then 84
// scattered dots (the raw data) come together, first as the two inputs of expected value, then as one ranked line with
// the summary underneath, the chosen rule's visits ringed throughout.
import { h, s } from "./ui.js";
import { rankByEV, money } from "./models.js";
import { navigate } from "./app.js";

const STEPS = [
  { label: null, text: (n) => `${n} accounts, scattered. Three numbers decide which deserve a visit: the chance they say yes, what they're worth, and what it costs to win them.` },
  { label: "The algorithm", text: () => "Up is worth more; right is more likely to say yes. Expected value multiplies the two and subtracts the cost of trying. Each curve joins accounts worth the same, so a big account that probably won't say yes can rank below a small one that probably will." },
  { label: "The answer", text: (n, sum, mine) => mine ? `One ranked line. ${mine.hit} of your rule's ${mine.n} visits (ringed) are among the best ${mine.n}.${mine.skipped.length ? ` It skipped ${mine.skipped.map((r) => `${r.name} (${money(r.ev)})`).join(" and ")}.` : ""}${mine.neg ? ` ${mine.neg === 1 ? "1 of its visits costs more than it returns" : `${mine.neg} of its visits cost more than they return`}.` : ""}` : `One ranked line. The top 20 hold ${sum.topShare}% of the territory's expected value, and ${sum.neg} accounts cost more to pursue than they return.` },
];

export function accountsViz(accounts, { mine = [] } = {}) {
  const rows = rankByEV(accounts), n = rows.length;
  const narrow = matchMedia("(max-width: 720px)").matches, still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const W = narrow ? 400 : 1000, H = narrow ? 300 : 320, R = narrow ? 4 : 5.5, P = { l: narrow ? 20 : 40, r: narrow ? 20 : 40, t: 44, b: 40 };
  const total = rows.reduce((a, r) => a + Math.max(0, r.ev), 0);
  const avg = (k) => rows.reduce((a, r) => a + r[k], 0) / n;
  const sum = { total, topShare: Math.round((rows.slice(0, 20).reduce((a, r) => a + Math.max(0, r.ev), 0) / total) * 100), neg: rows.filter((r) => r.ev < 0).length, on: rows.filter((r) => r.channel === "on").length };

  // Step 1: a deterministic scatter, so the "noise" looks the same on every visit.
  const hash = (i, k) => { const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
  const scatter = rows.map((_, i) => [P.l + hash(i, 1) * (W - P.l - P.r), P.t + hash(i, 2) * (H - P.t - P.b)]);
  // Step 2: the two inputs. Right = more likely, up = worth more.
  const pr = rows.map((r) => r.probability), vr = rows.map((r) => r.value);
  const px = (p) => P.l + ((p - Math.min(...pr)) / (Math.max(...pr) - Math.min(...pr))) * (W - P.l - P.r);
  const vy = (v) => H - P.b - ((v - Math.min(...vr)) / (Math.max(...vr) - Math.min(...vr))) * (H - P.t - P.b);
  const inputs = rows.map((r) => [px(r.probability), vy(r.value)]);
  // Lines of equal expected value (at the average cost of trying): where chance × value is the same.
  const avgCost = rows.reduce((a, r) => a + r.cost, 0) / n, pMin = Math.min(...pr), pMax = Math.max(...pr), vMin = Math.min(...vr), vMax = Math.max(...vr);
  const iso = (ev) => { const pts = []; for (let k = 0; k <= 40; k++) { const p = pMin + ((pMax - pMin) * k) / 40, v = (ev + avgCost) / p; if (v >= vMin && v <= vMax) pts.push(`${px(p).toFixed(1)},${vy(v).toFixed(1)}`); } return pts; };
  const isoLines = [10000, 25000].map((ev) => { const pts = iso(ev); const [lx, ly] = (pts.at(-1) || "0,0").split(",").map(Number);
    return { line: s("polyline", { points: pts.join(" ") }), label: s("text", { x: lx - 4, y: ly - 8, "text-anchor": "end" }, `EV ${money(ev)}`) }; });
  // Step 3: a beeswarm along expected value. Each dot takes the nearest free spot to the centre line.
  const lo = Math.min(...rows.map((r) => r.ev)), hi = Math.max(...rows.map((r) => r.ev));
  const ex = (v) => P.l + ((v - lo) / (hi - lo)) * (W - P.l - P.r), mid = (P.t + H - P.b) / 2 + 6, gap = R * 2 + 1.2;
  const placed = [];
  const swarm = rows.map((r) => {
    const x = ex(r.ev);
    for (let k = 0; ; k++) {
      const y = mid + (k % 2 ? -1 : 1) * Math.ceil(k / 2) * gap * 0.9;
      if (placed.every(([px2, py]) => (px2 - x) ** 2 + (py - y) ** 2 >= gap * gap)) { placed.push([x, y]); return [x, y]; }
    }
  });
  const layouts = [scatter, inputs, swarm];
  const best20 = rows.slice(0, 20).map((r) => r.id);
  const mineInfo = mine.length ? { n: mine.length, hit: mine.filter((id) => best20.includes(id)).length, neg: rows.filter((r) => mine.includes(r.id) && r.ev < 0).length,
    skipped: rows.slice(0, 20).filter((r) => !mine.includes(r.id)).slice(0, 2) } : null;

  const tone = (r, i) => (r.ev < 0 ? "neg" : i < 20 ? "top" : "mid");
  const dots = rows.map((r, i) => {
    const c = s("circle", { r: mine.includes(r.id) ? R + 2.5 : R, class: `dot ${r.channel}${mine.includes(r.id) ? " mine" : ""}`, "data-tone": tone(r, i), tabindex: "-1" }, s("title", {}, `${r.name}: ${money(r.ev)} expected value (${Math.round(r.probability * 100)}% × ${money(r.value)} − ${money(r.cost)})`));
    c.style.transitionDelay = still ? "0s" : `${(hash(i, 3) * 0.45).toFixed(2)}s`;
    c.addEventListener("click", () => navigate(`/accounts/${r.id}`));
    return c;
  });

  const zero = ex(0), best = rows[0];
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "acct-viz-svg", role: "img", "aria-label": `${n} accounts ranked by expected value. ${best.name} ranks first at ${money(best.ev)}. The top 20 hold ${sum.topShare}% of expected value; ${sum.neg} are negative.` },
    // step 2 axes
    s("g", { class: "ax ax-2" },
      s("line", { x1: P.l, x2: W - P.r, y1: H - P.b + 10, y2: H - P.b + 10 }), s("line", { x1: P.l - 10, x2: P.l - 10, y1: P.t, y2: H - P.b }),
      s("text", { x: W - P.r, y: H - P.b + 28, "text-anchor": "end" }, "More likely to win →"),
      s("text", { x: P.l - 4, y: P.t - 12 }, "↑ Worth more"),
      s("text", { class: "formula", x: W / 2, y: 22, "text-anchor": "middle" }, narrow ? "EV = chance × value − cost" : "Expected value = chance of winning × value − cost of trying"), s("g", { class: "iso" }, ...isoLines.map((l) => l.line))),
    // step 3 axis
    s("g", { class: "ax ax-3" },
      s("line", { class: "zero", x1: zero, x2: zero, y1: P.t - 6, y2: H - P.b + 6 }),
      s("text", { x: P.l, y: H - P.b + 24 }, "← Costs more than it returns"),
      s("text", { x: W - P.r, y: H - P.b + 24, "text-anchor": "end" }, "Worth pursuing →"),
      s("text", { class: "best", x: ex(best.ev), y: P.t - 12, "text-anchor": "end" }, `${best.name} · ${money(best.ev)}`)),
    s("g", { class: "dots" }, ...dots.filter((d) => !d.classList.contains("mine")), ...dots.filter((d) => d.classList.contains("mine"))),
    s("g", { class: "ax ax-2 iso iso-labels" }, ...isoLines.map((l) => l.label)));

  const caption = h("p", { class: "acct-viz-caption", "aria-live": "polite" });
  const stepBtns = STEPS.map((st, i) => (st.label ? h("button", { type: "button", onClick: () => { stop(); show(i); } }, h("span", { class: "n" }, String(i)), st.label) : null)).filter(Boolean);
  const tile = (k, v, sub) => h("div", { class: "ev-tile" }, h("span", { class: "k" }, k), h("span", { class: "v" }, v), h("span", { class: "sim-sub" }, sub));
  const tiles = h("div", { class: "ev-tiles acct-viz-tiles" },
    tile("Expected value in play", money(total), `across ${n} accounts, ${sum.on} on-premise`),
    tile("Top 20 accounts", `${sum.topShare}%`, "of all expected value"),
    tile("Not worth the visit", String(sum.neg), "accounts cost more than they return"),
    tile("Velocity trend", fmt(avg("velocity")), `volume ${fmt(avg("volume"))} · margin ${fmt(avg("margin"), " pts")}`));

  let step = -1, timers = [];
  const stop = () => { timers.forEach(clearTimeout); timers = []; };
  const show = (i) => {
    step = i; svg.dataset.step = String(i + 1); tiles.classList.toggle("in", i === 2);
    dots.forEach((d, j) => { const [x, y] = layouts[i][j]; d.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`; });
    caption.textContent = STEPS[i].text(n, sum, mineInfo);
    stepBtns.forEach((b, j) => b.setAttribute("aria-pressed", String(j + 1 === i)));
  };
  const play = () => { stop(); show(0); if (still) return show(2); timers = [setTimeout(() => show(1), 1500), setTimeout(() => show(2), 4800)]; };
  const replay = h("button", { type: "button", class: "link", onClick: play }, "Replay");

  const fig = h("figure", { class: "acct-viz" },
    h("div", { class: "acct-viz-head" }, h("div", { class: "acct-viz-steps", role: "group", "aria-label": "Steps" }, ...stepBtns), replay),
    caption, svg,
    h("ul", { class: "acct-viz-key", "aria-label": "Key" },
      ...(mine.length ? [h("li", {}, h("span", { class: "sw ring", "aria-hidden": "true" }), "Your rule's visits")] : []),
      h("li", {}, h("span", { class: "sw top", "aria-hidden": "true" }), "Best 20 by expected value"),
      h("li", {}, h("span", { class: "sw neg", "aria-hidden": "true" }), "Cost more than they return"),
      h("li", {}, h("span", { class: "sw mid", "aria-hidden": "true" }), "The rest")), tiles);
  fig.play = play; fig.show = (i) => { stop(); show(i); };
  return fig;
}

function fmt(v, unit = "%") { const r = Math.round(v * 10) / 10; return `${r > 0 ? "+" : r < 0 ? "−" : ""}${Math.abs(r)}${unit}`; }

// ---------- Pick the rule: commit before the reveal ----------
// The learner doesn't pick accounts; they pick the rule that decides where 20 visits go. Every rule is scored the same
// way, by the expected value of the 20 accounts it would send you to, so the lesson is choosing the decision rule.
export const VISITS = 20;
// Where each account sits on the rep's route and when it was last visited. Derived from the account id, not the shared
// random stream, so adding them leaves every other generated number (and the territory roll-ups) unchanged.
const hashId = (id, k) => { const i = Number(String(id).split("-")[1]) || 0, x = Math.sin((i + 1) * 91.345 + k * 47.853) * 24634.6345; return x - Math.floor(x); };
export const miles = (r) => Math.round(2 + hashId(r.id, 1) * 38);
export const daysSince = (r) => Math.round(8 + hashId(r.id, 2) * 112);
const usual = (r) => r.value / 1000 - miles(r) * 0.6; // big and on the way: the accounts a rep ends up seeing every quarter
export const RULES = [
  { id: "value", name: "Biggest accounts", how: "Go where the most business is.", sort: (a, b) => b.value - a.value,
    why: "It sends you to big accounts, but plenty are long shots. Size is only half of what a visit is worth." },
  { id: "usual", name: "The accounts I always see", how: "The big accounts on my regular route.", sort: (a, b) => usual(b) - usual(a),
    why: "Habit feels safe. It keeps you with accounts you know, whether or not they're likely to say yes this quarter." },
  { id: "chance", name: "Most likely to say yes", how: "Go where the odds are best.", sort: (a, b) => b.probability - a.probability,
    why: "Likely wins, but many are small. A near-certain $8K is worth less than a probable $40K." },
  { id: "ev", name: "Chance × value − cost", how: "Weigh the odds against the prize and the cost of winning it.", sort: (a, b) => b.ev - a.ev,
    why: "This is expected value. It weighs all three, so no other 20 visits are worth more on average." },
  { id: "route", name: "Closest to my route", how: "Least driving, most visits.", sort: (a, b) => miles(a) - miles(b),
    why: "Convenient, but distance says nothing about whether the account will say yes or what it's worth." },
  { id: "overdue", name: "Most overdue", how: "Whoever I haven't seen in the longest time.", sort: (a, b) => daysSince(b) - daysSince(a),
    why: "Coverage matters, but time since the last visit isn't a reason to expect a yes this quarter." },
];
export function scoreRules(accounts) {
  const rows = rankByEV(accounts);
  return RULES.map((r) => { const top = [...rows].sort(r.sort).slice(0, VISITS); return { ...r, top, ev: top.reduce((a, x) => a + x.ev, 0), neg: top.filter((x) => x.ev < 0).length, ids: top.map((x) => x.id) }; });
}

const KEY = "decision-os:rule:v1";
const loadRule = () => { try { const v = localStorage.getItem(KEY); return RULES.some((r) => r.id === v) ? v : null; } catch { return null; } };
const saveRule = (v) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch {} };

export function ruleChallenge(accounts, { onDone, skipped = false } = {}) {
  const scored = scoreRules(accounts), best = scored.find((r) => r.id === "ev"), host = h("div", { class: "visits" });
  // Weighted pipeline (chance × value, ignoring cost) isn't offered; it's named in the answer as the near miss.
  const pipeline = [...rankByEV(accounts)].sort((a, b) => b.probability * b.value - a.probability * a.value).slice(0, VISITS).reduce((a, x) => a + x.ev, 0);
  const smooth = () => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

  // The animation starts when it scrolls into view, so nobody misses it below the fold.
  const viz = (mine) => {
    const v = accountsViz(accounts, { mine });
    const start = () => v.play();
    if ("IntersectionObserver" in window) { const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); start(); } }, { threshold: 0.35 }); requestAnimationFrame(() => io.observe(v)); setTimeout(() => { if (!v.querySelector("svg").dataset.step) v.show(0); }, 300); }
    else setTimeout(start, 300);
    return v;
  };

  const ask = () => {
    const opts = RULES.map((r) => h("button", { type: "button", class: "rule", onClick: () => { saveRule(r.id); reveal(r.id, true); } },
      h("b", {}, r.name), h("span", {}, r.how)));
    const card = h("div", { class: "card visits-ask" },
      h("p", { class: "eyebrow" }, "Before the answer"),
      h("h2", { class: "visits-q", tabindex: "-1" }, `You have ${VISITS} visits this quarter and 84 accounts. Which rule should decide where they go?`),
      h("p", { class: "muted" }, "Pick the rule you'd trust. We'll run all six on the whole territory and compare what each set of visits is worth."),
      h("dl", { class: "rule-terms" },
        h("dt", {}, "Chance"), h("dd", {}, "that the account says yes to a placement this quarter"),
        h("dt", {}, "Value"), h("dd", {}, "a year of gross profit if they do"),
        h("dt", {}, "Cost"), h("dd", {}, "the visits and follow-up it takes to win them")),
      h("div", { class: "rules", role: "group", "aria-label": "Rules" }, ...opts),
      h("div", { class: "visits-go" }, h("button", { type: "button", class: "link", onClick: () => skip() }, "Skip to the ranking")));
    host.replaceChildren(card);
    return card;
  };

  const back = () => { onDone?.(false); const c = ask(); c.scrollIntoView({ behavior: smooth(), block: "start" }); c.querySelector(".visits-q").focus({ preventScroll: true }); };
  const skip = ({ focus = true } = {}) => {
    const again = h("button", { type: "button", class: "link", onClick: back }, "Or pick a rule and see how it scores");
    onDone?.(true); host.replaceChildren(h("p", { class: "muted visits-skipped" }, again), viz([]));
    if (focus) again.focus();
  };
  host.skip = skip;

  const reveal = (id, fresh) => {
    const mine = scored.find((r) => r.id === id), gap = best.ev - mine.ev, overlap = mine.ids.filter((x) => best.ids.includes(x)).length;
    const max = Math.max(...scored.map((r) => r.ev));
    const bars = h("div", { class: "rule-bars" }, ...[...scored].sort((a, b) => b.ev - a.ev).map((r) => h("div", { class: `rule-bar${r.id === id ? " mine" : ""}${r.id === "ev" ? " best" : ""}` },
      h("span", { class: "name" }, r.name, r.id === id ? h("small", {}, "your rule") : null),
      h("span", { class: "track" }, h("i", { style: { width: `${Math.max(2, (r.ev / max) * 100)}%` } })),
      h("b", {}, money(r.ev)))));
    const head = gap <= 0 ? `Right rule. ${money(mine.ev)} of expected value from ${VISITS} visits.` : `${mine.name}: ${money(mine.ev)}. Expected value: ${money(best.ev)}.`;
    const detail = gap <= 0 ? `${mine.why} Weighted pipeline, chance × value without the cost, comes close at ${money(pipeline)}; the cost of winning each account is the difference.`
      : `${mine.why} ${overlap} of its ${VISITS} visits are the same as expected value's; the other ${VISITS - overlap} are worth ${money(gap)} less${mine.neg ? `, and ${mine.neg} of them ${mine.neg === 1 ? "costs more than it returns" : "cost more than they return"}` : ""}.`;
    const result = h("div", { class: "card visits-result" },
      h("p", { class: "eyebrow" }, "Your rule"),
      h("h2", { class: "visits-q", tabindex: "-1" }, head),
      h("p", { class: "lede" }, detail),
      bars,
      h("p", { class: "muted rule-yard" }, "Each bar is what that rule's 20 visits are worth on average: the gross profit you'd expect, net of the cost of winning it, if you ran this quarter many times. It's only as good as your estimate of each account's chance."),
      h("p", { class: "rule-rule" }, h("b", {}, "Next time you plan visits: "), "for each account, chance × value − cost. Visit from the top down."),
      h("div", { class: "visits-go" }, h("span", { class: "muted" }, `Below: all 84 accounts, with your rule's ${VISITS} visits ringed.`),
        h("button", { type: "button", class: "link", onClick: () => { saveRule(null); back(); } }, "Try another rule")));
    host.replaceChildren(result, viz(mine.ids));
    onDone?.(true);
    if (fresh) { result.scrollIntoView({ behavior: smooth(), block: "start" }); result.querySelector(".visits-q").focus({ preventScroll: true }); }
  };

  const saved = loadRule();
  saved ? reveal(saved, false) : skipped ? skip({ focus: false }) : ask();
  return host;
}
