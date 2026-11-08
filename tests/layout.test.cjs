const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
async function engine() {
  const source = ts.transpileModule(fs.readFileSync('src/graph/layout.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText.replace("'d3-force'", JSON.stringify(pathToFileURL(require.resolve('d3-force')).href));
  return (await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))).createLayout;
}
const graph = { nodes: {}, positions: { a: { x: 0, y: 0 }, b: { x: 600, y: 0 }, c: { x: 5000, y: 5000 } }, relations: [] };
const edge = { id: 'ab', sourceId: 'a', targetId: 'b' };
function settle(layout) {
  let count = 0;
  while (layout.active && count < 1000) { layout.tick(); count++; }
  assert.ok(count < 1000, 'must stop without a perpetual frame loop');
}
test('relations alter layout, settle and leave source data untouched', async () => {
  const create = await engine();
  const before = JSON.stringify(graph);
  const linked = create(graph, { ids: ['a', 'b'], edges: [edge] });
  const separate = create(graph, { ids: ['a', 'b'], edges: [] });
  settle(linked); settle(separate);
  const p = linked.positions(), q = separate.positions();
  assert.ok(Math.hypot(p.a.x - p.b.x, p.a.y - p.b.y) < Math.hypot(q.a.x - q.b.x, q.a.y - q.b.y));
  const stopped = linked.positions(); linked.tick();
  assert.deepEqual(linked.positions(), stopped);
  assert.equal(JSON.stringify(graph), before);
});
test('held node tracks the finger, neighbors follow, release settles', async () => {
  const create = await engine();
  const layout = create(graph, { ids: ['a', 'b'], edges: [edge] });
  settle(layout);
  const before = layout.positions();
  layout.hold('a', { x: 900, y: 400 });
  for (let i = 0; i < 60; i++) layout.tick();
  assert.deepEqual(layout.positions().a, { x: 900, y: 400 });
  assert.ok(Math.hypot(layout.positions().b.x - before.b.x, layout.positions().b.y - before.b.y) > 50);
  layout.release(); settle(layout);
  for (const p of Object.values(layout.positions())) assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
});
test('addition preserves current coordinates and seeds near retained neighbor', async () => {
  const create = await engine();
  const layout = create(graph, { ids: ['a', 'b'], edges: [edge] });
  settle(layout); const before = layout.positions();
  layout.update({ ids: ['a', 'b', 'c'], edges: [edge, { id: 'bc', sourceId: 'b', targetId: 'c' }] });
  const after = layout.positions();
  assert.deepEqual(after.a, before.a); assert.deepEqual(after.b, before.b);
  assert.ok(Math.hypot(after.c.x - before.b.x, after.c.y - before.b.y) < 150);
  layout.hold('c', after.c);
  layout.update({ ids: ['a', 'b'], edges: [edge] });
  settle(layout); assert.equal(layout.positions().c, undefined);
  layout.stop(); assert.equal(layout.active, false);
});

test('filtering to a neighborhood removes old endpoints before relinking', async () => {
  const create = await engine();
  const layout = create(graph, { ids: ['a', 'b'], edges: [edge] });
  settle(layout);
  layout.update({ ids: ['a'], edges: [] });
  settle(layout);
  assert.deepEqual(Object.keys(layout.positions()), ['a']);
});

test('500-node layout stays finite, retains positions on addition and cools', async () => {
  const create = await engine();
  const ids = Array.from({length: 500}, (_, i) => `n${i}`);
  const edges = ids.slice(1).map((id, i) => ({id: `e${i}`, sourceId: ids[i], targetId: id}));
  const large = {nodes: {}, positions: {}, relations: edges};
  const layout = create(large, {ids: ids.slice(0, 100), edges: edges.slice(0, 99)});
  settle(layout);
  const before = layout.positions();
  layout.update({ids, edges});
  for (const id of ids.slice(0, 100)) assert.deepEqual(layout.positions()[id], before[id]);
  settle(layout);
  layout.hold(ids[250], {x: 140, y: 180});
  for (let i = 0; i < 5; i++) layout.tick();
  assert.deepEqual(layout.positions()[ids[250]], {x: 140, y: 180});
  layout.release(); settle(layout);
  for (const p of Object.values(layout.positions())) assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
});
