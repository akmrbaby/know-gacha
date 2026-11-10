const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const cache={};
function load(file){file=path.resolve(file);if(cache[file])return cache[file].exports;const m=cache[file]={exports:{}};new Function('require','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(id=>load(path.resolve(path.dirname(file),id+'.ts')),m.exports);return m.exports;}
const ids=load('src/data/keywords.ts').keywords.map(word=>word.id);
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext({locale:'ja-JP',viewport:{width:390,height:844},reducedMotion:'no-preference',recordVideo:process.env.LIVING_VIDEO_DIR?{dir:process.env.LIVING_VIDEO_DIR,size:{width:390,height:844}}:undefined});
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(ids=>{
   Math.random=()=>0.37;
   localStorage.setItem('knowgacha.progress.v1',JSON.stringify({version:2,initialBonus:29,dayOffset:0,openings:ids.map((keywordId,i)=>({keywordId,date:'2026-11-09',openedAt:`2026-11-09T12:00:${String(i).padStart(2,'0')}Z`,grant:i?'welcome':'daily'}))}));
  },ids);
  await page.goto(process.env.MAP_TEST_URL||'http://127.0.0.1:8112');await page.getByTestId('atlas-canvas').waitFor({timeout:120000});
  await page.waitForTimeout(8000);
  const canvas=page.getByTestId('atlas-canvas');
  const snapshot=()=>canvas.getByRole('button').evaluateAll(nodes=>Object.fromEntries(nodes.map(node=>{const r=node.firstElementChild.firstElementChild.getBoundingClientRect();return[node.getAttribute('aria-label'),{x:r.x+r.width/2,y:r.y+r.height/2,text:node.innerText}];})));
  const progress=await page.evaluate(()=>localStorage.getItem('knowgacha.progress.v1'));
  const camera=await page.evaluate(()=>localStorage.getItem('knowgacha.map-viewport.v1'));
  assert.ok(JSON.parse(camera).scale<0.35,'exercise the previously disabled default overview');
  const first=await snapshot();let previous=first;const travel={};
  for(let step=0;step<20;step++){
   await page.waitForTimeout(200);const next=await snapshot();
   assert.deepEqual(Object.keys(next).sort(),Object.keys(first).sort(),'wandering does not change group representatives');
   for(const id of Object.keys(next)){assert.equal(next[id].text,first[id].text,'group counts stay stable');travel[id]=(travel[id]||0)+Math.hypot(next[id].x-previous[id].x,next[id].y-previous[id].y);}
   previous=next;
  }
  const distances=Object.values(travel);
  assert.ok(distances.filter(value=>value>6).length>=2,'multiple visible nodes visibly travel in four seconds');
  assert.ok(Math.max(...distances)<35,'overview speed remains restrained');
  assert.equal(await page.evaluate(()=>localStorage.getItem('knowgacha.map-viewport.v1')),camera);
  assert.equal(await page.evaluate(()=>localStorage.getItem('knowgacha.progress.v1')),progress);
  assert.equal(await canvas.locator('path').count(),3);
  await page.screenshot({path:'/workspace/scratch/visible-map-overview.png'});
  if(process.env.LIVING_VIDEO_DIR)await page.waitForTimeout(6000);
  await page.getByRole('button',{name:'設定を開く',exact:true}).click();
  await page.getByText('丸い点と名前・線がゆっくり動きます。操作中と詳細表示中は静止します。',{exact:true}).waitFor();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.getByText('端末の「視差効果を減らす」設定により、Mapの動きを停止しています。',{exact:true}).waitFor();
  await page.getByRole('button',{name:'English',exact:true}).click();
  await page.getByText('Map motion is paused because Reduce Motion is enabled on your device.',{exact:true}).waitFor();
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.getByText('The round nodes, names, and lines move slowly. Motion pauses while you interact or read details.',{exact:true}).waitFor();
  assert.deepEqual(errors,[]);await context.close();
  console.log('PASS default 30-topic overview visibly moves without zooming; stable groups; camera/progress unchanged; OS stop reason in Japanese and English',JSON.stringify({scale:JSON.parse(camera).scale,visible:distances.length,maxFourSecondTravel:Math.max(...distances)}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
