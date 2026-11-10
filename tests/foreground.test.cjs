const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const m={exports:{}};
new Function('exports',ts.transpileModule(fs.readFileSync('src/state/foreground.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m.exports);
const {createForegroundStore}=m.exports;

test('unknown and transitional native states stay stopped until active is observed',()=>{
 const source={currentState:undefined,addEventListener(){return{remove(){}};}};
 const store=createForegroundStore(source);
 for(const state of [undefined,null,'unknown','inactive','background']){
  source.currentState=state;assert.equal(store.getSnapshot(),false);
 }
 source.currentState='active';assert.equal(store.getSnapshot(),true);
});

test('the snapshot sees activation between initial render and native subscription',()=>{
 const handlers=new Set();
 const source={currentState:null,addEventListener(event,callback){assert.equal(event,'change');handlers.add(callback);return{remove:()=>handlers.delete(callback)};}};
 const store=createForegroundStore(source);
 assert.equal(store.getSnapshot(),false);
 source.currentState='active'; // iOS initial state resolves before the hook subscribes.
 let notified=0;const unsubscribe=store.subscribe(()=>notified++);
 assert.equal(notified,0,'there is no event to replay for a newly registered listener');
 assert.equal(store.getSnapshot(),true,'React rechecks this snapshot when installing the subscription');
 for(const state of ['inactive','background','active']){
  source.currentState=state;for(const fn of handlers)fn();
  assert.equal(store.getSnapshot(),state==='active');
 }
 assert.equal(notified,3);unsubscribe();assert.equal(handlers.size,0);
 assert.equal(store.getServerSnapshot(),false);
});
