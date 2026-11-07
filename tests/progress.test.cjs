const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');
// Pure TypeScript logic only: no native runtime or additional test dependency.
function load(file) {
  const filename = path.resolve(file);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', source)((id) => load(path.resolve(path.dirname(filename), id + '.ts')), module, module.exports);
  return module.exports;
}
const { emptyProgress, localDate, openForDate, restoreProgress } = load('src/state/progress.ts');
test('local calendar date handles month/year rollover without UTC conversion', () => {
  assert.equal(localDate(new Date(2026, 11, 31, 23, 59), 1), '2027-01-01');
  assert.equal(localDate(new Date(2026, 0, 1, 0, 1)), '2026-01-01');
});
test('same day is stable after serialization; another day selects an unopened word', () => {
  const first = openForDate(emptyProgress(), '2026-11-07', () => 0);
  const restored = restoreProgress(JSON.stringify(first));
  assert.deepEqual(openForDate(restored, '2026-11-07', () => 0.99), first);
  const second = openForDate(restored, '2026-11-08', () => 0);
  assert.equal(second.openings.length, 2);
  assert.notEqual(second.openings[0].keywordId, second.openings[1].keywordId);
});
test('three words exhaust the pool, and revisiting an older date keeps its word', () => {
  let state = emptyProgress();
  for (let day = 7; day <= 9; day++) state = openForDate(state, `2026-11-0${day}`, () => 0.99);
  assert.equal(new Set(state.openings.map((item) => item.keywordId)).size, 3);
  assert.equal(openForDate(state, '2026-11-10'), state);
  assert.equal(openForDate(state, '2026-11-07'), state);
});
test('restoration preserves day offset and rejects corrupt/duplicate records', () => {
  assert.deepEqual(restoreProgress(null), emptyProgress());
  assert.equal(restoreProgress(JSON.stringify({ ...emptyProgress(), dayOffset: 2 })).dayOffset, 2);
  assert.throws(() => restoreProgress('{'));
  assert.throws(() => restoreProgress('{"version":2}'));
  const state = openForDate(emptyProgress(), '2026-11-07', () => 0);
  state.openings.push(state.openings[0]);
  assert.throws(() => restoreProgress(JSON.stringify(state)));
});
const { keywords } = load('src/data/keywords.ts');
const { positions, relatedConcepts, relations, visibleGraph, ownerOf } = load('src/data/graph.ts');
test('the atlas reveals only opened clusters, with no daily unlock for related concepts', () => {
  assert.deepEqual(visibleGraph([]), { ids: [], edges: [] });
  const one = visibleGraph([keywords[0].id]);
  assert.equal(one.ids.length, 3);
  assert.equal(one.edges.length, 2);
  assert.ok(!one.ids.includes(keywords[1].id));
  const all = visibleGraph(keywords.map((word) => word.id));
  assert.equal(all.ids.length, 9);
  assert.equal(all.edges.length, 6);
  const state = openForDate(emptyProgress(), '2026-11-07', () => 0);
  visibleGraph(state.openings.map((item) => item.keywordId));
  assert.equal(restoreProgress(JSON.stringify(state)).openings.length, 1);
});
test('every edge has valid directed endpoints, a distinct id, and finite fixed coordinates', () => {
  const nodes = [...keywords, ...relatedConcepts];
  const ids = new Set(nodes.map((node) => node.id));
  assert.equal(ids.size, 9);
  assert.equal(new Set(relations.map((edge) => edge.id)).size, relations.length);
  for (const edge of relations) {
    assert.ok(ids.has(edge.sourceId) && ids.has(edge.targetId));
    assert.notEqual(edge.sourceId, edge.targetId);
    assert.ok(keywords.some((word) => word.id === edge.ownerId));
    assert.ok(edge.label && edge.explanation);
  }
  for (const id of ids) {
    assert.ok(Number.isFinite(positions[id].x) && Number.isFinite(positions[id].y));
    assert.ok(keywords.some((word) => word.id === ownerOf(id)));
  }
});
