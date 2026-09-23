// Which decision algorithms matter for a brand, derived only from its economics.
// Pure functions: every number shown in the brand popup comes from here, so it can be tested.
import { brands } from "./data.js";
import { quadrant, tradeGain, allocateHours } from "./models.js";

const totalTrade = brands.reduce((a, b) => a + b.tradeK, 0);
const totalGP = brands.reduce((a, b) => a + b.revenue * b.gm / 100, 0);
const totalHours = brands.reduce((a, b) => a + b.hoursNow, 0);
const modelHours = Object.fromEntries(allocateHours(brands.map(b => ({ id: b.id, name: b.name, mean: b.mean, n: b.n, sd: b.sd })), 10, 0.5).map(a => [a.id, a.hours]));

const $d = v => `$${v.toFixed(2)}`;
const $k = v => `$${Math.round(v)}K`;
const $h = v => `$${Math.round(v * 1000).toLocaleString()}`;

export const QUESTION = {
  invest: "Are we under-funding this brand because it's small?",
  protect: "Are we paying for growth we would get anyway?",
  diagnose: "Do we know why it's declining, before we spend to stop it?",
  fix: "What broke, and will funding work once it's fixed?",
};

export function brandEconomics(b) {
  const gp = b.revenue * b.gm / 100;
  const room = b.r0 > 1 ? b.k * Math.log(b.r0) : 0;           // extra spend ($K) before the next dollar falls to $1
  const roomNet = b.r0 > 1 ? tradeGain(b, room) - room : 0;     // gross profit gained minus spend at that point ($K)
  return {
    quadrant: quadrant(b),
    tradeRate: b.tradeK * 1000 / b.revenue,
    tradeShare: b.tradeK / totalTrade,
    gpShare: gp / totalGP,
    hoursShareNow: b.hoursNow / totalHours,
    hoursNowPer10: b.hoursNow / totalHours * 10,
    hoursModelPer10: modelHours[b.id],
    room, roomNet,
  };
}

export function brandInsights(b) {
  const e = brandEconomics(b);
  const out = [];
  if (b.r0 > 1) out.push({
    slug: "optimization", title: "Marginal analysis: fund it to the $1 point",
    why: `The next trade dollar returns ${$d(b.r0)} in gross profit. On this brand's curve, returns stay above $1 for roughly the next ${$k(e.room)}, which would add about ${$k(e.roomNet)} of gross profit after paying for the spend.`,
    ask: "Is this brand funded to the point where its next dollar returns about $1?",
  });
  else out.push({
    slug: "optimization", title: "Marginal analysis: stop adding",
    why: `Each extra trade dollar returns ${$d(b.r0)} in gross profit, so adding more loses money${b.avgRoi >= 1 ? `, even though its average return is ${$d(b.avgRoi)}` : ""}. Cutting is a separate question: the dollars already spent returned more than the next one would. Measure the last few events before you cut.`,
    ask: "What did the last dollars we spent here actually return?",
  });
  if (b.avgRoi >= 1 && b.r0 < 1) out.push({
    slug: "prediction-vs-decision", title: "Prediction vs. decision: past return isn't the next decision",
    why: `An average return of ${$d(b.avgRoi)} describes what past spending did. The budget decision is about the next dollar, which returns ${$d(b.r0)}. Strong history is a reason to protect the brand, not to keep adding to it.`,
    ask: "Are we funding this brand for what it did, or for what the next dollar will do?",
  });
  if (b.growth > 0 && b.margin < 0) out.push({
    slug: "utility-and-trade-offs", title: "Utility and trade-offs: agree the objective first",
    why: `Sales are up ${b.growth}% while gross margin fell ${Math.abs(b.margin).toFixed(1)} pts. Whether that's a good year depends on how you weight volume against margin. Set the weights before the budget argument, or the argument is really about the weights.`,
    ask: "Which matters more for this brand this year: volume or margin?",
  });
  if (b.growth < 0) out.push({
    slug: "value-of-information", title: "Value of information: diagnose before you spend",
    why: `Sales are down ${Math.abs(b.growth)}%. Distribution, price, shelf, and demand each call for a different fix. A depletion and distribution check costs an afternoon; a quarter of the wrong promotion costs far more.`,
    ask: "What single fact would change what we do next?",
  });
  if (e.quadrant === "fix") out.push({
    slug: "decision-trees", title: "Decision tree: fix, then fund",
    why: `The brand is declining but still responds to support: its next trade dollar returns ${$d(b.r0)}. Map the branches. If the cause is fixable, like lost distribution, fix it and then fund it. If it's falling demand, funding won't hold.`,
    ask: "If we fix the cause, does the funding case still stand?",
  });
  if (b.n >= 20 && e.hoursModelPer10 - e.hoursNowPer10 >= 0.5) out.push({
    slug: "multi-armed-bandits", title: "Explore vs. exploit: a proven winner deserves your time",
    why: `Each selling hour returns about ${$h(b.mean)} in gross profit, with ${b.n} hours of evidence behind it. The model moves your time here: ${e.hoursNowPer10.toFixed(1)} of every 10 hours today, ${e.hoursModelPer10.toFixed(1)} in its plan. Time usually follows revenue; this brand earns more than its size suggests.`,
    ask: "Is our time following the return, or the revenue?",
  });
  if (b.n < 20) out.push({
    slug: "exploration-vs-exploitation", title: "Explore vs. exploit: test before you bet",
    why: `There are only ${b.n} hours of selling evidence, so its return per hour (${$h(b.mean)}) could be off by about ${$h(b.sd)} either way. The model gives it ${e.hoursModelPer10.toFixed(1)} of your next 10 hours, against ${e.hoursNowPer10.toFixed(1)} today, partly to find out.`,
    ask: "What small test would tell us whether this brand deserves a bigger bet?",
  });
  if (b.n < 10) out.push({
    slug: "bayesian-updating", title: "Bayesian updating: let results move the estimate",
    why: "With this little data, each new result should move your belief a lot. Decide up front what result would make you invest more, and what would make you stop.",
    ask: "What result from the test would change our plan?",
  });
  return out.slice(0, 4);
}
