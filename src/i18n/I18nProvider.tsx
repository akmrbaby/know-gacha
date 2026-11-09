import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { resolveLocale, translate, type Locale } from './translate';
const KEY='knowgacha.locale.v1';
type I18n={locale:Locale;ready:boolean;error:string|null;setLocale:(locale:Locale)=>Promise<void>;t:(message:string)=>string};
const Context=createContext<I18n|null>(null);
export function I18nProvider({children}:{children:ReactNode}) {
  const [locale,updateLocale]=useState<Locale>(()=>{try{return resolveLocale(getLocales()[0]?.languageCode);}catch{return 'en';}});
  const [ready,setReady]=useState(false),[error,setError]=useState<string|null>(null);
  const writing=useRef(false);
  useEffect(()=>{let active=true;void AsyncStorage.getItem(KEY).then(value=>{if(active&&(value==='ja'||value==='en'))updateLocale(value);}).catch(()=>{if(active)setError('言語設定を読み込めませんでした。端末の言語で表示します。');}).finally(()=>{if(active)setReady(true);});return()=>{active=false;};},[]);
  const setLocale=useCallback(async(next:Locale)=>{
    if(writing.current)return;
    writing.current=true;
    try{await AsyncStorage.setItem(KEY,next);updateLocale(next);setError(null);}catch{setError('言語設定を保存できませんでした。もう一度お試しください。');}finally{writing.current=false;}
  },[]);
  const t=useCallback((message:string)=>translate(message,locale),[locale]);
  const value=useMemo(()=>({locale,ready,error,setLocale,t}),[locale,ready,error,setLocale,t]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useI18n(){const value=useContext(Context);if(!value)throw new Error('I18nProvider missing');return value;}
