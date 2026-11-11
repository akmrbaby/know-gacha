import { useEffect, useRef, useLayoutEffect } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import * as device from '../notifications/device';
import { useProgress } from '../state/ProgressProvider';
import { useBadges } from '../state/BadgeProvider';
import { useReminders } from '../state/ReminderProvider';
export function NotificationPermissionPrompt(){
  const {ready}=useProgress();
  const {ready:localeReady,locale}=useI18n();
  const reminders=useReminders(),badges=useBadges();
  const attempted=useRef(false);
  const current=useRef({reminders,badges});
  useLayoutEffect(()=>{current.current={reminders,badges};},[reminders,badges]);
  const mounted=useRef(false);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  useEffect(()=>{
    if(attempted.current || !device.supported || !ready || !localeReady || !reminders.ready || !badges.ready || (!reminders.settings.enabled&&!badges.enabled))return;
    attempted.current=true;
    void (async()=>{
      const permission=await device.getPermission();
      if(permission.status==='undetermined'&&permission.canAskAgain){
        await device.prepareChannel(locale);
        await device.requestPermission();
      }
      if(mounted.current){current.current.reminders.retry();current.current.badges.retry();}
    })().catch(()=>{if(mounted.current){current.current.reminders.retry();current.current.badges.retry();}});
  },[ready,localeReady,locale,reminders.ready,badges.ready,reminders.settings.enabled,badges.enabled]);
  return null;
}
