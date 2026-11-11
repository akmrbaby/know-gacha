import { keywords } from '../data/keywords';
import { allowance, type Progress } from '../state/progress';
import type { Permission } from './reminders';
export const BADGE_KEY = 'knowgacha.badge.v1';
export const BADGE_ID = 'knowgacha.badge-rollover.v1';
export type BadgeSettings = {version:1;enabled:boolean};
export const defaultBadge = ():BadgeSettings => ({version:1,enabled:false});
export function restoreBadge(raw:string|null):BadgeSettings {
  if(raw===null)return defaultBadge();
  const value=JSON.parse(raw);
  if(value?.version!==1 || typeof value.enabled!=='boolean')throw new Error('Invalid badge settings');
  return {version:1,enabled:value.enabled};
}
export function badgeCounts(progress:Progress,date:string){
  const acquired=new Set(progress.openings.map(item=>item.keywordId));
  const unread=keywords.filter(word=>!acquired.has(word.id)).length;
  const {total,bonus}=allowance(progress,date);
  return {current:Math.min(unread,total),next:Math.min(unread,bonus+1)};
}
export type BadgePort = {
  permission:()=>Promise<Permission>;
  setCount:(count:number)=>Promise<void>;
  rollover:(count:number|null)=>Promise<void>;
};
export async function syncBadge(port:BadgePort,enabled:boolean,progress:Progress|null,date:string){
  const permission=await port.permission();
  if(!enabled || permission.status!=='granted'){
    await port.rollover(null);await port.setCount(0);return permission;
  }
  // Never publish empty/default progress if the saved acquisition ledger failed to load.
  if(!progress)return permission;
  const counts=badgeCounts(progress,date);
  // Retire the old rollover first, so a failed reschedule never retains an older count.
  await port.rollover(counts.next || null);
  await port.setCount(counts.current);
  return permission;
}
