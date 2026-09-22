import { h, link, arrow, eyebrow, bar, segmented, says, disclose } from "../ui.js";
import { brands, distributors, brandById } from "../data.js";
import { banditWidget, fingerprintWidget } from "../lessons/widgets.js";
import { allocateHours, money, pct } from "../models.js";
import { setMeta } from "../app.js";

const chainMeasures = {
  shipment: { label: "Shipment", desc: "What the company sent to distributors. Looks like growth on the P&L.", vals: { cascade: 14, harbor: 6, summit: 9 } },
  inventory: { label: "Distributor inventory", desc: "What is sitting in warehouses. Rising inventory with flat depletion is borrowed growth.", vals: { cascade: 19, harbor: 4, summit: 12 } },
  order: { label: "Account order", desc: "What accounts actually ordered from distributors.", vals: { cascade: 3, harbor: 5, summit: 4 } },
  depletion: { label: "Depletion / velocity", desc: "What sold through to consumers. The only number that can't be gamed for long.", vals: { cascade: 1, harbor: 5, summit: 2 } },
  demand: { label: "Consumer demand", desc: "Estimated underlying demand from panel and velocity data.", vals: { cascade: 2, harbor: 4, summit: 2 } },
};

export default function Portfolio({ params }) {
  setMeta({ title: "Portfolio", description: "Fifteen brands as a system, competing for your attention." });
  const focus = brandById[params.get("brand")] || brandById.A;

  // Commercial chain
  let measure = "shipment";
  const chainBars = h("div", { class: "bars" });
  const chainSays = says("");
  const renderChain = () => {
    const m = chainMeasures[measure];
    chainBars.replaceChildren(...distributors.map(d => bar(d.name, Math.max(0, m.vals[d.id]), 20, { tone: measure === "inventory" && m.vals[d.id] > 10 ? "warn" : measure === "depletion" && m.vals[d.id] < 3 ? "bad" : "", format: v => pct(v, 0) })));
    const gap = chainMeasures.shipment.vals.cascade - chainMeasures.depletion.vals.cascade;
    chainSays.set(measure === "shipment" ? m.desc : measure === "depletion" ? `${m.desc} Cascade shipped +14% but depleted +1%: a ${gap}-point gap that will unwind.` : m.desc, measure === "inventory" || measure === "depletion" ? "warn" : "");
  };
  renderChain();
  const chainSteps = ["Company", "Distributor", "Account", "Consumer"];
  const chainStepFor = { shipment: 0, inventory: 1, order: 2, depletion: 2, demand: 3 };
  const chainViz = h("div", { class: "tree", style: { marginBottom: "20px" } });
  const renderChainViz = () => chainViz.replaceChildren(...chainSteps.flatMap((c, i) => [h("div", { class: `node ${chainStepFor[measure] === i ? "" : "dim"}`, style: { minWidth: "160px" } }, h("span", { class: "n" }, c), h("span", { class: "v", style: { fontSize: "var(--fs-micro)", fontWeight: 500, color: "var(--muted)" } }, ["shipment / margin", "inventory · orders", "sales", "demand"][i])), i < 3 ? h("div", { class: "edge" }) : null].filter(Boolean)));
  renderChainViz();

  const alloc = allocateHours(brands.map(b => ({ id: b.id, name: b.name, mean: b.mean, n: b.n, sd: b.sd })), 10);
  const bigMover = alloc.find(a => a.id === "D");

  return h("div", {},
    h("section", { class: "reveal" }, eyebrow("Portfolio"), h("h1", { class: "hero", style: { marginTop: "16px" } }, "Fifteen brands. One system."),
      h("p", { class: "hero-sub" }, "Not fifteen dashboards. The portfolio as a set of claims on your time, your trade budget, and your distributors' attention.")),

    h("section", { class: "section reveal" },
      h("div", { class: "tree" },
        h("div", { class: "node", style: { minWidth: "150px" } }, h("span", { class: "n" }, brandById.A.name), h("span", { class: "v" }, money(brandById.A.revenue)), h("span", { class: "good", style: { fontSize: "var(--fs-small)" } }, pct(brandById.A.growth, 0))),
        h("div", { class: "edge" }),
        h("div", { class: "branch" },
          h("div", {}, h("div", { class: "edge" }), h("div", { class: "node" }, h("span", { class: "n" }, "Brand B"), h("span", { class: "v good" }, "+4%")), h("div", { class: "edge" }), h("div", { class: "node" }, h("span", { class: "n" }, "Brand D"), h("span", { class: "v good" }, "+18%"))),
          h("div", {}, h("div", { class: "edge" }), h("div", { class: "node" }, h("span", { class: "n" }, "Brand C"), h("span", { class: "v bad" }, "−3%"))))),
      h("p", { class: "muted", style: { textAlign: "center", marginTop: "16px", fontSize: "var(--fs-small)" } }, "Brand A anchors the portfolio. Brand D is the outlier worth understanding.")),

    h("section", { class: "section", id: "attention" },
      h("div", { class: "section-head reveal" }, h("div", {}, eyebrow("Attention allocation"), h("h2", { style: { marginTop: "10px" } }, "Where should you spend your next 10 hours?")),
        h("p", { class: "muted", style: { maxWidth: "40ch" } }, `The model found that ${bigMover?.name} has unusually high expected marginal return, so it earns more hours than its revenue would suggest.`)),
      h("div", { class: "card reveal" }, banditWidget(),
        h("div", { style: { marginTop: "24px" } }, disclose("Why?", h("div", { class: "stack" },
          h("p", {}, `Brand D is small (${money(brandById.D.revenue)}) but growing ${pct(brandById.D.growth, 0)} with rising margin. Each hour spent on it currently returns about ${brandById.D.mean.toFixed(2)} units of contribution against ${brandById.A.mean.toFixed(2)} for Brand A. Brands M and O get a little time not because they're proven but because the model doesn't yet know, and finding out is worth something.`),
          link("/learn/multi-armed-bandits", h("span", { class: "link" }, "Learn: multi-armed bandits ", arrow()))))))),

    h("section", { class: "section", id: "chain" },
      h("div", { class: "section-head reveal" }, h("div", {}, eyebrow("The commercial chain"), h("h2", { style: { marginTop: "10px" } }, "Where does the growth actually come from?")),
        h("p", { class: "muted", style: { maxWidth: "40ch" } }, "Company → Distributor → Account → Consumer. Information gets distorted at each layer.")),
      h("div", { class: "card reveal" },
        h("div", { style: { marginBottom: "20px" } }, segmented(Object.entries(chainMeasures).map(([k, v]) => ({ value: k, label: v.label })), measure, v => { measure = v; renderChain(); renderChainViz(); })),
        h("div", { class: "grid grid-2", style: { alignItems: "start" } }, chainViz, h("div", { class: "stack" }, chainBars, chainSays)))),

    h("section", { class: "section", id: "fingerprint" },
      h("div", { class: "section-head reveal" }, h("div", {}, eyebrow("Economic fingerprint"), h("h2", { style: { marginTop: "10px" } }, "What actually drove the result?")),
        h("p", { class: "muted", style: { maxWidth: "40ch" } }, "Sales splits into volume and price. Margin and trade spend tell you whether the growth was earned or bought.")),
      h("div", { class: "card reveal" }, fingerprintWidget({ volume: 5, price: 3, tradeSpend: 14 }))),

    h("section", { class: "section" },
      h("div", { class: "section-head reveal" }, h("div", {}, eyebrow("All brands"), h("h2", { style: { marginTop: "10px" } }, "Growth, margin, trade, and return on your time."))),
      h("div", { class: "table-wrap reveal" }, h("table", { class: "table" },
        h("thead", {}, h("tr", {}, h("th", {}, "Brand"), h("th", {}, "Role"), h("th", { class: "num" }, "Revenue"), h("th", { class: "num" }, "Growth"), h("th", { class: "num" }, "Margin Δ"), h("th", { class: "num" }, "Trade Δ"), h("th", { class: "num" }, "Return / hour"))),
        h("tbody", {}, brands.map(b => h("tr", { style: b.id === focus.id ? { background: "var(--accent-soft)" } : null },
          h("td", {}, h("b", { style: { fontWeight: 500 } }, b.name)), h("td", { class: "muted" }, b.role), h("td", { class: "num" }, money(b.revenue)),
          h("td", { class: `num ${b.growth > 0 ? "good" : b.growth < 0 ? "bad" : ""}` }, pct(b.growth, 0)), h("td", { class: `num ${b.margin > 0 ? "good" : b.margin < 0 ? "bad" : ""}` }, `${b.margin > 0 ? "+" : ""}${b.margin.toFixed(1)} pts`),
          h("td", { class: `num ${b.trade > 15 ? "bad" : ""}` }, pct(b.trade, 0)), h("td", { class: "num" }, b.mean.toFixed(2), h("span", { class: "muted" }, ` ±${b.sd.toFixed(2)}`)))))))),
  );
}
