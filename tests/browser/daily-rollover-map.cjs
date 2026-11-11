const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({locale:'ja-JP',viewport:{width:390,height:844},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='knowgacha.progress.v1'&&window.failSave)throw new Error('storage');return original.call(this,key,value);};});
  const url=process.env.MAP_TEST_URL || 'http://127.0.0.1:8116';
  const button=name=>page.getByRole('button',{name,exact:true});
  const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('knowgacha.progress.v1')));
  await page.goto(url);await button('最初の知識をひらく').waitFor({timeout:120000});
  const initial=await saved();assert.equal(initial.version,3);assert.equal(initial.openings.length,0);
  await page.evaluate(()=>window.failSave=true);await button('最初の知識をひらく').click();await page.getByRole('alert').waitFor();assert.deepEqual(await saved(),initial);
  await page.evaluate(()=>window.failSave=false);await button('最初の知識をひらく').dblclick();await page.getByTestId('map-preview').waitFor();
  assert.equal((await saved()).openings.length,1);assert.equal(await page.locator('[data-testid="knowledge-article"]:visible').count(),0);
  await page.waitForTimeout(700);await page.screenshot({path:'/workspace/scratch/rollover-map-reveal.png'});
  await button('読む').click();await page.locator('[data-testid="knowledge-article"]:visible').waitFor();
  await button('ガチャをひく（あと9回）').scrollIntoViewIfNeeded();await button('ガチャをひく（あと9回）').click();
  await page.getByTestId('map-preview').waitFor();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('knowgacha.progress.v1')).openings.length===2);
  for(let i=2;i<10;i++){
   await button('選択を解除').click();
   const read=button('今日の知識を読む'),draw=button(`ガチャをひく（あと${10-i}回）`);
   await draw.waitFor();assert.notDeepEqual(await read.boundingBox(),await draw.boundingBox());
   if(i===2)await page.screenshot({path:'/workspace/scratch/rollover-separated-actions.png'});
   await draw.dblclick();await page.getByTestId('map-preview').waitFor();
   await page.waitForFunction(n=>JSON.parse(localStorage.getItem('knowgacha.progress.v1')).openings.length===n,i+1);
  }
  const ten=await saved();assert.equal(ten.openings.filter(o=>o.grant==='daily').length,1);assert.equal(ten.openings.filter(o=>o.grant==='welcome').length,9);
  await button('選択を解除').click();assert.equal(await button('ガチャをひく（あと0回）').isDisabled(),true);
  // Bank three days by advancing the app's dev calendar, then consume all three on the same date.
  await button('設定を開く').click();await button('検証メニュー').click();
  for(let i=0;i<3;i++){await button('翌日扱いにする').click();await page.waitForFunction(n=>JSON.parse(localStorage.getItem('knowgacha.progress.v1')).dayOffset===n,i+1);}
  await page.goBack();await button('ガチャをひく（あと3回）').waitFor();await page.reload();await button('ガチャをひく（あと3回）').waitFor();
  for(let i=0;i<3;i++){
   await button(`ガチャをひく（あと${3-i}回）`).click();await page.getByTestId('map-preview').waitFor();
   await page.waitForFunction(n=>JSON.parse(localStorage.getItem('knowgacha.progress.v1')).openings.length===n,11+i);
   await button('選択を解除').click();
  }
  const final=await saved();assert.equal(final.openings.length,13);assert.equal(final.openings.filter(o=>o.grant==='daily').length,4);assert.equal(new Set(final.openings.slice(-3).map(o=>o.date)).size,1);
  await button('今日の知識を読む').click();await page.getByTestId('map-preview').waitFor();assert.deepEqual(await saved(),final);
  await button('読む').click();await page.locator('[data-testid="knowledge-article"]:visible').waitFor();await button('Mapで見る').scrollIntoViewIfNeeded();await button('Mapで見る').click();await page.getByTestId('map-preview').waitFor();assert.equal(await page.getByTestId('map-reveal').count(),0,'reading does not replay opening');
  const en=await browser.newPage({locale:'en-US',viewport:{width:320,height:568},colorScheme:'dark',reducedMotion:'no-preference'});en.on('pageerror',e=>errors.push(e.message));
  await en.goto(url);await en.getByRole('button',{name:'Open your first discovery',exact:true}).click();await en.getByTestId('map-reveal').waitFor();await en.getByTestId('map-preview').waitFor();
  await en.getByRole('button',{name:'Clear selection',exact:true}).click();await en.getByRole('button',{name:'Open Gacha (9 left)',exact:true}).waitFor();
  assert.equal(await en.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await en.screenshot({path:'/workspace/scratch/rollover-map-english.png'});
  assert.deepEqual(errors,[]);console.log('PASS v3 saved start, save failure, 10 Map reveals, separate read/draw buttons, article draw to Map, 3-day accrual and 3 same-day draws, restart, no redraw on reading, English small dark normal animation');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
