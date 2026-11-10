const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({locale:'ja-JP',viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.notificationPrompts=0;if('Notification'in window)Notification.requestPermission=async()=>{window.notificationPrompts++;return'denied';};});
  await page.goto(process.env.MAP_TEST_URL||'http://127.0.0.1:8113');
  await page.getByRole('button',{name:'設定を開く',exact:true}).click({timeout:120000});
  await page.getByText('通知はインストールした端末アプリで利用できます。',{exact:true}).waitFor();
  assert.equal(await page.getByRole('switch').count(),0);assert.equal(await page.evaluate(()=>window.notificationPrompts),0);
  await page.screenshot({path:'/workspace/scratch/reminders-web-ja.png'});
  await page.getByRole('button',{name:'English',exact:true}).click();
  await page.getByText('Notifications are available in the installed mobile app.',{exact:true}).waitFor();
  await page.setViewportSize({width:320,height:568});await page.emulateMedia({colorScheme:'dark'});
  await page.addStyleTag({content:'[data-testid="reminder-settings"] [dir="auto"] {font-size:26px !important;line-height:38px !important;}'});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.getByText('Notifications are available in the installed mobile app.',{exact:true}).scrollIntoViewIfNeeded();
  await page.screenshot({path:'/workspace/scratch/reminders-web-en-dark.png'});
  assert.deepEqual(errors,[]);console.log('PASS web has no notification prompt or unsupported switch; Japanese/English; small dark large-text settings fit and scroll');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
