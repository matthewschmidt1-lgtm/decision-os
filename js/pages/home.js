import { h, link, arrow, eyebrow } from "../ui.js";
import { decisions, brands, accounts, distributors, situation } from "../data.js";
import { setMeta } from "../app.js";

const hour = new Date().getHours();
const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

export default function Home() {
  setMeta({ title: null });
  return h("div", {},
    h("section", { class: "reveal" },
      h("p", { class: "eyebrow" }, `${greet}.`),
      h("h1", { class: "hero", style: { marginTop: "16px" } }, "Your territory has ", h("span", { class: "num" }, decisions.length), " decisions worth looking at."),
    ),
    h("section", { class: "reveal", style: { marginTop: "48px" } },
      decisions.map(d => link(`/decisions/${d.id}`, h("span", { class: "decision-row" },
        h("span", { class: `verb verb-${d.verb.toLowerCase()}` }, d.verb),
        h("span", { class: "body" }, d.headline),
        arrow()))),
    ),
    h("section", { class: "reveal", style: { marginTop: "40px", display: "flex", gap: "20px 32px", alignItems: "center", flexWrap: "wrap" } },
      link("/decisions", h("span", { class: "btn btn-lg" }, "Review decisions ", arrow())),
      h("div", { class: "facts" },
        h("span", {}, h("b", {}, brands.length), "Brands"),
        h("span", {}, h("b", {}, accounts.length), "Accounts"),
        h("span", {}, h("b", {}, distributors.length), "Distributors"),
        link("/accounts?channel=on", h("span", {}, "On-premise")),
        link("/accounts?channel=off", h("span", {}, "Off-premise"))),
    ),

    h("section", { class: "section reveal", "aria-labelledby": "sit" },
      eyebrow("Your commercial situation"),
      h("h2", { id: "sit", style: { marginTop: "10px" } }, `${brands.length} brands · ${distributors.length} distributors · ${accounts.length} accounts`),
      h("div", { class: "grid grid-2", style: { marginTop: "28px", alignItems: "start" } },
        h("div", { class: "card card-sunk" },
          eyebrow("The system sees"),
          h("div", { class: "metrics", style: { marginTop: "12px", gridTemplateColumns: "1fr" } },
            ...[["Growth", situation.growth], ["Volume", situation.volume], ["Margin", situation.margin], ["Trade investment", situation.trade]].map(([k, v]) =>
              h("div", { class: "metric" }, h("span", { class: "k" }, k), h("span", { class: `v delta ${v > 0 ? "up" : "down"} ${k === "Trade investment" ? (v > 0 ? "bad" : "good") : v > 0 ? "good" : "bad"}` }, `${v > 0 ? "+" : "−"}${Math.abs(v)}%`))))),
        h("div", { class: "stack", style: { "--gap": "0" } },
          eyebrow("Three things matter today"),
          ...situation.matters.map(m => h("div", { class: "step" }, h("span", { class: "n" }, m.n), h("div", {}, h("h3", {}, m.t), h("p", { class: "muted", style: { marginTop: "6px" } }, m.d))))))),

    h("section", { class: "section reveal" },
      h("div", { class: "card", style: { padding: "clamp(28px,5vw,56px)", textAlign: "center" } },
        eyebrow("One question"),
        h("h2", { style: { marginTop: "12px", fontSize: "var(--fs-h1)" } }, "Where should you allocate your next 10 hours?"),
        h("p", { class: "muted", style: { marginTop: "14px", maxWidth: "48ch", marginInline: "auto" } }, "The model found three brands with materially different expected returns on your next hour of effort."),
        h("div", { style: { marginTop: "28px" } }, link("/portfolio#attention", h("span", { class: "btn" }, "Explore decision ", arrow()))))),
  );
}
