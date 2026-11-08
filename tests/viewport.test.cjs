const {test} = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const module_ = {exports: {}};
new Function('exports', ts.transpileModule(fs.readFileSync('src/graph/viewport.ts', 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module_.exports);
const {viewportNodes, lineInViewport} = module_.exports;
test('overview preserves visible counts, priorities and excludes offscreen nodes', () => {
 const ids = ['a','b','c','off'];
 const p = {a:{x:1,y:1}, b:{x:2,y:2}, c:{x:3,y:3}, off:{x:10000,y:10000}};
 const camera = {x:0,y:0,scale:0.1};
 assert.deepEqual(viewportNodes(ids,p,camera,390,600,{}),{a:3});
 assert.deepEqual(viewportNodes(ids,p,camera,390,600,{b:true}),{b:1,a:2});
 assert.deepEqual(viewportNodes(ids,p,{...camera,scale:1},390,600,{}),{a:1,b:1,c:1});
 assert.equal(lineInViewport(-100,300,500,300,390,600),true);
 assert.equal(lineInViewport(-100,300,-50,400,390,600),false);
});
