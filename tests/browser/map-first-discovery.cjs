// End-to-end regression for the Map-only home and direct discovery reader.
const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const url=process.env.MAP_TEST_URL || 'http://localhost:8116';
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({locale:'ja-JP',viewport:{width:390,height:844},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const button=(name)=>page.getByRole('button',{name,exact:true});
  const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('knowgacha.progress.v1')));
  await page.addInitScript(()=>{
   const original=Storage.prototype.setItem;
   Storage.prototype.setItem=function(key,value){if(key==='knowgacha.progress.v1' && window.failGachaSave)throw new Error('test storage failure');return original.call(this,key,value);};
  });
  await page.goto(url);await button('最初の知識をひらく').waitFor({timeout:120000});
  assert.equal(await page.getByRole('tab').count(),0);
  await page.screenshot({path:'/workspace/scratch/map-first-empty.png'});
  await page.evaluate(()=>window.failGachaSave=true);
  await button('最初の知識をひらく').click();await page.getByRole('alert').waitFor();
  assert.equal(await saved(),null);
  await page.evaluate(()=>window.failGachaSave=false);
  await button('最初の知識をひらく').dblclick();
  await page.locator('[data-testid="knowledge-article"]:visible').waitFor();
  assert.equal((await saved()).openings.length,1);
  await page.screenshot({path:'/workspace/scratch/map-first-article.png'});
  for(let i=1;i<10;i++){
   const next=button(`特典でもうひとつ（あと${10-i}回）`);
   await next.scrollIntoViewIfNeeded();await next.click();
   await page.locator('[data-testid="knowledge-article"]:visible').waitFor();
   await page.waitForFunction(n=>JSON.parse(localStorage.getItem('knowgacha.progress.v1')).openings.length===n,i+1);
   assert.equal((await saved()).openings.length,i+1);
   if(i===4){await page.reload();await page.locator('[data-testid="knowledge-article"]:visible').waitFor();}
  }
  assert.equal(new Set((await saved()).openings.map(o=>o.keywordId)).size,10);
  assert.equal(await page.getByRole('button',{name:/特典でもうひとつ/}).count(),0);
  const ledger=await saved();
  let latestName=await page.locator('[data-testid="knowledge-article"]:visible').getByRole('heading').first().innerText();
  await page.reload();await page.locator('[data-testid="knowledge-article"]:visible').waitFor();
  assert.deepEqual(await saved(),ledger);
  latestName=await page.locator('[data-testid="knowledge-article"]:visible').getByRole('heading').first().innerText();
  await button('Mapで見る').scrollIntoViewIfNeeded();await button('Mapで見る').click();
  await page.getByTestId('map-preview').waitFor();await page.waitForTimeout(1000);
  await page.screenshot({path:'/workspace/scratch/map-first-focus-debug.png'});
  const orb=await page.getByTestId('atlas-canvas').getByRole('button',{name:`${latestName}、開封済み教材`,exact:true}).boundingBox();
  assert.ok(orb && orb.y>75 && orb.y<500,'explicit Map action brings the subject into view');
  await button('読む').click();await page.locator('[data-testid="knowledge-article"]:visible').waitFor();
  await page.goBack();await page.getByTestId('map-preview').waitFor();await button('選択を解除').click();await page.waitForTimeout(1000);
  await page.screenshot({path:'/workspace/scratch/map-first-home.png'});
  await button('知識一覧').click();
  const input=page.getByRole('textbox',{name:'知識を検索'});
  await input.waitFor();await input.fill('絶対存在しない検索語');await page.getByText('一致する知識がありません。').waitFor();await button('検索をクリア').click();
  const englishName=require('../../src/i18n/content-en.json').topics[ledger.openings.at(-1).keywordId].name;
  await input.fill(englishName);
  const result=page.getByRole('button').filter({hasText:latestName});
  await result.click();await page.locator('[data-testid="knowledge-article"]:visible').waitFor();await page.goBack();await input.waitFor();
  assert.equal(await input.inputValue(),englishName,'list search survives reading and back');
  assert.deepEqual(await saved(),ledger);
  await page.goto(url+'/gacha');await button('知識一覧').waitFor();assert.equal(await page.getByRole('tab').count(),0);
  await button('設定を開く').click();await button('検証メニュー').click();await button('翌日扱いにする').click();await page.goBack();await button('今日の知識をひらく').waitFor();
  await button('今日の知識をひらく').click();await page.locator('[data-testid="knowledge-article"]:visible').waitFor();assert.equal((await saved()).openings.length,11);assert.equal((await saved()).openings.at(-1).grant,'daily');
  // The same UI must fit small English dark-mode devices; the entire article scrolls.
  const en=await browser.newPage({locale:'en-US',viewport:{width:320,height:568},colorScheme:'dark',reducedMotion:'no-preference'});en.on('pageerror',e=>errors.push(e.message));
  await en.goto(url);await en.getByRole('button',{name:'Open your first discovery',exact:true}).click();
  await en.getByTestId('discovery-opening').waitFor();await en.locator('[data-testid="knowledge-article"]:visible').waitFor();
  await en.getByRole('button',{name:'View on Map',exact:true}).scrollIntoViewIfNeeded();
  await en.screenshot({path:'/workspace/scratch/map-first-english-dark.png'});
  assert.equal(await en.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const completed=await browser.newPage({locale:'ja-JP',reducedMotion:'reduce'});
  const all=Object.keys(require('../../src/i18n/content-en.json').topics).filter(id=>!['photography','collage','user-research','optical-fiber'].includes(id));
  assert.equal(all.length,30);
  await completed.addInitScript(ids=>{
    const date=new Date(),today=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    localStorage.setItem('knowgacha.progress.v1',JSON.stringify({version:2,dayOffset:0,initialBonus:40,openings:ids.map((keywordId,i)=>({keywordId,date:today,openedAt:new Date().toISOString(),grant:i?'welcome':'daily'}))}));
  },all);
  await completed.goto(url);await completed.getByRole('button',{name:'出会った知識を読み返す',exact:true}).waitFor();
  assert.equal(await completed.getByRole('button',{name:/特典でもうひとつ/}).count(),0);
  await completed.getByRole('button',{name:'出会った知識を読み返す',exact:true}).click();await completed.getByRole('textbox',{name:'知識を検索'}).waitFor();
  assert.equal((JSON.parse(await completed.evaluate(()=>localStorage.getItem('knowgacha.progress.v1')))).openings.length,30);
  assert.deepEqual(errors,[]);
  console.log('PASS no tabs, 10 unique draws, direct article and reload, Map/reader/list return, empty search, legacy Gacha redirect, next-day daily grant, English dark 320px and normal animation');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
