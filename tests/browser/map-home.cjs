// Map acquisition and persistence regression with compact selection previews.
const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({locale:'ja-JP',viewport:{width:390,height:844},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url=process.env.MAP_TEST_URL || 'http://localhost:8095';
  const button=name=>page.getByRole('button',{name,exact:true});
  const camera=async()=>{await page.waitForTimeout(850);return page.evaluate(()=>JSON.parse(localStorage.getItem('knowgacha.map-viewport.v1')));};
  const same=(a,b)=>{for(const k of ['centerX','centerY','scale'])assert.ok(Math.abs(a[k]-b[k])<1e-8);};
  await page.goto(url);await button('最初の知識をひらく').waitFor({timeout:120000});
  await button('最初の知識をひらく').click();await page.getByTestId('map-preview').waitFor();
  const first=await page.evaluate(()=>localStorage.getItem('knowgacha.progress.v1'));
  assert.equal(JSON.parse(first).openings.length,1);
  await button('詳細を開く').click();await page.getByText('引き上げて全文を読む',{exact:true}).waitFor();
  await button('詳細を閉じる').click();await button('選択を解除').click();
  await button('残り9回、ガチャをひらく').waitFor();
  await button('地図を拡大').click();const before=await camera();
  await page.getByRole('tab',{name:'Gacha',exact:true}).click();await page.getByRole('tab',{name:'Map',exact:true}).click();
  same(await camera(),before);
  await page.setViewportSize({width:430,height:900});same(await camera(),before);
  await page.setViewportSize({width:390,height:844});await page.reload();await page.getByTestId('atlas-canvas').waitFor();same(await camera(),before);
  await button('残り9回、ガチャをひらく').click();await page.getByTestId('map-preview').waitFor();
  const second=JSON.parse(await page.evaluate(()=>localStorage.getItem('knowgacha.progress.v1')));
  assert.equal(second.openings.length,2);assert.notEqual(second.openings[0].keywordId,second.openings[1].keywordId);
  await button('詳細を開く').click();await button('言葉のノートで読む').click();await page.waitForURL('**/word/**');
  await page.goBack();await page.getByTestId('atlas-canvas').waitFor();
  assert.equal(JSON.parse(await page.evaluate(()=>localStorage.getItem('knowgacha.progress.v1'))).openings.length,2);
  const animated=await browser.newPage({locale:'ja-JP',viewport:{width:390,height:844},reducedMotion:'no-preference'});animated.on('pageerror',e=>errors.push(e.message));
  await animated.goto(url);await animated.getByRole('button',{name:'最初の知識をひらく',exact:true}).click();await animated.getByTestId('map-preview').waitFor();
  await animated.getByRole('dialog').waitFor({state:'hidden'});
  assert.equal(await animated.getByRole('dialog').count(),0);
  assert.equal(JSON.parse(await animated.evaluate(()=>localStorage.getItem('knowgacha.progress.v1'))).openings.length,1);
  assert.deepEqual(errors,[]);console.log('PASS Map empty/first draw, preview/detail/read, remaining chip, second draw, tab/resize/reload camera and history, animated reveal');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
