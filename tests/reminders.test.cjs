const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const {execFileSync}=require('node:child_process');
function loader(mocks={}) {
 const cache={};
 function load(file){file=path.resolve(file);if(cache[file])return cache[file].exports;const m=cache[file]={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;new Function('require','exports','module',code)(id=>id in mocks?mocks[id]:load(path.resolve(path.dirname(file),id+'.ts')),m.exports,m);return m.exports;}
 return load;
}
const load=loader();
const {defaultReminders,restoreReminders,planReminders,reconcileReminders,createReminderQueue,REMINDER_PREFIX,TEST_ID,HORIZON_DAYS,testNotice}=load('src/notifications/reminders.ts');
const {emptyProgress,localDate}=load('src/state/progress.ts');
const {keywords}=load('src/data/keywords.ts');
const settings={...defaultReminders(),enabled:true};
const now=new Date(2026,10,10,19,0,0);
const opening=(keywordId,date)=>({keywordId,date,openedAt:now.toISOString(),grant:'daily'});

test('reminders default to opt-out at 20:00 and validate without overwriting bad settings',()=>{
 assert.deepEqual(restoreReminders(null),{version:1,enabled:false,hour:20,minute:0});
 assert.deepEqual(restoreReminders(JSON.stringify({...settings,hour:7,minute:45})),{...settings,hour:7,minute:45});
 for(const raw of ['broken','null','{}',JSON.stringify({...settings,hour:24}),JSON.stringify({...settings,minute:-1}),JSON.stringify({...settings,minute:4.5}),JSON.stringify({...settings,enabled:1})])assert.throws(()=>restoreReminders(raw));
});
test('a bounded local-date plan skips the past and today after opening, without changing grants',()=>{
 const progress=emptyProgress(),before=JSON.stringify(progress);
 assert.equal(planReminders(defaultReminders(),progress,'ja',now).length,0);
 const plan=planReminders(settings,progress,'ja',now);
 assert.equal(plan.length,HORIZON_DAYS);assert.equal(new Set(plan.map(n=>n.id)).size,HORIZON_DAYS);
 assert.equal(plan[0].id,REMINDER_PREFIX+'2026-11-10');assert.equal(new Date(plan[0].at).getHours(),20);
 assert.ok(plan.every(n=>n.at>now.getTime()));
 const opened={...progress,openings:[opening(keywords[0].id,localDate(now))]};
 assert.deepEqual(planReminders(settings,opened,'ja',now).map(n=>n.id),plan.slice(1).map(n=>n.id));
 assert.equal(planReminders(settings,progress,'ja',new Date(2026,10,10,20,0,0))[0].id,REMINDER_PREFIX+'2026-11-11');
 assert.equal(JSON.stringify(progress),before);
 const devDate={...progress,dayOffset:100};assert.deepEqual(planReminders(settings,devDate,'ja',now),plan,'developer date offset never moves actual notification time');
});
test('all active topics discovered stops scheduling; archived topics do not exhaust active topics',()=>{
 const progress={...emptyProgress(),openings:keywords.map(word=>opening(word.id,'2026-11-09'))};
 assert.deepEqual(planReminders(settings,progress,'en',now),[]);
 progress.openings.pop();progress.openings.push(opening('photography','2026-11-08'));
 assert.ok(planReminders(settings,progress,'en',now).length>0);
});
test('time and language changes invalidate scheduled content, and test is exactly five seconds later',()=>{
 const a=planReminders(settings,emptyProgress(),'ja',now),b=planReminders({...settings,hour:9,minute:15},emptyProgress(),'en',now);
 const sameDate=b.find(n=>n.id===a[1].id);
 assert.notEqual(a[1].signature,sameDate.signature);assert.equal(new Date(sameDate.at).getHours(),9);assert.equal(new Date(sameDate.at).getMinutes(),15);
 assert.ok(!/[\u3040-\u30ff\u3400-\u9fff]/.test(sameDate.title+sameDate.body));
 assert.notEqual(planReminders(settings,emptyProgress(),'en',now)[0].signature,a[0].signature);
 assert.equal(testNotice('en',now).at,now.getTime()+5000);assert.equal(testNotice('ja',now).id,TEST_ID);
});
test('spring DST adjusts only the nonexistent time; following days return to the chosen local hour',()=>{
 const script=`const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');${loader.toString()};const load=loader();const r=load('src/notifications/reminders.ts');const {emptyProgress}=load('src/state/progress.ts');const settings={...r.defaultReminders(),enabled:true,hour:2,minute:30};const plan=r.planReminders(settings,emptyProgress(),'en',new Date(2026,2,7,0));process.stdout.write(JSON.stringify(plan.slice(0,3).map(n=>{const d=new Date(n.at);return[d.getDate(),d.getHours(),d.getMinutes()]})));`;
 const result=JSON.parse(execFileSync(process.execPath,['-e',script],{env:{...process.env,TZ:'America/New_York'},encoding:'utf8'}));
 assert.deepEqual(result,[[7,2,30],[8,3,30],[9,2,30]]);
});
test('travel keeps the local date identity but changes the absolute trigger and signature',()=>{
 const script=`const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');${loader.toString()};const load=loader();const r=load('src/notifications/reminders.ts');const {emptyProgress}=load('src/state/progress.ts');process.stdout.write(JSON.stringify(r.planReminders({...r.defaultReminders(),enabled:true},emptyProgress(),'en',new Date(2026,10,10,19))[0]));`;
 const inZone=zone=>JSON.parse(execFileSync(process.execPath,['-e',script],{env:{...process.env,TZ:zone},encoding:'utf8'}));
 const tokyo=inZone('Asia/Tokyo'),newYork=inZone('America/New_York');
 assert.equal(tokyo.id,newYork.id);assert.notEqual(tokyo.signature,newYork.signature);assert.equal(newYork.at-tokyo.at,14*60*60*1000);
});
function memoryPort(initial=[]) {
 const saved=new Map(initial.map(n=>[n.id,n])),calls=[];
 return {saved,calls,list:async()=>[...saved.values()],cancel:async id=>{calls.push(['cancel',id]);saved.delete(id);},schedule:async n=>{calls.push(['schedule',n.id]);saved.set(n.id,n);}};
}
test('reconciliation is idempotent, removes stale requests without signatures, and preserves unrelated notifications',async()=>{
 const plan=planReminders(settings,emptyProgress(),'ja',now);
 const other={id:'another-feature'},stale={id:REMINDER_PREFIX+'2020-01-01'};
 const port=memoryPort([other,stale]);await reconcileReminders(port,plan);
 assert.ok(!port.saved.has(stale.id));assert.ok(port.saved.has(other.id));assert.equal(port.saved.size,plan.length+1);
 port.calls.length=0;await reconcileReminders(port,plan);assert.deepEqual(port.calls,[]);
 await reconcileReminders(port,planReminders(settings,{...emptyProgress(),openings:[opening(keywords[0].id,localDate(now))]},'ja',now));
 assert.deepEqual(port.calls,[['cancel',plan[0].id]],'a successful draw only removes today');
 port.saved.set(TEST_ID,{id:TEST_ID});await reconcileReminders(port,[],true);
 assert.deepEqual([...port.saved.keys()],[other.id],'opting out also cancels a pending test');
});
test('a partially failed scheduling operation can be retried without duplicates',async()=>{
 const plan=planReminders(settings,emptyProgress(),'ja',now),port=memoryPort();let count=0;
 const schedule=port.schedule;port.schedule=async n=>{if(++count===3)throw new Error('OS failed');await schedule(n);};
 await assert.rejects(reconcileReminders(port,plan));assert.equal(port.saved.size,2);
 port.schedule=schedule;await reconcileReminders(port,plan);assert.equal(port.saved.size,plan.length);
});
test('queued jobs stay serial, read latest intent, and recover from failure',async()=>{
 const queue=createReminderQueue(),events=[];let release,enabled=true;
 const blocked=queue(async()=>{events.push('start');await new Promise(resolve=>release=resolve);events.push('end');});
 const updated=queue(async()=>events.push(enabled?'on':'off'));
 await Promise.resolve();assert.deepEqual(events,['start']);enabled=false;release();await Promise.all([blocked,updated]);
 assert.deepEqual(events,['start','end','off']);
 await assert.rejects(queue(async()=>{throw new Error('fail');}));assert.equal(await queue(async()=>42),42);
});

function nativeModel(os='ios') {
 let handler,listener,last=null,clears=0,removed=false;
 const calls=[],pending=[];
 const notifications={
  IosAuthorizationStatus:{NOT_DETERMINED:0,DENIED:1,AUTHORIZED:2,PROVISIONAL:3,EPHEMERAL:4},AndroidImportance:{DEFAULT:3},SchedulableTriggerInputTypes:{DATE:'date'},DEFAULT_ACTION_IDENTIFIER:'default',
  setNotificationHandler:value=>{handler=value;},getPermissionsAsync:async()=>({status:'granted',granted:true,canAskAgain:true}),requestPermissionsAsync:async value=>{calls.push(['request',value]);return{status:'granted',granted:true,canAskAgain:true};},
  setNotificationChannelAsync:async(...args)=>{calls.push(['channel',...args]);},getAllScheduledNotificationsAsync:async()=>pending,
  cancelScheduledNotificationAsync:async id=>{calls.push(['cancel',id]);},scheduleNotificationAsync:async value=>{calls.push(['schedule',value]);return value.identifier;},
  getPresentedNotificationsAsync:async()=>[{request:{identifier:REMINDER_PREFIX+'2026-11-09'}},{request:{identifier:'another-feature'}}],dismissNotificationAsync:async id=>{calls.push(['dismiss',id]);},
  addNotificationResponseReceivedListener:fn=>{listener=fn;return{remove:()=>removed=true};},getLastNotificationResponse:()=>last,clearLastNotificationResponse:()=>{last=null;clears++;},
 };
 const device=loader({'expo-notifications':notifications,'react-native':{Platform:{OS:os}}})('src/notifications/device.ts');
 return {device,calls,handler:()=>handler,notify:value=>listener(value),setLast:value=>last=value,clears:()=>clears,removed:()=>removed};
}
test('iOS-specific authorization takes priority, including provisional permission; reading never prompts',async()=>{
 const model=nativeModel(),normalize=model.device.normalizePermission;
 for(const status of [2,3,4])assert.equal(normalize({status:'denied',granted:false,ios:{status},canAskAgain:true}).status,'granted');
 assert.equal(normalize({status:'granted',granted:true,ios:{status:1},canAskAgain:false}).status,'denied');
 assert.equal(normalize({status:'undetermined',granted:false,ios:{status:0},canAskAgain:true}).status,'undetermined');
 await model.device.getPermission();assert.deepEqual(model.calls,[]);
 await model.device.requestPermission();assert.deepEqual(model.calls,[['request',{ios:{allowAlert:true,allowSound:true,allowBadge:false}}]]);
});
test('native adapter uses one-off best-effort dates, creates Android channel, and only dismisses own reminders',async()=>{
 const model=nativeModel('android'),notice=planReminders(settings,emptyProgress(),'en',now)[0];
 await model.device.prepareChannel('en');assert.equal(model.calls[0][0],'channel');
 await model.device.schedules.schedule(notice);const request=model.calls[1][1];
 assert.equal(request.identifier,notice.id);assert.equal(request.trigger.type,'date');assert.equal(request.trigger.delivery,'bestEffort');assert.equal(request.trigger.date.getTime(),notice.at);
 assert.equal(request.content.data.signature,notice.signature);assert.equal(request.content.data.kind,'daily-reminder');assert.equal(request.content.badge,undefined);
 await model.device.dismissReminders();assert.deepEqual(model.calls.at(-1),['dismiss',REMINDER_PREFIX+'2026-11-09']);
});
test('normal foreground reminders are silent and hidden, while the test shows a banner',async()=>{
 const model=nativeModel();
 const normal=await model.handler().handleNotification({request:{identifier:REMINDER_PREFIX+'2026-11-10',content:{data:{kind:'daily-reminder'}}}});
 assert.deepEqual(normal,{shouldShowBanner:false,shouldShowList:false,shouldPlaySound:false,shouldSetBadge:false});
 const test=await model.handler().handleNotification({request:{identifier:TEST_ID,content:{data:{kind:'reminder-test'}}}});
 assert.equal(test.shouldShowBanner,true);assert.equal(test.shouldSetBadge,false);
});
test('cold and warm notification taps open Gacha once, clear handled responses, ignore foreign actions, and unsubscribe',()=>{
 const model=nativeModel();let navigations=0;
 const response={actionIdentifier:'default',notification:{date:100,request:{identifier:REMINDER_PREFIX+'2026-11-10',content:{data:{kind:'daily-reminder',url:'https://example.com'}}}}};
 model.setLast(response);const stop=model.device.observeTaps(()=>navigations++);
 assert.equal(navigations,1);assert.equal(model.clears(),1);model.notify(response);assert.equal(navigations,1);
 model.notify({...response,actionIdentifier:'dismiss'});assert.equal(navigations,1);
 model.notify({...response,notification:{...response.notification,request:{...response.notification.request,identifier:'another-feature'}}});assert.equal(navigations,1);
 model.notify({...response,notification:{...response.notification,date:101}});assert.equal(navigations,2);
 stop();assert.ok(model.removed());
});
