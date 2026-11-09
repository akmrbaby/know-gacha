const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({locale:'ja-JP',viewport:{width:390,height:844},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{Math.random=()=>0;});
  const url=process.env.MAP_TEST_URL||'http://127.0.0.1:8109';
  const button=name=>page.getByRole('button',{name,exact:true});
  const back=()=>page.getByRole('link',{name:/back|戻る/i}).click();
  const selected=name=>page.waitForFunction(name=>document.querySelector('[aria-label="'+name+'"]')?.getAttribute('aria-pressed')==='true',name);
  const topRight=async name=>{
   const box=await button(name).boundingBox();
   assert.ok(box.x>page.viewportSize().width*0.65&&box.y<120,'settings is at the top right');
   assert.ok(box.width>=48&&box.height>=48,'settings has a full touch target');
  };
  await page.goto(url);await button('最初の知識をひらく').waitFor({timeout:120000});
  await topRight('設定を開く');assert.equal(await button('English').count(),0);
  await button('設定を開く').click();await page.getByRole('heading',{name:'設定',exact:true}).waitFor();
  await selected('日本語');const ja=await button('日本語').boundingBox(),en=await button('English').boundingBox();
  assert.ok(en.y>=ja.y+ja.height&&en.width>=300,'language choices form full-width rows');
  assert.ok(ja.height>=48&&en.height>=48);
  await page.screenshot({path:'/workspace/scratch/settings-language-ja.png'});
  await button('English').click();await selected('English');assert.equal(await button('日本語').getAttribute('aria-pressed'),'false');
  await page.getByRole('heading',{name:'Settings',exact:true}).waitFor();
  await back();await page.getByRole('tab',{name:'Gacha',exact:true}).click();
  await topRight('Open settings');assert.equal(await button('English').count(),0);
  await page.screenshot({path:'/workspace/scratch/gacha-settings-entry.png'});
  await button('Open a discovery').click();await button('Read more').waitFor();
  const progress=await page.evaluate(()=>localStorage.getItem('knowgacha.progress.v1'));
  await button('Open settings').click();await button('日本語').click();await selected('日本語');await back();
  await button('解説を読む').waitFor();assert.equal(await page.getByRole('tab',{name:'Gacha',exact:true}).getAttribute('aria-selected'),'true');
  assert.equal(await page.evaluate(()=>localStorage.getItem('knowgacha.progress.v1')),progress);
  await page.getByRole('tab',{name:'Map',exact:true}).click();await page.getByTestId('atlas-canvas').waitFor();
  await button('地図を拡大').click();await page.waitForTimeout(1000);
  const camera=await page.evaluate(()=>localStorage.getItem('knowgacha.map-viewport.v1'));
  await button('光電融合、開封済み教材').click();await page.getByTestId('map-preview').waitFor();
  await topRight('設定を開く');await page.screenshot({path:'/workspace/scratch/map-settings-entry.png'});
  await button('設定を開く').click();await button('English').click();await selected('English');await back();
  await page.getByTestId('atlas-canvas').waitFor();await page.getByTestId('map-preview').waitFor();await page.getByText('Integrated photonics and electronics',{exact:true}).first().waitFor();await page.waitForTimeout(900);
  assert.equal(await page.evaluate(()=>localStorage.getItem('knowgacha.map-viewport.v1')),camera,'Map camera survives settings');
  assert.equal(await page.evaluate(()=>localStorage.getItem('knowgacha.progress.v1')),progress);
  await button('Open settings').click();await page.setViewportSize({width:320,height:568});await page.emulateMedia({colorScheme:'dark'});
  await page.addStyleTag({content:'[role="button"][aria-label="日本語"] [dir="auto"], [role="button"][aria-label="English"] [dir="auto"] { font-size:30px !important;line-height:42px !important; }'});
  for(const name of ['日本語','English']){const r=await button(name).boundingBox();assert.ok(r.x>=0&&r.x+r.width<=320&&r.y+r.height<=568);}
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:'/workspace/scratch/settings-language-dark-large.png'});
  await page.reload();await selected('English');await page.getByRole('heading',{name:'Settings',exact:true}).waitFor();
  const failed=await browser.newPage({locale:'ja-JP',viewport:{width:390,height:844},reducedMotion:'reduce'});
  failed.on('pageerror',e=>errors.push(e.message));
  await failed.addInitScript(()=>localStorage.setItem('knowgacha.progress.v1','invalid'));
  await failed.goto(url);await failed.getByRole('button',{name:'設定を開く',exact:true}).click();
  await failed.getByRole('button',{name:'English',exact:true}).click();await failed.getByRole('heading',{name:'Settings',exact:true}).waitFor();
  assert.equal(await failed.evaluate(()=>localStorage.getItem('knowgacha.progress.v1')),'invalid');
  await failed.close();assert.deepEqual(errors,[]);
  console.log('PASS Map/Gacha top-right settings; no inline switch; full-width checked language rows; translated title; back to original tab; camera, history and grants unchanged; restore; small dark large-text; settings reachable on progress error');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
