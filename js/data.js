import { byKey } from "./ui.js";
// Territory data. Deterministic so every visit tells the same story.

export const user = { name: "Alex" };

export const distributors = [
  { id: "cascade", name: "Cascade Beverage", shipments: 14, inventory: 19, depletion: 1, accounts: 31 },
  { id: "harbor", name: "Harbor Distributing", shipments: 6, inventory: 4, depletion: 5, accounts: 29 },
  { id: "summit", name: "Summit Wholesale", shipments: 9, inventory: 12, depletion: 2, accounts: 24 },
];

// 15 brands. revenue $, growth %, margin = margin trend (pts), trade = trade spend growth %, mean/n/sd = return per hour ($K gross profit),
// hours observed and uncertainty (bandit). gm = gross margin %, tradeK = annual trade spend ($K), avgRoi = gross profit per trade $ on average,
// r0 = gross profit from the NEXT trade $, k = how fast returns diminish ($K), hoursNow = your selling hours per month today (of 40).
export const brands = [
  { id: "A", name: "Brand A", revenue: 18.2e6, growth: 12, margin: -1.2, trade: 21, mean: 0.95, n: 140, sd: 0.10, role: "Anchor", gm: 42, tradeK: 1500, avgRoi: 1.5, r0: 0.9, k: 150, hoursNow: 12 },
  { id: "B", name: "Brand B", revenue: 11.4e6, growth: 4, margin: -2.8, trade: 34, mean: 0.55, n: 96, sd: 0.14, role: "Over-supported", gm: 34, tradeK: 2500, avgRoi: 1.1, r0: 0.6, k: 100, hoursNow: 8 },
  { id: "C", name: "Brand C", revenue: 9.1e6, growth: -3, margin: 0.4, trade: -6, mean: 0.48, n: 88, sd: 0.12, role: "Declining", gm: 38, tradeK: 800, avgRoi: 1.0, r0: 0.8, k: 80, hoursNow: 5 },
  { id: "D", name: "Brand D", revenue: 6.3e6, growth: 18, margin: 1.9, trade: 8, mean: 1.12, n: 34, sd: 0.30, role: "Breakout", gm: 46, tradeK: 450, avgRoi: 1.4, r0: 2.2, k: 120, hoursNow: 2 },
  { id: "E", name: "Brand E", revenue: 5.8e6, growth: 2, margin: 0.1, trade: 3, mean: 0.51, n: 70, sd: 0.11, role: "Steady", gm: 40, tradeK: 500, avgRoi: 1.2, r0: 1.1, k: 60, hoursNow: 3 },
  { id: "F", name: "Brand F", revenue: 4.9e6, growth: 6, margin: 0.6, trade: 5, mean: 0.60, n: 60, sd: 0.13, role: "Steady", gm: 41, tradeK: 400, avgRoi: 1.3, r0: 1.3, k: 70, hoursNow: 2 },
  { id: "G", name: "Brand G", revenue: 4.1e6, growth: -1, margin: -0.4, trade: 11, mean: 0.44, n: 52, sd: 0.15, role: "Watch", gm: 36, tradeK: 450, avgRoi: 0.9, r0: 0.7, k: 60, hoursNow: 2 },
  { id: "H", name: "Brand H", revenue: 3.6e6, growth: 9, margin: 1.1, trade: 2, mean: 0.74, n: 18, sd: 0.38, role: "Promising", gm: 44, tradeK: 220, avgRoi: 1.3, r0: 1.8, k: 90, hoursNow: 1.5 },
  { id: "I", name: "Brand I", revenue: 3.2e6, growth: 1, margin: 0.2, trade: 4, mean: 0.47, n: 48, sd: 0.12, role: "Steady", gm: 39, tradeK: 280, avgRoi: 1.1, r0: 0.95, k: 50, hoursNow: 1.5 },
  { id: "J", name: "Brand J", revenue: 2.7e6, growth: 5, margin: 0.3, trade: 6, mean: 0.58, n: 40, sd: 0.16, role: "Steady", gm: 41, tradeK: 220, avgRoi: 1.2, r0: 1.2, k: 50, hoursNow: 1 },
  { id: "K", name: "Brand K", revenue: 2.1e6, growth: -4, margin: -1.0, trade: 15, mean: 0.36, n: 44, sd: 0.14, role: "Declining", gm: 33, tradeK: 280, avgRoi: 0.8, r0: 0.5, k: 40, hoursNow: 1.5 },
  { id: "L", name: "Brand L", revenue: 1.8e6, growth: 3, margin: 0.5, trade: 1, mean: 0.52, n: 30, sd: 0.20, role: "Steady", gm: 40, tradeK: 130, avgRoi: 1.2, r0: 1.3, k: 40, hoursNow: 0.5 },
  { id: "M", name: "Brand M", revenue: 1.2e6, growth: 7, margin: 0.9, trade: 0, mean: 0.62, n: 6, sd: 0.45, role: "Little data", gm: 45, tradeK: 50, avgRoi: 1.3, r0: 1.6, k: 30, hoursNow: 0 },
  { id: "N", name: "Brand N", revenue: 0.9e6, growth: -2, margin: 0.0, trade: 2, mean: 0.40, n: 22, sd: 0.22, role: "Under-supported", gm: 37, tradeK: 70, avgRoi: 1.0, r0: 1.2, k: 30, hoursNow: 0 },
  { id: "O", name: "Brand O", revenue: 0.6e6, growth: 14, margin: 1.4, trade: 1, mean: 0.70, n: 8, sd: 0.40, role: "New", gm: 47, tradeK: 40, avgRoi: 1.4, r0: 1.7, k: 30, hoursNow: 0 },
];
export const brandById = byKey(brands);

