import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { BADGE_ID, type BadgePort } from './badges';
import { normalizePermission, requestPermission } from './device';
import { HORIZON_DAYS, isReminder, type Permission } from './reminders';
import { localDate } from '../state/progress';
export const supported=Platform.OS==='ios';
export async function getPermission():Promise<Permission>{
  if(!supported)return {status:'unsupported',canAskAgain:false};
  const raw=await Notifications.getPermissionsAsync();
  const permission=normalizePermission(raw);
  return permission.status==='granted' && raw.ios?.allowsBadge!==true ? {...permission,status:'denied'} : permission;
}
export async function requestBadgePermission(){
  if(!supported)return getPermission();
  // Request the standard notification authorization, including badges. Reminder opt-in remains separate.
  await requestPermission();return getPermission();
}
export const badges:BadgePort={
  permission:getPermission,
  setCount:async count=>{
    const succeeded=await Notifications.setBadgeCountAsync(count);
    if(count>0 && !succeeded)throw new Error('Could not update badge');
  },
  rollover:async updates=>{
    const pending=[...await Notifications.getAllScheduledNotificationsAsync()];
    const end=new Date();end.setDate(end.getDate()+HORIZON_DAYS);
    const cutoff=localDate(end);
    // Older builds reserved 60 reminders. Trim their far-future tail before adding daily badge updates.
    for(const old of pending)if(isReminder(old.identifier) && old.identifier.slice(-10)>=cutoff)await Notifications.cancelScheduledNotificationAsync(old.identifier);
    const wanted=new Map(updates.map(update=>[update.id,update]));
    const owned=(id:string)=>id===BADGE_ID || id.startsWith(`${BADGE_ID}:`);
    for(const old of pending)if(owned(old.identifier) && (!wanted.has(old.identifier) || wanted.get(old.identifier)?.signature!==old.content.data?.signature))await Notifications.cancelScheduledNotificationAsync(old.identifier);
    for(const update of updates){
      if(pending.some(old=>old.identifier===update.id && old.content.data?.signature===update.signature))continue;
      await Notifications.scheduleNotificationAsync({identifier:update.id,
        content:{badge:update.count,sound:false,data:{kind:'badge-rollover',signature:update.signature}},
        trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:new Date(update.at),delivery:'bestEffort'},
      });
    }
  },
};
