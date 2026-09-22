// Browser shim for node:test so tests/models.test.mjs runs in tests/run.html via an import map.
const results = [];
export function test(name, fn) {
  try { fn(); results.push({ name, ok: true }); } catch (e) { results.push({ name, ok: false, err: String(e?.message || e) }); }
  window.__results = results; document.dispatchEvent(new CustomEvent("test"));
}
