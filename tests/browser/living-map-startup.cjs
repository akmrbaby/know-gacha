const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({locale:'ja-JP',viewport:{width:390,height:844},reducedMotion:'no-preference'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   Math.random=()=>0.37;
   window.startupRaceInjected=false;
   Object.defineProperty(document,'visibilityState',{configurable:true,get(){
    // Model the first native AppState read resolving before subscription, with
    // no later change event. Other browser consumers still see a visible page.
    if(!window.startupRaceInjected&&new Error().stack.includes('get currentState')){
     window.startupRaceInjected=true;return 'hidden';
    }
    return 'visible';
   }});
   localStorage.setItem('knowgacha.progress.v1',JSON.stringify({version:2,initialBonus:9,dayOffset:0,openings:[{keywordId:'photonics-electronics',date:'2026-11-09',openedAt:'2026-11-09T12:00:00Z',grant:'daily'}]}));
  });
  const url=process.env.MAP_TEST_URL||'http://127.0.0.1:8111';
  await page.goto(url+'/?focus=photonics-electronics&fresh=startup-race');
  await page.getByTestId('map-preview').waitFor({timeout:120000});
  await page.getByRole('button',{name:'選択を解除',exact:true}).click();
  await page.waitForTimeout(8000);
  assert.equal(await page.evaluate(()=>startupRaceInjected),true,'startup race was exercised');
  const snapshot=()=>page.getByTestId('atlas-canvas').getByRole('button').evaluateAll(nodes=>Object.fromEntries(nodes.map(node=>{const r=node.getBoundingClientRect();return[node.getAttribute('aria-label'),{x:r.x,y:r.y}];})));
  const start=await snapshot();await page.waitForTimeout(3500);const end=await snapshot();
  const movement=Math.max(0,...Object.keys(start).filter(id=>end[id]).map(id=>Math.hypot(start[id].x-end[id].x,start[id].y-end[id].y)));
  if(process.env.EXPECT_STALE_FOREGROUND==='1')assert.ok(movement<0.05,'old hook remains incorrectly stopped');
  else assert.ok(movement>0.25,'the current foreground snapshot starts motion without another app-state event');
  assert.deepEqual(errors,[]);
  console.log(`${process.env.EXPECT_STALE_FOREGROUND==='1'?'REPRODUCED old startup freeze':'PASS startup race recovered'}; movement=${movement.toFixed(3)}px`);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
