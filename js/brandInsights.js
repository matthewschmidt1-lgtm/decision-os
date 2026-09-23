// Which decision algorithms matter for a brand, derived only from its economics.
// Pure functions: every number shown in the brand popup comes from here, so it can be tested.
//
// Definitions (used in the popup copy):
// - "Return" = incremental gross profit per $1 of trade, measured before the trade cost, so $1 is breakeven.
// - avgRoi = that return averaged over past trade. r0 = the return on the next $1 above today's spend.
// - Each brand's curve: extra gross profit from x more ($K) = r0·k·(1 − e^(−x/k)). Returns shrink as spend rises.
//   Small brands can sit below the spend where support starts to work well, so their next $1 can beat their average.
import { brands } from "./data.js";
import { quadrant, tradeGain, allocateHours } from "./models.js";

const totalTrade = brands.reduce((a, b) => a + b.tradeK, 0);
const totalGP = brands.reduce((a, b) => a + b.revenue * b.gm / 100, 0);
const totalHours = brands.reduce((a, b) => a + b.hoursNow, 0);
const modelHours = Object.fromEntries(allocateHours(brands.map(b => ({ id: b.id, name: b.name, mean: b.mean, n: b.n, sd: b.sd })), 10, 0.5).map(a => [a.id, a.hours]));

export const MATERIAL_K = 3;          // net gains under $3K are treated as "little to gain"
export const BREAKEVEN_BAND = 0.1;    // next-dollar returns within $0.10 of $1 are "at the $1 point"

const $d = v => `$${v.toFixed(2)}`;
export const $k = v => { const a = Math.abs(v); const s = v < 0 ? "−" : ""; return a < 1 ? `${s}$${Math.round(a * 1000).toLocaleString()}` : a >= 1000 ? `${s}$${(a / 1000).toFixed(1)}M` : `${s}$${Math.round(a)}K`; };
const $h = v => `$${Math.round(v * 1000).toLocaleString()}`;
const pct1 = v => { const p = v * 100; return p < 10 ? `${p.toFixed(1)}%` : `${Math.round(p)}%`; };

export const QUESTION = {
  invest: "Are we under-funding this brand because it's small?",
  protect: "Are we paying for growth we would get anyway?",
  diagnose: "Do we know why it's declining, before we spend to stop it?",
  fix: "What broke, and will funding work once it's fixed?",
};

export function brandEconomics(b) {
  const gp = b.revenue * b.gm / 100;
  // Extra spend ($K) before the next dollar falls to $1, and the gross profit left after paying for it.
  const room = b.r0 > 1 ? b.k * Math.log(b.r0) : 0;
  const roomNet = b.r0 > 1 ? tradeGain(b, room) - room : 0;
  // Trim ($K) until the last dollar returns $1, assuming the curve extends just below today's spend, and the gain from it.
  const trim = b.r0 < 1 ? b.k * Math.log(1 / b.r0) : 0;
  const trimNet = b.r0 < 1 ? trim - b.k * (1 - b.r0) : 0;
  return {
    quadrant: quadrant(b),
    tradeRate: b.tradeK * 1000 / b.revenue,
    tradeShare: b.tradeK / totalTrade,
    gpShare: gp / totalGP,
    hoursNowPer10: b.hoursNow / totalHours * 10,
    hoursModelPer10: modelHours[b.id],
    atBreakeven: Math.abs(b.r0 - 1) <= BREAKEVEN_BAND + 1e-9,
    room, roomNet, trim, trimNet,
    overFunded: b.tradeK / totalTrade >= 1.5 * (gp / totalGP) || b.trade - b.growth > 10,
  };
}

