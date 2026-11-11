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
  let state = emptyProgress(9,'2026-11-09');
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
  assert.equal(openForDate(state,'2026-11-10',()=>0).openings.length,11,'new day adds one draw while content remains');
});
test('future two-welcome configuration starts with three; daily refresh does not refill welcome', () => {
  let state=emptyProgress(2,'2026-11-09');
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
 assert.equal(migrated.version,3); assert.equal(migrated.dayOffset,2);
 assert.equal(migrated.openings[0].keywordId,'ethnography');
 assert.deepEqual(allowance(migrated,'2026-11-08'),{daily:0,bonus:9,total:9});
 const state=openForDate(migrated,'2026-11-08',()=>0);
 assert.equal(restoreProgress(JSON.stringify(state)).openings.length,2);
 assert.throws(()=>restoreProgress(JSON.stringify({...state,initialBonus:0})));
 assert.throws(()=>restoreProgress(JSON.stringify({...state,openings:state.openings.map(item=>({...item,grant:'daily'}))})));
});
test('restoration preserves day offset and rejects corrupt/duplicate records', () => {
  assert.deepEqual(restoreProgress(null), emptyProgress(9,localDate()));
  assert.equal(restoreProgress(JSON.stringify({ ...emptyProgress(9,'2026-11-07'), dayOffset: 2 })).dayOffset, 2);
  assert.throws(() => restoreProgress('{'));
  assert.throws(() => restoreProgress('{"version":2}'));
  const state = openForDate(emptyProgress(9,'2026-11-07'), '2026-11-07', () => 0);
  state.openings.push(state.openings[0]);
  assert.throws(() => restoreProgress(JSON.stringify(state)));
});
const { keywords, allKeywords, legacyKeywords } = load('src/data/keywords.ts');
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
  const all = visibleGraph(allKeywords.map((word) => word.id));
  assert.equal(all.ids.length, Object.keys(baseGraph.nodes).length);
  assert.equal(all.edges.length, baseGraph.relations.length);
  const state = openForDate(emptyProgress(9,'2026-11-07'), '2026-11-07', () => 0);
  visibleGraph(state.openings.map((item) => item.keywordId));
  assert.equal(restoreProgress(JSON.stringify(state)).openings.length, 1);
});
test('every edge has valid directed endpoints, a distinct id, and finite fixed coordinates', () => {
  const nodes = Object.values(baseGraph.nodes);
  const ids = new Set(nodes.map((node) => node.id));
  assert.equal(ids.size, Object.keys(baseGraph.nodes).length);
  assert.equal(new Set(relations.map((edge) => edge.id)).size, relations.length);
  for (const edge of relations) {
    assert.ok(ids.has(edge.sourceId) && ids.has(edge.targetId));
    assert.notEqual(edge.sourceId, edge.targetId);
    assert.ok(!!baseGraph.nodes[edge.ownerId]);
    assert.ok(edge.label && edge.explanation);
  }
  for (const id of ids) {
    assert.ok(Number.isFinite(positions[id].x) && Number.isFinite(positions[id].y));
    assert.ok(!!baseGraph.nodes[ownerOf(id)]);
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
 let state=emptyProgress(9,'2026-11-09');
 for(let i=0;i<10;i++) {
  assert.equal(availability(state,'2026-11-09').remaining,10-i);
  state=restoreProgress(JSON.stringify(openForDate(state,'2026-11-09',()=>0)));
 }
 assert.equal(availability(state,'2026-11-09').exhausted,false);
 assert.equal(availability(state,'2026-11-10').remaining,1);
 assert.equal(availability(state,'2026-11-09').today.keywordId,state.openings.at(-1).keywordId);
});

test('curated pool contains 30 substantial articles; retired IDs remain readable',()=>{
 assert.equal(keywords.length,30);
 assert.equal(new Set(allKeywords.map(word=>word.id)).size,34);
 assert.deepEqual(legacyKeywords.map(word=>word.id).sort(),['collage','optical-fiber','photography','user-research']);
 for(const word of keywords){
  assert.equal(word.sections.length,3,word.id);
  assert.ok(word.sections.every(section=>section.title&&section.body.length>50),word.id);
  assert.ok(baseGraph.nodes[word.id].evidence.length,word.id);
  for(const ref of baseGraph.nodes[word.id].evidence)assert.equal(new URL(ref.url).protocol,'https:');
 }
});
test('old complete ten-topic ledger survives and 24 new topics remain drawable',()=>{
 assert.deepEqual(visibleGraph(['light']),{ids:[],edges:[]},'ordinary peripheral concepts do not unlock acquisitions');
 const oldIds=['photonics-electronics','ethnography','surrealism','optical-fiber','ccd','photography','dada','collage','user-research','user-centered-design'];
 const old={...emptyProgress(9,'2026-11-01'),openings:oldIds.map((keywordId,i)=>({keywordId,date:'2026-11-01',openedAt:`2026-11-01T12:00:${String(i).padStart(2,'0')}Z`,grant:i?'welcome':'daily'}))};
 let state=restoreProgress(JSON.stringify(old));
 assert.deepEqual(state,old);
 assert.equal(availability(state,'2026-11-01').remaining,0);
 assert.equal(availability(state,'2026-11-02').remaining,1);
 assert.equal(availability(state,'2026-11-02').exhausted,false);
 for(let i=0;i<24;i++){
  const date=localDate(new Date(2026,10,2),i);
  state=restoreProgress(JSON.stringify(openForDate(state,date,()=>0)));
  assert.ok(!legacyKeywords.some(word=>word.id===state.openings.at(-1).keywordId));
 }
 assert.equal(state.openings.length,34);
 assert.equal(new Set(state.openings.map(item=>item.keywordId)).size,34);
 assert.equal(availability(state,'2027-01-01').exhausted,true);
 assert.equal(availability(state,'2027-01-01').remaining,0);
 assert.equal(openForDate(state,'2027-01-01'),state,'exhaustion never consumes another daily grant');
 assert.deepEqual(state.openings.slice(0,10),old.openings);
 const view=visibleGraph(oldIds);
 for(const id of oldIds)assert.ok(view.ids.includes(id),'old acquisition remains on the Map: '+id);
});

test('three calendar days bank three grants, spend them on one day, and survive restarting',()=>{
 let state=emptyProgress(0,'2026-11-11');
 state=openForDate(state,'2026-11-11',()=>0);
 assert.equal(allowance(state,'2026-11-14').daily,3);
 for(let i=0;i<3;i++)state=restoreProgress(JSON.stringify(openForDate(state,'2026-11-14',()=>0)));
 assert.equal(state.openings.length,4);assert.equal(allowance(state,'2026-11-14').daily,0);
 assert.equal(openForDate(state,'2026-11-14'),state);
 assert.equal(allowance(state,'2026-11-15').daily,1);
});
test('month/year/leap-day and daylight-saving calendar changes accrue by dates',()=>{
 for(const [start,end,days] of [['2026-12-31','2027-01-03',4],['2028-02-28','2028-03-01',3],['2026-03-07','2026-03-10',4],['2026-10-31','2026-11-03',4]])assert.equal(allowance(emptyProgress(0,start),end).daily,days);
 let state=openForDate(emptyProgress(0,'2026-11-11'),'2026-11-14',()=>0);
 assert.equal(allowance(state,'2026-11-12').daily,3);
 state=openForDate(state,'2026-11-12',()=>0);
 assert.doesNotThrow(()=>restoreProgress(JSON.stringify(state)),'backward time-zone dates never damage saved history');
});
test('old v2 daily/welcome ledger migrates with missed grants, rejecting overspending in v3',()=>{
 const old={version:2,initialBonus:2,dayOffset:0,openings:[{keywordId:keywords[0].id,date:'2026-11-11',openedAt:'2026-11-11T12:00:00Z',grant:'daily'}]};
 const migrated=restoreProgress(JSON.stringify(old),new Date(2026,10,14));
 assert.equal(migrated.startedOn,'2026-11-11');assert.deepEqual(migrated.openings,old.openings);
 assert.deepEqual(allowance(migrated,'2026-11-14'),{daily:3,bonus:2,total:5});
 assert.throws(()=>restoreProgress(JSON.stringify({...migrated,openings:[...migrated.openings,{...old.openings[0],keywordId:keywords[1].id}]})));
});
test('initial grant date persists before any draw, migration saves once, and storage failures reject',async()=>{
 const {loadSavedProgress}=load('src/state/progress.ts');
 let raw=null,writes=0;const storage={getItem:async()=>raw,setItem:async(_,value)=>{raw=value;writes++;}};
 const first=await loadSavedProgress(storage,new Date(2026,10,11));assert.equal(first.startedOn,'2026-11-11');assert.equal(writes,1);
 const after=await loadSavedProgress(storage,new Date(2026,10,14));assert.equal(after.openings.length,0);assert.equal(allowance(after,'2026-11-14').daily,4);assert.equal(writes,1);
 raw=JSON.stringify({version:2,dayOffset:0,initialBonus:2,openings:[]});await loadSavedProgress(storage,new Date(2026,10,11));assert.equal(JSON.parse(raw).version,3);assert.equal(writes,2);
 await assert.rejects(loadSavedProgress({getItem:async()=>null,setItem:async()=>{throw new Error('full');}}));
 raw='broken';await assert.rejects(loadSavedProgress(storage));assert.equal(raw,'broken');
});
