const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
function loader(mocks={}){
 const cache={};
 function load(file){file=path.resolve(file);if(cache[file])return cache[file].exports;const m=cache[file]={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;new Function('require','exports','module',code)(id=>id in mocks?mocks[id]:load(path.resolve(path.dirname(file),id+'.ts')),m.exports,m);return m.exports;}
 return load;
}
const load=loader(),{badgeCounts,restoreBadge,syncBadge,BADGE_ID}=load('src/notifications/badges.ts');
const {emptyProgress,openForDate}=load('src/state/progress.ts');
const {keywords}=load('src/data/keywords.ts');
const today='2026-11-11',tomorrow='2026-11-12';
test('badge settings default to opt-out and reject damaged values',()=>{
 assert.deepEqual(restoreBadge(null),{version:1,enabled:false});
 assert.deepEqual(restoreBadge('{"version":1,"enabled":true}'),{version:1,enabled:true});
 for(const value of ['null','{}','broken','{"version":2,"enabled":true}','{"version":1,"enabled":1}'])assert.throws(()=>restoreBadge(value));
});
test('remaining count follows daily plus welcome grants, caps content, and never accumulates days',()=>{
 let progress=emptyProgress();
 assert.deepEqual(badgeCounts(progress,today),{current:10,next:10});
 progress=openForDate(progress,today,()=>0);
 assert.deepEqual(badgeCounts(progress,today),{current:9,next:10});
 for(let i=0;i<9;i++)progress=openForDate(progress,today,()=>0);
 assert.deepEqual(badgeCounts(progress,today),{current:0,next:1});
 for(const date of [tomorrow,'2026-12-01','2027-01-01'])assert.deepEqual(badgeCounts(progress,date),{current:1,next:1});
 assert.deepEqual(badgeCounts(emptyProgress(2),today),{current:3,next:3});
 progress={...emptyProgress(50),openings:keywords.map((word,i)=>({keywordId:word.id,date:today,openedAt:'2026-11-11T00:00:00Z',grant:i?'welcome':'daily'}))};
 assert.deepEqual(badgeCounts(progress,today),{current:0,next:0});
 progress.openings.pop();assert.deepEqual(badgeCounts(progress,today),{current:1,next:1});
 progress.openings.push({keywordId:'photography',date:today,openedAt:'2026-11-11T00:00:00Z',grant:'welcome'});
 assert.deepEqual(badgeCounts(progress,today),{current:1,next:1});
});
function port(status='granted'){
 const calls=[];return {calls,permission:async()=>({status,canAskAgain:false}),setCount:async count=>calls.push(['count',count]),rollover:async count=>calls.push(['rollover',count])};
}
test('sync updates saved progress, leaves failed-load progress alone, and clears opt-out/revocation independently',async()=>{
 const p=port();await syncBadge(p,true,null,today);assert.deepEqual(p.calls,[]);
 await syncBadge(p,true,emptyProgress(),today);assert.deepEqual(p.calls,[['rollover',10],['count',10]]);
 p.calls.length=0;await syncBadge(p,false,null,today);assert.deepEqual(p.calls,[['rollover',null],['count',0]]);
 const denied=port('denied');await syncBadge(denied,true,null,today);assert.deepEqual(denied.calls,[['rollover',null],['count',0]]);
 const exhausted={...emptyProgress(40),openings:keywords.map(word=>({keywordId:word.id,date:today,openedAt:today,grant:'welcome'}))};
 p.calls.length=0;await syncBadge(p,true,exhausted,today);assert.deepEqual(p.calls,[['rollover',null],['count',0]]);
});
test('a scheduling failure prevents publishing a partially synchronized count and permits retry',async()=>{
 const p=port();let fail=true;
 p.rollover=async count=>{if(fail)throw new Error('schedule');p.calls.push(['rollover',count]);};
 await assert.rejects(syncBadge(p,true,emptyProgress(),today));assert.deepEqual(p.calls,[]);
 fail=false;await syncBadge(p,true,emptyProgress(),today);assert.deepEqual(p.calls,[['rollover',10],['count',10]]);
});
function native(os='ios'){
 const pending=[{identifier:'knowgacha.daily.v1:2026-11-12',content:{data:{}}}];const calls=[];
 let allowed=true,succeed=true;
 const mocks={
  'react-native':{Platform:{OS:os}},
  './device':{normalizePermission:raw=>({status:raw.granted?'granted':'denied',canAskAgain:true}),requestPermission:async()=>{calls.push(['request']);allowed=true;}},
  'expo-notifications':{
   SchedulableTriggerInputTypes:{CALENDAR:'calendar'},
   getPermissionsAsync:async()=>({granted:true,ios:{allowsBadge:allowed}}),
   setBadgeCountAsync:async count=>{calls.push(['count',count]);return succeed;},
   getAllScheduledNotificationsAsync:async()=>pending,
   cancelScheduledNotificationAsync:async id=>{calls.push(['cancel',id]);const i=pending.findIndex(item=>item.identifier===id);if(i>=0)pending.splice(i,1);},
   scheduleNotificationAsync:async value=>{calls.push(['schedule',value]);pending.push(value);},
  },
 };
 return {device:loader(mocks)('src/notifications/badge-device.ts'),pending,calls,revoke:()=>allowed=false,failCount:()=>succeed=false};
}
test('iOS uses one silent midnight repeating request and preserves reminder reservations',async()=>{
 const m=native();await m.device.badges.rollover(10);
 const request=m.calls[0][1];assert.equal(request.identifier,BADGE_ID);
 assert.deepEqual(request.trigger,{type:'calendar',hour:0,minute:0,second:0,repeats:true});
 assert.equal(request.content.badge,10);assert.equal(request.content.sound,false);assert.equal(request.content.title,undefined);assert.equal(request.content.body,undefined);
 await m.device.badges.rollover(10);assert.equal(m.calls.length,1,'same reservation is idempotent');
 await m.device.badges.rollover(9);assert.deepEqual(m.calls[1],['cancel',BADGE_ID]);
 assert.equal(m.pending.filter(item=>item.identifier===BADGE_ID).length,1);
 await m.device.badges.rollover(null);assert.equal(m.pending.length,1);assert.equal(m.pending[0].identifier,'knowgacha.daily.v1:2026-11-12');
});
test('badge permission checks badge authorization, prompts only explicitly, and reports failed positive updates',async()=>{
 const m=native();assert.equal((await m.device.getPermission()).status,'granted');assert.deepEqual(m.calls,[]);
 m.revoke();assert.equal((await m.device.getPermission()).status,'denied');
 assert.equal((await m.device.requestBadgePermission()).status,'granted');assert.deepEqual(m.calls,[['request']]);
 m.failCount();await assert.rejects(m.device.badges.setCount(10));await m.device.badges.setCount(0);
 assert.equal(native('android').device.supported,false);
});
test('reminder opt-out and tap ownership do not consume badge reservations',async()=>{
 const {reconcileReminders,isOurNotice}=load('src/notifications/reminders.ts');
 const calls=[];
 await reconcileReminders({list:async()=>[{id:BADGE_ID,signature:'1:10'}],cancel:async id=>calls.push(id),schedule:async()=>{}},[],true);
 assert.deepEqual(calls,[]);assert.equal(isOurNotice(BADGE_ID),false);
});
