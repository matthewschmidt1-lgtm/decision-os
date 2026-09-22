import { s, h } from "./ui.js";

// Generic line chart with optional marker. series: [{pts:[[x,y]], cls}] xs/ys domain auto.
export function lineChart({ width = 560, height = 260, series, marker, xLabel, yLabel, zeroLine = false, annotate }) {
  const pad = { l: 44, r: 20, t: 20, b: 40 };
  const all = series.flatMap(sr => sr.pts);
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  if (zeroLine) { y0 = Math.min(0, y0); y1 = Math.max(0, y1); }
  const pady = (y1 - y0) * 0.1 || 1; y0 -= pady; y1 += pady;
  const X = x => pad.l + ((x - x0) / (x1 - x0 || 1)) * (width - pad.l - pad.r);
  const Y = y => height - pad.b - ((y - y0) / (y1 - y0 || 1)) * (height - pad.t - pad.b);
  const svg = s("svg", { class: "chart", viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": annotate?.aria || `${yLabel} against ${xLabel}` });
  svg.append(s("line", { class: "axis", x1: pad.l, y1: height - pad.b, x2: width - pad.r, y2: height - pad.b }));
  svg.append(s("line", { class: "axis", x1: pad.l, y1: pad.t, x2: pad.l, y2: height - pad.b }));
  if (zeroLine && y0 < 0) svg.append(s("line", { class: "grid", x1: pad.l, y1: Y(0), x2: width - pad.r, y2: Y(0) }));
  for (const sr of series) svg.append(s("path", { class: `curve ${sr.cls || ""}`, d: sr.pts.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(" ") }));
  svg.append(s("text", { x: width - pad.r, y: height - 10, "text-anchor": "end" }, xLabel));
  svg.append(s("text", { x: pad.l, y: 12 }, yLabel));
  const dot = s("circle", { class: "dot", r: 6, cx: X(marker?.[0] ?? x0), cy: Y(marker?.[1] ?? y0), style: "transition: cx .4s cubic-bezier(.22,1,.36,1), cy .4s cubic-bezier(.22,1,.36,1)" });
  const lbl = s("text", { class: "lbl mono", "text-anchor": "middle" }, "");
  if (marker) { svg.append(dot, lbl); }
  svg.setMarker = (x, y, text) => { dot.setAttribute("cx", X(x)); dot.setAttribute("cy", Y(y)); lbl.setAttribute("x", X(x)); lbl.setAttribute("y", Y(y) - 14); lbl.textContent = text ?? ""; };
  if (marker) svg.setMarker(marker[0], marker[1], marker[2]);
  return svg;
}

// Animated horizontal comparison: before/after bars for a set of measures
export function beforeAfter(items) {
  // items: [{label, before, after, max, format, invert}]
  const wrap = h("div", { class: "stack", style: { "--gap": "18px" } });
  for (const it of items) {
    const w = v => `${Math.max(2, Math.min(100, (v / it.max) * 100))}%`;
    const fillB = h("div", { class: "bar-fill muted", style: { width: w(it.before) } });
    const fillA = h("div", { class: "bar-fill", style: { width: w(it.before) } });
    const val = h("span", { class: "val num" }, it.format(it.before));
    const row = h("div", {}, h("div", { class: "control-head" }, h("span", {}, it.label), val),
      h("div", { class: "bar-track", style: { marginTop: "6px" } }, fillB),
      h("div", { class: "bar-track", style: { marginTop: "4px" } }, fillA));
    requestAnimationFrame(() => requestAnimationFrame(() => { fillA.style.width = w(it.after); val.textContent = it.format(it.after); fillA.className = `bar-fill ${(it.invert ? it.after < it.before : it.after > it.before) ? "good" : it.after === it.before ? "" : "bad"}`; }));
    row.update = (after) => { fillA.style.width = w(after); val.textContent = it.format(after); fillA.className = `bar-fill ${(it.invert ? after < it.before : after > it.before) ? "good" : after === it.before ? "" : "bad"}`; };
    wrap.append(row);
    it.row = row;
  }
  wrap.update = (vals) => items.forEach((it, i) => it.row.update(vals[i]));
  return wrap;
}
