// Optional browser integration check; start Expo web first. This does not prove iOS rendering.
const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.MAP_TEST_URL || 'http://127.0.0.1:8082') + '/graph-demo');
  await page.getByText('デモ · 5件',{exact:true}).waitFor({timeout:120000});
  for (const count of [5,10]) {
   await page.getByRole('button',{name:`${count}件のデモ`,exact:true}).click();await page.waitForTimeout(600);
   const surfaces=await page.getByTestId('atlas-canvas').locator('svg').evaluateAll(nodes=>nodes.map(svg=>({
    width:svg.width.baseVal.value,height:svg.height.baseVal.value,
    viewport:svg.closest('[data-testid="atlas-canvas"]').getBoundingClientRect().toJSON(),
   })));
   assert.ok(surfaces.every(s=>s.width<=s.viewport.width+1 && s.height<=s.viewport.height+1),'SVG surfaces must fit the viewport');
  }
  await page.getByRole('button',{name:'一覧',exact:true}).click();
  await page.getByRole('button',{name:'エスノグラフィー 取得済み · 出典あり',exact:true}).click();
  await page.getByRole('button',{name:'詳細を閉じる',exact:true}).click();
  await page.waitForTimeout(500);
  const canvas=page.getByTestId('atlas-canvas'), node=canvas.getByRole('button',{name:'エスノグラフィー、開封済み教材',exact:true});
  const orb=node.locator(':scope > div').first().locator(':scope > div').first();
  async function aligned(){
   const c=await canvas.boundingBox(), b=await orb.boundingBox();
   const points=await canvas.locator('path').first().getAttribute('d');const p=points.match(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi).map(Number);
   assert.ok(Math.abs(p[0]-(b.x+b.width/2-c.x))<1,'edge source x matches node center');
   assert.ok(Math.abs(p[1]-(b.y+b.height/2-c.y))<1,'edge source y matches node center');
   return {x:b.x+b.width/2,y:b.y+b.height/2};
  }
  let point=await aligned();
  await page.mouse.move(point.x,point.y);await page.mouse.down();await page.mouse.move(point.x+20,point.y-20,{steps:10});await page.waitForTimeout(200);await aligned();await page.mouse.up();await page.waitForTimeout(300);await aligned();
  const c=await canvas.boundingBox();await page.mouse.move(c.x+8,c.y+8);await page.mouse.down();await page.mouse.move(c.x+40,c.y+40,{steps:10});await page.mouse.up();await page.waitForTimeout(200);await aligned();
  await page.getByRole('button',{name:'一覧',exact:true}).click();await page.getByRole('button',{name:'光電融合 取得済み · 出典あり',exact:true}).click();await page.waitForTimeout(500);
  let strokes=await canvas.locator('path').evaluateAll(nodes=>nodes.map(node=>({width:Number(node.getAttribute('stroke-width')),opacity:node.getAttribute('d') ? Number(node.getAttribute('stroke-opacity')) : 0})));
  assert.equal(strokes.filter(s=>s.opacity===1).length,1,'only the selected knowledge node’s three relations are highlighted');
  assert.ok(strokes.filter(s=>s.opacity===1).every(s=>s.width===2.2));
  await page.getByTestId('map-sheet').getByRole('button').nth(1).click();await page.waitForTimeout(200);
  strokes=await canvas.locator('path').evaluateAll(nodes=>nodes.map(node=>({width:Number(node.getAttribute('stroke-width')),opacity:node.getAttribute('d') ? Number(node.getAttribute('stroke-opacity')) : 0})));
  assert.equal(strokes.filter(s=>s.opacity===1 && s.width===2.8).length,1,'direct edge selection highlights one relation');
  await page.getByRole('button',{name:'詳細を閉じる',exact:true}).click();
  const opacity=await canvas.locator('path').evaluateAll(nodes=>nodes.map(node=>Number(node.getAttribute('stroke-opacity'))));
  assert.ok(opacity[0]>=0.38,'deselect restores normal opacity');
  assert.deepEqual(errors,[]);console.log('PASS bounded SVG surfaces, aligned edges during drag/pan/focus, node/edge selection and deselection (Web only)');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
