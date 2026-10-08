import { h, link, arrow, eyebrow } from "../ui.js";
import { setMeta } from "../app.js";
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
      h("h1", { class: "hero", style: { marginTop: "16px" } }, "Real decisions. Real judgment. Better results."),
      h("p", { class: "hero-sub" }, "Sales doesn't happen in spreadsheets. It happens in moments: a key account goes quiet, a customer asks for a discount, a distributor loads up before quarter-end."),
      h("p", { class: "hero-sub", style: { marginTop: "14px", fontWeight: 600, color: "var(--ink)" } }, "Decision OS puts you in those moments."),
      h("p", { class: "hero-sub", style: { marginTop: "22px" } }, "You make the call. Then we unpack the judgment behind it:"),
      h("ul", { class: "hero-sub hero-list" }, ["What matters and what doesn\u2019t matter?", "What evidence should you trust?", "What tradeoffs are you making?", "What would change your decision?"].map((t) => h("li", {}, t))),
      h("p", { class: "hero-sub", style: { marginTop: "26px" } }, "Then we reveal the reasoning and principles behind the situation, so you understand not just the answer, but how to think through the next decision."),
    ),
    h("section", { class: "reveal section", style: { marginTop: "48px" } },
      eyebrow("You've got 5 minutes. Let's practice."),
      h("div", { class: "card", style: { marginTop: "14px", display: "grid", gridTemplateColumns: "1fr auto", gap: "24px", alignItems: "center" } },
        h("div", { class: "stack", style: { "--gap": "6px" } },
          h("p", {}, h("span", { class: "tag" }, "Customer "), h("b", { style: { fontWeight: 500 } }, next.customer)),
          h("p", {}, h("span", { class: "tag" }, "Situation "), `${next.situation.split(". ")[0]}.`),
          h("p", {}, h("span", { class: "tag" }, "Skill "), skills[next.skill].name)),
        link(startHref, h("span", { class: "btn btn-lg" }, allDone ? "Replay this one " : p.done ? "Continue training " : "Start training ", arrow()))),
      h("p", { class: "muted", style: { marginTop: "14px", fontSize: "var(--fs-small)" } }, p.done ? `${p.done} of ${p.total} scenarios completed · ${p.practiced} of ${Object.keys(skills).length} skills practiced` : `${p.total} scenarios · on-premise and off-premise · ${Object.keys(skills).length} skills · 6 levels, from recognizing a pattern to leading a change.`),
    ),
    h("section", { class: "section reveal" },
      h("div", { class: "card", style: { padding: "clamp(28px,5vw,56px)", textAlign: "center" } },
        h("h2", { style: { fontSize: "var(--fs-h1)", maxWidth: "22ch", marginInline: "auto" } }, "Want to make more money? Get better at the decisions that make money."),
        h("p", { style: { marginTop: "18px", maxWidth: "48ch", marginInline: "auto", fontWeight: 500 } }, "Get sharper, more valuable, & get paid accordingly."),
        h("div", { style: { marginTop: "28px" } }, link(startHref, h("span", { class: "btn btn-lg" }, "Start practicing ", arrow()))))),
  );
}
