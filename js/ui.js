// Small DOM helpers. No framework, no build step.
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k === "dataset") Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  append(el, children);
  return el;
}
export function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}
export const svgNS = "http://www.w3.org/2000/svg";
export function s(tag, attrs = {}, ...children) {
  const el = document.createElementNS(svgNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  append(el, children);
  return el;
}

export const arrow = () => h("span", { class: "arrow", "aria-hidden": "true" }, "→");
export const link = (href, ...c) => h("a", { href, "data-link": "" }, ...c);
export const button = (label, onClick, cls = "btn") => h("button", { class: cls, type: "button", onClick }, label);
export const eyebrow = (t) => h("p", { class: "eyebrow" }, t);

export function toneFor(v, invertKey) {
  if (typeof v !== "number") return "";
  if (v === 0) return "flat";
  const good = invertKey ? v < 0 : v > 0;
  return good ? "good" : "bad";
}
export function deltaText(v) {
  if (typeof v !== "number") return String(v);
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v)}%`;
}
export function metric(label, value, tone) {
  let cls = "v";
  const invert = /spend|inventory|cost/i.test(label);
  const t = tone || toneFor(value, invert);
  if (typeof value === "number") cls += ` delta ${value > 0 ? "up" : value < 0 ? "down" : "flat"} ${t}`;
  else if (t) cls += ` ${t}`;
  return h("div", { class: "metric" }, h("span", { class: "k" }, label), h("span", { class: cls }, deltaText(value)));
}
export function metrics(rows) { return h("div", { class: "metrics" }, rows.map(r => metric(...r))); }

export function bar(label, value, max, opts = {}) {
  const w = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = h("div", { class: `bar-fill ${opts.tone || ""}`, style: { width: "0%" } });
  requestAnimationFrame(() => requestAnimationFrame(() => (fill.style.width = `${w}%`)));
  const row = h("div", { class: "bar-row" }, h("span", { class: "label" }, label), h("div", { class: "bar-track", role: "img", "aria-label": `${label}: ${opts.format ? opts.format(value) : value}` }, fill), h("span", { class: "val num" }, opts.format ? opts.format(value) : value));
  row.update = (v) => { fill.style.width = `${Math.max(0, Math.min(100, (v / max) * 100))}%`; row.querySelector(".val").textContent = opts.format ? opts.format(v) : v; row.querySelector(".bar-track").setAttribute("aria-label", `${label}: ${opts.format ? opts.format(v) : v}`); };
  return row;
}

export function slider({ label, min, max, step = 1, value, format = (v) => v, onInput }) {
  const out = h("output", {}, format(value));
  const input = h("input", { type: "range", min, max, step, value, "aria-label": label });
  input.addEventListener("input", () => { out.textContent = format(+input.value); onInput?.(+input.value); });
  const wrap = h("div", { class: "control" }, h("div", { class: "control-head" }, h("span", {}, label), out), input);
  wrap.set = (v) => { input.value = v; out.textContent = format(v); };
  return wrap;
}

export function segmented(options, value, onChange) {
  const wrap = h("div", { class: "seg", role: "group" });
  const render = (val) => {
    wrap.replaceChildren(...options.map(o => h("button", { type: "button", "aria-pressed": String(o.value === val), onClick: () => { render(o.value); onChange(o.value); } }, o.label)));
  };
  render(value);
  return wrap;
}

export function disclose(title, body, open = false) {
  return h("details", { class: "disclose", open }, h("summary", {}, h("span", {}, title), h("span", { class: "plus", "aria-hidden": "true" }, "+")), h("div", { class: "disclose-body" }, body));
}

export function says(text, tone = "") {
  const el = h("p", { class: `says ${tone}`, role: "status" }, text);
  el.set = (t, tn = "") => { el.textContent = t; el.className = `says ${tn}`; };
  return el;
}

// Animate a number in a text node
export function tween(el, from, to, format, dur = 500) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = format(to); return; }
  const t0 = performance.now();
  const step = (t) => { const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 3); el.textContent = format(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

// Scroll-reveal
let io;
export function observeReveals(root = document) {
  io ??= new IntersectionObserver((entries) => { for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  const vh = innerHeight;
  root.querySelectorAll(".reveal:not(.in)").forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i, 6) * 40}ms`;
    if (el.getBoundingClientRect().top < vh * 0.92) requestAnimationFrame(() => el.classList.add("in")); else io.observe(el);
  });
}

let toastEl, toastTimer;
export function toast(msg) {
  toastEl ??= document.body.appendChild(h("div", { class: "toast", role: "status" }));
  toastEl.textContent = msg; toastEl.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
}
