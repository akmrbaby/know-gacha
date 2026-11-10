const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE||'playwright'),assert=require('node:assert/strict');
const url=process.env.MAP_TEST_URL||'http://127.0.0.1:8115';
async function sample(page,prefix){
 await page.evaluate(prefix=>{
  window.capsuleFrames=[];
  let seen=false;const until=performance.now()+3000;
  const frame=()=>{
   const top=document.querySelector(prefix+' [data-testid="capsule-top"]'),bottom=document.querySelector(prefix+' [data-testid="capsule-bottom"]'),glow=document.querySelector(prefix+' [data-testid="capsule-glow"]');
   if(top&&bottom){seen=true;const t=getComputedStyle(top),b=getComputedStyle(bottom),p=getComputedStyle(top.parentElement);window.capsuleFrames.push({top:new DOMMatrix(t.transform).m42,bottom:new DOMMatrix(b.transform).m42,opacity:+t.opacity,glow:+getComputedStyle(glow).opacity,angle:new DOMMatrix(p.transform).m12});}
   if(top||(!seen&&performance.now()<until))requestAnimationFrame(frame);
  };requestAnimationFrame(frame);
 },prefix);
}
function verifyMotion(frames){assert.ok(frames.some(f=>f.top<-10&&f.bottom>4&&f.opacity>0.5),'both actual image halves visibly separate');assert.ok(frames.some(f=>f.glow>0.5),'light appears in the opening');assert.ok(frames.some(f=>Math.abs(f.angle)>0.03),'character really wobbles before opening');}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext({locale:'ja-JP',viewport:{width:390,height:844},reducedMotion:'no-preference',recordVideo:process.env.GACHA_VIDEO_DIR?{dir:process.env.GACHA_VIDEO_DIR,size:{width:390,height:844}}:undefined});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});const recordStart=Date.now();
  const button=name=>page.getByRole('button',{name,exact:true});
  const progress=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('knowgacha.progress.v1')));
  await page.goto(url+'/gacha');await page.getByTestId('launch-intro').waitFor({state:'detached'});await button('今日の知識をひらく').waitFor({timeout:120000});await page.waitForTimeout(800);
  const image=await page.getByTestId('capsule-body').locator('img').getAttribute('src');assert.ok(image.includes('gacha-mascot'),'idle displays the adopted character image');
  await page.screenshot({path:'/workspace/scratch/mascot-gacha-idle.png'});
  if(process.env.GACHA_VIDEO_DIR)await page.waitForTimeout(1000);
  const idleStage=await page.getByTestId('gacha-capsule').boundingBox();
  const videoOpening=(Date.now()-recordStart)/1000;
  await button('今日の知識をひらく').click();await sample(page,'[data-testid="gacha-main"]');
  const openingStage=await page.getByTestId('gacha-capsule').boundingBox();assert.ok(Math.abs(openingStage.y-idleStage.y)<1,'starting the opening preserves the character stage position');
  const saved=await progress();assert.equal(saved.openings.length,1,'draw is already saved while the animation runs');
  await button('解説を読む').waitFor();verifyMotion(await page.evaluate(()=>window.capsuleFrames));assert.deepEqual(await progress(),saved);
  await page.waitForTimeout(process.env.GACHA_VIDEO_DIR?1000:400);
  await button('次の知識をひらく（残り9回）').click();await button('演出をスキップ').click();await button('解説を読む').waitFor();assert.equal((await progress()).openings.length,2);
  await page.waitForTimeout(400);await button('次の知識をひらく（残り8回）').click();await button('演出をスキップ').waitFor();await page.getByRole('tab',{name:'Map',exact:true}).click();
  await page.getByTestId('atlas-canvas').waitFor();await page.getByRole('tab',{name:'Gacha',exact:true}).click();await button('解説を読む').waitFor();assert.equal((await progress()).openings.length,3);
  await page.getByRole('tab',{name:'Map',exact:true}).click();await sample(page,'[data-testid="map-reveal"]');await button('残り7回、ガチャをひらく').click();await page.getByTestId('map-reveal').waitFor();
  await page.getByTestId('map-preview').waitFor();verifyMotion(await page.evaluate(()=>window.capsuleFrames));assert.equal((await progress()).openings.length,4);
  await button('選択を解除').click();await button('残り6回、ガチャをひらく').click();await page.getByTestId('map-reveal').waitFor();await button('Mapで見る').click();await page.getByTestId('map-preview').waitFor();await page.waitForTimeout(1100);assert.equal((await progress()).openings.length,5);
  await page.getByRole('tab',{name:'Gacha',exact:true}).click();await button('解説を読む').waitFor();
  await page.getByTestId('gacha-main').locator('..').getByRole('button',{name:'設定を開く',exact:true}).click();await button('English').click();await page.getByRole('link',{name:/back/i}).click();
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(400);await button('Open another (5 left)').click();await button('Read more').waitFor();assert.equal((await progress()).openings.length,6);
  assert.deepEqual(errors,[]);await context.close();console.log('PASS adopted idle image; real wobble/curved split/light in Gacha and Map; saved before animation; skip; tab change; sheet dismissal; English reduced motion; no extra draws',JSON.stringify({videoOpening}));
  const small=await browser.newPage({locale:'en-US',viewport:{width:320,height:568},colorScheme:'dark',reducedMotion:'no-preference'});
  await small.goto(url+'/gacha');const open=small.getByRole('button',{name:'Open a discovery',exact:true});await open.waitFor({timeout:120000});await small.getByTestId('launch-intro').waitFor({state:'detached'});
  await open.scrollIntoViewIfNeeded();assert.ok(await small.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await small.screenshot({path:'/workspace/scratch/mascot-gacha-dark-small.png'});await open.click();await small.getByRole('button',{name:'Read more',exact:true}).waitFor();
  assert.equal(await small.evaluate(()=>JSON.parse(localStorage.getItem('knowgacha.progress.v1')).openings.length),1);await small.close();console.log('PASS small dark English layout scrolls and opens one saved topic');
  for(const failure of ['abort','stall']){
   const page=await browser.newPage({locale:'ja-JP',viewport:{width:390,height:844},reducedMotion:'no-preference'});let intercepted=0;
   await page.route(/gacha-mascot/,async route=>{intercepted++;if(failure==='stall')await new Promise(resolve=>setTimeout(resolve,2400));try{await route.abort();}catch{}});
   await page.goto(url);await page.getByRole('button',{name:'最初の知識をひらく',exact:true}).waitFor({timeout:120000});await page.getByTestId('launch-intro').waitFor({state:'detached'});
   const start=Date.now();await page.getByRole('button',{name:'最初の知識をひらく',exact:true}).click();await page.getByTestId('map-preview').waitFor();const elapsed=Date.now()-start;
   assert.ok(intercepted>0);assert.ok(elapsed<2100,'failed images never block the result');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('knowgacha.progress.v1')).openings.length),1);
   if(failure==='stall')assert.ok(elapsed>=650,'image deadline was exercised');await page.close();console.log('PASS mascot asset '+failure+' advances to the saved result in '+elapsed+'ms');
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