export function brandInsights(b) {
  const e = brandEconomics(b);
  const out = [];

  // 1. Marginal analysis: add, trim, or hold (when the gain either way is immaterial)
  if (b.r0 > 1 && e.roomNet >= MATERIAL_K) out.push({
    slug: "optimization", title: "Marginal analysis: fund it to the $1 point",
    why: `The next $1 of trade returns ${$d(b.r0)} of incremental gross profit. On this brand's curve, returns stay above $1 for roughly the next ${$k(e.room)} of spend, adding about ${$k(e.roomNet)} of gross profit after paying for it. Treat $1 as the floor, not the target: with a fixed budget, fund the highest returns first.`,
    ask: "Is this brand funded to the point where its next dollar returns about $1?",
  });
  else if (b.r0 < 1 && e.trimNet >= MATERIAL_K) out.push({
    slug: "optimization", title: "Marginal analysis: trim the weakest spend",
    why: `The next $1 of trade returns ${$d(b.r0)}, so adding more loses money${b.avgRoi < 1 ? `, and on average this brand's trade has lost money too (${$d(b.avgRoi)} back per $1)` : ""}. The last dollars spent probably returned about the same, so trimming the weakest events should help: roughly ${$k(e.trim)} less spend for about ${$k(e.trimNet)} more gross profit. The curve is measured above today's spend, and cuts can cost displays or retailer goodwill, so test a cut on the weakest events first.`,
    ask: b.avgRoi < 1 ? "How much of this brand's trade should we cut, and from which events?" : "Which events returned the least last year, and what happens if we drop them?",
  });
  else out.push({
    slug: "optimization", title: e.atBreakeven ? "Marginal analysis: close to its $1 point" : b.r0 > 1 ? "Marginal analysis: nearly fully funded" : "Marginal analysis: hold, little to gain either way",
    why: `The next $1 of trade returns ${$d(b.r0)}. ${b.r0 > 1 ? `Adding more would gain only about ${$k(e.roomNet)} before returns fall to $1` : `Adding more loses money, but trimming to the $1 point would gain only about ${$k(e.trimNet)}`}, which is inside the error of any estimate. Hold spend roughly where it is and put new money where the next dollar clearly returns more.`,
    ask: "Is there a brand where the next dollar clearly returns more?",
  });

  // 2. Opportunity cost: trade out of line with profit or growth
  if (e.overFunded) out.push({
    slug: "optimization", title: b.growth < 0 ? "Opportunity cost: trade is rising on a declining brand" : "Opportunity cost: this brand is funding others' growth",
    why: b.growth < 0
      ? `Trade spend is up ${b.trade}% while sales are down ${Math.abs(b.growth)}%. It takes ${pct1(e.tradeShare)} of portfolio trade and earns ${pct1(e.gpShare)} of portfolio gross profit. Every dollar here is a dollar not spent where the next dollar returns more than $1.`
      : `It takes ${pct1(e.tradeShare)} of portfolio trade and earns ${pct1(e.gpShare)} of portfolio gross profit. Trade grew ${b.trade}% to buy ${b.growth}% more sales, at ${pct1(e.tradeRate)} of sales against a portfolio average of ${pct1(totalTrade * 1000 / brands.reduce((a, x) => a + x.revenue, 0))}. This brand is the natural funding source for brands above $1.`,
    ask: `If we set ${b.name}'s trade budget from zero today, would it get ${$k(b.tradeK)}?`,
  });

  // 3. Prediction vs. decision: history vs. the next dollar
  if (b.avgRoi >= 1 && b.r0 < 1) out.push({
    slug: "prediction-vs-decision", title: "Prediction vs. decision: past return isn't the next decision",
    why: b.avgRoi >= 1.2
      ? `An average return of ${$d(b.avgRoi)} describes what past trade did. The budget decision is about the next dollar, which returns ${$d(b.r0)}. Strong history is a reason to protect what works, not to keep adding.`
      : `An average of ${$d(b.avgRoi)} means past trade ${b.avgRoi === 1 ? "only broke even" : "barely paid back"}, and the next dollar returns ${$d(b.r0)}. History doesn't make the case for more.`,
    ask: "Are we funding this brand for what it did, or for what the next dollar will do?",
  });

  // 4. Utility: growth vs. margin
  if (b.growth > 0 && b.margin < 0) out.push({
    slug: "utility-and-trade-offs", title: "Utility and trade-offs: agree the objective first",
    why: `Sales are up ${b.growth}% while gross margin fell ${Math.abs(b.margin).toFixed(1)} pts. Whether that's a good year depends on how you weight sales growth against margin. Set the weights before the budget argument, or the argument is really about the weights.`,
    ask: "Which matters more for this brand this year: sales growth or margin?",
  });

  // 5. Value of information: declining brands
  if (b.growth < 0) out.push({
    slug: "value-of-information", title: "Value of information: diagnose before you spend",
    why: `Sales are down ${Math.abs(b.growth)}%. Lost distribution, price, shelf, and falling demand each call for a different fix. A depletion and distribution check costs an afternoon; a quarter of the wrong promotion costs far more.`,
    ask: "What single fact would change what we do next?",
  });

  // 6. Decision tree: declining but responsive
  if (e.quadrant === "fix") out.push({
    slug: "decision-trees", title: "Decision tree: fix, then fund",
    why: `The brand is declining but still responds to support: its next $1 of trade returns ${$d(b.r0)}. Map the branches. If the cause is fixable, like lost distribution, fix it and then fund it. If it's falling demand, funding won't hold.`,
    ask: "If we fix the cause, does the funding case still stand?",
  });

  // 7. Time: where hours go vs. where they return
  const dh = e.hoursModelPer10 - e.hoursNowPer10;
  if (b.n >= 20 && dh >= 0.5) out.push({
    slug: "multi-armed-bandits", title: "Explore vs. exploit: time should follow return",
    why: `Each selling hour returns about ${$h(b.mean)} in gross profit, the most per hour of any brand with solid evidence (${b.n} hours observed). It gets ${pct1(e.hoursNowPer10 / 10)} of your time today on ${pct1(b.revenue / brands.reduce((a, x) => a + x.revenue, 0))} of revenue. A rule of thumb that tilts time toward higher and less-proven returns gives it ${e.hoursModelPer10.toFixed(1)} of every 10 hours, against ${e.hoursNowPer10.toFixed(1)} today.`,
    ask: "Is our time following the return, or the revenue?",
  });
  if (dh <= -0.5) out.push({
    slug: "multi-armed-bandits", title: "Explore vs. exploit: time is following size",
    why: `You spend ${e.hoursNowPer10.toFixed(1)} of every 10 selling hours here, and each returns about ${$h(b.mean)} in gross profit. A rule of thumb that tilts time toward higher and less-proven returns cuts that to ${e.hoursModelPer10.toFixed(1)}, moving the rest to brands like D, H, and the ones you know little about.`,
    ask: "Is our time following the return, or the revenue?",
  });
  if (b.n < 20) out.push({
    slug: "exploration-vs-exploitation", title: "Explore vs. exploit: test before you bet",
    why: `There are only ${b.n} hours of selling evidence. Its return per hour averages about ${$h(b.mean)}, but individual hours vary by about ±${$h(b.sd)}, so the average could still be off by around ±${$h(b.sd / Math.sqrt(b.n))}. The rule of thumb gives it ${e.hoursModelPer10.toFixed(1)} of your next 10 hours, against ${e.hoursNowPer10.toFixed(1)} today, partly to find out.`,
    ask: "What small test would tell us whether this brand deserves a bigger bet?",
  });
  if (b.n < 10) out.push({
    slug: "bayesian-updating", title: "Bayesian updating: let results move the estimate",
    why: "With this little data, each new result should move your belief a lot. Decide up front what result would make you invest more, and what would make you stop.",
    ask: "What result from the test would change our plan?",
  });
  return out.slice(0, 5);
}