// Deterministic PRNG so the 84 accounts are stable
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rnd = mulberry32(20260922);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const between = (lo, hi, d = 0) => { const v = lo + rnd() * (hi - lo); return d ? Math.round(v * 10 ** d) / 10 ** d : Math.round(v); };

const onNames = ["Tavern", "Bistro", "Kitchen", "Public House", "Lounge", "Grill", "Taproom", "Cantina", "Oyster Bar", "Hotel Bar", "Social", "Supper Club"];
const offNames = ["Market", "Grocery", "Liquor", "Foods", "Mart", "Wine & Spirits", "Provisions", "Superstore", "Bottle Shop", "Pantry", "Co-op", "Corner Store"];
const prefixes = ["Northwest", "Riverside", "Harbor", "Cedar", "Pioneer", "Summit", "Maple", "Union", "Elm Street", "Lakeside", "Broadway", "Alder", "Cascade", "Meridian", "Fremont", "Ballard", "Capitol", "Madison", "Queen Anne", "Westlake", "Rainier", "Pike", "Belltown", "Magnolia", "Greenwood", "Columbia", "Beacon", "Delridge"];

const usedNames = new Set();
function makeAccount(i) {
  const channel = i % 5 < 2 ? "on" : "off";
  const distributor = distributors[i % 3];
  let name; let guard = 0;
  do { name = `${prefixes[(i + guard) % prefixes.length]} ${channel === "on" ? pick(onNames) : pick(offNames)}`; guard++; } while (usedNames.has(name) && guard < 50);
  usedNames.add(name);
  const store = `#${String(1000 + ((i * 37) % 900)).padStart(4, "0")}`;
  const velocity = between(-14, 22);
  const rawMargin = between(-5, 4, 1);
  const volume = between(-10, 18);
  const trade = between(-8, 30);
  const distribution = between(3, 12);
  const probability = between(0.12, 0.86, 2);
  const value = between(6, 48) * 1000;
  const cost = between(1, 9) * 1000;
  // Bigger accounts run deeper promotions, so their margin slips more. Tuned so the accounts roll up to the
  // territory's margin trend (situation.margin, −1.6 pts) whether averaged simply or weighted by size.
  const margin = Math.round((rawMargin - 1.3 - 0.06 * (value / 1000 - 27)) * 10) / 10;
  return { id: `acct-${i + 1}`, name, store, channel, distributor: distributor.id, velocity, margin, volume, trade, distribution, probability, value, cost, brands: [pick(brands).id, pick(brands).id, pick(brands).id].filter((v, j, a) => a.indexOf(v) === j) };
}
export const accounts = Array.from({ length: 84 }, (_, i) => makeAccount(i));

// Featured accounts referenced by decisions (override generated ones so the narrative is coherent)
Object.assign(accounts[0], { name: "Northwest Market", channel: "off", distributor: "cascade", velocity: 6, margin: -3, volume: 8, trade: 17, distribution: 9, probability: 0.61, value: 42000, cost: 4000, brands: ["A", "B", "D"] });
Object.assign(accounts[1], { name: "Riverside Tavern", channel: "on", distributor: "harbor", velocity: 11, margin: 0.8, volume: 9, trade: 4, distribution: 5, probability: 0.78, value: 26000, cost: 2000, brands: ["D", "H", "A"] });
Object.assign(accounts[2], { name: "Harbor Foods", channel: "off", distributor: "cascade", velocity: 1, margin: -0.6, volume: 12, trade: 9, distribution: 10, distributorInventory: 19, probability: 0.44, value: 38000, cost: 6000, brands: ["A", "C", "E"] });
Object.assign(accounts[3], { name: "Cedar Street Kitchen", channel: "on", distributor: "summit", velocity: 14, margin: 1.2, volume: 5, trade: 2, distribution: 4, probability: 0.84, value: 21000, cost: 1500, brands: ["H", "M", "O"] });
export const accountById = byKey(accounts);

