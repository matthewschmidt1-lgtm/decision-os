import { h, link, arrow, eyebrow } from "../ui.js";
import { decisions, brands, accounts, distributors, situation } from "../data.js";
import { setMeta } from "../app.js";
import { reviewed, getChoice } from "../store.js";
import { scenarios, skills } from "../scenarios.js";
import { progress, nextUnplayed } from "./practice.js";

// Pick a different practice example on each visit: any unplayed scenario, never the one shown last time.
function randomScenario(p) {
  let last = null; try { last = sessionStorage.getItem("dos:lastHomeScenario"); } catch {}
  const pool = scenarios.filter(s => !p.results[s.id]);
  const choices = (pool.length ? pool : scenarios).filter(s => s.id !== last);
  const pick = choices[Math.floor(Math.random() * choices.length)] || scenarios[0];
  try { sessionStorage.setItem("dos:lastHomeScenario", pick.id); } catch {}
  return pick;
}

const hour = new Date().getHours();
const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

export default function Home() {
  setMeta({ title: null });
  const p = progress(); const allDone = p.done > 0 && !nextUnplayed();
  const next = randomScenario(p);
  const startHref = `/practice/${next.id}`;
  return h("div", {},
    h("section", { class: "reveal" },
      h("p", { class: "eyebrow" }, `${greet}.`),
      h("h1", { class: "hero", style: { marginTop: "16px" } }, "Real decisions. Real judgment. Better salespeople."),
      h("p", { class: "hero-sub" }, "Decision OS puts you in the moment. A key account decline, a promo request, a distributor loading up before quarter-end. You make the call."),
      h("p", { class: "hero-sub", style: { marginTop: "14px" } }, "Then we show you what matters: the evidence, reasoning, and principle behind the recommendation."),
    ),
    h("section", { class: "reveal section", style: { marginTop: "48px" } },
      eyebrow("You've got 5 minutes. Let's practice."),
      h("div", { class: "card", style: { marginTop: "14px", display: "grid", gridTemplateColumns: "1fr auto", gap: "24px", alignItems: "center" } },
        h("div", { class: "stack", style: { "--gap": "6px" } },
          h("p", {}, h("span", { class: "tag" }, "Customer "), h("b", { style: { fontWeight: 500 } }, next.customer)),
          h("p", {}, h("span", { class: "tag" }, "Situation "), `${next.situation.split(". ")[0]}.`),
          h("p", {}, h("span", { class: "tag" }, "Skill "), skills[next.skill].name)),
        link(startHref, h("span", { class: "btn btn-lg" }, allDone ? "Replay this one " : p.done ? "Continue training " : "Start training ", arrow()))),
      h("p", { class: "muted", style: { marginTop: "14px", fontSize: "var(--fs-small)" } }, p.done ? `${p.done} of ${p.total} scenarios completed · ${p.practiced} of ${Object.keys(skills).length} skills practiced` : `${p.total} scenarios · on-premise and off-premise · ${Object.keys(skills).length} skills · 5 levels, from recognizing a pattern to defending a recommendation.`),
    ),
    h("section", { class: "section reveal" },
      eyebrow("Your territory"),
      h("h2", { style: { marginTop: "10px" } }, "Four live decisions worth looking at."),
      h("p", { class: "muted", style: { marginTop: "8px", maxWidth: "var(--measure)" } }, "The same reasoning, applied to a sample territory: 15 brands, 3 distributors, 84 accounts."),
    ),
    h("section", { class: "reveal", style: { marginTop: "24px" } },
      decisions.map(d => { const c = getChoice(d.id); return link(`/decisions/${d.id}`, h("span", { class: "decision-row" },
        h("span", { class: `verb verb-${d.verb.toLowerCase()}` }, d.verb),
        h("span", { class: "body" }, d.headline, c ? h("span", { class: "chip", style: { marginLeft: "10px", verticalAlign: "middle" } }, `You chose ${c.option}`) : null),
        arrow())); }),
      reviewed().length ? h("p", { class: "muted", style: { marginTop: "14px", fontSize: "var(--fs-small)" } }, `You've reviewed ${reviewed().length} of ${decisions.length}. Your choices are remembered on this device.`) : null,
    ),
    h("section", { class: "reveal", style: { marginTop: "40px", display: "flex", gap: "20px 32px", alignItems: "center", flexWrap: "wrap" } },
      link("/decisions", h("span", { class: "btn btn-ghost" }, "Review decisions ", arrow())),
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
        h("p", { class: "muted", style: { marginTop: "14px", maxWidth: "48ch", marginInline: "auto" } }, "Three brands are competing for your next 10 hours. One of them deserves more than its size suggests."),
        h("div", { style: { marginTop: "28px" } }, link("/portfolio#attention", h("span", { class: "btn" }, "Explore decision ", arrow()))))),
  );
}
