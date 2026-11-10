const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const m={exports:{}};
new Function('exports',ts.transpileModule(fs.readFileSync('src/graph/life.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m.exports);
const {createDrift,advanceDrift,freezeDrift,displayPositions,retuneDrift,frozenNodes}=m.exports;

test('individual paths remain bounded and slow for ten minutes, with gradual turns and rests',()=>{
 let turns=0,rests=0;
 const profiles=[];
 for(const id of ['affordance','umwelt','ethnography','ccd','light']){
  let state=createDrift(id,42), previousV={x:0,y:0}, earlierHeading=null;
  profiles.push([state.radius,state.speed]);
  for(let i=0;i<18000;i++){
   const previous=state;state=advanceDrift(Object.freeze(previous),1/30);
   assert.ok(Math.hypot(state.x,state.y)<=state.radius+1e-9);
   assert.ok(Math.hypot(state.x-previous.x,state.y-previous.y)<=previous.speed/30+1e-9);
   assert.ok(Math.hypot(state.vx-previousV.x,state.vy-previousV.y)<0.6,'heading and speed change gradually');
   if(i%90===0&&Math.hypot(state.vx,state.vy)>0.3){
    if(earlierHeading&&Math.abs(Math.atan2(state.vy*earlierHeading.x-state.vx*earlierHeading.y,state.vx*earlierHeading.x+state.vy*earlierHeading.y))>0.2)turns++;
    earlierHeading={x:state.vx,y:state.vy};
   }
   if(state.resting)rests++;
   previousV={x:state.vx,y:state.vy};
  }
  assert.ok(Math.hypot(state.x,state.y)>0.1,'a node really wanders');
 }
 assert.equal(new Set(profiles.map(JSON.stringify)).size,profiles.length);
 assert.ok(rests>0,'occasional pauses occur');
 assert.ok(turns>10,'paths really change direction rather than only changing speed');
});
test('pausing preserves the displayed position, and a delayed frame never catches up',()=>{
 let state=createDrift('affordance',1);
 for(let i=0;i<300;i++)state=advanceDrift(state,1/30);
 const frozen=freezeDrift(Object.freeze(state));
 assert.equal(frozen.x,state.x);assert.equal(frozen.y,state.y);
 assert.equal(frozen.vx,0);assert.equal(frozen.vy,0);
 assert.equal(advanceDrift(frozen,0),frozen);
 const resumed=advanceDrift(frozen,60);
 assert.ok(Math.hypot(resumed.x-frozen.x,resumed.y-frozen.y)<0.03,'background time cannot cause a jump');
});
test('identity gives stable speed and session randomness gives different routes',()=>{
 const a=createDrift('affordance',1),b=createDrift('affordance',2);
 assert.equal(a.speed,b.speed);assert.equal(a.radius,b.radius);
 assert.notDeepEqual([a.targetX,a.targetY],[b.targetX,b.targetY]);
 assert.deepEqual(createDrift('affordance',1),a);
});

test('dragging uses the already visible target once, without a release offset or mutation',()=>{
 const base=Object.freeze({a:Object.freeze({x:100,y:80}),b:Object.freeze({x:200,y:160})});
 const drift={...createDrift('a'),x:12,y:-7};
 assert.deepEqual(displayPositions(base,{a:drift}).a,{x:112,y:73});
 const dragged={...base,a:{x:152,y:93}};
 const during=displayPositions(dragged,{a:drift},'a');
 assert.deepEqual(during.a,dragged.a,'drag targets already include the pre-drag visible offset');
 const released=displayPositions(dragged,{a:createDrift('a')});
 assert.deepEqual(released.a,during.a,'absorbing the old offset prevents a release jump');
 assert.deepEqual(base.a,{x:100,y:80});assert.deepEqual(released.b,base.b);
});

// Exercise the actual UI-frame worklet with shared-value mocks, including paths
// the browser navigator may detach before they can be inspected visually.
const hook=ts.createSourceFile('life.tsx',fs.readFileSync('src/hooks/useLivingPositions.ts','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let callback;
(function visit(node){if(ts.isCallExpression(node)&&node.expression.getText(hook)==='useFrameCallback')callback=node.arguments[0].getText(hook);ts.forEachChild(node,visit);})(hook);
function shared(value){return{value,set(next){this.value=next;}};}
function frameHarness(overrides={}){
 const scope={active:true,foreground:true,base:shared({a:{x:0,y:0},b:{x:200,y:100}}),drag:shared(null),renderedIds:shared(['a']),frozen:{},touching:shared(false),pinching:shared(false),cameraX:shared(0),cameraY:shared(0),scale:shared(1),previousCamera:shared({x:0,y:0,scale:1}),cooldown:shared(0),ramp:shared(1),elapsed:shared(0),drifts:shared({a:{...createDrift('a',1),x:2,y:3,vx:1,vy:0}}),session:1,createDrift,freezeDrift,advanceDrift,retuneDrift,...overrides};
 const code=ts.transpileModule(`const callback=${callback};`,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const run=new Function(...Object.keys(scope),code+'return callback;')(...Object.values(scope));
 return {...scope,run:()=>run({timeSincePreviousFrame:50})};
}
test('inactive, background and touching frames cannot advance drift',()=>{
 for(const flags of [{active:false},{foreground:false},{touching:shared(true)},{pinching:shared(true)}]){
  const h=frameHarness(flags),before=JSON.stringify(h.drifts.value);
  for(let i=0;i<40;i++)h.run();
  assert.equal(JSON.stringify(h.drifts.value),before);
 }
 const h=frameHarness();h.run();assert.notEqual(h.drifts.value.a.x,2,'active visible nodes advance');
 assert.ok(!h.drifts.value.b,'off-screen nodes do not acquire a frame update');
});
test('selected nodes hold their offsets and release waits before restarting',()=>{
 const h=frameHarness({frozen:{a:true}});for(let i=0;i<40;i++)h.run();
 assert.equal(h.drifts.value.a.x,2);assert.equal(h.drifts.value.a.y,3);assert.equal(h.drifts.value.a.vx,0);
 const g=frameHarness();g.touching.value=true;g.run();g.touching.value=false;
 for(let i=0;i<10;i++)g.run();assert.equal(g.drifts.value.a.x,2,'the first half-second after release is quiet');
 for(let i=0;i<30;i++)g.run();assert.notEqual(g.drifts.value.a.x,2,'then motion resumes');
 const camera=frameHarness();camera.cameraX.value=10;camera.run();
 assert.equal(camera.drifts.value.a.x,2);assert.equal(camera.cooldown.value,0.8,'camera animation also postpones drift');
});

test('normal and overview zooms both produce visible screen movement with bounded reach',()=>{
 for(const zoom of [0.05,0.15,0.3,1,2.2]){
  let state=createDrift('light',37,zoom);
  const maxRadius=state.radius;
  for(let i=0;i<120;i++)state=advanceDrift(state,1/30);
  assert.ok(Math.hypot(state.x,state.y)*zoom>4,'four seconds should visibly move a node at zoom '+zoom);
  assert.ok(Math.hypot(state.x,state.y)<=maxRadius+1e-9);
 }
 const h=frameHarness({scale:shared(0.2),previousCamera:shared({x:0,y:0,scale:0.2})});
 for(let i=0;i<40;i++)h.run();assert.notEqual(h.drifts.value.a.x,2,'overview no longer disables motion');
});
test('zoom retuning preserves the exact displayed world point and eases into the new envelope',()=>{
 let state=createDrift('light',37,0.15);state={...state,x:state.radius*0.8,y:0,vx:2,vy:1};
 const next=retuneDrift(Object.freeze(state),1.5);
 assert.equal(next.x,state.x);assert.equal(next.y,state.y);assert.equal(next.vx,0);assert.equal(next.vy,0);
 let settling=next;for(let i=0;i<1800;i++)settling=advanceDrift(settling,1/30);
 assert.ok(Math.hypot(settling.x,settling.y)*1.5<=settling.reach+0.001);
});
test('a selected node freezes while neighbors remain alive; an edge freezes both endpoints',()=>{
 const edges=[{id:'a-b',sourceId:'a',targetId:'b'}];
 assert.deepEqual(frozenNodes('a',edges),{a:true});assert.deepEqual(frozenNodes('a-b',edges),{a:true,b:true});
 const h=frameHarness({frozen:frozenNodes('a',edges),renderedIds:shared(['a','b'])});
 for(let i=0;i<60;i++)h.run();assert.equal(h.drifts.value.a.x,2);assert.ok(Math.hypot(h.drifts.value.b.x,h.drifts.value.b.y)>1);
});
