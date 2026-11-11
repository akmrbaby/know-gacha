const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const [locale,text] of [['ja-JP','残り回数のバッジはiPhone・iPadのアプリで利用できます。'],['en-US','Remaining-draw badges are available in the iPhone and iPad app.']]){
   const page=await browser.newPage({locale,viewport:{width:320,height:568},colorScheme:'dark'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(process.env.MAP_TEST_URL || 'http://127.0.0.1:8116');
   await page.getByRole('button',{name:locale==='ja-JP'?'設定を開く':'Open settings',exact:true}).click();
   await page.getByTestId('badge-settings').getByText(text,{exact:true}).waitFor();
   await page.getByTestId('badge-settings').scrollIntoViewIfNeeded();
   assert.equal(await page.getByTestId('badge-settings').getByRole('switch').count(),0,'Web must not offer a nonfunctional badge switch');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('knowgacha.progress.v1')).openings.length),0,'opening settings must not create acquisitions');
   await page.screenshot({path:`/workspace/scratch/badge-settings-${locale}.png`});
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS Japanese/English badge settings, Web unsupported state, small dark screen and unchanged progress');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
