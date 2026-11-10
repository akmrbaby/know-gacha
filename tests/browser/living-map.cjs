const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const url=process.env.MAP_TEST_URL||'http://127.0.0.1:8110';
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext({locale:'ja-JP',viewport:{width:390,height:844},reducedMotion:'no-preference',recordVideo:process.env.LIVING_VIDEO_DIR?{dir:process.env.LIVING_VIDEO_DIR,size:{width:390,height:844}}:undefined});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{Math.random=()=>0.37;if(!localStorage.getItem('knowgacha.progress.v1'))localStorage.setItem('knowgacha.progress.v1',JSON.stringify({version:2,initialBonus:9,dayOffset:0,openings:[{keywordId:'photonics-electronics',date:'2026-11-09',openedAt:'2026-11-09T12:00:00Z',grant:'daily'}]}));});
  const button=name=>page.getByRole('button',{name,exact:true});
  const canvas=page.getByTestId('atlas-canvas');
  const snapshot=()=>canvas.getByRole('button').evaluateAll(nodes=>Object.fromEntries(nodes.map(n=>{const orb=n.firstElementChild.firstElementChild,r=orb.getBoundingClientRect();return[n.getAttribute('aria-label'),{x:r.x+r.width/2,y:r.y+r.height/2}];})));
  const difference=(a,b)=>Math.max(0,...Object.keys(a).filter(id=>b[id]).map(id=>Math.hypot(a[id].x-b[id].x,a[id].y-b[id].y)));
  const camera=()=>page.evaluate(()=>localStorage.getItem('knowgacha.map-viewport.v1'));
  await page.goto(url+'/?focus=photonics-electronics&fresh=living-test');await page.getByTestId('map-preview').waitFor({timeout:120000});
  await button('選択を解除').click();await button('地図を縮小').click();await page.waitForTimeout(8000);
  const progress=await page.evaluate(()=>localStorage.getItem('knowgacha.progress.v1')),savedCamera=await camera();
  const start=await snapshot();await page.waitForTimeout(4000);const moved=await snapshot();
  assert.ok(difference(start,moved)>0.25,'idle nodes really move');assert.ok(difference(start,moved)<30,'movement stays slow');
  assert.equal(await camera(),savedCamera,'ambient motion never changes the camera');
  const aligned=()=>canvas.evaluate(root=>{
   const bounds=root.getBoundingClientRect();
   const centers=Array.from(root.querySelectorAll('[role="button"]')).map(node=>{const r=node.firstElementChild.firstElementChild.getBoundingClientRect();return{x:r.x+r.width/2-bounds.x,y:r.y+r.height/2-bounds.y};});
   return Array.from(root.querySelectorAll('path')).flatMap(path=>Array.from((path.getAttribute('d')||'').matchAll(/M ([\d.e+-]+) ([\d.e+-]+) L ([\d.e+-]+) ([\d.e+-]+)/g)).flatMap(m=>[{x:+m[1],y:+m[2]},{x:+m[3],y:+m[4]}])).filter(point=>centers.some(c=>Math.hypot(c.x-point.x,c.y-point.y)<3)).length;
  });
  assert.ok(await aligned()>=2,'edge endpoints follow rendered node centers while moving');
  const main=moved['光電融合、開封済み教材'];await page.mouse.click(main.x,main.y);await page.getByTestId('map-preview').waitFor();
  await page.waitForTimeout(200);const held=await snapshot();await page.waitForTimeout(2200);const whileSelected=await snapshot();const id='光電融合、開封済み教材';assert.ok(Math.hypot(held[id].x-whileSelected[id].x,held[id].y-whileSelected[id].y)<0.1,'the selected node freezes in place');assert.ok(difference(held,whileSelected)>0.25,'neighbors remain alive while reading the preview');
  await button('選択を解除').click();await page.waitForTimeout(2300);
  const bounds=await canvas.boundingBox();await page.mouse.move(bounds.x+10,bounds.y+110);await page.mouse.down();await page.waitForTimeout(150);
  const touch=await snapshot();await page.waitForTimeout(1700);assert.ok(difference(touch,await snapshot())<0.1,'touching pauses all drift');
  await page.mouse.up();await page.waitForTimeout(250);assert.ok(difference(touch,await snapshot())<0.15,'release does not immediately restart motion');
  let resumed=false;for(let attempt=0;attempt<8;attempt++){await page.waitForTimeout(1200);if(difference(touch,await snapshot())>0.1){resumed=true;break;}}assert.ok(resumed,'drift resumes gently, allowing individual rest periods');
  await button('設定を開く').click();await page.getByRole('heading',{name:'設定',exact:true}).waitFor();
  // Navigators may resize/detach hidden views; frame-loop inactivity is tested separately.
  await page.waitForTimeout(1600);assert.ok(!await canvas.isVisible(),'the Map is hidden by settings');
  await page.getByRole('link',{name:/戻る|back/i}).click();await canvas.waitFor();
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(1200);const reduced=await snapshot();await page.waitForTimeout(1500);assert.ok(difference(reduced,await snapshot())<0.1,'OS reduced motion disables drift');
  assert.equal(await camera(),savedCamera);assert.equal(await page.evaluate(()=>localStorage.getItem('knowgacha.progress.v1')),progress);
  assert.equal(await canvas.locator('path').count(),3);assert.deepEqual(errors,[]);
  await page.screenshot({path:'/workspace/scratch/living-map-final.png'});
  await context.close();console.log('PASS slow idle motion; camera/progress unchanged; edge alignment; moving-node selection; selected node frozen and neighbors moving; touch pause and delayed restart; live reduced-motion preference; three SVG paths');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
