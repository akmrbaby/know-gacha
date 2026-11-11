const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript');
function harness(status='undetermined'){
 const refs=[],effects=[];let refIndex=0,effectIndex=0;
 let progressReady=false,enabled=true,supported=true,requests=0,retries=0;
 function effect(fn,deps){const i=effectIndex++,old=effects[i];if(!old||!deps||deps.some((value,j)=>value!==old.deps[j])){old?.cleanup?.();effects[i]={deps,cleanup:fn()};}}
 const reminder={ready:true,settings:{enabled:true},retry:()=>retries++},badge={ready:true,enabled:true,retry:()=>retries++};
 const device={get supported(){return supported;},getPermission:async()=>({status,canAskAgain:true}),prepareChannel:async()=>{},requestPermission:async()=>{requests++;}};
 const mocks={react:{useRef:value=>{const i=refIndex++;return refs[i]??(refs[i]={current:value});},useEffect:effect,useLayoutEffect:effect},'../i18n/I18nProvider':{useI18n:()=>({ready:true,locale:'ja'})},'../notifications/device':device,'../state/ProgressProvider':{useProgress:()=>({ready:progressReady})},'../state/ReminderProvider':{useReminders:()=>({...reminder,settings:{enabled}})},'../state/BadgeProvider':{useBadges:()=>({...badge,enabled})}};
 const m={exports:{}};new Function('require','exports','module',ts.transpileModule(fs.readFileSync('src/components/NotificationPermissionPrompt.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(key=>mocks[key],m.exports,m);
 return {render:()=>{refIndex=0;effectIndex=0;m.exports.NotificationPermissionPrompt();},ready:()=>progressReady=true,off:()=>enabled=false,web:()=>supported=false,requests:()=>requests,retries:()=>retries};
}
const settle=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
test('default-on requests OS permission once after saved progress and settings are ready',async()=>{
 const h=harness();h.render();await settle();assert.equal(h.requests(),0);
 h.ready();h.render();h.render();await settle();h.render();await settle();assert.equal(h.requests(),1);assert.equal(h.retries(),2);
});
test('saved opt-out, unsupported platforms and denied OS permissions never prompt automatically',async()=>{
 const off=harness();off.ready();off.off();off.render();await settle();assert.equal(off.requests(),0);
 const web=harness();web.ready();web.web();web.render();await settle();assert.equal(web.requests(),0);
 const denied=harness('denied');denied.ready();denied.render();await settle();assert.equal(denied.requests(),0);assert.equal(denied.retries(),2);
});
