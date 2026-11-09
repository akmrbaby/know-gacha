// Optional Chromium touch test. Native iPhone event ordering still needs verification.
const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  const page=await browser.newPage({locale:'ja-JP',viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto((process.env.MAP_TEST_URL || 'http://localhost:8087')+'/graph-demo');
  await page.getByText('デモ · 5件',{exact:true}).waitFor({timeout:120000});
  await page.waitForTimeout(1500);
  const canvas=page.getByTestId('atlas-canvas');
  const bounds=await canvas.boundingBox();
  const client=await page.context().newCDPSession(page);
  const snapshot=()=>canvas.getByRole('button').evaluateAll(nodes=>Object.fromEntries(nodes.map(node=>{const r=node.getBoundingClientRect();return [node.getAttribute('aria-label'),{x:r.x,y:r.y}];})));
  const start=await snapshot();
  const cy=bounds.y+bounds.height/2;
  const point=(id,x,y)=>({id,x,y,radiusX:5,radiusY:5,force:1});
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(1,130,cy-30),point(2,250,cy+30)]});
  for(let step=1;step<=8;step++) {
   await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point(1,130-step*3,cy-30-step),point(2,250+step*3,cy+30+step)]});
   await page.waitForTimeout(20);
  }
  await page.waitForTimeout(200);
  const pinched=await snapshot();
  const common=Object.keys(start).filter(id=>pinched[id]);
  assert.ok(common.some(id=>Math.hypot(start[id].x-pinched[id].x,start[id].y-pinched[id].y)>5),'pinch must actually move the camera');
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[point(1,106,cy-38)]});
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForTimeout(300);
  const ended=await snapshot();
  for(const id of common.filter(id=>ended[id])) assert.ok(Math.hypot(ended[id].x-pinched[id].x,ended[id].y-pinched[id].y)<1,'release must preserve the last two-finger camera');
  assert.deepEqual(errors,[]);
  console.log('PASS real Chromium two-finger zoom and release without camera jump (Web only)');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
