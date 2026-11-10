const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const source=ts.createSourceFile('Capsule.tsx',fs.readFileSync('src/components/Capsule.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let callback;
(function visit(node){if(ts.isCallExpression(node)&&node.expression.getText(source)==='useEffect'&&node.arguments[0].getText(source).includes('function complete()'))callback=node.arguments[0].getText(source);ts.forEachChild(node,visit);})(source);
function harness(overrides={}){
 const state={calls:0,stops:0,unsubscribed:false,timers:new Map(),options:null,done:null,listener:null};
 const scope={opening:true,reduced:false,ready:true,failed:false,motion:{value:0,setValue(value){this.value=value;}},finish:{current:()=>state.calls++},completed:{current:false},
  AppState:{currentState:'active',addEventListener:(_name,listener)=>{state.listener=listener;return{remove:()=>state.unsubscribed=true};}},
  Animated:{timing:(_motion,options)=>{state.options=options;return{start:done=>state.done=done,stop:()=>{state.stops++;state.done?.({finished:false});}};}},
  setTimeout:(fn,ms)=>{state.timers.set(fn,ms);return fn;},clearTimeout:fn=>state.timers.delete(fn),...overrides};
 const code=ts.transpileModule(`const run=${callback};`,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const run=new Function(...Object.keys(scope),code+'return run;')(...Object.values(scope));
 return{...state,scope,state,cleanup:run()};
}
test('normal opening completes once, including repeated background events after completion',()=>{
 const h=harness();assert.equal(h.state.options.duration,900);assert.equal(h.state.options.useNativeDriver,true);
 h.state.done({finished:true});h.state.listener('inactive');h.state.listener('background');assert.equal(h.state.calls,1);
 h.cleanup();assert.ok(h.state.unsubscribed);
});
test('background transition and image deadline complete pending openings only once',()=>{
 const h=harness({ready:false});assert.deepEqual([...h.state.timers.values()],[800]);
 h.state.listener('background');for(const fn of h.state.timers.keys())fn();assert.equal(h.state.calls,1);assert.equal(h.state.options,null);
 h.cleanup();assert.equal(h.state.timers.size,0);
 const waiting=harness({ready:false});for(const fn of waiting.state.timers.keys())fn();assert.equal(waiting.state.calls,1);waiting.cleanup();
});
test('reduced motion, image failure and already-backgrounded state bypass the animation',()=>{
 for(const flags of [{reduced:true,ready:false},{failed:true},{AppState:{currentState:'background',addEventListener:()=>({remove(){}})}}]){
  const h=harness(flags);assert.equal(h.state.calls,1);assert.equal(h.state.options,null);h.cleanup();
 }
});
test('unmounting after skip or sheet dismissal prevents a late animation callback',()=>{
 const h=harness();h.cleanup();h.state.done({finished:true});assert.equal(h.state.calls,0);
 const pending=harness({ready:false});const timer=[...pending.state.timers.keys()][0];pending.cleanup();timer();assert.equal(pending.state.calls,0);
});
test('reusing the same component resets the pose and allows the next opening to finish',()=>{
 const completed={current:true},motion={value:1,setValue(value){this.value=value;}};
 harness({opening:false,completed,motion});assert.equal(completed.current,false);assert.equal(motion.value,0);
 const next=harness({completed,motion});next.state.done({finished:true});assert.equal(next.state.calls,1);next.cleanup();
});
