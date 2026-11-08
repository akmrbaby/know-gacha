const {test} = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const source = ts.transpileModule(fs.readFileSync('src/graph/lab.ts', 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function enabled(channel, development=false, flag=undefined) {
 const exports = {};
 new Function('exports','require','__DEV__','process',source)(exports, name => {assert.equal(name,'expo-updates');return {channel};}, development, {env:{EXPO_PUBLIC_GRAPH_LAB:flag}});
 return exports.graphLabEnabled;
}
test('installed preview exposes evaluation while production stays opt-in', () => {
 assert.equal(enabled('preview'),true);
 assert.equal(enabled('production'),false);
 assert.equal(enabled(null),false);
 assert.equal(enabled(null,true),true);
 assert.equal(enabled('map-lab',false,'1'),true);
 assert.equal(enabled('production',false,'0'),false);
});
