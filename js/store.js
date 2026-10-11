// Tiny persistence layer: remembers which decisions you reviewed and what you chose. Per-browser, never leaves the device.
const KEY = "decision-os:v1";
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
function write(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode: page still works */ } }
export function getChoice(decisionId) { return read().choices?.[decisionId] || null; }
export function setChoice(decisionId, option) { const s = read(); s.choices = { ...(s.choices || {}), [decisionId]: { option, at: Date.now() } }; write(s); }
export function reviewed() { return Object.keys(read().choices || {}); }
export function clearAll() { write({}); }

// Practice progress
export function recordResult(scenarioId, { option, quality, skill }) { const s = read(); s.results = { ...(s.results || {}), [scenarioId]: { option, quality, skill, at: Date.now() } }; write(s); }
export function getResult(scenarioId) { return read().results?.[scenarioId] || null; }
export function allResults() { return read().results || {}; }

// Module 2 (Conversation) progress: kept apart from Module 1 so neither module's counts or scores include the other.
export function recordResult2(scenarioId, { option, quality, skill, pattern, strength }) { const s = read(); s.results2 = { ...(s.results2 || {}), [scenarioId]: { option, quality, skill, pattern: pattern || null, strength: strength || null, at: Date.now() } }; write(s); }
export function getResult2(scenarioId) { return read().results2?.[scenarioId] || null; }
export function allResults2() { return read().results2 || {}; }
// A replay never changes the first try; it records the best later attempt and how many times the case was played.
export function recordReplay2(scenarioId, quality) {
  const s = read(); const r = s.results2?.[scenarioId]; if (!r) return;
  const rank = { weak: 0, good: 1, best: 2 }; r.attempts = (r.attempts || 1) + 1;
  if (!r.replay || rank[quality] > rank[r.replay]) r.replay = quality;
  write(s);
}
export function getSell(key) { return read().sell2?.[key]; }
export function setSell(key, value) { const s = read(); s.sell2 = { ...(s.sell2 || {}), [key]: value }; write(s); }