// The four decisions on the home screen
export const decisions = [
  {
    id: "protect-northwest",
    verb: "Protect",
    accountId: "acct-1",
    headline: "Northwest Market is growing volume but losing margin.",
    question: "Should I increase promotion on Brand A next month?",
    sees: [
      ["Volume", 8], ["Net sales", 4], ["Gross margin", -3], ["Promotion spend", 17],
      ["Competitor activity", "↑", "warn"], ["Distributor inventory", "elevated", "warn"],
      ["On-premise velocity", "strong", "good"], ["Off-premise velocity", "weakening", "bad"],
    ],
    tradeoff: "More promotion could increase volume, but the expected incremental margin is declining. The last 17% of spend bought less than the previous 17%.",
    options: [
      { name: "Maintain", volume: 4, margin: 1.2, revenue: 3.1 },
      { name: "Increase", volume: 8, margin: -0.6, revenue: 5.4 },
      { name: "Redirect", volume: 6, margin: 2.1, revenue: 4.2, note: "Move 30% of promo budget to Brand D display." },
    ],
    preferred: "Redirect",
    algorithm: "marginal",
    plain: "This account is growing, but we're spending too much to get that growth. Each extra promo dollar returns less than the one before it.",
    technical: "Marginal analysis. The model compares the expected incremental contribution of additional trade investment against its incremental cost. When the marginal contribution curve crosses zero, more spend destroys value even as volume rises.",
    uncertain: "Competitor activity is inferred from price scans, not confirmed. If the competitor promotion ends next month, the case for Maintain strengthens.",
    changes: "A confirmed competitor exit, or a distributor inventory drawdown, would move the recommendation toward Maintain.",
  },
  {
    id: "shift-brand-b",
    verb: "Shift",
    accountId: null,
    brandId: "B",
    headline: "Brand B is receiving disproportionate trade support.",
    question: "Should trade support follow revenue, or follow return?",
    sees: [
      ["Brand B share of revenue", "15%"], ["Brand B share of trade spend", "32%", "warn"], ["Trade spend growth", 34, "bad"],
      ["Brand B sales", 4], ["Brand B margin", -2.8], ["Brand D margin", 1.9, "good"], ["Brand D gross profit per selling hour", "$1,120", "good"],
    ],
    tradeoff: "Brand B is the safe choice because it is established. But its return per dollar and per hour is now below most smaller brands.",
    options: [
      { name: "Hold", volume: 3, margin: -1.0, revenue: 2.5 },
      { name: "Rebalance", volume: 5, margin: 1.4, revenue: 3.8, note: "Shift $50–150K of Brand B's weakest events to Brand D and Brand H, then re-measure." },
      { name: "Cut", volume: 1, margin: 2.6, revenue: 0.8 },
    ],
    preferred: "Rebalance",
    algorithm: "utility",
    plain: "We keep funding Brand B because it's big, not because it's working. The answer depends on what you're optimizing for.",
    technical: "Multi-objective utility. Each option is scored against volume, revenue and margin with adjustable weights. There is no single best answer; there is a best answer for a stated objective.",
    uncertain: "Brand D's margin is based on two quarters of data. Its response to added trade support is extrapolated.",
    changes: "If your objective weights volume above margin, Hold becomes competitive with Rebalance.",
  },
  {
    id: "investigate-cascade",
    verb: "Investigate",
    accountId: "acct-3",
    distributorId: "cascade",
    headline: "Distributor inventory is rising while depletion is flat.",
    question: "Is Harbor Foods actually growing, or is Cascade just stocking up?",
    sees: [
      ["Distributor shipments", 14], ["Distributor inventory", 19, "warn"], ["Account depletion", 1, "flat"],
      ["Days of inventory", "61 → 74", "warn"], ["Account velocity", 1], ["Promotion calendar", "quarter-end load", "warn"],
    ],
    tradeoff: "Shipments look like growth on the P&L. If velocity doesn't follow, next quarter's orders fall and the growth reverses.",
    options: [
      { name: "Keep shipping", volume: 6, margin: -0.4, revenue: 5 },
      { name: "Pause and verify", volume: 1, margin: 0.9, revenue: 1, note: "Confirm account-level depletion before the next order." },
      { name: "Pull forward demand", volume: 4, margin: 0.2, revenue: 3 },
    ],
    preferred: "Pause and verify",
    algorithm: "voi",
    plain: "The numbers say growth. The shelf says otherwise. Before acting, find out which one is lying.",
    technical: "Value of information. The model asks which single piece of evidence would most reduce uncertainty about the cause, and whether that evidence is cheaper than acting blind.",
    uncertain: "Depletion is reported monthly with a two-week lag. The apparent flatness may be partly timing.",
    changes: "A depletion report above +8% would reclassify this as genuine growth and clear the shipment plan.",
  },
  {
    id: "capture-cedar",
    verb: "Capture",
    accountId: "acct-4",
    headline: "Cedar Street Kitchen has an unusually high probability of accepting a new placement.",
    question: "Is a Brand H placement pitch worth the visit this week?",
    sees: [
      ["Probability of acceptance", "84%", "good"], ["Expected annual value", "$21K"], ["Cost to pursue", "$1.5K"],
      ["On-premise velocity", 14, "good"], ["Menu turnover", "next 3 weeks", "good"], ["Distributor relationship", "strong", "good"],
    ],
    tradeoff: "It is a small account. But small and likely beats large and unlikely once you multiply.",
    options: [
      { name: "Visit this week", volume: 3, margin: 1.1, revenue: 2.2 },
      { name: "Send distributor rep", volume: 2, margin: 0.8, revenue: 1.4 },
      { name: "Skip", volume: 0, margin: 0, revenue: 0 },
    ],
    preferred: "Visit this week",
    algorithm: "ev",
    plain: "It's a small account, so it's easy to skip. But the odds are so good that it's one of the highest-value hours you can spend this week.",
    technical: "Expected value. Probability of success × economic value − cost of pursuing. The model ranks opportunities by expected value, not by account size.",
    uncertain: "Probability is estimated from menu-change timing and prior placements. A recent chef change is not in the data.",
    changes: "If acceptance probability falls below roughly 45%, the visit no longer beats sending the distributor rep.",
  },
];
export const decisionById = byKey(decisions);

