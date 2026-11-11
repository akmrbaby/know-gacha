import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import * as device from '../notifications/badge-device';
import { BADGE_KEY, defaultBadge, restoreBadge, syncBadge } from '../notifications/badges';
import { createReminderQueue, type Permission } from '../notifications/reminders';
import { localDate } from './progress';
import { useProgress } from './ProgressProvider';
type State={enabled:boolean;ready:boolean;busy:boolean;permission:Permission;error:string|null;configure:(enabled:boolean)=>Promise<void>;retry:()=>void};
const Context=createContext<State|null>(null);
export function BadgeProvider({children}:{children:ReactNode}){
  const {progress,ready:progressReady,date}=useProgress();
  const [settings,setSettings]=useState(defaultBadge);
  const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null);
  const [permission,setPermission]=useState<Permission>({status:device.supported?'unknown':'unsupported',canAskAgain:false});
  const current=useRef({settings,ready,progress,progressReady});
  useLayoutEffect(()=>{current.current={settings,ready,progress,progressReady};},[settings,ready,progress,progressReady]);
  const queue=useRef(createReminderQueue()),locked=useRef(false);
  const load=useCallback(()=>{
    return AsyncStorage.getItem(BADGE_KEY).then(raw=>{setSettings(restoreBadge(raw));setReady(true);setError(null);}).catch(()=>setError('バッジ設定を読み込めませんでした。保存済みの設定は変更していません。'));
  },[]);
  useEffect(()=>{void load();},[load]);
  const synchronize=useCallback(async()=>{
    if(!device.supported || !current.current.ready)return;
    const state=current.current;
    const permission=await syncBadge(device.badges,state.settings.enabled,state.progressReady?state.progress:null,localDate(new Date(),__DEV__?state.progress.dayOffset:0));
    setPermission(permission);setError(null);
  },[]);
  const refresh=useCallback(()=>{void queue.current(synchronize).catch(()=>setError('バッジを更新できませんでした。もう一度お試しください。'));},[synchronize]);
  useEffect(()=>{refresh();},[settings,ready,progress,progressReady,date,refresh]);
  useEffect(()=>{const sub=AppState.addEventListener('change',value=>{if(value==='active')refresh();});return()=>sub.remove();},[refresh]);
  async function configure(enabled:boolean){
    if(!device.supported || !ready || locked.current)return;
    locked.current=true;setBusy(true);setError(null);
    try{
      await queue.current(async()=>{
        if(enabled){
          let allowed=await device.getPermission();
          if(allowed.status!=='granted')allowed=await device.requestBadgePermission();
          setPermission(allowed);
          if(allowed.status!=='granted'){setError('バッジが許可されていません。端末の通知設定からバッジをオンにできます。');return;}
        }
        const next={version:1 as const,enabled};
        await AsyncStorage.setItem(BADGE_KEY,JSON.stringify(next));
        current.current={...current.current,settings:next};setSettings(next);
        await synchronize();
      });
    }catch{setError('バッジ設定の保存または更新に失敗しました。もう一度お試しください。');}
    finally{locked.current=false;setBusy(false);}
  }
  return <Context.Provider value={{enabled:settings.enabled,ready,busy,error,permission,configure,retry:()=>{if(ready)refresh();else void load();}}}>{children}</Context.Provider>;
}
export function useBadges(){const value=useContext(Context);if(!value)throw new Error('BadgeProvider missing');return value;}
