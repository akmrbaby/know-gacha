const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({locale:'ja-JP',viewport:{width:390,height:844},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const oldIds=['photonics-electronics','ethnography','surrealism','optical-fiber','ccd','photography','dada','collage','user-research','user-centered-design'];
  await page.addInitScript(ids=>{
   Math.random=()=>0;
   if(!localStorage.getItem('knowgacha.progress.v1')){
    const date=new Date();date.setDate(date.getDate()-1);const day=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
    localStorage.setItem('knowgacha.progress.v1',JSON.stringify({version:2,initialBonus:9,dayOffset:0,openings:ids.map((keywordId,i)=>({keywordId,date:day,openedAt:`${day}T12:00:${String(i).padStart(2,'0')}Z`,grant:i?'welcome':'daily'}))}));
   }
  },oldIds);
  const url=process.env.MAP_TEST_URL||'http://127.0.0.1:8108';
  const button=name=>page.getByRole('button',{name,exact:true});
  const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('knowgacha.progress.v1')));
  await page.goto(url+'/gacha');await page.getByText('残り1回',{exact:true}).waitFor({timeout:120000});
  const old=(await saved()).openings;
  await button('開封履歴 6 / 30語').waitFor();
  await page.goto(url+'/word/photography');await page.getByRole('heading',{name:'写真',exact:true}).first().waitFor();
  await page.goto(url+'/gacha');await button('検証メニュー').click();
  for(let i=0;i<24;i++){
   if(i)await button('翌日扱いにする').click();
   await button('今日の知識をひらく').click();await button('解説を読む').waitFor();
   await page.getByText(i===23?'すべての知識を開封しました。何度でも読み返せます。':'当日分は明日1回追加されます。',{exact:true}).waitFor();
   const state=await saved();assert.equal(state.openings.length,11+i);assert.deepEqual(state.openings.slice(0,10),old);
   assert.ok(!['optical-fiber','photography','collage','user-research'].includes(state.openings.at(-1).keywordId));
  }
  await button('開封履歴 30 / 30語').waitFor();
  const final=await saved();assert.equal(final.openings.length,34);assert.equal(new Set(final.openings.map(x=>x.keywordId)).size,34);
  await page.reload();await page.getByText('コンプリート',{exact:true}).waitFor();assert.deepEqual(await saved(),final);
  await button('English').click();await page.goto(url+'/word/affordance');
  await page.getByText('An affordance is a possibility for action arising in the relationship between an environment and an agent.',{exact:true}).waitFor();
  await page.getByText('Scope and limits',{exact:true}).waitFor();await page.getByRole('link',{name:/OECS: Affordances/}).waitFor();
  await page.screenshot({path:'/workspace/scratch/curated-affordance-en.png'});
  await page.goto(url+'/word/photography');await page.getByRole('heading',{name:'Photography',exact:true}).first().waitFor();
  await page.goto(url);await page.getByTestId('atlas-canvas').waitFor();await button('Open knowledge list').click();
  await page.getByRole('button',{name:/Rhizome.*Opened/s}).waitFor();
  assert.deepEqual(await saved(),final);assert.deepEqual(errors,[]);
  console.log('PASS old ten preserved; 24 additional daily draws; 30 current + 4 archived topics; no repeats or extra grants; restore, EN new/archived reading, sources and Map list');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
