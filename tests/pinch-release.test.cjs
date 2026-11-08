const {test} = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const source = fs.readFileSync(process.env.MAP_GESTURE_SOURCE || 'src/components/GraphCanvas.tsx', 'utf8');
const file = ts.createSourceFile('canvas.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const configs = {};
function visit(node) {
 if (ts.isCallExpression(node) && ['usePanGesture','usePinchGesture'].includes(node.expression.getText(file))) configs[node.expression.getText(file)] = node.arguments[0].getText(file);
 ts.forEachChild(node,visit);
}
visit(file);
function shared(value) {return {value,get(){return this.value;},set(value){this.value=typeof value==='function'?value(this.value):value;}};}
function gestures() {
 const scope={};
 const decays=[];
 for (const [key,value] of Object.entries({x:0,y:0,scale:1,touching:false,pinching:false,pinchedThisPan:false,rebasePan:false,manipulated:false,grabbed:'',offset:{x:0,y:0},lastFocal:{x:0,y:0},drag:null})) scope[key]=shared(value);
 Object.assign(scope,{MAX_SCALE:2.2,MIN_SCALE:0.02,dynamic:false,reduced:false,ids:[],renderedIds:shared([]),positions:shared({}),wake(){},cancelAnimation(){},scheduleOnRN(){},withDecay(options){decays.push(options);return 0;}});
 scope.releaseDrag=()=>scope.grabbed.set('');
 const names=Object.keys(scope), values=Object.values(scope);
 const code = ts.transpileModule(`export const pan = ${configs.usePanGesture}; export const pinch = ${configs.usePinchGesture};`,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const exports={}; new Function('exports',...names,code)(exports,...values);
 return {...scope,...exports,decays, camera:()=>({x:scope.x.value,y:scope.y.value,scale:scope.scale.value})};
}
for (const remainingFocal of [{x:60,y:90},{x:310,y:450}]) {
 test(`pinch release preserves camera when remaining finger is at ${remainingFocal.x}`,()=>{
  const g=gestures();
  g.pan.onBegin({numberOfPointers:1});
  g.pinch.onActivate({focalX:180,focalY:260});
  g.pinch.onUpdate({numberOfPointers:2,focalX:200,focalY:280,scaleChange:1.4});
  const end=g.camera();
  assert.equal(end.scale,1.4);
  g.pinch.onUpdate({numberOfPointers:1,focalX:remainingFocal.x,focalY:remainingFocal.y,scaleChange:1});
  assert.deepEqual(g.camera(),end,'one-finger focal must not change the camera');
  g.pinch.onFinalize();
  g.pan.onUpdate({numberOfPointers:1,changeX:300,changeY:-200});
  assert.deepEqual(g.camera(),end,'first pan event rebases without a centroid jump');
  g.pan.onUpdate({numberOfPointers:1,changeX:4,changeY:6});
  assert.deepEqual(g.camera(),{x:end.x+4,y:end.y+6,scale:end.scale},'remaining finger can resume panning');
  const resumed=g.camera();
  g.pan.onDeactivate({canceled:false,velocityX:2000,velocityY:-2000});
  g.pan.onFinalize();
  assert.deepEqual(g.camera(),resumed,'release must not start inertia from pinch velocity');
  assert.equal(g.decays.length,0,'pinch velocity must not trigger inertia');
  g.pan.onBegin({numberOfPointers:1});
  assert.equal(g.pinchedThisPan.value,false,'new touch resets the pinch session');
  g.pan.onUpdate({numberOfPointers:1,changeX:3,changeY:2});
  g.pan.onDeactivate({canceled:false,velocityX:100,velocityY:200});
  assert.equal(g.decays.length,2,'new independent pan retains inertia on both axes');
 });
}
test('simultaneous pinch release/cancel does not start pan inertia',()=>{
 for(const canceled of [false,true]) {
  const g=gestures();g.pan.onBegin({numberOfPointers:2});g.pinch.onActivate({focalX:100,focalY:100});
  g.pinch.onUpdate({numberOfPointers:2,focalX:110,focalY:105,scaleChange:0.8});
  const end=g.camera();g.pinch.onFinalize();g.pan.onDeactivate({canceled,velocityX:500,velocityY:500});g.pan.onFinalize();
  assert.deepEqual(g.camera(),end);
  assert.equal(g.decays.length,0);
 }
});
test('one-finger continuation after pinch never reuses its end velocity',()=>{
 const g=gestures();g.pan.onBegin({numberOfPointers:1});
 g.pinch.onActivate({focalX:100,focalY:100});g.pinch.onFinalize();
 g.pan.onUpdate({numberOfPointers:1,changeX:400,changeY:400});
 g.pan.onUpdate({numberOfPointers:1,changeX:2,changeY:2});
 g.pan.onDeactivate({canceled:false,velocityX:3000,velocityY:3000});
 assert.equal(g.decays.length,0,'no inertia for a pan session that included pinch');
});
