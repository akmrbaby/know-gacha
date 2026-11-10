// Runs the actual React provider and native adapter with modeled OS APIs.
// This exercises lifecycle/permission/storage logic, not notification delivery.
const {chromium}=require(process.env.MAP_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.resolve('.');
const mocks={
 'react-native':`module.exports={Platform:{OS:'ios'},AppState:{addEventListener:(_event,fn)=>{window.model.foreground=fn;return{remove(){}}}}};`,
 '@react-native-async-storage/async-storage':`module.exports={getItem:async key=>{if(window.model.failRead)throw Error('read');return localStorage.getItem(key);},setItem:async(key,value)=>{if(window.model.failWrite)throw Error('write');localStorage.setItem(key,value);}};`,
 'expo-notifications':`const m=window.model;module.exports={
  IosAuthorizationStatus:{NOT_DETERMINED:0,DENIED:1,AUTHORIZED:2,PROVISIONAL:3,EPHEMERAL:4},AndroidImportance:{DEFAULT:3},SchedulableTriggerInputTypes:{DATE:'date'},DEFAULT_ACTION_IDENTIFIER:'default',
  setNotificationHandler:fn=>m.handler=fn,getPermissionsAsync:async()=>m.permission,requestPermissionsAsync:async()=>{m.prompts++;return m.permission=m.answer;},
  setNotificationChannelAsync:async()=>{},getAllScheduledNotificationsAsync:async()=>[...m.pending.values()],cancelScheduledNotificationAsync:async id=>{m.pending.delete(id);},
  scheduleNotificationAsync:async n=>{if(m.failSchedule)throw Error('schedule');m.pending.set(n.identifier,n);m.scheduled++;return n.identifier;},
  getPresentedNotificationsAsync:async()=>[],dismissNotificationAsync:async()=>{},addNotificationResponseReceivedListener:()=>({remove(){}}),getLastNotificationResponse:()=>null,clearLastNotificationResponse:()=>{}
 };`,
};
const sourceMocks={
 [path.join(root,'src/i18n/I18nProvider.tsx')]:`exports.useI18n=()=>window.model.input.locale;`,
 [path.join(root,'src/state/ProgressProvider.tsx')]:`exports.useProgress=()=>window.model.input.progress;`,
};
const modules=[];const cache=new Map();
function bundle(file,source) {
 const key=file;if(cache.has(key))return cache.get(key);const id=modules.length;cache.set(key,id);modules.push('');
 let code=source??sourceMocks[file]??fs.readFileSync(file,'utf8');
 if(/\.tsx?$/.test(file))code=ts.transpileModule(code,{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 code=code.replace(/require\(['"]([^'"]+)['"]\)/g,(_match,name)=>{
  if(name in mocks)return `require(${bundle('mock:'+name,mocks[name])})`;
  let target;
  if(name.startsWith('.')){const base=path.resolve(path.dirname(file),name);target=['','.ts','.tsx','.js','.json'].map(ext=>base+ext).find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());}
  else target=require.resolve(name,{paths:[path.dirname(file)]});
  if(!target)throw Error('Cannot resolve '+name+' from '+file);
  return `require(${bundle(target)})`;
 });
 modules[id]=`function(require,module,exports){${code}\n}`;return id;
}
const entry=bundle(path.join(root,'tests/reminder-entry.tsx'),`
import React from 'react';import{createRoot}from'react-dom/client';
import{ReminderProvider,useReminders}from'../src/state/ReminderProvider';
function Probe(){const state=useReminders();React.useEffect(()=>{window.model.state=state;});return null;}
const root=createRoot(document.getElementById('root'));
let generation=0;window.model.render=()=>root.render(<ReminderProvider key={generation}><Probe/></ReminderProvider>);
window.model.reset=()=>{window.model.state=null;generation++;window.model.render();};window.model.render();
`);
const script=`window.process={env:{NODE_ENV:'development'}};const modules=[${modules.join(',')}],cache={};function require(id){if(cache[id])return cache[id].exports;const module=cache[id]={exports:{}};modules[id](require,module,module.exports);return module.exports;}require(${entry});`;
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('Harness page error:',e.message);});
  const url=(process.env.MAP_TEST_URL||'http://127.0.0.1:8113')+'/__reminder-model__';
  await page.route(url,route=>route.fulfill({status:200,contentType:'text/html',body:'<div id="root"></div>'}));
  await page.goto(url);
  await page.evaluate(()=>{
   localStorage.clear();
   window.model={pending:new Map(),prompts:0,scheduled:0,permission:{status:'undetermined',granted:false,ios:{status:0},canAskAgain:true},answer:{status:'denied',granted:false,ios:{status:1},canAskAgain:false},input:{locale:{locale:'ja',ready:true},progress:{ready:true,date:'2026-11-10',progress:{version:2,initialBonus:9,openings:[],dayOffset:0}}}};
  });
  await page.addScriptTag({content:script});await page.waitForFunction(()=>window.model.state?.ready);
  await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>window.model.prompts),0,'startup must not prompt');
  await page.evaluate(()=>window.model.state.configure({...window.model.state.settings,enabled:true}));
  assert.equal(await page.evaluate(()=>window.model.prompts),1);assert.equal(await page.evaluate(()=>window.model.state.settings.enabled),false);assert.equal(await page.evaluate(()=>window.model.pending.size),0,'refusal must never schedule');
  await page.evaluate(()=>{window.model.permission={status:'granted',granted:true,ios:{status:2},canAskAgain:true};window.model.foreground('active');});
  await page.waitForFunction(()=>window.model.state.permission.status==='granted');
  await page.evaluate(()=>window.model.state.configure({...window.model.state.settings,enabled:true}));
  await page.waitForFunction(()=>window.model.state.settings.enabled&&window.model.pending.size>=59);
  assert.equal(await page.evaluate(()=>window.model.prompts),1,'system permission restored without another prompt');
  const scheduled=await page.evaluate(()=>window.model.scheduled);await page.evaluate(()=>window.model.foreground('active'));await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>window.model.scheduled),scheduled,'foreground refresh is idempotent');
  await page.evaluate(()=>{window.model.input.locale={locale:'en',ready:true};window.model.render();});
  await page.waitForFunction(()=>[...window.model.pending.values()].every(n=>!/[\u3040-\u30ff\u3400-\u9fff]/.test(n.content.body)));
  await page.evaluate(()=>window.model.state.configure({...window.model.state.settings,hour:23,minute:59}));
  await page.waitForFunction(()=>[...window.model.pending.values()].every(n=>new Date(n.trigger.date).getHours()===23));
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('knowgacha.reminders.v1')).minute),59);
  await page.evaluate(()=>window.model.reset());await page.waitForFunction(()=>window.model.state?.ready);
  assert.deepEqual(await page.evaluate(()=>window.model.state.settings),{version:1,enabled:true,hour:23,minute:59});
  await page.evaluate(()=>{
   const now=new Date(),date=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
   window.model.today='knowgacha.daily.v1:'+date;
   const current=window.model.input.progress;
   window.model.input.progress={...current,progress:{...current.progress,openings:[{keywordId:'photonics-electronics',date,grant:'daily',openedAt:now.toISOString()}]}};window.model.render();
  });
  await page.waitForFunction(()=>!window.model.pending.has(window.model.today));
  assert.ok(await page.evaluate(()=>window.model.pending.size>=58));
  await page.evaluate(()=>window.model.state.test());assert.ok(await page.evaluate(()=>window.model.pending.has('knowgacha.reminder-test.v1')));
  await page.evaluate(()=>window.model.state.configure({...window.model.state.settings,enabled:false}));await page.waitForFunction(()=>window.model.pending.size===0);
  await page.evaluate(()=>{window.model.failWrite=true;});
  await page.evaluate(()=>window.model.state.configure({...window.model.state.settings,enabled:true}));
  assert.equal(await page.evaluate(()=>window.model.state.settings.enabled),false);assert.equal(await page.evaluate(()=>window.model.pending.size),0);assert.ok(await page.evaluate(()=>window.model.state.error));
  await page.evaluate(()=>{window.model.failWrite=false;window.model.failSchedule=true;});
  await page.evaluate(()=>window.model.state.configure({...window.model.state.settings,enabled:true}));assert.ok(await page.evaluate(()=>window.model.state.error));
  await page.evaluate(()=>{window.model.failSchedule=false;window.model.state.retry();});await page.waitForFunction(()=>window.model.pending.size>=58&&!window.model.state.error);
  await page.evaluate(()=>{window.model.permission={status:'denied',granted:false,ios:{status:1},canAskAgain:false};window.model.foreground('active');});await page.waitForFunction(()=>window.model.pending.size===0&&window.model.state.permission.status==='denied');
  assert.equal(await page.evaluate(()=>window.model.prompts),1);
  const stored=await page.evaluate(()=>localStorage.getItem('knowgacha.reminders.v1'));
  await page.evaluate(()=>{window.model.failRead=true;window.model.reset();});
  await page.waitForFunction(()=>window.model.state?.error);assert.equal(await page.evaluate(()=>window.model.state.ready),false);
  assert.equal(await page.evaluate(()=>localStorage.getItem('knowgacha.reminders.v1')),stored);
  await page.evaluate(()=>{window.model.failRead=false;window.model.state.retry();});await page.waitForFunction(()=>window.model.state.ready);
  assert.equal(await page.evaluate(()=>window.model.prompts),1);
  assert.equal(await page.evaluate(()=>localStorage.getItem('knowgacha.progress.v1')),null,'provider never writes progress');
  assert.deepEqual(errors,[]);
  console.log('PASS actual React provider/native-adapter model: opt-out startup; prompt only on opt-in; refusal; OS settings return; idempotence; language/time changes and restoration; opened-today cancellation; test/off; load/save/schedule failure and retry; permission revocation');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
