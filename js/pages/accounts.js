import { h, link, arrow, eyebrow, segmented, says, disclose } from "../ui.js";
import { accounts, channels, distributors } from "../data.js";
import { rankByEV, money, pct } from "../models.js";
import { setMeta, navigate } from "../app.js";

export default function Accounts({ params }) {
  setMeta({ title: "Accounts", description: "Eighty-four accounts, ranked by expected value rather than size." });
  let channel = params.get("channel") === "on" ? "on" : params.get("channel") === "off" ? "off" : "all";
  let sort = params.get("sort") || "ev";
  const roi = Number(params.get("roi") || 0);
  const distName = Object.fromEntries(distributors.map(d => [d.id, d.name]));

  const title = h("h1", { class: "hero", style: { marginTop: "16px" } });
  const sub = h("p", { class: "hero-sub" });
  const vocab = h("div", { class: "pill-list", style: { marginTop: "20px" } });
  const tbody = h("tbody");
  const count = h("p", { class: "muted", style: { fontSize: "var(--fs-small)" } });
  const line = says("");

  const render = () => {
    const ch = channels[channel];
    title.textContent = channel === "all" ? "Which accounts deserve a visit?" : ch.question;
    sub.textContent = channel === "all" ? "Ranked by expected value: probability of success × economic value − cost of pursuing. Not by size." : channel === "on" ? "On-premise is about influence and occasion. A placement here changes what people order, and what other accounts copy." : "Off-premise is about the shelf. Distribution, position, price, and whether the promotion is buying anything the shelf wouldn't sell anyway.";
    vocab.replaceChildren(...(channel === "all" ? [] : ch.vocabulary.map(v => h("span", { class: "chip" }, v))));
    let rows = rankByEV(accounts.filter(a => channel === "all" || a.channel === channel));
    if (roi) rows = rows.filter(a => (a.ev / a.value) * 100 >= roi); // expected ROI here = expected value as a share of the prize (probability net of cost)
    if (sort === "velocity") rows.sort((a, b) => b.velocity - a.velocity);
    else if (sort === "volume") rows.sort((a, b) => b.volume - a.volume);
    else if (sort === "margin") rows.sort((a, b) => b.margin - a.margin);
    else if (sort === "size") rows.sort((a, b) => b.value - a.value);
    tbody.replaceChildren(...rows.map((a, i) => h("tr", { class: "clickable", tabindex: "0", onClick: () => navigate(`/accounts/${a.id}`), onKeydown: e => { if (e.key === "Enter") navigate(`/accounts/${a.id}`); } },
      h("td", { class: "muted mono", style: { width: "40px", fontSize: "var(--fs-micro)" } }, String(i + 1).padStart(2, "0")), h("td", {}, h("b", { style: { fontWeight: 500 } }, a.name), h("div", { class: "muted", style: { fontSize: "var(--fs-micro)" } }, `${a.channel === "on" ? "On-premise" : "Off-premise"} · ${distName[a.distributor]} · ${a.store}`)),
      h("td", { class: `num ${a.velocity > 0 ? "good" : a.velocity < 0 ? "bad" : ""}` }, pct(a.velocity, 0)), h("td", { class: `num ${a.volume > 0 ? "good" : a.volume < 0 ? "bad" : ""}` }, pct(a.volume, 0)), h("td", { class: `num ${a.margin > 0 ? "good" : a.margin < 0 ? "bad" : ""}` }, `${a.margin > 0 ? "+" : ""}${a.margin.toFixed(1)}`),
      h("td", { class: "num" }, `${Math.round(a.probability * 100)}%`), h("td", { class: "num" }, money(a.value)), h("td", { class: "num", style: { fontWeight: 600 } }, money(a.ev)))));
    count.textContent = `${rows.length} accounts${roi ? ` where expected value is more than ${roi}% of the prize` : ""}`;
    const top = rows[0]; const biggest = [...rows].sort((a, b) => b.value - a.value)[0];
    if (top && biggest && top !== biggest) line.set(`${top.name} ranks first at ${money(top.ev)} expected value, ahead of ${biggest.name} (${money(biggest.value)} potential, but only ${Math.round(biggest.probability * 100)}% likely). Expected value rewards the likely, not just the large.`);
    else if (top) line.set(`${top.name} ranks first at ${money(top.ev)} expected value.`);
    history.replaceState({}, "", `/accounts?${new URLSearchParams({ ...(channel !== "all" && { channel }), ...(sort !== "ev" && { sort }), ...(roi && { roi }) })}`.replace(/\?$/, ""));
  };
  render();

  return h("div", {},
    h("section", { class: "reveal" }, eyebrow("Accounts"), title, sub, vocab, h("p", { class: "muted", style: { marginTop: "16px", fontSize: "var(--fs-micro)" } }, "Illustrative territory. Accounts, probabilities and values are generated for practice, not pulled from your systems.")),
    h("section", { class: "section reveal", style: { display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" } },
      segmented([{ value: "all", label: "All" }, { value: "on", label: "On-premise" }, { value: "off", label: "Off-premise" }], channel, v => { channel = v; render(); }),
      h("label", { class: "muted", style: { display: "flex", gap: "10px", alignItems: "center", fontSize: "var(--fs-small)" } }, "Sort by",
        segmented([{ value: "ev", label: "Expected value" }, { value: "velocity", label: "Velocity" }, { value: "volume", label: "Volume" }, { value: "margin", label: "Margin" }, { value: "size", label: "Size" }], sort, v => { sort = v; render(); }))),
    h("section", { style: { marginTop: "20px" }, class: "stack reveal" }, line, count,
      h("div", { class: "table-wrap" }, h("table", { class: "table" }, h("thead", {}, h("tr", {}, h("th", {}, "#"), h("th", {}, "Account"), h("th", { class: "num" }, "Velocity"), h("th", { class: "num" }, "Volume"), h("th", { class: "num" }, "Margin Δ"), h("th", { class: "num" }, "P(win)"), h("th", { class: "num" }, "Value"), h("th", { class: "num" }, "Expected value"))), tbody))),
    h("section", { class: "section reveal" }, disclose("Why is it ranked this way?", h("div", { class: "stack" },
      h("div", { class: "layer layer-1" }, eyebrow("In plain language"), h("p", {}, "A big account you probably won't win is worth less than a small one you probably will. The list multiplies the two, then subtracts what it costs you to try.")),
      h("div", { class: "layer layer-2" }, eyebrow("Algorithm underneath · Expected value"), h("p", {}, "Expected value = probability of success × economic value − cost of pursuing. Probability comes from menu timing, prior placements, distributor relationship and velocity in comparable accounts. It is an estimate, and the ranking is only as good as it is.")),
      h("div", { class: "layer layer-2" }, eyebrow("What would change it"), h("p", { class: "muted" }, "New information about a buyer moves the probability, and therefore the rank. That is Bayesian updating, and it is why a call can be worth more than a visit.")),
      link("/learn/expected-value", h("span", { class: "link" }, "Learn: expected value ", arrow()))))),
  );
}
