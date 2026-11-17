const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const policy=require('../../src/legal/policy.json');
const url=process.env.MAP_TEST_URL || 'http://127.0.0.1:8116';
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const [locale,code] of [['ja-JP','ja'],['en-US','en']]){
   const context=await browser.newContext({locale,viewport:{width:320,height:568},colorScheme:'dark',reducedMotion:'reduce'});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{window.externalCalls=[];window.open=(url)=>{window.externalCalls.push(url);if(window.failExternal)throw new Error('blocked');return null;};});
   const button=name=>page.getByRole('button',{name,exact:true});
   const records=()=>page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).filter(key=>key.startsWith('knowgacha.')&&!key.includes('locale')).map(key=>[key,localStorage.getItem(key)])));
   await page.goto(url);await button(code==='ja'?'最初の知識をひらく':'Open your first discovery').waitFor({timeout:120000});
   const before=await records();
   await button(code==='ja'?'設定を開く':'Open settings').click();
   const privacy=button(code==='ja'?'プライバシーポリシー':'Privacy Policy');await privacy.scrollIntoViewIfNeeded();await privacy.click();
   await page.getByTestId('privacy-policy').waitFor();
   await page.getByTestId('privacy-policy').getByRole('heading',{name:policy[code].sections[0].title,exact:true}).waitFor();
   await page.screenshot({path:`/workspace/scratch/privacy-${code}.png`});
   for(const section of policy[code].sections)assert.ok(await page.getByTestId('privacy-policy').getByText(section.title,{exact:true}).count());
   await button(code==='ja'?'ブラウザで公開版を開く':'Open the public policy in your browser').scrollIntoViewIfNeeded();
   assert.equal(await page.evaluate(()=>window.externalCalls.length),0,'reading the policy must not open external sites');
   await page.evaluate(()=>window.failExternal=true);
   await button(code==='ja'?'ブラウザで公開版を開く':'Open the public policy in your browser').click();
   await page.getByRole('alert').waitFor();
   const publicUrl=`https://github.com/akmrbaby/know-gacha/blob/develop/legal/privacy-${code}.md`;
   assert.equal((await page.evaluate(()=>window.externalCalls)).at(-1),publicUrl);
   assert.ok(await page.getByText(publicUrl,{exact:true}).count());
   await page.evaluate(()=>window.failExternal=false);await button(code==='ja'?'ブラウザで公開版を開く':'Open the public policy in your browser').click();assert.equal(await page.getByRole('alert').count(),0);
   await page.goBack();await page.getByTestId('support-settings').waitFor();
   await context.setOffline(true);await privacy.scrollIntoViewIfNeeded();await privacy.click();await page.getByTestId('privacy-policy').waitFor();
   await page.getByText(policy[code].sections.at(-1).paragraphs[0],{exact:true}).scrollIntoViewIfNeeded();
   await context.setOffline(false);await page.goBack();
   await button(code==='ja'?'お問い合わせ':'Contact').scrollIntoViewIfNeeded();await button(code==='ja'?'お問い合わせ':'Contact').click();
   const contact=page.getByTestId('contact-page');await contact.waitFor();
   assert.ok((await contact.innerText()).includes(code==='ja'?'公開されます':'public'));
   assert.equal(await contact.getByRole('textbox').count(),0);
   const count=await page.evaluate(()=>window.externalCalls.length);
   await button(code==='ja'?'GitHubで問い合わせる（公開）':'Contact on GitHub (public)').click();
   assert.equal(await page.evaluate(()=>window.externalCalls.length),count+1);
   assert.equal((await page.evaluate(()=>window.externalCalls)).at(-1),policy.links.support);
   await page.screenshot({path:`/workspace/scratch/contact-${code}.png`});
   assert.deepEqual(await records(),before);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.goBack();await button(code==='ja'?'Apple標準利用許諾契約':'Apple Standard EULA').scrollIntoViewIfNeeded();await button(code==='ja'?'Apple標準利用許諾契約':'Apple Standard EULA').click();
   assert.equal((await page.evaluate(()=>window.externalCalls)).at(-1),policy.links.appleEula);
   assert.deepEqual(errors,[]);await context.close();
  }
  console.log('PASS Japanese/English settings, full policy and cached offline reading, contact disclosure, explicit external URLs, browser failure/retry, Apple EULA, unchanged records and small dark layout');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
