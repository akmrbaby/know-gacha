// Web lifecycle checks; OS splash screens require the new native build.
const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const url=process.env.MAP_TEST_URL || 'http://localhost:8101';
  for(const reduced of ['no-preference','reduce']){
   const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:reduced});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{
    window.launchTiming={shown:null,hidden:null};
    const observer=new MutationObserver(()=>{const visible=!!document.querySelector('[data-testid="launch-intro"]');if(visible&&window.launchTiming.shown===null)window.launchTiming.shown=performance.now();if(!visible&&window.launchTiming.shown!==null&&window.launchTiming.hidden===null)window.launchTiming.hidden=performance.now();});
    observer.observe(document,{childList:true,subtree:true});
   });
   await page.goto(url);
   await page.getByRole('button',{name:'最初の知識をひらく',exact:true}).waitFor({timeout:120000});
   await page.getByTestId('launch-intro').waitFor({state:'detached'});
   const timing=await page.evaluate(()=>window.launchTiming);
   assert.notEqual(timing.shown,null);assert.notEqual(timing.hidden,null);
   const duration=timing.hidden-timing.shown;
   assert.ok(duration<2100,`launch must not block: ${duration}`);
   if(reduced==='no-preference')assert.ok(duration>=400,'normal launch reveals the nodes');
   else assert.ok(duration<500,'reduced motion skips the animation');
   await page.getByRole('tab',{name:'Gacha',exact:true}).click();await page.getByRole('button',{name:'今日の知識をひらく',exact:true}).waitFor();
   assert.equal(await page.getByTestId('launch-intro').count(),0,'tab changes do not replay');
   await page.screenshot({path:`/tmp/brand-home-${reduced}.png`});
   assert.deepEqual(errors,[]);console.log(reduced,Math.round(duration)+'ms');await page.close();
  }
  const broken=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'no-preference'});
  await broken.addInitScript(()=>{if(!localStorage.getItem('knowgacha.progress.v1'))localStorage.setItem('knowgacha.progress.v1','{');});
  await broken.goto(url);await broken.getByRole('button',{name:'読み込みを再試行',exact:true}).waitFor({timeout:120000});
  await broken.getByTestId('launch-intro').waitFor({state:'detached'});
  await broken.evaluate(()=>localStorage.removeItem('knowgacha.progress.v1'));
  await broken.getByRole('button',{name:'読み込みを再試行',exact:true}).click();await broken.getByRole('button',{name:'最初の知識をひらく',exact:true}).waitFor();
  assert.equal(await broken.getByTestId('launch-intro').count(),0,'retry does not replay launch');
  console.log('PASS first launch, reduced motion, no replay on tab change, read error and retry');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
