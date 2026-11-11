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
const {planBadges}=load('src/notifications/badges.ts');
const now=new Date(2026,10,11,12);
const fresh=()=>emptyProgress(9,today);
test('badge settings default on while saved opt-out survives',()=>{
 assert.deepEqual(restoreBadge(null),{version:1,enabled:true});
 assert.deepEqual(restoreBadge('{"version":1,"enabled":false}'),{version:1,enabled:false});
 for(const value of ['null','{}','broken','{"version":2,"enabled":true}','{"version":1,"enabled":1}'])assert.throws(()=>restoreBadge(value));
});
test('badge counts include saved daily grants, increase while absent, and cap at remaining topics',()=>{
 let progress=fresh();assert.deepEqual(badgeCounts(progress,today),{current:10,next:11});
 progress=openForDate(progress,today,()=>0);assert.deepEqual(badgeCounts(progress,today),{current:9,next:10});
 for(let i=0;i<9;i++)progress=openForDate(progress,today,()=>0);
 assert.deepEqual(badgeCounts(progress,today),{current:0,next:1});
 assert.deepEqual(badgeCounts(progress,'2026-11-14'),{current:3,next:4});
 const plan=planBadges(progress,today,now);
 assert.deepEqual(plan.slice(0,3).map(item=>item.count),[1,2,3]);assert.equal(plan.length,20);assert.equal(plan.at(-1).count,20);
 assert.ok(plan.every(item=>new Date(item.at).getHours()===0));
 assert.deepEqual(badgeCounts(emptyProgress(2,today),today),{current:3,next:4});
 const exhausted={...emptyProgress(50,today),openings:keywords.map(word=>({keywordId:word.id,date:today,openedAt:today,grant:'welcome'}))};
 assert.deepEqual(badgeCounts(exhausted,today),{current:0,next:0});assert.deepEqual(planBadges(exhausted,today,now),[]);
 exhausted.openings.pop();assert.equal(badgeCounts(exhausted,today).current,1);
});
function port(status='granted'){
 const calls=[];return {calls,permission:async()=>({status,canAskAgain:false}),setCount:async count=>calls.push(['count',count]),rollover:async updates=>calls.push(['rollover',updates])};
}
test('sync leaves failed-load progress alone and clears opt-out/revocation without requiring progress',async()=>{
 const p=port();await syncBadge(p,true,null,today,now);assert.deepEqual(p.calls,[]);
 await syncBadge(p,true,fresh(),today,now);assert.equal(p.calls[0][1].length,20);assert.deepEqual(p.calls[1],['count',10]);
 p.calls.length=0;await syncBadge(p,false,null,today,now);assert.deepEqual(p.calls,[['rollover',[]],['count',0]]);
 const denied=port('denied');await syncBadge(denied,true,null,today,now);assert.deepEqual(denied.calls,[['rollover',[]],['count',0]]);
});
test('scheduling failure is retryable without publishing a partially synchronized badge',async()=>{
 const p=port();let fail=true;
 p.rollover=async updates=>{if(fail)throw new Error('schedule');p.calls.push(['rollover',updates]);};
 await assert.rejects(syncBadge(p,true,fresh(),today,now));assert.deepEqual(p.calls,[]);
 fail=false;await syncBadge(p,true,fresh(),today,now);assert.deepEqual(p.calls[1],['count',10]);
});
function native(os='ios'){
 const pending=[{identifier:'knowgacha.daily.v1:2026-11-12',content:{data:{}}}];const calls=[];
 let allowed=true,succeed=true;
 const mocks={
  'react-native':{Platform:{OS:os}},
  './device':{normalizePermission:raw=>({status:raw.granted?'granted':'denied',canAskAgain:true}),requestPermission:async()=>{calls.push(['request']);allowed=true;}},
  'expo-notifications':{
   SchedulableTriggerInputTypes:{DATE:'date'},
   getPermissionsAsync:async()=>({granted:true,ios:{allowsBadge:allowed}}),
   setBadgeCountAsync:async count=>{calls.push(['count',count]);return succeed;},
   getAllScheduledNotificationsAsync:async()=>pending,
   cancelScheduledNotificationAsync:async id=>{calls.push(['cancel',id]);const i=pending.findIndex(item=>item.identifier===id);if(i>=0)pending.splice(i,1);},
   scheduleNotificationAsync:async value=>{assert.ok(pending.length<64,'iOS reservation budget');calls.push(['schedule',value]);pending.push(value);},
  },
 };
 return {device:loader(mocks)('src/notifications/badge-device.ts'),pending,calls,revoke:()=>allowed=false,failCount:()=>succeed=false};
}
test('iOS migrates repeating badge to silent dated counts, caps reservations and preserves current reminders',async()=>{
 const m=native();m.pending.push({identifier:BADGE_ID,content:{data:{}}});
 const far=new Date();far.setDate(far.getDate()+45);const date=far.toISOString().slice(0,10);
 m.pending.push({identifier:`knowgacha.daily.v1:${date}`,content:{data:{}}});
 const plan=planBadges(fresh(),today,now);await m.device.badges.rollover(plan);
 assert.ok(m.calls.some(call=>call[0]==='cancel'&&call[1]===BADGE_ID));
 assert.ok(!m.pending.some(item=>item.identifier===`knowgacha.daily.v1:${date}`));
 const request=m.calls.find(call=>call[0]==='schedule')[1];
 assert.equal(request.trigger.type,'date');assert.equal(request.trigger.date.getTime(),plan[0].at);
 assert.equal(request.content.badge,11);assert.equal(request.content.sound,false);assert.equal(request.content.title,undefined);assert.equal(request.content.body,undefined);
 const before=m.calls.length;await m.device.badges.rollover(plan);assert.equal(m.calls.length,before);
 await m.device.badges.rollover([]);assert.equal(m.pending.length,1);assert.equal(m.pending[0].identifier,'knowgacha.daily.v1:2026-11-12');
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

test('old 60-day reminders plus repeating badge migrate without exceeding the 64-slot limit',async()=>{
 const m=native();m.pending.length=0;
 const {localDate}=load('src/state/progress.ts');
 for(let day=0;day<60;day++)m.pending.push({identifier:`knowgacha.daily.v1:${localDate(new Date(),day)}`,content:{data:{}}});
 m.pending.push({identifier:BADGE_ID,content:{data:{signature:'1:10'}}});
 await m.device.badges.rollover(planBadges(fresh(),today,now));
 assert.ok(m.pending.length<=61);assert.equal(m.pending.filter(item=>item.identifier.startsWith('knowgacha.daily.v1:')).length,30);
 assert.equal(m.pending.filter(item=>item.identifier.startsWith(`${BADGE_ID}:`)).length,20);
});