export const blindspots = [
  { id: "revenue-up", title: "Revenue is up. Something else isn't.", rows: [["Sales", 11], ["Volume", 3, "warn"], ["Trade spend", 21], ["Margin", -4]], read: "Price and promotion are producing sales, not demand. The margin line is the tell.", decisionId: "protect-northwest" },
  { id: "shipments-up", title: "Distributor shipments are up. Account velocity isn't.", rows: [["Distributor shipments", 14], ["Distributor inventory", 19], ["Account depletion", 1, "warn"]], read: "Growth is sitting in a warehouse. Expect a soft quarter when it unwinds.", decisionId: "investigate-cascade" },
  { id: "volume-economics", title: "Brand is winning volume but losing economics.", rows: [["Volume", 9], ["Revenue", 5, "warn"], ["Gross margin", -2]], read: "Each case is worth less than it was. Ask what the volume is costing.", decisionId: "shift-brand-b" },
  { id: "promo-activity", title: "Promotion is creating activity, not incrementality.", rows: [["Promotional volume", 26], ["Baseline volume", -4], ["Estimated incremental volume", 7, "warn"]], read: "Most promotional volume would have sold anyway, and the baseline is eroding.", decisionId: "protect-northwest" },
];

export const situation = {
  growth: 7.2, volume: 4.8, margin: -1.6, trade: 12.4,
  matters: [
    { n: "01", t: "Trade efficiency", d: "$420K of promotional investment has declining marginal return." },
    { n: "02", t: "Distributor inventory", d: "Two distributors are carrying significantly more inventory than account velocity suggests." },
    { n: "03", t: "Brand allocation", d: "Three brands have materially different expected returns on incremental sales effort." },
  ],
};

export const channels = {
  on: { name: "On-premise", vocabulary: ["Placements", "Menu presence", "Rate of sale", "Account influence", "Occasion", "Execution", "Distributor relationship"], question: "Where will a placement change what people order?" },
  off: { name: "Off-premise", vocabulary: ["Distribution (ACV)", "Shelf position", "Facings", "On-shelf availability (OSA)", "Price", "Promotion", "Display", "Velocity", "Assortment", "Retailer segmentation", "Inventory"], question: "Where is the shelf working harder than the promotion?" },
};
