const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');
const cache = new Map();
function load(file) {
  const filename = path.resolve(file);
  if (cache.has(filename)) return cache.get(filename).exports;
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} }; cache.set(filename, module);
  new Function('require', 'module', 'exports', source)((id) => load(path.resolve(path.dirname(filename), id + '.ts')), module, module.exports);
  return module.exports;
}
const { demoGraph, demoOrder, demoView } = load('src/knowledge/demo.ts');
const { graphForAcquired, graphCounts, neighborhood } = load('src/knowledge/model.ts');
const { fitCamera, WORLD_CENTER, WORLD_SIZE } = load('src/graph/camera.ts');
const { baseGraph } = load('src/knowledge/base.ts');
const { visibleLabels } = load('src/graph/labels.ts');

test('screen label collisions preserve priority, account for measured large text, and cull offscreen labels', () => {
  const box = (id, x, y, width = 80, height = 24) => ({ id, x, y, width, height });
  assert.deepEqual(visibleLabels([box('selected', 30, 30), box('neighbor', 50, 40), box('other', 200, 30), box('offscreen', 500, 30)], 390, 844), { selected: true, other: true });
  assert.deepEqual(visibleLabels([box('large-text', 30, 30, 180, 90), box('below', 30, 100), box('clear', 30, 130)], 390, 844), { 'large-text': true, clear: true });
  assert.deepEqual(visibleLabels([box('partly-visible', -20, -10), box('outside', -200, 30)], 390, 844), { 'partly-visible': true });
});

test('normal Map joins acquired photography knowledge without exposing unopened knowledge', () => {
  const first = graphForAcquired(baseGraph, ['ethnography']);
  assert.ok(first.ids.includes('photography'),'retired topic is now available as a peripheral concept');
  assert.ok(!first.ids.includes('surrealism'));
  assert.ok(!first.edges.some(edge => edge.sourceId === 'surrealism'));
  const second = graphForAcquired(baseGraph, ['ethnography', 'surrealism', 'photography']);
  assert.equal(second.ids.filter(id => id === 'photography').length, 1);
  for (const id of ['ethnography', 'surrealism']) {
    const edge = second.edges.find(edge => edge.sourceId === id && edge.targetId === 'photography');
    assert.ok(edge && edge.evidence.length && edge.explanation);
  }
  assert.deepEqual(baseGraph.positions.photography, { x: 0, y: 40 });
  assert.equal(new Set(Object.values(baseGraph.positions).map(p => `${p.x},${p.y}`)).size, Object.keys(baseGraph.positions).length);
});

test('all fixture sizes are nested, have valid unique identities and deterministic coordinates', () => {
  assert.equal(new Set(demoOrder).size, 500);
  assert.equal(new Set(demoGraph.relations.map((edge) => edge.id)).size, demoGraph.relations.length);
  let previous = [];
  for (const count of [5, 6, 7, 8, 9, 10, 50, 100, 500]) {
    const view = demoView(count), counts = graphCounts(demoGraph, view);
    assert.equal(counts.acquired, count);
    assert.equal(counts.concepts, view.ids.length - count);
    assert.equal(counts.relations, view.edges.length);
    assert.ok(previous.every((id) => view.ids.includes(id)));
    previous = view.ids;
    for (const id of view.ids) {
      const node = demoGraph.nodes[id], p = demoGraph.positions[id];
      assert.ok(node && Number.isFinite(p.x) && Number.isFinite(p.y));
      assert.ok(Math.abs(p.x) < WORLD_CENTER && Math.abs(p.y) < WORLD_SIZE - WORLD_CENTER);
      if (node.provenance === 'sourced') assert.ok(node.evidence.length > 0);
      else assert.match(node.summary, /架空/);
    }
    for (const edge of view.edges) {
      assert.ok(view.ids.includes(edge.sourceId) && view.ids.includes(edge.targetId));
      assert.notEqual(edge.sourceId, edge.targetId);
      assert.ok(edge.type && edge.explanation && edge.label);
      if (edge.provenance === 'sourced') assert.ok(edge.evidence.length > 0);
      else assert.match(edge.explanation, /事実関係を表しません/);
    }
    // All node centers fit on a small portrait screen and landscape screen.
    for (const [width, height] of [[320, 480], [700, 320]]) {
      const camera = fitCamera(view.ids, width, height, demoGraph);
      for (const id of view.ids) {
        const p = demoGraph.positions[id];
        assert.ok(p.x * camera.scale + camera.x >= 0 && p.x * camera.scale + camera.x <= width);
        assert.ok(p.y * camera.scale + camera.y >= 0 && p.y * camera.scale + camera.y <= height);
      }
    }
  }
});
test('shared peripheral concepts bridge disciplines without duplicated nodes', () => {
  const ten = demoView(10);
  assert.equal(ten.ids.filter(id=>id==='photography').length,1);
  for(const id of ['ethnography','surrealism'])assert.ok(ten.edges.some(e=>e.sourceId===id&&e.targetId==='photography'));
  assert.equal(ten.ids.filter(id=>id==='perception-action').length,1);
  assert.ok(ten.edges.filter(e=>e.targetId==='perception-action').length>=3);
});
test('visibility never exposes unacquired knowledge relationships or links between two unacquired concepts', () => {
  assert.deepEqual(graphForAcquired(demoGraph, ['unknown']), { ids: [], edges: [] });
  for (let count = 5; count <= 10; count++) {
    const acquired = new Set(demoOrder.slice(0, count));
    const view = demoView(count);
    for (const id of view.ids) if (demoGraph.nodes[id].kind === 'knowledge') assert.ok(acquired.has(id));
    for (const edge of view.edges) {
      const a = demoGraph.nodes[edge.sourceId], b = demoGraph.nodes[edge.targetId];
      assert.ok(acquired.has(a.id) || acquired.has(b.id));
      if (a.kind === 'knowledge') assert.ok(acquired.has(a.id));
      if (b.kind === 'knowledge') assert.ok(acquired.has(b.id));
    }
  }
  const isolated = { ...demoGraph, relations: [] };
  assert.deepEqual(graphForAcquired(isolated, ['ccd']).ids, ['ccd']);
});
test('neighborhood is restricted to the currently disclosed graph, including edge selection', () => {
  const view = demoView(6);
  for (const selected of ['light', view.edges[0].id]) {
    const nearby = neighborhood(view, selected);
    assert.ok(nearby.ids.length < view.ids.length);
    assert.ok(nearby.ids.every((id) => view.ids.includes(id)));
    assert.ok(nearby.edges.every((edge) => view.edges.includes(edge)));
  }
});
test('demo transitions are independent of the persisted acquisition ledger', () => {
  const { emptyProgress, openForDate, restoreProgress } = load('src/state/progress.ts');
  const state = openForDate(emptyProgress(), '2026-11-07', () => 0);
  const saved = JSON.stringify(state);
  Object.freeze(state.openings); Object.freeze(state);
  for (const count of [5, 6, 7, 8, 9, 10, 50, 100, 500, 5]) demoView(count);
  assert.equal(JSON.stringify(state), saved);
  assert.deepEqual(restoreProgress(saved), state);
  assert.equal(demoOrder.slice(0, 10).filter((id) => demoGraph.nodes[id].provenance === 'sourced').length, 10);
  assert.equal(demoOrder.filter((id) => demoGraph.nodes[id].provenance === 'fixture').length, 470);
  for (const count of [0, 4, 501, 5.5, NaN]) assert.throws(() => demoView(count));
});
