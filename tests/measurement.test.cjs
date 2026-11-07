const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const moduleUnderTest = { exports: {} };
new Function('module', 'exports', ts.transpileModule(fs.readFileSync('src/graph/measurement.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText)(moduleUnderTest, moduleUnderTest.exports);
const { summarize, createLayoutMeasurement, MAX_SAMPLES } = moduleUnderTest.exports;
test('percentiles use nearest rank, discard invalid values, and preserve real pauses', () => {
  assert.equal(summarize([]), null);
  assert.deepEqual(summarize([NaN, Infinity, -1]), null);
  assert.deepEqual(summarize([1, 4, 2, 3, 5000]), { count: 5, p50: 3, p95: 5000, max: 5000 });
  assert.deepEqual(summarize(Array.from({ length: 100 }, (_, i) => i + 1)), { count: 100, p50: 50, p95: 95, max: 100 });
});
test('only explicit measurements collect actual ticks; idle is absent rather than zero', () => {
  const probe = createLayoutMeasurement();
  probe.record(2, 1); assert.equal(probe.stop().batchesMs, null);
  probe.start(); probe.record(3, 0); assert.equal(probe.stop().batchesMs, null);
  probe.start(); probe.record(0.25, 1); probe.record(5, 240);
  assert.deepEqual(probe.stop(), { batchesMs: { count: 2, p50: 0.25, p95: 5, max: 5 }, ticks: 241, truncated: false });
  probe.record(500, 1);
  probe.start(); assert.equal(probe.stop().batchesMs, null);
});
test('long recordings have a bounded sample count and disclose truncation', () => {
  const probe = createLayoutMeasurement(); probe.start();
  for (let i = 0; i < MAX_SAMPLES + 2; i++) probe.record(1, 1);
  const result = probe.stop();
  assert.equal(result.batchesMs.count, MAX_SAMPLES); assert.equal(result.ticks, MAX_SAMPLES); assert.equal(result.truncated, true);
});
