const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({locale:'ja-JP',viewport:{width:390,height:844},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url=process.env.MAP_TEST_URL || 'http://localhost:8092';
  await page.addInitScript(()=>{
   const original=Storage.prototype.setItem;
   Storage.prototype.setItem=function(key,value){if(key==='knowgacha.progress.v1' && window.failGachaSave)throw new Error('test storage failure');return original.call(this,key,value);};
  });
  const button=name=>page.getByRole('button',{name,exact:true});
  await page.goto(url+'/gacha');
  await page.getByText('残り10回',{exact:true}).waitFor({timeout:120000});
  await page.evaluate(()=>window.failGachaSave=true);
  await button('今日の知識をひらく').click();
  await page.getByRole('alert').waitFor();
  assert.equal(await page.evaluate(()=>localStorage.getItem('knowgacha.progress.v1')),null);
  await page.getByText('残り10回',{exact:true}).waitFor();
  await page.evaluate(()=>window.failGachaSave=false);
  await page.screenshot({path:'/tmp/gacha-initial-ten.png'});
  for(let i=0;i<10;i++){
   const name=i===0?'今日の知識をひらく':`次の知識をひらく（残り${10-i}回）`;
   await button(name).dblclick();
   await button('解説を読む').waitFor();
   await page.waitForTimeout(400);
   const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('knowgacha.progress.v1')));
   assert.equal(state.openings.length,i+1);
   assert.equal(new Set(state.openings.map(item=>item.keywordId)).size,i+1);
   if(i===4){await page.reload();await page.getByText('残り5回',{exact:true}).waitFor();}
  }
  await page.getByText('コンプリート',{exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:/次の知識をひらく/}).count(),0);
  const saved=await page.evaluate(()=>localStorage.getItem('knowgacha.progress.v1'));
  const state=JSON.parse(saved);
  assert.equal(state.version,2);
  assert.equal(state.openings.filter(item=>item.grant==='daily').length,1);
  assert.equal(state.openings.filter(item=>item.grant==='welcome').length,9);
  await page.screenshot({path:'/tmp/gacha-ten-complete.png'});
  await button('解説を読む').click();await page.waitForURL('**/word/**');
  await page.goBack();await button('Mapでつながりを見る').click();
  await page.getByTestId('atlas-canvas').waitFor();
  await page.getByRole('tab',{name:'Gacha',exact:true}).click();
  await page.getByRole('button',{name:'開封履歴 10 / 10語',exact:true}).click();
  await page.waitForURL('**/history');
  for(const item of state.openings)assert.ok(item.keywordId);
  await page.goto(url+'/gacha');await page.getByText('コンプリート',{exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>localStorage.getItem('knowgacha.progress.v1')),saved);
  assert.deepEqual(errors,[]);
  console.log('PASS normal Gacha: save failure preserves ten, ten individual draws, double tap, mid-session reload, unique real content, one daily + nine welcome, exhaustion, read/Map/history and restore');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
