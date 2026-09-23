import { observeReveals } from "./ui.js";
import { initPalette } from "./palette.js";
import { closeModal } from "./modal.js";

const routes = [
  { path: /^\/$/, load: () => import("./pages/home.js") },
  { path: /^\/practice\/?$/, load: () => import("./pages/practice.js") },
  { path: /^\/practice\/summary$/, load: () => import("./pages/scenario.js").then(m => ({ default: m.Summary })) },
  { path: /^\/practice\/([\w-]+)$/, load: () => import("./pages/scenario.js") },
  { path: /^\/decisions\/?$/, load: () => import("./pages/decisions.js") },
  { path: /^\/decisions\/([\w-]+)$/, load: () => import("./pages/decision.js") },
  { path: /^\/portfolio\/?$/, load: () => import("./pages/portfolio.js") },
  { path: /^\/accounts\/?$/, load: () => import("./pages/accounts.js") },
  { path: /^\/accounts\/([\w-]+)$/, load: () => import("./pages/account.js") },
  { path: /^\/learn\/?$/, load: () => import("./pages/learn.js") },
  { path: /^\/learn\/([\w-]+)$/, load: () => import("./pages/lesson.js") },
  { path: /^\/about\/?$/, load: () => import("./pages/about.js") },
];

const main = document.getElementById("main");
const topbar = document.getElementById("topbar");

export function navigate(href, { replace = false } = {}) {
  const url = new URL(href, location.origin);
  if (url.origin !== location.origin) { location.href = href; return; }
  history[replace ? "replaceState" : "pushState"]({}, "", url.pathname + url.search + url.hash);
  render();
}

export function setMeta({ title, description }) {
  document.title = title ? `${title} — Decision OS` : "Decision OS — What should I do next?";
  const d = document.querySelector('meta[name="description"]');
  if (description && d) d.setAttribute("content", description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", document.title);
  if (description) document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
  const url = location.origin + location.pathname;
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", url);
  document.querySelector('meta[name="robots"]')?.remove();
}
export function setNoIndex() {
  const m = document.createElement("meta"); m.name = "robots"; m.content = "noindex"; document.head.append(m);
}

async function render() {
  closeModal();
  const { pathname, hash } = location;
  const params = new URLSearchParams(location.search);
  const route = routes.find(r => r.path.test(pathname));
  const match = route ? pathname.match(route.path) : null;
  let mod;
  try { mod = route ? await route.load() : await import("./pages/notfound.js"); }
  catch (err) { console.error(err); mod = await import("./pages/notfound.js"); }
  let view;
  try { view = await mod.default({ params, id: match?.[1], navigate }); }
  catch (err) { console.error(err); view = (await import("./pages/notfound.js")).default(); }
  main.classList.remove("enter");
  main.replaceChildren(view);
  void main.offsetWidth; // restart transition
  main.classList.add("enter");
  document.querySelectorAll(".nav a").forEach(a => {
    const href = a.getAttribute("href");
    a.toggleAttribute("aria-current", pathname === href || (href !== "/" && pathname.startsWith(href)));
    if (a.hasAttribute("aria-current")) a.setAttribute("aria-current", "page");
  });
  observeReveals(main);
  if (hash) { const t = document.getElementById(hash.slice(1)); t ? t.scrollIntoView({ block: "start" }) : scrollTo(0, 0); }
  else scrollTo({ top: 0, behavior: "instant" });
  main.focus({ preventScroll: true });
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-link], a[href^='/']");
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;
  const href = a.getAttribute("href");
  if (!href || href.startsWith("http") || href.startsWith("mailto")) return;
  e.preventDefault();
  navigate(href);
});
addEventListener("popstate", render);
addEventListener("scroll", () => topbar.classList.toggle("scrolled", scrollY > 8), { passive: true });

initPalette();
render();
