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
export function recordResult2(scenarioId, { option, quality, skill, pattern }) { const s = read(); s.results2 = { ...(s.results2 || {}), [scenarioId]: { option, quality, skill, pattern: pattern || null, at: Date.now() } }; write(s); }
export function getResult2(scenarioId) { return read().results2?.[scenarioId] || null; }
export function allResults2() { return read().results2 || {}; }
