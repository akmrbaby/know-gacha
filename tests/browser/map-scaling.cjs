// Optional Web regression. Does not establish device performance.
const {chromium} = require(process.env.MAP_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({headless:true});
 try {
  const page = await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const errors=[]; page.on('pageerror', error => errors.push(error.message));
  await page.goto((process.env.MAP_TEST_URL || 'http://127.0.0.1:8084') + '/graph-demo');
  await page.getByText('デモ · 5件',{exact:true}).waitFor({timeout:120000});
  const results=[];
  for (const count of [5,10,50,100,500]) {
   await page.getByRole('button',{name:`${count}件のデモ`,exact:true}).click();
   await page.waitForTimeout(2500);
   const canvas=page.getByTestId('atlas-canvas');
   const nodes=await canvas.getByRole('button').count();
   assert.ok(nodes>0 && nodes<=count+10);
   assert.equal(await canvas.locator('path').count(),3,'bounded batched edge paths');
   results.push({count,mountedNodes:nodes,paths:3});
   if (count===500) {
    await page.screenshot({path:'/tmp/map-500-overview.png'});
    const orb = await canvas.getByRole('button').first().locator(':scope > div').first().boundingBox();
    await page.mouse.click(orb.x + orb.width / 2, orb.y + orb.height / 2);
    await page.getByTestId('map-sheet').waitFor();
    await page.waitForTimeout(500);
    assert.ok(await canvas.getByRole('button').count()<100,'focused view culls distant nodes');
    await page.screenshot({path:'/tmp/map-500-focus.png'});
    await page.getByRole('button',{name:'詳細を閉じる',exact:true}).click();
   }
  }
  assert.deepEqual(errors,[]); console.log(JSON.stringify(results));
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
