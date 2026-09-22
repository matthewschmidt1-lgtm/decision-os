const fail = (m) => { throw new Error(m); };
const assert = (v, m = "assertion failed") => { if (!v) fail(m); };
assert.ok = assert;
assert.equal = (a, b, m) => { if (a !== b) fail(m || `expected ${JSON.stringify(a)} === ${JSON.stringify(b)}`); };
assert.strictEqual = assert.equal;
export default assert;
