const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const ts=require('typescript');const cache={};
function load(p){p=path.resolve(p);if(p.endsWith('.json'))return JSON.parse(fs.readFileSync(p,'utf8'));if(cache[p])return cache[p].exports;const m=cache[p]={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,resolveJsonModule:true}}).outputText)(id=>load(path.resolve(path.dirname(p),id+(id.endsWith('.json')?'':'.ts'))),m,m.exports);return m.exports;}
const {translate:t,resolveLocale,sourceLanguage}=load('src/i18n/translate.ts');
const {allKeywords:keywords}=load('src/data/keywords.ts');const {baseGraph}=load('src/knowledge/base.ts');
const ja=/[\u3040-\u30ff\u3400-\u9fff]/;
test('device fallback, numeric messages and composite node labels',()=>{
 assert.equal(resolveLocale('ja-JP'),'ja');assert.equal(resolveLocale('en-US'),'en');assert.equal(resolveLocale('fr-FR'),'en');assert.equal(resolveLocale(null),'en');
 assert.equal(t('残り1回','en'),'1 draw left');assert.equal(t('1語の知識','en'),'1 topic');
 assert.equal(t('残り10回','en'),'10 draws left');assert.equal(t('次の知識をひらく（残り9回）','en'),'Open another (9 left)');
 assert.equal(t('写真、開封済み教材','en'),'Photography, Acquired topic');
 assert.equal(t('1 / 10語','en'),'1 / 10 topics');
 assert.equal(t('残り10回','ja'),'残り10回');
});
test('all current and archived topics, article sections, graph names and explanations have English',()=>{
 const before=JSON.stringify(baseGraph);
 for(const word of keywords)for(const text of [word.name,word.category,word.introduction,word.summary,...word.sections.flatMap(s=>[s.title,s.body])])assert.ok(!ja.test(t(text,'en')),word.id+' untranslated: '+text);
 for(const node of Object.values(baseGraph.nodes))for(const text of [node.name,node.summary,node.detail??''])assert.ok(!ja.test(t(text,'en')),node.id+' untranslated: '+text);
 for(const edge of baseGraph.relations)for(const text of [edge.label,edge.explanation])assert.ok(!ja.test(t(text,'en')),edge.id+' untranslated: '+text);
 assert.equal(JSON.stringify(baseGraph),before,'translations never mutate graph IDs, positions or source data');
});
test('reference URLs are preserved and unknown source languages are not guessed',()=>{
 assert.equal(sourceLanguage('https://flets.com/navigation/column/optical_cable/'),'ja');assert.equal(sourceLanguage('https://www.moma.org/collection/terms/surrealism'),'en');assert.equal(sourceLanguage('https://example.com'),null);assert.equal(sourceLanguage('bad url'),null);assert.equal(sourceLanguage('https://doi.org/10.1234/unknown-language'),null);
});
test('UI source messages have English catalog entries; numeric JSX fragments are formatted as a whole',()=>{
 const fragments=new Set(['残り','回、新しい言葉に出会えます。','語の知識','デモ ·','件','取得知識','· 周辺概念','· 関係','・','操作した回数：','点','日本語']);
 function scan(dir){for(const name of fs.readdirSync(dir)){const file=path.join(dir,name);if(fs.statSync(file).isDirectory()){if(!['data','knowledge'].includes(name))scan(file);continue;}if(!/\.tsx?$/.test(file))continue;const parsed=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);function visit(node){if(ts.isStringLiteral(node)||ts.isJsxText(node)||ts.isNoSubstitutionTemplateLiteral(node)){const text=node.text.trim();if(ja.test(text)&&!fragments.has(text))assert.ok(!ja.test(t(text,'en')),file+': '+text);}ts.forEachChild(node,visit);}visit(parsed);}}
 scan('src');
});
