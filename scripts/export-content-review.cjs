const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache={};
function load(file){
 file=path.resolve(root,file);
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 if(cache[file])return cache[file].exports;
 const m=cache[file]={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
 new Function('require','exports','module',code)(id=>load(path.resolve(path.dirname(file),id+(id.endsWith('.json')?'':'.ts'))),m.exports,m);
 return m.exports;
}
const {keywords}=load('src/data/keywords.ts');
const {baseGraph}=load('src/knowledge/base.ts');
const english=load('src/i18n/content-en.json').topics;
function render(){
 if(keywords.length!==30 || new Set(keywords.map(word=>word.id)).size!==30)throw new Error('Review scope must be 30 unique active topics');
 const lines=['# 30語の校閲用原稿（日英）','','状態：**校閲待ち**。現行の抽選対象30語を、アプリと同じ順序で掲載しています。旧履歴互換用の4語は対象外です。本文を変更せず抽出した原稿で、校閲済みの宣言ではありません。','','想定読者：専門外の概念に触れる機会が減った、30歳前後の高学歴の社会人。他学部の授業で新しい見方を知った嬉しさを、一日一語の発見で再現します。','','確認する観点は、定義と限界の正確さ、具体例の適切さ、専門外の人に伝わるか、既知の語でも発見があるか、日英の意味の一致、参考資料との対応です。','','修正指示は「語名／該当箇所／修正内容」の形で会話や別のメモへ残してください。このファイルは`npm run content:review`で再生成されるため、直接書き込んだメモは再生成で消えます。','','## 目次','',...keywords.map((word,i)=>`${i+1}. [${word.name}](#topic-${word.id})`),''];
 keywords.forEach((word,i)=>{
  const en=english[word.id];if(!en||en.sections.length!==word.sections.length)throw new Error(`Missing translation: ${word.id}`);
  lines.push(`<a id="topic-${word.id}"></a>`,'',`## ${String(i+1).padStart(2,'0')}. ${word.name}`,'',`ID: \`${word.id}\``,'','### 日本語','',`分野：${word.category}`,'','**導入・問い**', '',word.introduction,'','**概要**','',word.summary,'');
  for(const section of word.sections)lines.push(`#### ${section.title}`,'',section.body,'');
  lines.push('### English','',`**${en.name}** · ${en.category}`,'','**Introduction**','',en.introduction,'','**Summary**','',en.summary,'');
  for(const section of en.sections)lines.push(`#### ${section.title}`,'',section.body,'');
  lines.push('### 参考資料（アプリに掲載する参照先）','');
  for(const item of baseGraph.nodes[word.id].evidence)lines.push(`- [${item.title}](${item.url})`);
  lines.push('');
 });
 return lines.join('\n');
}
const file=path.join(root,'docs/review/thirty-topics.md'),expected=render();
if(process.argv.includes('--check')){
 if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==expected){process.stderr.write('Review manuscript needs regeneration\n');process.exitCode=1;}
}else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,expected);process.stdout.write('Exported 30 Japanese/English topics with references\n');}
