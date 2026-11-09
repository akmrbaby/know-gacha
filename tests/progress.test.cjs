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
const { emptyProgress, localDate, openForDate, restoreProgress, allowance } = load('src/state/progress.ts');
test('local calendar date handles month/year rollover without UTC conversion', () => {
  assert.equal(localDate(new Date(2026, 11, 31, 23, 59), 1), '2027-01-01');
  assert.equal(localDate(new Date(2026, 0, 1, 0, 1)), '2026-01-01');
});
test('initial ten draws consume one daily then nine welcome grants and survive restore', () => {
  let state = emptyProgress();
  assert.equal(allowance(state, '2026-11-09').total, 10);
  for(let i=0;i<10;i++) {
    state = restoreProgress(JSON.stringify(openForDate(state,'2026-11-09',()=>0)));
    assert.equal(state.openings.length,i+1);
    assert.equal(allowance(state,'2026-11-09').total,9-i);
  }
  assert.equal(new Set(state.openings.map(item=>item.keywordId)).size,10);
  assert.equal(state.openings[0].grant,'daily');
  assert.equal(state.openings.filter(item=>item.grant==='welcome').length,9);
  assert.equal(openForDate(state,'2026-11-09'),state);
  assert.equal(openForDate(state,'2026-11-10'),state,'content exhaustion does not consume a grant');
});
test('future two-welcome configuration starts with three; daily refresh does not refill welcome', () => {
  let state=emptyProgress(2);
  assert.deepEqual(allowance(state,'2026-11-09'),{daily:1,bonus:2,total:3});
  for(let i=0;i<3;i++) state=openForDate(state,'2026-11-09',()=>0);
  assert.equal(openForDate(state,'2026-11-09'),state);
  assert.deepEqual(allowance(state,'2026-11-10'),{daily:1,bonus:0,total:1});
  state=openForDate(state,'2026-11-10',()=>0);
  assert.equal(state.openings.length,4);
  assert.equal(restoreProgress(JSON.stringify(state)).initialBonus,2);
});
test('legacy migration preserves history and rejects duplicated daily use and overspent bonus', () => {
 const legacy={version:1,dayOffset:2,openings:[{keywordId:'ethnography',date:'2026-11-08',openedAt:'2026-11-08T12:00:00Z'}]};
 const migrated=restoreProgress(JSON.stringify(legacy));
 assert.equal(migrated.version,2); assert.equal(migrated.dayOffset,2);
 assert.equal(migrated.openings[0].keywordId,'ethnography');
 assert.deepEqual(allowance(migrated,'2026-11-08'),{daily:0,bonus:9,total:9});
 const state=openForDate(migrated,'2026-11-08',()=>0);
 assert.equal(restoreProgress(JSON.stringify(state)).openings.length,2);
 assert.throws(()=>restoreProgress(JSON.stringify({...state,initialBonus:0})));
 assert.throws(()=>restoreProgress(JSON.stringify({...state,openings:state.openings.map(item=>({...item,grant:'daily'}))})));
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
const { positions, relatedConcepts, relations, ownerOf } = load('src/data/graph.ts');
const { baseGraph } = load('src/knowledge/base.ts');
const { graphForAcquired } = load('src/knowledge/model.ts');
const visibleGraph = (ids) => graphForAcquired(baseGraph, ids);
test('the atlas reveals only opened clusters, with no daily unlock for related concepts', () => {
  assert.deepEqual(visibleGraph([]), { ids: [], edges: [] });
  const one = visibleGraph([keywords[0].id]);
  assert.equal(one.ids.length, 4);
  assert.equal(one.edges.length, 3);
  assert.ok(!one.ids.includes(keywords[1].id));
  const all = visibleGraph(keywords.map((word) => word.id));
  assert.equal(all.ids.length, 17);
  assert.equal(all.edges.length, 18);
  const state = openForDate(emptyProgress(), '2026-11-07', () => 0);
  visibleGraph(state.openings.map((item) => item.keywordId));
  assert.equal(restoreProgress(JSON.stringify(state)).openings.length, 1);
});
test('every edge has valid directed endpoints, a distinct id, and finite fixed coordinates', () => {
  const nodes = [...keywords, ...relatedConcepts];
  const ids = new Set(nodes.map((node) => node.id));
  assert.equal(ids.size, 17);
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
const { fitCamera, focusCamera, zoomAt, MIN_SCALE, MAX_SCALE } = load('src/graph/camera.ts');
const { availability } = load('src/graph/availability.ts');
test('zoom preserves the world point under the fingers, including scale limits', () => {
  const camera = { x: -140, y: 70, scale: 0.8 };
  for (const requested of [0.001, 1.6, 100]) {
    const next = zoomAt(camera, 120, 230, requested);
    assert.ok(next.scale >= MIN_SCALE && next.scale <= MAX_SCALE);
    assert.ok(Math.abs((120 - next.x) / next.scale - (120 - camera.x) / camera.scale) < 1e-9);
    assert.ok(Math.abs((230 - next.y) / next.scale - (230 - camera.y) / camera.scale) < 1e-9);
  }
});
test('fit includes all visible node centers and focus leaves the collapsed sheet clear', () => {
  for (const [width, height] of [[320, 480], [390, 700], [700, 320]]) {
    const ids = visibleGraph(keywords.map((word) => word.id)).ids;
    const camera = fitCamera(ids, width, height);
    for (const id of ids) {
      const x = positions[id].x * camera.scale + camera.x;
      const y = positions[id].y * camera.scale + camera.y;
      assert.ok(x > 0 && x < width && y > 0 && y < height);
      const focused = focusCamera(id, width, height);
      const fy = positions[id].y * focused.scale + focused.y;
      assert.ok(fy >= 100 && fy < height - Math.min(265, height * 0.4));
    }
    const edge = relations[0], focused = focusCamera(edge.id, width, height);
    const midpoint = (positions[edge.sourceId].x + positions[edge.targetId].x) / 2;
    assert.ok(Math.abs(midpoint * focused.scale + focused.x - width / 2) < 1e-9);
  }
});
test('Gacha remaining count agrees with saved grants and exhausted content',()=>{
 let state=emptyProgress();
 for(let i=0;i<10;i++) {
  assert.equal(availability(state,'2026-11-09').remaining,10-i);
  state=restoreProgress(JSON.stringify(openForDate(state,'2026-11-09',()=>0)));
 }
 assert.equal(availability(state,'2026-11-09').exhausted,true);
 assert.equal(availability(state,'2026-11-10').remaining,0);
 assert.equal(availability(state,'2026-11-09').today.keywordId,state.openings.at(-1).keywordId);
});
