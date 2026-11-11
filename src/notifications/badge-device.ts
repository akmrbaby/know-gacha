import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { BADGE_ID, type BadgePort } from './badges';
import { normalizePermission, requestPermission } from './device';
import type { Permission } from './reminders';
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
  rollover:async count=>{
    const pending=await Notifications.getAllScheduledNotificationsAsync();
    const existing=pending.find(item=>item.identifier===BADGE_ID);
    if(count!==null && existing?.content.data?.signature===`1:${count}`)return;
    if(existing)await Notifications.cancelScheduledNotificationAsync(BADGE_ID);
    if(count===null)return;
    await Notifications.scheduleNotificationAsync({identifier:BADGE_ID,
      content:{badge:count,sound:false,data:{kind:'badge-rollover',signature:`1:${count}`}},
      trigger:{type:Notifications.SchedulableTriggerInputTypes.CALENDAR,hour:0,minute:0,second:0,repeats:true},
    });
  },
};
