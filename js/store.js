// Tiny persistence layer: remembers which decisions you reviewed and what you chose. Per-browser, never leaves the device.
const KEY = "decision-os:v1";
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
function write(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode: page still works */ } }
export function getChoice(decisionId) { return read().choices?.[decisionId] || null; }
export function setChoice(decisionId, option) { const s = read(); s.choices = { ...(s.choices || {}), [decisionId]: { option, at: Date.now() } }; write(s); }
export function reviewed() { return Object.keys(read().choices || {}); }
export function clearAll() { write({}); }
