const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({locale:'ja-JP',viewport:{width:390,height:844},reducedMotion:'no-preference'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   Math.random=()=>0.37;
   localStorage.setItem('knowgacha.progress.v1',JSON.stringify({version:2,initialBonus:9,dayOffset:0,openings:[{keywordId:'photonics-electronics',date:'2026-11-09',openedAt:'2026-11-09T12:00:00Z',grant:'daily'}]}));
  });
  await page.goto((process.env.MAP_TEST_URL||'http://127.0.0.1:8110')+'/?focus=photonics-electronics&fresh=drag');
  await page.getByTestId('map-preview').waitFor();
  await page.getByRole('button',{name:'選択を解除',exact:true}).click();
  await page.waitForTimeout(8500);
  const point=()=>page.getByRole('button',{name:'光電融合、開封済み教材',exact:true}).evaluate(node=>{
   const r=node.firstElementChild.firstElementChild.getBoundingClientRect();
   return{x:r.x+r.width/2,y:r.y+r.height/2};
  });
  const start=await point();
  await page.mouse.move(start.x,start.y);await page.mouse.down();
  await page.mouse.move(start.x+35,start.y+20,{steps:12});await page.waitForTimeout(180);
  const held=await point();await page.mouse.up();const released=await point();
  assert.ok(Math.hypot(held.x-start.x-35,held.y-start.y-20)<1,'drag starts from the moving visual position');
  assert.ok(Math.hypot(released.x-held.x,released.y-held.y)<0.6,'release does not add the old drift offset');
  assert.deepEqual(errors,[]);
  console.log('PASS dragging a moving node retains the visible grab position and has no release jump');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
