const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
function mount(pathname,ready=true){
 const effects=[],navigations=[];let onTap;
 const mocks={
  react:{useRef:value=>({current:value}),useEffect:fn=>effects.push(fn)},
  'expo-router':{useRootNavigationState:()=>ready?{key:'root'}:undefined,useRouter:()=>({navigate:path=>navigations.push(path)}),usePathname:()=>pathname},
  '../notifications/device':{observeTaps:callback=>{onTap=callback;return()=>{};}},
 };
 const module={exports:{}};
 const code=ts.transpileModule(fs.readFileSync('src/components/ReminderTapHandler.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 new Function('require','module','exports',code)(name=>mocks[name],module,module.exports);
 module.exports.ReminderTapHandler();effects.forEach(effect=>effect());
 return {tap:()=>onTap?.(),navigations,subscribed:()=>!!onTap};
}
test('notification taps lead to Map once navigation is ready',()=>{
 for(const path of ['/','/settings','/history','/gacha']){const app=mount(path);app.tap();assert.deepEqual(app.navigations,['/']);}
 const pending=mount('/',false);assert.equal(pending.subscribed(),false);
});
test('notification taps preserve an article already being read',()=>{
 const app=mount('/word/affordance');app.tap();assert.deepEqual(app.navigations,[]);
});
